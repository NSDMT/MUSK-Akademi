import { useState, useEffect } from 'react';
import './News.css';

const CATEGORIES = ['TÃ¼mÃ¼', 'Genel', 'Futbol', 'Voleybol', 'Basketbol', 'Tekerlekli Paten', 'YÃ¼zme', 'SatranÃ§', 'Tenis'];
const API = import.meta.env.VITE_API_URL || '/api';

export default function News() {
  const [filter, setFilter] = useState('TÃ¼mÃ¼');
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = filter === 'TÃ¼mÃ¼'
      ? `${API}/news`
      : `${API}/news?category=${encodeURIComponent(filter)}`;
    setLoading(true);
    fetch(url)
      .then(r => r.json())
      .then(data => { setNewsData(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [filter]);

  function formatDate(str) {
    if (!str) return '';
    try { return new Date(str).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }); }
    catch { return str.slice(0, 10); }
  }

  return (
    <div className="page-wrapper">
      <div className="page-hero">
        <h1>Haberler & Duyurular</h1>
        <p>KulÃ¼bÃ¼mÃ¼zden en gÃ¼ncel haberler</p>
      </div>

      {/* Category Filter */}
      <div className="news-filter">
        <div className="container news-filter__inner">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`news-filter__btn${filter === cat ? ' news-filter__btn--active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* News Grid */}
      <section className="section">
        <div className="container">
          {loading ? (
            <p className="news-empty">YÃ¼kleniyor...</p>
          ) : newsData.length === 0 ? (
            <p className="news-empty">Bu kategoride henÃ¼z haber bulunmamaktadÄ±r.</p>
          ) : (
            <div className="news-grid">
              {newsData.map(news => (
                <article key={news.id} className="news-card card">
                  <div className="news-card__img-wrap">
                    {news.image_url ? (
                      <img src={news.image_url} alt={news.title} className="news-card__img" loading="lazy" />
                    ) : (
                      <div className="news-card__img-placeholder"><span>ğŸ“°</span></div>
                    )}
                  </div>
                  <div className="news-card__body">
                    <div className="news-card__meta">
                      <span className="news-card__cat">{news.category}</span>
                      <span className="news-card__date">{formatDate(news.published_at)}</span>
                    </div>
                    <h3 className="news-card__title">{news.title}</h3>
                    <p className="news-card__summary">{news.summary}</p>
                    {news.content && (
                      <button
                        className="news-card__btn btn-outline"
                        onClick={() => alert(news.content)}
                      >
                        DevamÄ±nÄ± Oku
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
