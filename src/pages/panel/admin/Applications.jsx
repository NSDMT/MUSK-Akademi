import { useEffect, useState } from 'react';
import PanelLayout from '../../../components/PanelLayout';
import client from '../../../api/client';

const STATUS_LABEL = {
  pending:  { text: 'Bekliyor',  color: '#f59e0b' },
  approved: { text: 'Onaylandı', color: '#4ade80' },
  rejected: { text: 'Reddedildi', color: '#f87171' },
};

export default function AdminApplications() {
  const [apps, setApps]         = useState([]);
  const [filter, setFilter]     = useState('pending');
  const [loading, setLoading]   = useState(true);
  const [alert, setAlert]       = useState(null);
  const [detail, setDetail]     = useState(null);   // onay sonrası göster
  const [processing, setProcessing] = useState(null); // id

  useEffect(() => { load(); }, [filter]);

  async function load() {
    setLoading(true);
    try {
      const res = await client.get(`/applications${filter ? `?status=${filter}` : ''}`);
      setApps(res.data);
    } finally {
      setLoading(false);
    }
  }

  function showAlert(type, msg) {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 5000);
  }

  async function handleApprove(app) {
    if (!window.confirm(`"${app.child_name}" için başvuruyu onaylayıp veli hesabı oluşturulsun mu?`)) return;
    setProcessing(app.id);
    try {
      const res = await client.post(`/applications/${app.id}/approve`);
      setDetail(res.data);
      showAlert('success', `Hesap oluşturuldu. ${res.data.wpSent ? 'WhatsApp bildirimi gönderildi.' : 'WhatsApp gönderilemedi — bilgileri manuel iletin.'}`);
      load();
    } catch (err) {
      showAlert('error', err.response?.data?.error || 'Onaylama başarısız');
    } finally {
      setProcessing(null);
    }
  }

  async function handleReject(app) {
    const notes = window.prompt(`"${app.child_name}" için başvuruyu reddetmek istediğinizden emin misiniz?\nRet notu (isteğe bağlı):`);
    if (notes === null) return; // iptal
    setProcessing(app.id);
    try {
      await client.post(`/applications/${app.id}/reject`, { notes });
      showAlert('success', 'Başvuru reddedildi');
      load();
    } catch (err) {
      showAlert('error', err.response?.data?.error || 'İşlem başarısız');
    } finally {
      setProcessing(null);
    }
  }

  const pending  = apps.filter(a => a.status === 'pending').length;

  return (
    <PanelLayout>
      <div className="panel-header">
        <div>
          <h1 className="panel-title">Başvurular</h1>
          <p className="panel-subtitle">{pending} bekleyen başvuru</p>
        </div>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type}`} style={{ marginBottom: 16 }}>
          {alert.msg}
        </div>
      )}

      {/* Onay detay kutusu */}
      {detail && (
        <div style={{
          background: '#1a3a1a', border: '1px solid #4ade80', borderRadius: 10,
          padding: 20, marginBottom: 20, fontSize: '0.9rem', lineHeight: 1.7,
        }}>
          <strong style={{ color: '#4ade80', fontSize: '1rem' }}>✅ Hesap Oluşturuldu</strong>
          <br />
          <span style={{ color: '#ccc' }}>
            E-posta: <strong style={{ color: '#fff' }}>{detail.email}</strong>
            &nbsp;&nbsp;|&nbsp;&nbsp;
            Şifre: <strong style={{ color: '#fbbf24' }}>{detail.password}</strong>
            &nbsp;&nbsp;|&nbsp;&nbsp;
            {detail.wpSent ? '📱 WhatsApp gönderildi' : '⚠️ WhatsApp gönderilemedi — bilgileri manuel iletin'}
          </span>
          <button
            onClick={() => setDetail(null)}
            style={{ float: 'right', background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '1.1rem' }}
          >×</button>
        </div>
      )}

      {/* Filtre */}
      <div className="search-bar" style={{ marginBottom: 16 }}>
        {['pending', 'approved', 'rejected', ''].map(s => (
          <button
            key={s}
            className={`btn-panel btn-panel-sm ${filter === s ? '' : 'btn-ghost'}`}
            style={{ marginRight: 6 }}
            onClick={() => setFilter(s)}
          >
            {s === 'pending' ? 'Bekleyenler' : s === 'approved' ? 'Onaylananlar' : s === 'rejected' ? 'Reddedilenler' : 'Tümü'}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#aaa' }}>Yükleniyor…</p>
      ) : apps.length === 0 ? (
        <p style={{ color: '#aaa' }}>Bu kategoride başvuru yok.</p>
      ) : (
        <div className="panel-table-wrap">
          <table className="panel-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Sporcu</th>
                <th>Doğum Yılı</th>
                <th>Branş</th>
                <th>Veli</th>
                <th>Telefon</th>
                <th>E-posta</th>
                <th>Tarih</th>
                <th>Durum</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {apps.map(a => {
                const st = STATUS_LABEL[a.status];
                return (
                  <tr key={a.id}>
                    <td style={{ color: '#888' }}>{a.id}</td>
                    <td style={{ fontWeight: 600, color: '#f0f0f0' }}>{a.child_name}</td>
                    <td>{a.child_birth_year}</td>
                    <td><span className="badge badge-antrenor">{a.branch}</span></td>
                    <td>{a.parent_name}</td>
                    <td>{a.parent_phone}</td>
                    <td style={{ color: '#aaa' }}>{a.parent_email || '—'}</td>
                    <td style={{ color: '#888', fontSize: '0.8rem' }}>
                      {new Date(a.created_at).toLocaleDateString('tr-TR')}
                    </td>
                    <td>
                      <span style={{ color: st.color, fontWeight: 600, fontSize: '0.82rem' }}>
                        {st.text}
                      </span>
                    </td>
                    <td>
                      {a.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            className="btn-panel btn-panel-sm"
                            disabled={processing === a.id}
                            onClick={() => handleApprove(a)}
                          >
                            {processing === a.id ? '…' : 'Onayla'}
                          </button>
                          <button
                            className="btn-panel btn-panel-sm btn-danger"
                            disabled={processing === a.id}
                            onClick={() => handleReject(a)}
                          >
                            Reddet
                          </button>
                        </div>
                      )}
                      {a.status === 'rejected' && a.notes && (
                        <span style={{ color: '#888', fontSize: '0.78rem' }}>Not: {a.notes}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </PanelLayout>
  );
}
