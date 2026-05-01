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
    <div className="min-h-screen overflow-hidden bg-slate-950 text-slate-50 before:fixed before:inset-0 before:-z-10 before:bg-[radial-gradient(circle_at_18%_10%,rgba(99,102,241,.28),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(20,184,166,.18),transparent_24%),radial-gradient(circle_at_55%_80%,rgba(217,70,239,.14),transparent_28%)]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-white/10 bg-slate-950/80 p-5 text-white shadow-2xl shadow-black/40 backdrop-blur-2xl lg:block">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-fuchsia-500 shadow-lg shadow-blue-500/25 ring-1 ring-white/20">
            <KanbanSquare />
          </div>
          <div>
            <p className="text-lg font-black">TaskFlow</p>
            <p className="text-xs font-bold text-slate-400">Team workspace</p>
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
                  `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition duration-200 ${
                    isActive ? 'bg-white/12 text-white shadow-lg shadow-blue-600/10 ring-1 ring-white/15' : 'text-slate-400 hover:translate-x-1 hover:bg-white/8 hover:text-white'
                  }`
                }
              >
                <Icon size={18} /> {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="absolute bottom-5 left-5 right-5 rounded-3xl border border-white/10 bg-white/[0.06] p-4 shadow-2xl backdrop-blur-xl">
          <p className="font-bold">{user?.name}</p>
          <p className="truncate text-xs text-slate-400">{user?.email}</p>
          <button onClick={logout} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm font-bold hover:bg-white/15">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      <main className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/55 px-4 py-4 backdrop-blur-2xl sm:px-6">
          <div className="flex items-center gap-3">
            <button className="btn-secondary !p-3 lg:hidden"><Menu size={18} /></button>
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tasks, projects, users..." className="input pl-11" />
            </div>
            <button className="btn-secondary !p-3" onClick={toggleDark}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
            <NavLink to="/notifications" className="btn-secondary !p-3"><Bell size={18} /></NavLink>
            <div className="hidden items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2 shadow-xl backdrop-blur-xl sm:flex">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-blue-600 via-indigo-500 to-fuchsia-500 text-sm font-black text-white">
                {user?.name?.[0]}
              </div>
              <div>
                <p className="text-sm font-black">{user?.name}</p>
                <p className="text-xs font-bold text-slate-500">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} className="p-4 pb-28 sm:p-6 lg:pb-6">
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
                `grid place-items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-black transition ${
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
