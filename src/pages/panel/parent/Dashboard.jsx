import { useEffect, useState, useRef } from 'react';
import PanelLayout from '../../../components/PanelLayout';
import { useAuth } from '../../../context/AuthContext';
import client from '../../../api/client';

const ATT_MAP = {
  present: { label: 'Geldi',     color: '#4caf50', bg: 'rgba(76,175,80,0.12)' },
  absent:  { label: 'Gelmedi',   color: '#f44336', bg: 'rgba(244,67,54,0.12)' },
  late:    { label: 'GeÃ§ Geldi', color: '#ff9800', bg: 'rgba(255,152,0,0.12)' },
  excused: { label: 'Ä°zinli',    color: '#9e9e9e', bg: 'rgba(158,158,158,0.12)' },
};

const DUE_STATUS = {
  pending: { label: 'Bekliyor',  color: '#ff9800', bg: 'rgba(255,152,0,0.12)' },
  paid:    { label: 'Ã–dendi',    color: '#4caf50', bg: 'rgba(76,175,80,0.12)' },
  waived:  { label: 'Muaf',      color: '#9e9e9e', bg: 'rgba(158,158,158,0.12)' },
  overdue: { label: 'GecikmiÅŸ', color: '#f44336', bg: 'rgba(244,67,54,0.12)' },
};

const MONTHS = ['', 'Ocak', 'Åubat', 'Mart', 'Nisan', 'MayÄ±s', 'Haziran',
                'Temmuz', 'AÄŸustos', 'EylÃ¼l', 'Ekim', 'KasÄ±m', 'AralÄ±k'];

export default function ParentDashboard() {
  const { user } = useAuth();
  const [students, setStudents]     = useState([]);
  const [selected, setSelected]     = useState(null);
  const [history, setHistory]       = useState([]);
  const [dues, setDues]             = useState([]);
  const [loadingHist, setLoadingH]  = useState(false);

  // Ã–deme modal state
  const [payModal, setPayModal]     = useState(false);
  const [selectedDues, setSelDues]  = useState([]);
  const [payerName,  setPayerName]  = useState(user?.name || '');
  const [payerEmail, setPayerEmail] = useState(user?.email || '');
  const [payerPhone, setPayerPhone] = useState(user?.phone || '');
  const [paying, setPaying]         = useState(false);
  const [payAlert, setPayAlert]     = useState(null);
  const [checkoutHtml, setCheckoutHtml] = useState('');
  const checkoutRef = useRef(null);

  useEffect(() => {
    client.get('/students').then(res => {
      setStudents(res.data);
      if (res.data.length > 0) selectStudent(res.data[0]);
    });
  }, []);

  async function selectStudent(s) {
    setSelected(s);
    setLoadingH(true);
    try {
      const [att, d] = await Promise.all([
        client.get(`/attendance/student/${s.id}`),
        client.get(`/dues?student_id=${s.id}`),
      ]);
      setHistory(att.data);
      setDues(d.data);
    } finally { setLoadingH(false); }
  }

  // Ã–deme baÅŸlat
  async function initiatePayment() {
    if (selectedDues.length === 0) return;
    setPaying(true);
    setPayAlert(null);
    try {
      const res = await client.post('/payments/initiate', {
        dues_ids: selectedDues,
        payer_name: payerName,
        payer_email: payerEmail,
        payer_phone: payerPhone,
      });

      const html = res.data.checkoutFormContent;
      setCheckoutHtml(html);

      // iyzico (veya mock) form eventi dinle
      function onResult(e) {
        document.removeEventListener('iyzicoCheckoutFormResult', onResult);
        verifyPayment(res.data.token, e.detail?.status === 'success');
      }
      document.addEventListener('iyzicoCheckoutFormResult', onResult);
    } catch (err) {
      setPayAlert({ type: 'error', msg: err.response?.data?.error || 'Ã–deme baÅŸlatÄ±lamadÄ±' });
    } finally { setPaying(false); }
  }

  // Ã–deme doÄŸrula
  async function verifyPayment(token, expectSuccess) {
    try {
      const res = await client.post('/payments/verify', { token });
      if (res.data.success) {
        setPayAlert({ type: 'success', msg: 'âœ… Ã–deme baÅŸarÄ±yla tamamlandÄ±!' });
        setCheckoutHtml('');
        setPayModal(false);
        setSelDues([]);
        selectStudent(selected); // dues listesini yenile
      } else {
        setPayAlert({ type: 'error', msg: 'âŒ Ã–deme baÅŸarÄ±sÄ±z: ' + (res.data.error || '') });
        setCheckoutHtml('');
      }
    } catch {
      setPayAlert({ type: 'error', msg: 'DoÄŸrulama hatasÄ±' });
      setCheckoutHtml('');
    }
  }

  // Checkout HTML enjekte et
  useEffect(() => {
    if (checkoutHtml && checkoutRef.current) {
      checkoutRef.current.innerHTML = checkoutHtml;
      // Script taglarÄ±nÄ± Ã§alÄ±ÅŸtÄ±r
      checkoutRef.current.querySelectorAll('script').forEach(old => {
        const s = document.createElement('script');
        s.textContent = old.textContent;
        old.parentNode.replaceChild(s, old);
      });
    }
  }, [checkoutHtml]);

  const pendingDues = dues.filter(d => d.status === 'pending' || d.status === 'overdue');
  const totalPending = pendingDues.reduce((s, d) => s + d.amount, 0);
  const totalSelected = dues.filter(d => selectedDues.includes(d.id)).reduce((s, d) => s + d.amount, 0);

  const presentPct = history.length
    ? Math.round((history.filter(h => h.status === 'present' || h.status === 'late').length / history.length) * 100)
    : 0;

  return (
    <PanelLayout>
      {students.length === 0 && (
        <div className="empty-state">
          <div style={{ fontSize: '3rem' }}>ğŸ‘¶</div>
          <p>HesabÄ±nÄ±za baÄŸlÄ± sporcu bulunamadÄ±.</p>
        </div>
      )}

      {students.length > 1 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {students.map(s => (
            <button key={s.id} onClick={() => selectStudent(s)} style={{
              background: selected?.id === s.id ? 'rgba(201,168,76,0.15)' : '#161616',
              border: `1px solid ${selected?.id === s.id ? '#c9a84c' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 8, padding: '8px 16px',
              color: selected?.id === s.id ? '#c9a84c' : '#999',
              fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem',
            }}>
              {s.first_name} {s.last_name}
            </button>
          ))}
        </div>
      )}

      {selected && (
        <>
          {/* Sporcu Bilgi KartÄ± */}
          <div style={{
            background: '#161616', border: '1px solid rgba(201,168,76,0.15)',
            borderRadius: 14, padding: 24, marginBottom: 24,
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16,
          }}>
            {[
              { l: 'Ad Soyad',     v: `${selected.first_name} ${selected.last_name}` },
              { l: 'DoÄŸum Tarihi', v: selected.birth_date },
              { l: 'Kan Grubu',    v: selected.blood_type || 'â€”' },
              { l: 'Ayak',         v: selected.foot || 'â€”' },
              { l: 'Okul',         v: selected.school || 'â€”' },
              { l: 'Grup',         v: selected.group_name || 'â€”' },
              { l: 'BranÅŸ',        v: selected.branch_name || 'â€”' },
              { l: 'Sporcu Tel',   v: selected.athlete_phone || 'â€”' },
            ].map(item => (
              <div key={item.l}>
                <div style={{ fontSize: '0.7rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>{item.l}</div>
                <div style={{ color: '#e0e0e0', fontWeight: 600, fontSize: '0.9rem' }}>{item.v}</div>
              </div>
            ))}
          </div>

          {/* === AÄ°DAT BÃ–LÃœMÃœ === */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#ddd', margin: 0 }}>Aidat Durumu</h2>
              {pendingDues.length > 0 && (
                <button className="btn-panel" style={{ fontSize: '0.875rem' }} onClick={() => { setSelDues(pendingDues.map(d => d.id)); setPayModal(true); }}>
                  ğŸ’³ Online Ã–de ({totalPending} â‚º)
                </button>
              )}
            </div>

            {payAlert && <div className={`alert alert-${payAlert.type}`} style={{ marginBottom: 12 }}>{payAlert.msg}</div>}

            {dues.length === 0 ? (
              <p style={{ color: '#555', fontSize: '0.875rem' }}>Aidat kaydÄ± bulunamadÄ±.</p>
            ) : (
              <div className="panel-table-wrap">
                <table className="panel-table">
                  <thead>
                    <tr><th>DÃ¶nem</th><th>Tutar</th><th>Durum</th><th></th></tr>
                  </thead>
                  <tbody>
                    {dues.map(d => {
                      const st = DUE_STATUS[d.status] || DUE_STATUS.pending;
                      const canPay = d.status === 'pending' || d.status === 'overdue';
                      return (
                        <tr key={d.id}>
                          <td style={{ fontWeight: 600 }}>{MONTHS[d.month]} {d.year}</td>
                          <td style={{ color: '#c9a84c', fontWeight: 700 }}>{d.amount} â‚º</td>
                          <td>
                            <span style={{ background: st.bg, color: st.color, borderRadius: 20, padding: '3px 10px', fontSize: '0.75rem', fontWeight: 700 }}>
                              {st.label}
                            </span>
                          </td>
                          <td>
                            {canPay && (
                              <button className="btn-panel btn-panel-sm" style={{ fontSize: '0.75rem' }}
                                onClick={() => { setSelDues([d.id]); setPayModal(true); }}>
                                Ã–de
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Devam istatistiÄŸi */}
          {history.length > 0 && (
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
              <div className="stat-card" style={{ flex: '0 0 auto' }}>
                <div className="stat-card__value">{presentPct}%</div>
                <div className="stat-card__label">Devam OranÄ±</div>
              </div>
              <div className="stat-card" style={{ flex: '0 0 auto' }}>
                <div className="stat-card__value">{history.filter(h => h.status === 'absent').length}</div>
                <div className="stat-card__label">DevamsÄ±zlÄ±k</div>
              </div>
              <div className="stat-card" style={{ flex: '0 0 auto' }}>
                <div className="stat-card__value">{history.length}</div>
                <div className="stat-card__label">Toplam Ders</div>
              </div>
            </div>
          )}

          {/* Yoklama geÃ§miÅŸi */}
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#ddd', marginBottom: 14 }}>Yoklama GeÃ§miÅŸi</h2>
          {loadingHist && <p style={{ color: '#555' }}>YÃ¼kleniyor...</p>}
          {!loadingHist && history.length === 0 && <p style={{ color: '#555', fontSize: '0.875rem' }}>HenÃ¼z yoklama kaydÄ± yok.</p>}
          {history.length > 0 && (
            <div className="panel-table-wrap">
              <table className="panel-table">
                <thead>
                  <tr><th>Tarih</th><th>BranÅŸ</th><th>Grup</th><th>Saat</th><th>Durum</th></tr>
                </thead>
                <tbody>
                  {history.map(h => {
                    const st = ATT_MAP[h.status] || ATT_MAP.absent;
                    return (
                      <tr key={h.id}>
                        <td style={{ fontWeight: 600 }}>{h.date}</td>
                        <td>{h.branch_name}</td>
                        <td>{h.group_name}</td>
                        <td>{h.start_time} â€“ {h.end_time}</td>
                        <td>
                          <span style={{ background: st.bg, color: st.color, borderRadius: 20, padding: '3px 10px', fontSize: '0.75rem', fontWeight: 700 }}>
                            {st.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* === Ã–DEME MODALI === */}
      {payModal && (
        <div className="modal-backdrop" onClick={() => { if (!checkoutHtml) { setPayModal(false); setCheckoutHtml(''); } }}>
          <div className="modal modal--lg" onClick={e => e.stopPropagation()}>
            {!checkoutHtml ? (
              <>
                <h2 className="modal__title">ğŸ’³ Aidat Ã–demesi</h2>
                <p style={{ color: '#888', fontSize: '0.875rem', marginBottom: 20 }}>
                  Ã–denecek: <strong style={{ color: '#c9a84c' }}>{totalSelected} â‚º</strong>
                  {' '}({selectedDues.length} aidat)
                </p>
                <div className="form-grid">
                  <div className="form-field col-span-2">
                    <label>Ad Soyad *</label>
                    <input value={payerName} onChange={e => setPayerName(e.target.value)} required />
                  </div>
                  <div className="form-field">
                    <label>E-posta *</label>
                    <input type="email" value={payerEmail} onChange={e => setPayerEmail(e.target.value)} required />
                  </div>
                  <div className="form-field">
                    <label>Telefon *</label>
                    <input value={payerPhone} onChange={e => setPayerPhone(e.target.value)} placeholder="05XX XXX XX XX" required />
                  </div>
                </div>
                {payAlert && <div className={`alert alert-${payAlert.type}`} style={{ marginTop: 12 }}>{payAlert.msg}</div>}
                <div className="form-actions">
                  <button className="btn-panel btn-ghost" onClick={() => setPayModal(false)}>Ä°ptal</button>
                  <button className="btn-panel" onClick={initiatePayment} disabled={paying || !payerName || !payerEmail || !payerPhone}>
                    {paying ? 'YÃ¶nlendiriliyor...' : `${totalSelected} â‚º Ã–de`}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="modal__title">Ã–deme Formu</h2>
                <div ref={checkoutRef} style={{ minHeight: 300 }} />
                <button className="btn-panel btn-ghost btn-panel-sm" style={{ marginTop: 16 }}
                  onClick={() => { setCheckoutHtml(''); }}>
                  â† Geri
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </PanelLayout>
  );
}

