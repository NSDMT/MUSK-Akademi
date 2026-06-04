import { useEffect, useState } from 'react';
import PanelLayout from '../../../components/PanelLayout';
import client from '../../../api/client';

const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const EMPTY = { group_id: '', trainer_id: '', day_of_week: '0', start_time: '15:00', end_time: '16:00', location: '' };

export default function AdminSchedule() {
  const [schedule, setSchedule] = useState([]);
  const [groups, setGroups]     = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [editId, setEditId]     = useState(null);
  const [saving, setSaving]     = useState(false);
  const [alert, setAlert]       = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const [sc, g, u] = await Promise.all([
      client.get('/schedule'),
      client.get('/groups'),
      client.get('/users'),
    ]);
    setSchedule(sc.data);
    setGroups(g.data);
    setTrainers(u.data.filter(u => u.role === 'antrenor'));
  }

  function openAdd() { setForm(EMPTY); setEditId(null); setModal('form'); }
  function openEdit(s) {
    setForm({ group_id: s.group_id, trainer_id: s.trainer_id, day_of_week: String(s.day_of_week), start_time: s.start_time, end_time: s.end_time, location: s.location || '' });
    setEditId(s.id);
    setModal('form');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, group_id: parseInt(form.group_id), trainer_id: parseInt(form.trainer_id), day_of_week: parseInt(form.day_of_week) };
      if (editId) await client.put(`/schedule/${editId}`, payload);
      else        await client.post('/schedule', payload);
      setModal(null);
      showAlert('success', 'Ders kaydedildi');
      load();
    } catch (err) {
      showAlert('error', err.response?.data?.error || 'Hata');
    } finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm('Bu dersi kaldırmak istiyor musunuz?')) return;
    await client.delete(`/schedule/${id}`);
    load();
  }

  function showAlert(type, msg) { setAlert({ type, msg }); setTimeout(() => setAlert(null), 3000); }

  // Güne göre grupla
  const byDay = DAYS.map((name, idx) => ({
    name,
    items: schedule.filter(s => s.day_of_week === idx),
  }));

  return (
    <PanelLayout>
      <div className="panel-header">
        <div>
          <h1 className="panel-title">Antrenman Takvimi</h1>
          <p className="panel-subtitle">Haftalık ders programı</p>
        </div>
        <button className="btn-panel" onClick={openAdd}>+ Ders Ekle</button>
      </div>

      {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {byDay.map(day => day.items.length === 0 ? null : (
          <div key={day.name}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span className="day-badge">{day.name}</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
            </div>
            <div className="panel-table-wrap">
              <table className="panel-table">
                <thead>
                  <tr><th>Saat</th><th>Grup</th><th>Branş</th><th>Antrenör</th><th>Salon/Konum</th><th></th></tr>
                </thead>
                <tbody>
                  {day.items.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 700, color: '#c9a84c' }}>{s.start_time} – {s.end_time}</td>
                      <td style={{ fontWeight: 600, color: '#f0f0f0' }}>{s.group_name}</td>
                      <td>{s.branch_name}</td>
                      <td>{s.trainer_name}</td>
                      <td>{s.location || '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn-panel btn-panel-sm btn-ghost" onClick={() => openEdit(s)}>Düzenle</button>
                          <button className="btn-panel btn-panel-sm btn-danger" onClick={() => handleDelete(s.id)}>Kaldır</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
        {schedule.length === 0 && (
          <div className="empty-state">
            <div style={{ fontSize: '3rem' }}>📅</div>
            <p>Henüz ders eklenmemiş</p>
          </div>
        )}
      </div>

      {modal === 'form' && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal__title">{editId ? 'Dersi Düzenle' : 'Yeni Ders'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-field">
                  <label>Grup *</label>
                  <select required value={form.group_id} onChange={e => setForm(f => ({ ...f, group_id: e.target.value }))}>
                    <option value="">Seçiniz</option>
                    {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label>Antrenör *</label>
                  <select required value={form.trainer_id} onChange={e => setForm(f => ({ ...f, trainer_id: e.target.value }))}>
                    <option value="">Seçiniz</option>
                    {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label>Gün *</label>
                  <select value={form.day_of_week} onChange={e => setForm(f => ({ ...f, day_of_week: e.target.value }))}>
                    {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label>Konum</label>
                  <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Salon / Saha adı" />
                </div>
                <div className="form-field">
                  <label>Başlangıç *</label>
                  <input type="time" required value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} />
                </div>
                <div className="form-field">
                  <label>Bitiş *</label>
                  <input type="time" required value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-panel btn-ghost" onClick={() => setModal(null)}>İptal</button>
                <button type="submit" className="btn-panel" disabled={saving}>{saving ? 'Kaydediliyor...' : 'Kaydet'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PanelLayout>
  );
}
