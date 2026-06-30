import { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || '/api';

const BRANCH_COLORS = {
  'Futbol': '#4ade80',
  'Voleybol': '#60a5fa',
  'Basketbol': '#fb923c',
  'Tekerlekli Paten': '#f472b6',
  'Yüzme': '#22d3ee',
  'Tenis': '#a78bfa',
  'Satranç': '#fbbf24',
};

export default function Athletes() {
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetch(`${API}/students/public`)
      .then(r => r.json())
      .then(data => { setAthletes(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const branches = [...new Set(athletes.flatMap(a => (a.branches || '').split(',').map(b => b.trim()).filter(Boolean)))].sort();

  const filtered = filter
    ? athletes.filter(a => (a.branches || '').includes(filter))
    : athletes;

  return (
    <div className="page-wrapper">
      <div className="page-hero">
        <h1>Sporcularımız</h1>
        <p>Kulübümüzde aktif olarak antrenman yapan sporcularımız</p>
      </div>

      <section className="section">
        <div className="container">

          {/* Branş Filtresi */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32, justifyContent: 'center' }}>
            <button
              onClick={() => setFilter('')}
              style={{
                padding: '6px 18px', borderRadius: 20, border: '1px solid #333',
                background: filter === '' ? '#00b4d8' : 'transparent',
                color: filter === '' ? '#fff' : '#aaa', cursor: 'pointer', fontWeight: 600,
              }}
            >
              Tümü
            </button>
            {branches.map(b => (
              <button
                key={b}
                onClick={() => setFilter(b === filter ? '' : b)}
                style={{
                  padding: '6px 18px', borderRadius: 20, border: `1px solid ${BRANCH_COLORS[b] || '#555'}`,
                  background: filter === b ? (BRANCH_COLORS[b] || '#555') : 'transparent',
                  color: filter === b ? '#000' : (BRANCH_COLORS[b] || '#aaa'),
                  cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s',
                }}
              >
                {b}
              </button>
            ))}
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', color: '#888', padding: '40px 0' }}>Yükleniyor...</p>
          ) : filtered.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#888', padding: '40px 0' }}>Bu branşta kayıtlı sporcu bulunamadı.</p>
          ) : (
            <>
              <p style={{ textAlign: 'center', color: '#aaa', marginBottom: 24 }}>
                <strong style={{ color: '#00b4d8' }}>{filtered.length}</strong> sporcu listeleniyor
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: 16,
              }}>
                {filtered.map((a, i) => {
                  const branchList = (a.branches || '').split(',').map(b => b.trim()).filter(Boolean);
                  const mainBranch = branchList[0] || '';
                  const color = BRANCH_COLORS[mainBranch] || '#00b4d8';
                  return (
                    <div key={i} style={{
                      background: '#111', border: `1px solid #222`, borderRadius: 12,
                      padding: '20px 16px', textAlign: 'center',
                      borderTop: `3px solid ${color}`,
                    }}>
                      <div style={{
                        width: 56, height: 56, borderRadius: '50%', margin: '0 auto 12px',
                        background: `${color}22`, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '1.5rem', color,
                      }}>
                        {a.first_name?.charAt(0)}{a.last_name?.charAt(0)}
                      </div>
                      <div style={{ fontWeight: 700, color: '#f0f0f0', fontSize: '0.95rem', marginBottom: 6 }}>
                        {a.first_name} {a.last_name}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
                        {branchList.map(b => (
                          <span key={b} style={{
                            fontSize: '0.7rem', padding: '2px 8px', borderRadius: 10,
                            background: `${BRANCH_COLORS[b] || '#555'}22`,
                            color: BRANCH_COLORS[b] || '#aaa',
                            border: `1px solid ${BRANCH_COLORS[b] || '#555'}44`,
                          }}>
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
