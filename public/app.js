const state = {
  token: localStorage.getItem('ttm_token'),
  user: JSON.parse(localStorage.getItem('ttm_user') || 'null'),
  authMode: 'login',
  view: 'dashboard',
  users: [],
  projects: [],
  tasks: [],
  dashboard: null,
  taskFilter: 'ALL'
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const icons = {
  activity: '<path d="M22 12h-4l-3 8-6-16-3 8H2"/>',
  'briefcase-business': '<path d="M12 12h.01"/><path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M22 13a18.15 18.15 0 0 1-20 0"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
  circle: '<circle cx="12" cy="12" r="10"/>',
  'circle-check-big': '<path d="M21.8 11.1A10 10 0 1 1 12.9 2"/><path d="m9 11 3 3L22 4"/>',
  'folder-kanban': '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/><path d="M8 10v4"/><path d="M12 10v2"/><path d="M16 10v6"/>',
  'folder-plus': '<path d="M12 10v6"/><path d="M9 13h6"/><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.7-.9l-.8-1.2A2 2 0 0 0 7.9 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>',
  folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.7-.9l-.8-1.2A2 2 0 0 0 7.9 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>',
  'kanban-square': '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M8 7v7"/><path d="M12 7v4"/><path d="M16 7v9"/>',
  'layers-3': '<path d="m12.8 2.6 8 4.1a1 1 0 0 1 0 1.8l-8 4.1a1.8 1.8 0 0 1-1.6 0l-8-4.1a1 1 0 0 1 0-1.8l8-4.1a1.8 1.8 0 0 1 1.6 0Z"/><path d="m22 12-9.2 4.7a1.8 1.8 0 0 1-1.6 0L2 12"/><path d="m22 17-9.2 4.7a1.8 1.8 0 0 1-1.6 0L2 17"/>',
  'layout-dashboard': '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
  'list-checks': '<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>',
  'loader-circle': '<path d="M21 12a9 9 0 1 1-6.2-8.6"/>',
  'log-in': '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="m10 17 5-5-5-5"/><path d="M15 12H3"/>',
  'log-out': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  'shield-check': '<path d="M20 13c0 5-3.5 7.5-7.7 8.9a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.5a1.3 1.3 0 0 1 1.6 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1Z"/><path d="m9 12 2 2 4-4"/>',
  'square-plus': '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M8 12h8"/><path d="M12 8v8"/>',
  'triangle-alert': '<path d="m21.7 18-8-14a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  'user-check': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m16 11 2 2 4-4"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>'
};

function iconRefresh() {
  $$('i[data-lucide]').forEach((node) => {
    const name = node.dataset.lucide;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = icons[name] || icons.circle;
    node.replaceWith(svg);
  });
}

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;

  const response = await fetch(path, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Request failed.');
  }
  return data;
}

function setSession({ token, user }) {
  state.token = token;
  state.user = user;
  localStorage.setItem('ttm_token', token);
  localStorage.setItem('ttm_user', JSON.stringify(user));
}

function clearSession() {
  state.token = null;
  state.user = null;
  localStorage.removeItem('ttm_token');
  localStorage.removeItem('ttm_user');
}

function showMessage(text, isError = false) {
  const el = $('#message');
  el.textContent = text;
  el.classList.remove('hidden');
  el.style.borderColor = isError ? '#efb4ae' : '#b9d4d0';
  el.style.background = isError ? '#fff1ef' : '#e9f5f3';
  el.style.color = isError ? '#8d231a' : '#104f4d';
  setTimeout(() => el.classList.add('hidden'), 3600);
}

function setAuthMode(mode) {
  state.authMode = mode;
  $$('[data-auth-mode]').forEach((btn) => btn.classList.toggle('active', btn.dataset.authMode === mode));
  $$('.signup-only').forEach((el) => el.classList.toggle('hidden', mode !== 'signup'));
  $('#auth-submit-label').textContent = mode === 'signup' ? 'Create account' : 'Login';
  $('#auth-error').textContent = '';
}

function showApp() {
  $('#auth-view').classList.add('hidden');
  $('#app-view').classList.remove('hidden');
  $('#current-user').innerHTML = `
    <span class="avatar">${escapeHtml(state.user.name.slice(0, 1).toUpperCase())}</span>
    <span>${escapeHtml(state.user.name)}</span>
    <small>${escapeHtml(state.user.email)}</small>
  `;
  $('#user-role').textContent = state.user.role;
  $$('.admin-only').forEach((el) => el.classList.toggle('hidden', state.user.role !== 'ADMIN'));
  setView(state.view);
}

function showAuth() {
  $('#auth-view').classList.remove('hidden');
  $('#app-view').classList.add('hidden');
}

function setView(view) {
  state.view = view;
  const titles = { dashboard: 'Dashboard', projects: 'Projects', tasks: 'Tasks' };
  $('#page-title').textContent = titles[view];
  $$('.nav-btn').forEach((btn) => btn.classList.toggle('active', btn.dataset.view === view));
  $$('.view-section').forEach((section) => section.classList.add('hidden'));
  $(`#${view}-section`).classList.remove('hidden');
  loadData();
}

async function loadData() {
  if (!state.token) return;
  try {
    const [users, projects, tasks, dashboard] = await Promise.all([
      api('/api/users'),
      api('/api/projects'),
      api('/api/tasks'),
      api('/api/dashboard')
    ]);
    state.users = users.users;
    state.projects = projects.projects;
    state.tasks = tasks.tasks;
    state.dashboard = dashboard;
    render();
  } catch (err) {
    if (err.message.includes('expired') || err.message.includes('Authentication')) {
      clearSession();
      showAuth();
    } else {
      showMessage(err.message, true);
    }
  }
}

function render() {
  renderDashboard();
  renderProjects();
  renderTasks();
  fillForms();
  iconRefresh();
}

function renderDashboard() {
  const summary = state.dashboard?.summary || {};
  const stats = [
    ['Total', summary.total || 0, 'layers-3'],
    ['Todo', summary.todo || 0, 'circle'],
    ['In progress', summary.inProgress || 0, 'loader-circle'],
    ['Done', summary.done || 0, 'circle-check-big'],
    ['Overdue', summary.overdue || 0, 'triangle-alert']
  ];
  $('#stats').innerHTML = stats.map(([label, value, icon]) => `
    <article class="stat">
      <span class="stat-icon"><i data-lucide="${icon}"></i></span>
      <div>
        <span>${label}</span>
        <strong>${value}</strong>
      </div>
    </article>
  `).join('');

  $('#dashboard-tasks').innerHTML = renderTaskCards(state.dashboard?.tasks || []);
}

function renderProjects() {
  if (!state.projects.length) {
    $('#projects-list').innerHTML = `<div class="empty">No projects yet.</div>`;
    return;
  }

  $('#projects-list').innerHTML = state.projects.map((project) => `
    <article class="project-card">
      <header>
        <div>
          <h4>${escapeHtml(project.name)}</h4>
          <p>${escapeHtml(project.description || 'No description')}</p>
        </div>
        <span class="pill project-pill"><i data-lucide="briefcase-business"></i>${project.taskCount} tasks</span>
      </header>
      <div class="meta">
        <span><i data-lucide="user"></i> ${escapeHtml(project.ownerName || 'Owner')}</span>
        <span><i data-lucide="users"></i> ${project.memberCount} members</span>
      </div>
    </article>
  `).join('');
}

function renderTasks() {
  const tasks = state.taskFilter === 'ALL'
    ? state.tasks
    : state.tasks.filter((task) => task.status === state.taskFilter);
  $('#tasks-list').innerHTML = renderTaskCards(tasks);
}

function renderTaskCards(tasks) {
  if (!tasks.length) return `<div class="empty">No tasks to show.</div>`;
  const today = new Date().toISOString().slice(0, 10);

  return tasks.map((task) => {
    const overdue = task.dueDate && task.dueDate < today && task.status !== 'DONE';
    const canUpdate = state.user.role === 'ADMIN' || task.assigneeId === state.user.id;
    return `
      <article class="task-card">
        <header>
          <div>
            <h4>${escapeHtml(task.title)}</h4>
            <p>${escapeHtml(task.description || 'No description')}</p>
          </div>
          <span class="pill ${task.status === 'DONE' ? 'done' : ''}"><i data-lucide="${statusIcon(task.status)}"></i>${statusLabel(task.status)}</span>
        </header>
        <div class="meta">
          <span><i data-lucide="folder"></i> ${escapeHtml(task.projectName)}</span>
          <span><i data-lucide="user-check"></i> ${escapeHtml(task.assigneeName || 'Unassigned')}</span>
          <span class="pill ${task.priority === 'HIGH' ? 'high' : ''}">${task.priority}</span>
          ${task.dueDate ? `<span class="pill ${overdue ? 'overdue' : ''}">${overdue ? 'Overdue ' : 'Due '}${task.dueDate}</span>` : ''}
        </div>
        ${canUpdate ? `
          <div class="task-actions">
            ${['TODO', 'IN_PROGRESS', 'DONE'].map((status) => `
              <button class="status-btn ${task.status === status ? 'active' : ''}" data-task-id="${task.id}" data-status="${status}">
                ${statusLabel(status)}
              </button>
            `).join('')}
          </div>
        ` : ''}
      </article>
    `;
  }).join('');
}

function fillForms() {
  const memberSelect = $('#project-form select[name="memberIds"]');
  memberSelect.innerHTML = state.users.map((user) => `
    <option value="${user.id}">${escapeHtml(user.name)} (${user.role})</option>
  `).join('');

  const projectSelect = $('#task-form select[name="projectId"]');
  projectSelect.innerHTML = state.projects.map((project) => `
    <option value="${project.id}">${escapeHtml(project.name)}</option>
  `).join('');

  const assigneeSelect = $('#task-form select[name="assigneeId"]');
  assigneeSelect.innerHTML = `<option value="">Unassigned</option>` + state.users.map((user) => `
    <option value="${user.id}">${escapeHtml(user.name)}</option>
  `).join('');
}

function statusLabel(status) {
  return {
    TODO: 'Todo',
    IN_PROGRESS: 'In progress',
    DONE: 'Done'
  }[status] || status;
}

function statusIcon(status) {
  return {
    TODO: 'circle',
    IN_PROGRESS: 'loader-circle',
    DONE: 'circle-check-big'
  }[status] || 'circle';
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formBody(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function bindEvents() {
  $$('[data-auth-mode]').forEach((button) => {
    button.addEventListener('click', () => setAuthMode(button.dataset.authMode));
  });

  $('#auth-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    $('#auth-error').textContent = '';
    const body = formBody(event.currentTarget);
    const path = state.authMode === 'signup' ? '/api/auth/signup' : '/api/auth/login';

    try {
      const session = await api(path, { method: 'POST', body: JSON.stringify(body) });
      setSession(session);
      showApp();
      await loadData();
    } catch (err) {
      $('#auth-error').textContent = err.message;
    }
  });

  $$('.nav-btn').forEach((button) => {
    button.addEventListener('click', () => setView(button.dataset.view));
  });

  $('#logout-btn').addEventListener('click', () => {
    clearSession();
    showAuth();
  });

  $('#project-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const body = formBody(form);
    body.memberIds = Array.from(form.elements.memberIds.selectedOptions).map((option) => Number(option.value));

    try {
      await api('/api/projects', { method: 'POST', body: JSON.stringify(body) });
      form.reset();
      showMessage('Project created.');
      await loadData();
    } catch (err) {
      showMessage(err.message, true);
    }
  });

  $('#task-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const body = formBody(form);
    body.projectId = Number(body.projectId);
    body.assigneeId = body.assigneeId ? Number(body.assigneeId) : null;

    try {
      await api('/api/tasks', { method: 'POST', body: JSON.stringify(body) });
      form.reset();
      showMessage('Task created.');
      await loadData();
    } catch (err) {
      showMessage(err.message, true);
    }
  });

  $('#task-filter').addEventListener('change', (event) => {
    state.taskFilter = event.target.value;
    renderTasks();
    iconRefresh();
  });

  document.body.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-task-id][data-status]');
    if (!button) return;
    try {
      await api(`/api/tasks/${button.dataset.taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: button.dataset.status })
      });
      await loadData();
    } catch (err) {
      showMessage(err.message, true);
    }
  });
}

bindEvents();
setAuthMode('login');
if (state.token && state.user) {
  showApp();
  loadData();
} else {
  showAuth();
  iconRefresh();
}
