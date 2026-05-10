import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BadgeCheck, Calendar, CheckCircle2, Crown, FolderKanban, Plus, Timer, Trash2, UserPlus, Users, UsersRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import { api, qs } from '../utils/api.js';
import Skeleton, { EmptyState, SkeletonStack } from '../components/Skeleton.jsx';
import Badge from '../components/Badge.jsx';
import Modal from '../components/Modal.jsx';
import { useLocation, useNavigate } from 'react-router-dom';

const statusLabel = (project) => {
  if (project.archived) return 'Archived';
  if (project.status === 'Completed') return 'Completed';
  if ((project.progress || 0) === 100) return 'Ready for approval';
  if ((project.progress || 0) > 0) return project.status || 'In Progress';
  return project.status || 'Active';
};

export default function Projects() {
  const { isAdmin } = useAuth();
  const { search } = useApp();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', priority: 'Medium', deadline: '', manager: '', members: [] });
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [projectDetail, setProjectDetail] = useState(null);
  const [projectTasks, setProjectTasks] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [tab, setTab] = useState('Active');
  const [approving, setApproving] = useState(false);
  const [showApproved, setShowApproved] = useState(false);
  const [memberDraft, setMemberDraft] = useState([]);
  const [savingMembers, setSavingMembers] = useState(false);
  const [showMemberManager, setShowMemberManager] = useState(false);

  const openCreate = () => {
    if (!isAdmin) return toast.error('Only admins can create projects.', { className: 'tf-toast' });
    setShowCreateForm(true);
  };

  const load = async () => {
    setLoading(true);
    try {
      const [projectData, userData] = await Promise.all([
        api(`/projects${qs({ search })}`),
        api('/users?limit=100')
      ]);
      setProjects(projectData.items || []);
      setUsers(userData.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [search]);

  useEffect(() => {
    if (location.hash !== '#create-project') return;
    setShowCreateForm(true);
    window.history.replaceState(null, '', location.pathname);
  }, [location.hash, location.pathname]);

  const create = async (event) => {
    event.preventDefault();
    const manager = form.manager || undefined;
    await api('/projects', { method: 'POST', body: JSON.stringify({ ...form, manager }) });
    toast.success('Project created.');
    setForm({ name: '', description: '', priority: 'Medium', deadline: '', manager: '', members: [] });
    setShowCreateForm(false);
    load();
  };

  const remove = async (id) => {
    await api(`/projects/${id}`, { method: 'DELETE' });
    toast.success('Project deleted.');
    load();
  };

  const openProject = async (projectId) => {
    setActiveProjectId(projectId);
    setDetailLoading(true);
    setProjectDetail(null);
    setProjectTasks([]);
    try {
      const [projectRes, tasksRes] = await Promise.all([
        api(`/projects/${projectId}`),
        api(`/tasks${qs({ project: projectId, limit: 200 })}`)
      ]);
      setProjectDetail(projectRes.project || projectRes);
      const nextProject = projectRes.project || projectRes;
      setMemberDraft((nextProject.members || []).map((m) => m?._id || m));
      setProjectTasks(tasksRes.items || []);
    } catch (error) {
      toast.error(error.message || 'Unable to load project details.');
      setActiveProjectId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeProject = () => {
    setActiveProjectId(null);
    setProjectDetail(null);
    setProjectTasks([]);
  };

  const taskStats = useMemo(() => {
    const counts = { Todo: 0, 'In Progress': 0, Review: 0, Completed: 0 };
    projectTasks.forEach((task) => {
      counts[task.status] = (counts[task.status] || 0) + 1;
    });
    const total = projectTasks.length;
    const completed = counts.Completed || 0;
    const progress = total ? Math.round((completed / total) * 100) : 0;
    const overdue = projectTasks.filter((task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Completed').length;
    return { counts, total, completed, progress, overdue };
  }, [projectTasks]);

  const canApproveCompletion = useMemo(() => {
    if (!projectDetail || projectDetail.archived) return false;
    const isLead = projectDetail.manager && (projectDetail.manager?._id || projectDetail.manager) === user?._id;
    const ready = (projectDetail.progress || 0) === 100 && projectDetail.status !== 'Completed';
    return Boolean(isLead && ready);
  }, [projectDetail, user?._id]);

  const canManageMembers = useMemo(() => {
    if (!projectDetail) return false;
    const isLead = projectDetail.manager && (projectDetail.manager?._id || projectDetail.manager) === user?._id;
    return Boolean(isAdmin || isLead);
  }, [projectDetail, isAdmin, user?._id]);

  const saveMembers = async () => {
    if (!projectDetail || savingMembers) return false;
    setSavingMembers(true);
    try {
      const res = await api(`/projects/${projectDetail._id}/members`, { method: 'PATCH', body: JSON.stringify({ members: memberDraft }) });
      const next = res.project || res;
      setProjectDetail(next);
      toast.success('Project members updated.', { className: 'tf-toast' });
      load();
      return true;
    } catch (error) {
      toast.error(error.message || 'Unable to update members.', { className: 'tf-toast' });
      return false;
    } finally {
      setSavingMembers(false);
    }
  };

  const openMemberManager = () => {
    if (!canManageMembers) {
      toast.error('Only Admins or the assigned Project Lead can manage project members.', { className: 'tf-toast' });
      return;
    }
    setMemberDraft((projectDetail?.members || []).map((m) => m?._id || m));
    setShowMemberManager(true);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const projectId = params.get('project');
    if (!projectId) return;
    openProject(projectId);
    params.delete('project');
    const next = params.toString();
    window.history.replaceState(null, '', `${location.pathname}${next ? `?${next}` : ''}`);
  }, [location.pathname, location.search]);

  const approveCompletion = async () => {
    if (!projectDetail || approving) return;
    setApproving(true);
    try {
      const res = await api(`/projects/${projectDetail._id}/approve-completion`, { method: 'POST' });
      const next = res.project || res;
      setProjectDetail(next);
      toast.success('Project marked completed.', { className: 'tf-toast' });
      setShowApproved(true);
      window.setTimeout(() => setShowApproved(false), 1200);
      load();
    } catch (error) {
      toast.error(error.message || 'Unable to complete project.', { className: 'tf-toast' });
    } finally {
      setApproving(false);
    }
  };

  const visibleProjects = useMemo(() => {
    if (tab === 'Completed') {
      return projects.filter((project) => !project.archived && project.status === 'Completed');
    }
    // Active tab: show everything not completed (archived stays visible but clearly labeled)
    return projects.filter((project) => project.status !== 'Completed');
  }, [projects, tab]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-6 sm:gap-8">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-fuchsia-300 sm:text-sm">Portfolio</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-white sm:text-4xl">Projects</h1>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-400">Plan initiatives, assign members, and track delivery progress.</p>
        </div>
        <motion.button
          whileHover={isAdmin ? { scale: 1.03, y: -2 } : undefined}
          whileTap={isAdmin ? { scale: 0.97 } : undefined}
          onClick={openCreate}
          className="btn-secondary w-full sm:w-auto"
          aria-disabled={!isAdmin}
          title={!isAdmin ? 'Admin access required to create projects' : 'Create a new project'}
        >
          <Plus size={18} />
          New project
        </motion.button>
      </div>

      {loading ? (
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="card p-5">
                <Skeleton className="h-2 w-full rounded-full" />
                <div className="mt-5 flex items-start justify-between gap-4">
                  <div className="grid flex-1 gap-3">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                  <Skeleton className="h-7 w-20 rounded-full" />
                </div>
                <div className="mt-5 flex gap-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
          {isAdmin && <SkeletonStack rows={5} className="card h-fit p-5" />}
        </div>
      ) : (
        <section className="grid gap-6">
          <div className="premium-card p-2">
            <div className="flex gap-2 overflow-x-auto">
              {['Active', 'Completed'].map((item) => (
                <button
                  key={item}
                  onClick={() => setTab(item)}
                  className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
                    tab === item ? 'bg-white/12 text-cyan-200 ring-1 ring-white/10' : 'text-slate-400 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  {item} projects
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {visibleProjects.length === 0 ? (
              <div className="col-span-full">
                <EmptyState
                  icon={FolderKanban}
                  title={tab === 'Completed' ? 'No completed projects yet' : 'No projects yet — create your first project'}
                  description={tab === 'Completed' ? 'Once a project lead approves completion, it will appear here with full analytics history.' : 'Create a project, assign a Project Lead, and invite members to get work moving.'}
                  action={
                    tab === 'Completed' ? (
                      <button type="button" onClick={() => setTab('Active')} className="btn-secondary">
                        View active projects
                      </button>
                    ) : (
                      <button type="button" onClick={openCreate} className="btn-primary">
                        <Plus size={18} />
                        Create project
                      </button>
                    )
                  }
                />
              </div>
            ) : (
              visibleProjects.map((project, index) => (
                <motion.article
                  key={project._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ y: -4 }}
                  onClick={() => openProject(project._id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') openProject(project._id);
                  }}
                  className="card group cursor-pointer overflow-hidden p-5 transition duration-300 hover:border-cyan-300/30 hover:bg-white/[0.085]"
                >
                  <div className="mb-5 h-2 rounded-full bg-white/10">
                    <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-fuchsia-500" style={{ width: `${project.progress || 0}%` }} />
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-black text-white">{project.name}</h2>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">{project.description}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {project.manager?.name && (
                          <span className="pill bg-amber-400/10 text-amber-100">
                            <Crown size={14} />
                            Lead: {project.manager.name}
                          </span>
                        )}
                        {(project.progress || 0) === 100 && project.status !== 'Completed' && !project.archived && (
                          <span className="pill bg-cyan-400/10 text-cyan-200">
                            <BadgeCheck size={14} />
                            Ready for approval
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="grid gap-2 justify-items-end">
                      <Badge>{project.priority}</Badge>
                      <Badge>{statusLabel(project)}</Badge>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-400">
                    <span className="flex items-center gap-1"><Users size={16} />{project.members?.length || 0} members</span>
                    {project.deadline && <span className="flex items-center gap-1"><Calendar size={16} />{new Date(project.deadline).toLocaleDateString()}</span>}
                    <span>{project.progress || 0}% complete</span>
                  </div>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        remove(project._id);
                      }}
                      className="btn-secondary mt-5 w-full justify-center !py-2 text-rose-400"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  )}
                </motion.article>
              ))
            )}
          </div>
        </section>
      )}

      <Modal
        open={isAdmin && showCreateForm}
        onClose={() => setShowCreateForm(false)}
        title="Create project"
        description="Add a new initiative, assign a Project Lead, then invite members."
        size="md"
      >
        <form id="create-project" onSubmit={create} className="grid gap-4">
          <input className="input" placeholder="Project name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <textarea className="input min-h-28" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              {['Low', 'Medium', 'High', 'Urgent'].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <input className="input" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          </div>
          <select
            className="input"
            value={form.manager}
            onChange={(e) => setForm({ ...form, manager: e.target.value, members: form.members.filter(id => id !== e.target.value) })}
            required
          >
            <option value="">Select Project Lead</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name} - {user.role}
              </option>
            ))}
          </select>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Project Members</label>
            <div className="max-h-40 overflow-y-auto border border-white/10 rounded-lg p-3 bg-white/5">
              {users.filter(u => u._id !== form.manager).map((user) => (
                <label key={user._id} className="flex items-center gap-3 py-1 cursor-pointer hover:bg-white/5 rounded px-2">
                  <input
                    type="checkbox"
                    checked={form.members.includes(user._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setForm({ ...form, members: [...form.members, user._id] });
                      } else {
                        setForm({ ...form, members: form.members.filter(id => id !== user._id) });
                      }
                    }}
                    className="rounded border-white/20 bg-white/10 text-cyan-400 focus:ring-cyan-400"
                  />
                  <span className="text-sm text-slate-200">{user.name} <span className="text-slate-400">({user.role})</span></span>
                </label>
              ))}
            </div>
            {form.members.length > 0 && (
              <p className="mt-2 text-xs text-slate-400">
                {form.members.length} member{form.members.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button type="button" className="btn-secondary" onClick={() => setShowCreateForm(false)}>
              Cancel
            </button>
            <button className="btn-primary">
              <Plus size={18} />
              Create project
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!activeProjectId}
        onClose={closeProject}
        title={projectDetail?.name || 'Project details'}
        description="Progress, members, and tasks in one focused view."
        size="xl"
      >
        {detailLoading ? (
          <div className="grid gap-4">
            <div className="card p-5">
              <p className="text-sm font-black text-white">Loading project…</p>
              <p className="mt-2 text-sm font-semibold text-slate-400">Fetching tasks, members, and analytics.</p>
            </div>
            <SkeletonStack rows={6} className="card p-5" />
          </div>
        ) : !projectDetail ? (
          <div className="empty-state">
            <p className="text-lg font-black text-white">Project unavailable</p>
            <p className="mt-2 text-sm font-semibold text-slate-400">This project may have been removed or you may not have access.</p>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
            <section className="grid gap-4">
              <div className="card p-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Overview</p>
                <p className="mt-2 text-lg font-black text-white">{projectDetail.name}</p>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-400">
                  {projectDetail.description || 'No description provided for this project yet.'}
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <span className="pill bg-white/10 text-slate-200">{projectDetail.priority || 'Priority'}</span>
                  {projectDetail.deadline && (
                    <span className="pill bg-white/10 text-slate-200">
                      <Calendar size={14} />
                      {new Date(projectDetail.deadline).toLocaleDateString()}
                    </span>
                  )}
                  <span className="pill bg-cyan-500/10 text-cyan-200">
                    <CheckCircle2 size={14} />
                    {taskStats.progress}% completion
                  </span>
                  {projectDetail.manager?.name && (
                    <span className="pill bg-amber-400/10 text-amber-100">
                      <Crown size={14} />
                      Lead: {projectDetail.manager.name}
                    </span>
                  )}
                  {(projectDetail.progress || 0) === 100 && projectDetail.status !== 'Completed' && !projectDetail.archived && (
                    <span className="pill bg-blue-500/10 text-blue-200">
                      <BadgeCheck size={14} />
                      Ready for approval
                    </span>
                  )}
                  {taskStats.overdue > 0 && (
                    <span className="pill bg-rose-500/10 text-rose-200">
                      <Timer size={14} />
                      {taskStats.overdue} overdue
                    </span>
                  )}
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button type="button" className="btn-secondary" onClick={openMemberManager} disabled={!canManageMembers}>
                    <UsersRound size={16} />
                    Manage Members
                  </button>
                  <button type="button" className="btn-secondary" onClick={openMemberManager} disabled={!canManageMembers}>
                    <Plus size={16} />
                    Add Members
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => navigate('/dashboard/team#invite-member')}
                    disabled={!canManageMembers}
                  >
                    <UserPlus size={16} />
                    Invite Members
                  </button>
                </div>
                {canApproveCompletion && (
                  <div className="mt-5">
                    <button
                      type="button"
                      onClick={approveCompletion}
                      disabled={approving}
                      className="btn-primary w-full justify-center"
                    >
                      <BadgeCheck size={18} />
                      {approving ? 'Marking completed…' : 'Mark Project as Completed'}
                    </button>
                    <p className="mt-2 text-xs font-semibold text-slate-500">
                      Only the Project Lead can approve completion after all tasks are finished.
                    </p>
                  </div>
                )}
                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    <span>Progress</span>
                    <span>{taskStats.completed}/{taskStats.total} tasks done</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-fuchsia-500"
                      style={{ width: `${taskStats.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="card p-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Assigned members</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {(projectDetail.members || []).map((member) => (
                    <div key={member._id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-500 to-fuchsia-500 text-sm font-black text-white ring-1 ring-white/10">
                        {member.name?.[0] || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-white flex items-center gap-2">
                          {member.name}
                          {member.role === 'Admin' ? (
                            <span className="pill bg-violet-500/10 text-violet-200 !px-2 !py-0.5 !tracking-[0.14em]">Admin</span>
                          ) : projectDetail.manager?._id === member._id ? (
                            <span className="pill bg-amber-400/10 text-amber-100 !px-2 !py-0.5 !tracking-[0.14em]">
                              <Crown size={12} />
                              Project Lead
                            </span>
                          ) : (
                            <span className="pill bg-white/10 text-slate-200 !px-2 !py-0.5 !tracking-[0.14em]">Member</span>
                          )}
                        </p>
                        <p className="truncate text-xs font-semibold text-slate-500">{member.role || member.email}</p>
                      </div>
                    </div>
                  ))}
                  {(projectDetail.members || []).length === 0 && (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm font-semibold text-slate-500">
                      No members assigned.
                    </div>
                  )}
                </div>
              </div>

              {canManageMembers && (
                <div className="card p-5">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Member management</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-400">
                    Manage members after project creation to keep assignments and collaboration scalable.
                  </p>
                  <button type="button" className="btn-primary mt-4" onClick={openMemberManager}>
                    <UsersRound size={18} />
                    Manage project members
                  </button>
                </div>
              )}
            </section>

            <aside className="grid gap-4">
              <div className="card p-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Task analytics</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {Object.entries(taskStats.counts).map(([status, value]) => (
                    <div key={status} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">{status}</p>
                      <p className="mt-2 text-2xl font-black text-white">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Project tasks</p>
                <div className="mt-4 grid max-h-[420px] gap-3 overflow-auto pr-1 [scrollbar-width:thin]">
                  {projectTasks.length ? (
                    projectTasks.map((task) => {
                      const overdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Completed';
                      const done = task.status === 'Completed';
                      return (
                        <div
                          key={task._id}
                          className={`rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.08] ${
                            overdue ? 'border-rose-400/30 bg-rose-500/10' : ''
                          } ${done ? 'border-emerald-400/25 bg-emerald-500/10' : ''}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-black text-white">{task.title}</p>
                              <p className="mt-1 text-sm font-semibold text-slate-400 line-clamp-2">{task.description}</p>
                            </div>
                            <span className="pill bg-white/10 text-slate-200">{task.status}</span>
                          </div>
                          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                            {task.assignee?.name && (
                              <span className="pill bg-white/10 text-slate-200">
                                <Users size={14} />
                                {task.assignee.name}
                              </span>
                            )}
                            {task.priority && (
                              <span className="pill bg-white/10 text-slate-200">{task.priority}</span>
                            )}
                            {task.dueDate && (
                              <span className={`pill ${overdue ? 'bg-rose-500/10 text-rose-200' : 'bg-white/10 text-slate-200'}`}>
                                <Calendar size={14} />
                                {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-5 text-sm font-semibold text-slate-500">
                      No tasks found for this project yet.
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        )}
        {showApproved && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="pointer-events-none absolute inset-0 grid place-items-center"
          >
            <div className="rounded-[2rem] border border-emerald-400/20 bg-emerald-500/10 px-6 py-4 text-center shadow-2xl backdrop-blur-2xl">
              <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-200">
                <BadgeCheck />
              </div>
              <p className="text-sm font-black text-white">Project completed</p>
              <p className="mt-1 text-xs font-semibold text-slate-400">Completion synced across analytics.</p>
            </div>
          </motion.div>
        )}
      </Modal>

      <Modal
        open={showMemberManager}
        onClose={() => setShowMemberManager(false)}
        title="Manage project members"
        description="Select collaborators who should be part of this project."
        size="md"
      >
        <div className="grid gap-3">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
            Admin and assigned Project Lead can add or remove members
          </p>
          <select
            multiple
            className="input min-h-56"
            value={memberDraft}
            onChange={(e) => setMemberDraft(Array.from(e.target.selectedOptions).map((option) => option.value))}
          >
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name} - {u.role}
              </option>
            ))}
          </select>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button type="button" className="btn-secondary" onClick={() => setMemberDraft((projectDetail?.members || []).map((m) => m?._id || m))}>
              Reset
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={async () => {
                const saved = await saveMembers();
                if (saved) setShowMemberManager(false);
              }}
              disabled={savingMembers}
            >
              {savingMembers ? 'Saving…' : 'Save members'}
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
