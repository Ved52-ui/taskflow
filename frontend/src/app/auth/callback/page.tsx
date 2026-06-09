'use client';
import { useEffect } from 'react';

export default function CallbackPage() {
  useEffect(() => {
    const hash   = window.location.hash.replace('#', '');
    const params = new URLSearchParams(window.location.search);
    const token  = hash || params.get('token') || '';
    if (token) {
      localStorage.setItem('taskflow_token', token);
    }
    window.location.replace(token ? '/dashboard' : '/auth/login');
  }, []);

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',
      justifyContent:'center',background:'#f0efea'}}>
      <p style={{color:'#999',fontFamily:'sans-serif',fontSize:14}}>
        Signing you in…
      </p>
    </div>
  );
}