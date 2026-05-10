import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BriefcaseBusiness, Mail, Plus, Shield, Sparkles, UserPlus, UserRoundCog, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import { api, qs } from '../utils/api.js';
import Skeleton, { EmptyState, SkeletonStack } from '../components/Skeleton.jsx';
import Modal from '../components/Modal.jsx';
import { useLocation } from 'react-router-dom';

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: 'easeOut' } }
};

export default function Team() {
  const { isAdmin } = useAuth();
  const { search } = useApp();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [leadIds, setLeadIds] = useState(() => new Set());
  const [loading, setLoading] = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [invite, setInvite] = useState({ name: '', email: '', title: 'Team Member', department: 'Product' });

  const openInvite = () => {
    if (!isAdmin) return toast.error('Only admins can invite members.', { className: 'tf-toast' });
    setShowInviteForm(true);
  };

  const load = async () => {
    setLoading(true);
    try {
      const [userRes, projectsRes] = await Promise.all([
        api(`/users${qs({ search, limit: 100 })}`),
        isAdmin ? api('/admin/projects?search=') : api('/projects?limit=200')
      ]);
      setUsers(userRes.items || []);
      const projects = projectsRes.items || [];
      const nextLeads = new Set(
        projects
          .map((project) => project.manager?._id || project.manager)
          .filter(Boolean)
          .map((value) => value.toString())
      );
      setLeadIds(nextLeads);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [search, isAdmin]);

  useEffect(() => {
    if (location.hash !== '#invite-member') return;
    setShowInviteForm(true);
    window.history.replaceState(null, '', location.pathname);
  }, [location.hash, location.pathname]);

  const inviteMember = async (event) => {
    event.preventDefault();
    if (inviting) return;
    setInviting(true);
    try {
      await api('/auth/invite', { method: 'POST', body: JSON.stringify(invite) });
      toast.success('Invitation sent. Member created.');
      setInvite({ name: '', email: '', title: 'Team Member', department: 'Product' });
      setShowInviteForm(false);
      load();
    } catch (error) {
      toast.error(error.message || 'Unable to invite member.', { className: 'tf-toast' });
    } finally {
      setInviting(false);
    }
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

  const roleLabel = (person) => {
    if (person.role === 'Admin') return { label: 'Admin', tone: 'bg-violet-500/12 text-violet-200' };
    if (leadIds.has(person._id)) return { label: 'Project Lead', tone: 'bg-amber-400/10 text-amber-100' };
    return { label: 'Member', tone: 'bg-white/10 text-slate-200' };
  };

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
          <motion.button
            whileHover={isAdmin ? { scale: 1.03, y: -2 } : undefined}
            whileTap={isAdmin ? { scale: 0.97 } : undefined}
            onClick={openInvite}
            className="btn-primary w-full sm:w-auto"
            aria-disabled={!isAdmin}
            title={!isAdmin ? 'Admin access required to invite members' : 'Invite a new teammate'}
          >
            <UserPlus size={18} />
            Invite member
          </motion.button>
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

          <section className="grid gap-6">
            <motion.div variants={cardVariants} className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {users.length === 0 ? (
                <div className="col-span-full">
                  <EmptyState
                    icon={Users}
                    title="Invite your team to start collaborating"
                    description="Bring teammates into TaskFlow to assign ownership, share updates, and ship projects faster."
                    action={
                      <button type="button" onClick={openInvite} className="btn-primary">
                        <UserPlus size={18} />
                        Invite member
                      </button>
                    }
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
                          <span className={`pill ${roleLabel(user).tone}`}>{roleLabel(user).label}</span>
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
          </section>
        </>
      )}

      <Modal
        open={showInviteForm}
        onClose={() => setShowInviteForm(false)}
        title="Invite team member"
        description="Create a collaborator profile and send credentials via email."
        size="md"
      >
        <form id="invite-member" onSubmit={inviteMember} className="grid gap-3 sm:gap-4">
          <input className="input" placeholder="Name" value={invite.name} onChange={(e) => setInvite({ ...invite, name: e.target.value })} required />
          <input className="input" type="email" placeholder="Email" value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} required />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input className="input" placeholder="Title" value={invite.title} onChange={(e) => setInvite({ ...invite, title: e.target.value })} />
            <input className="input" placeholder="Department" value={invite.department} onChange={(e) => setInvite({ ...invite, department: e.target.value })} />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button type="button" className="btn-secondary" onClick={() => setShowInviteForm(false)}>
              Cancel
            </button>
            <button className="btn-primary" disabled={inviting}>
              <UserPlus size={18} />
              {inviting ? 'Creating…' : 'Create member'}
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
