import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PanelLayout from '../../components/PanelLayout';
import client from '../../api/client';

export default function PaymentReturn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Ödeme token\'ı bulunamadı.');
      return;
    }

    client.post('/payments/verify', { token })
      .then(res => {
        if (res.data.success) {
          setStatus('success');
          setMessage('Ödemeniz başarıyla tamamlandı. Yönlendiriliyorsunuz...');
          setTimeout(() => navigate('/panel/veli/dashboard'), 3000);
        } else {
          setStatus('error');
          setMessage('Ödeme başarısız: ' + (res.data.error || 'Bilinmeyen hata'));
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Ödeme doğrulanırken bir hata oluştu.');
      });
  }, []);

  return (
    <PanelLayout>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '40vh', textAlign: 'center', gap: 16,
      }}>
        {status === 'loading' && (
          <>
            <div style={{ fontSize: '2rem' }}>⏳</div>
            <p style={{ color: '#aaa' }}>Ödeme sonucu doğrulanıyor...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div style={{ fontSize: '3rem' }}>✅</div>
            <h2 style={{ color: '#4caf50', fontWeight: 700 }}>Ödeme Başarılı</h2>
            <p style={{ color: '#aaa' }}>{message}</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ fontSize: '3rem' }}>❌</div>
            <h2 style={{ color: '#f44336', fontWeight: 700 }}>Ödeme Başarısız</h2>
            <p style={{ color: '#aaa' }}>{message}</p>
            <button className="btn-panel" onClick={() => navigate('/panel/veli/dashboard')}>
              Geri Dön
            </button>
          </>
        )}
      </div>
    </PanelLayout>
  );
}
