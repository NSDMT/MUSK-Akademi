import { useEffect, useState } from 'react';
import PanelLayout from '../../../components/PanelLayout';
import client from '../../../api/client';

const emptyForm = {
  name: '',
  branch: '',
  role: '',
  photo_url: '',
  bio: '',
  display_order: 0,
  is_active: true,
};

export default function AdminTrainers() {
  const [trainers, setTrainers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | { mode:'add'|'edit', id? }
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    try {
      const [listRes, metaRes] = await Promise.all([
        client.get('/trainers/all'),
        client.get('/trainers/meta'),
      ]);
      setTrainers(listRes.data || []);
      setBranches(metaRes.data?.branches || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openAdd() {
    setForm({ ...emptyForm, branch: branches[0] || '' });
    setError('');
    setModal({ mode: 'add' });
  }

  function openEdit(t) {
    setForm({
      name: t.name || '',
      branch: t.branch || '',
      role: t.role || '',
      photo_url: t.photo_url || '',
      bio: t.bio || '',
      display_order: t.display_order ?? 0,
      is_active: t.is_active === 1,
    });
    setError('');
    setModal({ mode: 'edit', id: t.id });
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.branch.trim()) {
      setError('Antrenör adı ve branş zorunludur.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      if (modal.mode === 'add') {
        await client.post('/trainers', form);
      } else {
        await client.put(`/trainers/${modal.id}`, form);
      }
      setModal(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(t) {
    if (!window.confirm(`"${t.name}" silinecek. Emin misiniz?`)) return;
    try {
      await client.delete(`/trainers/${t.id}`);
      await load();
    } catch {
      alert('Silme işlemi başarısız.');
    }
  }

  async function toggleActive(t) {
    try {
      await client.put(`/trainers/${t.id}`, {
        name: t.name,
        branch: t.branch,
        role: t.role,
        photo_url: t.photo_url,
        bio: t.bio,
        display_order: t.display_order,
        is_active: t.is_active === 1 ? 0 : 1,
      });
      await load();
    } catch {
      alert('Güncelleme başarısız.');
    }
  }

  return (
    <PanelLayout>
      <div className="panel-page">
        <div className="panel-page__header">
          <h1>Antrenörler</h1>
          <button className="btn-primary" onClick={openAdd}>+ Antrenör Ekle</button>
        </div>

        {loading ? (
          <p>Yükleniyor...</p>
        ) : trainers.length === 0 ? (
          <div className="panel-empty">
            <p>Henüz antrenör eklenmemiş.</p>
            <button className="btn-primary" onClick={openAdd}>İlk Antrenörü Ekle</button>
          </div>
        ) : (
          <div className="panel-table-wrap">
            <table className="panel-table">
              <thead>
                <tr>
                  <th>Sıra</th>
                  <th>Fotoğraf</th>
                  <th>Ad</th>
                  <th>Branş</th>
                  <th>Unvan</th>
                  <th>Durum</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {trainers.map(t => (
                  <tr key={t.id} style={{ opacity: t.is_active ? 1 : 0.5 }}>
                    <td>{t.display_order}</td>
                    <td>
                      {t.photo_url
                        ? <img src={t.photo_url} alt={t.name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                        : <span style={{ color: 'var(--color-gray-light)', fontSize: '0.82rem' }}>Foto yok</span>
                      }
                    </td>
                    <td><strong>{t.name}</strong></td>
                    <td>{t.branch}</td>
                    <td style={{ maxWidth: 260 }}>{t.role || '—'}</td>
                    <td>
                      <button
                        className={`badge ${t.is_active ? 'badge--success' : 'badge--inactive'}`}
                        onClick={() => toggleActive(t)}
                        title="Aktif/Pasif geçiş"
                        style={{ cursor: 'pointer', border: 'none', background: 'none', padding: 0 }}
                      >
                        {t.is_active ? 'Aktif' : 'Pasif'}
                      </button>
                    </td>
                    <td>
                      <div className="panel-actions">
                        <button className="btn-sm btn-secondary" onClick={() => openEdit(t)}>Düzenle</button>
                        <button className="btn-sm btn-danger" onClick={() => handleDelete(t)}>Sil</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {modal && (
          <div className="modal-overlay" onClick={() => setModal(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal__header">
                <h2>{modal.mode === 'add' ? 'Antrenör Ekle' : 'Antrenör Düzenle'}</h2>
                <button className="modal__close" onClick={() => setModal(null)}>✕</button>
              </div>

              <form onSubmit={handleSave}>
                <div className="form-group">
                  <label>Ad Soyad *</label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="Antrenör adı" />
                </div>

                <div className="form-group">
                  <label>Branş *</label>
                  <input list="trainer-branches" name="branch" value={form.branch} onChange={handleChange} placeholder="Futbol, Voleybol..." />
                  <datalist id="trainer-branches">
                    {branches.map(b => <option key={b} value={b} />)}
                  </datalist>
                </div>

                <div className="form-group">
                  <label>Unvan / Rol</label>
                  <input name="role" value={form.role} onChange={handleChange} placeholder="Örn: UEFA C Futbol Antrenörü" />
                </div>

                <div className="form-group">
                  <label>Fotoğraf URL</label>
                  <input name="photo_url" value={form.photo_url} onChange={handleChange} placeholder="/images/trainers/ornek.jpg" />
                  {form.photo_url && (
                    <img
                      src={form.photo_url}
                      alt="önizleme"
                      style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', marginTop: 8 }}
                      onError={e => { e.currentTarget.style.display = 'none'; }}
                    />
                  )}
                </div>

                <div className="form-group">
                  <label>Kısa Biyografi</label>
                  <textarea name="bio" value={form.bio} onChange={handleChange} rows={2} placeholder="İsteğe bağlı" />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Görüntüleme Sırası</label>
                    <input name="display_order" type="number" min={0} value={form.display_order} onChange={handleChange} />
                  </div>
                  <div className="form-group" style={{ justifyContent: 'center', paddingTop: 24 }}>
                    <label className="checkbox-label">
                      <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
                      <span>Aktif (sitede göster)</span>
                    </label>
                  </div>
                </div>

                {error && <p className="form-error">{error}</p>}

                <div className="modal__footer">
                  <button type="button" className="btn-secondary" onClick={() => setModal(null)}>İptal</button>
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PanelLayout>
  );
}
