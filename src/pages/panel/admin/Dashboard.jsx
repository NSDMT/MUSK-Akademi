import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PanelLayout from '../../../components/PanelLayout';
import client from '../../../api/client';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const [students, users, groups, schedule, apps] = await Promise.all([
          client.get('/students'),
          client.get('/users'),
          client.get('/groups'),
          client.get('/schedule'),
          client.get('/applications?status=pending'),
        ]);
        setStats({
          students: students.data.length,
          trainers: users.data.filter(u => u.role === 'antrenor').length,
          parents: users.data.filter(u => u.role === 'veli').length,
          groups: groups.data.length,
          schedule: schedule.data.length,
          pending: apps.data.length,
        });
      } catch {
        setStats({ students: 0, trainers: 0, parents: 0, groups: 0, schedule: 0, pending: 0 });
      }
    }
    load();
  }, []);

  return (
    <PanelLayout>
      <div className="panel-header">
        <div>
          <h1 className="panel-title">Dashboard</h1>
          <p className="panel-subtitle">Genel bakış</p>
        </div>
      </div>

      <div className="stat-grid">
        {[
          { icon: '👦', value: stats?.students ?? '—', label: 'Toplam Öğrenci' },
          { icon: '🏃', value: stats?.trainers ?? '—', label: 'Antrenör' },
          { icon: '👪', value: stats?.parents ?? '—', label: 'Veli' },
          { icon: '🏆', value: stats?.groups ?? '—', label: 'Grup' },
          { icon: '📅', value: stats?.schedule ?? '—', label: 'Haftalık Ders' },
          { icon: '📋', value: stats?.pending ?? '—', label: 'Bekleyen Başvuru', link: '/panel/admin/applications' },
        ].map(s => (
          <div
            key={s.label}
            className="stat-card"
            style={s.link ? { cursor: 'pointer' } : {}}
            onClick={() => s.link && navigate(s.link)}
          >
            <div className="stat-card__icon">{s.icon}</div>
            <div className="stat-card__value" style={s.label === 'Bekleyen Başvuru' && stats?.pending > 0 ? { color: '#f59e0b' } : {}}>{s.value}</div>
            <div className="stat-card__label">{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ color: '#555', fontSize: '0.875rem', marginTop: 24 }}>
        <p>Soldaki menüden öğrenci, kullanıcı, grup ve antrenman takvimi yönetimine erişebilirsiniz.</p>
      </div>
    </PanelLayout>
  );
}
