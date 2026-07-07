import './Trainers.css';

const coaches = [
  { name: 'Muzaffer Uğur', branch: 'Futbol', role: 'UEFA C / Çocuk Gelişim Antrenörü', icon: '⚽', photo: '/images/trainers/muzaffer-ugur.jpeg' },
  { name: 'Gökhan Turan', branch: 'Futbol', role: 'Futbol Antrenörü', icon: '⚽', photo: '/images/trainers/gokhan-turan.jpeg' },
  { name: 'Mümin Taş', branch: 'Futbol', role: 'UEFA C Futbol Antrenörü', icon: '⚽', photo: '/images/trainers/mumin-tas.jpeg' },
  { name: 'Berkant Özyer', branch: 'Futbol', role: 'Yardımcı Antrenör', icon: '⚽', photo: '/images/trainers/berkant-ozyer.jpeg' },
  { name: 'Tuğba Uğur', branch: 'Voleybol & Paten', role: '3. Kademe Voleybol / Paten Antrenörü', icon: '🏐', photo: '/images/trainers/tugba-ugur.jpeg' },
  { name: 'Fatma Ceren Yılmaz', branch: 'Voleybol', role: 'Voleybol Antrenörü', icon: '🏐', photo: '/images/trainers/ceren-yilmaz.jpeg' },
  { name: 'Şeval Akurt', branch: 'Voleybol', role: 'Voleybol Antrenörü', icon: '🏐', photo: '/images/trainers/sevval-akurt.jpeg' },
  { name: 'Nipel Uluca', branch: 'Voleybol', role: 'Voleybol Antrenörü', icon: '🏐', photo: '/images/trainers/nipel-uluca.jpeg' },
  { name: 'İlayda Bulut', branch: 'Voleybol', role: 'Yardımcı Antrenör', icon: '🏐', photo: '/images/trainers/ilayda-bulut.jpeg' },
  { name: 'Mehmet Dinçer', branch: 'Basketbol', role: '3. Kademe Basketbol Antrenörü', icon: '🏀', photo: '' },
  { name: 'Fatma Gülten Özdil', branch: 'Basketbol', role: '2. Kademe Basketbol Antrenörü', icon: '🏀', photo: '' },
  { name: 'Ceylan Sultan Koçak', branch: 'Yüzme', role: '3. Kademe Kıdemli Yüzme Antrenörü', icon: '🏄', photo: '' },
  { name: 'Musa Çimen', branch: 'Tenis', role: '3. Kademe Paten Antrenörü', icon: '🎾', photo: '' },
  { name: 'Beyza Ünüvar', branch: 'Satranç', role: '2. Kademe Satranç Antrenörü', icon: '♟️', photo: '' },
];

const branches = ['Tümü', 'Futbol', 'Voleybol', 'Basketbol', 'Yüzme', 'Tenis', 'Satranç', 'Paten'];

import { useState } from 'react';

export default function Trainers() {
  const [filter, setFilter] = useState('Tümü');

  const filtered = filter === 'Tümü'
    ? coaches
    : coaches.filter(c => c.branch.includes(filter));

  return (
    <div className="page-wrapper">
      <div className="page-hero">
        <h1>Antrenörlerimiz</h1>
        <p>Alanında Uzman, Lisanslı Kadromuz</p>
      </div>

      <section className="section">
        <div className="container">
          {/* Filter */}
          <div className="trainers-filter">
            {branches.map(b => (
              <button
                key={b}
                className={`trainers-filter__btn${filter === b ? ' active' : ''}`}
                onClick={() => setFilter(b)}
              >
                {b}
              </button>
            ))}
          </div>

          <div className="trainers-grid">
            {filtered.map(c => (
              <div key={c.name} className="trainer-card card">
                <div className="trainer-card__avatar">
                  {c.photo ? (
                    <img src={c.photo} alt={c.name} className="trainer-card__photo" />
                  ) : (
                    <span className="trainer-card__icon">{c.icon}</span>
                  )}
                </div>
                <div className="trainer-card__info">
                  <h3 className="trainer-card__name">{c.name}</h3>
                  <span className="trainer-card__branch">{c.branch}</span>
                  <p className="trainer-card__role">{c.role}</p>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <p style={{ textAlign: 'center', color: '#666', padding: '40px 0' }}>
              Bu branşta antrenör bulunamadı.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
