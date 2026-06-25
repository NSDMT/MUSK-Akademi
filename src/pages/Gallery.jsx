import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './Gallery.css';

const ALL_CATEGORIES = ['Tümü', 'Futbol', 'Voleybol', 'Basketbol', 'Tekerlekli Paten', 'Yüzme', 'Satranç', 'Tenis', 'Genel'];
const API = import.meta.env.VITE_API_URL || '/api';

export default function Gallery() {
  const location = useLocation();
  const [filter, setFilter] = useState(() => {
    const params = new URLSearchParams(location.search);
    const kat = params.get('kategori');
    if (kat && ALL_CATEGORIES.includes(kat)) return kat;
    return 'Tümü';
  });
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    const url = filter === 'Tümü'
      ? `${API}/gallery`
      : `${API}/gallery?category=${encodeURIComponent(filter)}`;
    setLoading(true);
    fetch(url)
      .then(r => r.json())
      .then(data => { setItems(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [filter]);

  // derive available categories from fetched data for filter tabs
  const openLightbox  = item  => setLightbox(item);
  const closeLightbox = ()   => setLightbox(null);
  const navLightbox   = dir  => {
    const idx  = items.findIndex(g => g.id === lightbox.id);
    const next = (idx + dir + items.length) % items.length;
    setLightbox(items[next]);
  };

  return (
    <div className="page-wrapper">
      <div className="page-hero">
        <h1>Galeri</h1>
        <p>Kulübümüzden kareler</p>
      </div>

      {/* Filter */}
      <div className="gallery-filter">
        <div className="container gallery-filter__inner">
          {ALL_CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`gallery-filter__btn${filter === cat ? ' gallery-filter__btn--active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <section className="section">
        <div className="container">
          {loading ? (
            <p style={{ color: '#888', padding: '32px 0' }}>Yükleniyor...</p>
          ) : items.length === 0 ? (
            <p style={{ color: '#888', padding: '32px 0' }}>Bu kategoride henüz fotoğraf yok.</p>
          ) : (
            <div className="gallery-grid">
              {items.map((item) => (
                <button
                  key={item.id}
                  className="gallery-item"
                  onClick={() => openLightbox(item)}
                  aria-label={item.caption}
                >
                  <img src={item.image_url} alt={item.caption} className="gallery-item__img" loading="lazy" />
                  <div className="gallery-item__overlay">
                    <span className="gallery-item__cat">{item.category}</span>
                    <span className="gallery-item__zoom">🔍</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox" onClick={closeLightbox}>
          <button className="lightbox__close" onClick={closeLightbox}>✕</button>
          <button className="lightbox__nav lightbox__nav--prev" onClick={(e) => { e.stopPropagation(); navLightbox(-1); }}>‹</button>
          <div className="lightbox__content" onClick={(e) => e.stopPropagation()}>
            <img src={lightbox.image_url} alt={lightbox.caption} className="lightbox__img" />
            <p className="lightbox__caption">{lightbox.caption} — {lightbox.category}</p>
          </div>
          <button className="lightbox__nav lightbox__nav--next" onClick={(e) => { e.stopPropagation(); navLightbox(1); }}>›</button>
        </div>
      )}
    </div>
  );
}

const BASE = '/images/gallery/';

const galleryItems = [
  // Voleybol
  { id: 1, src: BASE + 'WhatsApp Image 2026-05-01 at 20.58.47 (1).jpeg', category: 'Voleybol', caption: 'Voleybol Antrenman' },
  { id: 2, src: BASE + 'WhatsApp Image 2026-05-01 at 20.58.47 (2).jpeg', category: 'Voleybol', caption: 'Voleybol Antrenman' },
  { id: 3, src: BASE + 'WhatsApp Image 2026-05-01 at 20.58.47 (3).jpeg', category: 'Voleybol', caption: 'Voleybol Antrenman' },
  // Tekerlekli Paten
  { id: 4, src: BASE + 'WhatsApp Image 2026-05-01 at 20.58.47 (4).jpeg', category: 'Tekerlekli Paten', caption: 'Tekerlekli Paten Antrenman' },
  { id: 5, src: BASE + 'WhatsApp Image 2026-05-01 at 20.58.47 (5).jpeg', category: 'Tekerlekli Paten', caption: 'Tekerlekli Paten Antrenman' },
  // Futbol
  { id: 6, src: BASE + 'WhatsApp Image 2026-05-01 at 20.58.47 (6).jpeg', category: 'Futbol', caption: 'Futbol Antrenman' },
  { id: 7, src: BASE + 'WhatsApp Image 2026-05-01 at 20.58.47.jpeg', category: 'Futbol', caption: 'Futbol Antrenman' },
  { id: 8, src: BASE + 'WhatsApp Image 2026-05-01 at 20.58.48 (1).jpeg', category: 'Futbol', caption: 'Futbol Antrenman' },
  { id: 9, src: BASE + 'WhatsApp Image 2026-05-01 at 20.58.48.jpeg', category: 'Futbol', caption: 'Futbol Takım' },
  // Yüzme
  { id: 10, src: BASE + 'WhatsApp Image 2026-05-01 at 20.58.48 (2).jpeg', category: 'Yüzme', caption: 'Yüzme Antrenman' },
  { id: 11, src: BASE + 'WhatsApp Image 2026-05-01 at 20.58.48 (3).jpeg', category: 'Yüzme', caption: 'Yüzme Antrenman' },
  { id: 12, src: BASE + 'WhatsApp Image 2026-05-01 at 20.58.48 (4).jpeg', category: 'Yüzme', caption: 'Yüzme Antrenman' },
  { id: 13, src: BASE + 'WhatsApp Image 2026-05-01 at 20.58.48 (5).jpeg', category: 'Yüzme', caption: 'Yüzme Antrenman' },
  { id: 14, src: BASE + 'WhatsApp Image 2026-05-01 at 20.58.48 (6).jpeg', category: 'Yüzme', caption: 'Yüzme Antrenman' },
  { id: 15, src: BASE + 'WhatsApp Image 2026-05-01 at 20.58.48 (7).jpeg', category: 'Yüzme', caption: 'Yüzme Havuz Antrenmanı' },
  { id: 16, src: BASE + 'WhatsApp Image 2026-05-01 at 20.58.49.jpeg', category: 'Yüzme', caption: 'Yüzme Takım Fotoğrafı' },
  // Basketbol
  { id: 17, src: BASE + 'WhatsApp Image 2026-05-01 at 20.58.49 (1).jpeg', category: 'Basketbol', caption: 'Basketbol Takım' },
  { id: 18, src: BASE + 'WhatsApp Image 2026-05-01 at 20.58.49 (2).jpeg', category: 'Basketbol', caption: 'Basketbol Takım Fotoğrafı' },
  { id: 19, src: BASE + 'WhatsApp Image 2026-05-01 at 20.58.49 (3).jpeg', category: 'Basketbol', caption: 'Basketbol Antrenman Molası' },
  { id: 20, src: BASE + 'WhatsApp Image 2026-05-01 at 20.58.49 (4).jpeg', category: 'Basketbol', caption: 'Basketbol Maç Sonrası' },
  { id: 21, src: BASE + 'WhatsApp Image 2026-05-01 at 20.58.49 (5).jpeg', category: 'Basketbol', caption: 'Basketbol U-12 Takımı' },
  { id: 22, src: BASE + 'WhatsApp Image 2026-05-01 at 20.58.49 (6).jpeg', category: 'Basketbol', caption: 'Basketbol Kupa Töreni' },
  { id: 23, src: BASE + 'WhatsApp Image 2026-05-01 at 20.58.49 (7).jpeg', category: 'Basketbol', caption: 'Basketbol Kupa Töreni' },
];

export default function Gallery() {
  const location = useLocation();
  const [filter, setFilter] = useState(() => {
    const params = new URLSearchParams(location.search);
    const kat = params.get('kategori');
    if (kat && categories.includes(kat)) return kat;
    return 'Tümü';
  });
  const [lightbox, setLightbox] = useState(null);

  const filtered = filter === 'Tümü' ? galleryItems : galleryItems.filter(g => g.category === filter);

  const openLightbox = (item) => setLightbox(item);
  const closeLightbox = () => setLightbox(null);

  const navLightbox = (dir) => {
    const idx = filtered.findIndex(g => g.id === lightbox.id);
    const next = (idx + dir + filtered.length) % filtered.length;
    setLightbox(filtered[next]);
  };

  return (
    <div className="page-wrapper">
      <div className="page-hero">
        <h1>Galeri</h1>
        <p>Kulübümüzden kareler</p>
      </div>

      {/* Filter */}
      <div className="gallery-filter">
        <div className="container gallery-filter__inner">
          {categories.map(cat => (
            <button
              key={cat}
              className={`gallery-filter__btn${filter === cat ? ' gallery-filter__btn--active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <section className="section">
        <div className="container">
          <div className="gallery-grid">
            {filtered.map((item) => (
              <button
                key={item.id}
                className="gallery-item"
                onClick={() => openLightbox(item)}
                aria-label={item.caption}
              >
                <img src={item.src} alt={item.caption} className="gallery-item__img" loading="lazy" />
                <div className="gallery-item__overlay">
                  <span className="gallery-item__cat">{item.category}</span>
                  <span className="gallery-item__zoom">🔍</span>
                </div>
              </button>
            ))}
          </div>


        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox" onClick={closeLightbox}>
          <button className="lightbox__close" onClick={closeLightbox}>✕</button>
          <button className="lightbox__nav lightbox__nav--prev" onClick={(e) => { e.stopPropagation(); navLightbox(-1); }}>‹</button>
          <div className="lightbox__content" onClick={(e) => e.stopPropagation()}>
            <img src={lightbox.src} alt={lightbox.caption} className="lightbox__img" />
            <p className="lightbox__caption">{lightbox.caption} — {lightbox.category}</p>
          </div>
          <button className="lightbox__nav lightbox__nav--next" onClick={(e) => { e.stopPropagation(); navLightbox(1); }}>›</button>
        </div>
      )}
    </div>
  );
}
