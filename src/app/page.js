"use client";

import { useState } from "react";
import Link from "next/link";
import { useNotifications } from "@/context/NotificationContext";
import { Activity, BellRing, Settings2, Calendar, FileText, ArrowRight, Eye } from "lucide-react";
import CustomSelect from "@/components/CustomSelect";
import LogDetailModal from "@/components/LogDetailModal";

export default function Dashboard() {
  const { notifications, triggers, logs, templates, selectedCompany } = useNotifications();
  
  // Filter states
  const [dateRange, setDateRange] = useState("Last 7 Days");
  const [triggerFilter, setTriggerFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
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
    if (range === "This Year") return logDate.getFullYear() === now.getFullYear();
    return true;
  };

  const filteredLogs = logs.filter(log => {
    if (!isDateInRange(log.timestamp, dateRange)) return false;

    if (typeFilter !== "All") {
      if (typeFilter === "App" && log.serviceType !== "App Notification" && log.serviceType !== "App") {
        return false;
      } else if (typeFilter !== "App" && log.serviceType !== typeFilter) {
        return false;
      }
    }

    if (triggerFilter !== "All") {
      const parentNotif = notifications.find(n => n.id === log.notificationId);
      if (!parentNotif || parentNotif.trigger !== triggerFilter) return false;
    }

    return true;
  });

  const totalSent = filteredLogs.filter(log => log.event === "Sent").length;
  const activeTriggersCount = triggers.length;
  const templatesCount = Object.keys(templates).length;

  return (
    <div style={{ padding: "0 1rem 2rem 1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.9rem", fontWeight: "800", fontFamily: "var(--font-display)", color: "var(--dark)", margin: 0, letterSpacing: "-0.02em" }}>Dashboard</h1>
          <p style={{ color: "var(--text-muted)", marginTop: "0.25rem", fontSize: "0.95rem" }}>
            Overview for <strong style={{ color: "var(--primary)" }}>{selectedCompany}</strong>
          </p>
        </div>

        <Link href="/analytics" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          <span>View Full Analytics</span> <ArrowRight size={16} />
        </Link>
      </div>

      {/* Filters (Active & Connected) */}
      <div className="card" style={{ padding: "1.25rem", marginBottom: "2rem", display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "center", overflow: "visible" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Calendar size={18} color="var(--text-muted)" />
          <CustomSelect 
            value={dateRange} 
            onChange={setDateRange}
            options={["Today", "Last 7 Days", "Last 30 Days", "This Year"]}
            style={{ minWidth: "150px" }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Settings2 size={18} color="var(--text-muted)" />
          <CustomSelect 
            value={triggerFilter} 
            onChange={setTriggerFilter}
            options={[{value: "All", label: "All Triggers"}, ...triggers.map(t => ({ value: t.name, label: t.name }))]}
            style={{ minWidth: "180px" }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <BellRing size={18} color="var(--text-muted)" />
          <CustomSelect 
            value={typeFilter} 
            onChange={setTypeFilter}
            options={[{value: "All", label: "All Types"}, {value: "Email", label: "Email"}, {value: "SMS", label: "SMS"}, {value: "App", label: "App Notification"}]}
            style={{ minWidth: "150px" }}
          />
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
        <div className="card" style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <div className="kpi-icon-chip" style={{ background: "linear-gradient(135deg, #1456f0, #0284c7)", boxShadow: "0 8px 20px rgba(20,86,240,0.28)" }}>
            <Activity size={24} color="white" />
          </div>
          <div>
            <p className="kpi-title" style={{ margin: 0 }}>Total Sent ({dateRange})</p>
            <h2 className="kpi-value" style={{ margin: 0 }}>{totalSent.toLocaleString()}</h2>
          </div>
        </div>

        <div className="card" style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <div className="kpi-icon-chip" style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 8px 20px rgba(16,185,129,0.28)" }}>
            <Settings2 size={24} color="white" />
          </div>
          <div>
            <p className="kpi-title" style={{ margin: 0 }}>Active Triggers</p>
            <h2 className="kpi-value" style={{ margin: 0 }}>{activeTriggersCount}</h2>
          </div>
        </div>

        <div className="card" style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <div className="kpi-icon-chip" style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)", boxShadow: "0 8px 20px rgba(139,92,246,0.28)" }}>
            <FileText size={24} color="white" />
          </div>
          <div>
            <p className="kpi-title" style={{ margin: 0 }}>Templates</p>
            <h2 className="kpi-value" style={{ margin: 0 }}>{templatesCount}</h2>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card" style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "700", fontFamily: "var(--font-display)", color: "var(--dark)", margin: 0 }}>Recent Log Events</h3>
          <Link href="/analytics" style={{ fontSize: "0.85rem", color: "var(--primary)", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
            Explore full logs table <ArrowRight size={14} />
          </Link>
        </div>

        {filteredLogs.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
            No recent activity matching the selected filters for {selectedCompany}.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
              <thead className="thead-dark">
                <tr style={{ textAlign: "left" }}>
                  <th style={{ padding: "1rem 1.5rem" }}>Log ID</th>
                  <th style={{ padding: "1rem 1.5rem" }}>Service Type</th>
                  <th style={{ padding: "1rem 1.5rem" }}>Template ID</th>
                  <th style={{ padding: "1rem 1.5rem" }}>Sent To</th>
                  <th style={{ padding: "1rem 1.5rem" }}>Status</th>
                  <th style={{ padding: "1rem 1.5rem", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.slice(0, 8).map((log) => (
                  <tr key={log.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "1rem", fontWeight: "600", color: "var(--primary)", fontFamily: "var(--font-mono)" }}>#{log.id}</td>
                    <td style={{ padding: "1rem", color: "var(--text-main)" }}>{log.serviceType}</td>
                    <td style={{ padding: "1rem", color: "var(--dark)", fontWeight: "500" }}>{log.templateId || "—"}</td>
                    <td style={{ padding: "1rem", fontWeight: "500", color: "var(--dark)" }}>{log.sentTo}</td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{ 
                        display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.3rem 0.85rem", borderRadius: "9999px", fontSize: "0.78rem", fontWeight: "600", fontFamily: "var(--font-display)", letterSpacing: "0.02em",
                        backgroundColor: log.event === "Failed" ? "#fee2e2" : log.event === "Received" ? "#dcfce7" : log.event === "Viewed" ? "#f3e8ff" : log.event === "Skipped" ? "#fef3c7" : "#e0f2fe",
                        color: log.event === "Failed" ? "#991b1b" : log.event === "Received" ? "#166534" : log.event === "Viewed" ? "#6b21a8" : log.event === "Skipped" ? "#92400e" : "#075985"
                      }}>
                        {log.event}
                      </span>
                    </td>
                    <td style={{ padding: "1rem", textAlign: "right" }}>
                      <button
                        className="btn btn-outline"
                        style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
                        onClick={() => setSelectedLog(log)}
                      >
                        <Eye size={14} /> View
                      </button>
                    </td>
                  </tr>
                ))}
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
