'use client';
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function CallbackHandler() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('taskflow_token', token);
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/auth/login';
    }
  }, []);

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center',
      justifyContent:'center', background:'#f0efea',
      fontFamily:'DM Sans, sans-serif'
    }}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:32, marginBottom:12}}>⚡</div>
        <p style={{color:'#999', fontSize:14}}>Signing you in…</p>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div style={{minHeight:'100vh', background:'#f0efea', display:'flex',
        alignItems:'center', justifyContent:'center'}}>
        <p style={{color:'#999', fontFamily:'sans-serif'}}>Loading…</p>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}