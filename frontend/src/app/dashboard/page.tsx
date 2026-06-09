'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { tasksApi, usersApi } from '@/lib/api';
import { Task, User } from '@/types';
import CreateTaskForm from '@/components/CreateTaskForm';
import TaskCard from '@/components/TaskCard';

const FILTERS = ['all', 'todo', 'in_progress', 'done'] as const;
type Filter = typeof FILTERS[number];

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [tasks, setTasks]             = useState<Task[]>([]);
  const [users, setUsers]             = useState<User[]>([]);
  const [showCreate, setShowCreate]   = useState(false);
  const [filter, setFilter]           = useState<Filter>('all');
  const [fetching, setFetching]       = useState(true);
  // Handle Google OAuth token redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get('token');
    if (token) {
      localStorage.setItem('taskflow_token', token);
      window.history.replaceState({}, '', '/dashboard');
    }
  }, []);
  const [showProfile, setShowProfile] = useState(false);
  const [profileImg, setProfileImg]   = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    const saved = localStorage.getItem(`pfp_${user.id}`);
    if (saved) setProfileImg(saved);
    Promise.all([tasksApi.list(), usersApi.list()])
      .then(([t, u]) => { setTasks(t.data); setUsers(u.data); })
      .finally(() => setFetching(false));
  }, [user]);

  const handleComplete = async (task: Task) => {
    const res = await tasksApi.update(task.id, { status: 'done' });
    setTasks(prev => prev.map(t => t.id === task.id ? res.data : t));
  };

  const handleDelete = async (id: string) => {
    await tasksApi.remove(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const result = ev.target?.result as string;
      setProfileImg(result);
      localStorage.setItem(`pfp_${user.id}`, result);
      setShowProfile(false);
    };
    reader.readAsDataURL(file);
  };

  const filtered = tasks.filter(t => filter === 'all' || t.status === filter);
  const counts = {
    all:         tasks.length,
    todo:        tasks.filter(t => t.status === 'todo').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    done:        tasks.filter(t => t.status === 'done').length,
  };
  const avatar = profileImg || user?.avatar_url;

  if (loading || fetching) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');
          *{margin:0;padding:0;box-sizing:border-box}
          body{background:#f8f8f6}
          .loader{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px}
          .loader-logo{font-family:'Syne',sans-serif;font-size:28px;font-weight:800;color:#111;letter-spacing:-1px}
          .loader-logo span{color:#6366f1}
          .bar{width:160px;height:3px;background:#e5e7eb;border-radius:3px;overflow:hidden}
          .bar-fill{height:100%;background:linear-gradient(90deg,#6366f1,#ec4899);border-radius:3px;animation:load 1.4s ease-in-out infinite}
          @keyframes load{0%{width:0;margin-left:0}50%{width:100%;margin-left:0}100%{width:0%;margin-left:100%}}
        `}</style>
        <div className="loader">
          <div className="loader-logo">TaskFlow<span>.</span></div>
          <div className="bar"><div className="bar-fill"/></div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}

        body {
          background: #f8f8f6;
          color: #1a1a1a;
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
        }

        /* ── NAVBAR ── */
        .nav {
          position: sticky; top:0; z-index:100;
          background: rgba(248,248,246,0.92);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid #ececec;
          height: 62px;
          display: flex; align-items:center;
          padding: 0 32px;
          gap: 0;
          animation: slideDown 0.4s cubic-bezier(0.16,1,0.3,1);
        }
        @keyframes slideDown{from{transform:translateY(-100%);opacity:0}to{transform:translateY(0);opacity:1}}

        .nav-logo {
          font-family:'Syne',sans-serif; font-size:20px; font-weight:800;
          color:#111; letter-spacing:-0.5px;
          text-decoration:none;
        }
        .nav-logo span { color:#6366f1; }

        .nav-spacer { flex:1; }

        .nav-right {
          display:flex; align-items:center; gap:10px;
        }

        .new-btn {
          display:flex; align-items:center; gap:7px;
          background:#6366f1; color:#fff;
          border:none; border-radius:10px;
          padding:9px 16px;
          font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500;
          cursor:pointer;
          transition:all 0.15s cubic-bezier(0.16,1,0.3,1);
        }
        .new-btn:hover {
          background:#4f46e5;
          transform:translateY(-1px);
          box-shadow:0 6px 20px rgba(99,102,241,0.3);
        }
        .new-btn:active{transform:translateY(0);box-shadow:none}

        /* Avatar */
        .av-wrap { position:relative; }
        .av {
          width:34px; height:34px; border-radius:50%;
          border:2px solid #e5e7eb;
          object-fit:cover; cursor:pointer;
          transition:border-color 0.15s;
        }
        .av:hover{border-color:#6366f1}
        .av-placeholder {
          width:34px; height:34px; border-radius:50%;
          background:linear-gradient(135deg,#6366f1,#ec4899);
          display:flex; align-items:center; justify-content:center;
          font-weight:600; font-size:13px; color:#fff;
          border:2px solid #e5e7eb;
          cursor:pointer;
          transition:all 0.15s;
        }
        .av-placeholder:hover{border-color:#6366f1;transform:scale(1.05)}

        /* Profile menu */
        .pmenu {
          position:absolute; top:calc(100% + 10px); right:0;
          background:#fff;
          border:1px solid #ececec;
          border-radius:16px;
          padding:6px;
          min-width:210px;
          box-shadow:0 16px 48px rgba(0,0,0,0.1);
          animation:menuIn 0.18s cubic-bezier(0.16,1,0.3,1);
          z-index:200;
        }
        @keyframes menuIn{from{opacity:0;transform:translateY(-6px) scale(0.97)}to{opacity:1;transform:none}}

        .pmenu-head {
          padding:12px 10px;
          border-bottom:1px solid #f5f5f5;
          margin-bottom:4px;
        }
        .pmenu-name{font-weight:600;font-size:13px;color:#111;}
        .pmenu-email{font-size:11px;color:#999;margin-top:2px;}

        .pmenu-item {
          display:flex; align-items:center; gap:9px;
          padding:9px 10px; border-radius:10px;
          font-size:13px; color:#444; cursor:pointer;
          transition:background 0.12s;
          border:none; background:transparent; width:100%; text-align:left;
          font-family:'DM Sans',sans-serif;
        }
        .pmenu-item:hover{background:#f5f5f7}
        .pmenu-item.red{color:#ef4444}
        .pmenu-item.red:hover{background:#fef2f2}

        /* ── MAIN ── */
        .main { max-width:800px; margin:0 auto; padding:36px 24px 60px; }

        /* Hero */
        .hero {
          margin-bottom:28px;
          animation:fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s both;
        }
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}

        .hero-row {
          display:flex; align-items:flex-start; justify-content:space-between;
          gap:16px; flex-wrap:wrap;
        }
        .hero-greeting {
          font-family:'Syne',sans-serif;
          font-size:30px; font-weight:800; color:#111;
          letter-spacing:-1px; line-height:1.15;
        }
        .hero-greeting .hi { color:#6366f1; }
        .hero-sub { font-size:13px; color:#999; margin-top:4px; }

        /* Progress ring */
        .progress-wrap {
          display:flex; flex-direction:column; align-items:center; gap:4px;
          flex-shrink:0;
        }
        .progress-label { font-size:11px; color:#bbb; text-transform:uppercase; letter-spacing:0.06em; }

        /* ── STATS ── */
        .stats {
          display:grid; grid-template-columns:repeat(4,1fr); gap:12px;
          margin-bottom:28px;
          animation:fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.18s both;
        }

        .stat {
          background:#fff; border:1px solid #ececec; border-radius:16px;
          padding:16px 18px; cursor:pointer;
          transition:all 0.18s cubic-bezier(0.16,1,0.3,1);
          position:relative; overflow:hidden;
        }
        .stat::after {
          content:'';
          position:absolute; left:0; top:0; bottom:0; width:3px;
          border-radius:3px 0 0 3px;
          background:var(--c);
          opacity:0; transition:opacity 0.18s;
        }
        .stat:hover { border-color:var(--c); box-shadow:0 4px 16px rgba(0,0,0,0.06); transform:translateY(-2px); }
        .stat:hover::after { opacity:1; }
        .stat.active { border-color:var(--c); box-shadow:0 0 0 3px color-mix(in srgb, var(--c) 12%, transparent); }
        .stat.active::after { opacity:1; }

        .stat-n {
          font-family:'Syne',sans-serif;
          font-size:26px; font-weight:800;
          color:#111; line-height:1;
          margin-bottom:4px;
        }
        .stat.active .stat-n { color:var(--c); }
        .stat-l { font-size:11px; color:#aaa; text-transform:uppercase; letter-spacing:0.06em; font-weight:500; }

        .stat-progress {
          height:3px; border-radius:2px;
          background:#f0f0f0; margin-top:12px; overflow:hidden;
        }
        .stat-bar-fill {
          height:100%; border-radius:2px; background:var(--c);
          transition:width 0.7s cubic-bezier(0.16,1,0.3,1);
        }

        /* ── SECTION HEADER ── */
        .sec-head {
          display:flex; align-items:center; justify-content:space-between;
          margin-bottom:14px;
          animation:fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.25s both;
        }
        .sec-title {
          font-family:'Syne',sans-serif; font-size:15px; font-weight:700; color:#111;
        }
        .sec-badge {
          background:#f5f5f7; border:1px solid #ececec;
          border-radius:100px; padding:3px 10px;
          font-size:11px; color:#888;
        }

        /* ── EMPTY ── */
        .empty {
          text-align:center; padding:72px 24px;
          animation:fadeUp 0.4s ease both;
        }
        .empty-icon { font-size:44px; margin-bottom:14px; animation:bob 2.4s ease-in-out infinite; }
        @keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        .empty-t { font-family:'Syne',sans-serif; font-size:17px; font-weight:700; color:#111; margin-bottom:5px; }
        .empty-s { font-size:13px; color:#aaa; }

        /* ── TASK LIST ── */
        .task-list { display:flex; flex-direction:column; gap:10px; }
        .task-item { animation:taskIn 0.35s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes taskIn{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:none}}

        /* ── MODAL ── */
        .modal-overlay {
          position:fixed; inset:0; z-index:50;
          background:rgba(0,0,0,0.35); backdrop-filter:blur(6px);
          display:flex; align-items:center; justify-content:center; padding:24px;
          animation:overlayIn 0.18s ease;
        }
        @keyframes overlayIn{from{opacity:0}to{opacity:1}}
        .modal-box {
          background:#fff; border-radius:24px;
          padding:32px; width:100%; max-width:480px;
          box-shadow:0 32px 80px rgba(0,0,0,0.14);
          animation:modalIn 0.28s cubic-bezier(0.16,1,0.3,1);
        }
        @keyframes modalIn{from{opacity:0;transform:scale(0.96) translateY(16px)}to{opacity:1;transform:none}}
      `}</style>

      {showProfile && (
        <div style={{position:'fixed',inset:0,zIndex:99}} onClick={() => setShowProfile(false)} />
      )}

      {/* Navbar */}
      <nav className="nav">
        <div className="nav-logo">TaskFlow<span>.</span></div>
        <div className="nav-spacer" />
        <div className="nav-right">
          <button className="new-btn" onClick={() => setShowCreate(true)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Task
          </button>

          <div className="av-wrap">
            {avatar
              ? <img src={avatar} alt="avatar" className="av" onClick={() => setShowProfile(v => !v)} />
              : <div className="av-placeholder" onClick={() => setShowProfile(v => !v)}>
                  {user?.full_name?.[0]?.toUpperCase() || '?'}
                </div>
            }

            {showProfile && (
              <div className="pmenu">
                <div className="pmenu-head">
                  <div className="pmenu-name">{user?.full_name}</div>
                  <div className="pmenu-email">{user?.email}</div>
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleImageUpload} />
                <button className="pmenu-item" onClick={() => fileRef.current?.click()}>
                  <span>📷</span> Change profile photo
                </button>
                <button className="pmenu-item red" onClick={logout}>
                  <span>🚪</span> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="main">
        {/* Hero */}
        <div className="hero">
          <div className="hero-row">
            <div>
              <div className="hero-greeting">
                Hey, <span className="hi">{user?.full_name?.split(' ')[0]}</span> 👋
              </div>
              <div className="hero-sub">
                {new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}
                {' · '}
                {counts.todo > 0
                  ? `${counts.todo} task${counts.todo!==1?'s':''} to do`
                  : '🎉 All caught up!'}
              </div>
            </div>

            {/* Completion ring */}
            {counts.all > 0 && (
              <div className="progress-wrap">
                <svg width="52" height="52" viewBox="0 0 52 52">
                  <circle cx="26" cy="26" r="22" fill="none" stroke="#f0f0f0" strokeWidth="4"/>
                  <circle cx="26" cy="26" r="22" fill="none" stroke="#6366f1" strokeWidth="4"
                    strokeDasharray={`${2*Math.PI*22}`}
                    strokeDashoffset={`${2*Math.PI*22*(1 - counts.done/counts.all)}`}
                    strokeLinecap="round"
                    transform="rotate(-90 26 26)"
                    style={{transition:'stroke-dashoffset 0.8s cubic-bezier(0.16,1,0.3,1)'}}
                  />
                  <text x="26" y="31" textAnchor="middle" fontSize="11" fontWeight="700" fill="#111"
                    fontFamily="Syne,sans-serif">
                    {Math.round(counts.done/counts.all*100)}%
                  </text>
                </svg>
                <div className="progress-label">done</div>
              </div>
            )}
          </div>
        </div>

        {/* Stat cards */}
        <div className="stats">
          {([ 
            {f:'all',         label:'All',         color:'#6366f1'},
            {f:'todo',        label:'To do',       color:'#64748b'},
            {f:'in_progress', label:'In progress', color:'#f59e0b'},
            {f:'done',        label:'Done',        color:'#22c55e'},
          ] as const).map(({f,label,color}) => {
            const pct = counts.all > 0 ? Math.round((counts[f]/counts.all)*100) : 0;
            return (
              <div
                key={f}
                className={`stat${filter===f?' active':''}`}
                style={{'--c':color} as React.CSSProperties}
                onClick={() => setFilter(f)}
              >
                <div className="stat-n">{counts[f]}</div>
                <div className="stat-l">{label}</div>
                <div className="stat-progress">
                  <div className="stat-bar-fill" style={{width: f==='all'?'100%':`${pct}%`}} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Section header */}
        <div className="sec-head">
          <div className="sec-title">
            {filter==='all' ? 'All tasks' : filter.replace('_',' ').replace(/\b\w/g,l=>l.toUpperCase())}
          </div>
          <div className="sec-badge">{filtered.length} task{filtered.length!==1?'s':''}</div>
        </div>

        {/* List */}
        {filtered.length === 0
          ? (
            <div className="empty">
              <div className="empty-icon">{filter==='done'?'✅':filter==='in_progress'?'⚙️':'📋'}</div>
              <div className="empty-t">{filter==='all' ? 'No tasks yet' : `No ${filter.replace('_',' ')} tasks`}</div>
              <div className="empty-s">{filter==='all' ? 'Click + New Task to get started!' : 'Nothing here right now.'}</div>
            </div>
          ) : (
            <div className="task-list">
              {filtered.map((task, i) => (
                <div key={task.id} className="task-item" style={{animationDelay:`${i*0.04}s`}}>
                  <TaskCard task={task} currentUserId={user!.id} onComplete={handleComplete} onDelete={handleDelete} />
                </div>
              ))}
            </div>
          )
        }
      </main>

      {/* Create modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setShowCreate(false)}>
          <div className="modal-box">
            <CreateTaskForm
              users={users}
              currentUserId={user!.id}
              onCreated={t => { setTasks(prev => [t,...prev]); setShowCreate(false); }}
              onCancel={() => setShowCreate(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}