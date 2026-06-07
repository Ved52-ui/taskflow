'use client';
import { useState } from 'react';
import { tasksApi } from '@/lib/api';
import { User, Task } from '@/types';

interface Props {
  users: User[];
  currentUserId: string;
  onCreated: (task: Task) => void;
  onCancel: () => void;
}

export default function CreateTaskForm({ users, currentUserId, onCreated, onCancel }: Props) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
    assignee_id: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setLoading(true);
    try {
      const res = await tasksApi.create({
        ...form,
        assignee_id: form.assignee_id || undefined,
        due_date:    form.due_date    || undefined,
      });
      onCreated(res.data);
    } finally {
      setLoading(false);
    }
  };

  const priorities = [
    { value:'low',    label:'Low',    color:'#6b7280' },
    { value:'medium', label:'Medium', color:'#3b82f6' },
    { value:'high',   label:'High',   color:'#f59e0b' },
    { value:'urgent', label:'Urgent', color:'#ef4444' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');

        .form-title {
          font-family:'Syne',sans-serif;
          font-size:22px; font-weight:800; color:#000; /* Black */
          letter-spacing:-0.5px; margin-bottom:24px;
          display:flex; align-items:center; justify-content:space-between;
        }
        .form-close {
          background:rgba(0,0,0,0.05); border:1px solid rgba(0,0,0,0.1);
          color:#000; border-radius:8px;
          width:32px; height:32px; display:flex; align-items:center; justify-content:center;
          cursor:pointer; font-size:16px;
          transition:all 0.15s;
        }
        .form-close:hover { background:rgba(255,77,0,0.1); color:#ff4d00; border-color:rgba(255,77,0,0.3); }

        .field { margin-bottom:16px; }
        .field-label {
          display:block; font-size:11px; font-weight:700; color:#000; /* Black */
          text-transform:uppercase; letter-spacing:0.08em; margin-bottom:8px;
        }

        .field-input, .field-textarea, .field-select {
          width:100%;
          background:#fff; /* White Background */
          border:1px solid #ccc; /* Visible Border */
          border-radius:12px;
          padding:12px 14px;
          color:#000; /* Black text */
          font-family:'DM Sans',sans-serif; font-size:14px;
          transition:all 0.15s;
          outline:none;
        }
        .field-input::placeholder, .field-textarea::placeholder { color:rgba(0,0,0,0.4); }
        .field-input:focus, .field-textarea:focus, .field-select:focus {
          border-color:rgba(255,77,0,0.5);
          box-shadow:0 0 0 3px rgba(255,77,0,0.08);
        }
        .field-textarea { resize:none; min-height:80px; }
        .field-select option { background:#fff; color:#000; }

        /* Priority selector styled for light background */
        .priority-grid {
          display:grid; grid-template-columns:repeat(4,1fr); gap:8px;
        }
        .priority-btn {
          padding:10px 8px; border-radius:10px;
          font-size:12px; font-weight:500; cursor:pointer;
          border:1px solid #ddd;
          background:#fafafa;
          color:#000; /* Black font for inactive priority buttons */
          transition:all 0.15s;
          text-align:center;
          font-family:'DM Sans',sans-serif;
        }

        .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }

        .form-actions {
          display:flex; gap:10px; margin-top:24px;
          padding-top:20px;
          border-top:1px solid #eee;
        }
        .submit-btn {
          flex:1; padding:13px;
          background:linear-gradient(135deg,#ff4d00,#ff6a00);
          color:#fff; border:none; border-radius:12px;
          font-family:'DM Sans',sans-serif; font-size:14px; font-weight:500;
          cursor:pointer;
          transition:all 0.2s cubic-bezier(0.16,1,0.3,1);
          position:relative; overflow:hidden;
        }
        .submit-btn:hover:not(:disabled) {
          transform:translateY(-1px);
          box-shadow:0 8px 24px rgba(255,77,0,0.4);
        }
        .submit-btn:disabled { opacity:0.5; cursor:not-allowed; }

        .cancel-btn {
          padding:13px 20px;
          background:#fafafa;
          border:1px solid #ddd;
          color:#000; /* Black font for Cancel button */
          border-radius:12px;
          font-family:'DM Sans',sans-serif; font-size:14px;
          cursor:pointer;
          transition:all 0.15s;
        }
        .cancel-btn:hover { background:#f0f0f0; }

        input[type='date']::-webkit-calendar-picker-indicator {
          filter: opacity(0.7); /* Keeps standard dark calendar icon */
          cursor:pointer;
        }
      `}</style>

      <form onSubmit={handleSubmit}>
        <div className="form-title">
          Create Task
          <button type="button" className="form-close" onClick={onCancel}>✕</button>
        </div>

        <div className="field">
          <label className="field-label">Task Title *</label>
          <input
            required
            className="field-input"
            placeholder="What needs to be done?"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
          />
        </div>

        <div className="field">
          <label className="field-label">Description</label>
          <textarea
            className="field-textarea"
            placeholder="Add more details (optional)"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div className="field">
          <label className="field-label">Priority</label>
          <div className="priority-grid">
            {priorities.map(p => (
              <button
                key={p.value}
                type="button"
                className="priority-btn"
                onClick={() => setForm({ ...form, priority: p.value })}
                style={form.priority === p.value ? {
                  background: `${p.color}18`,
                  borderColor: p.color,
                  color: p.color, /* Uses specific label colors (red, orange, etc.) when selected */
                  fontWeight: 'bold'
                } : {}}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid-2">
          <div className="field">
            <label className="field-label">Assign To</label>
            <select
              className="field-select"
              value={form.assignee_id}
              onChange={e => setForm({ ...form, assignee_id: e.target.value })}
            >
              <option value="">Unassigned</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.full_name}{u.id === currentUserId ? ' (You)' : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="field-label">Due Date</label>
            <input
              type="date"
              className="field-input"
              value={form.due_date}
              onChange={e => setForm({ ...form, due_date: e.target.value })}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Creating...' : '⚡ Create Task'}
          </button>
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </>
  );
}