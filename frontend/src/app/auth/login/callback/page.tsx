'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function CallbackHandler() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('taskflow_token', token);
      router.push('/dashboard');
    } else {
      router.push('/auth/login');
    }
  }, [router, searchParams]);

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',
      justifyContent:'center',background:'#f0efea',fontFamily:'sans-serif'}}>
      <p style={{color:'#999'}}>Signing you in…</p>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<div style={{minHeight:'100vh',background:'#f0efea'}}/>}>
      <CallbackHandler />
    </Suspense>
  );
}