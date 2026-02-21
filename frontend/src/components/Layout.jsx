/**
 * Layout.jsx
 * Main shell with collapsible sidebar + top bar.
 * Used by all authenticated pages.
 */
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Layout.css";

const NAV_BY_ROLE = {
  participant: [
    { path: "/dashboard",    icon: "⊞",  label: "Dashboard"     },
    { path: "/team",         icon: "👥", label: "My Team"       },
    { path: "/world",        icon: "🗺️", label: "World Map"     },
    { path: "/qr",           icon: "◫",  label: "My QR Pass"    },
  ],
  admin: [
    { path: "/dashboard",    icon: "⊞",  label: "Dashboard"     },
    { path: "/admin/teams",  icon: "👥", label: "Teams"         },
    { path: "/admin/verify", icon: "✓",  label: "Verification"  },
    { path: "/admin/entry",  icon: "◫",  label: "Entry / Food"  },
    { path: "/world",        icon: "🗺️", label: "World Map"     },
  ],
  judge: [
    { path: "/dashboard",    icon: "⊞",  label: "Dashboard"     },
    { path: "/judge/eval",   icon: "📋", label: "Evaluate"      },
    { path: "/world",        icon: "🗺️", label: "World Map"     },
  ],
  mentor: [
    { path: "/dashboard",    icon: "⊞",  label: "Dashboard"     },
    { path: "/mentor/teams", icon: "👥", label: "My Teams"      },
    { path: "/world",        icon: "🗺️", label: "World Map"     },
  ],
};

export function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const location         = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = NAV_BY_ROLE[user?.role] || NAV_BY_ROLE.participant;

  const handleLogout = () => { logout(); navigate("/auth"); };

  return (
    <div className={`layout ${collapsed ? "layout--collapsed" : ""}`}>
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar__brand">
          <div className="sidebar__logo">⚡</div>
          {!collapsed && <span className="sidebar__name">HackX</span>}
        </div>

        <nav className="sidebar__nav">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                className={`sidebar__item ${active ? "sidebar__item--active" : ""}`}
                onClick={() => navigate(item.path)}
                title={collapsed ? item.label : ""}
              >
                <span className="sidebar__icon">{item.icon}</span>
                {!collapsed && <span className="sidebar__label">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="sidebar__footer">
          {/* Avatar */}
          <div className="sidebar__user">
            <div className="sidebar__avatar">{user?.avatar || "?"}</div>
            {!collapsed && (
              <div className="sidebar__user-info">
                <div className="sidebar__user-name">{user?.name}</div>
                <div className="sidebar__user-role">{user?.role}</div>
              </div>
            )}
          </div>
          <button className="sidebar__collapse-btn" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? "▶" : "◀"}
          </button>
          <button className="sidebar__logout" onClick={handleLogout} title="Logout">⎋</button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="layout__main">
        {children}
      </main>
    </div>
  );
}
