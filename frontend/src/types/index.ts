export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  creator_id: string;
  assignee_id?: string;
  creator?: User;
  assignee?: User;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  priority?: Task['priority'];
  due_date?: string;
  assignee_id?: string;
}