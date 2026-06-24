import { useEffect, useState } from 'react';
import PanelLayout from '../../../components/PanelLayout';
import client from '../../../api/client';

const emptyForm = { name: '', website: '', logo_url: '', description: '', display_order: 0, is_active: true };

export default function AdminSponsors() {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | { mode:'add'|'edit', data }
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    try {
      const res = await client.get('/sponsors/all');
      setSponsors(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openAdd() {
    setForm(emptyForm);
    setError('');
    setModal({ mode: 'add' });
  }

  function openEdit(s) {
    setForm({
      name: s.name,
      website: s.website || '',
      logo_url: s.logo_url || '',
      description: s.description || '',
      display_order: s.display_order ?? 0,
      is_active: s.is_active === 1,
    });
    setError('');
    setModal({ mode: 'edit', id: s.id });
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Sponsor adı gereklidir.'); return; }
    setSaving(true);
    setError('');
    try {
      if (modal.mode === 'add') {
        await client.post('/sponsors', form);
      } else {
        await client.put(`/sponsors/${modal.id}`, form);
      }
      setModal(null);
      load();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`"${name}" silinecek. Emin misiniz?`)) return;
    try {
      await client.delete(`/sponsors/${id}`);
      load();
    } catch {
      alert('Silme işlemi başarısız.');
    }
  }

  async function toggleActive(s) {
    try {
      await client.put(`/sponsors/${s.id}`, {
        name: s.name, website: s.website, logo_url: s.logo_url,
        description: s.description, display_order: s.display_order,
        is_active: s.is_active === 1 ? 0 : 1,
      });
      load();
    } catch { alert('Güncelleme başarısız.'); }
  }

  return (
    <PanelLayout>
      <div className="panel-page">
        <div className="panel-page__header">
          <h1>Sponsorlarımız</h1>
          <button className="btn-primary" onClick={openAdd}>+ Sponsor Ekle</button>
        </div>

        {loading ? (
          <p>Yükleniyor…</p>
        ) : sponsors.length === 0 ? (
          <div className="panel-empty">
            <p>Henüz sponsor eklenmemiş.</p>
            <button className="btn-primary" onClick={openAdd}>İlk Sponsoru Ekle</button>
          </div>
        ) : (
          <div className="panel-table-wrap">
            <table className="panel-table">
              <thead>
                <tr>
                  <th>Sıra</th>
                  <th>Logo</th>
                  <th>Ad</th>
                  <th>Web Sitesi</th>
                  <th>Açıklama</th>
                  <th>Durum</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {sponsors.map(s => (
                  <tr key={s.id} style={{ opacity: s.is_active ? 1 : 0.5 }}>
                    <td>{s.display_order}</td>
                    <td>
                      {s.logo_url
                        ? <img src={s.logo_url} alt={s.name} style={{ height: 40, objectFit: 'contain', background: '#fff', borderRadius: 4, padding: 2 }} />
                        : <span style={{ color: 'var(--color-gray-light)', fontSize: '0.8rem' }}>Logo yok</span>
                      }
                    </td>
                    <td><strong>{s.name}</strong></td>
                    <td>
                      {s.website
                        ? <a href={s.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-gold)' }}>{s.website}</a>
                        : '—'
                      }
                    </td>
                    <td style={{ maxWidth: 200, fontSize: '0.82rem' }}>{s.description || '—'}</td>
                    <td>
                      <button
                        className={`badge ${s.is_active ? 'badge--success' : 'badge--inactive'}`}
                        onClick={() => toggleActive(s)}
                        title="Aktif/Pasif geçiş"
                        style={{ cursor: 'pointer', border: 'none', background: 'none', padding: 0 }}
                      >
                        {s.is_active ? 'Aktif' : 'Pasif'}
                      </button>
                    </td>
                    <td>
                      <div className="panel-actions">
                        <button className="btn-sm btn-secondary" onClick={() => openEdit(s)}>Düzenle</button>
                        <button className="btn-sm btn-danger" onClick={() => handleDelete(s.id, s.name)}>Sil</button>
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
                <h2>{modal.mode === 'add' ? 'Sponsor Ekle' : 'Sponsor Düzenle'}</h2>
                <button className="modal__close" onClick={() => setModal(null)}>✕</button>
              </div>
              <form onSubmit={handleSave}>
                <div className="form-group">
                  <label>Sponsor Adı *</label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="Firma / kişi adı" />
                </div>
                <div className="form-group">
                  <label>Web Sitesi</label>
                  <input name="website" value={form.website} onChange={handleChange} placeholder="https://ornek.com" type="url" />
                </div>
                <div className="form-group">
                  <label>Logo URL</label>
                  <input name="logo_url" value={form.logo_url} onChange={handleChange} placeholder="https://... veya /images/sponsor-logo.png" />
                  {form.logo_url && (
                    <img src={form.logo_url} alt="önizleme" style={{ height: 50, marginTop: 8, objectFit: 'contain', background: '#fff', borderRadius: 4, padding: 4 }} onError={e => e.target.style.display='none'} />
                  )}
                </div>
                <div className="form-group">
                  <label>Açıklama</label>
                  <textarea name="description" value={form.description} onChange={handleChange} rows={2} placeholder="Kısa açıklama (isteğe bağlı)" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Görüntüleme Sırası</label>
                    <input name="display_order" type="number" min={0} value={form.display_order} onChange={handleChange} />
                    <small style={{ color: 'var(--color-gray-light)', fontSize: '0.75rem' }}>Küçük sayı = önce gösterilir</small>
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
                    {saving ? 'Kaydediliyor…' : 'Kaydet'}
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
