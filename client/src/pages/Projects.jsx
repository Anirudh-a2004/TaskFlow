import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import { api, qs } from '../utils/api.js';
import Skeleton from '../components/Skeleton.jsx';
import Badge from '../components/Badge.jsx';

export default function Projects() {
  const { isAdmin } = useAuth();
  const { search } = useApp();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', description: '', priority: 'Medium', deadline: '', members: [] });

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

  const create = async (event) => {
    event.preventDefault();
    await api('/projects', { method: 'POST', body: JSON.stringify(form) });
    toast.success('Project created.');
    setForm({ name: '', description: '', priority: 'Medium', deadline: '', members: [] });
    load();
  };

  const remove = async (id) => {
    await api(`/projects/${id}`, { method: 'DELETE' });
    toast.success('Project deleted.');
    load();
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase text-fuchsia-300">Portfolio</p>
          <h1 className="text-3xl font-black">Projects</h1>
        </div>
        {isAdmin && (
          <a href="#create-project" className="btn-secondary">New project</a>
        )}
      </div>

      {loading ? (
        <div className="grid gap-4">
          <Skeleton className="h-32 rounded-[2rem]" />
          <Skeleton className="h-96 rounded-[2rem]" />
        </div>
      ) : (
        <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="grid gap-4 md:grid-cols-2">
            {projects.length === 0 ? (
              <div className="empty-state col-span-full">
                <p className="text-lg font-black text-white">No projects yet</p>
                <p className="mt-2 text-sm text-slate-400">Launch your first initiative and track progress with beautiful project cards.</p>
              </div>
            ) : (
              projects.map((project, index) => (
                <motion.article
                  key={project._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="card overflow-hidden p-5"
                >
                  <div className="mb-5 h-2 rounded-full bg-white/10">
                    <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-fuchsia-500" style={{ width: `${project.progress || 0}%` }} />
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-black text-white">{project.name}</h2>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">{project.description}</p>
                    </div>
                    <Badge>{project.priority}</Badge>
                  </div>
                  <div className="mt-5 flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-400">
                    <span className="flex items-center gap-1"><Users size={16} />{project.members?.length || 0} members</span>
                    {project.deadline && <span className="flex items-center gap-1"><Calendar size={16} />{new Date(project.deadline).toLocaleDateString()}</span>}
                    <span>{project.progress || 0}% complete</span>
                  </div>
                  {isAdmin && (
                    <button onClick={() => remove(project._id)} className="btn-secondary mt-5 w-full justify-center !py-2 text-rose-500">Delete</button>
                  )}
                </motion.article>
              ))
            )}
          </div>

          {isAdmin && (
            <form id="create-project" onSubmit={create} className="card sticky top-24 h-fit p-5">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-black"><Plus className="text-blue-600" />Create project</h2>
              <div className="grid gap-4">
                <input className="input" placeholder="Project name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                <textarea className="input min-h-28" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                    {['Low', 'Medium', 'High', 'Urgent'].map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                  <input className="input" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
                </div>
                <select
                  multiple
                  className="input min-h-32"
                  value={form.members}
                  onChange={(e) => setForm({ ...form, members: Array.from(e.target.selectedOptions).map((option) => option.value) })}
                >
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} - {user.role}
                    </option>
                  ))}
                </select>
                <button className="btn-primary">Create project</button>
              </div>
            </form>
          )}
        </section>
      )}
    </div>
  );
}
