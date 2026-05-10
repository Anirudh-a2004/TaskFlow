import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { Calendar, MessageSquare, Paperclip, Plus, AlertCircle, CheckCircle2, Zap, Clock, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Badge from '../components/Badge.jsx';
import Skeleton, { EmptyState, SkeletonStack } from '../components/Skeleton.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import { api, qs } from '../utils/api.js';
import Modal from '../components/Modal.jsx';
import { useLocation } from 'react-router-dom';

const columns = [
  { id: 'Todo', label: 'Todo', icon: Clock, gradient: 'from-slate-500 to-slate-600', accent: 'slate' },
  { id: 'In Progress', label: 'In Progress', icon: Zap, gradient: 'from-blue-500 to-cyan-500', accent: 'blue' },
  { id: 'Review', label: 'Review', icon: CheckCircle2, gradient: 'from-amber-500 to-orange-500', accent: 'amber' },
  { id: 'Completed', label: 'Completed', icon: CheckCircle2, gradient: 'from-emerald-500 to-teal-500', accent: 'emerald' }
];

const priorityConfig = {
  Low: { color: 'bg-slate-500/15 text-slate-300', badge: 'bg-slate-500/20 border-slate-500/30' },
  Medium: { color: 'bg-blue-500/15 text-blue-300', badge: 'bg-blue-500/20 border-blue-500/30' },
  High: { color: 'bg-amber-500/15 text-amber-300', badge: 'bg-amber-500/20 border-amber-500/30' },
  Urgent: { color: 'bg-rose-500/15 text-rose-300', badge: 'bg-rose-500/20 border-rose-500/30' }
};

const isOverdue = (dueDate) => dueDate && new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
const isToday = (dueDate) => dueDate && new Date(dueDate).toDateString() === new Date().toDateString();
const isSoon = (dueDate) => dueDate && new Date(dueDate) > new Date() && new Date(dueDate).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000;

export default function Tasks() {
  const { isAdmin, user } = useAuth();
  const { search } = useApp();
  const location = useLocation();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', project: '', assignee: '', priority: 'Medium', dueDate: '', subtasks: [] });
  const [activeTask, setActiveTask] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [projectDetailsById, setProjectDetailsById] = useState({});
  const [loadingProjectMembers, setLoadingProjectMembers] = useState(false);

  const leadProjects = useMemo(
    () => projects.filter((project) => (project.manager?._id || project.manager) === user?._id),
    [projects, user?._id]
  );

  const canCreateAnyTask = isAdmin || leadProjects.length > 0;

  const canCompleteTask = (task) => {
    if (isAdmin) return true;
    const managerId = task?.project?.manager?._id || task?.project?.manager;
    return Boolean(managerId && managerId === user?._id);
  };

  const openCreate = () => {
    if (!canCreateAnyTask) return toast.error('You do not have permission to manage tasks for this project.', { className: 'tf-toast' });
    setShowCreateForm(true);
  };

  const load = async () => {
    setLoading(true);
    try {
      const [taskData, projectData, userData] = await Promise.all([
        api(`/tasks${qs({ search, limit: 100 })}`),
        api('/projects?limit=100'),
        api('/users?limit=100')
      ]);
      setTasks(taskData.items || []);
      setProjects(projectData.items || []);
      setUsers(userData.items || []);
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    await api(`/tasks/${id}`, { method: 'DELETE' });
    toast.success('Task deleted.');
    load();
  };

  useEffect(() => {
    load();
  }, [search]);

  useEffect(() => {
    if (location.hash !== '#create-task') return;
    setShowCreateForm(true);
    window.history.replaceState(null, '', location.pathname);
  }, [location.hash, location.pathname]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const taskId = params.get('task');
    if (!taskId) return;
    const match = tasks.find((task) => task._id === taskId);
    if (!match) return;
    setActiveTask(match);
    params.delete('task');
    const next = params.toString();
    window.history.replaceState(null, '', `${location.pathname}${next ? `?${next}` : ''}`);
  }, [location.search, location.pathname, tasks]);

  const selectedProject = useMemo(
    () => projects.find((project) => project._id === form.project),
    [projects, form.project]
  );

  useEffect(() => {
    if (!form.project) return;
    let cancelled = false;
    setLoadingProjectMembers(true);
    api(`/projects/${form.project}`)
      .then((data) => {
        if (cancelled) return;
        const project = data.project || data;
        setProjectDetailsById((current) => ({ ...current, [form.project]: project }));
      })
      .catch(() => {
        if (cancelled) return;
        setLoadingProjectMembers(false);
      });
    return () => {
      cancelled = true;
      setLoadingProjectMembers(false);
    };
  }, [form.project]);

  useEffect(() => {
    const activeProjectId = (activeTask?.project?._id || activeTask?.project || '').toString();
    if (!activeProjectId || projectDetailsById[activeProjectId]) return;
    let cancelled = false;
    api(`/projects/${activeProjectId}`)
      .then((data) => {
        if (cancelled) return;
        const project = data.project || data;
        setProjectDetailsById((current) => ({ ...current, [activeProjectId]: project }));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [activeTask, projectDetailsById]);

  useEffect(() => {
    if (!form.project) {
      setLoadingProjectMembers(false);
      return;
    }
    if (projectDetailsById[form.project]) {
      setLoadingProjectMembers(false);
    }
  }, [form.project, projectDetailsById]);

  const usersById = useMemo(
    () => new Map(users.map((person) => [person._id?.toString(), person])),
    [users]
  );

  const projectsById = useMemo(
    () => new Map(projects.map((project) => [project._id?.toString(), project])),
    [projects]
  );

  const getAssigneeOptionsForProject = (project) => {
    if (!project || !project.members) return [];

    // Map all project members with appropriate role labels
    const options = project.members.map((member) => {
      const isManager = project.manager && (member._id.toString() === (project.manager._id || project.manager).toString());
      const roleLabel = member.role === 'Admin' ? 'Admin' : isManager ? 'Project Lead' : 'Member';
      return { ...member, roleLabel };
    });

    // Add any Admins not already in the project members
    const optionIds = new Set(options.map((o) => o._id));
    const additionalAdmins = users
      .filter((user) => user.role === 'Admin' && !optionIds.has(user._id))
      .map((user) => ({ ...user, roleLabel: 'Admin' }));

    return [...options, ...additionalAdmins];
  };

  const effectiveSelectedProject = projectDetailsById[form.project] || null;

  const assigneeOptions = useMemo(
    () => getAssigneeOptionsForProject(effectiveSelectedProject),
    [effectiveSelectedProject, users, usersById]
  );

  const grouped = useMemo(() => Object.fromEntries(columns.map((col) => [col.id, tasks.filter((task) => task.status === col.id)])), [tasks]);

  const create = async (event) => {
    event.preventDefault();
    if (creating) return;
    setCreating(true);
    try {
      const project = projects.find((p) => p._id === form.project);
      const isLead = project && (project.manager?._id || project.manager) === user?._id;
      if (!isAdmin && !isLead) {
        toast.error('You do not have permission to manage tasks for this project.', { className: 'tf-toast' });
        return;
      }
      const payload = {
        ...form,
        assignee: form.assignee || undefined,
        dueDate: form.dueDate || undefined
      };
      const created = await api('/tasks', { method: 'POST', body: JSON.stringify(payload) });
      const nextTask = created.task || created.item || created;

      if (nextTask?._id) {
        setTasks((current) => [nextTask, ...(current || [])]);
      }

      toast.success('Task created.');
      setForm({ title: '', description: '', project: '', assignee: '', priority: 'Medium', dueDate: '', subtasks: [] });
      setShowCreateForm(false);
      load();
    } catch (error) {
      toast.error(error.message || 'Unable to create task.', { className: 'tf-toast' });
    } finally {
      setCreating(false);
    }
  };

  const onDragEnd = async ({ destination, draggableId, source }) => {
    if (!destination) return;
    if ((destination.droppableId === 'Completed' || source?.droppableId === 'Completed')) {
      const task = tasks.find((t) => t._id === draggableId);
      if (task && !canCompleteTask(task)) {
        toast.error('You do not have permission to move tasks into Completed.', { className: 'tf-toast' });
        return;
      }
    }
    const nextTasks = tasks.map((task) => (task._id === draggableId ? { ...task, status: destination.droppableId, order: destination.index } : task));
    setTasks(nextTasks);
    await api('/tasks/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ tasks: nextTasks.map((task, index) => ({ id: task._id, status: task.status, order: index })) })
    });
  };

  const canEditTask = (task) => isAdmin || (task.assignee && (task.assignee?._id || task.assignee) === user?._id);

  const updateStatus = async (task, nextStatus) => {
    if (!task?._id || task.status === nextStatus) return;
    if (!canEditTask(task)) return toast.error('You can only update tasks assigned to you.', { className: 'tf-toast' });
    if (nextStatus === 'Completed' && !canCompleteTask(task)) {
      return toast.error('You do not have permission to move tasks into Completed.', { className: 'tf-toast' });
    }

    setUpdatingStatus(true);
    setTasks((current) => current.map((t) => (t._id === task._id ? { ...t, status: nextStatus } : t)));
    if (activeTask?._id === task._id) setActiveTask((t) => ({ ...t, status: nextStatus }));

    try {
      const res = await api(`/tasks/${task._id}`, { method: 'PATCH', body: JSON.stringify({ status: nextStatus }) });
      const saved = res.task || res;
      setTasks((current) => current.map((t) => (t._id === task._id ? { ...t, ...saved } : t)));
      if (activeTask?._id === task._id) setActiveTask((t) => ({ ...t, ...saved }));
      toast.success('Status updated.', { className: 'tf-toast' });
    } catch (error) {
      toast.error(error.message || 'Unable to update status.', { className: 'tf-toast' });
      load();
    } finally {
      setUpdatingStatus(false);
    }
  };

  const updateAssignee = async (task, assignee) => {
    if (!task?._id) return;
    try {
      const response = await api(`/tasks/${task._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ assignee: assignee || undefined })
      });
      const saved = response.task || response;
      setTasks((current) => current.map((item) => (item._id === task._id ? { ...item, ...saved } : item)));
      setActiveTask((current) => (current?._id === task._id ? { ...current, ...saved } : current));
      toast.success('Assignee updated.', { className: 'tf-toast' });
    } catch (error) {
      toast.error(error.message || 'Unable to update assignee.', { className: 'tf-toast' });
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-6 sm:gap-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-fuchsia-300 sm:text-sm">Execution board</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-white sm:text-4xl">Kanban Board</h1>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-400">Prioritize work, drag tasks across stages, and keep delivery moving.</p>
        </div>
        <motion.button
          whileHover={canCreateAnyTask ? { scale: 1.03, y: -2 } : undefined}
          whileTap={canCreateAnyTask ? { scale: 0.95 } : undefined}
          onClick={openCreate}
          className="btn-secondary w-full !px-4 !py-2.5 text-sm font-black sm:w-auto"
          aria-disabled={!canCreateAnyTask}
          title={!canCreateAnyTask ? 'Project Lead or Admin access required to create tasks' : 'Create a new task'}
        >
          <Plus size={18} />
          New Task
        </motion.button>
      </motion.div>

      {loading ? (
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] p-4 backdrop-blur-2xl">
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="w-72 flex-shrink-0 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 sm:w-80 lg:flex-1">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </div>
                  <div className="mt-5 grid gap-3">
                    <Skeleton className="h-28 rounded-2xl" />
                    <Skeleton className="h-36 rounded-2xl" />
                    <Skeleton className="h-24 rounded-2xl" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {isAdmin && <SkeletonStack rows={6} className="card h-fit p-5" />}
        </div>
      ) : (
        <section className="grid gap-6">
          {tasks.length === 0 && (
            <div>
              <EmptyState
                icon={CheckCircle2}
                title="No tasks yet — add your first task"
                description="Kickstart your workflow by creating a task, assigning an owner, and setting a due date for visibility."
                action={
                  <button type="button" onClick={openCreate} className="btn-primary">
                    <Plus size={18} />
                    Create task
                  </button>
                }
              />
            </div>
          )}
          <DragDropContext onDragEnd={onDragEnd}>
            <motion.div
              className="kanban-board w-full overflow-x-auto overscroll-x-contain rounded-[2rem] border border-white/10 bg-white/[0.035] p-3 shadow-2xl shadow-black/10 backdrop-blur-2xl [scrollbar-color:rgba(103,232,249,.45)_rgba(15,23,42,.55)] [scrollbar-width:thin] sm:p-4"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.08 } } }}
            >
              <div className="mb-3 flex items-center gap-2 px-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-500 lg:hidden">
                <ChevronRight size={14} className="text-cyan-300" />
                Swipe sideways to view every workflow stage
              </div>
              <div className="flex snap-x snap-mandatory items-start gap-3 sm:gap-4 lg:grid lg:grid-cols-4 lg:items-stretch">
                {columns.map((column) => {
                  const Icon = column.icon;
                  return (
                    <motion.div
                      key={column.id}
                      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
                      className="w-[82vw] max-w-sm shrink-0 snap-start space-y-4 sm:w-80 lg:w-auto lg:max-w-none lg:shrink lg:min-w-0"
                    >
                    <Droppable droppableId={column.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`kanban-column min-h-[520px] min-w-0 rounded-[1.5rem] border transition-all duration-300 sm:min-h-[560px] ${
                            snapshot.isDraggingOver
                              ? 'border-blue-500/50 shadow-2xl shadow-blue-500/20'
                              : 'shadow-2xl shadow-black/10'
                          }`}
                        >
                          {/* Column Header */}
                          <div className={`relative overflow-hidden rounded-t-[1.5rem] bg-gradient-to-r ${column.gradient} p-4`}>
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                            <div className="relative flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 text-white ring-1 ring-white/20">
                                  <Icon size={18} />
                                </div>
                                <div>
                                  <h2 className="font-black text-white">{column.label}</h2>
                                  <p className="text-xs font-semibold text-white/70">{grouped[column.id].length} task{grouped[column.id].length !== 1 ? 's' : ''}</p>
                                </div>
                              </div>
                              <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="grid h-8 w-8 place-items-center rounded-xl bg-white/20 text-sm font-black text-white backdrop-blur-md"
                              >
                                {grouped[column.id].length}
                              </motion.div>
                            </div>
                          </div>

                          {/* Column Content */}
                          <div className="space-y-3 p-3 sm:p-4">
                            {grouped[column.id].length === 0 ? (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="rounded-[1.25rem] border border-dashed border-white/10 bg-white/[0.025] px-4 py-10 text-center"
                              >
                                <AlertCircle size={32} className="mx-auto mb-2 text-slate-500" />
                                <p className="text-sm font-black text-slate-300">No tasks here</p>
                                <p className="mt-1 text-xs font-semibold text-slate-600">Drag tasks into this stage when they are ready.</p>
                              </motion.div>
                            ) : (
                              grouped[column.id].map((task, index) => {
                                const overdue = isOverdue(task.dueDate);
                                const today = isToday(task.dueDate);
                                const soon = isSoon(task.dueDate);
                                const editable = canEditTask(task);

                                return (
                                  <Draggable key={task._id} draggableId={task._id} index={index}>
                                    {(drag, dragSnapshot) => (
                                      <motion.div
                                        ref={drag.innerRef}
                                        {...drag.draggableProps}
                                        {...drag.dragHandleProps}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ y: -4 }}
                                        whileTap={{ scale: 1.02 }}
                                        onClick={() => setActiveTask(task)}
                                        className={`kanban-task-card group min-w-0 cursor-grab rounded-[1.25rem] border border-white/15 p-4 transition-all duration-300 active:cursor-grabbing ${
                                          dragSnapshot.isDragging
                                            ? 'border-blue-400/50 bg-white/[0.12] shadow-2xl shadow-blue-500/30 backdrop-blur-xl'
                                            : 'bg-white/[0.06] shadow-lg shadow-black/20 backdrop-blur-md hover:border-cyan-300/40 hover:bg-white/[0.1]'
                                        } ${overdue && column.id !== 'Completed' ? 'border-rose-400/40 bg-rose-500/10' : ''}`}
                                      >
                                        <div className="mb-3 flex items-center justify-between gap-2">
                                          <div className="flex items-center gap-2">
                                            <select
                                              className="input !w-auto !px-3 !py-2 text-xs font-black uppercase tracking-[0.16em]"
                                              value={task.status}
                                              disabled={!editable || updatingStatus}
                                              onClick={(e) => e.stopPropagation()}
                                              onPointerDown={(e) => e.stopPropagation()}
                                              onChange={(e) => updateStatus(task, e.target.value)}
                                              aria-label="Update task status"
                                            >
                                              {columns.map((col) => (
                                                <option key={col.id} value={col.id}>
                                                  {col.label}
                                                </option>
                                              ))}
                                            </select>
                                          </div>
                                        </div>

                                        {/* Priority & Status */}
                                        <div className="mb-3 flex items-start justify-between gap-2">
                                          <h3 className="flex-1 font-bold text-white line-clamp-2">{task.title}</h3>
                                          <motion.div whileHover={{ scale: 1.1 }} className={`flex-shrink-0 rounded-lg border ${priorityConfig[task.priority]?.badge} px-2 py-1 text-xs font-bold uppercase`}>
                                            {task.priority}
                                          </motion.div>
                                        </div>

                                        {/* Description */}
                                        {task.description && <p className="mb-3 line-clamp-2 text-xs leading-5 text-slate-400">{task.description}</p>}

                                        {/* Due Date */}
                                        {task.dueDate && (
                                          <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className={`mb-3 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                                              overdue ? 'border border-rose-500/30 bg-rose-500/15 text-rose-300' : today ? 'border border-blue-500/30 bg-blue-500/15 text-blue-300' : soon ? 'border border-amber-500/30 bg-amber-500/15 text-amber-300' : 'border border-slate-500/30 bg-slate-500/15 text-slate-300'
                                            }`}
                                          >
                                            <Calendar size={12} />
                                            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            {overdue && column.id !== 'Completed' && <AlertCircle size={12} className="ml-1" />}
                                          </motion.div>
                                        )}

                                        {/* Metadata Footer */}
                                        <div className="mb-3 flex flex-wrap gap-2 text-xs text-slate-400">
                                          {task.comments?.length > 0 && (
                                            <span className="flex items-center gap-1 rounded-md bg-white/5 px-2 py-1">
                                              <MessageSquare size={12} />
                                              {task.comments.length}
                                            </span>
                                          )}
                                          {task.attachments?.length > 0 && (
                                            <span className="flex items-center gap-1 rounded-md bg-white/5 px-2 py-1">
                                              <Paperclip size={12} />
                                              {task.attachments.length}
                                            </span>
                                          )}
                                        </div>

                                        {/* Project & Assignee */}
                                        <div className="flex items-center justify-between gap-2 border-t border-white/10 pt-3">
                                          <span className="flex-1 truncate text-xs font-semibold text-slate-500">{task.project?.name || 'No project'}</span>
                                          {task.assignee ? (
                                            <motion.div
                                              whileHover={{ scale: 1.15 }}
                                              title={task.assignee?.name}
                                              className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-600 via-indigo-500 to-fuchsia-500 text-xs font-black text-white shadow-md shadow-blue-500/20 ring-1 ring-white/20"
                                            >
                                              {task.assignee?.name?.[0] || '?'}
                                            </motion.div>
                                          ) : (
                                            <div className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-full border border-white/20 bg-white/5 text-xs font-black text-slate-500">
                                              ?
                                            </div>
                                          )}
                                        </div>

                                        {/* Delete Button */}
                                        {isAdmin && (
                                          <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="button"
                                            onClick={() => remove(task._id)}
                                            className="btn-secondary mt-3 w-full justify-center py-2 text-xs"
                                          >
                                            Delete task
                                          </motion.button>
                                        )}
                                      </motion.div>
                                    )}
                                  </Draggable>
                                );
                              })
                            )}
                            {provided.placeholder}
                          </div>
                        </div>
                      )}
                    </Droppable>
                  </motion.div>
                );
              })}
              </div>
            </motion.div>
          </DragDropContext>
        </section>
      )}

      <Modal
        open={!!activeTask}
        onClose={() => setActiveTask(null)}
        title={activeTask?.title || 'Task details'}
        description="Update status, review context, and keep work moving."
        size="md"
      >
        {activeTask && (
          <div className="grid gap-4">
            <div className="card !rounded-[1.5rem] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="grid gap-1">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">Status</p>
                  <p className="text-sm font-black text-white">{activeTask.status}</p>
                </div>
                <select
                  className="input !w-auto"
                  value={activeTask.status}
                  disabled={!canEditTask(activeTask) || updatingStatus}
                  onPointerDown={(e) => e.stopPropagation()}
                  onChange={(e) => updateStatus(activeTask, e.target.value)}
                >
                  {columns.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.label}
                    </option>
                  ))}
                </select>
              </div>
              {activeTask.description && (
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-400">{activeTask.description}</p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                {activeTask.project?.name && <span className="pill bg-white/10 text-slate-200">{activeTask.project.name}</span>}
                {activeTask.assignee?.name && <span className="pill bg-white/10 text-slate-200">{activeTask.assignee.name}</span>}
                {activeTask.priority && <span className="pill bg-white/10 text-slate-200">{activeTask.priority}</span>}
                {activeTask.dueDate && (
                  <span className="pill bg-white/10 text-slate-200">
                    <Calendar size={14} />
                    {new Date(activeTask.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
              {(isAdmin || canCompleteTask(activeTask)) && (
                <div className="mt-4 grid gap-2">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Assignee</p>
                  <select
                    className="input"
                    value={activeTask.assignee?._id || ''}
                    onChange={(e) => updateAssignee(activeTask, e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {getAssigneeOptionsForProject(
                      projectDetailsById[(activeTask.project?._id || '').toString()] ||
                      projectsById.get((activeTask.project?._id || '').toString())
                    ).map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.name} ({member.roleLabel || member.role || 'Member'})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {!canEditTask(activeTask) && !isAdmin && (
                <p className="mt-3 text-xs font-semibold text-slate-500">You can update status once this task is assigned to you.</p>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        title="Create task"
        description="Capture a task, assign ownership, and set priority and due date."
        size="md"
      >
        <form id="create-task" onSubmit={create} className="grid gap-3 sm:gap-4">
          <motion.input
            whileFocus={{ scale: 1.01 }}
            className="input"
            placeholder="Task title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <motion.textarea
            whileFocus={{ scale: 1.01 }}
            className="input min-h-20 sm:min-h-24"
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <motion.select
            whileFocus={{ scale: 1.01 }}
            className="input"
            value={form.project}
            onChange={(e) => setForm({ ...form, project: e.target.value, assignee: '' })}
            required
          >
            <option value="">Select project</option>
            {(isAdmin ? projects : leadProjects).map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </motion.select>
          <motion.select
            whileFocus={{ scale: 1.01 }}
            className="input"
            value={form.assignee}
            onChange={(e) => setForm({ ...form, assignee: e.target.value })}
            disabled={!form.project || loadingProjectMembers}
          >
            <option value="">{loadingProjectMembers ? 'Loading members…' : 'Unassigned'}</option>
            {assigneeOptions.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name} ({user.roleLabel || user.role || 'Member'})
              </option>
            ))}
          </motion.select>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <motion.select
              whileFocus={{ scale: 1.01 }}
              className="input"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              {['Low', 'Medium', 'High', 'Urgent'].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </motion.select>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              className="input"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button type="button" className="btn-secondary" onClick={() => setShowCreateForm(false)}>
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary"
              disabled={creating}
            >
              <Plus size={18} />
              {creating ? 'Creating…' : 'Create task'}
            </motion.button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
