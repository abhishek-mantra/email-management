"use client";

import { useState } from "react";
import { useNotifications } from "@/context/NotificationContext";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye, BellOff, Activity, LayoutTemplate, Bell, FileText, BarChart2, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import LogDetailModal from "@/components/LogDetailModal";

export default function NotificationsPage() {
  const { notifications, logs, deleteNotification, updateNotification, selectedCompany } = useNotifications();
  
  // Safe initial tab reading from sessionStorage if available
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") {
      const savedTab = sessionStorage.getItem("notificationsActiveTab");
      if (savedTab && savedTab !== "triggers") return savedTab;
    }
    return "notifications";
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("notificationsActiveTab", tab);
    }
  };

  // For Log Modal
  const [selectedLog, setSelectedLog] = useState(null);

  const renderNotificationTable = (data) => {
    if (data.length === 0) {
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "50vh", gap: "1rem" }}>
          <div style={{ color: "var(--text-muted)", marginBottom: "1rem", textAlign: "center" }}>
            <BellOffIcon size={48} style={{ margin: "0 auto", marginBottom: "1rem", opacity: 0.5 }} />
            <p>You haven&apos;t created any notifications here yet.</p>
          </div>
          <Link href="/notifications/add" className="btn btn-primary">
            Create your first Notification
          </Link>
        </div>
      );
    }

    return (
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1050px" }}>
          <thead className="thead-dark">
            <tr style={{ textAlign: "left" }}>
              <th style={{ padding: "1rem 1.25rem" }}>ID</th>
              <th style={{ padding: "1rem 1.25rem" }}>Status</th>
              <th style={{ padding: "1rem 1.25rem" }}>User Type</th>
              <th style={{ padding: "1rem 1.25rem" }}>Name</th>
              <th style={{ padding: "1rem 1.25rem" }}>Trigger / Conditions</th>
              <th style={{ padding: "1rem 1.25rem" }}>Action</th>
              <th style={{ padding: "1rem 1.25rem" }}>Last Sent</th>
              <th style={{ padding: "1rem 1.25rem", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((n) => {
              // Compute Last Sent from logs
              const notifLogs = logs.filter(l => l.notificationId === n.id);
              const timestamps = notifLogs.map(l => l.timestamp).filter(Boolean);
              const lastSent = timestamps.length > 0 ? timestamps.sort().reverse()[0] : "—";
              const currentStatus = n.status || "Active";

              return (
                <tr 
                  key={n.id} 
                  style={{ borderBottom: "1px solid var(--border-color)", transition: "background-color 0.2s" }} 
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"} 
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <td style={{ padding: "1rem 1.25rem", fontWeight: "600", color: "var(--primary)", fontFamily: "var(--font-mono)" }}>#{n.id}</td>
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <button
                      type="button"
                      onClick={() => {
                        const nextStatus = currentStatus === "Active" ? "Paused" : "Active";
                        updateNotification(n.id, { status: nextStatus });
                        toast.success(`Notification #${n.id} is now ${nextStatus}`);
                      }}
                      style={{
                        border: "none",
                        cursor: "pointer",
                        padding: "0.3rem 0.85rem",
                        borderRadius: "9999px",
                        fontSize: "0.78rem",
                        fontWeight: "600",
                        fontFamily: "var(--font-display)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        backgroundColor: currentStatus === "Active" ? "#dcfce7" : "#f1f5f9",
                        color: currentStatus === "Active" ? "#166534" : "#64748b",
                        transition: "all 0.15s ease"
                      }}
                      title="Click to toggle Active / Paused"
                    >
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: currentStatus === "Active" ? "#16a34a" : "#94a3b8" }}></span>
                      {currentStatus}
                    </button>
                  </td>
                  <td style={{ padding: "1rem 1.25rem" }}>{n.category || "Client"}</td>
                  <td style={{ padding: "1rem 1.25rem", fontWeight: "500" }}>{n.description || n.name}</td>
                  <td style={{ padding: "1rem 1.25rem", color: "var(--text-muted)" }}>{n.displayTrigger || n.trigger}</td>
                  <td style={{ padding: "1rem 1.25rem", color: "var(--text-muted)" }}>{n.action}</td>
                  <td style={{ padding: "1rem 1.25rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>{lastSent}</td>
                  <td style={{ padding: "1rem 1.25rem", textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                      <Link 
                        href={`/analytics?notificationId=${n.id}`} 
                        className="btn btn-outline" 
                        style={{ padding: "0.25rem 0.5rem", display: "inline-flex", color: "var(--primary)" }} 
                        title="View Analytics"
                      >
                        <BarChart2 size={16} />
                      </Link>
                      <Link 
                        href={`/notifications/add?id=${n.id}`} 
                        className="btn btn-outline" 
                        style={{ padding: "0.25rem 0.5rem", display: "inline-flex" }} 
                        title="Edit"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        className="btn btn-outline"
                        style={{ padding: "0.25rem 0.5rem", color: "var(--danger)", borderColor: "transparent" }}
                        title="Delete"
                        onClick={() => {
                          deleteNotification(n.id);
                          toast.success("Notification deleted");
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.9rem", fontWeight: "800", fontFamily: "var(--font-display)", color: "var(--dark)", margin: 0, letterSpacing: "-0.02em" }}>Notifications</h1>
          <p style={{ color: "var(--text-muted)", margin: "0.25rem 0 0 0", fontSize: "0.9rem" }}>Showing notifications for {selectedCompany}</p>
        </div>

        {activeTab === "notifications" && (
          <Link href="/notifications/add" className="btn btn-primary">
            <span>Add New Notification</span> <Plus size={18} />
          </Link>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
        <div className="pill-switcher">
          <button
            className={activeTab === "notifications" ? "active" : ""}
            onClick={() => handleTabChange("notifications")}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><Bell size={16} /> Notification</span>
          </button>
          <button
            className={activeTab === "log" ? "active" : ""}
            onClick={() => handleTabChange("log")}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><FileText size={16} /> Log</span>
          </button>
        </div>
      </div>

      {activeTab === "notifications" && (
        <div className="card" style={{ padding: "1.5rem", minHeight: "60vh" }}>
          {renderNotificationTable(notifications)}
        </div>
      )}

      {activeTab === "log" && (
        <div className="card" style={{ padding: "1.5rem", minHeight: "60vh" }}>
          {/* Banner linking to full Analytics */}
          <div style={{ backgroundColor: "rgba(20, 86, 240, 0.07)", border: "1px solid rgba(20, 86, 240, 0.18)", padding: "0.95rem 1.25rem", borderRadius: "16px", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
            <div style={{ fontSize: "0.9rem", color: "#1e40af" }}>
              <strong>Lightweight recent activity view.</strong> Looking for interactive trend charts, failure breakdowns, or date range filters?
            </div>
            <Link href="/analytics" className="btn btn-primary" style={{ padding: "0.45rem 0.95rem", fontSize: "0.85rem" }}>
              Open Analytics <ArrowRight size={14} />
            </Link>
          </div>

          {logs.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "40vh", gap: "1rem" }}>
              <div style={{ color: "var(--text-muted)", textAlign: "center" }}>
                <Activity size={48} style={{ margin: "0 auto", marginBottom: "1rem", opacity: 0.5 }} />
                <h3 style={{ color: "var(--dark)", fontSize: "1.2rem", fontWeight: "600", marginBottom: "0.5rem" }}>No activity logs yet</h3>
                <p>Logs will appear here once notifications are triggered.</p>
              </div>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1000px" }}>
                <thead className="thead-dark">
                  <tr style={{ textAlign: "left" }}>
                    <th style={{ padding: "1rem 1.25rem" }}>Log ID</th>
                    <th style={{ padding: "1rem 1.25rem" }}>Notification ID</th>
                    <th style={{ padding: "1rem 1.25rem" }}>Template ID</th>
                    <th style={{ padding: "1rem 1.25rem" }}>Sent To</th>
                    <th style={{ padding: "1rem 1.25rem" }}>Service Type</th>
                    <th style={{ padding: "1rem 1.25rem" }}>Event</th>
                    <th style={{ padding: "1rem 1.25rem" }}>Timestamp</th>
                    <th style={{ padding: "1rem 1.25rem", textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.slice(0, 15).map((log, index) => (
                    <tr 
                      key={log.id} 
                      style={{ borderBottom: index !== logs.length - 1 ? "1px solid var(--border-color)" : "none", transition: "background-color 0.2s" }} 
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"} 
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      <td style={{ padding: "1rem 1.25rem", fontWeight: "600", color: "var(--dark)", fontFamily: "var(--font-mono)" }}>#{log.id}</td>
                      <td style={{ padding: "1rem 1.25rem", color: "var(--primary)", fontWeight: "500", fontFamily: "var(--font-mono)" }}>#{log.notificationId}</td>
                      <td style={{ padding: "1rem 1.25rem", color: "var(--dark)", fontWeight: "500" }}>{log.templateId || "—"}</td>
                      <td style={{ padding: "1rem 1.25rem" }}>{log.sentTo}</td>
                      <td style={{ padding: "1rem 1.25rem", color: "var(--text-muted)" }}>{log.serviceType}</td>
                      <td style={{ padding: "1rem 1.25rem" }}>
                        <span style={{ 
                          padding: "0.3rem 0.85rem", 
                          borderRadius: "9999px", 
                          fontSize: "0.78rem", 
                          fontWeight: "600",
                          fontFamily: "var(--font-display)",
                          backgroundColor: log.event === "Failed" ? "#fee2e2" : log.event === "Received" ? "#dcfce7" : log.event === "Viewed" ? "#f3e8ff" : log.event === "Skipped" ? "#fef3c7" : "#e0f2fe",
                          color: log.event === "Failed" ? "#991b1b" : log.event === "Received" ? "#166534" : log.event === "Viewed" ? "#6b21a8" : log.event === "Skipped" ? "#92400e" : "#075985"
                        }}>
                          {log.event}
                        </span>
                      </td>
                      <td style={{ padding: "1rem 1.25rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>{log.timestamp}</td>
                      <td style={{ padding: "1rem 1.25rem", textAlign: "right" }}>
                        <button
                          className="btn btn-outline"
                          style={{ padding: "0.25rem 0.75rem", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye size={16} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Reusable Log Detail Modal */}
      {selectedLog && (
        <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </div>
  );
}

// A simple BellOffIcon
function BellOffIcon({ size, style }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
      <path d="M18.63 13A17.89 17.89 0 0 1 18 8"></path>
      <path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"></path>
      <path d="M18 8a6 6 0 0 0-9.33-5"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
  );
}
