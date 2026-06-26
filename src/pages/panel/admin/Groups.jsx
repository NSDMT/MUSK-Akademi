import { useEffect, useState } from 'react';
import PanelLayout from '../../../components/PanelLayout';
import client from '../../../api/client';

const EMPTY = { name: '', branch_id: '', trainer_id: '', age_range: '', description: '', monthly_fee: '' };

export default function AdminGroups() {
  const [groups, setGroups] = useState([]);
  const [branches, setBranches] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [studentsModal, setStudentsModal] = useState(null); // { groupName, list }

  useEffect(() => { load(); }, []);

  async function load() {
    const [g, b, u] = await Promise.all([
      client.get('/groups'),
      client.get('/groups/branches'),
      client.get('/users'),
    ]);
    setGroups(g.data);
    setBranches(b.data);
    // Antrenör ve Admin rolü olabilir (klüp sahibi antrenör de olabilir)
    setTrainers(u.data.filter(u => u.role === 'antrenor' || u.role === 'admin'));
  }

  async function openStudents(g) {
    try {
      const res = await client.get(`/groups/${g.id}/students`);
      setStudentsModal({ groupName: g.name, list: res.data });
    } catch {
      showAlert('error', 'Öğrenciler yüklenemedi');
    }
  }

  function openAdd() { setForm(EMPTY); setEditId(null); setModal('form'); }
  function openEdit(g) {
    setForm({ name: g.name, branch_id: g.branch_id, trainer_id: g.trainer_id || '', age_range: g.age_range || '', description: g.description || '', monthly_fee: g.monthly_fee ?? '' });
    setEditId(g.id);
    setModal('form');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, trainer_id: form.trainer_id || null, branch_id: parseInt(form.branch_id), monthly_fee: form.monthly_fee !== '' ? parseInt(form.monthly_fee) : 0 };
      if (editId) await client.put(`/groups/${editId}`, payload);
      else        await client.post('/groups', payload);
      setModal(null);
      showAlert('success', editId ? 'Grup güncellendi' : 'Grup eklendi');
      load();
    } catch (err) {
      showAlert('error', err.response?.data?.error || 'Hata');
    } finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm('Bu grubu silmek istiyor musunuz?')) return;
    try { await client.delete(`/groups/${id}`); load(); }
    catch { showAlert('error', 'Silinemedi'); }
  }

  function showAlert(type, msg) { setAlert({ type, msg }); setTimeout(() => setAlert(null), 3000); }

  return (
    <PanelLayout>
      <div className="panel-header">
        <div>
          <h1 className="panel-title">Gruplar</h1>
          <p className="panel-subtitle">{groups.length} grup</p>
        </div>
        <button className="btn-panel" onClick={openAdd}>+ Grup Ekle</button>
      </div>

      {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

      <div className="panel-table-wrap">
        <table className="panel-table">
          <thead>
            <tr><th>Grup Adı</th><th>Branş</th><th>Antrenör</th><th>Yaş Grubu</th><th>Öğrenci</th><th></th></tr>
          </thead>
          <tbody>
            {groups.map(g => (
              <tr key={g.id}>
                <td style={{ fontWeight: 600, color: '#f0f0f0' }}>{g.name}</td>
                <td>{g.branch_name}</td>
                <td>{g.trainer_name || <span style={{ color: '#555' }}>—</span>}</td>
                <td>{g.age_range || '—'}</td>
                <td style={{ color: '#c9a84c', fontWeight: 700 }}>{g.monthly_fee ? `${g.monthly_fee} ₺` : '—'}</td>
                <td>
                  <button
                    onClick={() => openStudents(g)}
                    style={{ background: 'none', border: 'none', color: '#00b4d8', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
                    title="Gruptaki öğrencileri gör"
                  >
                    {g.student_count} kişi
                  </button>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn-panel btn-panel-sm btn-ghost" onClick={() => openEdit(g)}>Düzenle</button>
                    <button className="btn-panel btn-panel-sm btn-danger" onClick={() => handleDelete(g.id)}>Sil</button>
                  </div>
                </td>
              </tr>
            ))}
            {groups.length === 0 && <tr><td colSpan={6} className="empty-state">Henüz grup yok</td></tr>}
          </tbody>
        </table>
      </div>

      {modal === 'form' && (
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal__title">{editId ? 'Grup Düzenle' : 'Yeni Grup'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-field col-span-2">
                  <label>Grup Adı *</label>
                  <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="örn: U12 Futbol A" />
                </div>
                <div className="form-field">
                  <label>Branş *</label>
                  <select required value={form.branch_id} onChange={e => setForm(f => ({ ...f, branch_id: e.target.value }))}>
                    <option value="">Seçiniz</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label>Antrenör</label>
                  <select value={form.trainer_id} onChange={e => setForm(f => ({ ...f, trainer_id: e.target.value }))}>
                    <option value="">Antrenör Yok</option>
                    {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label>Yaş Aralığı</label>
                  <input value={form.age_range} onChange={e => setForm(f => ({ ...f, age_range: e.target.value }))} placeholder="örn: 8-12 yaş" />
                </div>
                <div className="form-field">
                  <label>Açıklama</label>
                  <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="form-field">
                  <label>Aylık Aidat (₺)</label>
                  <input type="number" min="0" value={form.monthly_fee} onChange={e => setForm(f => ({ ...f, monthly_fee: e.target.value }))} placeholder="örn: 500" />
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

      {/* Öğrenci Listesi Modalı */}
      {studentsModal && (
        <div className="modal-backdrop" onClick={() => setStudentsModal(null)}>
          <div className="modal modal--lg" onClick={e => e.stopPropagation()}>
            <h2 className="modal__title">👦 {studentsModal.groupName} — Öğrenciler</h2>
            {studentsModal.list.length === 0 ? (
              <p style={{ color: '#666', marginTop: 12 }}>Bu grupta henüz öğrenci yok.</p>
            ) : (
              <div className="panel-table-wrap">
                <table className="panel-table">
                  <thead>
                    <tr><th>#</th><th>Ad Soyad</th><th>Doğum Tarihi</th><th>Veli</th><th>Veli Tel</th></tr>
                  </thead>
                  <tbody>
                    {studentsModal.list.map((s, i) => (
                      <tr key={s.id}>
                        <td style={{ color: '#555' }}>{i + 1}</td>
                        <td style={{ fontWeight: 600, color: '#f0f0f0' }}>{s.first_name} {s.last_name}</td>
                        <td>{s.birth_date || '—'}</td>
                        <td>{s.parent_name}</td>
                        <td>{s.parent_phone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="form-actions">
              <button className="btn-panel btn-ghost" onClick={() => setStudentsModal(null)}>Kapat</button>
            </div>
          </div>
        </div>
      )}
    </PanelLayout>
  );
}
