import { useState } from 'react';
import './News.css';

// Dummy haberler – ilerleyen zamanda gerçek verilerle değiştirin
const newsData = [
  {
    id: 1,
    category: 'Futbol',
    date: '28 Nisan 2026',
    title: 'U-12 Takımımız Bölge Şampiyonasında Finalde',
    summary: 'U-12 takımımız bölge şampiyonasında sergilediği güçlü performansla finale yükseldi. Finalde Konya temsilcisiyle karşılaşacak olan takımımıza başarılar diliyoruz.',
    image: '/images/news-1.jpg', // FOTOĞRAF: haber görseli
  },
  {
    id: 2,
    category: 'Voleybol',
    date: '20 Nisan 2026',
    title: 'Voleybol Takımımız İl Birincisi Oldu',
    summary: 'Voleybol branşımızda kız takımımız il genelinde düzenlenen turnuvada birinci olarak kupayı aldı. Antrenörümüz Tuğba Uğur ve sporcularımızı tebrik ediyoruz.',
    image: '/images/news-2.jpg',
  },
  {
    id: 3,
    category: 'Satranç',
    date: '15 Nisan 2026',
    title: 'Satranç Sporcularımızdan 3 Madalya',
    summary: 'Karaman İl Satranç Turnuvası\'nda sporcularımız 1 altın, 1 gümüş ve 1 bronz madalya kazandı. Antrenörümüz Beyza Ünüvar ve tüm sporcularımıza tebrikler.',
    image: '/images/news-3.jpg',
  },
  {
    id: 4,
    category: 'Genel',
    date: '10 Nisan 2026',
    title: 'Yaz Dönemi Kayıtları Başladı',
    summary: '2026 yaz dönemi için branş kayıtlarımız başlamıştır. Tüm branşlarda kontenjanlar dolmadan yerinizi ayırtın. Detaylar için bize ulaşın.',
    image: '/images/news-4.jpg',
  },
  {
    id: 5,
    category: 'Basketbol',
    date: '5 Nisan 2026',
    title: 'Basketbol Akademimiz Yeni Sezona Hazır',
    summary: 'Basketbol branşımızda yeni sezon antrenmanları başlıyor. 5-16 yaş grubundaki sporcularımız için kapsamlı bir program hazırladık.',
    image: '/images/news-5.jpg',
  },
  {
    id: 6,
    category: 'Tekerlekli Paten',
    date: '1 Nisan 2026',
    title: 'Paten Sporcularımız Yarışmaya Hazırlanıyor',
    summary: 'Tekerlekli paten branşımızdaki sporcularımız önümüzdeki ay düzenlenecek bölge yarışmasına yoğun hazırlık yapıyor.',
    image: '/images/news-6.jpg',
  },
];

const categories = ['Tümü', 'Futbol', 'Voleybol', 'Basketbol', 'Tekerlekli Paten', 'Satranç', 'Tenis', 'Genel'];

export default function News() {
  const [filter, setFilter] = useState('Tümü');

  const filtered = filter === 'Tümü'
    ? newsData
    : newsData.filter(n => n.category === filter);

  return (
    <div className="page-wrapper">
      <div className="page-hero">
        <h1>Haberler & Duyurular</h1>
        <p>Kulübümüzden en güncel haberler</p>
      </div>

      {/* Category Filter */}
      <div className="news-filter">
        <div className="container news-filter__inner">
          {categories.map(cat => (
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
          {filtered.length === 0 ? (
            <p className="news-empty">Bu kategoride henüz haber bulunmamaktadır.</p>
          ) : (
            <div className="news-grid">
              {filtered.map(news => (
                <article key={news.id} className="news-card card">
                  {/* FOTOĞRAF: haber görseli için public/images/news-[id].jpg ekleyin */}
                  <div className="news-card__img-wrap">
                    <div className="news-card__img-placeholder">
                      <span>📰</span>
                    </div>
                  </div>
                  <div className="news-card__body">
                    <div className="news-card__meta">
                      <span className="news-card__cat">{news.category}</span>
                      <span className="news-card__date">{news.date}</span>
                    </div>
                    <h3 className="news-card__title">{news.title}</h3>
                    <p className="news-card__summary">{news.summary}</p>
                    <button className="news-card__btn btn-outline">Devamını Oku</button>
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
