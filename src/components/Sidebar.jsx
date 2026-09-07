import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building,
  Box,
  Gift,
  Map,
  BrainCircuit,
  FileText,
  BarChart,
  FolderOpen,
  Bell,
  LogOut,
  Menu,
  Mail,
  LayoutTemplate,
  Zap,
  Settings,
  ChevronDown,
  ChevronRight,
  MessageSquare
} from "lucide-react";

const navGroups = [
  {
    title: "Notification",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/" },
      { label: "Analytics", icon: BarChart, href: "/analytics" },
      { label: "Organization", icon: Building, href: "/organization" },
      { label: "Template", icon: LayoutTemplate, href: "/template" },
      { label: "Trigger", icon: Zap, href: "/trigger" },
      { label: "Notifications", icon: Bell, href: "/notifications" },
      { 
        label: "Settings", 
        icon: Settings, 
        children: [
          { label: "Email Setting", icon: Mail, href: "/settings/email" },
          { label: "SMS Setting", icon: MessageSquare, href: "/settings/sms" }
        ]
      },
    ]
  }
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState({ Settings: true });

  const toggleMenu = (label) => {
    setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const NavItemRenderer = ({ item, isSub = false }) => {
    const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
    
    if (item.children) {
      const isExpanded = openMenus[item.label];
      return (
        <div>
          <button
            className="nav-item"
            onClick={() => toggleMenu(item.label)}
            style={{ width: "100%", background: "none", border: "none", cursor: "pointer", justifyContent: "space-between" }}
          >
            <div className="nav-item-content">
              <item.icon className="nav-icon" size={20} />
              <span>{item.label}</span>
            </div>
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          
          {isExpanded && (
            <div style={{ marginLeft: "1.5rem", borderLeft: "1px solid var(--border-color)", paddingLeft: "0.5rem", marginTop: "0.25rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              {item.children.map((child, idx) => {
                const childActive = pathname.startsWith(child.href);
                return (
                  <Link
                    key={idx}
                    href={child.href}
                    className={`nav-item ${childActive ? "active" : ""}`}
                    style={{ padding: "0.5rem", fontSize: "0.9rem" }}
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="nav-item-content">
                      <child.icon className="nav-icon" size={16} />
                      <span>{child.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        href={item.href}
        className={`nav-item ${isActive ? "active" : ""}`}
        style={isSub ? { padding: "0.5rem", fontSize: "0.9rem" } : {}}
        onClick={() => setIsOpen(false)}
      >
        <div className="nav-item-content">
          <item.icon className="nav-icon" size={isSub ? 16 : 20} />
          <span>{item.label}</span>
        </div>
      </Link>
    );
  };

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div
            style={{
              width: "30px",
              height: "30px",
              backgroundColor: "var(--primary)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
            }}
          >
            M
          </div>
          <span>MantraCare</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} style={{ marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.75rem", paddingLeft: "0.75rem" }}>
              {group.title}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              {group.items.map((item, idx) => (
                <NavItemRenderer key={idx} item={item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button
          className="btn btn-primary"
          style={{ width: "100%", padding: "0.75rem", fontWeight: "600" }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
