import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Archive, BellPlus, DatabaseBackup, Download, LockKeyhole, RotateCcw, Search, ShieldAlert, SlidersHorizontal, UserCog, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import AdminTable from '../components/AdminTable.jsx';
import Badge from '../components/Badge.jsx';
import { api } from '../utils/api.js';

const tabs = ['Overview', 'Users', 'Projects', 'Tasks', 'Audit Logs', 'Announcements'];

export default function Admin() {
  const [active, setActive] = useState('Overview');
  const [search, setSearch] = useState('');
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [notice, setNotice] = useState({ title: '', message: '' });

  const load = async () => {
    const [summary, userData, projectData, taskData, logData] = await Promise.all([
      api('/admin/overview'),
      api(`/admin/users?search=${encodeURIComponent(search)}`),
      api(`/admin/projects?search=${encodeURIComponent(search)}`),
      api(`/admin/tasks?search=${encodeURIComponent(search)}`),
      api('/admin/audit-logs?limit=100')
    ]);
    setOverview(summary);
    setUsers(userData.items);
    setProjects(projectData.items);
    setTasks(taskData.items);
    setLogs(logData.items);
  };

  useEffect(() => {
    load();
  }, [search]);

  const userColumns = useMemo(() => [
    { key: 'name', label: 'User', render: (user) => <div><p className="font-black">{user.name}</p><p className="text-xs text-slate-500">{user.email}</p></div> },
    { key: 'role', label: 'Role', render: (user) => <Badge>{user.role}</Badge> },
    { key: 'status', label: 'Status', render: (user) => <span className={`pill ${(user.status || 'Active') === 'Active' ? 'bg-emerald-400/10 text-emerald-200' : 'bg-rose-400/10 text-rose-200'}`}>{user.status || 'Active'}</span> },
    { key: 'department', label: 'Department' },
    { key: 'lastLoginAt', label: 'Last login', render: (user) => user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never' },
    { key: 'actions', label: 'Actions', render: (user) => (
      <div className="flex gap-2">
        <button className="btn-secondary !px-3 !py-2" onClick={() => updateUser(user._id, { role: user.role === 'Admin' ? 'Member' : 'Admin' })}><UserCog size={14} />Role</button>
        <button className="btn-secondary !px-3 !py-2" onClick={() => updateUser(user._id, { status: (user.status || 'Active') === 'Active' ? 'Blocked' : 'Active' })}><ShieldAlert size={14} />{(user.status || 'Active') === 'Active' ? 'Block' : 'Activate'}</button>
        <button className="btn-secondary !px-3 !py-2" onClick={() => resetPassword(user._id)}><LockKeyhole size={14} />Reset</button>
      </div>
    ) }
  ], []);

  const projectColumns = [
    { key: 'name', label: 'Project', render: (project) => <div><p className="font-black">{project.name}</p><p className="text-xs text-slate-500">{project.description}</p></div> },
    { key: 'priority', label: 'Priority', render: (project) => <Badge>{project.priority}</Badge> },
    { key: 'manager', label: 'Manager', render: (project) => project.manager?.name || 'Unassigned' },
    { key: 'progress', label: 'Progress', render: (project) => <div className="w-36"><div className="h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-fuchsia-500" style={{ width: `${project.progress || 0}%` }} /></div><p className="mt-1 text-xs font-bold text-slate-500">{project.progress || 0}%</p></div> },
    { key: 'archived', label: 'State', render: (project) => <span className="pill bg-white/10 text-slate-300">{project.archived ? 'Archived' : 'Active'}</span> },
    { key: 'actions', label: 'Actions', render: (project) => <button className="btn-secondary !px-3 !py-2" onClick={() => archiveProject(project)}>{project.archived ? <RotateCcw size={14} /> : <Archive size={14} />}{project.archived ? 'Restore' : 'Archive'}</button> }
  ];

  const taskColumns = [
    { key: 'select', label: '', render: (task) => <input type="checkbox" checked={selectedTasks.includes(task._id)} onChange={(e) => setSelectedTasks((ids) => e.target.checked ? [...ids, task._id] : ids.filter((id) => id !== task._id))} /> },
    { key: 'title', label: 'Task', render: (task) => <div><p className="font-black">{task.title}</p><p className="text-xs text-slate-500">{task.project?.name}</p></div> },
    { key: 'assignee', label: 'Assignee', render: (task) => task.assignee?.name || 'Unassigned' },
    { key: 'status', label: 'Status', render: (task) => <Badge>{task.status}</Badge> },
    { key: 'priority', label: 'Priority', render: (task) => <Badge>{task.priority}</Badge> },
    { key: 'dueDate', label: 'Due', render: (task) => task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'None' },
    { key: 'actions', label: 'Authority', render: (task) => <button className="btn-secondary !px-3 !py-2" onClick={() => bulkUpdate([task._id], { priority: 'Urgent' })}>Mark urgent</button> }
  ];

  const updateUser = async (id, patch) => {
    await api(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
    toast.success('User updated.');
    load();
  };

  const resetPassword = async (id) => {
    await api(`/admin/users/${id}/reset-password`, { method: 'POST', body: JSON.stringify({ password: 'password123' }) });
    toast.success('Password reset to password123.');
  };

  const archiveProject = async (project) => {
    await api(`/admin/projects/${project._id}/archive`, { method: 'PATCH', body: JSON.stringify({ archived: !project.archived }) });
    toast.success(project.archived ? 'Project restored.' : 'Project archived.');
    load();
  };

  const bulkUpdate = async (ids = selectedTasks, patch = {}) => {
    if (!ids.length) return toast.error('Select at least one task.');
    await api('/admin/tasks/bulk', { method: 'PATCH', body: JSON.stringify({ ids, ...patch }) });
    toast.success('Bulk update applied.');
    setSelectedTasks([]);
    load();
  };

  const sendAnnouncement = async (event) => {
    event.preventDefault();
    await api('/admin/announcements', { method: 'POST', body: JSON.stringify(notice) });
    toast.success('Announcement sent.');
    setNotice({ title: '', message: '' });
  };

  const exportBackup = async () => {
    const data = await api('/admin/backup');
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'taskflow-backup.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!overview) return <div className="premium-card p-8 text-center font-black">Loading admin console...</div>;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase text-rose-300">Enterprise controls</p>
          <h1 className="text-3xl font-black tracking-tight">Admin Control Center</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportBackup} className="btn-secondary"><DatabaseBackup size={18} />Backup</button>
          <button onClick={() => window.print()} className="btn-secondary"><Download size={18} />Export report</button>
        </div>
      </div>

      <div className="premium-card p-2">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActive(tab)} className={`rounded-2xl px-4 py-3 text-sm font-black transition ${active === tab ? 'bg-white/12 text-cyan-200 ring-1 ring-white/10' : 'text-slate-400 hover:bg-white/[0.06] hover:text-white'}`}>{tab}</button>
          ))}
        </div>
      </div>

      {active !== 'Overview' && (
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} className="input pl-11" placeholder="Search admin records..." />
        </div>
      )}

      {active === 'Overview' && (
        <AdminOverview overview={overview} />
      )}
      {active === 'Users' && <AdminTable columns={userColumns} rows={users} />}
      {active === 'Projects' && <AdminTable columns={projectColumns} rows={projects} />}
      {active === 'Tasks' && (
        <div className="grid gap-4">
          <div className="premium-card flex flex-wrap items-center justify-between gap-3 p-4">
            <p className="font-bold text-slate-300">{selectedTasks.length} tasks selected</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => bulkUpdate(selectedTasks, { status: 'Completed' })} className="btn-secondary"><SlidersHorizontal size={16} />Force complete</button>
              <button onClick={() => bulkUpdate(selectedTasks, { priority: 'Urgent' })} className="btn-secondary"><ShieldAlert size={16} />Mark urgent</button>
            </div>
          </div>
          <AdminTable columns={taskColumns} rows={tasks} />
        </div>
      )}
      {active === 'Audit Logs' && <AdminTable columns={[
        { key: 'createdAt', label: 'Timestamp', render: (log) => new Date(log.createdAt).toLocaleString() },
        { key: 'actor', label: 'Actor', render: (log) => log.actor?.name || 'System' },
        { key: 'action', label: 'Action' },
        { key: 'detail', label: 'Detail' },
        { key: 'severity', label: 'Severity', render: (log) => <span className={`pill ${log.severity === 'warning' ? 'bg-amber-400/10 text-amber-200' : 'bg-blue-400/10 text-blue-200'}`}>{log.severity || 'info'}</span> }
      ]} rows={logs} />}
      {active === 'Announcements' && (
        <form onSubmit={sendAnnouncement} className="premium-card grid gap-4 p-6">
          <h2 className="flex items-center gap-2 text-xl font-black"><BellPlus className="text-cyan-300" />Organization-wide notice</h2>
          <input className="input" placeholder="Announcement title" value={notice.title} onChange={(e) => setNotice({ ...notice, title: e.target.value })} required />
          <textarea className="input min-h-36" placeholder="Message for all users" value={notice.message} onChange={(e) => setNotice({ ...notice, message: e.target.value })} required />
          <button className="btn-primary w-fit">Send announcement</button>
        </form>
      )}
    </div>
  );
}

function AdminOverview({ overview }) {
  const cards = [
    ['Total users', overview.cards.totalUsers, Users],
    ['Active projects', overview.cards.activeProjects, SlidersHorizontal],
    ['Completed tasks', overview.cards.completedTasks, ShieldAlert],
    ['Overdue tasks', overview.cards.overdueTasks, ShieldAlert],
    ['Blocked users', overview.cards.blockedUsers, LockKeyhole]
  ];

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {cards.map(([label, value, Icon], index) => (
          <motion.article key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }} className="premium-card p-5">
            <div className="mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-500/25 to-fuchsia-500/25 text-cyan-200 ring-1 ring-white/10"><Icon size={20} /></div>
            <p className="text-sm font-bold text-slate-400">{label}</p>
            <p className="mt-2 text-3xl font-black">{value}</p>
          </motion.article>
        ))}
      </section>
      <section className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <div className="premium-card min-w-0 p-5">
          <h2 className="mb-4 text-xl font-black">Weekly performance</h2>
          <div className="h-80 min-w-0">
            <ResponsiveContainer>
              <BarChart data={overview.productivity}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,.16)" />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis allowDecimals={false} stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="completed" fill="#22d3ee" radius={[8, 8, 0, 0]} />
                <Bar dataKey="overdue" fill="#fb7185" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="premium-card min-w-0 p-5">
          <h2 className="mb-4 text-xl font-black">Task distribution</h2>
          <div className="h-80 min-w-0">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={overview.taskStatus} dataKey="value" nameKey="name" innerRadius={60} outerRadius={102} paddingAngle={6}>
                  {['#64748b', '#22d3ee', '#a78bfa', '#34d399'].map((color) => <Cell key={color} fill={color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
      <section className="grid gap-6 xl:grid-cols-2">
        <div className="premium-card p-5">
          <h2 className="mb-4 text-xl font-black">Most active members</h2>
          <div className="grid gap-3">
            {overview.memberStats.slice(0, 5).map((item, index) => (
              <div key={item.user._id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-white/10 font-black">{index + 1}</span><div><p className="font-black">{item.user.name}</p><p className="text-xs text-slate-500">{item.completed}/{item.assigned} completed</p></div></div>
                <span className="text-lg font-black text-cyan-300">{item.productivityScore}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="premium-card p-5">
          <h2 className="mb-4 text-xl font-black">Admin alerts</h2>
          <div className="grid gap-3">
            {overview.alerts.map((alert) => (
              <div key={alert.title} className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.06] p-3">
                <p className="font-black text-amber-100">{alert.title}</p>
                <p className="text-sm text-slate-400">{alert.message}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
