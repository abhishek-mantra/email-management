"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, X, Mail, Server, ShieldCheck, Activity, Search, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { useNotifications } from "@/context/NotificationContext";
import CustomSelect from "@/components/CustomSelect";

export default function EmailSettingsPage() {
  const { emailSettings, updateEmailSettings, selectedCompany } = useNotifications();
  const [activeTab, setActiveTab] = useState("emailId"); // 'emailId' | 'provider'
  const [searchQuery, setSearchQuery] = useState("");

  const providers = emailSettings?.providers || [];
  const emailIds = emailSettings?.emailIds || [];

  const setProviders = (newProviders) => {
    updateEmailSettings({ ...(emailSettings || {}), providers: newProviders });
  };

  const setEmailIds = (newEmailIds) => {
    updateEmailSettings({ ...(emailSettings || {}), emailIds: newEmailIds });
  };

  // Modals State
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [editingEmail, setEditingEmail] = useState(null);

  // Form States
  const [providerForm, setProviderForm] = useState({ connectionName: "", provider: "Sendgrid", authToken: "", clientId: "", secretKey: "", apiKey: "" });
  const [emailForm, setEmailForm] = useState({ email: "", providerId: "", priority: "Normal" });

  // Handlers for Provider
  const openProviderModal = (provider = null) => {
    if (provider) {
      setEditingProvider(provider);
      setProviderForm({
        connectionName: provider.connectionName,
        provider: provider.provider,
        authToken: provider.details.authToken || "",
        clientId: provider.details.clientId || "",
        secretKey: provider.details.secretKey || "",
        apiKey: provider.details.apiKey || ""
      });
    } else {
      setEditingProvider(null);
      setProviderForm({ connectionName: "", provider: "Sendgrid", authToken: "", clientId: "", secretKey: "", apiKey: "" });
    }
    setIsProviderModalOpen(true);
  };

  const saveProvider = () => {
    if (!providerForm.connectionName || !providerForm.provider) {
      toast.error("Please fill required fields");
      return;
    }

    let details = {};
    if (providerForm.provider === "Sendgrid") details = { authToken: providerForm.authToken };
    if (providerForm.provider === "SES") details = { clientId: providerForm.clientId, secretKey: providerForm.secretKey };
    if (providerForm.provider === "Brevo") details = { apiKey: providerForm.apiKey };

    if (editingProvider) {
      setProviders(providers.map(p => p.id === editingProvider.id ? { ...p, connectionName: providerForm.connectionName, provider: providerForm.provider, details } : p));
      toast.success("Provider updated");
    } else {
      const newId = providers.length > 0 ? Math.max(...providers.map(p => p.id)) + 1 : 1;
      setProviders([...providers, { id: newId, connectionName: providerForm.connectionName, provider: providerForm.provider, details }]);
      toast.success("Provider connected");
    }
    setIsProviderModalOpen(false);
  };

  const deleteProvider = (id) => {
    setProviders(providers.filter(p => p.id !== id));
    toast.success("Provider deleted");
  };

  // Handlers for Email ID
  const openEmailModal = (emailObj = null) => {
    if (emailObj) {
      setEditingEmail(emailObj);
      setEmailForm({ email: emailObj.email, providerId: emailObj.providerId, priority: emailObj.priority });
    } else {
      setEditingEmail(null);
      setEmailForm({ email: "", providerId: providers.length > 0 ? providers[0].id : "", priority: "Normal" });
    }
    setIsEmailModalOpen(true);
  };

  const saveEmail = () => {
    if (!emailForm.email || !emailForm.providerId) {
      toast.error("Please fill required fields");
      return;
    }
    if (editingEmail) {
      setEmailIds(emailIds.map(e => e.id === editingEmail.id ? { ...e, ...emailForm, providerId: Number(emailForm.providerId) } : e));
      toast.success("Email ID updated");
    } else {
      const newId = emailIds.length > 0 ? Math.max(...emailIds.map(e => e.id)) + 1 : 1;
      setEmailIds([...emailIds, { id: newId, ...emailForm, providerId: Number(emailForm.providerId) }]);
      toast.success("Email ID added");
    }
    setIsEmailModalOpen(false);
  };

  const deleteEmail = (id) => {
    setEmailIds(emailIds.filter(e => e.id !== id));
    toast.success("Email ID deleted");
  };

  // Filtered lists
  const filteredEmails = emailIds.filter(e =>
    e.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.priority.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(e.id).includes(searchQuery)
  );

  const filteredProviders = providers.filter(p =>
    p.connectionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(p.id).includes(searchQuery)
  );

  const defaultSender = emailIds.length > 0 ? emailIds[0].email : "donotreply@mantra.care";
  const activeRelay = providers.length > 0 ? providers[0].provider : "Sendgrid";

  return (
    <div style={{ maxWidth: "1240px", margin: "0 auto", paddingBottom: "3rem" }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "800", fontFamily: "var(--font-display)", color: "var(--dark)", margin: 0, letterSpacing: "-0.025em" }}>Email Settings</h1>
          <p style={{ color: "var(--text-muted)", margin: "0.25rem 0 0 0", fontSize: "0.875rem" }}>
            Sender identities, SMTP relay gateways, and domain verifications for {selectedCompany}
          </p>
        </div>
        {activeTab === "emailId" ? (
          <button className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem" }} onClick={() => openEmailModal()}>
            <Plus size={16} /> Add New Email ID
          </button>
        ) : (
          <button className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem" }} onClick={() => openProviderModal()}>
            <Plus size={16} /> Connect Provider
          </button>
        )}
      </div>

      {/* KPI Stat Capsules (Design_1.md Section 4.4) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", marginBottom: "1.75rem" }}>
        <div style={{ backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)", borderRadius: "1.25rem", border: "1px solid rgba(255,255,255,0.8)", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-subtle)", fontFamily: "var(--font-display)", margin: 0 }}>VERIFIED EMAIL IDS</p>
            <h3 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--dark)", fontFamily: "var(--font-display)", margin: "0.25rem 0 0 0", letterSpacing: "-0.02em" }}>{emailIds.length}</h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "0.25rem 0 0 0" }}>Sender mailboxes</p>
          </div>
          <div style={{ width: "48px", height: "48px", borderRadius: "16px", backgroundColor: "rgba(20,86,240,0.08)", border: "1px solid rgba(20,86,240,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
            <Mail size={20} />
          </div>
        </div>

        <div style={{ backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)", borderRadius: "1.25rem", border: "1px solid rgba(255,255,255,0.8)", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-subtle)", fontFamily: "var(--font-display)", margin: 0 }}>CONNECTED PROVIDERS</p>
            <h3 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--dark)", fontFamily: "var(--font-display)", margin: "0.25rem 0 0 0", letterSpacing: "-0.02em" }}>{providers.length}</h3>
            <p style={{ fontSize: "12px", color: "#059669", margin: "0.25rem 0 0 0", fontWeight: 600 }}>Active SMTP / API relays</p>
          </div>
          <div style={{ width: "48px", height: "48px", borderRadius: "16px", backgroundColor: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#059669" }}>
            <Server size={20} />
          </div>
        </div>

        <div style={{ backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)", borderRadius: "1.25rem", border: "1px solid rgba(255,255,255,0.8)", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-subtle)", fontFamily: "var(--font-display)", margin: 0 }}>DEFAULT SENDER</p>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--dark)", fontFamily: "var(--font-mono)", margin: "0.45rem 0 0 0", letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "160px" }}>{defaultSender}</h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "0.25rem 0 0 0" }}>Primary from header</p>
          </div>
          <div style={{ width: "48px", height: "48px", borderRadius: "16px", backgroundColor: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#7c3aed" }}>
            <ShieldCheck size={20} />
          </div>
        </div>

        <div style={{ backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)", borderRadius: "1.25rem", border: "1px solid rgba(255,255,255,0.8)", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-subtle)", fontFamily: "var(--font-display)", margin: 0 }}>ACTIVE RELAY</p>
            <h3 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--dark)", fontFamily: "var(--font-display)", margin: "0.25rem 0 0 0", letterSpacing: "-0.02em" }}>{activeRelay}</h3>
            <p style={{ fontSize: "12px", color: "#0284c7", margin: "0.25rem 0 0 0", fontWeight: 600 }}>Default email service</p>
          </div>
          <div style={{ width: "48px", height: "48px", borderRadius: "16px", backgroundColor: "rgba(2,132,199,0.08)", border: "1px solid rgba(2,132,199,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#0284c7" }}>
            <Activity size={20} />
          </div>
        </div>
      </div>

      {/* Control Bar: Secondary Pill Switcher + Search Filter Pill */}
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
            className={activeTab === "emailId" ? "pill-option active" : "pill-option"}
            onClick={() => setActiveTab("emailId")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.45rem",
              background: activeTab === "emailId" ? "var(--navy-gradient)" : "transparent",
              color: activeTab === "emailId" ? "#ffffff" : "#45515e",
              boxShadow: activeTab === "emailId" ? "0 3px 10px rgba(24, 30, 37, 0.28)" : "none"
            }}
          >
            <Mail size={14} /> Email IDs ({emailIds.length})
          </button>
          <button
            type="button"
            className={activeTab === "provider" ? "pill-option active" : "pill-option"}
            onClick={() => setActiveTab("provider")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.45rem",
              background: activeTab === "provider" ? "var(--navy-gradient)" : "transparent",
              color: activeTab === "provider" ? "#ffffff" : "#45515e",
              boxShadow: activeTab === "provider" ? "0 3px 10px rgba(24, 30, 37, 0.28)" : "none"
            }}
          >
            <Server size={14} /> Providers ({providers.length})
          </button>
        </div>

        {/* Search Filter Pill (Design_1.md Section 4.5) */}
        <div style={{ position: "relative", width: "320px" }}>
          <Search size={15} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input 
            type="text"
            placeholder={activeTab === "emailId" ? "Search email addresses, priority..." : "Search providers, connection names..."}
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
              backgroundColor: "#ffffff",
              boxShadow: "0 1px 2px rgba(15,23,42,0.04)"
            }}
          />
        </div>
      </div>

      {/* Main Table Card (Design_1.md Section 4.3) */}
      <div className="card" style={{ padding: "0", overflow: "hidden", borderRadius: "20px" }}>
        {activeTab === "emailId" && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
              <thead className="thead-dark">
                <tr style={{ textAlign: "left" }}>
                  <th style={{ padding: "1rem 1.25rem", fontSize: "0.75rem", textTransform: "uppercase" }}>ID</th>
                  <th style={{ padding: "1rem 1.25rem", fontSize: "0.75rem", textTransform: "uppercase" }}>Sender Email Address</th>
                  <th style={{ padding: "1rem 1.25rem", fontSize: "0.75rem", textTransform: "uppercase" }}>Relay Provider</th>
                  <th style={{ padding: "1rem 1.25rem", fontSize: "0.75rem", textTransform: "uppercase" }}>Priority</th>
                  <th style={{ padding: "1rem 1.25rem", fontSize: "0.75rem", textTransform: "uppercase", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmails.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                      {searchQuery ? `No email IDs matching "${searchQuery}"` : "No Email IDs configured. Click Add New Email ID to register a mailbox."}
                    </td>
                  </tr>
                ) : filteredEmails.map(email => {
                  const provider = providers.find(p => p.id === email.providerId);
                  return (
                    <tr 
                      key={email.id} 
                      style={{ borderBottom: "1px solid #f1f5f9", transition: "background-color 0.15s" }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"} 
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      <td style={{ padding: "1rem 1.25rem", fontWeight: "600", color: "var(--dark)", fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>#{email.id}</td>
                      <td style={{ padding: "1rem 1.25rem", color: "var(--primary)", fontWeight: "600", fontFamily: "var(--font-mono)" }}>{email.email}</td>
                      <td style={{ padding: "1rem 1.25rem", color: "var(--dark)", fontWeight: "500" }}>
                        <span style={{ padding: "0.25rem 0.65rem", backgroundColor: "rgba(20,86,240,0.06)", borderRadius: "8px", border: "1px solid rgba(20,86,240,0.12)", color: "var(--primary)", fontSize: "0.85rem", fontWeight: "600" }}>
                          {provider ? provider.connectionName : "Unknown"}
                        </span>
                      </td>
                      <td style={{ padding: "1rem 1.25rem" }}>
                        <span style={{ padding: "0.25rem 0.75rem", backgroundColor: email.priority === "High" ? "#fee2e2" : "#f1f5f9", color: email.priority === "High" ? "#b91c1c" : "var(--dark)", borderRadius: "100px", fontSize: "0.78rem", fontWeight: "700", fontFamily: "var(--font-display)" }}>
                          {email.priority}
                        </span>
                      </td>
                      <td style={{ padding: "1rem 1.25rem", textAlign: "right" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                          <button className="btn btn-outline" style={{ padding: "0.35rem 0.65rem", height: "auto" }} onClick={() => openEmailModal(email)} title="Edit"><Edit size={15} /></button>
                          <button className="btn btn-outline" style={{ padding: "0.35rem 0.65rem", height: "auto", color: "var(--danger)", borderColor: "rgba(239, 68, 68, 0.3)" }} onClick={() => deleteEmail(email.id)} title="Delete"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "provider" && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
              <thead className="thead-dark">
                <tr style={{ textAlign: "left" }}>
                  <th style={{ padding: "1rem 1.25rem", fontSize: "0.75rem", textTransform: "uppercase" }}>ID</th>
                  <th style={{ padding: "1rem 1.25rem", fontSize: "0.75rem", textTransform: "uppercase" }}>Connection Name</th>
                  <th style={{ padding: "1rem 1.25rem", fontSize: "0.75rem", textTransform: "uppercase" }}>Relay Engine</th>
                  <th style={{ padding: "1rem 1.25rem", fontSize: "0.75rem", textTransform: "uppercase", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProviders.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                      {searchQuery ? `No providers matching "${searchQuery}"` : "No Email providers connected. Click Connect Provider to authenticate Sendgrid, SES, or Brevo."}
                    </td>
                  </tr>
                ) : filteredProviders.map(provider => (
                  <tr 
                    key={provider.id} 
                    style={{ borderBottom: "1px solid #f1f5f9", transition: "background-color 0.15s" }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"} 
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <td style={{ padding: "1rem 1.25rem", fontWeight: "600", color: "var(--dark)", fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>#{provider.id}</td>
                    <td style={{ padding: "1rem 1.25rem", color: "var(--primary)", fontWeight: "600", fontFamily: "var(--font-mono)", fontSize: "0.9rem" }}>{provider.connectionName}</td>
                    <td style={{ padding: "1rem 1.25rem", color: "var(--text-main)" }}>
                      <span style={{ padding: "0.35rem 0.85rem", backgroundColor: "rgba(255,255,255,0.9)", borderRadius: "100px", border: "1px solid rgba(15,23,42,0.12)", fontSize: "0.825rem", fontWeight: "700", color: "var(--dark)", boxShadow: "0 1px 2px rgba(15,23,42,0.04)" }}>
                        {provider.provider}
                      </span>
                    </td>
                    <td style={{ padding: "1rem 1.25rem", textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                        <button className="btn btn-outline" style={{ padding: "0.35rem 0.65rem", height: "auto" }} onClick={() => openProviderModal(provider)} title="Edit"><Edit size={15} /></button>
                        <button className="btn btn-outline" style={{ padding: "0.35rem 0.65rem", height: "auto", color: "var(--danger)", borderColor: "rgba(239, 68, 68, 0.3)" }} onClick={() => deleteProvider(provider.id)} title="Delete"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Provider Modal (Design_1.md standard 28px glassmorphic dialog) */}
      {isProviderModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15, 23, 42, 0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)", padding: "1rem" }} onClick={() => setIsProviderModalOpen(false)}>
          <div style={{ width: "100%", maxWidth: "520px", backgroundColor: "rgba(255,255,255,0.95)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.8)", borderRadius: "1.75rem", boxShadow: "0 24px 60px -12px rgba(15, 23, 42, 0.35)", display: "flex", flexDirection: "column", maxHeight: "90vh", overflow: "hidden" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "1.25rem 1.5rem", backgroundColor: "rgba(248,250,252,0.85)", borderBottom: "1px solid rgba(226, 232, 240, 0.9)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "1.15rem", fontWeight: "700", fontFamily: "var(--font-display)", margin: 0, color: "var(--dark)" }}>{editingProvider ? "Edit Email Provider" : "Connect Email Provider"}</h2>
              <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }} onClick={() => setIsProviderModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: "1.5rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div className="input-group" style={{ margin: 0 }}>
                <label className="form-label">Connection Name *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Transactional SendGrid" 
                  value={providerForm.connectionName} 
                  onChange={e => setProviderForm({...providerForm, connectionName: e.target.value})} 
                  required
                />
              </div>

              <div className="input-group" style={{ margin: 0 }}>
                <label className="form-label">Email Provider</label>
                <CustomSelect 
                  value={providerForm.provider} 
                  onChange={val => setProviderForm({...providerForm, provider: val})}
                  options={["Sendgrid", "SES", "Brevo"]}
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <h3 style={{ fontSize: "0.95rem", fontWeight: "700", fontFamily: "var(--font-display)", color: "var(--dark)", margin: 0 }}>Authentication Credentials</h3>
                
                {providerForm.provider === "Sendgrid" && (
                  <div className="input-group" style={{ margin: 0 }}>
                    <label className="form-label">API Auth Token</label>
                    <input type="password" className="form-control" placeholder="SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" value={providerForm.authToken} onChange={e => setProviderForm({...providerForm, authToken: e.target.value})} />
                  </div>
                )}

                {providerForm.provider === "SES" && (
                  <>
                    <div className="input-group" style={{ margin: 0 }}>
                      <label className="form-label">AWS Access Key / Client ID</label>
                      <input type="text" className="form-control" placeholder="AKIAIOSFODNN7EXAMPLE" value={providerForm.clientId} onChange={e => setProviderForm({...providerForm, clientId: e.target.value})} />
                    </div>
                    <div className="input-group" style={{ margin: 0 }}>
                      <label className="form-label">AWS Secret Key</label>
                      <input type="password" className="form-control" placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY" value={providerForm.secretKey} onChange={e => setProviderForm({...providerForm, secretKey: e.target.value})} />
                    </div>
                  </>
                )}

                {providerForm.provider === "Brevo" && (
                  <div className="input-group" style={{ margin: 0 }}>
                    <label className="form-label">API Key</label>
                    <input type="password" className="form-control" placeholder="xkeysib-xxxxxxxxxxxxxxxxxxxx" value={providerForm.apiKey} onChange={e => setProviderForm({...providerForm, apiKey: e.target.value})} />
                  </div>
                )}
              </div>
            </div>

            <div style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid var(--border-color)", display: "flex", justifyContent: "flex-end", gap: "0.75rem", backgroundColor: "rgba(248, 250, 252, 0.85)" }}>
              <button className="btn btn-outline" onClick={() => setIsProviderModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveProvider}>Save Provider</button>
            </div>
          </div>
        </div>
      )}

      {/* Email ID Modal */}
      {isEmailModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15, 23, 42, 0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)", padding: "1rem" }} onClick={() => setIsEmailModalOpen(false)}>
          <div style={{ width: "100%", maxWidth: "480px", backgroundColor: "rgba(255,255,255,0.95)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.8)", borderRadius: "1.75rem", boxShadow: "0 24px 60px -12px rgba(15, 23, 42, 0.35)", display: "flex", flexDirection: "column", overflow: "hidden" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "1.25rem 1.5rem", backgroundColor: "rgba(248,250,252,0.85)", borderBottom: "1px solid rgba(226, 232, 240, 0.9)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "1.15rem", fontWeight: "700", fontFamily: "var(--font-display)", margin: 0, color: "var(--dark)" }}>{editingEmail ? "Edit Email ID" : "Add New Email ID"}</h2>
              <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }} onClick={() => setIsEmailModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div className="input-group" style={{ margin: 0 }}>
                <label className="form-label">Email Address *</label>
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="e.g. notifications@company.com" 
                  value={emailForm.email} 
                  onChange={e => setEmailForm({...emailForm, email: e.target.value})} 
                  required
                />
              </div>

              <div className="input-group" style={{ margin: 0 }}>
                <label className="form-label">Connected Relay Provider *</label>
                <CustomSelect 
                  value={emailForm.providerId} 
                  onChange={val => setEmailForm({...emailForm, providerId: val})}
                  placeholder="Select Provider"
                  options={providers.map(p => ({ value: p.id, label: `${p.connectionName} (${p.provider})` }))}
                  style={{ width: "100%" }}
                />
              </div>

              <div className="input-group" style={{ margin: 0 }}>
                <label className="form-label">Routing Priority</label>
                <CustomSelect 
                  value={emailForm.priority} 
                  onChange={val => setEmailForm({...emailForm, priority: val})}
                  options={["Normal", "High"]}
                  style={{ width: "100%" }}
                />
              </div>
            </div>

            <div style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid var(--border-color)", display: "flex", justifyContent: "flex-end", gap: "0.75rem", backgroundColor: "rgba(248, 250, 252, 0.85)" }}>
              <button className="btn btn-outline" onClick={() => setIsEmailModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveEmail}>Save Email ID</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
