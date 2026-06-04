import { useEffect, useState } from 'react';
import PanelLayout from '../../../components/PanelLayout';
import client from '../../../api/client';

const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

const STATUS_OPTS = [
  { key: 'present', label: 'Geldi',    color: '#4caf50' },
  { key: 'absent',  label: 'Gelmedi',  color: '#f44336' },
  { key: 'late',    label: 'Geç Geldi',color: '#ff9800' },
  { key: 'excused', label: 'İzinli',   color: '#9e9e9e' },
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function CoachDashboard() {
  const [schedule, setSchedule]       = useState([]);
  const [activeSession, setActive]    = useState(null);
  const [date, setDate]               = useState(today());
  const [attendance, setAttendance]   = useState([]); // [{ student_id, status, notes, ... }]
  const [saving, setSaving]           = useState(false);
  const [alert, setAlert]             = useState(null);
  const [smsResults, setSmsResults]   = useState([]);

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await client.get('/schedule');
    setSchedule(res.data);
  }

  async function openSession(session, selectedDate) {
    setActive(session);
    setDate(selectedDate || today());
    setSmsResults([]);
    await loadAttendance(session.id, selectedDate || today());
  }

  async function loadAttendance(scheduleId, d) {
    const res = await client.get(`/attendance?schedule_id=${scheduleId}&date=${d}`);
    setAttendance(res.data.map(r => ({ ...r, status: r.status || 'present' })));
  }

  function setStatus(studentId, status) {
    setAttendance(prev => prev.map(r => r.student_id === studentId ? { ...r, status } : r));
  }

  async function saveAttendance() {
    setSaving(true);
    setSmsResults([]);
    try {
      const records = attendance.map(r => ({ student_id: r.student_id, status: r.status, notes: r.notes || '' }));
      const res = await client.post('/attendance/bulk', { schedule_id: activeSession.id, date, records });
      setSmsResults(res.data.smsResults || []);
      showAlert('success', 'Yoklama kaydedildi');
    } catch (err) {
      showAlert('error', err.response?.data?.error || 'Kayıt hatası');
    } finally { setSaving(false); }
  }

  function showAlert(type, msg) { setAlert({ type, msg }); setTimeout(() => setAlert(null), 4000); }

  const byDay = DAYS.map((name, idx) => ({
    name,
    idx,
    items: schedule.filter(s => s.day_of_week === idx),
  }));

  const presentCount = attendance.filter(r => r.status === 'present' || r.status === 'late').length;
  const absentCount  = attendance.filter(r => r.status === 'absent').length;

  return (
    <PanelLayout>
      {!activeSession ? (
        <>
          <div className="panel-header">
            <div>
              <h1 className="panel-title">Takvimim</h1>
              <p className="panel-subtitle">Bir derse tıklayarak yoklama alın</p>
            </div>
          </div>

          {schedule.length === 0 && (
            <div className="empty-state">
              <div style={{ fontSize: '3rem' }}>📅</div>
              <p>Size atanmış ders bulunamadı</p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {byDay.map(day => day.items.length === 0 ? null : (
              <div key={day.name}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span className="day-badge">{day.name}</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {day.items.map(s => (
                    <button
                      key={s.id}
                      onClick={() => openSession(s)}
                      style={{
                        background: '#161616',
                        border: '1px solid rgba(201,168,76,0.15)',
                        borderRadius: 10,
                        padding: '14px 18px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                        textAlign: 'left',
                        transition: 'border-color 0.15s',
                        width: '100%',
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#c9a84c'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.15)'}
                    >
                      <div style={{ fontWeight: 700, color: '#c9a84c', fontSize: '1.1rem', minWidth: 110 }}>
                        {s.start_time} – {s.end_time}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#f0f0f0' }}>{s.group_name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#666', marginTop: 2 }}>
                          {s.branch_name}{s.location ? ` · ${s.location}` : ''}
                        </div>
                      </div>
                      <div style={{ marginLeft: 'auto', color: '#555', fontSize: '0.8rem' }}>
                        Yoklama Al →
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="panel-header">
            <div>
              <button
                onClick={() => setActive(null)}
                style={{ background: 'none', border: 'none', color: '#c9a84c', cursor: 'pointer', fontSize: '0.875rem', marginBottom: 6, padding: 0 }}
              >
                ← Takvime Dön
              </button>
              <h1 className="panel-title">
                {activeSession.group_name} — {activeSession.start_time}
              </h1>
              <p className="panel-subtitle">{activeSession.branch_name} · {DAYS[activeSession.day_of_week]}</p>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input
                type="date"
                value={date}
                onChange={async e => { setDate(e.target.value); await loadAttendance(activeSession.id, e.target.value); }}
                style={{
                  background: '#161616', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 8, padding: '8px 12px', color: '#ccc', fontSize: '0.875rem', outline: 'none',
                }}
              />
              <button className="btn-panel" onClick={saveAttendance} disabled={saving || attendance.length === 0}>
                {saving ? 'Kaydediliyor...' : '💾 Yoklamayı Kaydet'}
              </button>
            </div>
          </div>

          {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

          {/* Özet */}
          {attendance.length > 0 && (
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(76,175,80,0.1)', border: '1px solid rgba(76,175,80,0.25)', borderRadius: 8, padding: '10px 18px' }}>
                <span style={{ color: '#4caf50', fontWeight: 700, fontSize: '1.3rem' }}>{presentCount}</span>
                <span style={{ color: '#666', fontSize: '0.8rem', marginLeft: 6 }}>Geldi</span>
              </div>
              <div style={{ background: 'rgba(244,67,54,0.1)', border: '1px solid rgba(244,67,54,0.25)', borderRadius: 8, padding: '10px 18px' }}>
                <span style={{ color: '#f44336', fontWeight: 700, fontSize: '1.3rem' }}>{absentCount}</span>
                <span style={{ color: '#666', fontSize: '0.8rem', marginLeft: 6 }}>Gelmedi</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 18px' }}>
                <span style={{ color: '#999', fontWeight: 700, fontSize: '1.3rem' }}>{attendance.length}</span>
                <span style={{ color: '#666', fontSize: '0.8rem', marginLeft: 6 }}>Toplam</span>
              </div>
            </div>
          )}

          {attendance.length === 0 && (
            <div className="empty-state">
              <div style={{ fontSize: '3rem' }}>👦</div>
              <p>Bu gruba kayıtlı öğrenci bulunamadı</p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {attendance.map(r => (
              <div key={r.student_id} style={{
                background: '#161616',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 10,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                flexWrap: 'wrap',
              }}>
                <div style={{ minWidth: 180 }}>
                  <div style={{ fontWeight: 600, color: '#f0f0f0' }}>{r.first_name} {r.last_name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#555', marginTop: 2 }}>Veli: {r.parent_phone}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {STATUS_OPTS.map(opt => (
                    <button
                      key={opt.key}
                      className={`att-btn ${opt.key}${r.status === opt.key ? ' active' : ''}`}
                      onClick={() => setStatus(r.student_id, opt.key)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {r.sms_sent === 1 && (
                  <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: '#81c784' }}>📱 SMS Gönderildi</span>
                )}
              </div>
            ))}
          </div>

          {/* SMS sonuçları */}
          {smsResults.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: 8 }}>SMS Sonuçları:</div>
              {smsResults.map((r, i) => (
                <div key={i} style={{
                  background: r.sent ? 'rgba(76,175,80,0.08)' : 'rgba(244,67,54,0.08)',
                  border: `1px solid ${r.sent ? 'rgba(76,175,80,0.2)' : 'rgba(244,67,54,0.2)'}`,
                  borderRadius: 6,
                  padding: '8px 12px',
                  fontSize: '0.8rem',
                  color: r.sent ? '#81c784' : '#ef9a9a',
                  marginBottom: 4,
                }}>
                  {r.sent ? '✅' : '❌'} {r.student} ({r.phone}){r.mock ? ' [geliştirme modu — gerçek SMS gönderilmedi]' : ''}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </PanelLayout>
  );
}
