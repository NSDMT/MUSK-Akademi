import { useState } from 'react';
import PanelLayout from '../../../components/PanelLayout';
import client from '../../../api/client';

export default function ParentPassword() {
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.new_password !== form.confirm) {
      setAlert({ type: 'error', msg: 'Yeni şifreler eşleşmiyor.' });
      return;
    }
    setSaving(true);
    setAlert(null);
    try {
      await client.put('/auth/change-password', {
        current_password: form.current_password,
        new_password: form.new_password,
      });
      setAlert({ type: 'success', msg: '✅ Şifreniz başarıyla güncellendi.' });
      setForm({ current_password: '', new_password: '', confirm: '' });
    } catch (err) {
      const errList = err.response?.data?.errors;
      if (errList?.length) {
        setAlert({ type: 'error', msg: errList.map(e => e.msg).join(' • ') });
      } else {
        setAlert({ type: 'error', msg: err.response?.data?.error || 'Bir hata oluştu.' });
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <PanelLayout>
      <div className="panel-header">
        <div>
          <h1 className="panel-title">Şifremi Değiştir</h1>
          <p className="panel-subtitle">Panel giriş şifrenizi buradan güncelleyebilirsiniz.</p>
        </div>
      </div>

      {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

      <div style={{ maxWidth: 400 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="form-field">
              <label>Mevcut Şifre *</label>
              <input
                type="password"
                required
                value={form.current_password}
                onChange={e => setForm(f => ({ ...f, current_password: e.target.value }))}
                autoComplete="current-password"
              />
            </div>
            <div className="form-field">
              <label>Yeni Şifre *</label>
              <input
                type="password"
                required
                value={form.new_password}
                onChange={e => setForm(f => ({ ...f, new_password: e.target.value }))}
                autoComplete="new-password"
                placeholder="En az 8 karakter, büyük harf ve rakam içermeli"
              />
            </div>
            <div className="form-field">
              <label>Yeni Şifre Tekrar *</label>
              <input
                type="password"
                required
                value={form.confirm}
                onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                autoComplete="new-password"
              />
            </div>
          </div>
          <div style={{ marginTop: 8 }}>
            <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: 16 }}>
              Şifre kuralı: En az 8 karakter, bir büyük harf, bir küçük harf ve bir rakam içermeli.
              Örnek: <code style={{ color: '#aaa' }}>Spor2024!</code>
            </p>
            <button type="submit" className="btn-panel" disabled={saving}>
              {saving ? 'Kaydediliyor...' : '🔑 Şifreyi Güncelle'}
            </button>
          </div>
        </form>
      </div>
    </PanelLayout>
  );
}
