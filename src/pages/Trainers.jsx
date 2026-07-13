import './Trainers.css';
import { useEffect, useMemo, useState } from 'react';
import client from '../api/client';

const BRANCH_ICONS = {
  futbol: '⚽',
  voleybol: '🏐',
  basketbol: '🏀',
  yuzme: '🏊',
  tenis: '🎾',
  satranc: '♟️',
  paten: '🛼',
};

function normalizeKey(v) {
  return String(v || '')
    .toLowerCase()
    .replaceAll('ı', 'i')
    .replaceAll('ş', 's')
    .replaceAll('ğ', 'g')
    .replaceAll('ü', 'u')
    .replaceAll('ö', 'o')
    .replaceAll('ç', 'c');
}

export default function Trainers() {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Tümü');

  useEffect(() => {
    client.get('/trainers')
      .then(res => setCoaches(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  const branches = useMemo(() => {
    const all = Array.from(new Set((coaches || []).map(c => c.branch).filter(Boolean)));
    return ['Tümü', ...all];
  }, [coaches]);

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
          {branches.length > 1 && (
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
          )}

          <div className="trainers-grid">
            {filtered.map(c => (
              <div key={c.id || `${c.name}-${c.branch}`} className="trainer-card card">
                <div className="trainer-card__avatar">
                  {c.photo_url ? (
                    <img src={c.photo_url} alt={c.name} className="trainer-card__photo" />
                  ) : (
                    <span className="trainer-card__icon">{BRANCH_ICONS[normalizeKey(c.branch)] || '🏅'}</span>
                  )}
                </div>
                <div className="trainer-card__info">
                  <h3 className="trainer-card__name">{c.name}</h3>
                  <span className="trainer-card__branch">{c.branch}</span>
                  <p className="trainer-card__role">{c.role}</p>
                  {!!c.bio && <p className="trainer-card__role" style={{ marginTop: 8, opacity: 0.85 }}>{c.bio}</p>}
                </div>
              </div>
            ))}
          </div>

          {loading && (
            <p style={{ textAlign: 'center', color: '#666', padding: '40px 0' }}>
              Antrenörler yükleniyor...
            </p>
          )}

          {!loading && filtered.length === 0 && (
            <p style={{ textAlign: 'center', color: '#666', padding: '40px 0' }}>
              Bu branşta antrenör bulunamadı.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
