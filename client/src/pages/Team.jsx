import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BriefcaseBusiness, Mail, Shield, Sparkles, UserPlus, UserRoundCog, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import { api, qs } from '../utils/api.js';
import Skeleton, { EmptyState, SkeletonStack } from '../components/Skeleton.jsx';

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: 'easeOut' } }
};

export default function Team() {
  const { isAdmin } = useAuth();
  const { search } = useApp();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState({ name: '', email: '', title: 'Team Member', department: 'Product' });

  const load = async () => {
    setLoading(true);
    try {
      const data = await api(`/users${qs({ search, limit: 100 })}`);
      setUsers(data.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [search]);

  const inviteMember = async (event) => {
    event.preventDefault();
    await api('/auth/signup', { method: 'POST', body: JSON.stringify(invite) });
    toast.success('Invitation sent. Member created.');
    setInvite({ name: '', email: '', title: 'Team Member', department: 'Product' });
    load();
  };

  const role = async (id, nextRole) => {
    await api(`/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role: nextRole }) });
    toast.success('Role updated.');
    load();
  };

  const stats = useMemo(() => {
    const departments = new Set(users.map((user) => user.department || 'Product'));
    return [
      { label: 'Members', value: users.length, icon: Users, tone: 'from-blue-500 to-cyan-400' },
      { label: 'Admins', value: users.filter((user) => user.role === 'Admin').length, icon: Shield, tone: 'from-violet-500 to-fuchsia-400' },
      { label: 'Departments', value: departments.size, icon: BriefcaseBusiness, tone: 'from-emerald-500 to-teal-400' }
    ];
  }, [users]);

  return (
    <motion.div initial="hidden" animate="show" className="grid gap-6 sm:gap-8">
      <motion.header
        variants={cardVariants}
        className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-blue-600/15 via-slate-900/80 to-fuchsia-600/15 p-5 shadow-2xl backdrop-blur-2xl sm:p-7"
      >
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">People ops</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Team command center</h1>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-400">
              Manage collaborators, access levels, and department coverage from one focused workspace.
            </p>
          </div>
          {isAdmin && (
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => document.getElementById('invite-member')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-primary w-full sm:w-auto"
            >
              <UserPlus size={18} />
              Invite member
            </motion.button>
          )}
        </div>
      </motion.header>

      {loading ? (
        <div className="grid gap-6">
          <div className="grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="card p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="grid flex-1 gap-3">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-8 w-14" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-2xl" />
                </div>
              </div>
            ))}
          </div>
          <div className={`grid gap-6 ${isAdmin ? 'xl:grid-cols-[1fr_380px]' : ''}`}>
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="card p-5">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-14 w-14 rounded-3xl" />
                    <div className="grid flex-1 gap-3">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="mt-5 h-10 w-full rounded-2xl" />
                </div>
              ))}
            </div>
            {isAdmin && <SkeletonStack rows={4} className="card h-fit p-5" />}
          </div>
        </div>
      ) : (
        <>
          <motion.section variants={cardVariants} className="grid gap-3 sm:grid-cols-3">
            {stats.map(({ label, value, icon: Icon, tone }) => (
              <article key={label} className="card group p-4 transition duration-300 hover:-translate-y-1 hover:bg-white/[0.085] sm:p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
                    <p className="mt-2 text-3xl font-black text-white">{value}</p>
                  </div>
                  <div className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${tone} text-white shadow-lg shadow-blue-500/20`}>
                    <Icon size={20} />
                  </div>
                </div>
              </article>
            ))}
          </motion.section>

          <section className={`grid gap-6 ${isAdmin ? 'xl:grid-cols-[1fr_380px]' : ''}`}>
            <motion.div variants={cardVariants} className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {users.length === 0 ? (
                <div className="col-span-full">
                  <EmptyState
                    icon={Users}
                    title="No team members found"
                    description="Invite your first collaborator and start building a shared workspace for projects, tasks, and ownership."
                    action={isAdmin && <button onClick={() => document.getElementById('invite-member')?.scrollIntoView({ behavior: 'smooth' })} className="btn-primary"><UserPlus size={18} />Invite member</button>}
                  />
                </div>
              ) : (
                users.map((user, index) => (
                  <motion.article
                    key={user._id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.035 }}
                    className="group card overflow-hidden p-5 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/[0.085]"
                  >
                    <div className="flex items-start gap-4">
                      <motion.div
                        whileHover={{ scale: 1.08 }}
                        className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-500 to-fuchsia-500 text-xl font-black text-white shadow-lg shadow-blue-500/25 ring-1 ring-white/20"
                      >
                        {user.name?.[0] || '?'}
                      </motion.div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h2 className="truncate text-lg font-black text-white">{user.name}</h2>
                            <p className="mt-1 flex items-center gap-2 truncate text-sm font-semibold text-slate-400">
                              <Mail size={14} />
                              {user.email}
                            </p>
                          </div>
                          <span className="pill bg-white/10 text-slate-200">{user.role}</span>
                        </div>
                        <div className="mt-4 grid gap-2 text-sm font-semibold text-slate-400">
                          <p className="flex items-center gap-2">
                            <BriefcaseBusiness size={15} className="text-cyan-300" />
                            {user.title || 'Team member'}
                          </p>
                          <p className="flex items-center gap-2">
                            <Sparkles size={15} className="text-fuchsia-300" />
                            {user.department || 'Product'}
                          </p>
                        </div>
                      </div>
                    </div>
                    {isAdmin && (
                      <button onClick={() => role(user._id, user.role === 'Admin' ? 'Member' : 'Admin')} className="btn-secondary mt-5 w-full !py-2.5">
                        <UserRoundCog size={16} />
                        Toggle role
                      </button>
                    )}
                  </motion.article>
                ))
              )}
            </motion.div>

            {isAdmin && (
              <motion.form
                id="invite-member"
                onSubmit={inviteMember}
                variants={cardVariants}
                className="card sticky top-24 h-fit overflow-hidden p-5 sm:p-6"
              >
                <div className="mb-5 flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-500/15 text-blue-300">
                    <UserPlus size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">Invite member</h2>
                    <p className="text-sm font-semibold text-slate-500">Create a collaborator profile.</p>
                  </div>
                </div>
                <div className="grid gap-3 sm:gap-4">
                  <input className="input" placeholder="Name" value={invite.name} onChange={(e) => setInvite({ ...invite, name: e.target.value })} required />
                  <input className="input" type="email" placeholder="Email" value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} required />
                  <input className="input" placeholder="Title" value={invite.title} onChange={(e) => setInvite({ ...invite, title: e.target.value })} />
                  <input className="input" placeholder="Department" value={invite.department} onChange={(e) => setInvite({ ...invite, department: e.target.value })} />
                  <button className="btn-primary">
                    <UserPlus size={18} />
                    Create member
                  </button>
                </div>
              </motion.form>
            )}
          </section>
        </>
      )}
    </motion.div>
  );
}
