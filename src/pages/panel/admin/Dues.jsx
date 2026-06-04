import { useEffect, useState } from 'react';
import PanelLayout from '../../../components/PanelLayout';
import client from '../../../api/client';

const MONTHS = ['', 'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
                'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

const STATUS_MAP = {
  pending: { label: 'Bekliyor',  color: '#ff9800', bg: 'rgba(255,152,0,0.12)' },
  paid:    { label: 'Ödendi',    color: '#4caf50', bg: 'rgba(76,175,80,0.12)' },
  waived:  { label: 'Muaf',      color: '#9e9e9e', bg: 'rgba(158,158,158,0.12)' },
  overdue: { label: 'Gecikmiş', color: '#f44336', bg: 'rgba(244,67,54,0.12)' },
};

const now = new Date();

export default function AdminDues() {
  const [dues, setDues]         = useState([]);
  const [groups, setGroups]     = useState([]);
  const [summary, setSummary]   = useState(null);
  const [alert, setAlert]       = useState(null);

  // Filtreler
  const [filterGroup, setFilterGroup] = useState('');
  const [filterYear,  setFilterYear]  = useState(String(now.getFullYear()));
  const [filterMonth, setFilterMonth] = useState(String(now.getMonth() + 1));
  const [filterStatus, setFilterStatus] = useState('');

  // Aidat oluşturma formu
  const [genGroup,  setGenGroup]  = useState('');
  const [genYear,   setGenYear]   = useState(String(now.getFullYear()));
  const [genMonth,  setGenMonth]  = useState(String(now.getMonth() + 1));
  const [genAmount, setGenAmount] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    client.get('/groups').then(r => setGroups(r.data));
  }, []);

  useEffect(() => { loadDues(); }, [filterGroup, filterYear, filterMonth, filterStatus]);

  async function loadDues() {
    const params = new URLSearchParams();
    if (filterGroup)  params.set('group_id', filterGroup);
    if (filterYear)   params.set('year', filterYear);
    if (filterMonth)  params.set('month', filterMonth);
    if (filterStatus) params.set('status', filterStatus);
    const res = await client.get(`/dues?${params}`);
    setDues(res.data);

    if (filterGroup && filterYear && filterMonth) {
      const s = await client.get(`/dues/summary?${params}`);
      setSummary(s.data);
    } else {
      setSummary(null);
    }
  }

  async function generate() {
    if (!genGroup || !genYear || !genMonth) return showAlert('error', 'Grup, yıl ve ay seçin');
    setGenerating(true);
    try {
      const res = await client.post('/dues/generate', {
        group_id: parseInt(genGroup),
        year: parseInt(genYear),
        month: parseInt(genMonth),
        amount: genAmount ? parseInt(genAmount) : undefined,
      });
      showAlert('success', `${res.data.month_label}: ${res.data.created} aidat oluşturuldu, ${res.data.skipped} zaten mevcut`);
      loadDues();
    } catch (err) {
      showAlert('error', err.response?.data?.error || 'Hata');
    } finally { setGenerating(false); }
  }

  async function markPaid(id) {
    try {
      await client.put(`/dues/${id}`, { status: 'paid' });
      showAlert('success', 'Nakit ödeme kaydedildi');
      loadDues();
    } catch { showAlert('error', 'Güncelleme hatası'); }
  }

  async function markWaived(id) {
    try {
      await client.put(`/dues/${id}`, { status: 'waived' });
      loadDues();
    } catch { showAlert('error', 'Güncelleme hatası'); }
  }

  async function markOverdue() {
    try {
      const res = await client.post('/dues/bulk-status');
      showAlert('success', `${res.data.updated} aidat gecikmiş olarak işaretlendi`);
      loadDues();
    } catch { showAlert('error', 'Hata'); }
  }

  async function deleteDue(id) {
    if (!confirm('Bu aidat kaydını silmek istiyor musunuz?')) return;
    try {
      await client.delete(`/dues/${id}`);
      loadDues();
    } catch (err) {
      showAlert('error', err.response?.data?.error || 'Silinemedi');
    }
  }

  function showAlert(type, msg) { setAlert({ type, msg }); setTimeout(() => setAlert(null), 4000); }

  const totalAmount = dues.reduce((s, d) => s + d.amount, 0);

  return (
    <PanelLayout>
      <div className="panel-header">
        <div>
          <h1 className="panel-title">Aidat Yönetimi</h1>
          <p className="panel-subtitle">Aidat oluştur, takip et, ödemeleri kaydet</p>
        </div>
        <button className="btn-panel btn-ghost btn-panel-sm" onClick={markOverdue}>
          ⚠️ Gecikmeleri Güncelle
        </button>
      </div>

      {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

      {/* Aidat Oluşturma Kutusu */}
      <div style={{
        background: '#161616', border: '1px solid rgba(201,168,76,0.2)',
        borderRadius: 12, padding: 20, marginBottom: 24,
      }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '0.95rem', color: '#c9a84c' }}>
          📋 Aidat Oluştur
        </h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-field" style={{ minWidth: 180 }}>
            <label>Grup *</label>
            <select value={genGroup} onChange={e => {
              setGenGroup(e.target.value);
              const g = groups.find(g => String(g.id) === e.target.value);
              if (g?.monthly_fee) setGenAmount(String(g.monthly_fee));
            }}>
              <option value="">Seçiniz</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <div className="form-field" style={{ minWidth: 80 }}>
            <label>Yıl *</label>
            <select value={genYear} onChange={e => setGenYear(e.target.value)}>
              {[2024,2025,2026,2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="form-field" style={{ minWidth: 110 }}>
            <label>Ay *</label>
            <select value={genMonth} onChange={e => setGenMonth(e.target.value)}>
              {MONTHS.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
            </select>
          </div>
          <div className="form-field" style={{ minWidth: 120 }}>
            <label>Tutar (₺) — boş bırakılırsa grup ücreti</label>
            <input
              type="number" min="0" value={genAmount}
              onChange={e => setGenAmount(e.target.value)}
              placeholder="Otomatik"
            />
          </div>
          <button className="btn-panel" style={{ marginBottom: 1 }} onClick={generate} disabled={generating}>
            {generating ? 'Oluşturuluyor...' : '+ Aidat Oluştur'}
          </button>
        </div>
      </div>

      {/* Filtreler */}
      <div className="search-bar">
        <select value={filterGroup} onChange={e => setFilterGroup(e.target.value)}>
          <option value="">Tüm Gruplar</option>
          {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        <select value={filterYear} onChange={e => setFilterYear(e.target.value)}>
          <option value="">Tüm Yıllar</option>
          {[2024,2025,2026,2027].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
          <option value="">Tüm Aylar</option>
          {MONTHS.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Tüm Durumlar</option>
          <option value="pending">Bekliyor</option>
          <option value="paid">Ödendi</option>
          <option value="overdue">Gecikmiş</option>
          <option value="waived">Muaf</option>
        </select>
      </div>

      {/* Özet kartlar */}
      {summary && (
        <div className="stat-grid" style={{ marginBottom: 20 }}>
          {[
            { icon: '✅', value: summary.paid_count,    label: 'Ödendi',    sub: `${summary.collected_amount} ₺` },
            { icon: '⏳', value: summary.pending_count, label: 'Bekliyor',  sub: `${summary.pending_amount} ₺` },
            { icon: '🔴', value: summary.overdue_count, label: 'Gecikmiş',  sub: '' },
            { icon: '🚫', value: summary.waived_count,  label: 'Muaf',      sub: '' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-card__icon">{s.icon}</div>
              <div className="stat-card__value">{s.value ?? 0}</div>
              <div className="stat-card__label">{s.label}{s.sub ? ` · ${s.sub}` : ''}</div>
            </div>
          ))}
        </div>
      )}

      {dues.length > 0 && (
        <p style={{ color: '#555', fontSize: '0.8rem', marginBottom: 10 }}>
          {dues.length} kayıt · Toplam: {totalAmount} ₺
        </p>
      )}

      {/* Tablo */}
      <div className="panel-table-wrap">
        <table className="panel-table">
          <thead>
            <tr>
              <th>Öğrenci</th><th>Grup</th><th>Dönem</th><th>Tutar</th><th>Durum</th><th>Veli Tel</th><th></th>
            </tr>
          </thead>
          <tbody>
            {dues.length === 0 && (
              <tr><td colSpan={7} className="empty-state">Kayıt bulunamadı</td></tr>
            )}
            {dues.map(d => {
              const st = STATUS_MAP[d.status] || STATUS_MAP.pending;
              return (
                <tr key={d.id}>
                  <td style={{ fontWeight: 600, color: '#f0f0f0' }}>{d.first_name} {d.last_name}</td>
                  <td>{d.group_name}</td>
                  <td><span className="day-badge">{MONTHS[d.month]} {d.year}</span></td>
                  <td style={{ color: '#c9a84c', fontWeight: 700 }}>{d.amount} ₺</td>
                  <td>
                    <span style={{
                      background: st.bg, color: st.color,
                      borderRadius: 20, padding: '3px 10px',
                      fontSize: '0.75rem', fontWeight: 700,
                    }}>{st.label}</span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#888' }}>{d.parent_phone}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 5 }}>
                      {d.status !== 'paid' && d.status !== 'waived' && (
                        <button className="btn-panel btn-panel-sm" style={{ background: '#4caf50', color: '#000', fontSize: '0.75rem' }} onClick={() => markPaid(d.id)}>
                          Nakit Ödendi
                        </button>
                      )}
                      {d.status !== 'waived' && d.status !== 'paid' && (
                        <button className="btn-panel btn-panel-sm btn-ghost" style={{ fontSize: '0.75rem' }} onClick={() => markWaived(d.id)}>
                          Muaf
                        </button>
                      )}
                      {d.status !== 'paid' && (
                        <button className="btn-panel btn-panel-sm btn-danger" style={{ fontSize: '0.75rem' }} onClick={() => deleteDue(d.id)}>
                          Sil
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </PanelLayout>
  );
}
