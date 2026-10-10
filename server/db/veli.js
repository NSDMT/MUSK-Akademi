/**
 * Telefon numarasına göre mevcut veli hesabını bulur.
 * Numaralar son 10 haneden karşılaştırılır (0532..., 90532..., +90 532... aynı sayılır).
 * Birden fazla eşleşme varsa en eski hesap döner.
 */
function findVeliByPhone(db, phone) {
  const key = String(phone || '').replace(/\D/g, '').slice(-10);
  if (key.length < 10) return undefined;
  return db.prepare("SELECT id, email, phone FROM users WHERE role = 'veli' AND phone != '' ORDER BY id")
    .all()
    .find(u => u.phone.replace(/\D/g, '').slice(-10) === key);
}

module.exports = { findVeliByPhone };
