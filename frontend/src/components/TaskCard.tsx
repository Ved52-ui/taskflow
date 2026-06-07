'use client';
import { Task } from '@/types';

const PRIORITY_CONFIG: Record<string, { color: string; bg: string; label: string; dot: string }> = {
  low:    { color:'#6b7280', bg:'rgba(107,114,128,0.1)', label:'Low',    dot:'#6b7280' },
  medium: { color:'#3b82f6', bg:'rgba(59,130,246,0.1)',  label:'Med',    dot:'#3b82f6' },
  high:   { color:'#f59e0b', bg:'rgba(245,158,11,0.1)',  label:'High',   dot:'#f59e0b' },
  urgent: { color:'#ef4444', bg:'rgba(239,68,68,0.1)',   label:'Urgent', dot:'#ef4444' },
};

const STATUS_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
  todo:        { icon:'○', color:'#6b7280', bg:'rgba(107,114,128,0.08)' },
  in_progress: { icon:'◑', color:'#f59e0b', bg:'rgba(245,158,11,0.08)' },
  done:        { icon:'✓', color:'#22c55e', bg:'rgba(34,197,94,0.08)'  },
};

interface Props {
  task: Task;
  currentUserId: string;
  onComplete: (task: Task) => void;
  onDelete: (id: string) => void;
}

export default function TaskCard({ task, currentUserId, onComplete, onDelete }: Props) {
  const isCreator = task.creator_id === currentUserId;
  const isDone    = task.status === 'done';
  const priority  = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const status    = STATUS_CONFIG[task.status]     || STATUS_CONFIG.todo;

  return (
    <>
      <style>{`
        .task-card {
          background: #111118;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          transition: all 0.2s cubic-bezier(0.16,1,0.3,1);
          position: relative;
          overflow: hidden;
        }
        .task-card::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          background: ${priority.color};
          opacity: ${isDone ? 0.3 : 0.8};
          border-radius: 3px 0 0 3px;
        }
        .task-card:hover {
          border-color: rgba(255,255,255,0.12);
          transform: translateX(4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }
        .task-card.done {
          opacity: 0.55;
        }

        .task-left { flex: 1; min-width: 0; }

        .task-title {
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 500;
          color: #e8e6e1;
          margin-bottom: 6px;
          line-height: 1.3;
          text-decoration: ${isDone ? 'line-through' : 'none'};
          color: ${isDone ? 'rgba(255,255,255,0.3)' : '#e8e6e1'};
        }

        .task-desc {
          font-size: 13px;
          color: rgba(255,255,255,0.35);
          margin-bottom: 10px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .task-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          align-items: center;
        }

        .tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.02em;
        }

        .priority-tag {
          color: ${priority.color};
          background: ${priority.bg};
          border: 1px solid ${priority.color}33;
        }

        .status-tag {
          color: ${status.color};
          background: ${status.bg};
        }

        .assignee-tag {
          color: #a78bfa;
          background: rgba(167,139,250,0.1);
          border: 1px solid rgba(167,139,250,0.2);
        }

        .due-tag {
          color: rgba(255,255,255,0.35);
          background: rgba(255,255,255,0.04);
        }

        .task-creator {
          margin-top: 8px;
          font-size: 11px;
          color: rgba(255,255,255,0.2);
        }

        .task-actions {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex-shrink: 0;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid transparent;
          transition: all 0.15s ease;
          font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
        }

        .complete-btn {
          background: rgba(34,197,94,0.08);
          color: #22c55e;
          border-color: rgba(34,197,94,0.2);
        }
        .complete-btn:hover {
          background: rgba(34,197,94,0.15);
          border-color: rgba(34,197,94,0.4);
          transform: translateY(-1px);
        }

        .delete-btn {
          background: rgba(239,68,68,0.06);
          color: #f87171;
          border-color: rgba(239,68,68,0.15);
        }
        .delete-btn:hover {
          background: rgba(239,68,68,0.12);
          border-color: rgba(239,68,68,0.3);
          transform: translateY(-1px);
        }
      `}</style>

      <div className={`task-card${isDone ? ' done' : ''}`}>
        <div className="task-left">
          <div className="task-title">{task.title}</div>
          {task.description && (
            <div className="task-desc">{task.description}</div>
          )}
          <div className="task-meta">
            <span className="tag priority-tag">
              <span style={{ width:5, height:5, borderRadius:'50%', background:priority.color, display:'inline-block' }} />
              {priority.label}
            </span>
            <span className="tag status-tag">
              {status.icon} {task.status.replace('_', ' ')}
            </span>
            {task.assignee && (
              <span className="tag assignee-tag">
                → {task.assignee.full_name.split(' ')[0]}
              </span>
            )}
            {task.due_date && (
              <span className="tag due-tag">
                📅 {task.due_date}
              </span>
            )}
          </div>
          {task.creator && (
            <div className="task-creator">
              by {isCreator ? 'you' : task.creator.full_name}
            </div>
          )}
        </div>

        <div className="task-actions">
          {!isDone && (
            <button className="action-btn complete-btn" onClick={() => onComplete(task)}>
              ✓ Done
            </button>
          )}
          {isCreator && (
            <button className="action-btn delete-btn" onClick={() => onDelete(task.id)}>
              ✕ Delete
            </button>
          )}
        </div>
      </div>
    </>
  );
}