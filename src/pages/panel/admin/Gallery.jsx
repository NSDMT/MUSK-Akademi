import { useEffect, useState } from 'react';
import PanelLayout from '../../../components/PanelLayout';
import client from '../../../api/client';

const CATEGORIES = ['Futbol', 'Voleybol', 'Basketbol', 'Tekerlekli Paten', 'Yüzme', 'Satranç', 'Tenis', 'Genel'];

const EMPTY = { category: 'Genel', caption: '', image_url: '', display_order: 0, is_active: 1 };

export default function AdminGallery() {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filterCat, setFilterCat] = useState('');
  const [alert, setAlert] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await client.get('/gallery/all');
    setItems(res.data);
  }

  function openAdd() { setForm(EMPTY); setEditId(null); setModal(true); }
  function openEdit(g) {
    setForm({ category: g.category, caption: g.caption, image_url: g.image_url, display_order: g.display_order, is_active: g.is_active });
    setEditId(g.id);
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
      const payload = { ...form, display_order: Number(form.display_order), is_active: Number(form.is_active) };
      if (editId) await client.put(`/gallery/${editId}`, payload);
      else await client.post('/gallery', payload);
      setModal(false);
      showAlert('success', editId ? 'Güncellendi.' : 'Fotoğraf eklendi.');
      load();
    } catch (err) {
      showAlert('error', err.response?.data?.error || 'Kayıt hatası.');
    } finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm('Bu fotoğrafı silmek istiyor musunuz?')) return;
    try {
      await client.delete(`/gallery/${id}`);
      showAlert('success', 'Fotoğraf silindi.');
      load();
    } catch { showAlert('error', 'Silme hatası.'); }
  }

  async function toggleActive(g) {
    try {
      await client.put(`/gallery/${g.id}`, { is_active: g.is_active ? 0 : 1 });
      load();
    } catch { showAlert('error', 'Güncelleme hatası.'); }
  }

  function showAlert(type, msg) {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 3000);
  }

  const filtered = filterCat ? items.filter(g => g.category === filterCat) : items;

  return (
    <PanelLayout>
      <div className="panel-header">
        <div>
          <h1 className="panel-title">Galeri</h1>
          <p className="panel-subtitle">{items.length} fotoğraf</p>
        </div>
        <button className="btn-panel" onClick={openAdd}>+ Fotoğraf Ekle</button>
      </div>

      {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

      <div className="search-bar">
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="">Tüm Kategoriler</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Photo grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginTop: 16 }}>
        {filtered.length === 0 && (
          <p style={{ color: '#555', gridColumn: '1/-1' }}>Henüz fotoğraf eklenmemiş.</p>
        )}
        {filtered.map(g => (
          <div key={g.id} style={{
            background: '#161616',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 10,
            overflow: 'hidden',
            opacity: g.is_active ? 1 : 0.5,
          }}>
            <div style={{ position: 'relative', paddingBottom: '66%', background: '#0d0d0d' }}>
              <img
                src={g.image_url}
                alt={g.caption}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ padding: '10px 12px' }}>
              <div style={{ fontSize: '0.75rem', color: '#00b4d8', fontWeight: 700, marginBottom: 2 }}>{g.category}</div>
              <div style={{ fontSize: '0.8rem', color: '#bbb', marginBottom: 8 }}>{g.caption || <em style={{ color: '#444' }}>Alt yazı yok</em>}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button
                  onClick={() => toggleActive(g)}
                  style={{
                    background: g.is_active ? 'rgba(76,175,80,0.15)' : 'rgba(255,152,0,0.12)',
                    color: g.is_active ? '#4caf50' : '#ff9800',
                    border: 'none', borderRadius: 12, padding: '2px 8px',
                    fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  {g.is_active ? 'Aktif' : 'Gizli'}
                </button>
                <button className="btn-panel btn-panel-sm btn-ghost" style={{ fontSize: '0.7rem', padding: '2px 8px' }} onClick={() => openEdit(g)}>Düzenle</button>
                <button className="btn-panel btn-panel-sm btn-danger" style={{ fontSize: '0.7rem', padding: '2px 8px' }} onClick={() => handleDelete(g.id)}>Sil</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal__title">{editId ? 'Fotoğraf Düzenle' : 'Yeni Fotoğraf Ekle'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-field">
                  <label>Kategori *</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="form-field">
                  <label>Görüntüleme Sırası</label>
                  <input
                    type="number"
                    min={0}
                    value={form.display_order}
                    onChange={e => setForm(f => ({ ...f, display_order: e.target.value }))}
                  />
                </div>

                <div className="form-field col-span-2">
                  <label>Alt Yazı</label>
                  <input value={form.caption} onChange={e => setForm(f => ({ ...f, caption: e.target.value }))} placeholder="Fotoğraf açıklaması" />
                </div>

                <div className="form-field col-span-2">
                  <label>Fotoğraf *</label>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <input
                        type="text"
                        placeholder="URL veya aşağıdan yükleyin"
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

                <div className="form-field">
                  <label>Durum</label>
                  <select value={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: Number(e.target.value) }))}>
                    <option value={1}>Aktif (galeride görünür)</option>
                    <option value={0}>Gizli</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-panel btn-ghost" onClick={() => setModal(false)}>İptal</button>
                <button type="submit" className="btn-panel" disabled={saving || uploading || !form.image_url}>
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
