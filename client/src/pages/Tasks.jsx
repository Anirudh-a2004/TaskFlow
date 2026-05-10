import { useEffect, useMemo, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { Calendar, MessageSquare, Paperclip, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import Badge from '../components/Badge.jsx';
import Skeleton from '../components/Skeleton.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import { api, qs } from '../utils/api.js';

const columns = ['Todo', 'In Progress', 'Review', 'Completed'];

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

  const grouped = useMemo(() => Object.fromEntries(columns.map((status) => [status, tasks.filter((task) => task.status === status)])), [tasks]);

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
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase text-fuchsia-300">Execution board</p>
          <h1 className="text-3xl font-black">Kanban Tasks</h1>
        </div>
        {isAdmin && <a href="#create-task" className="btn-secondary">New task</a>}
      </div>

      {loading ? (
        <div className="grid gap-4">
          <Skeleton className="h-24 rounded-[2rem]" />
          <Skeleton className="h-[620px] rounded-[2rem]" />
        </div>
      ) : (
        <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid gap-4 lg:grid-cols-4">
              {columns.map((column) => (
                <Droppable droppableId={column} key={column}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="min-h-[520px] rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-3 shadow-2xl shadow-black/10 backdrop-blur-2xl"
                    >
                      <div className="mb-3 flex items-center justify-between px-2">
                        <h2 className="font-black text-white">{column}</h2>
                        <span className="pill">{grouped[column].length}</span>
                      </div>
                      <div className="grid gap-3">
                        {grouped[column].length === 0 ? (
                          <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-sm text-slate-400">No tasks yet in this lane.</div>
                        ) : null}
                        {grouped[column].map((task, index) => (
                          <Draggable key={task._id} draggableId={task._id} index={index}>
                            {(drag) => (
                              <article
                                ref={drag.innerRef}
                                {...drag.draggableProps}
                                {...drag.dragHandleProps}
                                className="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-4 shadow-xl shadow-black/20 transition duration-200 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-slate-900/85"
                              >
                                <div className="mb-3 flex items-start justify-between gap-2">
                                  <h3 className="font-black text-white">{task.title}</h3>
                                  <Badge>{task.priority}</Badge>
                                </div>
                                <p className="line-clamp-3 text-sm leading-6 text-slate-400">{task.description}</p>
                                <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-400">
                                  {task.dueDate && (
                                    <span className="flex items-center gap-1">
                                      <Calendar size={14} />{new Date(task.dueDate).toLocaleDateString()}
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1">
                                    <MessageSquare size={14} />Comments
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Paperclip size={14} />{task.attachments?.length || 0}
                                  </span>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                  <span className="text-xs font-semibold text-slate-500">{task.project?.name || 'No project'}</span>
                                  <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-blue-600 via-indigo-500 to-fuchsia-500 text-xs font-black text-white">
                                    {task.assignee?.name?.[0] || '?'}
                                  </span>
                                </div>
                                {isAdmin && (
                                  <button type="button" onClick={() => remove(task._id)} className="btn-secondary mt-4 w-full justify-center">Delete task</button>
                                )}
                              </article>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>

          {isAdmin && (
            <form id="create-task" onSubmit={create} className="card sticky top-24 h-fit p-5">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-black"><Plus className="text-blue-600" />Create task</h2>
              <div className="grid gap-4">
                <input className="input" placeholder="Task title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                <textarea className="input min-h-24" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                <select className="input" value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })} required>
                  <option value="">Select project</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>{project.name}</option>
                  ))}
                </select>
                <select className="input" value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })}>
                  <option value="">Unassigned</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>{user.name}</option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                    {['Low', 'Medium', 'High', 'Urgent'].map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                  <input className="input" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
                </div>
                <button className="btn-primary">Create task</button>
              </div>
            </form>
          )}
        </section>
      )}
    </div>
  );
}
