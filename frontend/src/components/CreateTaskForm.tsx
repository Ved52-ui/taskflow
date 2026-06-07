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
    setLoading(true);
    try {
      const res = await tasksApi.create({
        ...form,
        assignee_id: form.assignee_id || undefined,
        due_date: form.due_date || undefined,
      });
      onCreated(res.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-blue-100 rounded-2xl shadow-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Task</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          required
          placeholder="Task title *"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
        />
        <textarea
          placeholder="Description (optional)"
          rows={2}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Priority</label>
            <select
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={form.priority}
              onChange={e => setForm({ ...form, priority: e.target.value })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Due Date</label>
            <input
              type="date"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={form.due_date}
              onChange={e => setForm({ ...form, due_date: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Assign To</label>
          <select
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={form.assignee_id}
            onChange={e => setForm({ ...form, assignee_id: e.target.value })}
          >
            <option value="">Unassigned</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.full_name} {u.id === currentUserId ? '(You)' : `— ${u.email}`}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 font-medium"
          >
            {loading ? 'Creating...' : 'Create Task'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-500 px-5 py-2.5 rounded-xl hover:bg-gray-100 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}