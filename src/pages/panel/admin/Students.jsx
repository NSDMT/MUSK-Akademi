import { useEffect, useState } from 'react';
import PanelLayout from '../../../components/PanelLayout';
import client from '../../../api/client';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-'];
const FOOT_OPTIONS = ['sağ', 'sol', 'her ikisi'];

const EMPTY = {
  first_name: '', last_name: '', tc: '', birth_date: '', parent_name: '',
  school: '', foot: '', blood_type: '', group_id: '', address: '',
  athlete_phone: '', parent_phone: '', veli_user_id: '', notes: '',
};

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [veliUsers, setVeliUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const [s, g, u] = await Promise.all([
      client.get('/students'),
      client.get('/groups'),
      client.get('/users'),
    ]);
    setStudents(s.data);
    setGroups(g.data);
    setVeliUsers(u.data.filter(u => u.role === 'veli'));
  }

  function openAdd() { setForm(EMPTY); setEditId(null); setModal('form'); }
  function openEdit(s) {
    setForm({
      first_name: s.first_name, last_name: s.last_name, tc: s.tc,
      birth_date: s.birth_date, parent_name: s.parent_name,
      school: s.school || '', foot: s.foot || '', blood_type: s.blood_type || '',
      group_id: s.group_id || '', address: s.address || '',
      athlete_phone: s.athlete_phone || '', parent_phone: s.parent_phone,
      veli_user_id: s.veli_user_id || '', notes: s.notes || '',
    });
    setEditId(s.id);
    setModal('form');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, group_id: form.group_id || null, veli_user_id: form.veli_user_id || null };
      if (editId) await client.put(`/students/${editId}`, payload);
      else        await client.post('/students', payload);
      setModal(null);
      showAlert('success', editId ? 'Öğrenci güncellendi' : 'Öğrenci eklendi');
      load();
    } catch (err) {
      showAlert('error', err.response?.data?.error || 'Kayıt hatası');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Bu öğrenciyi silmek istiyor musunuz?')) return;
    try {
      await client.delete(`/students/${id}`);
      showAlert('success', 'Öğrenci silindi');
      load();
    } catch { showAlert('error', 'Silme hatası'); }
  }

  function showAlert(type, msg) {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 3000);
  }

  const f = s => (
    `${s.first_name} ${s.last_name} ${s.tc} ${s.parent_name} ${s.school || ''}`
      .toLowerCase().includes(search.toLowerCase())
  );
  const filtered = students
    .filter(f)
    .filter(s => !filterGroup || String(s.group_id) === filterGroup);

  return (
    <PanelLayout>
      <div className="panel-header">
        <div>
          <h1 className="panel-title">Öğrenciler</h1>
          <p className="panel-subtitle">{students.length} kayıtlı öğrenci</p>
        </div>
        <button className="btn-panel" onClick={openAdd}>+ Öğrenci Ekle</button>
      </div>

      {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

      <div className="search-bar">
        <input
          placeholder="İsim, soyisim, TC ara..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select value={filterGroup} onChange={e => setFilterGroup(e.target.value)}>
          <option value="">Tüm Gruplar</option>
          {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
      </div>

      <div className="panel-table-wrap">
        <table className="panel-table">
          <thead>
            <tr>
              <th>Ad Soyad</th>
              <th>TC</th>
              <th>Doğum Tarihi</th>
              <th>Veli</th>
              <th>Veli Tel</th>
              <th>Grup</th>
              <th>Kan</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="empty-state">Öğrenci bulunamadı</td></tr>
            )}
            {filtered.map(s => (
              <tr key={s.id}>
                <td style={{ fontWeight: 600, color: '#f0f0f0' }}>{s.first_name} {s.last_name}</td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{s.tc}</td>
                <td>{s.birth_date}</td>
                <td>{s.parent_name}</td>
                <td>{s.parent_phone}</td>
                <td>{s.group_name || <span style={{ color: '#555' }}>—</span>}</td>
                <td>{s.blood_type || '—'}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn-panel btn-panel-sm btn-ghost" onClick={() => openEdit(s)}>Düzenle</button>
                    <button className="btn-panel btn-panel-sm btn-danger" onClick={() => handleDelete(s.id)}>Sil</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal === 'form' && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal modal--lg" onClick={e => e.stopPropagation()}>
            <h2 className="modal__title">{editId ? 'Öğrenci Düzenle' : 'Yeni Öğrenci'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <Field label="Adı *" required value={form.first_name} onChange={v => setForm(f => ({ ...f, first_name: v }))} />
                <Field label="Soyadı *" required value={form.last_name} onChange={v => setForm(f => ({ ...f, last_name: v }))} />
                <Field label="TC Kimlik No *" required value={form.tc} onChange={v => setForm(f => ({ ...f, tc: v }))} maxLength={11} />
                <Field label="Doğum Tarihi *" required type="date" value={form.birth_date} onChange={v => setForm(f => ({ ...f, birth_date: v }))} />
                <Field label="Anne/Baba Adı *" required value={form.parent_name} onChange={v => setForm(f => ({ ...f, parent_name: v }))} />
                <Field label="Okulu" value={form.school} onChange={v => setForm(f => ({ ...f, school: v }))} />

                <div className="form-field">
                  <label>Ayak</label>
                  <select value={form.foot} onChange={e => setForm(f => ({ ...f, foot: e.target.value }))}>
                    <option value="">Seçiniz</option>
                    {FOOT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                <div className="form-field">
                  <label>Kan Grubu</label>
                  <select value={form.blood_type} onChange={e => setForm(f => ({ ...f, blood_type: e.target.value }))}>
                    <option value="">Seçiniz</option>
                    {BLOOD_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>

                <div className="form-field">
                  <label>Grubu</label>
                  <select value={form.group_id} onChange={e => setForm(f => ({ ...f, group_id: e.target.value }))}>
                    <option value="">Grup Yok</option>
                    {groups.map(g => <option key={g.id} value={g.id}>{g.name} ({g.branch_name})</option>)}
                  </select>
                </div>

                <div className="form-field">
                  <label>Veli Hesabı</label>
                  <select value={form.veli_user_id} onChange={e => setForm(f => ({ ...f, veli_user_id: e.target.value }))}>
                    <option value="">Bağlantısız</option>
                    {veliUsers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                  </select>
                </div>

                <Field label="Sporcu Telefonu" value={form.athlete_phone} onChange={v => setForm(f => ({ ...f, athlete_phone: v }))} />
                <Field label="Veli Telefonu *" required value={form.parent_phone} onChange={v => setForm(f => ({ ...f, parent_phone: v }))} />
                <Field label="Adres" value={form.address} onChange={v => setForm(f => ({ ...f, address: v }))} className="col-span-2" />
                <Field label="Notlar" value={form.notes} onChange={v => setForm(f => ({ ...f, notes: v }))} className="col-span-2" />
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

function Field({ label, required, type = 'text', value, onChange, className, maxLength }) {
  return (
    <div className={`form-field${className ? ' ' + className : ''}`}>
      <label>{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        maxLength={maxLength}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}
