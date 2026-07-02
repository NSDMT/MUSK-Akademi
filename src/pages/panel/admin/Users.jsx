import { useEffect, useState } from 'react';
import PanelLayout from '../../../components/PanelLayout';
import client from '../../../api/client';

const ROLE_LABEL = { admin: 'Admin', antrenor: 'Antrenör', veli: 'Veli' };
const EMPTY = { name: '', email: '', password: '', role: 'antrenor', phone: '' };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [filterRole, setFilterRole] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await client.get('/users');
    setUsers(res.data);
  }

  function openAdd() { setForm(EMPTY); setEditId(null); setModal('form'); }
  function openEdit(u) {
    setForm({ name: u.name, email: u.email, password: '', role: u.role, phone: u.phone || '' });
    setEditId(u.id);
    setModal('form');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (editId && !payload.password) delete payload.password;
      if (editId) await client.put(`/users/${editId}`, payload);
      else await client.post('/users', payload);
      setModal(null);
      showAlert('success', editId ? 'Kullanıcı güncellendi' : 'Kullanıcı eklendi');
      load();
    } catch (err) {
      const data = err.response?.data;
      const msg = data?.error || (data?.errors?.length ? data.errors[0].msg : null) || 'Kayıt hatası';
      showAlert('error', msg);
    } finally { setSaving(false); }
  }

  async function handleDelete(u) {
    if (!confirm(`"${u.name}" kullanıcısını kalıcı olarak silmek istiyor musunuz?`)) return;
    try {
      await client.delete(`/users/${u.id}`);
      showAlert('success', 'Kullanıcı silindi');
      load();
    } catch (err) {
      showAlert('error', err.response?.data?.error || 'Silme hatası');
    }
  }

  function showAlert(type, msg) { setAlert({ type, msg }); setTimeout(() => setAlert(null), 3000); }

  const filtered = users.filter(u => !filterRole || u.role === filterRole);

  return (
    <PanelLayout>
      <div className="panel-header">
        <div>
          <h1 className="panel-title">Kullanıcılar</h1>
          <p className="panel-subtitle">{users.length} kullanıcı</p>
        </div>
        <button className="btn-panel" onClick={openAdd}>+ Kullanıcı Ekle</button>
      </div>

      {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

      <div className="search-bar">
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)}>
          <option value="">Tüm Roller</option>
          <option value="admin">Admin</option>
          <option value="antrenor">Antrenör</option>
          <option value="veli">Veli</option>
        </select>
      </div>

      <div className="panel-table-wrap">
        <table className="panel-table">
          <thead>
            <tr>
              <th>Ad</th><th>E-posta</th><th>Rol</th><th>Telefon</th><th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id}>
                <td style={{ fontWeight: 600, color: '#f0f0f0' }}>{u.name}</td>
                <td>{u.email}</td>
                <td><span className={`badge badge-${u.role}`}>{ROLE_LABEL[u.role]}</span></td>
                <td>{u.phone || '—'}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn-panel btn-panel-sm btn-ghost" onClick={() => openEdit(u)}>Düzenle</button>
                    <button className="btn-panel btn-panel-sm btn-danger" onClick={() => handleDelete(u)}>Sil</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal === 'form' && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal__title">{editId ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-field">
                  <label>Ad Soyad *</label>
                  <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="form-field">
                  <label>E-posta *</label>
                  <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="form-field">
                  <label>{editId ? 'Yeni Şifre (boş bırak = değiştirme)' : 'Şifre *'}</label>
                  <input
                    type="password"
                    required={!editId}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder={editId ? 'Değiştirmek için girin' : ''}
                  />
                  {!editId && <small style={{ color: '#888', marginTop: 4, display: 'block' }}>En az 8 karakter, büyük harf, küçük harf ve rakam içermeli. Örn: Spor2024!</small>}
                </div>
                <div className="form-field">
                  <label>Rol *</label>
                  <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                    <option value="admin">Admin</option>
                    <option value="antrenor">Antrenör</option>
                    <option value="veli">Veli</option>
                  </select>
                </div>
                <div className="form-field col-span-2">
                  <label>Telefon</label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="05XX XXX XX XX" />
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
