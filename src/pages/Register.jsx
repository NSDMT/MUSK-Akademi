import { useState } from 'react';
import './Register.css';

const branches = ['Futbol','Voleybol','Basketbol','Tekerlekli Paten','Yüzme','Tenis','Satranç'];

const initialForm = {
  parentName: '',
  parentPhone: '',
  parentEmail: '',
  childName: '',
  childBirthYear: '',
  branch: '',
  message: '',
  consent: false,
};

export default function Register() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.parentName.trim())  e.parentName  = 'Veli adı gereklidir.';
    if (!/^\d{10,11}$/.test(form.parentPhone.replace(/\s/g, '')))
      e.parentPhone = 'Geçerli bir telefon numarası girin.';
    if (form.parentEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.parentEmail))
      e.parentEmail = 'Geçerli bir e-posta adresi girin.';
    if (!form.childName.trim())   e.childName   = 'Sporcu adı gereklidir.';
    if (!form.childBirthYear || form.childBirthYear < 2005 || form.childBirthYear > 2023)
      e.childBirthYear = 'Geçerli bir doğum yılı girin (2005-2023).';
    if (!form.branch)             e.branch      = 'Lütfen bir branş seçin.';
    if (!form.consent)            e.consent     = 'Onay vermeniz gerekmektedir.';
    return e;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length > 0) { setErrors(e2); return; }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="page-wrapper">
        <div className="register-success">
          <div className="register-success__icon">🎉</div>
          <h2>Kayıt Talebiniz Alındı!</h2>
          <p>
            <strong>{form.childName}</strong> için <strong>{form.branch}</strong> branşında
            kayıt talebiniz başarıyla iletildi.
          </p>
          <p>Antrenörlerimiz en kısa sürede <strong>{form.parentPhone}</strong> numaralı telefonunuzdan
            sizi arayacaktır.</p>
          <button className="btn-primary" onClick={() => { setForm(initialForm); setSubmitted(false); }}>
            Yeni Kayıt
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="page-hero">
        <h1>Sporcu Kaydı</h1>
        <p>Çocuğunuzun spor yolculuğu buradan başlıyor</p>
      </div>

      <section className="section">
        <div className="container register-layout">

          {/* Form */}
          <form className="register-form card" onSubmit={handleSubmit} noValidate>
            <h2 className="register-form__title">Kayıt Formu</h2>

            <fieldset className="register-fieldset">
              <legend>Veli Bilgileri</legend>

              <div className="form-group">
                <label htmlFor="parentName">Ad Soyad *</label>
                <input
                  id="parentName"
                  name="parentName"
                  type="text"
                  value={form.parentName}
                  onChange={handleChange}
                  placeholder="Veli adı soyadı"
                  className={errors.parentName ? 'error' : ''}
                />
                {errors.parentName && <span className="form-error">{errors.parentName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="parentPhone">Telefon *</label>
                <input
                  id="parentPhone"
                  name="parentPhone"
                  type="tel"
                  value={form.parentPhone}
                  onChange={handleChange}
                  placeholder="05XX XXX XX XX"
                  className={errors.parentPhone ? 'error' : ''}
                />
                {errors.parentPhone && <span className="form-error">{errors.parentPhone}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="parentEmail">E-posta (isteğe bağlı)</label>
                <input
                  id="parentEmail"
                  name="parentEmail"
                  type="email"
                  value={form.parentEmail}
                  onChange={handleChange}
                  placeholder="ornek@mail.com"
                  className={errors.parentEmail ? 'error' : ''}
                />
                {errors.parentEmail && <span className="form-error">{errors.parentEmail}</span>}
              </div>
            </fieldset>

            <fieldset className="register-fieldset">
              <legend>Sporcu Bilgileri</legend>

              <div className="form-group">
                <label htmlFor="childName">Sporcu Adı Soyadı *</label>
                <input
                  id="childName"
                  name="childName"
                  type="text"
                  value={form.childName}
                  onChange={handleChange}
                  placeholder="Sporcu adı soyadı"
                  className={errors.childName ? 'error' : ''}
                />
                {errors.childName && <span className="form-error">{errors.childName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="childBirthYear">Doğum Yılı *</label>
                <input
                  id="childBirthYear"
                  name="childBirthYear"
                  type="number"
                  min="2005"
                  max="2023"
                  value={form.childBirthYear}
                  onChange={handleChange}
                  placeholder="örn: 2015"
                  className={errors.childBirthYear ? 'error' : ''}
                />
                {errors.childBirthYear && <span className="form-error">{errors.childBirthYear}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="branch">Branş *</label>
                <select
                  id="branch"
                  name="branch"
                  value={form.branch}
                  onChange={handleChange}
                  className={errors.branch ? 'error' : ''}
                >
                  <option value="">Branş seçin...</option>
                  {branches.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                {errors.branch && <span className="form-error">{errors.branch}</span>}
              </div>
            </fieldset>

            <div className="form-group">
              <label htmlFor="message">Ek Mesaj (isteğe bağlı)</label>
              <textarea
                id="message"
                name="message"
                rows={4}
                value={form.message}
                onChange={handleChange}
                placeholder="Eklemek istediğiniz bilgiler..."
              />
            </div>

            <div className="form-group form-group--checkbox">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="consent"
                  checked={form.consent}
                  onChange={handleChange}
                  className={errors.consent ? 'error' : ''}
                />
                <span>
                  Kişisel verilerimin kulüp tarafından kayıt işlemleri kapsamında işlenmesine onay veriyorum. *
                </span>
              </label>
              {errors.consent && <span className="form-error">{errors.consent}</span>}
            </div>

            <button type="submit" className="btn-primary register-submit">
              Kayıt Talebini Gönder
            </button>
          </form>

          {/* Info Panel */}
          <aside className="register-info">
            <div className="card register-info__card">
              <h3>📋 Kayıt Süreci</h3>
              <ol className="register-info__steps">
                <li><span>1</span> Formu doldurun ve gönderin</li>
                <li><span>2</span> Antrenörümüz sizi arasın</li>
                <li><span>3</span> Deneme antrenmanına katılın</li>
                <li><span>4</span> Lisans işlemleriniz tamamlansın</li>
              </ol>
            </div>
            <div className="card register-info__card">
              <h3>📞 Direkt İletişim</h3>
              <p>Formla uğraşmak yerine doğrudan aramak isterseniz:</p>
              <a href="tel:+905000000000" className="register-info__phone">
                +90 (000) 000 00 00
              </a>
            </div>
            <div className="card register-info__card">
              <h3>🕐 Antrenman Saatleri</h3>
              <ul className="register-info__hours">
                <li><span>Hafta İçi</span><span>15:00 – 20:00</span></li>
                <li><span>Cumartesi</span><span>09:00 – 18:00</span></li>
                <li><span>Pazar</span><span>10:00 – 16:00</span></li>
              </ul>
            </div>
          </aside>

        </div>
      </section>
    </div>
  );
}
