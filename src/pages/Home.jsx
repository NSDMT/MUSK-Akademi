import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import './Home.css';

const SLIDES = [
  { src: '/images/homepage-slider/slide1.jpg', label: 'Tekerlekli Paten' },
  { src: '/images/homepage-slider/slide2.jpg', label: 'Voleybol' },
  { src: '/images/homepage-slider/slide3.jpg', label: 'Yüzme' },
  { src: '/images/homepage-slider/slide4.jpg', label: 'Futbol' },
  { src: '/images/homepage-slider/slide5.jpg', label: 'Basketbol' },
  { src: '/images/homepage-slider/slide6.jpg', label: 'Voleybol Müsabakası' },
];

const branches = [
  { icon: '⚽', name: 'Futbol', desc: '5-15 yaş arası profesyonel futbol eğitimi', to: '/branslar#futbol' },
  { icon: '🏐', name: 'Voleybol', desc: '5-16 yaş arası profesyonel voleybol eğitimi', to: '/branslar#voleybol' },
  { icon: '🏀', name: 'Basketbol', desc: '5-16 yaş arası profesyonel basketbol eğitimi', to: '/branslar#basketbol' },
  { icon: '🛼', name: 'Tekerlekli Paten', desc: 'Denge, koordinasyon ve teknik gelişim eğitimi', to: '/branslar#paten' },
  { icon: '🏊', name: 'Yüzme', desc: 'Profesyonel yüzme eğitimi', to: '/branslar#yuzme' },
  { icon: '🎾', name: 'Tenis', desc: 'Profesyonel tenis eğitimi', to: '/branslar#tenis' },
  { icon: '♟️', name: 'Satranç', desc: 'Stratejik düşünme ve problem çözme eğitimi', to: '/branslar#satranc' },
];

const whyUs = [
  { icon: '🏅', text: 'Uzman antrenör kadrosu' },
  { icon: '🎯', text: 'Çok branşlı spor eğitimi' },
  { icon: '🛡️', text: 'Güvenli eğitim ortamı' },
  { icon: '🏆', text: 'Başarı odaklı sistem' },
  { icon: '👨‍👩‍👧', text: 'Aile sıcaklığında kulüp yapısı' },
  { icon: '📋', text: 'Lisanslı sporcu gelişimi' },
];

const stats = [
  { value: '7+', label: 'Branş' },
  { value: '200+', label: 'Sporcu' },
  { value: '10+', label: 'Antrenör' },
  { value: '2023', label: 'Kuruluş Yılı' },
];

const coaches = [
  { name: 'Muzaffer Uğur', branch: 'Futbol', role: 'UEFA C / Çocuk Gelişim Antrenörü', icon: '⚽' },
  { name: 'Gökhan Turan', branch: 'Futbol', role: 'Futbol Antrenörü', icon: '⚽' },
  { name: 'Mümin Taş', branch: 'Futbol', role: 'UEFA C Futbol Antrenörü', icon: '⚽' },
  { name: 'Tuğba Uğur', branch: 'Voleybol & Paten', role: '3. Kademe Voleybol / Paten Antrenörü', icon: '🏐' },
  { name: 'Fatma Ceren Yılmaz', branch: 'Voleybol', role: 'Voleybol Antrenörü', icon: '🏐' },
  { name: 'Şeval Akurt', branch: 'Voleybol', role: 'Voleybol Antrenörü', icon: '🏐' },
  { name: 'Nipel Uluca', branch: 'Voleybol', role: 'Voleybol Antrenörü', icon: '🏐' },
  { name: 'Mehmet Dinçer', branch: 'Basketbol', role: '3. Kademe Basketbol Antrenörü', icon: '🏀' },
  { name: 'Fatma Gülten Özdil', branch: 'Basketbol', role: '2. Kademe Basketbol Antrenörü', icon: '🏀' },
  { name: 'Musa Çimen', branch: 'Tenis', role: '3. Kademe Paten Antrenörü', icon: '🎾' },
  { name: 'Beyza Ünüvar', branch: 'Satranç', role: '2. Kademe Satranç Antrenörü', icon: '♟️' },
];

export default function Home() {
  const [slideIndex, setSlideIndex] = useState(0);
  const [sponsors, setSponsors] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex(i => (i + 1) % SLIDES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    axios.get('/api/sponsors').then(r => setSponsors(r.data)).catch(() => {});
  }, []);

  return (
    <div className="page-wrapper">

      {/* ========== HERO SLIDER ========== */}
      <section className="hero">
        {SLIDES.map((slide, i) => (
          <div
            key={slide.src}
            className={`hero__slide${i === slideIndex ? ' hero__slide--active' : ''}`}
            style={{ backgroundImage: `url(${slide.src})` }}
          />
        ))}
        <div className="hero__overlay" />
        <div className="container hero__content">
          <div className="hero__badge">Karaman'ın Spor Akademisi</div>
          <h1 className="hero__title">
            Geleceğin <span className="gold-text">Şampiyonlarını</span><br />
            Bugünden Yetiştiriyoruz
          </h1>
          <p className="hero__desc">
            Muzaffer Uğur Spor Kulübü olarak 7 farklı branşta uzman kadromuzla
            çocuklarınızın fiziksel, zihinsel ve sosyal gelişimine katkı sağlıyoruz.
          </p>
          <div className="hero__actions">
            <Link to="/kayit" className="btn-primary">Hemen Kaydol</Link>
            <Link to="/hakkimizda" className="btn-outline">Bizi Tanıyın</Link>
          </div>
        </div>
        {/* Slider dots */}
        <div className="hero__dots">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              className={`hero__dot${i === slideIndex ? ' hero__dot--active' : ''}`}
              onClick={() => setSlideIndex(i)}
              aria-label={`Slayt ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ========== STATS ========== */}
      <section className="stats-bar">
        <div className="container stats-bar__inner">
          {stats.map(({ value, label }) => (
            <div key={label} className="stats-bar__item">
              <span className="stats-bar__value">{value}</span>
              <span className="stats-bar__label">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ========== BRANCHES ========== */}
      <section className="section branches-section">
        <div className="container">
          <p className="section-subtitle">Spor Alanlarımız</p>
          <h2 className="section-title">Branşlarımız</h2>
          <div className="section-divider" />
          <div className="branches-grid">
            {branches.map(({ icon, name, desc, to }) => (
              <Link to={to} key={name} className="branch-card card">
                <span className="branch-card__icon">{icon}</span>
                <h3 className="branch-card__name">{name}</h3>
                <p className="branch-card__desc">{desc}</p>
                <span className="branch-card__more">İncele →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========== WHY US ========== */}
      <section className="section why-section">
        <div className="container why-inner">
          <div className="why-content">
            <p className="section-subtitle" style={{ textAlign: 'left' }}>Tercih Sebebimiz</p>
            <h2 className="section-title" style={{ textAlign: 'left' }}>Neden Biz?</h2>
            <div className="section-divider" style={{ margin: '10px 0 40px' }} />
            <div className="why-grid">
              {whyUs.map(({ icon, text }) => (
                <div key={text} className="why-item">
                  <span className="why-item__icon">{icon}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
            <Link to="/hakkimizda" className="btn-primary" style={{ marginTop: '32px', display: 'inline-block' }}>
              Daha Fazla Bilgi
            </Link>
          </div>
          <div className="why-image">
            <div className="why-image__placeholder">
              <span>📸</span>
              <p>Antrenman Fotoğrafı</p>
              <small>why-photo.jpg</small>
            </div>
          </div>
        </div>
      </section>

      {/* ========== COACHES ========== */}
      <section className="section coaches-section">
        <div className="container">
          <p className="section-subtitle">Uzman Kadromuz</p>
          <h2 className="section-title">Antrenörlerimiz</h2>
          <div className="section-divider" />
          <div className="coaches-grid">
            {coaches.map(c => (
              <div key={c.name} className="coach-card card">
                <div className="coach-card__avatar">
                  <span>{c.icon}</span>
                </div>
                <div className="coach-card__info">
                  <h4 className="coach-card__name">{c.name}</h4>
                  <span className="coach-card__branch">{c.branch}</span>
                  <p className="coach-card__role">{c.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FOOTBALL HIGHLIGHT ========== */}
      <section className="section academy-highlight">
        <div className="container">
          <div className="academy-highlight__inner">
            <div className="academy-highlight__text">
              <span className="academy-highlight__tag">⚽ Öne Çıkan</span>
              <h2>Futbol Akademimiz</h2>
              <p>
                5-15 yaş arası çocuklarımıza profesyonel futbol eğitimi sunuyoruz.
                Yaş gruplarına uygun, çocuk gelişimini destekleyen antrenman
                programlarımızla; fiziksel, zihinsel ve sosyal gelişimi ön planda tutuyoruz.
              </p>
              <p>
                Akademimizde yetişen sporcularımız, U-7'den itibaren U-18 ve A Takım
                seviyesine kadar gelişim sürecine dahil olmakta; resmi müsabakalarda tüm
                kategorilerde kulübümüzü başarıyla temsil etmektedir.
              </p>
              <Link to="/branslar#futbol" className="btn-primary">Futbol Akademisi</Link>
            </div>
            <div className="academy-highlight__image">
              <div className="why-image__placeholder"><span>⚽</span><p>Futbol Antrenman</p><small>football.jpg</small></div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SPONSORS ========== */}
      {sponsors.length > 0 && (
      <section className="section sponsors-section">
        <div className="container">
          <p className="section-subtitle">Destekçilerimiz</p>
          <h2 className="section-title">Sponsorlarımız</h2>
          <div className="section-divider" />
          <div className="sponsors-grid">
            {sponsors.map(s => (
              <div key={s.id} className="sponsor-card card">
                {s.website
                  ? <a href={s.website} target="_blank" rel="noopener noreferrer" className="sponsor-card__logo">
                      {s.logo_url
                        ? <img src={s.logo_url} alt={s.name} />
                        : <><span>🏢</span><p>{s.name}</p></>}
                    </a>
                  : <div className="sponsor-card__logo">
                      {s.logo_url
                        ? <img src={s.logo_url} alt={s.name} />
                        : <><span>🏢</span><p>{s.name}</p></>}
                    </div>
                }
                {s.description && <small className="sponsor-card__desc">{s.description}</small>}
              </div>
            ))}
          </div>
          <p className="sponsors-note">
            Sponsorluğa başvurmak için <Link to="/iletisim">bizimle iletişime geçin</Link>.
          </p>
        </div>
      </section>
      )}

      {/* ========== CTA ========== */}
      <section className="cta-section">
        <div className="container cta-section__inner">
          <h2>Çocuğunuzun Geleceğine Bugün Yatırım Yapın</h2>
          <p>Sporcu kayıt formunu doldurun, uzman antrenörlerimiz sizi arasın.</p>
          <div className="cta-section__actions">
            <Link to="/kayit" className="btn-primary">Sporcu Kaydı</Link>
            <Link to="/iletisim" className="btn-outline">Bize Ulaşın</Link>
          </div>
        </div>
      </section>

    </div>
  );
}

