import { useEffect, useState } from 'react';
import PanelLayout from '../../../components/PanelLayout';
import client from '../../../api/client';

const CATEGORIES = ['Genel', 'Futbol', 'Voleybol', 'Basketbol', 'Tekerlekli Paten', 'Yüzme', 'Satranç', 'Tenis'];

const EMPTY = { title: '', category: 'Genel', summary: '', content: '', image_url: '', is_published: 1 };

export default function AdminNews() {
  const [items, setItems]   = useState([]);
  const [modal, setModal]   = useState(false);
  const [form, setForm]     = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [alert, setAlert]   = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await client.get('/news/all');
    setItems(res.data);
  }

  function openAdd()    { setForm(EMPTY); setEditId(null); setModal(true); }
  function openEdit(n)  {
    setForm({
      title: n.title, category: n.category, summary: n.summary,
      content: n.content, image_url: n.image_url, is_published: n.is_published,
    });
    setEditId(n.id);
    setModal(true);
  }

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await client.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(f => ({ ...f, image_url: res.data.url }));
    } catch { showAlert('error', 'Fotoğraf yüklenemedi.'); }
    finally { setUploading(false); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, is_published: Number(form.is_published) };
      if (editId) await client.put(`/news/${editId}`, payload);
      else        await client.post('/news', payload);
      setModal(false);
      showAlert('success', editId ? 'Haber güncellendi.' : 'Haber eklendi.');
      load();
    } catch (err) {
      showAlert('error', err.response?.data?.error || 'Kayıt hatası.');
    } finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm('Bu haberi silmek istiyor musunuz?')) return;
    try {
      await client.delete(`/news/${id}`);
      showAlert('success', 'Haber silindi.');
      load();
    } catch { showAlert('error', 'Silme hatası.'); }
  }

  async function togglePublish(n) {
    try {
      await client.put(`/news/${n.id}`, { is_published: n.is_published ? 0 : 1 });
      load();
    } catch { showAlert('error', 'Güncelleme hatası.'); }
  }

  function showAlert(type, msg) {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 3000);
  }

  return (
    <PanelLayout>
      <div className="panel-header">
        <div>
          <h1 className="panel-title">Haberler</h1>
          <p className="panel-subtitle">{items.length} haber</p>
        </div>
        <button className="btn-panel" onClick={openAdd}>+ Haber Ekle</button>
      </div>

      {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

      <div className="panel-table-wrap">
        <table className="panel-table">
          <thead>
            <tr><th>Başlık</th><th>Kategori</th><th>Tarih</th><th>Durum</th><th></th></tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={5} className="empty-state">Henüz haber eklenmemiş.</td></tr>
            )}
            {items.map(n => (
              <tr key={n.id}>
                <td style={{ fontWeight: 600, color: '#f0f0f0', maxWidth: 300 }}>
                  {n.image_url && (
                    <img src={n.image_url} alt="" style={{ width: 40, height: 30, objectFit: 'cover', borderRadius: 4, marginRight: 8, verticalAlign: 'middle' }} />
                  )}
                  {n.title}
                </td>
                <td>{n.category}</td>
                <td style={{ fontSize: '0.8rem', color: '#888' }}>{n.published_at?.slice(0, 10)}</td>
                <td>
                  <button
                    onClick={() => togglePublish(n)}
                    style={{
                      background: n.is_published ? 'rgba(76,175,80,0.15)' : 'rgba(255,152,0,0.12)',
                      color: n.is_published ? '#4caf50' : '#ff9800',
                      border: 'none', borderRadius: 20, padding: '3px 10px',
                      fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                    }}
                  >
                    {n.is_published ? 'Yayında' : 'Taslak'}
                  </button>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn-panel btn-panel-sm btn-ghost" onClick={() => openEdit(n)}>Düzenle</button>
                    <button className="btn-panel btn-panel-sm btn-danger" onClick={() => handleDelete(n.id)}>Sil</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(false)}>
          <div className="modal modal--lg" onClick={e => e.stopPropagation()}>
            <h2 className="modal__title">{editId ? 'Haber Düzenle' : 'Yeni Haber'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-field col-span-2">
                  <label>Başlık *</label>
                  <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                </div>

                <div className="form-field">
                  <label>Kategori</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="form-field">
                  <label>Yayın Durumu</label>
                  <select value={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: Number(e.target.value) }))}>
                    <option value={1}>Yayında</option>
                    <option value={0}>Taslak</option>
                  </select>
                </div>

                <div className="form-field col-span-2">
                  <label>Özet</label>
                  <textarea
                    rows={2}
                    value={form.summary}
                    onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div className="form-field col-span-2">
                  <label>İçerik</label>
                  <textarea
                    rows={4}
                    value={form.content}
                    onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div className="form-field col-span-2">
                  <label>Kapak Fotoğrafı</label>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <input
                        type="text"
                        placeholder="URL (veya aşağıdan yükleyin)"
                        value={form.image_url}
                        onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                        style={{ marginBottom: 6 }}
                      />
                      <label style={{ display: 'inline-block', cursor: 'pointer' }}>
                        <span className="btn-panel btn-panel-sm btn-ghost" style={{ fontSize: '0.8rem' }}>
                          {uploading ? 'Yükleniyor...' : '📎 Fotoğraf Yükle'}
                        </span>
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} disabled={uploading} />
                      </label>
                    </div>
                    {form.image_url && (
                      <img src={form.image_url} alt="Önizleme" style={{ width: 100, height: 70, objectFit: 'cover', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)' }} />
                    )}
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-panel btn-ghost" onClick={() => setModal(false)}>İptal</button>
                <button type="submit" className="btn-panel" disabled={saving || uploading}>
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PanelLayout>
  );
}
