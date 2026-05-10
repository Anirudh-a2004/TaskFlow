import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { Calendar, MessageSquare, Paperclip, Plus, AlertCircle, CheckCircle2, Zap, Clock, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Badge from '../components/Badge.jsx';
import Skeleton from '../components/Skeleton.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import { api, qs } from '../utils/api.js';

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
  const { isAdmin } = useAuth();
  const { search } = useApp();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', description: '', project: '', assignee: '', priority: 'Medium', dueDate: '', subtasks: [] });

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

  const grouped = useMemo(() => Object.fromEntries(columns.map((col) => [col.id, tasks.filter((task) => task.status === col.id)])), [tasks]);

  const create = async (event) => {
    event.preventDefault();
    await api('/tasks', { method: 'POST', body: JSON.stringify(form) });
    toast.success('Task created.');
    setForm({ title: '', description: '', project: '', assignee: '', priority: 'Medium', dueDate: '', subtasks: [] });
    load();
  };

  const onDragEnd = async ({ destination, draggableId }) => {
    if (!destination) return;
    const nextTasks = tasks.map((task) => (task._id === draggableId ? { ...task, status: destination.droppableId, order: destination.index } : task));
    setTasks(nextTasks);
    await api('/tasks/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ tasks: nextTasks.map((task, index) => ({ id: task._id, status: task.status, order: index })) })
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-6 sm:gap-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div>
          <p className="text-xs font-black uppercase text-fuchsia-300 sm:text-sm">Execution board</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-white sm:text-4xl">Kanban Board</h1>
        </div>
        {isAdmin && (
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="#create-task"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-fuchsia-600 px-4 py-3 font-black text-white shadow-lg shadow-blue-600/25 transition hover:shadow-lg hover:shadow-fuchsia-600/30 sm:w-auto sm:px-5"
          >
            <Plus size={18} className="sm:size-20" />
            New Task
          </motion.a>
        )}
      </motion.div>

      {loading ? (
        <div className="grid gap-4">
          <Skeleton className="h-24 rounded-[2rem]" />
          <Skeleton className="h-[520px] rounded-[2rem]" />
        </div>
      ) : (
        <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <DragDropContext onDragEnd={onDragEnd}>
            <motion.div className="overflow-x-auto pb-4" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
              <div className="flex gap-4 sm:gap-6 lg:grid lg:grid-cols-4 lg:gap-6">
                {columns.map((column) => {
                  const Icon = column.icon;
                  return (
                    <motion.div
                      key={column.id}
                      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
                      className="flex-shrink-0 w-72 sm:w-80 lg:w-auto space-y-4"
                    >
                    <Droppable droppableId={column.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`min-h-[580px] rounded-[2rem] border border-white/10 transition-all duration-300 ${
                            snapshot.isDraggingOver
                              ? 'border-blue-500/50 bg-white/[0.08] shadow-2xl shadow-blue-500/20 backdrop-blur-2xl'
                              : 'bg-white/[0.035] shadow-2xl shadow-black/10 backdrop-blur-2xl'
                          }`}
                        >
                          {/* Column Header */}
                          <div className={`relative overflow-hidden rounded-t-[2rem] bg-gradient-to-r ${column.gradient} p-5`}>
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                            <div className="relative flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <Icon size={20} className="text-white" />
                                <div>
                                  <h2 className="font-black text-white">{column.label}</h2>
                                  <p className="text-xs text-white/70">{grouped[column.id].length} task{grouped[column.id].length !== 1 ? 's' : ''}</p>
                                </div>
                              </div>
                              <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="grid h-8 w-8 place-items-center rounded-lg bg-white/20 font-black text-white backdrop-blur-md"
                              >
                                {grouped[column.id].length}
                              </motion.div>
                            </div>
                          </div>

                          {/* Column Content */}
                          <div className="space-y-3 p-4">
                            {grouped[column.id].length === 0 ? (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] py-12 text-center"
                              >
                                <AlertCircle size={32} className="mx-auto mb-2 text-slate-500" />
                                <p className="text-sm font-semibold text-slate-500">No tasks yet</p>
                                <p className="text-xs text-slate-600">Drag tasks here or create a new one</p>
                              </motion.div>
                            ) : (
                              grouped[column.id].map((task, index) => {
                                const overdue = isOverdue(task.dueDate);
                                const today = isToday(task.dueDate);
                                const soon = isSoon(task.dueDate);

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
                                        className={`group cursor-grab rounded-2xl border border-white/15 p-4 transition-all duration-300 active:cursor-grabbing ${
                                          dragSnapshot.isDragging
                                            ? 'border-blue-400/50 bg-white/[0.12] shadow-2xl shadow-blue-500/30 backdrop-blur-xl'
                                            : 'bg-white/[0.06] shadow-lg shadow-black/20 backdrop-blur-md hover:border-cyan-300/40 hover:bg-white/[0.1]'
                                        } ${overdue && column.id !== 'Completed' ? 'border-rose-400/40 bg-rose-500/10' : ''}`}
                                      >
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

          {/* Create Task Form - Sidebar */}
          {isAdmin && (
            <motion.form
              id="create-task"
              onSubmit={create}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="card sticky top-6 h-fit overflow-hidden p-4 shadow-2xl sm:top-24 sm:p-6"
            >
              <div className="mb-4 flex items-center gap-2 sm:mb-6">
                <Plus className="text-blue-600" size={20} />
                <h2 className="text-lg font-black text-white sm:text-xl">Create Task</h2>
              </div>
              <div className="grid gap-3 sm:gap-4">
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  className="input"
                  placeholder="Task title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
                <motion.textarea
                  whileFocus={{ scale: 1.02 }}
                  className="input min-h-20 sm:min-h-24"
                  placeholder="Description (optional)"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
                <motion.select
                  whileFocus={{ scale: 1.02 }}
                  className="input"
                  value={form.project}
                  onChange={(e) => setForm({ ...form, project: e.target.value })}
                  required
                >
                  <option value="">Select project</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </motion.select>
                <motion.select
                  whileFocus={{ scale: 1.02 }}
                  className="input"
                  value={form.assignee}
                  onChange={(e) => setForm({ ...form, assignee: e.target.value })}
                >
                  <option value="">Unassigned</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name}
                    </option>
                  ))}
                </motion.select>
                <div className="grid grid-cols-2 gap-3">
                  <motion.select
                    whileFocus={{ scale: 1.02 }}
                    className="input"
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  >
                    {['Low', 'Medium', 'High', 'Urgent'].map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </motion.select>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    className="input"
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Create task
                </motion.button>
              </div>
            </motion.form>
          )}
        </section>
      )}
    </motion.div>
  );
}
