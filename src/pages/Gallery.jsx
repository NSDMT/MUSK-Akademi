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
  const [items, setItems] = useState([]);
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
  const openLightbox = item => setLightbox(item);
  const closeLightbox = () => setLightbox(null);
  const navLightbox = dir => {
    const idx = items.findIndex(g => g.id === lightbox.id);
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
                    <span className="gallery-item__zoom">ğŸ”</span>
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
          <button className="lightbox__close" onClick={closeLightbox}>âœ•</button>
          <button className="lightbox__nav lightbox__nav--prev" onClick={(e) => { e.stopPropagation(); navLightbox(-1); }}>â€¹</button>
          <div className="lightbox__content" onClick={(e) => e.stopPropagation()}>
            <img src={lightbox.image_url} alt={lightbox.caption} className="lightbox__img" />
            <p className="lightbox__caption">{lightbox.caption} â€” {lightbox.category}</p>
          </div>
          <button className="lightbox__nav lightbox__nav--next" onClick={(e) => { e.stopPropagation(); navLightbox(1); }}>â€º</button>
        </div>
      )}
    </div>
  );
}
