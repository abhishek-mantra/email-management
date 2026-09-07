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
  Bell
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

  // Summary Metrics Computation
  // Note: Mock data events are Sent, Received, Viewed, Failed, Skipped.
  // "Received" is treated as the delivery-confirmation event, and Viewed implies successful receipt.
  // Delivered / Received Rate = ((Received + Viewed) / Sent) * 100%
  const totalSent = useMemo(() => {
    return filteredLogs.filter(l => l.event === "Sent").length;
  }, [filteredLogs]);

  const deliveredCount = useMemo(() => {
    return filteredLogs.filter(l => l.event === "Received" || l.event === "Viewed").length;
  }, [filteredLogs]);

  const failedCount = useMemo(() => {
    return filteredLogs.filter(l => l.event === "Failed").length;
  }, [filteredLogs]);

  const skippedLogs = useMemo(() => {
    return filteredLogs.filter(l => l.event === "Skipped");
  }, [filteredLogs]);

  const deliveryRate = totalSent > 0 ? Math.round((deliveredCount / totalSent) * 100) : 0;
  const failureRate = totalSent > 0 ? Math.round((failedCount / totalSent) * 100) : 0;

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

  // Chart Data: Group events by day over the spread
  const chartData = useMemo(() => {
    const dayMap = {};

    filteredLogs.forEach(log => {
      const day = (log.timestamp || "").split(" ")[0];
      if (!day) return;
      if (!dayMap[day]) {
        dayMap[day] = { date: day, sent: 0, failed: 0, received: 0 };
      }
      if (log.event === "Sent") dayMap[day].sent += 1;
      if (log.event === "Failed") dayMap[day].failed += 1;
      if (log.event === "Received" || log.event === "Viewed") dayMap[day].received += 1;
    });

    return Object.values(dayMap).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredLogs]);

  // Breakdown by Notification
  const notificationBreakdown = useMemo(() => {
    return notifications.map(notif => {
      const notifLogs = logs.filter(l => l.notificationId === notif.id);
      const sent = notifLogs.filter(l => l.event === "Sent").length;
      const failed = notifLogs.filter(l => l.event === "Failed").length;
      const failRate = sent > 0 ? Math.round((failed / sent) * 100) : 0;
      
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
  }, [notifications, logs]);

  // Breakdown by Trigger
  const triggerBreakdown = useMemo(() => {
    return triggers.map(trig => {
      // Find all notifications matching this trigger
      const matchingNotifs = notifications.filter(n => n.trigger === trig.name);
      const matchingNotifIds = matchingNotifs.map(n => n.id);
      
      const trigLogs = logs.filter(l => matchingNotifIds.includes(l.notificationId));
      const sent = trigLogs.filter(l => l.event === "Sent").length;
      const failed = trigLogs.filter(l => l.event === "Failed").length;
      const failRate = sent > 0 ? Math.round((failed / sent) * 100) : 0;

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
  }, [triggers, notifications, logs]);

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
        
        {/* Total Sent */}
        <div className="card" style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <div className="kpi-icon-chip" style={{ background: "linear-gradient(135deg, #1456f0, #0284c7)", boxShadow: "0 8px 20px rgba(20,86,240,0.28)" }}>
            <Send size={22} color="white" />
          </div>
          <div>
            <p className="kpi-title">Total Sent</p>
            <h2 className="kpi-value" style={{ margin: "0.2rem 0 0 0" }}>
              {totalSent}
            </h2>
          </div>
        </div>

        {/* Delivered Rate */}
        <div className="card" style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <div className="kpi-icon-chip" style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 8px 20px rgba(16,185,129,0.28)" }}>
            <CheckCircle2 size={22} color="white" />
          </div>
          <div>
            <p className="kpi-title">Delivered / Received</p>
            <h2 className="kpi-value" style={{ margin: "0.2rem 0 0 0" }}>
              {totalSent > 0 ? `${deliveryRate}%` : "—"}
            </h2>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              {deliveredCount} confirmed delivered
            </span>
          </div>
        </div>

        {/* Failed Rate */}
        <div className="card" style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <div className="kpi-icon-chip" style={{ background: "linear-gradient(135deg, #ef4444, #b91c1c)", boxShadow: "0 8px 20px rgba(239,68,68,0.28)" }}>
            <AlertOctagon size={22} color="white" />
          </div>
          <div>
            <p className="kpi-title">Failed Rate</p>
            <h2 className="kpi-value" style={{ margin: "0.2rem 0 0 0" }}>
              {totalSent > 0 ? `${failureRate}%` : "0%"}
            </h2>
            <span style={{ fontSize: "0.78rem", color: "var(--danger)" }}>
              {failedCount} message failures
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
              {skippedLogs.length}
            </h2>
            <span style={{ fontSize: "0.78rem", color: "#92400e" }}>
              Due to provider/country rules
            </span>
          </div>
        </div>

      </div>

      {/* Trend Chart (Inline SVG) */}
      <div className="card" style={{ padding: "1.5rem", marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
          <div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: "700", fontFamily: "var(--font-display)", color: "var(--dark)", margin: 0 }}>
              Delivery Activity Over Time
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "0.2rem 0 0 0" }}>
              Daily sent volume vs failures over selected interval ({dateRange})
            </p>
          </div>

          <div style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", color: "var(--dark)", fontWeight: "500" }}>
              <span style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: "#1456f0", display: "inline-block" }}></span>
              Sent
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", color: "var(--dark)", fontWeight: "500" }}>
              <span style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: "#ef4444", display: "inline-block" }}></span>
              Failed
            </div>
          </div>
        </div>

        {chartData.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
            No log events recorded within this time window.
          </div>
        ) : (
          <div style={{ width: "100%", overflowX: "auto" }}>
            {(() => {
              const svgWidth = Math.max(700, chartData.length * 50);
              const svgHeight = 220;
              const padding = { top: 20, right: 20, bottom: 40, left: 40 };
              const plotWidth = svgWidth - padding.left - padding.right;
              const plotHeight = svgHeight - padding.top - padding.bottom;

              const maxCount = Math.max(
                4,
                ...chartData.map(d => Math.max(d.sent, d.failed))
              );

              const barGroupWidth = plotWidth / chartData.length;
              const barWidth = Math.min(14, barGroupWidth * 0.35);

              return (
                <svg width={svgWidth} height={svgHeight} style={{ overflow: "visible" }}>
                  {/* Background grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                    const y = padding.top + plotHeight * (1 - ratio);
                    const labelVal = Math.round(maxCount * ratio);
                    return (
                      <g key={i}>
                        <line 
                          x1={padding.left} 
                          y1={y} 
                          x2={svgWidth - padding.right} 
                          y2={y} 
                          stroke="#e2e8f0" 
                          strokeDasharray={ratio === 0 ? "none" : "3,3"} 
                        />
                        <text 
                          x={padding.left - 8} 
                          y={y + 4} 
                          fontSize="10" 
                          fill="#94a3b8" 
                          textAnchor="end"
                        >
                          {labelVal}
                        </text>
                      </g>
                    );
                  })}

                  {/* Bars & Labels */}
                  {chartData.map((d, index) => {
                    const groupX = padding.left + index * barGroupWidth;
                    const centerX = groupX + barGroupWidth / 2;

                    const sentHeight = (d.sent / maxCount) * plotHeight;
                    const sentY = padding.top + plotHeight - sentHeight;

                    const failedHeight = (d.failed / maxCount) * plotHeight;
                    const failedY = padding.top + plotHeight - failedHeight;

                    // Formatted short date (e.g. Aug 18)
                    const dateParts = d.date.split("-");
                    const shortDate = `${dateParts[1]}/${dateParts[2]}`;

                    return (
                      <g key={d.date}>
                        {/* Sent Bar */}
                        <rect
                          x={centerX - barWidth - 2}
                          y={sentY}
                          width={barWidth}
                          height={sentHeight}
                          fill="#1456f0"
                          rx="3"
                        >
                          <title>{`${d.date}: ${d.sent} Sent`}</title>
                        </rect>

                        {/* Failed Bar */}
                        <rect
                          x={centerX + 2}
                          y={failedY}
                          width={barWidth}
                          height={failedHeight}
                          fill="#ef4444"
                          rx="3"
                        >
                          <title>{`${d.date}: ${d.failed} Failed`}</title>
                        </rect>

                        {/* X-axis Date Label */}
                        <text
                          x={centerX}
                          y={svgHeight - 15}
                          fontSize="10"
                          fill="#64748b"
                          textAnchor="middle"
                        >
                          {shortDate}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              );
            })()}
          </div>
        )}
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
