'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { authApi } from '@/lib/api';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.push('/dashboard');
  }, [user, loading, router]);

  const handleLogin = () => {
    window.location.href = authApi.loginUrl()!;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        * { margin:0; padding:0; box-sizing:border-box; }

        .login-root {
          min-height: 100vh;
          background: #f0efea;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* Animated grid */
        .grid-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(99,102,241,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.08) 1px, transparent 1px);
          background-size: 56px 56px;
          animation: gridMove 18s linear infinite;
        }
        @keyframes gridMove {
          0%   { transform: translate(0,0); }
          100% { transform: translate(56px,56px); }
        }

        /* Soft color orbs */
        .orb {
          position: absolute;
          border-radius: 50%;
          animation: orbDrift 10s ease-in-out infinite;
        }
        .orb-1 {
          width:500px; height:500px;
          background: radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 65%);
          top:-140px; left:-140px;
          animation-delay:0s;
        }
        .orb-2 {
          width:420px; height:420px;
          background: radial-gradient(circle, rgba(236,72,153,0.09) 0%, transparent 65%);
          bottom:-100px; right:-80px;
          animation-delay:-5s;
        }
        .orb-3 {
          width:260px; height:260px;
          background: radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 65%);
          top:40%; left:55%;
          animation-delay:-2.5s;
        }
        @keyframes orbDrift {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(24px,-24px) scale(1.04); }
          66%      { transform: translate(-16px,20px) scale(0.97); }
        }

        /* Floating dots */
        .dots {
          position:absolute; inset:0; pointer-events:none; overflow:hidden;
        }
        .dot {
          position:absolute;
          border-radius:50%;
          animation: dotRise linear infinite;
          opacity:0;
        }
        @keyframes dotRise {
          0%   { transform: translateY(100vh); opacity:0; }
          8%   { opacity:1; }
          92%  { opacity:0.6; }
          100% { transform: translateY(-40px); opacity:0; }
        }

        /* Card */
        .card {
          position:relative; z-index:10;
          width:100%; max-width:420px;
          animation: cardIn 0.7s cubic-bezier(0.16,1,0.3,1) both;
          padding: 0 16px;
        }
        @keyframes cardIn {
          from { opacity:0; transform:translateY(28px) scale(0.97); }
          to   { opacity:1; transform:translateY(0)    scale(1);    }
        }

        .card-inner {
          background: rgba(255,255,255,0.82);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.9);
          border-radius: 28px;
          padding: 44px 40px;
          box-shadow:
            0 2px 0 rgba(255,255,255,0.8) inset,
            0 32px 80px rgba(99,102,241,0.1),
            0 8px 32px rgba(0,0,0,0.06);
        }

        /* Top accent line */
        .card-inner::before {
          content: '';
          display: block;
          height: 3px;
          border-radius: 3px;
          background: linear-gradient(90deg, #6366f1, #ec4899, #10b981);
          margin-bottom: 32px;
        }

        /* Logo */
        .logo {
          font-family: 'Syne', sans-serif;
          font-size: 38px;
          font-weight: 800;
          color: #111;
          letter-spacing: -1.5px;
          line-height: 1;
          margin-bottom: 6px;
        }
        .logo-dot { color: #6366f1; }

        .tagline {
          font-size: 14px;
          color: #888;
          font-weight: 400;
          margin-bottom: 32px;
          line-height: 1.5;
        }

        /* Separator */
        .sep {
          display:flex; align-items:center; gap:10px;
          margin-bottom:20px;
        }
        .sep-line { flex:1; height:1px; background:#e5e7eb; }
        .sep-text  { font-size:11px; color:#bbb; text-transform:uppercase; letter-spacing:0.1em; }

        /* Google button */
        .google-btn {
          width:100%;
          display:flex; align-items:center; justify-content:center; gap:10px;
          background:#fff;
          border: 1.5px solid #e5e7eb;
          border-radius: 14px;
          padding: 14px 20px;
          font-family:'DM Sans',sans-serif;
          font-size: 15px;
          font-weight: 500;
          color: #1a1a1a;
          cursor:pointer;
          transition: all 0.18s cubic-bezier(0.16,1,0.3,1);
          margin-bottom: 12px;
        }
        .google-btn:hover {
          border-color:#a5b4fc;
          box-shadow: 0 4px 16px rgba(99,102,241,0.15);
          transform: translateY(-1px);
        }
        .google-btn:active { transform:translateY(0); box-shadow:none; }

        /* Feature pills */
        .pills {
          display:flex; flex-wrap:wrap; gap:6px;
          margin-top:24px; padding-top:20px;
          border-top:1px solid #f0f0f0;
          justify-content:center;
        }
        .pill {
          display:inline-flex; align-items:center; gap:5px;
          background:#f5f5f7; border:1px solid #e8e8ec;
          border-radius:100px; padding:5px 12px;
          font-size:11px; color:#666; font-weight:500;
        }
        .pill-icon { font-size:12px; }

        /* Footer note */
        .footer-note {
          text-align:center;
          font-size:11px; color:#bbb;
          margin-top:16px;
          padding:0 8px;
          line-height:1.5;
        }
      `}</style>

      <div className="login-root">
        <div className="grid-bg" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        {/* Animated dots */}
        <div className="dots">
          {Array.from({length:16}).map((_,i) => (
            <div key={i} className="dot" style={{
              left: `${(i/16)*100 + Math.sin(i)*5}%`,
              width:  `${2 + (i%3)}px`,
              height: `${2 + (i%3)}px`,
              background: ['#6366f1','#ec4899','#10b981','#f59e0b'][i%4],
              animationDuration: `${6 + (i*0.7)}s`,
              animationDelay:    `${(i*0.4)}s`,
            }}/>
          ))}
        </div>

        <div className="card">
          <div className="card-inner">
            <div className="logo">TaskFlow<span className="logo-dot">.</span></div>
            <p className="tagline">Assign, track, and ship tasks — together.</p>

            <div className="sep">
              <div className="sep-line"/>
              <span className="sep-text">sign in</span>
              <div className="sep-line"/>
            </div>

            <button className="google-btn" onClick={handleLogin}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className="pills">
              {[
                {icon:'⚡', text:'Fast'},
                {icon:'🔒', text:'Secure'},
                {icon:'📧', text:'Email alerts'},
                {icon:'👥', text:'Teams'},
              ].map(p => (
                <div key={p.text} className="pill">
                  <span className="pill-icon">{p.icon}</span>
                  {p.text}
                </div>
              ))}
            </div>
          </div>

          <p className="footer-note">
            Any Google account can sign in. Your data is private and secure.
          </p>
        </div>
      </div>
    </>
  );
}