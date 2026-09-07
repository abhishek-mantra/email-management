"use client";

import { X, CheckCircle, AlertCircle, AlertTriangle, Eye, Send } from "lucide-react";

export default function LogDetailModal({ log, onClose }) {
  if (!log) return null;

  const getStatusBadgeStyle = (event) => {
    switch (event) {
      case "Failed":
        return { bg: "#fee2e2", text: "#991b1b", border: "#fecaca" };
      case "Received":
        return { bg: "#dcfce7", text: "#166534", border: "#bbf7d0" };
      case "Viewed":
        return { bg: "#f3e8ff", text: "#6b21a8", border: "#e9d5ff" };
      case "Skipped":
        return { bg: "#fef3c7", text: "#92400e", border: "#fde68a" };
      case "Sent":
      default:
        return { bg: "#e0f2fe", text: "#075985", border: "#bae6fd" };
    }
  };

  const badgeStyle = getStatusBadgeStyle(log.event);

  return (
    <div 
      style={{ 
        position: "fixed", 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        backgroundColor: "rgba(15, 23, 42, 0.6)", 
        backdropFilter: "blur(2px)",
        zIndex: 1000, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        padding: "1rem"
      }}
      onClick={onClose}
    >
      <div 
        className="card" 
        style={{ 
          width: "100%", 
          maxWidth: "520px", 
          display: "flex", 
          flexDirection: "column", 
          padding: 0, 
          overflow: "hidden", 
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f8fafc" }}>
          <h3 style={{ fontSize: "1.15rem", fontWeight: "600", color: "var(--dark)", margin: 0 }}>
            Delivery Log: #{log.id}
          </h3>
          <button 
            className="btn btn-outline" 
            style={{ padding: "0.35rem", border: "none", color: "var(--text-muted)", borderRadius: "6px" }} 
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: "1.75rem 1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          
          <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "1rem", alignItems: "center" }}>
            <span style={{ fontWeight: "600", color: "var(--text-muted)", fontSize: "0.9rem" }}>Event Status:</span>
            <span style={{ 
              padding: "0.3rem 0.8rem", 
              borderRadius: "6px", 
              fontSize: "0.85rem", 
              fontWeight: "600",
              width: "fit-content",
              backgroundColor: badgeStyle.bg,
              color: badgeStyle.text,
              border: `1px solid ${badgeStyle.border}`
            }}>
              {log.event}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "1rem", alignItems: "center" }}>
            <span style={{ fontWeight: "600", color: "var(--text-muted)", fontSize: "0.9rem" }}>Service Type:</span>
            <div style={{ color: "var(--dark)", fontWeight: "500", fontSize: "0.95rem" }}>
              {log.serviceType || "—"}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "1rem", alignItems: "center" }}>
            <span style={{ fontWeight: "600", color: "var(--text-muted)", fontSize: "0.9rem" }}>Sent To:</span>
            <div style={{ color: "var(--dark)", fontWeight: "500", fontSize: "0.95rem", wordBreak: "break-all" }}>
              {log.sentTo || "—"}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "1rem", alignItems: "center" }}>
            <span style={{ fontWeight: "600", color: "var(--text-muted)", fontSize: "0.9rem" }}>Notification ID:</span>
            <div style={{ color: "var(--primary)", fontWeight: "600", fontSize: "0.95rem" }}>
              #{log.notificationId}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "1rem", alignItems: "center" }}>
            <span style={{ fontWeight: "600", color: "var(--text-muted)", fontSize: "0.9rem" }}>Template ID:</span>
            <div style={{ color: "var(--dark)", fontWeight: "500", fontSize: "0.95rem" }}>
              {log.templateId || "—"}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "1rem", alignItems: "flex-start" }}>
            <span style={{ fontWeight: "600", color: "var(--text-muted)", fontSize: "0.9rem" }}>Timestamp:</span>
            <div style={{ color: "var(--dark)", fontSize: "0.95rem" }}>
              <strong>{log.timestamp}</strong>
            </div>
          </div>

          {(log.event === "Failed" || log.event === "Skipped") && (log.error || log.reason) && (
            <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "1rem", alignItems: "flex-start" }}>
              <span style={{ fontWeight: "600", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                {log.event === "Skipped" ? "Reason:" : "Error Details:"}
              </span>
              <div style={{ 
                color: log.event === "Skipped" ? "#92400e" : "var(--danger)", 
                backgroundColor: log.event === "Skipped" ? "#fef3c7" : "#fee2e2", 
                padding: "0.75rem", 
                borderRadius: "6px", 
                fontSize: "0.9rem", 
                border: log.event === "Skipped" ? "1px solid #fde68a" : "1px solid #fecaca",
                lineHeight: "1.4"
              }}>
                {log.error || log.reason}
              </div>
            </div>
          )}

        </div>

        <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid var(--border-color)", backgroundColor: "#f8fafc", textAlign: "right" }}>
          <button className="btn btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
