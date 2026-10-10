const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');
const fs = require('fs');

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

const READY_TIMEOUT_MS = 5 * 60 * 1000; // bu sürede ready olmazsa yeniden başlat
const SEND_TIMEOUT_MS = 30 * 1000;      // tek mesaj gönderimi en fazla bu kadar beklenir

// Chrome yolu: .env'de CHROME_PATH varsa o, yoksa eski sabit yol (varsa), yoksa puppeteer'ın kendi Chrome'u
const LEGACY_CHROME_PATH = '/root/.cache/puppeteer/chrome/linux-146.0.7680.31/chrome-linux64/chrome';
const CHROME_PATH = process.env.CHROME_PATH ||
  (fs.existsSync(LEGACY_CHROME_PATH) ? LEGACY_CHROME_PATH : undefined);

let waClient = null;
let isReady = false;
let readyWatchdog = null;
let restartTimer = null;

function initWhatsApp() {
  if (waClient || restartTimer) return;

  const client = new Client({
    authStrategy: new LocalAuth({
      dataPath: path.join(__dirname, '../../.wwebjs_auth'),
    }),
    puppeteer: {
      headless: true,
      executablePath: CHROME_PATH,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-extensions',
      ],
    },
  });
  waClient = client;
  isReady = false;

  // Eski (yok edilmiş) client'tan gelen geç olayları yok say
  const isCurrent = () => client === waClient;

  client.on('qr', qr => {
    if (!isCurrent()) return;
    console.log('\n📱 WhatsApp QR Kodu — Telefonunuzla tarayın:');
    qrcode.generate(qr, { small: true });
    console.log('(WhatsApp > Bağlı Cihazlar > Cihaz Bağla)\n');
  });

  client.on('ready', () => {
    if (!isCurrent()) return;
    console.log('✅ WhatsApp bağlantısı hazır — mesaj gönderilebilir');
    isReady = true;
    clearTimeout(readyWatchdog);
    readyWatchdog = null;
  });

  client.on('auth_failure', msg => {
    if (!isCurrent()) return;
    console.error('[WhatsApp] Oturum hatası:', msg, '— yeniden başlatılacak (QR gerekebilir)');
    restartWhatsApp('auth_failure', 30_000);
  });

  client.on('disconnected', reason => {
    if (!isCurrent()) return;
    console.warn('[WhatsApp] Bağlantı kesildi:', reason, '— 15 sn sonra yeniden denenecek');
    restartWhatsApp('disconnected', 15_000);
  });

  client.initialize().catch(err => {
    if (!isCurrent()) return;
    console.error('[WhatsApp] Başlatma hatası:', err.message);
    restartWhatsApp('initialize hatası', 60_000);
  });

  // Belirli süre içinde ready olmazsa yeniden başlat
  clearTimeout(readyWatchdog);
  readyWatchdog = setTimeout(() => {
    readyWatchdog = null;
    if (isCurrent() && !isReady) {
      console.warn('[WhatsApp] 5 dk içinde bağlantı kurulamadı, yeniden başlatılıyor...');
      restartWhatsApp('ready zaman aşımı', 0);
    }
  }, READY_TIMEOUT_MS);
}

/**
 * Mevcut client'ı tamamen kapatır (Chrome profil kilidi kalmasın diye),
 * ardından belirtilen süre sonra yenisini başlatır. Aynı anda tek restart çalışır.
 */
function restartWhatsApp(reason, delayMs) {
  if (restartTimer) return;
  console.warn(`[WhatsApp] Yeniden başlatma planlandı (${reason})`);

  const old = waClient;
  waClient = null;
  isReady = false;
  clearTimeout(readyWatchdog);
  readyWatchdog = null;

  restartTimer = setTimeout(async () => {
    if (old) {
      try { await old.destroy(); } catch (e) {
        console.warn('[WhatsApp] Eski client kapatılamadı:', e.message);
      }
    }
    restartTimer = null;
    initWhatsApp();
  }, delayMs);
}

// Tarayıcı/oturum öldüğünü gösteren hatalar — bunlarda client yeniden başlatılır
const FATAL_ERROR_RE = /Session closed|Target closed|detached Frame|Protocol error|Execution context was destroyed|browser has disconnected/i;

function withTimeout(promise, ms) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`Zaman aşımı (${ms / 1000} sn)`)), ms);
    }),
  ]).finally(() => clearTimeout(timer));
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
  const digits = String(phone || '').replace(/\D/g, '');
  const normalized = digits.startsWith('90') ? digits : digits.startsWith('0') ? `9${digits}` : `90${digits}`;
  const chatId = `${normalized}@c.us`;

  const client = waClient;
  if (!isReady || !client) {
    console.log(`[WhatsApp-MOCK] Bağlantı hazır değil — mesaj loglanıyor`);
    console.log(`[WhatsApp-MOCK] Alıcı : ${chatId}`);
    console.log(`[WhatsApp-MOCK] Mesaj : ${message}`);
    return { success: false, error: 'WhatsApp bağlantısı henüz hazır değil', mock: true };
  }

  try {
    // getNumberId ile numarayı doğrula ve gerçek chat ID'yi al (No LID for user hatasını önler)
    const numberId = await withTimeout(client.getNumberId(normalized), SEND_TIMEOUT_MS);
    const sendTarget = numberId?._serialized || chatId;
    if (!numberId) {
      console.warn(`[WhatsApp] getNumberId çözülemedi, doğrudan chatId denenecek → ${chatId}`);
    }

    await withTimeout(client.sendMessage(sendTarget, message), SEND_TIMEOUT_MS);
    console.log(`[WhatsApp] ✓ Mesaj gönderildi → ${sendTarget}`);
    return numberId ? { success: true } : { success: true, fallback: true };
  } catch (error) {
    console.error(`[WhatsApp-ERROR] ${chatId}:`, error.message);
    if (FATAL_ERROR_RE.test(error.message) && client === waClient) {
      restartWhatsApp(`gönderim hatası: ${error.message}`, 5_000);
    }
    return { success: false, error: error.message };
  }
}

module.exports = { sendSms };
