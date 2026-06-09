'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { authApi, api } from '@/lib/api';

type Mode = 'login' | 'register';

export default function LoginPage() {
  const { user, loading, refetch } = useAuth();
  const router = useRouter();
  const [mode, setMode]         = useState<Mode>('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]         = useState('');
  const [error, setError]       = useState('');
  const [busy, setBusy]         = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (!loading && user) router.push('/dashboard');
  }, [user, loading, router]);

  const switchMode = (m: Mode) => { setMode(m); setError(''); setEmail(''); setPassword(''); setName(''); };

  const handleGoogle = () => { window.location.href = authApi.loginUrl()!; };

 const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      const endpoint = mode === 'login' ? '/auth/email/login' : '/auth/email/register';
      const payload  = mode === 'login' ? { email, password } : { email, password, full_name: name };
      const res      = await api.post(endpoint, payload);
      localStorage.setItem('taskflow_token', res.data.token);
      await refetch();
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        .root{min-height:100vh;background:#f0efea;display:flex;align-items:center;justify-content:center;font-family:'DM Sans',sans-serif;position:relative;overflow:hidden;padding:24px}
        .grid{position:absolute;inset:0;background-image:linear-gradient(rgba(99,102,241,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.07) 1px,transparent 1px);background-size:54px 54px;animation:gridMove 16s linear infinite}
        @keyframes gridMove{0%{transform:translate(0,0)}100%{transform:translate(54px,54px)}}
        .orb{position:absolute;border-radius:50%;animation:orbDrift 10s ease-in-out infinite}
        .o1{width:480px;height:480px;background:radial-gradient(circle,rgba(99,102,241,.12),transparent 65%);top:-120px;left:-120px;animation-delay:0s}
        .o2{width:380px;height:380px;background:radial-gradient(circle,rgba(236,72,153,.09),transparent 65%);bottom:-80px;right:-80px;animation-delay:-5s}
        .o3{width:240px;height:240px;background:radial-gradient(circle,rgba(16,185,129,.08),transparent 65%);top:45%;left:55%;animation-delay:-2.5s}
        @keyframes orbDrift{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(22px,-22px) scale(1.03)}66%{transform:translate(-14px,18px) scale(.97)}}
        .dots{position:absolute;inset:0;pointer-events:none;overflow:hidden}
        .dot{position:absolute;border-radius:50%;opacity:0;animation:dotRise linear infinite}
        @keyframes dotRise{0%{transform:translateY(100vh);opacity:0}8%{opacity:1}92%{opacity:.5}100%{transform:translateY(-40px);opacity:0}}
        .card{position:relative;z-index:10;width:100%;max-width:410px;animation:cardIn .65s cubic-bezier(.16,1,.3,1) both}
        @keyframes cardIn{from{opacity:0;transform:translateY(24px) scale(.97)}to{opacity:1;transform:none}}
        .card-inner{background:rgba(255,255,255,.88);backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,.95);border-radius:28px;padding:36px 36px 32px;box-shadow:0 2px 0 rgba(255,255,255,.8) inset,0 28px 72px rgba(99,102,241,.1),0 6px 28px rgba(0,0,0,.06)}
        .rainbow{height:3px;border-radius:3px;background:linear-gradient(90deg,#6366f1,#ec4899,#f59e0b,#10b981);margin-bottom:28px}
        .logo{font-family:'Syne',sans-serif;font-size:30px;font-weight:800;color:#111;letter-spacing:-1px;line-height:1;margin-bottom:4px}
        .logo span{color:#6366f1}
        .sub-text{font-size:13px;color:#999;margin-bottom:22px;line-height:1.5}
        .tabs{display:flex;background:#f5f5f7;border-radius:12px;padding:3px;gap:2px;margin-bottom:22px}
        .tab{flex:1;padding:9px 0;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;cursor:pointer;border:none;background:transparent;color:#888;transition:all .18s cubic-bezier(.16,1,.3,1)}
        .tab.active{background:#fff;color:#111;box-shadow:0 1px 6px rgba(0,0,0,.1)}
        .g-btn{width:100%;display:flex;align-items:center;justify-content:center;gap:10px;background:#fff;border:1.5px solid #e5e7eb;border-radius:13px;padding:12px 18px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;color:#1a1a1a;cursor:pointer;transition:all .16s cubic-bezier(.16,1,.3,1);margin-bottom:16px}
        .g-btn:hover{border-color:#a5b4fc;box-shadow:0 4px 16px rgba(99,102,241,.15);transform:translateY(-1px)}
        .g-btn:active{transform:none;box-shadow:none}
        .divider{display:flex;align-items:center;gap:10px;margin-bottom:16px}
        .div-line{flex:1;height:1px;background:#ececec}
        .div-text{font-size:11px;color:#ccc;text-transform:uppercase;letter-spacing:.1em}
        .field{margin-bottom:13px}
        .field-label{display:block;font-size:11px;font-weight:500;color:#aaa;text-transform:uppercase;letter-spacing:.07em;margin-bottom:6px}
        .field-wrap{position:relative}
        .field-input{width:100%;background:#fafafa;border:1.5px solid #ececec;border-radius:12px;padding:12px 14px;font-family:'DM Sans',sans-serif;font-size:14px;color:#111;transition:all .15s;outline:none}
        .field-input::placeholder{color:#ccc}
        .field-input:focus{border-color:#6366f1;background:#fff;box-shadow:0 0 0 3px rgba(99,102,241,.1)}
        .field-input.pad-r{padding-right:42px}
        .eye-btn{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#bbb;font-size:16px;padding:2px;line-height:1;transition:color .15s}
        .eye-btn:hover{color:#6366f1}
        .err{background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:10px 14px;font-size:13px;color:#dc2626;margin-bottom:13px;animation:errIn .2s ease}
        @keyframes errIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
        .sub-btn{width:100%;padding:13px;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#fff;border:none;border-radius:13px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;cursor:pointer;transition:all .18s cubic-bezier(.16,1,.3,1);margin-top:4px}
        .sub-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 24px rgba(99,102,241,.35)}
        .sub-btn:active{transform:none;box-shadow:none}
        .sub-btn:disabled{opacity:.55;cursor:not-allowed}
        .foot{text-align:center;font-size:12px;color:#bbb;margin-top:14px;line-height:1.6}
        .foot-link{color:#6366f1;cursor:pointer;font-weight:500}
        .foot-link:hover{text-decoration:underline}
      `}</style>

      <div className="root">
        <div className="grid"/>
        <div className="o1 orb"/><div className="o2 orb"/><div className="o3 orb"/>
        <div className="dots">
          {Array.from({length:14}).map((_,i)=>(
            <div key={i} className="dot" style={{
              left:`${(i/14)*100+Math.sin(i)*4}%`,
              width:`${2+(i%3)}px`,height:`${2+(i%3)}px`,
              background:['#6366f1','#ec4899','#10b981','#f59e0b'][i%4],
              animationDuration:`${6+(i*.6)}s`,animationDelay:`${i*.35}s`,
            }}/>
          ))}
        </div>

        <div className="card">
          <div className="card-inner">
            <div className="rainbow"/>
            <div className="logo">TaskFlow<span>.</span></div>
            <p className="sub-text">
              {mode==='login' ? 'Welcome back — sign in to continue.' : 'Create your account in seconds.'}
            </p>

            {/* Mode toggle */}
            <div className="tabs">
              <button className={`tab${mode==='login'?' active':''}`} onClick={()=>switchMode('login')}>Sign In</button>
              <button className={`tab${mode==='register'?' active':''}`} onClick={()=>switchMode('register')}>Create Account</button>
            </div>

            {/* Google */}
            <button className="g-btn" onClick={handleGoogle}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {mode==='login' ? 'Sign in with Google' : 'Sign up with Google'}
            </button>

            <div className="divider">
              <div className="div-line"/><span className="div-text">or with email</span><div className="div-line"/>
            </div>

            {error && <div className="err">⚠ {error}</div>}

            <form onSubmit={handleSubmit}>
              {mode==='register' && (
                <div className="field">
                  <label className="field-label">Full Name</label>
                  <input required className="field-input" placeholder="John Smith" value={name} onChange={e=>setName(e.target.value)}/>
                </div>
              )}
              <div className="field">
                <label className="field-label">Email</label>
                <input required type="email" className="field-input" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)}/>
              </div>
              <div className="field">
                <label className="field-label">Password</label>
                <div className="field-wrap">
                  <input required type={showPass?'text':'password'} className="field-input pad-r"
                    placeholder={mode==='register'?'Min. 6 characters':'••••••••'}
                    minLength={6} value={password} onChange={e=>setPassword(e.target.value)}/>
                  <button type="button" className="eye-btn" onClick={()=>setShowPass(v=>!v)}>
                    {showPass?'🙈':'👁'}
                  </button>
                </div>
              </div>
              <button type="submit" className="sub-btn" disabled={busy}>
                {busy ? (mode==='login'?'Signing in…':'Creating account…') : (mode==='login'?'Sign In →':'Create Account →')}
              </button>
            </form>
          </div>

          <p className="foot">
            {mode==='login' ? "Don't have an account? " : 'Already have an account? '}
            <span className="foot-link" onClick={()=>switchMode(mode==='login'?'register':'login')}>
              {mode==='login' ? 'Create one' : 'Sign in'}
            </span>
          </p>
        </div>
      </div>
    </>
  );
}