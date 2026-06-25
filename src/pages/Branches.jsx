import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { branches } from '../data/branches';
import './Branches.css';

function TrainerCard({ trainer }) {
  return (
    <div className="trainer-card">
      {trainer.photo ? (
        <img src={trainer.photo} alt={trainer.name} className="trainer-card__photo" />
      ) : (
        <div className="trainer-card__avatar">
          <span>👤</span>
        </div>
      )}
      {/* FOTOĞRAF: her antrenör için public/images/trainer-[isim].jpg ekleyin */}
      <div className="trainer-card__info">
        <strong>{trainer.name}</strong>
        <span>{trainer.role}</span>
      </div>
    </div>
  );
}

function BranchSection({ branch }) {
  const lines = branch.description.split('\n').filter(Boolean);
  return (
    <section id={branch.id} className="branch-section">
      <div className="container">
        <div className="branch-section__inner">
          <div className="branch-section__content">
            <div className="branch-section__header">
              <span className="branch-section__icon">{branch.icon}</span>
              <div>
                <h2>{branch.name} Akademimiz</h2>
                <span className="branch-section__age">{branch.ageRange}</span>
              </div>
            </div>
            {lines.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
            {branch.highlight && (
              <div className="branch-section__highlight">{branch.highlight}</div>
            )}

            {branch.trainers.length > 0 && (
              <div className="branch-section__trainers">
                <h3>{branch.name} Antrenörlerimiz</h3>
                <div className="trainers-grid">
                  {branch.trainers.map(t => (
                    <TrainerCard key={t.name} trainer={t} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Branch Image + Gallery Link */}
          <div className="branch-section__image">
            {branch.image ? (
              <img src={branch.image} alt={branch.name} className="branch-section__img" />
            ) : (
              <div className="branch-section__img-placeholder">
                <span>{branch.icon}</span>
                <p>{branch.name} Görseli</p>
              </div>
            )}
            {branch.galleryCategory && (
              <Link
                to={`/galeri?kategori=${encodeURIComponent(branch.galleryCategory)}`}
                className="branch-gallery-btn"
              >
                📷 Galerimize Git
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Branches() {
  const location = useLocation();
  const [active, setActive] = useState('futbol');

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      setActive(id);
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [location]);

  return (
    <div className="page-wrapper">
      <div className="page-hero">
        <h1>Branşlarımız</h1>
        <p>7 farklı branşta profesyonel spor eğitimi</p>
      </div>

      {/* Tab Nav */}
      <div className="branches-tabs">
        <div className="container branches-tabs__inner">
          {branches.map(b => (
            <a
              key={b.id}
              href={`#${b.id}`}
              className={`branches-tab${active === b.id ? ' branches-tab--active' : ''}`}
              onClick={() => setActive(b.id)}
            >
              <span>{b.icon}</span>
              {b.name}
            </a>
          ))}
        </div>
      </div>

      {branches.map(b => (
        <BranchSection key={b.id} branch={b} />
      ))}
    </div>
  );
}
