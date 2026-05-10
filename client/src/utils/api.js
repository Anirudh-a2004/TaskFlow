const API_URL = import.meta.env.VITE_API_URL || '/api';

const statuses = ['Todo', 'In Progress', 'Review', 'Completed'];

function demoSeed() {
  const existing = localStorage.getItem('ttm_demo_db');
  if (existing) return JSON.parse(existing);

  const now = Date.now();
  const users = [
    { _id: 'u_admin', name: 'Anirudh A', email: 'admin@taskflow.dev', password: 'password123', role: 'Admin', status: 'Active', title: 'Product Lead', department: 'Product', lastLoginAt: new Date(now - 1800000).toISOString() },
    { _id: 'u_maya', name: 'Maya Iyer', email: 'maya@taskflow.dev', password: 'password123', role: 'Member', status: 'Active', title: 'UX Designer', department: 'Design', lastLoginAt: new Date(now - 3600000).toISOString() },
    { _id: 'u_kabir', name: 'Kabir Mehta', email: 'kabir@taskflow.dev', password: 'password123', role: 'Member', status: 'Active', title: 'Full-stack Engineer', department: 'Engineering', lastLoginAt: new Date(now - 7200000).toISOString() },
    { _id: 'u_nisha', name: 'Nisha Rao', email: 'nisha@taskflow.dev', password: 'password123', role: 'Member', status: 'Blocked', title: 'QA Analyst', department: 'Quality', lastLoginAt: new Date(now - 86400000).toISOString() }
  ];
  const projects = [
    { _id: 'p_website', name: 'Website Redesign', description: 'Premium acquisition and onboarding refresh.', priority: 'High', progress: 64, archived: false, manager: users[1], deadline: new Date(now + 1000 * 60 * 60 * 24 * 12).toISOString(), members: users, color: '#6366f1' },
    { _id: 'p_mobile', name: 'Mobile App Launch', description: 'Release-ready mobile MVP with assignments and reminders.', priority: 'Urgent', progress: 38, archived: false, manager: users[2], deadline: new Date(now + 1000 * 60 * 60 * 24 * 7).toISOString(), members: [users[0], users[2]], color: '#14b8a6' },
    { _id: 'p_success', name: 'Customer Success Portal', description: 'Account health, inbox, chat, and reporting workflows.', priority: 'Medium', progress: 78, archived: true, manager: users[0], deadline: new Date(now + 1000 * 60 * 60 * 24 * 24).toISOString(), members: [users[0], users[1]], color: '#f59e0b' }
  ];
  const tasks = [
    { _id: 't_1', title: 'Design analytics dashboard', description: 'Glass dashboard with revenue-grade hierarchy and charts.', project: projects[0], assignee: users[1], status: 'In Progress', priority: 'High', dueDate: new Date(now + 86400000 * 3).toISOString(), attachments: [], subtasks: [{ title: 'Cards', completed: true }, { title: 'Charts', completed: false }] },
    { _id: 't_2', title: 'Build Kanban interactions', description: 'Drag-and-drop columns, subtle hover states, and quick edit flow.', project: projects[0], assignee: users[2], status: 'Review', priority: 'Urgent', dueDate: new Date(now + 86400000 * 5).toISOString(), attachments: [{ name: 'spec.pdf' }], subtasks: [] },
    { _id: 't_3', title: 'QA notification reminders', description: 'Validate assignment and deadline reminder states.', project: projects[1], assignee: users[2], status: 'Todo', priority: 'Medium', dueDate: new Date(now + 86400000 * 1).toISOString(), attachments: [], subtasks: [] },
    { _id: 't_4', title: 'Ship profile settings', description: 'Avatar, team role, and export controls.', project: projects[2], assignee: users[1], status: 'Completed', priority: 'Low', dueDate: new Date(now - 86400000 * 1).toISOString(), attachments: [], subtasks: [] }
  ];
  const notifications = [
    { _id: 'n_1', title: 'Task assigned', message: 'You were assigned Design analytics dashboard.', type: 'assignment', read: false, createdAt: new Date(now - 3600000).toISOString() },
    { _id: 'n_2', title: 'Deadline reminder', message: 'QA notification reminders is due tomorrow.', type: 'deadline', read: false, createdAt: new Date(now - 7200000).toISOString() },
    { _id: 'n_3', title: 'Comment added', message: 'Maya commented on Website Redesign.', type: 'comment', read: true, createdAt: new Date(now - 10800000).toISOString() }
  ];

  const db = {
    users,
    projects,
    tasks,
    notifications,
    activities: [
      ...tasks.map((task) => ({ _id: `a_${task._id}`, actor: users[0], action: 'task.updated', detail: task.title, severity: 'info', createdAt: new Date(now).toISOString() })),
      { _id: 'a_role', actor: users[0], action: 'role.changed', detail: 'Nisha Rao changed to Member', severity: 'warning', createdAt: new Date(now - 5400000).toISOString() },
      { _id: 'a_archive', actor: users[0], action: 'project.archived', detail: 'Customer Success Portal archived', severity: 'warning', createdAt: new Date(now - 9000000).toISOString() }
    ]
  };
  localStorage.setItem('ttm_demo_db', JSON.stringify(db));
  return db;
}

function saveDemo(db) {
  localStorage.setItem('ttm_demo_db', JSON.stringify(db));
}

function demoUserFromToken(db) {
  const id = localStorage.getItem('ttm_demo_user_id') || 'u_admin';
  return db.users.find((user) => user._id === id);
}

function filtered(items, path) {
  const url = new URL(`http://demo.local${path}`);
  const search = url.searchParams.get('search')?.toLowerCase();
  const result = search
    ? items.filter((item) => JSON.stringify(item).toLowerCase().includes(search))
    : items;
  return { items: result, page: 1, pages: 1, total: result.length };
}

function dashboard(db) {
  const completed = db.tasks.filter((task) => task.status === 'Completed');
  const pending = db.tasks.filter((task) => task.status !== 'Completed');
  const overdue = db.tasks.filter((task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Completed');
  return {
    cards: { projects: db.projects.length, completed: completed.length, pending: pending.length, overdue: overdue.length },
    statusCounts: statuses.map((status) => ({ name: status, value: db.tasks.filter((task) => task.status === status).length })),
    productivity: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => ({ day, created: 2 + (index % 3), completed: index % 4 })),
    recentActivity: db.activities,
    notifications: db.notifications,
    calendar: db.tasks.filter((task) => task.dueDate).map((task) => ({ id: task._id, title: task.title, date: task.dueDate, status: task.status, project: task.project.name }))
  };
}

async function mockApi(path, options = {}) {
  await new Promise((resolve) => setTimeout(resolve, 220));
  const db = demoSeed();
  const method = options.method || 'GET';
  const body = options.body && !(options.body instanceof FormData) ? JSON.parse(options.body) : {};

  if (path === '/auth/signup' && method === 'POST') {
    const user = { _id: `u_${Date.now()}`, name: body.name, email: body.email, password: body.password, role: db.users.length ? 'Member' : 'Admin', title: 'Team Member', department: 'Product' };
    db.users.push(user);
    saveDemo(db);
    localStorage.setItem('ttm_demo_user_id', user._id);
    const { password, ...safeUser } = user;
    return { token: `demo-token-${user._id}`, user: safeUser };
  }

  if (path === '/auth/login' && method === 'POST') {
    const user = db.users.find((item) => item.email === body.email && item.password === body.password);
    if (!user) throw new Error('Invalid email or password.');
    localStorage.setItem('ttm_demo_user_id', user._id);
    const { password, ...safeUser } = user;
    return { token: `demo-token-${user._id}`, user: safeUser };
  }

  if (path === '/auth/forgot-password') return { message: 'Demo reset email logged.' };
  if (path === '/auth/me') {
    const { password, ...safeUser } = demoUserFromToken(db) || db.users[0];
    return { user: safeUser };
  }
  if (path.startsWith('/dashboard')) return dashboard(db);
  if (path === '/admin/overview') {
    const dash = dashboard(db);
    const memberStats = db.users.map((user) => {
      const assigned = db.tasks.filter((task) => task.assignee?._id === user._id);
      const completed = assigned.filter((task) => task.status === 'Completed').length;
      const completionRate = assigned.length ? Math.round((completed / assigned.length) * 100) : 0;
      return { user, assigned: assigned.length, completed, completionRate, productivityScore: Math.min(100, completionRate + completed * 12 + assigned.length * 3) };
    }).sort((a, b) => b.productivityScore - a.productivityScore);
    return {
      cards: {
        totalUsers: db.users.length,
        activeProjects: db.projects.filter((project) => !project.archived).length,
        archivedProjects: db.projects.filter((project) => project.archived).length,
        completedTasks: dash.cards.completed,
        overdueTasks: dash.cards.overdue,
        blockedUsers: db.users.filter((user) => user.status && user.status !== 'Active').length
      },
      taskStatus: dash.statusCounts,
      productivity: dash.productivity.map((item) => ({ ...item, overdue: item.created % 2 })),
      memberStats,
      activities: db.activities,
      alerts: [
        { type: 'overdue', title: 'QA notification reminders', message: 'Task deadline is near and needs admin attention.' },
        { type: 'inactive', title: 'Customer Success Portal', message: 'Archived project has had no activity this week.' }
      ]
    };
  }
  if (path.startsWith('/admin/users/') && path.endsWith('/activity')) {
    const id = path.split('/')[3];
    return { items: db.activities.filter((item) => item.actor?._id === id || id) };
  }
  if (path.startsWith('/admin/users/') && path.endsWith('/reset-password')) {
    return { message: 'Password reset complete.' };
  }
  if (path.startsWith('/admin/users/') && method === 'PATCH') {
    const id = path.split('/')[3];
    const user = db.users.find((item) => item._id === id);
    Object.assign(user, body);
    db.activities.unshift({ _id: `a_${Date.now()}`, actor: demoUserFromToken(db), action: 'user.updated', detail: `${user.name} updated`, severity: body.status === 'Blocked' ? 'warning' : 'info', createdAt: new Date().toISOString() });
    saveDemo(db);
    return { user };
  }
  if (path.startsWith('/admin/users')) return filtered(db.users.map(({ password, ...user }) => user), path);
  if (path.startsWith('/admin/projects/') && path.endsWith('/archive')) {
    const id = path.split('/')[3];
    const project = db.projects.find((item) => item._id === id);
    project.archived = body.archived !== false;
    project.archivedAt = project.archived ? new Date().toISOString() : null;
    db.activities.unshift({ _id: `a_${Date.now()}`, actor: demoUserFromToken(db), action: project.archived ? 'project.archived' : 'project.restored', detail: project.name, severity: 'warning', createdAt: new Date().toISOString() });
    saveDemo(db);
    return { project };
  }
  if (path.startsWith('/admin/projects/') && method === 'PATCH') {
    const id = path.split('/')[3];
    const project = db.projects.find((item) => item._id === id);
    Object.assign(project, body);
    saveDemo(db);
    return { project };
  }
  if (path.startsWith('/admin/projects')) return filtered(db.projects, path);
  if (path.startsWith('/admin/tasks/bulk')) {
    for (const id of body.ids || []) {
      const task = db.tasks.find((item) => item._id === id);
      if (task) Object.assign(task, body);
    }
    saveDemo(db);
    return { message: `${body.ids?.length || 0} tasks updated.` };
  }
  if (path.startsWith('/admin/tasks')) return filtered(db.tasks, path);
  if (path.startsWith('/admin/audit-logs')) return filtered(db.activities, path);
  if (path.startsWith('/admin/announcements')) {
    db.notifications.unshift({ _id: `n_${Date.now()}`, title: body.title, message: body.message, type: 'system', read: false, createdAt: new Date().toISOString() });
    saveDemo(db);
    return { message: 'Announcement sent.', count: db.users.length };
  }
  if (path.startsWith('/admin/backup')) return { exportedAt: new Date().toISOString(), users: db.users, projects: db.projects, tasks: db.tasks, activities: db.activities, notifications: db.notifications };
  if (path.startsWith('/users')) return filtered(db.users.map(({ password, ...user }) => user), path);
  if (path === '/notifications/read' && method === 'PATCH') {
    const ids = body.ids || [];
    db.notifications = db.notifications.map((item) => (ids.includes(item._id) ? { ...item, read: true } : item));
    saveDemo(db);
    return { message: 'Notifications updated.' };
  }
  if (path.startsWith('/notifications')) return { items: db.notifications };
  if (path.startsWith('/projects') && method === 'GET') return filtered(db.projects, path);
  if (path === '/projects' && method === 'POST') {
    const members = db.users.filter((user) => body.members?.includes(user._id));
    const project = { _id: `p_${Date.now()}`, ...body, progress: 0, members, color: '#6366f1' };
    db.projects.unshift(project);
    saveDemo(db);
    return { project };
  }
  if (path.startsWith('/tasks') && method === 'GET') return filtered(db.tasks, path);
  if (path === '/tasks' && method === 'POST') {
    const project = db.projects.find((item) => item._id === body.project);
    const assignee = db.users.find((item) => item._id === body.assignee);
    const task = { _id: `t_${Date.now()}`, ...body, project, assignee, status: 'Todo', attachments: [], subtasks: [] };
    db.tasks.unshift(task);
    saveDemo(db);
    return { task };
  }
  if (path === '/tasks/reorder' && method === 'PATCH') {
    for (const update of body.tasks || []) {
      const task = db.tasks.find((item) => item._id === update.id);
      if (task) task.status = update.status;
    }
    saveDemo(db);
    return { message: 'Board updated.' };
  }
  if (path === '/users/profile' && method === 'PATCH') {
    const user = demoUserFromToken(db);
    Object.assign(user, body);
    saveDemo(db);
    const { password, ...safeUser } = user;
    return { user: safeUser };
  }

  return { message: 'Demo action completed.' };
}

export async function api(path, options = {}) {
  const token = localStorage.getItem('ttm_token');
  const isForm = options.body instanceof FormData;
  const headers = {
    Accept: 'application/json',
    ...(isForm ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {})
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const body = isForm ? options.body : options.body && typeof options.body === 'object' ? JSON.stringify(options.body) : options.body;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(`${API_URL}${path}`, { ...options, headers, body, signal: controller.signal });
    clearTimeout(timeout);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || 'Request failed.');
    }
    return data;
  } catch (error) {
    const isNetworkError =
      error.name === 'AbortError' ||
      error.message?.includes('Failed to fetch') ||
      error.message?.includes('NetworkError') ||
      error.message?.toLowerCase().includes('network');

    const useDemo = import.meta.env.VITE_USE_DEMO_API === 'true';
    if (!isNetworkError || !useDemo) throw error;
    return mockApi(path, options);
  }
}

export const qs = (params) => {
  const clean = Object.entries(params).filter(([, value]) => value !== undefined && value !== '' && value !== null);
  return clean.length ? `?${new URLSearchParams(clean).toString()}` : '';
};
