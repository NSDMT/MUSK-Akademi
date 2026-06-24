import { useState } from 'react';
import './Contact.css';

const initialForm = { name: '', phone: '', email: '', subject: '', message: '' };

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = 'Ad soyad gereklidir.';
    if (!/^\d{10,11}$/.test(form.phone.replace(/\s/g, '')))
      e.phone = 'Geçerli bir telefon numarası girin.';
    if (!form.message.trim()) e.message = 'Mesaj gereklidir.';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length > 0) { setErrors(e2); return; }
    setSubmitted(true);
  };

  return (
    <div className="page-wrapper">
      <div className="page-hero">
        <h1>İletişim</h1>
        <p>Bizimle iletişime geçin, en kısa sürede dönelim</p>
      </div>

      <section className="section">
        <div className="container contact-layout">

          {/* Info Cards */}
          <div className="contact-info">
            <div className="card contact-info__card">
              <span className="contact-info__icon">📍</span>
              <div>
                <h4>Adres</h4>
                <p>Karaman Merkez, Karaman</p>
                {/* FOTOĞRAF: harita veya tesis görseli için update edebilirsiniz */}
              </div>
            </div>
            <div className="card contact-info__card">
              <span className="contact-info__icon">📞</span>
              <div>
                <h4>Telefon</h4>
                <a href="tel:+905000000000">+90 (000) 000 00 00</a>
              </div>
            </div>
            <div className="card contact-info__card">
              <span className="contact-info__icon">✉️</span>
              <div>
                <h4>E-posta</h4>
                <a href="mailto:info@muzafferugursk.com">info@muzafferugursk.com</a>
              </div>
            </div>
            <div className="card contact-info__card">
              <span className="contact-info__icon">🕐</span>
              <div>
                <h4>Çalışma Saatleri</h4>
                <p>Hft. İçi: 15:00 – 20:00</p>
                <p>Cumartesi: 09:00 – 18:00</p>
                <p>Pazar: 10:00 – 16:00</p>
              </div>
            </div>

            {/* Social */}
            <div className="card contact-social">
              <h4>Sosyal Medya</h4>
              <div className="contact-social__links">
                <a href="https://www.instagram.com/karamanmusksporakademi?igsh=MXNqazQyd2Rqd2pkMw%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer">
                  📸 Instagram
                </a>
                <a href="https://wa.me/90XXXXXXXXXX" target="_blank" rel="noopener noreferrer">
                  💬 WhatsApp
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                  👍 Facebook
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
                  ▶️ YouTube
                </a>
              </div>
            </div>
          </div>

          {/* Form */}
          <div>
            {submitted ? (
              <div className="contact-success card">
                <span>✅</span>
                <h3>Mesajınız İletildi!</h3>
                <p>En kısa sürede sizinle iletişime geçeceğiz.</p>
                <button className="btn-primary" onClick={() => { setForm(initialForm); setSubmitted(false); }}>
                  Yeni Mesaj
                </button>
              </div>
            ) : (
              <form className="contact-form card" onSubmit={handleSubmit} noValidate>
                <h2>Mesaj Gönderin</h2>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="c-name">Ad Soyad *</label>
                    <input
                      id="c-name" name="name" type="text"
                      value={form.name} onChange={handleChange}
                      placeholder="Adınız soyadınız"
                      className={errors.name ? 'error' : ''}
                    />
                    {errors.name && <span className="form-error">{errors.name}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="c-phone">Telefon *</label>
                    <input
                      id="c-phone" name="phone" type="tel"
                      value={form.phone} onChange={handleChange}
                      placeholder="05XX XXX XX XX"
                      className={errors.phone ? 'error' : ''}
                    />
                    {errors.phone && <span className="form-error">{errors.phone}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="c-email">E-posta (isteğe bağlı)</label>
                  <input
                    id="c-email" name="email" type="email"
                    value={form.email} onChange={handleChange}
                    placeholder="ornek@mail.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="c-subject">Konu</label>
                  <input
                    id="c-subject" name="subject" type="text"
                    value={form.subject} onChange={handleChange}
                    placeholder="Mesajınızın konusu"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="c-message">Mesaj *</label>
                  <textarea
                    id="c-message" name="message" rows={6}
                    value={form.message} onChange={handleChange}
                    placeholder="Mesajınızı yazın..."
                    className={errors.message ? 'error' : ''}
                  />
                  {errors.message && <span className="form-error">{errors.message}</span>}
                </div>

                <button type="submit" className="btn-primary contact-submit">
                  Mesajı Gönder
                </button>
              </form>
            )}

            {/* Map placeholder */}
            <div className="contact-map">
              {/* FOTOĞRAF / API: Google Maps embed veya harita görseli buraya eklenecek */}
              <div className="contact-map__placeholder">
                <span>🗺️</span>
                <p>Harita Alanı</p>
                <small>Google Maps embed buraya eklenecek</small>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
