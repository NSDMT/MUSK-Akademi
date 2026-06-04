const axios = require('axios');

/**
 * SMS gönderim servisi - Netgsm HTTP API
 * Ortam değişkenleri tanımlı değilse geliştirme modunda konsola log basar.
 * 
 * Netgsm hesabı için: https://www.netgsm.com.tr
 * .env dosyasına NETGSM_USERCODE, NETGSM_PASSWORD, NETGSM_HEADER ekleyin.
 */
async function sendSms(phone, message) {
  const usercode = process.env.NETGSM_USERCODE;
  const password = process.env.NETGSM_PASSWORD;
  const header = process.env.NETGSM_HEADER || 'MUZAFFERUGUR';

  if (!usercode || !password) {
    console.log(`[SMS-MOCK] Alıcı: ${phone}`);
    console.log(`[SMS-MOCK] Mesaj: ${message}`);
    return { success: true, mock: true };
  }

  try {
    // Türk telefon numarasını normalize et → 905XXXXXXXXX
    const normalized = phone.replace(/\D/g, '').replace(/^0/, '90').replace(/^(?!90)/, '90');

    const params = new URLSearchParams({
      usercode,
      password,
      gsmno: normalized,
      message,
      msgheader: header,
      encoding: 'TR',
    });

    const response = await axios.get(
      `https://api.netgsm.com.tr/sms/send/get?${params.toString()}`,
      { timeout: 10000 }
    );

    // Netgsm başarılı yanıtı: "00 XXXX" (00 = başarılı)
    const data = response.data?.toString() || '';
    if (data.startsWith('00') || data.startsWith('01') || data.startsWith('02')) {
      return { success: true, data };
    }
    return { success: false, error: `Netgsm yanıtı: ${data}` };
  } catch (error) {
    console.error('[SMS-ERROR]', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = { sendSms };
