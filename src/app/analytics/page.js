"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  BarChart, 
  Calendar, 
  Filter, 
  Search, 
  Send, 
  CheckCircle2, 
  AlertOctagon, 
  AlertTriangle, 
  Activity, 
  ArrowUpRight, 
  Eye, 
  Edit3, 
  RotateCcw,
  Zap,
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  ShieldCheck
} from "lucide-react";
import { useNotifications } from "@/context/NotificationContext";
import CustomSelect from "@/components/CustomSelect";
import LogDetailModal from "@/components/LogDetailModal";

function AnalyticsContent() {
  const searchParams = useSearchParams();
  const paramNotificationId = searchParams.get("notificationId");

  const { logs, notifications, triggers, selectedCompany } = useNotifications();

  // Filters State
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [channelFilter, setChannelFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [notificationFilter, setNotificationFilter] = useState(paramNotificationId ? String(paramNotificationId) : "All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Selected Log Modal
  const [selectedLog, setSelectedLog] = useState(null);

  // Active breakdown tab
  const [breakdownTab, setBreakdownTab] = useState("notifications"); // "notifications" | "triggers"

  // Date filtering helper
  const isDateInRange = (timestampStr, range) => {
    if (!timestampStr) return false;
    if (range === "All Time") return true;

    // Parse YYYY-MM-DD
    const logDate = new Date(timestampStr.replace(" ", "T"));
    if (isNaN(logDate.getTime())) return true;

    // Reference now based on latest log or current system time
    const now = new Date();
    const diffTime = now.getTime() - logDate.getTime();
    const diffDays = diffTime / (1000 * 3600 * 24);

    if (range === "Today") {
      return logDate.toDateString() === now.toDateString() || diffDays <= 1;
    }
    if (range === "Last 7 Days") {
      return diffDays <= 7;
    }
    if (range === "Last 30 Days") {
      return diffDays <= 30;
    }
    if (range === "This Year") {
      return logDate.getFullYear() === now.getFullYear();
    }
    return true;
  };

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Date filter
      if (!isDateInRange(log.timestamp, dateRange)) return false;

      // Channel filter
      if (channelFilter !== "All") {
        if (channelFilter === "App Notification" && log.serviceType !== "App Notification" && log.serviceType !== "App") {
          return false;
        } else if (channelFilter !== "App Notification" && log.serviceType !== channelFilter) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== "All") {
        if (statusFilter === "Delivered" || statusFilter === "Received") {
          if (log.event !== "Received" && log.event !== "Delivered") return false;
        } else if (log.event !== statusFilter) {
          return false;
        }
      }

      // Notification filter
      if (notificationFilter !== "All") {
        if (String(log.notificationId) !== String(notificationFilter)) return false;
      }

      // Recipient search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const sentToMatch = (log.sentTo || "").toLowerCase().includes(query);
        const templateMatch = (log.templateId || "").toLowerCase().includes(query);
        const logIdMatch = String(log.id).includes(query);
        if (!sentToMatch && !templateMatch && !logIdMatch) return false;
      }

      return true;
    });
  }, [logs, dateRange, channelFilter, statusFilter, notificationFilter, searchQuery]);

  // Summary Metrics Computation: Group logs into unique message dispatches
  // Each dispatch represents one message sent to a recipient
  const dispatchSummary = useMemo(() => {
    const map = new Map();

    logs.forEach(log => {
      if (!isDateInRange(log.timestamp, dateRange)) return;
      if (channelFilter !== "All") {
        if (channelFilter === "App Notification" && log.serviceType !== "App Notification" && log.serviceType !== "App") return;
        if (channelFilter !== "App Notification" && log.serviceType !== channelFilter) return;
      }
      if (notificationFilter !== "All") {
        if (String(log.notificationId) !== String(notificationFilter)) return;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const sentToMatch = (log.sentTo || "").toLowerCase().includes(query);
        const templateMatch = (log.templateId || "").toLowerCase().includes(query);
        const logIdMatch = String(log.id).includes(query);
        if (!sentToMatch && !templateMatch && !logIdMatch) return;
      }

      const day = (log.timestamp || "").slice(0, 10);
      const key = `${log.notificationId || "0"}_${log.sentTo || "unknown"}_${day}`;
      
      if (!map.has(key)) {
        map.set(key, {
          key,
          notificationId: log.notificationId,
          sentTo: log.sentTo,
          serviceType: log.serviceType,
          templateId: log.templateId,
          timestamp: log.timestamp,
          events: new Set(),
          status: "Sent"
        });
      }

      const entry = map.get(key);
      entry.events.add(log.event);
      if (entry.events.has("Viewed")) entry.status = "Viewed";
      else if (entry.events.has("Received") || entry.events.has("Delivered")) entry.status = "Received";
      else if (entry.events.has("Failed")) entry.status = "Failed";
      else if (entry.events.has("Skipped")) entry.status = "Skipped";
      else if (entry.events.has("Sent")) entry.status = "Sent";
    });

    const items = Array.from(map.values());
    const totalAttempted = items.filter(d => d.status !== "Skipped").length;
    const delivered = items.filter(d => d.status === "Received" || d.status === "Viewed").length;
    const failed = items.filter(d => d.status === "Failed").length;
    const skipped = items.filter(d => d.status === "Skipped").length;
    
    const deliveryRate = totalAttempted > 0 ? Math.min(100, Math.round((delivered / totalAttempted) * 100)) : 100;
    const failureRate = totalAttempted > 0 ? Math.min(100, Math.round((failed / totalAttempted) * 100)) : 0;

    return {
      totalAttempted,
      delivered,
      failed,
      skipped,
      deliveryRate,
      failureRate
    };
  }, [logs, dateRange, channelFilter, notificationFilter, searchQuery]);

  // Notification Filter Options
  const notificationOptions = useMemo(() => {
    const list = notifications.map(n => ({
      value: String(n.id),
      label: `#${n.id} - ${n.name || n.description}`
    }));
    return [{ value: "All", label: "All Notifications" }, ...list];
  }, [notifications]);

  // Reset Filters Handler
  const handleResetFilters = () => {
    setDateRange("Last 30 Days");
    setChannelFilter("All");
    setStatusFilter("All");
    setNotificationFilter("All");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const hasActiveFilters = dateRange !== "Last 30 Days" || channelFilter !== "All" || statusFilter !== "All" || notificationFilter !== "All" || searchQuery !== "";

  // Pagination for full logs table
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / itemsPerPage));
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(start, start + itemsPerPage);
  }, [filteredLogs, currentPage]);

  // Breakdown by Notification (dynamic per active filters)
  const notificationBreakdown = useMemo(() => {
    return notifications.map(notif => {
      const notifLogs = filteredLogs.filter(l => l.notificationId === notif.id);
      const sent = notifLogs.filter(l => l.event === "Sent" || l.event === "Failed").length;
      const failed = notifLogs.filter(l => l.event === "Failed").length;
      const failRate = sent > 0 ? Math.min(100, Math.round((failed / sent) * 100)) : 0;
      
      // Max timestamp
      const timestamps = notifLogs.map(l => l.timestamp).filter(Boolean);
      const lastSent = timestamps.length > 0 ? timestamps.sort().reverse()[0] : "—";

      return {
        id: notif.id,
        name: notif.name || notif.description,
        channel: notif.type || "Email",
        sent,
        failed,
        failRate,
        lastSent
      };
    });
  }, [notifications, filteredLogs]);

  // Breakdown by Trigger (dynamic per active filters)
  const triggerBreakdown = useMemo(() => {
    return triggers.map(trig => {
      // Find all notifications matching this trigger
      const matchingNotifs = notifications.filter(n => n.trigger === trig.name);
      const matchingNotifIds = matchingNotifs.map(n => n.id);
      
      const trigLogs = filteredLogs.filter(l => matchingNotifIds.includes(l.notificationId));
      const sent = trigLogs.filter(l => l.event === "Sent" || l.event === "Failed").length;
      const failed = trigLogs.filter(l => l.event === "Failed").length;
      const failRate = sent > 0 ? Math.min(100, Math.round((failed / sent) * 100)) : 0;

      return {
        id: trig.id,
        name: trig.name,
        eventType: trig.eventType,
        notificationsCount: matchingNotifs.length,
        sent,
        failed,
        failRate
      };
    });
  }, [triggers, notifications, filteredLogs]);

  // Channel Deliverability Breakdown
  const channelBreakdown = useMemo(() => {
    const channels = ["Email", "SMS", "App Notification"];
    return channels.map(channel => {
      const channelLogs = filteredLogs.filter(l => {
        if (channel === "App Notification") {
          return l.serviceType === "App Notification" || l.serviceType === "App";
        }
        return l.serviceType === channel;
      });

      const map = new Map();
      channelLogs.forEach(l => {
        const day = (l.timestamp || "").slice(0, 10);
        const key = `${l.notificationId}_${l.sentTo}_${day}`;
        if (!map.has(key)) {
          map.set(key, { events: new Set(), status: "Sent" });
        }
        map.get(key).events.add(l.event);
        if (l.event === "Viewed") map.get(key).status = "Viewed";
        else if (l.event === "Received" || l.event === "Delivered") map.get(key).status = "Received";
        else if (l.event === "Failed") map.get(key).status = "Failed";
        else if (l.event === "Skipped") map.get(key).status = "Skipped";
      });

      const items = Array.from(map.values());
      const attempted = items.filter(d => d.status !== "Skipped").length;
      const delivered = items.filter(d => d.status === "Received" || d.status === "Viewed").length;
      const viewed = items.filter(d => d.status === "Viewed").length;
      const failed = items.filter(d => d.status === "Failed").length;
      const skipped = items.filter(d => d.status === "Skipped").length;

      const rate = attempted > 0 ? Math.min(100, Math.round((delivered / attempted) * 100)) : (channelLogs.length > 0 ? 100 : 0);
      const viewRate = delivered > 0 ? Math.min(100, Math.round((viewed / delivered) * 100)) : 0;

      return {
        name: channel === "App Notification" ? "Mobile App Push" : channel,
        rawChannel: channel,
        attempted,
        delivered,
        viewed,
        failed,
        skipped,
        rate,
        viewRate,
        icon: channel === "Email" ? Mail : channel === "SMS" ? MessageSquare : Smartphone,
        color: channel === "Email" ? "var(--primary)" : channel === "SMS" ? "#7c3aed" : "#059669",
        bgLight: channel === "Email" ? "rgba(20, 86, 240, 0.08)" : channel === "SMS" ? "rgba(139, 92, 246, 0.08)" : "rgba(16, 185, 129, 0.08)",
        borderColor: channel === "Email" ? "rgba(20, 86, 240, 0.16)" : channel === "SMS" ? "rgba(139, 92, 246, 0.16)" : "rgba(16, 185, 129, 0.16)"
      };
    });
  }, [filteredLogs]);

  // Error & Skip Diagnostics Breakdown
  const diagnosticsList = useMemo(() => {
    const map = new Map();

    filteredLogs.forEach(log => {
      if (log.event === "Failed" || log.event === "Skipped") {
        const reasonText = log.error || log.reason || (log.event === "Failed" ? "Delivery rejected by carrier" : "Skipped by routing rules");
        if (!map.has(reasonText)) {
          map.set(reasonText, {
            reason: reasonText,
            event: log.event,
            count: 0,
            channel: log.serviceType || "System",
            sampleRecipient: log.sentTo
          });
        }
        map.get(reasonText).count += 1;
      }
    });

    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [filteredLogs]);

  return (
    <div style={{ padding: "0 1rem 3rem 1rem", maxWidth: "1300px", margin: "0 auto" }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <h1 style={{ fontSize: "1.9rem", fontWeight: "800", fontFamily: "var(--font-display)", color: "var(--dark)", margin: 0, letterSpacing: "-0.02em" }}>
              Analytics & Delivery Reports
            </h1>
            <span style={{ 
              backgroundColor: "rgba(20, 86, 240, 0.08)", 
              color: "var(--primary)", 
              padding: "0.3rem 0.85rem", 
              borderRadius: "9999px", 
              fontSize: "0.8rem", 
              fontWeight: "600",
              fontFamily: "var(--font-display)" 
            }}>
              {selectedCompany}
            </span>
          </div>
          <p style={{ color: "var(--text-muted)", marginTop: "0.35rem", fontSize: "0.95rem" }}>
            Real-time delivery performance, failure monitoring, and delivery logs breakdown.
          </p>
        </div>

        {hasActiveFilters && (
          <button 
            className="btn btn-outline" 
            onClick={handleResetFilters}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", padding: "0.5rem 1rem" }}
          >
            <RotateCcw size={15} /> Reset Filters
          </button>
        )}
      </div>

      {/* Functional Filter Bar */}
      <div className="card" style={{ padding: "1.25rem 1.5rem", marginBottom: "2rem", overflow: "visible" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", color: "var(--dark)", fontWeight: "600", fontSize: "0.9rem" }}>
          <Filter size={16} color="var(--primary)" />
          <span>Filters & Range</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", alignItems: "center" }}>
          
          {/* Date Range */}
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.4rem" }}>
              Date Range
            </label>
            <CustomSelect
              value={dateRange}
              onChange={(val) => { setDateRange(val); setCurrentPage(1); }}
              options={["Today", "Last 7 Days", "Last 30 Days", "This Year", "All Time"]}
              icon={Calendar}
              style={{ width: "100%" }}
            />
          </div>

          {/* Channel */}
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.4rem" }}>
              Channel
            </label>
            <CustomSelect
              value={channelFilter}
              onChange={(val) => { setChannelFilter(val); setCurrentPage(1); }}
              options={["All", "Email", "SMS", "App Notification"]}
              style={{ width: "100%" }}
            />
          </div>

          {/* Status */}
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.4rem" }}>
              Status
            </label>
            <CustomSelect
              value={statusFilter}
              onChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
              options={["All", "Sent", "Received", "Viewed", "Failed", "Skipped"]}
              style={{ width: "100%" }}
            />
          </div>

          {/* Notification */}
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.4rem" }}>
              Notification
            </label>
            <CustomSelect
              value={notificationFilter}
              onChange={(val) => { setNotificationFilter(val); setCurrentPage(1); }}
              options={notificationOptions}
              style={{ width: "100%" }}
            />
          </div>

          {/* Recipient Search */}
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.4rem" }}>
              Recipient / Template Search
            </label>
            <div style={{ position: "relative" }}>
              <input 
                type="text"
                placeholder="Search email, phone, user..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="form-control"
                style={{ paddingLeft: "2.2rem", width: "100%", height: "42px" }}
              />
              <Search size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            </div>
          </div>

        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        
        {/* Total Dispatched */}
        <div className="card" style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <div className="kpi-icon-chip" style={{ background: "linear-gradient(135deg, #1456f0, #0284c7)", boxShadow: "0 8px 20px rgba(20,86,240,0.28)" }}>
            <Send size={22} color="white" />
          </div>
          <div>
            <p className="kpi-title">Total Dispatched</p>
            <h2 className="kpi-value" style={{ margin: "0.2rem 0 0 0" }}>
              {dispatchSummary.totalAttempted}
            </h2>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              Messages in {dateRange}
            </span>
          </div>
        </div>

        {/* Delivered Rate */}
        <div className="card" style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <div className="kpi-icon-chip" style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 8px 20px rgba(16,185,129,0.28)" }}>
            <CheckCircle2 size={22} color="white" />
          </div>
          <div>
            <p className="kpi-title">Delivery Rate</p>
            <h2 className="kpi-value" style={{ margin: "0.2rem 0 0 0" }}>
              {dispatchSummary.totalAttempted > 0 ? `${dispatchSummary.deliveryRate}%` : "—"}
            </h2>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              {dispatchSummary.delivered} confirmed delivered
            </span>
          </div>
        </div>

        {/* Failed Rate */}
        <div className="card" style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <div className="kpi-icon-chip" style={{ background: "linear-gradient(135deg, #ef4444, #b91c1c)", boxShadow: "0 8px 20px rgba(239,68,68,0.28)" }}>
            <AlertOctagon size={22} color="white" />
          </div>
          <div>
            <p className="kpi-title">Failure Rate</p>
            <h2 className="kpi-value" style={{ margin: "0.2rem 0 0 0" }}>
              {dispatchSummary.totalAttempted > 0 ? `${dispatchSummary.failureRate}%` : "0%"}
            </h2>
            <span style={{ fontSize: "0.78rem", color: "var(--danger)" }}>
              {dispatchSummary.failed} message failures
            </span>
          </div>
        </div>

        {/* Skipped Count */}
        <div className="card" style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <div className="kpi-icon-chip" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", boxShadow: "0 8px 20px rgba(245,158,11,0.28)" }}>
            <AlertTriangle size={22} color="white" />
          </div>
          <div>
            <p className="kpi-title">Skipped Messages</p>
            <h2 className="kpi-value" style={{ margin: "0.2rem 0 0 0" }}>
              {dispatchSummary.skipped}
            </h2>
            <span style={{ fontSize: "0.78rem", color: "#92400e" }}>
              Due to provider/country rules
            </span>
          </div>
        </div>

      </div>

      {/* Channel Health & Root Cause Diagnostics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
        
        {/* Panel 1: Channel Deliverability & Engagement */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--dark)", margin: 0 }}>
                Channel Deliverability & Health
              </h3>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "0.2rem 0 0 0" }}>
                Success benchmarks and user interaction per channel ({dateRange})
              </p>
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", backgroundColor: "#f1f5f9", padding: "0.2rem 0.6rem", borderRadius: "9999px", fontWeight: 600 }}>
              3 Active Channels
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            {channelBreakdown.map((ch) => {
              const IconComponent = ch.icon;
              return (
                <div key={ch.name} style={{ backgroundColor: "#f8fafc", border: "1px solid #edf2f7", borderRadius: "14px", padding: "1rem 1.15rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: ch.bgLight, border: `1px solid ${ch.borderColor}`, color: ch.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <IconComponent size={16} />
                      </div>
                      <div>
                        <span style={{ fontSize: "0.95rem", fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--dark)", display: "block", lineHeight: 1.2 }}>
                          {ch.name}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {ch.attempted} sent • {ch.delivered} delivered {ch.failed > 0 ? `• ${ch.failed} failed` : ""}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "1.2rem", fontWeight: 800, fontFamily: "var(--font-display)", color: ch.rate >= 90 ? "#15803d" : ch.rate >= 75 ? "#b45309" : "#b91c1c" }}>
                        {ch.attempted > 0 ? `${ch.rate}%` : "—"}
                      </span>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-subtle)", display: "block", textTransform: "uppercase", fontWeight: 600 }}>
                        Deliverability
                      </span>
                    </div>
                  </div>

                  {/* Deliverability Progress Bar */}
                  <div style={{ width: "100%", height: "7px", backgroundColor: "#e2e8f0", borderRadius: "9999px", overflow: "hidden", marginBottom: "0.5rem" }}>
                    <div 
                      style={{ 
                        width: `${ch.rate}%`, 
                        height: "100%", 
                        backgroundColor: ch.rate >= 90 ? "#10b981" : ch.rate >= 75 ? "#f59e0b" : "#ef4444",
                        borderRadius: "9999px",
                        transition: "width 0.4s ease"
                      }}
                    />
                  </div>

                  {/* Micro stat pill */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    <span>User Open/View Rate: <strong style={{ color: "var(--dark)" }}>{ch.viewRate}%</strong></span>
                    {ch.skipped > 0 && <span style={{ color: "#92400e" }}>{ch.skipped} skipped</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel 2: Failure & Exception Diagnostics */}
        <div className="card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--dark)", margin: 0 }}>
                Failure & Rule Diagnostics
              </h3>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "0.2rem 0 0 0" }}>
                Root cause reasons for failed or skipped deliveries ({dateRange})
              </p>
            </div>
            <span style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              padding: "0.2rem 0.6rem",
              borderRadius: "9999px",
              backgroundColor: diagnosticsList.length === 0 ? "#dcfce7" : "#fee2e2",
              color: diagnosticsList.length === 0 ? "#15803d" : "#991b1b"
            }}>
              {diagnosticsList.length === 0 ? "Healthy" : `${diagnosticsList.reduce((acc, d) => acc + d.count, 0)} Exceptions`}
            </span>
          </div>

          {diagnosticsList.length === 0 ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2.5rem 1rem", textAlign: "center" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "16px", backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.75rem" }}>
                <ShieldCheck size={26} />
              </div>
              <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--dark)", margin: "0 0 0.25rem 0" }}>
                Zero Delivery Errors
              </h4>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0, maxWidth: "320px" }}>
                All notifications sent in this interval were successfully accepted and delivered by downstream carriers.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", flex: 1 }}>
              {diagnosticsList.map((item, idx) => {
                const isFailed = item.event === "Failed";
                return (
                  <div 
                    key={idx}
                    style={{
                      backgroundColor: isFailed ? "#fff5f5" : "#fffbeb",
                      border: `1px solid ${isFailed ? "#fed7d7" : "#fef3c7"}`,
                      borderRadius: "12px",
                      padding: "0.85rem 1rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "0.75rem"
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.25rem" }}>
                        <span style={{
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          padding: "0.15rem 0.5rem",
                          borderRadius: "9999px",
                          backgroundColor: isFailed ? "#fee2e2" : "#fef3c7",
                          color: isFailed ? "#991b1b" : "#92400e"
                        }}>
                          {item.event}
                        </span>
                        <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)" }}>
                          Channel: {item.channel}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600, color: "var(--dark)", lineHeight: 1.35, wordBreak: "break-word" }}>
                        {item.reason}
                      </p>
                      {item.sampleRecipient && (
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginTop: "0.25rem" }}>
                          Example target: <code style={{ fontFamily: "var(--font-mono)", color: "var(--text-main)" }}>{item.sampleRecipient}</code>
                        </span>
                      )}
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <span style={{ fontSize: "1.1rem", fontWeight: 800, color: isFailed ? "var(--danger)" : "#b45309", fontFamily: "var(--font-display)" }}>
                        {item.count}
                      </span>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-subtle)", display: "block", textTransform: "uppercase", fontWeight: 600 }}>
                        {item.count === 1 ? "Event" : "Events"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Breakdown Section: By Notification & By Trigger */}
      <div className="card" style={{ padding: "1.5rem", marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => setBreakdownTab("notifications")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.55rem 1.1rem",
                borderRadius: "9999px",
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "0.85rem",
                fontFamily: "var(--font-display)",
                backgroundColor: breakdownTab === "notifications" ? "var(--navy-gradient)" : "transparent",
                backgroundImage: breakdownTab === "notifications" ? "var(--navy-gradient)" : "none",
                color: breakdownTab === "notifications" ? "white" : "var(--text-muted)",
                boxShadow: breakdownTab === "notifications" ? "0 3px 10px rgba(24,30,37,0.28)" : "none",
                transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)"
              }}
            >
              <Bell size={16} /> Breakdown by Notification
            </button>
            <button
              onClick={() => setBreakdownTab("triggers")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.55rem 1.1rem",
                borderRadius: "9999px",
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "0.85rem",
                fontFamily: "var(--font-display)",
                backgroundColor: breakdownTab === "triggers" ? "var(--navy-gradient)" : "transparent",
                backgroundImage: breakdownTab === "triggers" ? "var(--navy-gradient)" : "none",
                color: breakdownTab === "triggers" ? "white" : "var(--text-muted)",
                boxShadow: breakdownTab === "triggers" ? "0 3px 10px rgba(24,30,37,0.28)" : "none",
                transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)"
              }}
            >
              <Zap size={16} /> Breakdown by Trigger
            </button>
          </div>
        </div>

        {/* Tab 1: Breakdown by Notification */}
        {breakdownTab === "notifications" && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "850px" }}>
              <thead className="thead-dark">
                <tr style={{ textAlign: "left" }}>
                  <th style={{ padding: "0.9rem 1rem" }}>Notification</th>
                  <th style={{ padding: "0.9rem 1rem" }}>Channel</th>
                  <th style={{ padding: "0.9rem 1rem" }}>Sent</th>
                  <th style={{ padding: "0.9rem 1rem" }}>Failed</th>
                  <th style={{ padding: "0.9rem 1rem" }}>Fail Rate</th>
                  <th style={{ padding: "0.9rem 1rem" }}>Last Sent</th>
                  <th style={{ padding: "0.9rem 1rem", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {notificationBreakdown.map((item, i) => (
                  <tr key={item.id} style={{ borderBottom: i !== notificationBreakdown.length - 1 ? "1px solid var(--border-color)" : "none" }}>
                    <td style={{ padding: "1rem" }}>
                      <span style={{ fontWeight: "600", color: "var(--dark)" }}>{item.name}</span>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>ID: #{item.id}</div>
                    </td>
                    <td style={{ padding: "1rem", color: "var(--text-main)", fontSize: "0.9rem" }}>{item.channel}</td>
                    <td style={{ padding: "1rem", fontWeight: "600", color: "var(--dark)" }}>{item.sent}</td>
                    <td style={{ padding: "1rem", fontWeight: "600", color: item.failed > 0 ? "var(--danger)" : "var(--text-muted)" }}>{item.failed}</td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{ 
                        padding: "0.3rem 0.85rem", 
                        borderRadius: "9999px", 
                        fontSize: "0.78rem", 
                        fontWeight: "600",
                        fontFamily: "var(--font-display)",
                        backgroundColor: item.failRate > 10 ? "#fee2e2" : "#ecfdf5",
                        color: item.failRate > 10 ? "#991b1b" : "#166534"
                      }}>
                        {item.failRate}%
                      </span>
                    </td>
                    <td style={{ padding: "1rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>{item.lastSent}</td>
                    <td style={{ padding: "1rem", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                        <button
                          className="btn btn-outline"
                          style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem", height: "auto" }}
                          onClick={() => {
                            setNotificationFilter(String(item.id));
                            document.getElementById("full-logs-section")?.scrollIntoView({ behavior: "smooth" });
                          }}
                        >
                          View Logs
                        </button>
                        <Link 
                          href={`/notifications/add?id=${item.id}`}
                          className="btn btn-outline"
                          style={{ padding: "0.35rem 0.5rem", height: "auto" }}
                          title="Edit Notification"
                        >
                          <Edit3 size={15} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Breakdown by Trigger */}
        {breakdownTab === "triggers" && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "850px" }}>
              <thead className="thead-dark">
                <tr style={{ textAlign: "left" }}>
                  <th style={{ padding: "0.9rem 1rem" }}>Trigger Name</th>
                  <th style={{ padding: "0.9rem 1rem" }}>Event Type</th>
                  <th style={{ padding: "0.9rem 1rem" }}>Attached Notifications</th>
                  <th style={{ padding: "0.9rem 1rem" }}>Total Sent</th>
                  <th style={{ padding: "0.9rem 1rem" }}>Failed</th>
                  <th style={{ padding: "0.9rem 1rem" }}>Failure Rate</th>
                </tr>
              </thead>
              <tbody>
                {triggerBreakdown.map((trig, i) => (
                  <tr key={trig.id} style={{ borderBottom: i !== triggerBreakdown.length - 1 ? "1px solid var(--border-color)" : "none" }}>
                    <td style={{ padding: "1rem", fontWeight: "600", color: "var(--dark)" }}>{trig.name}</td>
                    <td style={{ padding: "1rem", color: "var(--text-main)", fontSize: "0.9rem" }}>{trig.eventType}</td>
                    <td style={{ padding: "1rem", color: "var(--text-main)", fontSize: "0.9rem" }}>{trig.notificationsCount}</td>
                    <td style={{ padding: "1rem", fontWeight: "600", color: "var(--dark)" }}>{trig.sent}</td>
                    <td style={{ padding: "1rem", fontWeight: "600", color: trig.failed > 0 ? "var(--danger)" : "var(--text-muted)" }}>{trig.failed}</td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{ 
                        padding: "0.3rem 0.85rem", 
                        borderRadius: "9999px", 
                        fontSize: "0.78rem", 
                        fontWeight: "600",
                        fontFamily: "var(--font-display)",
                        backgroundColor: trig.failRate > 10 ? "#fee2e2" : "#ecfdf5",
                        color: trig.failRate > 10 ? "#991b1b" : "#166534"
                      }}>
                        {trig.failRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Full Log Table */}
      <div id="full-logs-section" className="card" style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: "700", fontFamily: "var(--font-display)", color: "var(--dark)", margin: 0 }}>
              Full Log Activity Stream
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "0.2rem 0 0 0" }}>
              Showing {filteredLogs.length} matching events
            </p>
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
            No log events match the currently active filters.
          </div>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "950px" }}>
                <thead className="thead-dark">
                  <tr style={{ textAlign: "left" }}>
                    <th style={{ padding: "0.9rem 1.2rem" }}>Log ID</th>
                    <th style={{ padding: "0.9rem 1.2rem" }}>Notification ID</th>
                    <th style={{ padding: "0.9rem 1.2rem" }}>Template ID</th>
                    <th style={{ padding: "0.9rem 1.2rem" }}>Sent To</th>
                    <th style={{ padding: "0.9rem 1.2rem" }}>Service</th>
                    <th style={{ padding: "0.9rem 1.2rem" }}>Event</th>
                    <th style={{ padding: "0.9rem 1.2rem" }}>Timestamp</th>
                    <th style={{ padding: "0.9rem 1.2rem", textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLogs.map((log, i) => (
                    <tr 
                      key={log.id} 
                      style={{ borderBottom: i !== paginatedLogs.length - 1 ? "1px solid var(--border-color)" : "none", transition: "background-color 0.2s" }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      <td style={{ padding: "0.9rem 1.2rem", fontWeight: "600", color: "var(--dark)", fontFamily: "var(--font-mono)" }}>#{log.id}</td>
                      <td style={{ padding: "0.9rem 1.2rem", color: "var(--primary)", fontWeight: "500", fontFamily: "var(--font-mono)" }}>#{log.notificationId}</td>
                      <td style={{ padding: "0.9rem 1.2rem", color: "var(--dark)", fontWeight: "500" }}>{log.templateId || "—"}</td>
                      <td style={{ padding: "0.9rem 1.2rem", color: "var(--dark)" }}>{log.sentTo}</td>
                      <td style={{ padding: "0.9rem 1.2rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>{log.serviceType}</td>
                      <td style={{ padding: "0.9rem 1.2rem" }}>
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
                      <td style={{ padding: "0.9rem 1.2rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>{log.timestamp}</td>
                      <td style={{ padding: "0.9rem 1.2rem", textAlign: "right" }}>
                        <button
                          className="btn btn-outline"
                          style={{ padding: "0.3rem 0.65rem", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  Page {currentPage} of {totalPages}
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    className="btn btn-outline"
                    style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  >
                    Previous
                  </button>
                  <button
                    className="btn btn-outline"
                    style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}

      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <LogDetailModal 
          log={selectedLog} 
          onClose={() => setSelectedLog(null)} 
        />
      )}

    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div style={{ padding: "2rem" }}>Loading analytics dashboard...</div>}>
      <AnalyticsContent />
    </Suspense>
  );
}
