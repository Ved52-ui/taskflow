'use client';
import { Task } from '@/types';

const PRIORITY_STYLES: Record<string, string> = {
  low:    'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-700',
  high:   'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

const STATUS_LABEL: Record<string, string> = {
  todo:        '○ To Do',
  in_progress: '◑ In Progress',
  done:        '✓ Done',
};

const STATUS_STYLE: Record<string, string> = {
  todo:        'bg-gray-100 text-gray-600',
  in_progress: 'bg-yellow-100 text-yellow-700',
  done:        'bg-green-100 text-green-700',
};

interface Props {
  task: Task;
  currentUserId: string;
  onComplete: (task: Task) => void;
  onDelete:   (id: string) => void;
}

export default function TaskCard({ task, currentUserId, onComplete, onDelete }: Props) {
  const isCreator = task.creator_id === currentUserId;

  return (
    <div className={`bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all ${task.status === 'done' ? 'opacity-60' : ''}`}>
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold text-gray-800 text-base ${task.status === 'done' ? 'line-through text-gray-400' : ''}`}>
            {task.title}
          </h4>
          {task.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</p>
          )}
          <div className="flex flex-wrap gap-2 mt-3">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${PRIORITY_STYLES[task.priority]}`}>
              {task.priority}
            </span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLE[task.status]}`}>
              {STATUS_LABEL[task.status]}
            </span>
            {task.assignee && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 font-medium">
                → {task.assignee.full_name}
              </span>
            )}
            {task.due_date && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                📅 {task.due_date}
              </span>
            )}
          </div>
          {task.creator && (
            <p className="text-xs text-gray-400 mt-2">
              Created by {isCreator ? 'you' : task.creator.full_name}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          {task.status !== 'done' && (
            <button
              onClick={() => onComplete(task)}
              className="text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-100 transition font-medium"
            >
              ✓ Complete
            </button>
          )}
          {isCreator && (
            <button
              onClick={() => onDelete(task.id)}
              className="text-xs bg-red-50 text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}