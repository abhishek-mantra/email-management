"use client";

import { useState, useRef, useEffect } from "react";
import { useNotifications } from "@/context/NotificationContext";
import { Plus, LayoutTemplate, X, Zap, Search, Eye, ShoppingCart, UserCheck, Activity, CheckCircle2, Webhook, Copy, Check, RefreshCw, EyeOff, ChevronDown, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import CustomSelect from "@/components/CustomSelect";

const WEBHOOK_PAYLOAD_SAMPLE = `{
  "event": "appointment.booked",
  "client_id": "USR-001",
  "session_id": "SES-821",
  "provider_name": "Dr. Amara Singh"
}`;

export default function TriggerPage() {
  const { triggers, notifications, logs, addTrigger, updateTrigger, selectedCompany } = useNotifications();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreatingTrigger, setIsCreatingTrigger] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingTriggerId, setEditingTriggerId] = useState(null);

  // Trigger Creation State
  const [selectedTriggerType, setSelectedTriggerType] = useState(null);
  const [triggerScope, setTriggerScope] = useState("all");
  const [selectedApps, setSelectedApps] = useState([]);
  const [isAppDropdownOpen, setIsAppDropdownOpen] = useState(false);
  const [triggerName, setTriggerName] = useState("Untitled Trigger");
  const [triggerFilterField, setTriggerFilterField] = useState("Platform Name");
  const [triggerFilterOperator, setTriggerFilterOperator] = useState("equals");
  const [triggerDescription, setTriggerDescription] = useState("");
  // Webhook (inbound) trigger state
  const [webhookEndpoint, setWebhookEndpoint] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [isWebhookSecretRevealed, setIsWebhookSecretRevealed] = useState(false);
  const [isCopiedEndpoint, setIsCopiedEndpoint] = useState(false);
  const [isCopiedSecret, setIsCopiedSecret] = useState(false);
  const dropdownRef = useRef(null);
  const triggerNameRef = useRef(null);

  const isWebhook = selectedTriggerType === "Webhook";

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsAppDropdownOpen(false);
      }
    }
    
    if (isAppDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAppDropdownOpen]);

  const openCreateDrawer = () => {
    const slug = (selectedCompany || "mantra").toLowerCase().replace(/[^a-z0-9]/g, "");
    setEditingTriggerId(null);
    setTriggerFilterField("Platform Name");
    setTriggerFilterOperator("equals");
    setTriggerDescription("");
    setWebhookEndpoint(`https://inbound.${slug}.com/webhooks/trg_${Math.random().toString(36).slice(2, 10)}`);
    setWebhookSecret(`whsk_${Math.random().toString(36).slice(2, 14)}${Math.random().toString(36).slice(2, 6)}`);
    setIsWebhookSecretRevealed(false);
    setIsCopiedEndpoint(false);
    setIsCopiedSecret(false);
    setIsCreatingTrigger(true);
    setSelectedTriggerType(null);
    setTriggerScope("all");
    setSelectedApps([]);
    setTriggerName("Untitled Trigger");
  };

  const openEditDrawer = (trigger) => {
    const isWebhookNow = trigger.eventType === "Webhook";
    setEditingTriggerId(trigger.id);
    setTriggerName(trigger.name || "Untitled Trigger");
    setTriggerDescription(trigger.description || "");
    setSelectedTriggerType(trigger.eventType);
    setIsWebhookSecretRevealed(false);
    setIsCopiedEndpoint(false);
    setIsCopiedSecret(false);
    if (isWebhookNow) {
      setWebhookEndpoint(trigger.endpoint || "");
      setWebhookSecret(trigger.secret || "");
      setTriggerScope("all");
      setSelectedApps([]);
      setTriggerFilterField("Platform Name");
      setTriggerFilterOperator("equals");
    } else {
      setWebhookEndpoint("");
      setWebhookSecret("");
      if (trigger.filterField === "All Platforms") {
        setTriggerScope("all");
        setSelectedApps([]);
      } else {
        setTriggerScope("some");
        setTriggerFilterField(trigger.filterField || "Platform Name");
        const parts = (trigger.filterCondition || "").split(" ");
        const operator = ["equals", "contains", "not equals"].includes(parts[0]) ? parts[0] : "equals";
        setTriggerFilterOperator(operator);
        setSelectedApps((trigger.filterCondition || "").replace(operator + " ", "").split(", ").filter(Boolean));
      }
    }
    setIsCreatingTrigger(true);
    setIsDrawerOpen(false);
  };

  const resetTriggerDraft = () => {
    setEditingTriggerId(null);
    setTriggerFilterField("Platform Name");
    setTriggerFilterOperator("equals");
    setTriggerDescription("");
    setSelectedTriggerType(null);
    setTriggerScope("all");
    setSelectedApps([]);
    setTriggerName("Untitled Trigger");
    setIsWebhookSecretRevealed(false);
    setIsCopiedEndpoint(false);
    setIsCopiedSecret(false);
  };

  const handleCopyEndpoint = () => {
    navigator.clipboard?.writeText(webhookEndpoint).then(() => {
      setIsCopiedEndpoint(true);
      setTimeout(() => setIsCopiedEndpoint(false), 1500);
    });
  };

  const handleCopySecret = () => {
    navigator.clipboard?.writeText(webhookSecret).then(() => {
      setIsCopiedSecret(true);
      setTimeout(() => setIsCopiedSecret(false), 1500);
    });
  };

  const isSaveActive = selectedTriggerType !== null &&
    (isWebhook
      ? webhookEndpoint.trim() !== "" && webhookSecret.trim() !== ""
      : (triggerScope === "all" || (triggerScope === "some" && selectedApps.length > 0))) &&
    triggerName.trim() !== "";

  // Dynamic tenant-aware KPIs
  const totalTriggers = triggers.length;
  const activeInPipelines = triggers.filter(t => 
    notifications.some(n => (n.trigger || "").trim().toLowerCase() === (t.name || "").trim().toLowerCase())
  ).length;
  const standbyCount = Math.max(0, totalTriggers - activeInPipelines);
  const totalPipelinesLinked = notifications.filter(n => n.trigger).length;

  const filteredTriggers = triggers.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.eventType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.filterField && t.filterField.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (t.filterCondition && t.filterCondition.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "800", fontFamily: "var(--font-display)", color: "var(--dark)", margin: 0, letterSpacing: "-0.025em" }}>Triggers</h1>
          <p style={{ color: "var(--text-muted)", margin: "0.25rem 0 0 0", fontSize: "0.875rem" }}>Event listeners, telemetry triggers, and dispatch hooks for {selectedCompany}</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={openCreateDrawer}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem" }}
        >
          <Plus size={16} /> Add New Trigger
        </button>
      </div>

      {/* Dynamic KPI Stat Capsules */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", marginBottom: "1.75rem" }}>
        <div style={{ backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)", borderRadius: "1.25rem", border: "1px solid rgba(255,255,255,0.8)", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-subtle)", fontFamily: "var(--font-display)", margin: 0 }}>TOTAL TRIGGERS</p>
            <h3 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--dark)", fontFamily: "var(--font-display)", margin: "0.25rem 0 0 0", letterSpacing: "-0.02em" }}>{totalTriggers}</h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "0.25rem 0 0 0" }}>Configured event rules</p>
          </div>
          <div style={{ width: "48px", height: "48px", borderRadius: "16px", backgroundColor: "rgba(20,86,240,0.08)", border: "1px solid rgba(20,86,240,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
            <Zap size={20} />
          </div>
        </div>

        <div style={{ backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)", borderRadius: "1.25rem", border: "1px solid rgba(255,255,255,0.8)", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-subtle)", fontFamily: "var(--font-display)", margin: 0 }}>ACTIVE IN PIPELINES</p>
            <h3 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--dark)", fontFamily: "var(--font-display)", margin: "0.25rem 0 0 0", letterSpacing: "-0.02em" }}>{activeInPipelines}</h3>
            <p style={{ fontSize: "12px", color: "#16a34a", margin: "0.25rem 0 0 0", fontWeight: 600 }}>Wired to notifications</p>
          </div>
          <div style={{ width: "48px", height: "48px", borderRadius: "16px", backgroundColor: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#16a34a" }}>
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div style={{ backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)", borderRadius: "1.25rem", border: "1px solid rgba(255,255,255,0.8)", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-subtle)", fontFamily: "var(--font-display)", margin: 0 }}>STANDBY TRIGGERS</p>
            <h3 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--dark)", fontFamily: "var(--font-display)", margin: "0.25rem 0 0 0", letterSpacing: "-0.02em" }}>{standbyCount}</h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "0.25rem 0 0 0" }}>Listening, no pipeline yet</p>
          </div>
          <div style={{ width: "48px", height: "48px", borderRadius: "16px", backgroundColor: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#7c3aed" }}>
            <Activity size={20} />
          </div>
        </div>

        <div style={{ backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)", borderRadius: "1.25rem", border: "1px solid rgba(255,255,255,0.8)", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-subtle)", fontFamily: "var(--font-display)", margin: 0 }}>ATTACHED PIPELINES</p>
            <h3 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--dark)", fontFamily: "var(--font-display)", margin: "0.25rem 0 0 0", letterSpacing: "-0.02em" }}>{totalPipelinesLinked}</h3>
            <p style={{ fontSize: "12px", color: "var(--brand-cyan)", margin: "0.25rem 0 0 0", fontWeight: 600 }}>Active notification routes</p>
          </div>
          <div style={{ width: "48px", height: "48px", borderRadius: "16px", backgroundColor: "rgba(2,132,199,0.08)", border: "1px solid rgba(2,132,199,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#0284c7" }}>
            <UserCheck size={20} />
          </div>
        </div>
      </div>

      {/* Main Table Card (Design_1.md Section 4.3) */}
      <div className="card" style={{ padding: "0", overflow: "hidden", borderRadius: "20px", marginBottom: "2rem" }}>
        {/* Search Toolbar */}
        <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "rgba(255,255,255,0.6)" }}>
          <div style={{ position: "relative", width: "320px" }}>
            <Search size={15} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input 
              type="text"
              placeholder="Search triggers by name, event, filter..."
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
          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
            Showing {filteredTriggers.length} of {totalTriggers} triggers
          </span>
        </div>

        {filteredTriggers.length === 0 ? (
          <div style={{ padding: "4rem 1rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
            <LayoutTemplate size={48} style={{ color: "var(--text-muted)", opacity: 0.5, marginBottom: "0.5rem" }} />
            <h3 style={{ color: "var(--dark)", fontSize: "1.2rem", fontWeight: "600", fontFamily: "var(--font-display)" }}>
              {searchQuery ? "No triggers match your search" : "No triggers configured"}
            </h3>
            <p style={{ color: "var(--text-muted)", maxWidth: "400px", fontSize: "0.875rem" }}>
              {searchQuery ? `Try clearing your search query "${searchQuery}"` : "This container has no triggers. Create one to define when your notifications should be sent."}
            </p>
            {!searchQuery && (
              <button className="btn btn-primary" onClick={openCreateDrawer} style={{ marginTop: "0.5rem" }}>
                Create New Trigger
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
              <thead className="thead-dark">
                <tr style={{ textAlign: "left" }}>
                  <th style={{ padding: "1rem 1.5rem", fontWeight: "600" }}>Name</th>
                  <th style={{ padding: "1rem 1.5rem", fontWeight: "600" }}>Event Type</th>
                  <th style={{ padding: "1rem 1.5rem", fontWeight: "600" }}>Filter Rule</th>
                  <th style={{ padding: "1rem 1.5rem", fontWeight: "600" }}>Connected Pipelines</th>
                  <th style={{ padding: "1rem 1.5rem", fontWeight: "600" }}>Last Edited</th>
                </tr>
              </thead>
              <tbody>
                {filteredTriggers.map(trigger => {
                  const linkedPipelines = notifications.filter(n => (n.trigger || "").trim().toLowerCase() === (trigger.name || "").trim().toLowerCase());

                  return (
                    <tr key={trigger.id} className="table-row">
                      <td style={{ padding: "1rem 1.5rem", color: "var(--primary)", cursor: "pointer", fontWeight: "600", fontFamily: "var(--font-display)" }} onClick={() => openEditDrawer(trigger)} title="Edit trigger">
                        {trigger.name}
                        {trigger.description && (
                          <div style={{ fontSize: "0.78rem", fontWeight: 500, color: "var(--text-muted)", fontFamily: "var(--font-sans)", marginTop: "0.15rem", maxWidth: "240px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{trigger.description}</div>
                        )}
                      </td>
                      <td style={{ padding: "1rem 1.5rem", color: "var(--dark)", fontWeight: 500 }}>{trigger.eventType}</td>
                      <td style={{ padding: "1rem 1.5rem" }}>
                        {trigger.eventType === "Webhook" ? (
                          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                            <span style={{ backgroundColor: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", padding: "0.2rem 0.65rem", borderRadius: "100px", color: "#7c3aed", fontSize: "0.78rem", fontWeight: "700", fontFamily: "var(--font-display)", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                              <Webhook size={12} /> Inbound Webhook
                            </span>
                            <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}>
                              {trigger.endpoint ? trigger.endpoint.replace("https://", "") : "endpoint configured"}
                            </span>
                          </div>
                        ) : (
                          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                            <span style={{ backgroundColor: "rgba(20,86,240,0.08)", border: "1px solid rgba(20,86,240,0.18)", padding: "0.2rem 0.65rem", borderRadius: "100px", color: "var(--primary)", fontSize: "0.78rem", fontWeight: "700", fontFamily: "var(--font-display)" }}>{trigger.filterField}</span>
                            <span style={{ color: "var(--text-main)", fontSize: "0.85rem" }}>{trigger.filterCondition}</span>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "1rem 1.5rem", color: "var(--text-main)" }}>
                        {linkedPipelines.length > 0 ? (
                          <span 
                            title={linkedPipelines.map(p => `#${p.id}: ${p.name}`).join(", ")}
                            style={{ 
                              padding: "0.22rem 0.65rem", 
                              borderRadius: "100px", 
                              backgroundColor: "#ecfdf5", 
                              color: "#065f46", 
                              border: "1px solid rgba(16,185,129,0.25)", 
                              fontSize: "0.78rem", 
                              fontWeight: 700, 
                              fontFamily: "var(--font-display)",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.3rem"
                            }}
                          >
                            <CheckCircle2 size={12} /> {linkedPipelines.length} {linkedPipelines.length === 1 ? "pipeline" : "pipelines"}
                          </span>
                        ) : (
                          <span style={{ 
                            padding: "0.22rem 0.65rem", 
                            borderRadius: "100px", 
                            backgroundColor: "#f1f5f9", 
                            color: "#64748b", 
                            fontSize: "0.78rem", 
                            fontWeight: 600,
                            fontFamily: "var(--font-display)"
                          }}>
                            Unlinked
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "1rem 1.5rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>{trigger.lastEdited}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isCreatingTrigger && (
        <>
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15, 23, 42, 0.4)", zIndex: 999, transition: "opacity 0.3s" }} onClick={resetTriggerDraft}></div>
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "600px", backgroundColor: "rgba(255,255,255,0.94)", backdropFilter: "blur(24px)", zIndex: 1000, display: "flex", flexDirection: "column", boxShadow: "-12px 0 40px rgba(15,23,42,0.15)", animation: "slideInRight 0.3s ease-out" }}>
            <div style={{ backgroundColor: "rgba(248,250,252,0.8)", padding: "0.75rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(15,23,42,0.06)", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center" }} onClick={resetTriggerDraft}>
                  <X size={20} />
                </button>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                <span style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-subtle)" }}>
                  {editingTriggerId ? "Edit Trigger" : "New Trigger"}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <input
                    ref={triggerNameRef}
                    type="text"
                    value={triggerName}
                    onChange={(e) => setTriggerName(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    placeholder="Name this trigger"
                    spellCheck={false}
                    style={{ fontSize: "1.1rem", border: "none", borderBottom: "1px dashed rgba(148,163,184,0.6)", outline: "none", color: "var(--dark)", width: "220px", backgroundColor: "transparent", fontFamily: "var(--font-display)", fontWeight: "700" }}
                  />
                  <button
                    type="button"
                    title="Rename trigger"
                    onClick={() => {
                      triggerNameRef.current?.focus();
                      triggerNameRef.current?.select();
                    }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center", padding: "0.15rem" }}
                  >
                    <Pencil size={15} />
                  </button>
                </div>
              </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <button 
                  style={{ 
                    background: isSaveActive ? "var(--navy-gradient, linear-gradient(135deg,#181e25,#2c3e50))" : "#f1f5f9", 
                    color: isSaveActive ? "white" : "#94a3b8", 
                    border: "none", 
                    padding: "0.5rem 1.2rem", 
                    borderRadius: "100px", 
                    fontSize: "0.9rem", 
                    fontWeight: "600", 
                    cursor: isSaveActive ? "pointer" : "not-allowed",
                    boxShadow: isSaveActive ? "0 4px 12px -4px rgba(24,30,37,0.4)" : "none",
                    transition: "all 0.2s"
                  }}
                  onClick={() => {
                    if (isSaveActive) {
                      const isWebhookNow = selectedTriggerType === "Webhook";
                      const triggerPayload = {
                        name: triggerName,
                        description: triggerDescription.trim(),
                        eventType: selectedTriggerType,
                        tags: 0,
                        lastEdited: "Just now"
                      };

                      if (isWebhookNow) {
                        triggerPayload.source = "inbound";
                        triggerPayload.endpoint = webhookEndpoint.trim();
                        triggerPayload.secret = webhookSecret;
                        triggerPayload.expectedPayload = WEBHOOK_PAYLOAD_SAMPLE;
                        triggerPayload.filterField = "Webhook";
                        triggerPayload.filterCondition = `POST ${triggerPayload.endpoint.split("/").pop()}`;
                      } else {
                        triggerPayload.filterField = triggerScope === "all" ? "All Platforms" : triggerFilterField;
                        triggerPayload.filterCondition = triggerScope === "some" ? `${triggerFilterOperator} ${selectedApps.join(", ")}` : "";
                      }

                      if (editingTriggerId) {
                        updateTrigger(editingTriggerId, triggerPayload);
                        toast.success(`Trigger "${triggerName}" updated`);
                      } else {
                        addTrigger({ id: Date.now(), ...triggerPayload });
                        toast.success(`Trigger "${triggerName}" created`);
                      }

                      resetTriggerDraft();
                      setIsCreatingTrigger(false);
                    }
                  }}
                >
                  {editingTriggerId ? "Save Changes" : "Save"}
                </button>
                <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                </button>
              </div>
            </div>

            <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "2rem" }}>
              <div 
                style={{ width: "100%", maxWidth: "800px", backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(14px)", borderRadius: "1.25rem", border: "1px solid rgba(255,255,255,0.7)", boxShadow: "0 1px 2px rgba(15,23,42,0.06), 0 8px 24px -12px rgba(15,23,42,0.12)", position: "relative", cursor: !selectedTriggerType ? "pointer" : "default", transition: "box-shadow 0.2s" }}
                onClick={() => !selectedTriggerType && setIsDrawerOpen(true)}
                onMouseEnter={(e) => !selectedTriggerType && (e.currentTarget.style.boxShadow = "0 12px 32px -12px rgba(20,86,240,0.25)")}
                onMouseLeave={(e) => !selectedTriggerType && (e.currentTarget.style.boxShadow = "0 1px 2px rgba(15,23,42,0.06), 0 8px 24px -12px rgba(15,23,42,0.12)")}
              >
                <div style={{ padding: "1.5rem", borderBottom: selectedTriggerType ? "1px solid var(--border-color)" : "none" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: "500", margin: 0, color: "var(--dark)" }}>Trigger Configuration</h3>
                </div>

                {!selectedTriggerType ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: "1.5rem", paddingRight: "1.5rem", paddingBottom: "2.5rem", paddingLeft: "1.5rem" }}>
                    <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transform: "rotate(45deg)", overflow: "visible" }}>
                        <circle cx="9" cy="9" r="5"></circle>
                        <circle cx="15" cy="15" r="5"></circle>
                      </svg>
                    </div>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", margin: 0 }}>Choose a trigger type to begin setup...</p>
                  </div>
                ) : (
                  <div style={{ paddingTop: "0.5rem", paddingRight: "1.5rem", paddingBottom: "2.5rem", paddingLeft: "1.5rem" }}>
                    <div style={{ marginBottom: "2.5rem" }}>
                      <label style={{ display: "block", color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>Trigger Type</label>
                      <div 
                        style={{ border: "1px solid var(--border-color)", borderRadius: "6px", padding: "1rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", backgroundColor: "white", transition: "background-color 0.2s" }}
                        onClick={() => setIsDrawerOpen(true)}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "white"}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                          {isWebhook ? (
                            <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#7c3aed", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Webhook size={16} />
                            </div>
                          ) : (
                            <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#4285f4", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                              </svg>
                            </div>
                          )}
                          <span style={{ fontWeight: "500", color: "var(--dark)", fontSize: "1rem" }}>{selectedTriggerType}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <span style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: "600" }}>Change</span>
                          <ChevronDown size={16} color="var(--text-muted)" />
                        </div>
                      </div>
                    </div>

                    {isWebhook ? (
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                          <Webhook size={16} color="#7c3aed" />
                          <label style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>Inbound Webhook Endpoint</label>
                        </div>
                        <div style={{ border: "1px solid rgba(139,92,246,0.3)", borderRadius: "6px", padding: "1.5rem", backgroundColor: "rgba(139,92,246,0.04)", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                          <div>
                            <span style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.35rem" }}>POST URL</span>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <input
                                type="text"
                                readOnly
                                value={webhookEndpoint}
                                style={{ flex: 1, padding: "0.6rem 0.8rem", border: "1px solid var(--border-color)", borderRadius: "6px", backgroundColor: "white", color: "var(--dark)", fontSize: "0.85rem", fontFamily: "var(--font-mono)" }}
                              />
                              <button
                                style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.55rem 0.9rem", borderRadius: "6px", border: "1px solid var(--border-color)", backgroundColor: "white", color: "#7c3aed", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}
                                onClick={handleCopyEndpoint}
                              >
                                {isCopiedEndpoint ? <Check size={14} /> : <Copy size={14} />}
                                {isCopiedEndpoint ? "Copied" : "Copy"}
                              </button>
                            </div>
                          </div>

                          <div>
                            <span style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.35rem" }}>Signing Secret</span>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <input
                                type="text"
                                readOnly
                                value={isWebhookSecretRevealed ? webhookSecret : "••••••••••••••••••••"}
                                style={{ flex: 1, padding: "0.6rem 0.8rem", border: "1px solid var(--border-color)", borderRadius: "6px", backgroundColor: "white", color: "var(--dark)", fontSize: "0.85rem", fontFamily: "var(--font-mono)" }}
                              />
                              <button
                                style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.55rem 0.9rem", borderRadius: "6px", border: "1px solid var(--border-color)", backgroundColor: "white", color: "var(--text-main)", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}
                                onClick={() => setIsWebhookSecretRevealed(!isWebhookSecretRevealed)}
                                title={isWebhookSecretRevealed ? "Hide secret" : "Reveal secret"}
                              >
                                {isWebhookSecretRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                                {isWebhookSecretRevealed ? "Hide" : "Reveal"}
                              </button>
                              <button
                                style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.55rem 0.9rem", borderRadius: "6px", border: "1px solid var(--border-color)", backgroundColor: "white", color: "var(--text-main)", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}
                                onClick={() => { setWebhookSecret(`whsk_${Math.random().toString(36).slice(2, 14)}${Math.random().toString(36).slice(2, 6)}`); setIsCopiedSecret(false); }}
                              >
                                <RefreshCw size={14} /> Regenerate
                              </button>
                              <button
                                style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.55rem 0.9rem", borderRadius: "6px", border: "1px solid var(--border-color)", backgroundColor: "white", color: "var(--text-main)", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}
                                onClick={handleCopySecret}
                                title="Copy secret"
                              >
                                {isCopiedSecret ? <Check size={14} /> : <Copy size={14} />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <span style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.35rem" }}>Expected JSON Payload</span>
                            <pre style={{ margin: 0, padding: "0.9rem 1rem", backgroundColor: "#181e25", color: "#a5b4fc", borderRadius: "8px", fontSize: "0.8rem", fontFamily: "var(--font-mono)", lineHeight: 1.5, overflowX: "auto" }}>{WEBHOOK_PAYLOAD_SAMPLE}</pre>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label style={{ display: "block", color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>This trigger fires on</label>
                        <div style={{ display: "flex", gap: "2rem", marginBottom: "1.5rem" }}>
                          <label 
                            style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.95rem", color: "var(--dark)" }}
                            title="All App and Web"
                          >
                            <input 
                              type="radio" 
                              name="triggerScope" 
                              checked={triggerScope === "all"} 
                              onChange={() => setTriggerScope("all")}
                              style={{ width: "16px", height: "16px", accentColor: "#4285f4", cursor: "pointer" }}
                            />
                            All Platforms
                          </label>
                          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.95rem", color: "var(--dark)" }}>
                            <input 
                              type="radio" 
                              name="triggerScope" 
                              checked={triggerScope === "some"} 
                              onChange={() => setTriggerScope("some")}
                              style={{ width: "16px", height: "16px", accentColor: "#4285f4", cursor: "pointer" }}
                            />
                            Some Platforms
                          </label>
                        </div>

                        {triggerScope === "some" && (
                          <div style={{ border: "1px solid var(--border-color)", borderRadius: "6px", padding: "1.5rem", backgroundColor: "white" }}>
                            <div style={{ display: "flex", gap: "1rem", alignItems: "center", position: "relative" }}>
                              <CustomSelect
                                value={triggerFilterField}
                                onChange={(val) => setTriggerFilterField(val)}
                                options={["Platform Name", "Device Type", "App Version"]}
                                style={{ flex: 1 }}
                              />
                              <CustomSelect
                                value={triggerFilterOperator}
                                onChange={(val) => setTriggerFilterOperator(val)}
                                options={["equals", "contains", "not equals"]}
                                style={{ flex: 1 }}
                              />
                              
                              <div style={{ flex: 1, position: "relative" }} ref={dropdownRef}>
                                <div 
                                  style={{ padding: "0.5rem 1rem", border: "1px solid var(--border-color)", borderRadius: "4px", backgroundColor: "#f8fafc", color: "var(--dark)", fontSize: "0.9rem", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                                  onClick={() => setIsAppDropdownOpen(!isAppDropdownOpen)}
                                >
                                  <span>{selectedApps.length > 0 ? `${selectedApps.length} selected` : "Select platforms..."}</span>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isAppDropdownOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}><path d="m6 9 6 6 6-6" /></svg>
                                </div>

                                {isAppDropdownOpen && (
                                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: "4px", backgroundColor: "white", border: "1px solid var(--border-color)", borderRadius: "4px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", zIndex: 10, maxHeight: "200px", overflowY: "auto" }}>
                                    {["MantraCare", "TherapyMantra", "Physio Mantra", "Web Platform"].map(app => (
                                      <label key={app} style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer", fontSize: "0.9rem", color: "var(--dark)", padding: "0.75rem 1rem", borderBottom: "1px solid #f1f5f9" }}>
                                        <input 
                                          type="checkbox"
                                          checked={selectedApps.includes(app)}
                                          onChange={(e) => {
                                            if (e.target.checked) {
                                              setSelectedApps([...selectedApps, app]);
                                            } else {
                                              setSelectedApps(selectedApps.filter(a => a !== app));
                                            }
                                          }}
                                          style={{ width: "16px", height: "16px", accentColor: "#4285f4", cursor: "pointer" }}
                                        />
                                        {app}
                                      </label>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div style={{ marginTop: "1.5rem" }}>
                      <label style={{ display: "block", color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>Description <span style={{ color: "var(--text-subtle)" }}>(optional)</span></label>
                      <textarea
                        value={triggerDescription}
                        onChange={(e) => setTriggerDescription(e.target.value)}
                        placeholder={isWebhook ? "What events will be delivered to this endpoint? e.g. appointment booked payloads from EyeMantra" : "Explain when this trigger should fire..."}
                        rows={2}
                        style={{ width: "100%", padding: "0.6rem 0.8rem", border: "1px solid var(--border-color)", borderRadius: "6px", backgroundColor: "white", color: "var(--dark)", fontSize: "0.9rem", resize: "vertical", fontFamily: "var(--font-sans)", outline: "none" }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {isDrawerOpen && (
              <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "400px", backgroundColor: "white", boxShadow: "-2px 0 8px rgba(0,0,0,0.15)", zIndex: 1010, display: "flex", flexDirection: "column", animation: "slideIn 0.3s ease-out forwards" }}>
                <div style={{ padding: "1rem 1.5rem", backgroundColor: "var(--dark)", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "500" }}>{selectedTriggerType ? "Change trigger type" : "Choose trigger type"}</h3>
                  <button style={{ background: "none", border: "none", cursor: "pointer", color: "white", opacity: 0.8 }} onClick={() => setIsDrawerOpen(false)}>
                    <X size={20} />
                  </button>
                </div>

                <div style={{ flex: 1, overflowY: "auto", padding: "1rem 0" }}>
                  <div style={{ padding: "0.5rem 1.5rem", fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.5rem" }}>
                    Event Types
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {[
                      "Signup",
                      "Session Booked",
                      "Session Completed",
                      "Session is Started",
                      "Session Link Generated",
                      "Message Sent",
                      "Profile Edited",
                      "Invite Code added"
                    ].map((type) => (
                      <div
                        key={type}
                        style={{ padding: "0.85rem 1.5rem", borderBottom: "1px solid #f1f5f9", cursor: "pointer", display: "flex", alignItems: "center", gap: "1rem", transition: "background-color 0.2s", backgroundColor: selectedTriggerType === type ? "rgba(20,86,240,0.06)" : "transparent" }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = selectedTriggerType === type ? "rgba(20,86,240,0.06)" : "#f8fafc"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedTriggerType === type ? "rgba(20,86,240,0.06)" : "transparent"}
                        onClick={() => {
                          setSelectedTriggerType(type);
                          setIsDrawerOpen(false);
                        }}
                      >
                        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "1rem" }}>
                          <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: selectedTriggerType === type ? "var(--primary)" : "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={selectedTriggerType === type ? "white" : "var(--text-muted)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"></circle>
                              <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                          </div>
                          <span style={{ fontSize: "0.95rem", color: "var(--dark)", fontWeight: selectedTriggerType === type ? "700" : "500" }}>{type}</span>
                        </div>
                        {selectedTriggerType === type && <Check size={16} color="var(--primary)" />}
                      </div>
                    ))}

                    <div style={{ padding: "0.5rem 1.5rem", fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.5rem", marginTop: "1rem" }}>
                      Inbound
                    </div>
                    <div
                      style={{ padding: "0.85rem 1.5rem", borderBottom: "1px solid #f1f5f9", cursor: "pointer", display: "flex", alignItems: "center", gap: "1rem", transition: "background-color 0.2s", backgroundColor: selectedTriggerType === "Webhook" ? "rgba(139,92,246,0.08)" : "transparent" }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = selectedTriggerType === "Webhook" ? "rgba(139,92,246,0.08)" : "#f8fafc"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedTriggerType === "Webhook" ? "rgba(139,92,246,0.08)" : "transparent"}
                      onClick={() => {
                        setSelectedTriggerType("Webhook");
                        setIsDrawerOpen(false);
                      }}
                    >
                      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: selectedTriggerType === "Webhook" ? "#7c3aed" : "rgba(139,92,246,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: selectedTriggerType === "Webhook" ? "white" : "#7c3aed" }}>
                          <Webhook size={16} />
                        </div>
                        <div>
                          <span style={{ fontSize: "0.95rem", color: "var(--dark)", fontWeight: selectedTriggerType === "Webhook" ? "700" : "500" }}>Webhook</span>
                          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Inbound endpoint — receive events instead of tracking</div>
                        </div>
                      </div>
                      {selectedTriggerType === "Webhook" && <Check size={16} color="#7c3aed" />}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
