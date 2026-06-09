'use client';
import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function CallbackHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('taskflow_token', token);
      window.location.replace('/dashboard');
    } else {
      window.location.replace('/auth/login');
    }
  }, []);

  return (
    <div style={{
      minHeight:'100vh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      background:'#f0efea', fontFamily:'DM Sans, sans-serif', gap:16
    }}>
      <div style={{fontSize:36}}>⚡</div>
      <p style={{color:'#999', fontSize:14}}>Signing you in…</p>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div style={{minHeight:'100vh', background:'#f0efea',
        display:'flex', alignItems:'center', justifyContent:'center'}}>
        <p style={{color:'#999', fontFamily:'sans-serif', fontSize:14}}>Loading…</p>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}