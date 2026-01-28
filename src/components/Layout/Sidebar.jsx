import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Map, Eye, LayoutGrid, AlertTriangle, TrendingUp, BarChart3, Info, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

const navItems = [
  { to: '/', icon: Map, label: 'Dashboard' },
  { to: '/vision', icon: Eye, label: 'Urban Vision' },
  { to: '/districts', icon: LayoutGrid, label: 'Districts' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/alerts', icon: AlertTriangle, label: 'Alerts' },
  { to: '/insights', icon: TrendingUp, label: 'Predictions' },
  { to: '/about', icon: Info, label: 'About' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside data-tour="sidebar" className={`${collapsed ? 'w-14' : 'w-56'} bg-forest-dark border-r border-forest-light/50 flex flex-col shrink-0 transition-all duration-200`}>
      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-8 mt-2 mx-2 rounded-md text-text-muted hover:text-text-secondary hover:bg-forest-light/30 transition-colors"
      >
        {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 px-2 pt-3 space-y-0.5">
        {!collapsed && (
          <span className="block px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
            Navigation
          </span>
        )}
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `relative flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg transition-colors text-sm ${
                isActive
                  ? 'bg-forest-light/40 text-text-primary font-medium'
                  : 'text-text-secondary hover:bg-forest-light/20 hover:text-text-primary'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && !collapsed && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-leaf" />
                )}
                {isActive && collapsed && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-leaf" />
                )}
                <Icon size={18} className={`shrink-0 ${isActive ? 'text-leaf' : 'text-text-secondary'}`} />
                {!collapsed && <span>{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
