const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');

/**
 * WhatsApp mesaj gönderim servisi - whatsapp-web.js (ücretsiz)
 *
 * İlk çalıştırmada terminalde QR kodu görünür → telefonunuzdaki
 * WhatsApp > Bağlı Cihazlar > Cihaz Bağla ile tarayın.
 * Oturum .wwebjs_auth/ klasöründe saklanır, bir daha QR gerekmez.
 *
 * Sunucu kapatılırsa WhatsApp bağlantısı da kapanır; yeniden başlatınca
 * kayıtlı oturumla otomatik bağlanır.
 */

let waClient = null;
let isReady = false;
let initStarted = false;

function initWhatsApp() {
  if (initStarted) return;
  initStarted = true;

  waClient = new Client({
    authStrategy: new LocalAuth({
      dataPath: path.join(__dirname, '../../.wwebjs_auth'),
    }),
    puppeteer: {
      headless: true,
      executablePath: '/root/.cache/puppeteer/chrome/linux-146.0.7680.31/chrome-linux64/chrome',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-extensions',
      ],
    },
  });

  waClient.on('qr', qr => {
    console.log('\n📱 WhatsApp QR Kodu — Telefonunuzla tarayın:');
    qrcode.generate(qr, { small: true });
    console.log('(WhatsApp > Bağlı Cihazlar > Cihaz Bağla)\n');
  });

  waClient.on('ready', () => {
    console.log('✅ WhatsApp bağlantısı hazır — mesaj gönderilebilir');
    isReady = true;
  });

  waClient.on('auth_failure', msg => {
    console.error('[WhatsApp] Oturum hatası:', msg);
    isReady = false;
    initStarted = false;
  });

  waClient.on('disconnected', reason => {
    console.warn('[WhatsApp] Bağlantı kesildi:', reason, '— 15 sn sonra yeniden denenecek');
    isReady = false;
    initStarted = false;
    setTimeout(initWhatsApp, 15_000);
  });

  waClient.initialize().catch(err => {
    console.error('[WhatsApp] Başlatma hatası:', err.message);
    initStarted = false;
    // Puppeteer eksikse veya hata varsa mock modda devam et
  });

  // Eğer 5 dakika içinde ready olmazsa yeniden başlat
  setTimeout(() => {
    if (!isReady) {
      console.warn('[WhatsApp] 5 dk içinde bağlantı kurulamadı, yeniden başlatılıyor...');
      initStarted = false;
      try { waClient.destroy().catch(() => { }); } catch { }
      initWhatsApp();
    }
  }, 5 * 60 * 1000);
}

// Uygulama başlarken WhatsApp'ı başlat
initWhatsApp();

/**
 * Veliye WhatsApp mesajı gönderir.
 * WhatsApp bağlantısı hazır değilse mesajı konsola yazar (mock mod).
 *
 * @param {string} phone  - Türk numarası: 05XX, 905XX, +90 5XX vb.
 * @param {string} message
 */
async function sendSms(phone, message) {
  // Numarayı normalize et → 905XXXXXXXXX@c.us
  const digits = phone.replace(/\D/g, '');
  const normalized = digits.startsWith('90') ? digits : digits.startsWith('0') ? `9${digits}` : `90${digits}`;
  const chatId = `${normalized}@c.us`;

  if (!isReady || !waClient) {
    console.log(`[WhatsApp-MOCK] Bağlantı hazır değil — mesaj loglanıyor`);
    console.log(`[WhatsApp-MOCK] Alıcı : ${chatId}`);
    console.log(`[WhatsApp-MOCK] Mesaj : ${message}`);
    return { success: false, error: 'WhatsApp bağlantısı henüz hazır değil', mock: true };
  }

  try {
    // getNumberId ile numarayı doğrula ve gerçek chat ID'yi al (No LID for user hatasını önler)
    const numberId = await waClient.getNumberId(normalized);
    const sendTarget = numberId?._serialized || chatId;

    if (!numberId) {
      console.warn(`[WhatsApp] getNumberId çözülemedi, doğrudan chatId denenecek → ${chatId}`);
      await waClient.sendMessage(chatId, message);
      console.log(`[WhatsApp] ✓ Mesaj gönderildi → ${chatId}`);
      return { success: true, fallback: true };
    }

    await waClient.sendMessage(sendTarget, message);
    console.log(`[WhatsApp] ✓ Mesaj gönderildi → ${sendTarget}`);
    return { success: true };
  } catch (error) {
    console.error('[WhatsApp-ERROR]', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = { sendSms };
