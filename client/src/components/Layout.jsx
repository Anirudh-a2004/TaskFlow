import { Bell, CalendarDays, KanbanSquare, LayoutDashboard, LogOut, Menu, Moon, Search, Settings, ShieldCheck, Sun, Users } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: KanbanSquare },
  { to: '/tasks', label: 'Kanban', icon: CalendarDays },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/team', label: 'Team', icon: Users },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/profile', label: 'Profile', icon: Settings },
  { to: '/admin', label: 'Admin', icon: ShieldCheck, adminOnly: true }
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { dark, toggleDark, search, setSearch } = useApp();

  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_10%_10%,rgba(99,102,241,.22),transparent_24%),radial-gradient(circle_at_85%_5%,rgba(20,184,166,.14),transparent_24%),radial-gradient(circle_at_50%_80%,rgba(217,70,239,.12),transparent_26%)]" />

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-white/10 bg-slate-950/80 p-6 text-white shadow-2xl shadow-black/40 backdrop-blur-3xl lg:block">
        <div className="mb-10 flex items-center gap-3">
          <div className="grid h-14 w-14 place-items-center rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-500 to-fuchsia-500 shadow-lg shadow-blue-500/25 ring-1 ring-white/20">
            <KanbanSquare size={24} />
          </div>
          <div>
            <p className="text-xl font-black tracking-tight">TaskFlow</p>
            <p className="mt-1 text-sm font-semibold text-slate-400">Modern team task manager</p>
          </div>
        </div>

        <nav className="grid gap-2">
          {nav.filter((item) => !item.adminOnly || user?.role === 'Admin').map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-semibold transition duration-200 ${
                    isActive ? 'bg-white/12 text-white shadow-lg shadow-blue-600/10 ring-1 ring-white/15' : 'text-slate-400 hover:translate-x-1 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-500 to-fuchsia-500 text-white">
              {user?.name?.[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-white">{user?.name}</p>
              <p className="text-xs font-semibold text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout} className="btn-secondary mt-5 w-full justify-center">Logout</button>
        </div>
      </aside>

      <main className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/65 px-4 py-4 backdrop-blur-2xl sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <button className="btn-secondary !p-3 lg:hidden"><Menu size={18} /></button>
              <div className="relative w-full max-w-md">
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search projects, tasks, people..."
                  className="input pl-11"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button className="btn-secondary !p-3" onClick={toggleDark} aria-label="Toggle theme">
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <NavLink to="/notifications" className="btn-secondary !p-3" aria-label="Notifications">
                <Bell size={18} />
              </NavLink>
              <div className="hidden items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.05] px-3 py-2 shadow-xl backdrop-blur-xl sm:flex">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-blue-600 via-indigo-500 to-fuchsia-500 text-sm font-black text-white">
                  {user?.name?.[0]}
                </div>
                <div>
                  <p className="text-sm font-black text-white">{user?.name}</p>
                  <p className="text-xs font-semibold text-slate-400">{user?.role}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} className="p-4 pb-28 sm:p-6 lg:pb-6">
          <Outlet />
        </motion.div>
      </main>

      <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 gap-1 rounded-[1.6rem] border border-white/10 bg-slate-950/82 p-2 shadow-2xl shadow-black/40 backdrop-blur-2xl lg:hidden">
        {nav.filter((item) => !item.adminOnly || user?.role === 'Admin').slice(0, 5).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `grid place-items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold transition ${
                  isActive ? 'bg-white/12 text-cyan-200 ring-1 ring-white/10' : 'text-slate-500 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              <span className="max-w-full truncate">{item.label.split(' ')[0]}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
