"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, X, Mail, Server } from "lucide-react";
import toast from "react-hot-toast";
import { useNotifications } from "@/context/NotificationContext";
import CustomSelect from "@/components/CustomSelect";

export default function EmailSettingsPage() {
  const { emailSettings, updateEmailSettings, selectedCompany } = useNotifications();
  const [activeTab, setActiveTab] = useState("emailId"); // 'emailId' | 'provider'

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

  return (
    <div style={{ padding: "0 2rem 2rem 2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "600", color: "var(--dark)", margin: 0 }}>Email Settings</h1>
          <p style={{ color: "var(--text-muted)", margin: "0.25rem 0 0 0", fontSize: "0.9rem" }}>Configuring for {selectedCompany}</p>
        </div>
        {activeTab === "emailId" ? (
          <button className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }} onClick={() => openEmailModal()}>
            <span>Add New Email ID</span> <Plus size={18} />
          </button>
        ) : (
          <button className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }} onClick={() => openProviderModal()}>
            <span>Connect Provider</span> <Plus size={18} />
          </button>
        )}
      </div>

      <div style={{ display: "flex", borderBottom: "1px solid var(--border-color)", marginBottom: "2rem" }}>
        <button 
          style={{ padding: "1rem 1.5rem", background: "none", border: "none", borderBottom: activeTab === "emailId" ? "2px solid #1a73e8" : "2px solid transparent", color: activeTab === "emailId" ? "#1a73e8" : "var(--text-muted)", fontWeight: activeTab === "emailId" ? "600" : "500", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}
          onClick={() => setActiveTab("emailId")}
        >
          <Mail size={16} /> Email IDs
        </button>
        <button 
          style={{ padding: "1rem 1.5rem", background: "none", border: "none", borderBottom: activeTab === "provider" ? "2px solid #1a73e8" : "2px solid transparent", color: activeTab === "provider" ? "#1a73e8" : "var(--text-muted)", fontWeight: activeTab === "provider" ? "600" : "500", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}
          onClick={() => setActiveTab("provider")}
        >
          <Server size={16} /> Providers
        </button>
      </div>

      <div className="card" style={{ padding: "1.5rem" }}>
        {activeTab === "emailId" && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border-color)", textAlign: "left" }}>
                  <th style={{ padding: "1rem", fontSize: "0.85rem", color: "#64748b", textTransform: "uppercase" }}>ID</th>
                  <th style={{ padding: "1rem", fontSize: "0.85rem", color: "#64748b", textTransform: "uppercase" }}>Email ID</th>
                  <th style={{ padding: "1rem", fontSize: "0.85rem", color: "#64748b", textTransform: "uppercase" }}>Provider</th>
                  <th style={{ padding: "1rem", fontSize: "0.85rem", color: "#64748b", textTransform: "uppercase" }}>Priority</th>
                  <th style={{ padding: "1rem", fontSize: "0.85rem", color: "#64748b", textTransform: "uppercase", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {emailIds.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>No Email IDs configured</td>
                  </tr>
                ) : emailIds.map(email => {
                  const provider = providers.find(p => p.id === email.providerId);
                  return (
                    <tr key={email.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "1rem", fontWeight: "500", color: "var(--dark)" }}>{email.id}</td>
                      <td style={{ padding: "1rem", color: "var(--primary)", fontWeight: "500" }}>{email.email}</td>
                      <td style={{ padding: "1rem", color: "var(--text-main)" }}>{provider ? provider.connectionName : "Unknown"}</td>
                      <td style={{ padding: "1rem" }}>
                        <span style={{ padding: "0.25rem 0.75rem", backgroundColor: email.priority === "High" ? "#fee2e2" : "#f1f5f9", color: email.priority === "High" ? "#b91c1c" : "var(--dark)", borderRadius: "100px", fontSize: "0.8rem", fontWeight: "600" }}>
                          {email.priority}
                        </span>
                      </td>
                      <td style={{ padding: "1rem", textAlign: "right" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                          <button className="btn btn-outline" style={{ padding: "0.25rem 0.5rem" }} onClick={() => openEmailModal(email)}><Edit size={16} /></button>
                          <button className="btn btn-outline" style={{ padding: "0.25rem 0.5rem", color: "var(--danger)", borderColor: "transparent" }} onClick={() => deleteEmail(email.id)}><Trash2 size={16} /></button>
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
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border-color)", textAlign: "left" }}>
                  <th style={{ padding: "1rem", fontSize: "0.85rem", color: "#64748b", textTransform: "uppercase" }}>ID</th>
                  <th style={{ padding: "1rem", fontSize: "0.85rem", color: "#64748b", textTransform: "uppercase" }}>Connection Name</th>
                  <th style={{ padding: "1rem", fontSize: "0.85rem", color: "#64748b", textTransform: "uppercase" }}>Provider</th>
                  <th style={{ padding: "1rem", fontSize: "0.85rem", color: "#64748b", textTransform: "uppercase", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {providers.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>No Providers connected</td>
                  </tr>
                ) : providers.map(provider => (
                  <tr key={provider.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "1rem", fontWeight: "500", color: "var(--dark)" }}>{provider.id}</td>
                    <td style={{ padding: "1rem", color: "var(--primary)", fontWeight: "500" }}>{provider.connectionName}</td>
                    <td style={{ padding: "1rem", color: "var(--text-main)" }}>
                      <span style={{ padding: "0.3rem 0.8rem", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid var(--border-color)", fontSize: "0.85rem", fontWeight: "600" }}>
                        {provider.provider}
                      </span>
                    </td>
                    <td style={{ padding: "1rem", textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                        <button className="btn btn-outline" style={{ padding: "0.25rem 0.5rem" }} onClick={() => openProviderModal(provider)}><Edit size={16} /></button>
                        <button className="btn btn-outline" style={{ padding: "0.25rem 0.5rem", color: "var(--danger)", borderColor: "transparent" }} onClick={() => deleteProvider(provider.id)}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Provider Modal */}
      {isProviderModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15, 23, 42, 0.4)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setIsProviderModalOpen(false)}>
          <div style={{ width: "500px", backgroundColor: "white", borderRadius: "8px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", maxHeight: "90vh" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "600", margin: 0, color: "var(--dark)" }}>{editingProvider ? "Edit Provider" : "Connect Provider"}</h2>
              <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }} onClick={() => setIsProviderModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: "1.5rem", overflowY: "auto" }}>
              <div className="input-group">
                <label className="form-label">Connection Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Marketing Sendgrid" 
                  value={providerForm.connectionName} 
                  onChange={e => setProviderForm({...providerForm, connectionName: e.target.value})} 
                />
              </div>

              <div className="input-group">
                <label className="form-label">Provider</label>
                <CustomSelect 
                  value={providerForm.provider} 
                  onChange={val => setProviderForm({...providerForm, provider: val})}
                  options={["Sendgrid", "SES", "Brevo"]}
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1.5rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1rem" }}>Key Details</h3>
                
                {providerForm.provider === "Sendgrid" && (
                  <div className="input-group">
                    <label className="form-label">Auth Token</label>
                    <input type="password" className="form-control" value={providerForm.authToken} onChange={e => setProviderForm({...providerForm, authToken: e.target.value})} />
                  </div>
                )}

                {providerForm.provider === "SES" && (
                  <>
                    <div className="input-group">
                      <label className="form-label">Client ID</label>
                      <input type="text" className="form-control" value={providerForm.clientId} onChange={e => setProviderForm({...providerForm, clientId: e.target.value})} />
                    </div>
                    <div className="input-group">
                      <label className="form-label">Secret Key</label>
                      <input type="password" className="form-control" value={providerForm.secretKey} onChange={e => setProviderForm({...providerForm, secretKey: e.target.value})} />
                    </div>
                  </>
                )}

                {providerForm.provider === "Brevo" && (
                  <div className="input-group">
                    <label className="form-label">API Key</label>
                    <input type="password" className="form-control" value={providerForm.apiKey} onChange={e => setProviderForm({...providerForm, apiKey: e.target.value})} />
                  </div>
                )}
              </div>
            </div>

            <div style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid var(--border-color)", display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
              <button className="btn btn-outline" onClick={() => setIsProviderModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveProvider}>Save Settings</button>
            </div>
          </div>
        </div>
      )}

      {/* Email ID Modal */}
      {isEmailModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15, 23, 42, 0.4)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setIsEmailModalOpen(false)}>
          <div style={{ width: "450px", backgroundColor: "white", borderRadius: "8px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "600", margin: 0, color: "var(--dark)" }}>{editingEmail ? "Edit Email ID" : "Add New Email ID"}</h2>
              <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }} onClick={() => setIsEmailModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: "1.5rem" }}>
              <div className="input-group">
                <label className="form-label">Email ID</label>
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="e.g. notifications@company.com" 
                  value={emailForm.email} 
                  onChange={e => setEmailForm({...emailForm, email: e.target.value})} 
                />
              </div>

              <div className="input-group">
                <label className="form-label">Provider</label>
                <CustomSelect 
                  value={emailForm.providerId} 
                  onChange={val => setEmailForm({...emailForm, providerId: val})}
                  placeholder="Select Provider"
                  options={providers.map(p => ({ value: p.id, label: `${p.connectionName} (${p.provider})` }))}
                  style={{ width: "100%" }}
                />
              </div>

              <div className="input-group">
                <label className="form-label">Priority</label>
                <CustomSelect 
                  value={emailForm.priority} 
                  onChange={val => setEmailForm({...emailForm, priority: val})}
                  options={["Normal", "High"]}
                  style={{ width: "100%" }}
                />
              </div>
            </div>

            <div style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid var(--border-color)", display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
              <button className="btn btn-outline" onClick={() => setIsEmailModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveEmail}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
