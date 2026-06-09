'use client';
import { useEffect } from 'react';

export default function CallbackPage() {
  useEffect(() => {
    // Read token from URL hash (e.g. /auth/callback#eyJ...)
    const hash  = window.location.hash.slice(1);
    // Also try query param as fallback
    const params = new URLSearchParams(window.location.search);
    const query  = params.get('token');
    const token  = hash || query;

    if (token) {
      localStorage.setItem('taskflow_token', token);
      window.location.replace('/dashboard');
    } else {
      window.location.replace('/auth/login');
    }
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f0efea',
      fontFamily: 'sans-serif',
      gap: '16px'
    }}>
      <div style={{ fontSize: '36px' }}>⚡</div>
      <p style={{ color: '#999', fontSize: '14px' }}>Signing you in…</p>
    </div>
  );
}