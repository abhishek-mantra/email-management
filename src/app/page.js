"use client";

import { useState } from "react";
import Link from "next/link";
import { useNotifications } from "@/context/NotificationContext";
import { 
  Activity, Bell, FileText, ArrowRight, Eye, 
  CheckCircle2, Send, Zap, Mail, MessageSquare, Smartphone 
} from "lucide-react";
import LogDetailModal from "@/components/LogDetailModal";

export default function Dashboard() {
  const { notifications, triggers, logs, templates, selectedCompany } = useNotifications();
  
  // Clean time range filter
  const [dateRange, setDateRange] = useState("Last 7 Days");
  const [selectedLog, setSelectedLog] = useState(null);

  const isDateInRange = (timestampStr, range) => {
    if (!timestampStr) return false;
    const logDate = new Date(timestampStr.replace(" ", "T"));
    if (isNaN(logDate.getTime())) return true;
    const now = new Date();
    const diffTime = now.getTime() - logDate.getTime();
    const diffDays = diffTime / (1000 * 3600 * 24);

    if (range === "Today") return logDate.toDateString() === now.toDateString() || diffDays <= 1;
    if (range === "Last 7 Days") return diffDays <= 7;
    if (range === "Last 30 Days") return diffDays <= 30;
    return true; // "All Time"
  };

  const filteredLogs = logs.filter(log => isDateInRange(log.timestamp, dateRange));

  // Primary Metrics with deduplicated dispatches (parity with Analytics & Organization)
  const dispatchMap = {};
  filteredLogs.forEach(l => {
    const dKey = `${l.notificationId || ""}_${l.sentTo || ""}_${(l.timestamp || "").split(" ")[0]}`;
    if (!dispatchMap[dKey]) {
      dispatchMap[dKey] = { sent: false, delivered: false, failed: false };
    }
    if (l.event === "Sent") dispatchMap[dKey].sent = true;
    if (l.event === "Received" || l.event === "Viewed") dispatchMap[dKey].delivered = true;
    if (l.event === "Failed") dispatchMap[dKey].failed = true;
  });

  const dispatches = Object.values(dispatchMap);
  const totalDispatched = dispatches.filter(d => d.sent || d.failed).length;
  const deliveredCount = dispatches.filter(d => d.delivered).length;
  const deliveryRate = totalDispatched > 0 ? Math.min(100, Math.round((deliveredCount / totalDispatched) * 100)) : 100;
  const activePipelinesCount = notifications.filter(n => (n.status || "Active") === "Active").length;
  const activeTriggersCount = triggers.length;

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1.5rem 2.5rem 1.5rem" }}>
      {/* Dashboard Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "800", fontFamily: "var(--font-display)", color: "var(--dark)", margin: 0, letterSpacing: "-0.025em" }}>
            Dashboard
          </h1>
          <p style={{ color: "var(--text-muted)", margin: "0.25rem 0 0 0", fontSize: "0.875rem" }}>
            Telemetry overview, active pipelines, and live dispatch logs for <strong style={{ color: "var(--primary)" }}>{selectedCompany}</strong>
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          {/* Streamlined Time Range Switcher */}
          <div className="pill-switcher" style={{ padding: "0.25rem" }}>
            {[
              { id: "Today", label: "Today" },
              { id: "Last 7 Days", label: "7 Days" },
              { id: "Last 30 Days", label: "30 Days" },
              { id: "All Time", label: "All" }
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                className={dateRange === item.id ? "active" : ""}
                onClick={() => setDateRange(item.id)}
                style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem" }}
              >
                {item.label}
              </button>
            ))}
          </div>

          <Link href="/analytics" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem" }}>
            <span>Full Analytics</span> <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {/* KPI Stat Capsules (Consistent with whole product) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", marginBottom: "1.75rem" }}>
        <div style={{ backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)", borderRadius: "1.25rem", border: "1px solid rgba(255,255,255,0.8)", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-subtle)", fontFamily: "var(--font-display)", margin: 0 }}>TOTAL DISPATCHED</p>
            <h3 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--dark)", fontFamily: "var(--font-display)", margin: "0.25rem 0 0 0", letterSpacing: "-0.02em" }}>{totalDispatched.toLocaleString()}</h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "0.25rem 0 0 0" }}>Dispatches in {dateRange}</p>
          </div>
          <div style={{ width: "48px", height: "48px", borderRadius: "16px", backgroundColor: "rgba(20,86,240,0.08)", border: "1px solid rgba(20,86,240,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
            <Send size={20} />
          </div>
        </div>

        <div style={{ backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)", borderRadius: "1.25rem", border: "1px solid rgba(255,255,255,0.8)", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-subtle)", fontFamily: "var(--font-display)", margin: 0 }}>ACTIVE PIPELINES</p>
            <h3 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--dark)", fontFamily: "var(--font-display)", margin: "0.25rem 0 0 0", letterSpacing: "-0.02em" }}>{activePipelinesCount}</h3>
            <p style={{ fontSize: "12px", color: "#059669", margin: "0.25rem 0 0 0", fontWeight: 600 }}>Live automated routes</p>
          </div>
          <div style={{ width: "48px", height: "48px", borderRadius: "16px", backgroundColor: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#059669" }}>
            <Bell size={20} />
          </div>
        </div>

        <div style={{ backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)", borderRadius: "1.25rem", border: "1px solid rgba(255,255,255,0.8)", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-subtle)", fontFamily: "var(--font-display)", margin: 0 }}>DELIVERY SUCCESS</p>
            <h3 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--dark)", fontFamily: "var(--font-display)", margin: "0.25rem 0 0 0", letterSpacing: "-0.02em" }}>{deliveryRate}%</h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "0.25rem 0 0 0" }}>Received & opened</p>
          </div>
          <div style={{ width: "48px", height: "48px", borderRadius: "16px", backgroundColor: "rgba(2,132,199,0.08)", border: "1px solid rgba(2,132,199,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-cyan)" }}>
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div style={{ backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)", borderRadius: "1.25rem", border: "1px solid rgba(255,255,255,0.8)", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-subtle)", fontFamily: "var(--font-display)", margin: 0 }}>ACTIVE TRIGGERS</p>
            <h3 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--dark)", fontFamily: "var(--font-display)", margin: "0.25rem 0 0 0", letterSpacing: "-0.02em" }}>{activeTriggersCount}</h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "0.25rem 0 0 0" }}>Configured event hooks</p>
          </div>
          <div style={{ width: "48px", height: "48px", borderRadius: "16px", backgroundColor: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#7c3aed" }}>
            <Zap size={20} />
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="card" style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#16a34a", boxShadow: "0 0 0 3px rgba(22, 163, 74, 0.2)" }}></span>
            <h3 style={{ fontSize: "1.15rem", fontWeight: "700", fontFamily: "var(--font-display)", color: "var(--dark)", margin: 0 }}>
              Recent Delivery Events
            </h3>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", backgroundColor: "#f1f5f9", padding: "0.15rem 0.5rem", borderRadius: "9999px", fontWeight: 600 }}>
              {filteredLogs.length} events
            </span>
          </div>
          <Link href="/analytics" style={{ fontSize: "0.85rem", color: "var(--primary)", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
            Explore full logs table <ArrowRight size={14} />
          </Link>
        </div>

        {filteredLogs.length === 0 ? (
          <div style={{ padding: "3rem 1rem", textAlign: "center", color: "var(--text-muted)" }}>
            <Activity size={36} style={{ color: "var(--text-subtle)", opacity: 0.4, marginBottom: "0.5rem" }} />
            <p style={{ margin: 0, fontWeight: 600 }}>No recent activity for {selectedCompany} in {dateRange}.</p>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>Dispatches will appear here in real time as events fire.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "850px" }}>
              <thead className="thead-dark">
                <tr style={{ textAlign: "left" }}>
                  <th style={{ padding: "1rem 1.25rem" }}>Log ID</th>
                  <th style={{ padding: "1rem 1.25rem" }}>Channel</th>
                  <th style={{ padding: "1rem 1.25rem" }}>Template / Context</th>
                  <th style={{ padding: "1rem 1.25rem" }}>Sent To</th>
                  <th style={{ padding: "1rem 1.25rem" }}>Timestamp</th>
                  <th style={{ padding: "1rem 1.25rem" }}>Status</th>
                  <th style={{ padding: "1rem 1.25rem", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.slice(0, 8).map((log) => {
                  const channel = log.serviceType || "Email";
                  const isEmail = channel.toLowerCase().includes("email");
                  const isSms = channel.toLowerCase().includes("sms");

                  return (
                    <tr 
                      key={log.id} 
                      style={{ borderBottom: "1px solid var(--border-color)", transition: "background-color 0.15s" }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      <td style={{ padding: "0.9rem 1.25rem", fontWeight: "600", color: "var(--primary)", fontFamily: "var(--font-mono)" }}>
                        #{log.id}
                      </td>
                      <td style={{ padding: "0.9rem 1.25rem" }}>
                        <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          padding: "0.15rem 0.55rem",
                          borderRadius: "9999px",
                          backgroundColor: isEmail ? "rgba(20, 86, 240, 0.08)" : isSms ? "rgba(139, 92, 246, 0.08)" : "rgba(16, 185, 129, 0.08)",
                          color: isEmail ? "var(--primary)" : isSms ? "#7c3aed" : "#059669"
                        }}>
                          {isEmail ? <Mail size={11} /> : isSms ? <MessageSquare size={11} /> : <Smartphone size={11} />}
                          {channel}
                        </span>
                      </td>
                      <td style={{ padding: "0.9rem 1.25rem", color: "var(--dark)", fontWeight: "500" }}>
                        {log.templateName || log.templateId || "Custom Alert"}
                      </td>
                      <td style={{ padding: "0.9rem 1.25rem", fontWeight: "500", color: "var(--dark)" }}>
                        {log.sentTo}
                      </td>
                      <td style={{ padding: "0.9rem 1.25rem", color: "var(--text-muted)", fontSize: "0.82rem" }}>
                        {log.timestamp || "—"}
                      </td>
                      <td style={{ padding: "0.9rem 1.25rem" }}>
                        <span style={{ 
                          display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: "600", fontFamily: "var(--font-display)",
                          backgroundColor: log.event === "Failed" ? "#fee2e2" : log.event === "Received" ? "#dcfce7" : log.event === "Viewed" ? "#f3e8ff" : log.event === "Skipped" ? "#fef3c7" : "#e0f2fe",
                          color: log.event === "Failed" ? "#991b1b" : log.event === "Received" ? "#166534" : log.event === "Viewed" ? "#6b21a8" : log.event === "Skipped" ? "#92400e" : "#075985"
                        }}>
                          <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "currentColor" }}></span>
                          {log.event}
                        </span>
                      </td>
                      <td style={{ padding: "0.9rem 1.25rem", textAlign: "right" }}>
                        <button
                          type="button"
                          className="btn btn-outline"
                          style={{ padding: "0.25rem 0.6rem", fontSize: "0.8rem", height: "auto", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
                          onClick={() => setSelectedLog(log)}
                          title="View Log Details"
                        >
                          <Eye size={13} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Shared Log Detail Modal */}
      {selectedLog && (
        <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </div>
  );
}
