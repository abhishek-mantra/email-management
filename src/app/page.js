"use client";

import Link from "next/link";
import { useNotifications } from "@/context/NotificationContext";
import { 
  LayoutTemplate, Zap, Bell, Building, BarChart, Send, ArrowUpRight, Activity 
} from "lucide-react";
import { computeDispatchSummary } from "@/lib/logStats";

export default function Dashboard() {
  const { notifications, triggers, templates, logs, organizations, selectedCompany } = useNotifications();

  // Single top-line metric — pulled from the same shared computation Analytics uses
  const todaySummary = computeDispatchSummary(logs, { dateRange: "Today" });
  const dispatchesToday = todaySummary.totalAttempted;

  const quickLinks = [
    {
      label: "Notification Templates",
      description: "Message copies, channels, and substitution presets",
      count: Object.keys(templates || {}).length,
      countLabel: "templates",
      icon: LayoutTemplate,
      color: "var(--primary)",
      bgLight: "rgba(20, 86, 240, 0.08)",
      borderColor: "rgba(20, 86, 240, 0.15)",
      href: "/template"
    },
    {
      label: "Triggers",
      description: "Event listeners and dispatch hooks",
      count: triggers.length,
      countLabel: "configured",
      icon: Zap,
      color: "#7c3aed",
      bgLight: "rgba(139, 92, 246, 0.08)",
      borderColor: "rgba(139, 92, 246, 0.16)",
      href: "/trigger"
    },
    {
      label: "Notifications",
      description: "Automation pipelines and campaign routes",
      count: notifications.length,
      countLabel: notifications.length === 1 ? "pipeline" : "pipelines",
      icon: Bell,
      color: "#059669",
      bgLight: "rgba(16, 185, 129, 0.08)",
      borderColor: "rgba(16, 185, 129, 0.16)",
      href: "/notifications"
    },
    {
      label: "Organization",
      description: "Workspaces, reporting endpoints, and webhooks",
      count: organizations.length,
      countLabel: organizations.length === 1 ? "tenant" : "tenants",
      icon: Building,
      color: "var(--brand-cyan)",
      bgLight: "rgba(2, 132, 199, 0.08)",
      borderColor: "rgba(2, 132, 199, 0.16)",
      href: "/organization"
    },
    {
      label: "Analytics",
      description: "Delivery performance, diagnostics, and full logs",
      icon: BarChart,
      href: "/analytics",
      isAnalytics: true
    }
  ];

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 1rem 2.5rem 1rem" }}>
      {/* Dashboard Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "800", fontFamily: "var(--font-display)", color: "var(--dark)", margin: 0, letterSpacing: "-0.025em" }}>
            Dashboard
          </h1>
          <p style={{ color: "var(--text-muted)", margin: "0.25rem 0 0 0", fontSize: "0.875rem", maxWidth: "560px" }}>
            Welcome to MantraCare Notifications for <strong style={{ color: "var(--primary)" }}>{selectedCompany}</strong> — configure templates, wire triggers, and track delivery in one place.
          </p>
        </div>
        <Link href="/analytics" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem" }}>
          <BarChart size={15} /> View Analytics
        </Link>
      </div>

      {/* Single top-line metric */}
      <div className="card" style={{ padding: "1.25rem 1.5rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "1.25rem" }}>
        <div className="kpi-icon-chip" style={{ background: "linear-gradient(135deg, #1456f0, #0284c7)", boxShadow: "0 8px 20px rgba(20,86,240,0.28)" }}>
          <Send size={22} color="white" />
        </div>
        <div>
          <p className="kpi-title" style={{ margin: 0 }}>Dispatches Today</p>
          <h2 className="kpi-value" style={{ margin: "0.2rem 0 0 0" }}>
            {dispatchesToday.toLocaleString()}
          </h2>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
            Messages sent for {selectedCompany} — dive into <Link href="/analytics" style={{ color: "var(--primary)", fontWeight: "600" }}>Analytics</Link> for the full breakdown
          </span>
        </div>
      </div>

      {/* Quick links */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
        {quickLinks.map((link) => {
          const IconComponent = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="card"
              style={{
                padding: "1.25rem 1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                textDecoration: "none",
                backgroundColor: link.isAnalytics ? "var(--navy-gradient)" : "rgba(255,255,255,0.85)",
                color: link.isAnalytics ? "white" : "var(--dark)",
                border: link.isAnalytics ? "1px solid transparent" : "1px solid rgba(255,255,255,0.8)",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 10px 25px -4px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(20, 86, 240, 0.18)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "";
                e.currentTarget.style.transform = "none";
              }}
            >
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "16px",
                backgroundColor: link.isAnalytics ? "rgba(255,255,255,0.14)" : link.bgLight,
                border: link.isAnalytics ? "1px solid rgba(255,255,255,0.22)" : `1px solid ${link.borderColor}`,
                color: link.isAnalytics ? "white" : link.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}>
                <IconComponent size={20} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: "1.05rem", fontWeight: "700", fontFamily: "var(--font-display)", color: link.isAnalytics ? "white" : "var(--dark)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {link.label}
                </div>
                <div style={{ fontSize: "0.8rem", color: link.isAnalytics ? "rgba(255,255,255,0.7)" : "var(--text-muted)", marginTop: "0.15rem" }}>
                  {link.description}
                </div>
                {typeof link.count === "number" && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.6rem" }}>
                    <Activity size={12} style={{ color: link.isAnalytics ? "rgba(255,255,255,0.7)" : "var(--text-subtle)" }} />
                    <span style={{ fontSize: "0.78rem", fontWeight: "700", fontFamily: "var(--font-display)", color: link.isAnalytics ? "white" : "var(--text-main)" }}>
                      {link.count} {link.countLabel}
                    </span>
                  </div>
                )}
              </div>
              <ArrowUpRight size={18} style={{ color: link.isAnalytics ? "rgba(255,255,255,0.8)" : "var(--text-subtle)", flexShrink: 0 }} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}