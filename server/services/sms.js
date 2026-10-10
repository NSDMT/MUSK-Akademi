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
const HEALTH_CHECK_MS = 10 * 60 * 1000; // bağlantı bu aralıkla yoklanır

// Chrome yolu: .env'de CHROME_PATH varsa o, yoksa eski sabit yol (varsa), yoksa puppeteer'ın kendi Chrome'u
const LEGACY_CHROME_PATH = '/root/.cache/puppeteer/chrome/linux-146.0.7680.31/chrome-linux64/chrome';
const CHROME_PATH = process.env.CHROME_PATH ||
  (fs.existsSync(LEGACY_CHROME_PATH) ? LEGACY_CHROME_PATH : undefined);

// QR yerine telefon numarasıyla eşleştirme kodu (uzaktan bağlamak için): WA_PAIR_PHONE=905XXXXXXXXX
const PAIR_PHONE = normalizePhone(process.env.WA_PAIR_PHONE || '');

// Türk numarası → 905XXXXXXXXX (05XX, 905XX, +90 5XX vb. kabul eder)
function normalizePhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';
  return digits.startsWith('90') ? digits : digits.startsWith('0') ? `9${digits}` : `90${digits}`;
}

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
      // Donmuş sayfada her çağrı varsayılan 180 sn beklemesin
      protocolTimeout: 60_000,
      executablePath: CHROME_PATH,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-extensions',
      ],
    },
    ...(PAIR_PHONE && { pairWithPhoneNumber: { phoneNumber: PAIR_PHONE, showNotification: true } }),
  });
  waClient = client;
  isReady = false;

  // Eski (yok edilmiş) client'tan gelen geç olayları yok say
  const isCurrent = () => client === waClient;

  // QR/kod geldiyse client çalışıyor, sadece eşleştirme bekliyor — watchdog gereksiz
  const stopWatchdog = () => { clearTimeout(readyWatchdog); readyWatchdog = null; };

  client.on('code', code => {
    if (!isCurrent()) return;
    stopWatchdog();
    console.log(`\n🔑 WhatsApp eşleştirme kodu (${PAIR_PHONE}): ${code.slice(0, 4)}-${code.slice(4)}`);
    console.log('(Telefonda: WhatsApp > Bağlı Cihazlar > Cihaz Bağla > "Bunun yerine telefon numarasıyla bağla")\n');
  });

  client.on('qr', qr => {
    if (!isCurrent()) return;
    stopWatchdog();
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
      try { await withTimeout(old.destroy(), 20_000); } catch (e) {
        console.warn('[WhatsApp] Eski client kapatılamadı, Chrome zorla sonlandırılıyor:', e.message);
        try { old.pupBrowser?.process()?.kill('SIGKILL'); } catch { /* zaten kapalı */ }
      }
    }
    restartTimer = null;
    initWhatsApp();
  }, delayMs);
}

// Tarayıcı/oturum öldüğünü gösteren hatalar — bunlarda client yeniden başlatılır
// (Runtime.callFunctionOn timed out / Zaman aşımı → WhatsApp Web sayfası donmuş demektir)
const FATAL_ERROR_RE = /Session closed|Target closed|detached Frame|Protocol error|Execution context was destroyed|browser has disconnected|timed out|Zaman aşımı/i;

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

// Sağlık kontrolü: "hazır" görünen ama donmuş/kopmuş oturumu mesaj gelmeden yakala
setInterval(async () => {
  const client = waClient;
  if (!isReady || !client) return;
  try {
    const state = await withTimeout(client.getState(), 30_000);
    if (state !== 'CONNECTED' && client === waClient) {
      restartWhatsApp(`sağlık kontrolü: durum ${state}`, 0);
    }
  } catch (err) {
    if (client === waClient) restartWhatsApp(`sağlık kontrolü: ${err.message}`, 0);
  }
}, HEALTH_CHECK_MS).unref();

/**
 * Veliye WhatsApp mesajı gönderir.
 * WhatsApp bağlantısı hazır değilse mesajı konsola yazar (mock mod).
 *
 * @param {string} phone  - Türk numarası: 05XX, 905XX, +90 5XX vb.
 * @param {string} message
 */
async function sendSms(phone, message) {
  // Numarayı normalize et → 905XXXXXXXXX@c.us
  const normalized = normalizePhone(phone);
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
