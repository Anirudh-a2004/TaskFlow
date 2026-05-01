import { useEffect, useState } from 'react';
import { Mail, Shield, UserRoundCog } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import { api, qs } from '../utils/api.js';

export default function Team() {
  const { isAdmin } = useAuth();
  const { search } = useApp();
  const [users, setUsers] = useState([]);
  const [invite, setInvite] = useState({ name: '', email: '', title: 'Team Member', department: 'Product' });

  const load = () => api(`/users${qs({ search, limit: 100 })}`).then((data) => setUsers(data.items));
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

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><p className="text-sm font-black uppercase text-fuchsia-300">People ops</p><h1 className="text-3xl font-black">Team & Users</h1></div>
        {isAdmin && <button onClick={() => document.getElementById('invite-member')?.scrollIntoView({ behavior: 'smooth' })} className="btn-secondary">Invite member</button>}
      </div>
      <div className={`grid gap-4 ${isAdmin ? 'xl:grid-cols-[1fr_360px]' : 'md:grid-cols-2 xl:grid-cols-3'}`}>
        {users.map((user) => (
          <article key={user._id} className="card p-5">
            <div className="flex items-start gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-teal-600 text-xl font-black text-white">{user.name[0]}</div>
              <div className="min-w-0 flex-1">
                <h2 className="font-black">{user.name}</h2>
                <p className="flex items-center gap-1 truncate text-sm font-semibold text-slate-500"><Mail size={14} />{user.email}</p>
                <p className="mt-2 text-sm text-slate-500">{user.title} - {user.department}</p>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between">
              <span className="pill bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200"><Shield size={14} />{user.role}</span>
              {isAdmin && (
                <button onClick={() => role(user._id, user.role === 'Admin' ? 'Member' : 'Admin')} className="btn-secondary !py-2">
                  <UserRoundCog size={16} />Toggle role
                </button>
              )}
            </div>
          </article>
        ))}
        {isAdmin && (
          <form id="invite-member" onSubmit={inviteMember} className="card p-5">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-black"><UserRoundCog className="text-blue-600" />Invite member</h2>
            <div className="grid gap-4">
              <input className="input" placeholder="Name" value={invite.name} onChange={(e) => setInvite({ ...invite, name: e.target.value })} required />
              <input className="input" type="email" placeholder="Email" value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} required />
              <input className="input" placeholder="Title" value={invite.title} onChange={(e) => setInvite({ ...invite, title: e.target.value })} />
              <input className="input" placeholder="Department" value={invite.department} onChange={(e) => setInvite({ ...invite, department: e.target.value })} />
              <button className="btn-primary">Create member</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
