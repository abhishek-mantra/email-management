"use client";

import { useState } from "react";
import { useNotifications } from "@/context/NotificationContext";
import Link from "next/link";
import { 
  Plus, Edit, Trash2, Eye, Activity, LayoutTemplate, 
  Bell, FileText, BarChart2, ArrowRight, Search, CheckCircle2, 
  ShieldCheck, Send, Sparkles, X 
} from "lucide-react";
import toast from "react-hot-toast";
import LogDetailModal from "@/components/LogDetailModal";

export default function NotificationsPage() {
  const { notifications, logs, deleteNotification, updateNotification, selectedCompany, addLog } = useNotifications();
  const [searchQuery, setSearchQuery] = useState("");
  
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
  const [logFilter, setLogFilter] = useState("all"); // 'all' | 'production' | 'test'

  // Test Notification Modal State
  const [testNotification, setTestNotification] = useState(null);
  const [testRecipientEmail, setTestRecipientEmail] = useState("qa-tester@mantracare.com");
  const [testRecipientPhone, setTestRecipientPhone] = useState("+1 (555) 019-2834");
  const [testVariables, setTestVariables] = useState({
    client_name: "Jordan Lee",
    provider_name: "Dr. Amara Singh",
    session_date: "Aug 20, 2026",
    session_time: "10:30 AM"
  });
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Compute KPIs per Design_1.md Section 4.4
  const totalNotifications = notifications.length;
  const activeCount = notifications.filter(n => (n.status || "Active") === "Active").length;
  const totalLogs = logs.length;
  const failedLogs = logs.filter(l => l.event === "Failed").length;
  const sentAttempts = logs.filter(l => l.event === "Sent" || l.event === "Failed").length;
  const deliveryRate = sentAttempts > 0 ? Math.min(100, Math.round(((sentAttempts - failedLogs) / sentAttempts) * 100)) : 98;

  const testLogsCount = logs.filter(l => l.isTest || String(l.notificationId).startsWith("TEST")).length;
  const prodLogsCount = totalLogs - testLogsCount;

  const filteredNotifications = notifications.filter(n =>
    (n.name && n.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (n.description && n.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (n.trigger && n.trigger.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (n.displayTrigger && n.displayTrigger.toLowerCase().includes(searchQuery.toLowerCase())) ||
    String(n.id).includes(searchQuery)
  );

  const filteredLogs = logs.filter(l => {
    const isTestItem = Boolean(l.isTest || String(l.notificationId).startsWith("TEST"));
    if (logFilter === "production" && isTestItem) return false;
    if (logFilter === "test" && !isTestItem) return false;

    return (
      (l.sentTo && l.sentTo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (l.serviceType && l.serviceType.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (l.event && l.event.toLowerCase().includes(searchQuery.toLowerCase())) ||
      String(l.id).includes(searchQuery) ||
      String(l.notificationId).includes(searchQuery)
    );
  });

  const handleExecuteSendTestNotification = () => {
    if (!testNotification) return;

    const isSms = testNotification.type === "SMS";
    const target = isSms ? testRecipientPhone.trim() : testRecipientEmail.trim();

    if (!target) {
      toast.error(`Please provide a destination ${isSms ? "phone number" : "email address"}`);
      return;
    }

    setIsSendingTest(true);

    setTimeout(() => {
      let payloadText = isSms 
        ? (testNotification.smsContent || testNotification.name) 
        : (testNotification.emailContent || testNotification.name);

      Object.entries(testVariables).forEach(([k, v]) => {
        payloadText = payloadText.replace(new RegExp(`{{\\s*${k}\\s*}}`, "g"), v);
      });

      const newLog = addLog({
        id: Date.now(),
        notificationId: `TEST-${testNotification.id}`,
        serviceType: testNotification.type || "Email",
        sentTo: target,
        event: "Sent",
        status: "Delivered",
        templateName: testNotification.templateName || testNotification.name,
        payload: payloadText,
        isTest: true,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19)
      });

      setIsSendingTest(false);
      setTestNotification(null);
      toast.success(`Test dispatch sent to "${target}"! Recorded as Log #${newLog.id}.`);
    }, 450);
  };

  const renderNotificationTable = (data) => {
    if (data.length === 0) {
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "45vh", gap: "1rem" }}>
          <div style={{ color: "var(--text-muted)", marginBottom: "0.5rem", textAlign: "center" }}>
            <Bell size={44} style={{ margin: "0 auto", marginBottom: "0.75rem", opacity: 0.35, color: "var(--text-subtle)" }} />
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--dark)", marginBottom: "0.25rem" }}>
              {searchQuery ? "No notifications matched your search" : "No notifications created yet"}
            </h3>
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", maxWidth: "360px" }}>
              {searchQuery ? `Try clearing your filter "${searchQuery}" or search by ID` : "Create automated triggers, templates, and multi-channel workflows."}
            </p>
          </div>
          {!searchQuery && (
            <Link href="/notifications/add" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
              <Plus size={16} /> Create Notification
            </Link>
          )}
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
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ padding: "0.25rem 0.5rem", display: "inline-flex", color: "var(--primary)" }}
                        title="Send Test Dispatch"
                        onClick={() => {
                          setTestNotification(n);
                          if (n.type === "SMS") {
                            setTestRecipientPhone("+1 (555) 019-2834");
                          } else {
                            setTestRecipientEmail("qa-tester@mantracare.com");
                          }
                        }}
                      >
                        <Send size={16} />
                      </button>
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
    <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "800", fontFamily: "var(--font-display)", color: "var(--dark)", margin: 0, letterSpacing: "-0.025em" }}>Notifications</h1>
          <p style={{ color: "var(--text-muted)", margin: "0.25rem 0 0 0", fontSize: "0.875rem" }}>Multi-channel notification routing, campaigns, and delivery logs for {selectedCompany}</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Link href="/notifications/add" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem" }}>
            <Plus size={16} /> Add New Notification
          </Link>
        </div>
      </div>

      {/* KPI Stat Capsules (Design_1.md Section 4.4) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", marginBottom: "1.75rem" }}>
        <div style={{ backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)", borderRadius: "1.25rem", border: "1px solid rgba(255,255,255,0.8)", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-subtle)", fontFamily: "var(--font-display)", margin: 0 }}>TOTAL NOTIFICATIONS</p>
            <h3 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--dark)", fontFamily: "var(--font-display)", margin: "0.25rem 0 0 0", letterSpacing: "-0.02em" }}>{totalNotifications}</h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "0.25rem 0 0 0" }}>Configured pipelines</p>
          </div>
          <div style={{ width: "48px", height: "48px", borderRadius: "16px", backgroundColor: "rgba(20,86,240,0.08)", border: "1px solid rgba(20,86,240,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
            <Bell size={20} />
          </div>
        </div>

        <div style={{ backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)", borderRadius: "1.25rem", border: "1px solid rgba(255,255,255,0.8)", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-subtle)", fontFamily: "var(--font-display)", margin: 0 }}>ACTIVE PIPELINES</p>
            <h3 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--dark)", fontFamily: "var(--font-display)", margin: "0.25rem 0 0 0", letterSpacing: "-0.02em" }}>{activeCount}</h3>
            <p style={{ fontSize: "12px", color: "#059669", margin: "0.25rem 0 0 0", fontWeight: 600 }}>Currently dispatches live</p>
          </div>
          <div style={{ width: "48px", height: "48px", borderRadius: "16px", backgroundColor: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#059669" }}>
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div style={{ backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)", borderRadius: "1.25rem", border: "1px solid rgba(255,255,255,0.8)", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-subtle)", fontFamily: "var(--font-display)", margin: 0 }}>TOTAL LOGS</p>
            <h3 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--dark)", fontFamily: "var(--font-display)", margin: "0.25rem 0 0 0", letterSpacing: "-0.02em" }}>{totalLogs}</h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "0.25rem 0 0 0" }}>Recorded delivery events</p>
          </div>
          <div style={{ width: "48px", height: "48px", borderRadius: "16px", backgroundColor: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#7c3aed" }}>
            <FileText size={20} />
          </div>
        </div>

        <div style={{ backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)", borderRadius: "1.25rem", border: "1px solid rgba(255,255,255,0.8)", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-subtle)", fontFamily: "var(--font-display)", margin: 0 }}>DELIVERY RATE</p>
            <h3 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--dark)", fontFamily: "var(--font-display)", margin: "0.25rem 0 0 0", letterSpacing: "-0.02em" }}>{deliveryRate}%</h3>
            <p style={{ fontSize: "12px", color: "#059669", margin: "0.25rem 0 0 0", fontWeight: 600 }}>Optimal pipeline health</p>
          </div>
          <div style={{ width: "48px", height: "48px", borderRadius: "16px", backgroundColor: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#059669" }}>
            <ShieldCheck size={20} />
          </div>
        </div>
      </div>

      {/* Control Bar: Pill Switcher + Search Filter Pill */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        {/* Secondary Pill Switcher (Design_1.md Section 4.5) */}
        <div style={{
          display: "inline-flex",
          padding: "0.25rem",
          backgroundColor: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(226, 232, 240, 0.9)",
          borderRadius: "9999px",
          gap: "0.25rem",
          boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.02)"
        }}>
          <button
            type="button"
            onClick={() => handleTabChange("notifications")}
            style={{
              padding: "0.45rem 1.15rem",
              borderRadius: "9999px",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "0.825rem",
              letterSpacing: "0.01em",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              background: activeTab === "notifications" ? "var(--navy-gradient)" : "transparent",
              color: activeTab === "notifications" ? "#ffffff" : "#45515e",
              boxShadow: activeTab === "notifications" ? "0 3px 10px rgba(24, 30, 37, 0.28)" : "none"
            }}
          >
            <Bell size={15} /> Notifications ({totalNotifications})
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("log")}
            style={{
              padding: "0.45rem 1.15rem",
              borderRadius: "9999px",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "0.825rem",
              letterSpacing: "0.01em",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              background: activeTab === "log" ? "var(--navy-gradient)" : "transparent",
              color: activeTab === "log" ? "#ffffff" : "#45515e",
              boxShadow: activeTab === "log" ? "0 3px 10px rgba(24, 30, 37, 0.28)" : "none"
            }}
          >
            <FileText size={15} /> Recent Logs ({totalLogs})
          </button>
        </div>

        {/* Search Filter Pill (Design_1.md Section 4.5) */}
        <div style={{ position: "relative", width: "320px" }}>
          <Search size={15} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input 
            type="text"
            placeholder={activeTab === "notifications" ? "Search notifications, triggers, IDs..." : "Filter logs by recipient, service..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "0.55rem 1rem 0.55rem 2.4rem",
              borderRadius: "14px",
              border: "1px solid rgba(226, 232, 240, 0.9)",
              outline: "none",
              fontSize: "0.85rem",
              fontFamily: "var(--font-sans)",
              backgroundColor: "#ffffff"
            }}
          />
        </div>
      </div>

      {activeTab === "notifications" && (
        <div className="card" style={{ padding: "0", overflow: "hidden", minHeight: "50vh", borderRadius: "20px" }}>
          {renderNotificationTable(filteredNotifications)}
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

          {/* Sub-filter tabs for logs */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
            <div style={{ display: "flex", gap: "0.4rem", backgroundColor: "rgba(15,23,42,0.05)", padding: "3px", borderRadius: "100px" }}>
              <button
                type="button"
                onClick={() => setLogFilter("all")}
                style={{
                  padding: "0.35rem 0.85rem",
                  borderRadius: "100px",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: logFilter === "all" ? "var(--navy-gradient, #181e25)" : "transparent",
                  color: logFilter === "all" ? "#ffffff" : "var(--text-muted)",
                  transition: "all 0.15s ease"
                }}
              >
                All Logs ({totalLogs})
              </button>
              <button
                type="button"
                onClick={() => setLogFilter("production")}
                style={{
                  padding: "0.35rem 0.85rem",
                  borderRadius: "100px",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: logFilter === "production" ? "var(--navy-gradient, #181e25)" : "transparent",
                  color: logFilter === "production" ? "#ffffff" : "var(--text-muted)",
                  transition: "all 0.15s ease"
                }}
              >
                Production ({prodLogsCount})
              </button>
              <button
                type="button"
                onClick={() => setLogFilter("test")}
                style={{
                  padding: "0.35rem 0.85rem",
                  borderRadius: "100px",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: logFilter === "test" ? "var(--navy-gradient, #181e25)" : "transparent",
                  color: logFilter === "test" ? "#ffffff" : "var(--text-muted)",
                  transition: "all 0.15s ease"
                }}
              >
                Test Dispatches ({testLogsCount})
              </button>
            </div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Showing {filteredLogs.length} events
            </span>
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
                  {filteredLogs.slice(0, 30).map((log, index) => {
                    const isTestLog = Boolean(log.isTest || String(log.notificationId).startsWith("TEST"));
                    return (
                      <tr 
                        key={log.id} 
                        style={{ borderBottom: index !== logs.length - 1 ? "1px solid var(--border-color)" : "none", transition: "background-color 0.2s" }} 
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"} 
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        <td style={{ padding: "1rem 1.25rem", fontWeight: "600", color: "var(--dark)", fontFamily: "var(--font-mono)" }}>#{log.id}</td>
                        <td style={{ padding: "1rem 1.25rem", color: "var(--primary)", fontWeight: "500", fontFamily: "var(--font-mono)" }}>
                          <span>#{log.notificationId}</span>
                          {isTestLog && (
                            <span style={{ 
                              marginLeft: "6px", 
                              fontSize: "0.68rem", 
                              padding: "2px 7px", 
                              borderRadius: "100px", 
                              backgroundColor: "#fef3c7", 
                              color: "#92400e", 
                              fontWeight: 700, 
                              letterSpacing: "0.04em",
                              border: "1px solid #fde68a",
                              display: "inline-block"
                            }}>
                              TEST
                            </span>
                          )}
                        </td>
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
                    );
                  })}
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

      {/* Send Test Dispatch Modal for Notification */}
      {testNotification && (
        <div 
          style={{ 
            position: "fixed", 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: "rgba(15,23,42,0.6)", 
            backdropFilter: "blur(4px)", 
            zIndex: 1000, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            padding: "1rem" 
          }}
          onClick={() => setTestNotification(null)}
        >
          <div 
            className="card" 
            style={{ 
              width: "100%", 
              maxWidth: "580px", 
              backgroundColor: "white", 
              borderRadius: "1.25rem", 
              boxShadow: "0 24px 48px -12px rgba(15,23,42,0.25)", 
              border: "1px solid rgba(226,232,240,0.9)", 
              overflow: "hidden", 
              display: "flex", 
              flexDirection: "column" 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #e2e8f0", backgroundColor: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(20,86,240,0.1)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Send size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--dark)", margin: 0 }}>
                    Send Test Dispatch
                  </h3>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    Notification #{testNotification.id}: <strong>{testNotification.name}</strong> ({testNotification.type || "Email"})
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setTestNotification(null)} 
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "0.25rem" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {testNotification.type === "SMS" ? (
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--dark)", marginBottom: "0.35rem" }}>
                    Destination Phone Number <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    value={testRecipientPhone}
                    onChange={(e) => setTestRecipientPhone(e.target.value)}
                    placeholder="+1 (555) 019-2834"
                    style={{ width: "100%", boxSizing: "border-box" }}
                  />
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginTop: "0.25rem" }}>
                    Sender ID: MANTRA (via Twilio/Plivo)
                  </span>
                </div>
              ) : (
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--dark)", marginBottom: "0.35rem" }}>
                    Destination Email Address <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    value={testRecipientEmail}
                    onChange={(e) => setTestRecipientEmail(e.target.value)}
                    placeholder="e.g. tester@example.com"
                    style={{ width: "100%", boxSizing: "border-box" }}
                  />
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginTop: "0.25rem" }}>
                    From: MantraCare Notifications &lt;donotreply@mantra.care&gt;
                  </span>
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--dark)", marginBottom: "0.4rem" }}>
                  Test Substitution Variables
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  <div>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600 }}>client_name</span>
                    <input
                      type="text"
                      className="form-control"
                      value={testVariables.client_name}
                      onChange={(e) => setTestVariables({ ...testVariables, client_name: e.target.value })}
                      style={{ fontSize: "0.82rem", padding: "0.35rem 0.5rem" }}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600 }}>provider_name</span>
                    <input
                      type="text"
                      className="form-control"
                      value={testVariables.provider_name}
                      onChange={(e) => setTestVariables({ ...testVariables, provider_name: e.target.value })}
                      style={{ fontSize: "0.82rem", padding: "0.35rem 0.5rem" }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ padding: "0.75rem 1rem", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                This test dispatch will be registered in the delivery logs under the <strong>Recent Logs</strong> tab and telemetry counters will be updated in real time.
              </div>
            </div>

            <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #e2e8f0", backgroundColor: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button type="button" className="btn btn-outline" onClick={() => setTestNotification(null)} disabled={isSendingTest}>
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={handleExecuteSendTestNotification}
                disabled={isSendingTest}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
              >
                {isSendingTest ? "Dispatching..." : <><Send size={14} /> Send Test Dispatch</>}
              </button>
            </div>
          </div>
        </div>
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
