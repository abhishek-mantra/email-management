"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, X, Phone, Server, Tag } from "lucide-react";
import toast from "react-hot-toast";
import { useNotifications } from "@/context/NotificationContext";
import CustomSelect from "@/components/CustomSelect";

export default function SmsSettingsPage() {
  const { smsSettings, updateSmsSettings, selectedCompany } = useNotifications();
  const [activeTab, setActiveTab] = useState("number"); // 'number' | 'provider'

  const providers = smsSettings?.providers || [];
  const numbers = smsSettings?.numbers || [];
  const senderIds = smsSettings?.senderIds || [];

  const setProviders = (newProviders) => {
    updateSmsSettings({ ...(smsSettings || {}), providers: newProviders });
  };

  const setNumbers = (newNumbers) => {
    updateSmsSettings({ ...(smsSettings || {}), numbers: newNumbers });
  };

  const setSenderIds = (newSenderIds) => {
    updateSmsSettings({ ...(smsSettings || {}), senderIds: newSenderIds });
  };

  // Modals State
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);

  const [isNumberModalOpen, setIsNumberModalOpen] = useState(false);
  const [editingNumber, setEditingNumber] = useState(null);

  const [isSenderIdModalOpen, setIsSenderIdModalOpen] = useState(false);
  const [editingSenderId, setEditingSenderId] = useState(null);

  // Form States
  const [providerForm, setProviderForm] = useState({ connectionName: "", provider: "Twilio", accountSid: "", authToken: "", userName: "", password: "" });
  const [numberForm, setNumberForm] = useState({ number: "", providerId: "", priority: "Normal", country: ["India"] });
  const [senderIdForm, setSenderIdForm] = useState({ route: "Transactional", senderId: "", peId: "" });

  // Handlers for Provider
  const openProviderModal = (provider = null) => {
    if (provider) {
      setEditingProvider(provider);
      setProviderForm({
        connectionName: provider.connectionName,
        provider: provider.provider,
        accountSid: provider.details.accountSid || "",
        authToken: provider.details.authToken || "",
        userName: provider.details.userName || "",
        password: provider.details.password || ""
      });
    } else {
      setEditingProvider(null);
      setProviderForm({ connectionName: "", provider: "Twilio", accountSid: "", authToken: "", userName: "", password: "" });
    }
    setIsProviderModalOpen(true);
  };

  const saveProvider = () => {
    if (!providerForm.connectionName || !providerForm.provider) {
      toast.error("Please fill required fields");
      return;
    }

    let details = {};
    if (providerForm.provider === "Twilio") details = { accountSid: providerForm.accountSid, authToken: providerForm.authToken };
    if (providerForm.provider === "MSG91") details = { authToken: providerForm.authToken };
    if (providerForm.provider === "BulkSMSGateway") details = { userName: providerForm.userName, password: providerForm.password };

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

  // Handlers for Number
  const openNumberModal = (numberObj = null) => {
    if (numberObj) {
      setEditingNumber(numberObj);
      setNumberForm({ number: numberObj.number, providerId: numberObj.providerId, priority: numberObj.priority, country: Array.isArray(numberObj.country) ? numberObj.country : (numberObj.country ? [numberObj.country] : ["India"]) });
    } else {
      setEditingNumber(null);
      setNumberForm({ number: "", providerId: providers.length > 0 ? providers[0].id : "", priority: "Normal", country: ["India"] });
    }
    setIsNumberModalOpen(true);
  };

  const saveNumber = () => {
    if (!numberForm.number || !numberForm.providerId) {
      toast.error("Please fill required fields");
      return;
    }
    if (editingNumber) {
      setNumbers(numbers.map(n => n.id === editingNumber.id ? { ...n, ...numberForm, providerId: Number(numberForm.providerId) } : n));
      toast.success("Number updated");
    } else {
      const newId = numbers.length > 0 ? Math.max(...numbers.map(n => n.id)) + 1 : 1;
      setNumbers([...numbers, { id: newId, ...numberForm, providerId: Number(numberForm.providerId) }]);
      toast.success("Number added");
    }
    setIsNumberModalOpen(false);
  };

  const deleteNumber = (id) => {
    setNumbers(numbers.filter(n => n.id !== id));
    toast.success("Number deleted");
  };

  // Handlers for Sender ID
  const openSenderIdModal = (senderObj = null) => {
    if (senderObj) {
      setEditingSenderId(senderObj);
      setSenderIdForm({ route: senderObj.route, senderId: senderObj.senderId, peId: senderObj.peId });
    } else {
      setEditingSenderId(null);
      setSenderIdForm({ route: "Transactional", senderId: "", peId: "" });
    }
    setIsSenderIdModalOpen(true);
  };

  const saveSenderId = () => {
    if (!senderIdForm.senderId) {
      toast.error("Please enter a Sender ID");
      return;
    }
    if (editingSenderId) {
      setSenderIds(senderIds.map(s => s.id === editingSenderId.id ? { ...s, ...senderIdForm } : s));
      toast.success("Sender ID updated");
    } else {
      const newId = senderIds.length > 0 ? Math.max(...senderIds.map(s => s.id)) + 1 : 1;
      setSenderIds([...senderIds, { id: newId, ...senderIdForm }]);
      toast.success("Sender ID added");
    }
    setIsSenderIdModalOpen(false);
  };

  const deleteSenderId = (id) => {
    setSenderIds(senderIds.filter(s => s.id !== id));
    toast.success("Sender ID deleted");
  };

  return (
    <div style={{ padding: "0 2rem 2rem 2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "600", color: "var(--dark)", margin: 0 }}>SMS Settings</h1>
          <p style={{ color: "var(--text-muted)", margin: "0.25rem 0 0 0", fontSize: "0.9rem" }}>Configuring for {selectedCompany}</p>
        </div>
        {activeTab === "number" ? (
          <button className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }} onClick={() => openNumberModal()}>
            <span>Add New Number</span> <Plus size={18} />
          </button>
        ) : activeTab === "provider" ? (
          <button className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }} onClick={() => openProviderModal()}>
            <span>Connect Provider</span> <Plus size={18} />
          </button>
        ) : (
          <button className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }} onClick={() => openSenderIdModal()}>
            <span>Add Sender ID</span> <Plus size={18} />
          </button>
        )}
      </div>

      <div style={{ display: "flex", borderBottom: "1px solid var(--border-color)", marginBottom: "2rem" }}>
        <button 
          style={{ padding: "1rem 1.5rem", background: "none", border: "none", borderBottom: activeTab === "number" ? "2px solid #1a73e8" : "2px solid transparent", color: activeTab === "number" ? "#1a73e8" : "var(--text-muted)", fontWeight: activeTab === "number" ? "600" : "500", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}
          onClick={() => setActiveTab("number")}
        >
          <Phone size={16} /> Numbers
        </button>
        <button 
          style={{ padding: "1rem 1.5rem", background: "none", border: "none", borderBottom: activeTab === "provider" ? "2px solid #1a73e8" : "2px solid transparent", color: activeTab === "provider" ? "#1a73e8" : "var(--text-muted)", fontWeight: activeTab === "provider" ? "600" : "500", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}
          onClick={() => setActiveTab("provider")}
        >
          <Server size={16} /> Providers
        </button>
        <button 
          style={{ padding: "1rem 1.5rem", background: "none", border: "none", borderBottom: activeTab === "sender" ? "2px solid #1a73e8" : "2px solid transparent", color: activeTab === "sender" ? "#1a73e8" : "var(--text-muted)", fontWeight: activeTab === "sender" ? "600" : "500", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}
          onClick={() => setActiveTab("sender")}
        >
          <Tag size={16} /> Sender ID
        </button>
      </div>

      <div className="card" style={{ padding: "1.5rem" }}>
        {activeTab === "number" && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border-color)", textAlign: "left" }}>
                  <th style={{ padding: "1rem", fontSize: "0.85rem", color: "#64748b", textTransform: "uppercase" }}>ID</th>
                  <th style={{ padding: "1rem", fontSize: "0.85rem", color: "#64748b", textTransform: "uppercase" }}>Number</th>
                  <th style={{ padding: "1rem", fontSize: "0.85rem", color: "#64748b", textTransform: "uppercase" }}>Provider</th>
                  <th style={{ padding: "1rem", fontSize: "0.85rem", color: "#64748b", textTransform: "uppercase" }}>Priority</th>
                  <th style={{ padding: "1rem", fontSize: "0.85rem", color: "#64748b", textTransform: "uppercase", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {numbers.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>No Numbers configured</td>
                  </tr>
                ) : numbers.map(num => {
                  const provider = providers.find(p => p.id === num.providerId);
                  return (
                    <tr key={num.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "1rem", fontWeight: "500", color: "var(--dark)" }}>{num.id}</td>
                      <td style={{ padding: "1rem", color: "var(--primary)", fontWeight: "500" }}>{num.number}</td>
                      <td style={{ padding: "1rem", color: "var(--text-main)" }}>{provider ? provider.connectionName : "Unknown"}</td>
                      <td style={{ padding: "1rem" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                          <span style={{ padding: "0.25rem 0.75rem", backgroundColor: num.priority === "High" ? "#fee2e2" : "#f1f5f9", color: num.priority === "High" ? "#b91c1c" : "var(--dark)", borderRadius: "100px", fontSize: "0.8rem", fontWeight: "600", width: "fit-content" }}>
                            {num.priority}
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "500" }}>{Array.isArray(num.country) ? num.country.join(", ") : (num.country || "India")}</span>
                        </div>
                      </td>
                      <td style={{ padding: "1rem", textAlign: "right" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                          <button className="btn btn-outline" style={{ padding: "0.25rem 0.5rem" }} onClick={() => openNumberModal(num)}><Edit size={16} /></button>
                          <button className="btn btn-outline" style={{ padding: "0.25rem 0.5rem", color: "var(--danger)", borderColor: "transparent" }} onClick={() => deleteNumber(num.id)}><Trash2 size={16} /></button>
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

        {activeTab === "sender" && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border-color)", textAlign: "left" }}>
                  <th style={{ padding: "1rem", fontSize: "0.85rem", color: "#64748b", textTransform: "uppercase" }}>ID</th>
                  <th style={{ padding: "1rem", fontSize: "0.85rem", color: "#64748b", textTransform: "uppercase" }}>Route</th>
                  <th style={{ padding: "1rem", fontSize: "0.85rem", color: "#64748b", textTransform: "uppercase" }}>Sender ID</th>
                  <th style={{ padding: "1rem", fontSize: "0.85rem", color: "#64748b", textTransform: "uppercase" }}>PE ID (Entity ID)</th>
                  <th style={{ padding: "1rem", fontSize: "0.85rem", color: "#64748b", textTransform: "uppercase", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {senderIds.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>No Sender IDs configured</td>
                  </tr>
                ) : senderIds.map(sender => (
                  <tr key={sender.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "1rem", fontWeight: "500", color: "var(--dark)" }}>{sender.id}</td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{ padding: "0.25rem 0.75rem", backgroundColor: sender.route === "Transactional" ? "#e0e7ff" : "#fce7f3", color: sender.route === "Transactional" ? "#4f46e5" : "#db2777", borderRadius: "100px", fontSize: "0.8rem", fontWeight: "600" }}>
                        {sender.route}
                      </span>
                    </td>
                    <td style={{ padding: "1rem", color: "var(--primary)", fontWeight: "600", fontSize: "1rem", letterSpacing: "1px" }}>{sender.senderId}</td>
                    <td style={{ padding: "1rem", color: "var(--text-main)", fontFamily: "monospace" }}>{sender.peId || "-"}</td>
                    <td style={{ padding: "1rem", textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                        <button className="btn btn-outline" style={{ padding: "0.25rem 0.5rem" }} onClick={() => openSenderIdModal(sender)}><Edit size={16} /></button>
                        <button className="btn btn-outline" style={{ padding: "0.25rem 0.5rem", color: "var(--danger)", borderColor: "transparent" }} onClick={() => deleteSenderId(sender.id)}><Trash2 size={16} /></button>
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
                  placeholder="e.g. Marketing Twilio" 
                  value={providerForm.connectionName} 
                  onChange={e => setProviderForm({...providerForm, connectionName: e.target.value})} 
                />
              </div>

              <div className="input-group">
                <label className="form-label">Provider</label>
                <CustomSelect 
                  value={providerForm.provider} 
                  onChange={val => setProviderForm({...providerForm, provider: val})}
                  options={["Twilio", "MSG91", "BulkSMSGateway"]}
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1.5rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1rem" }}>Key Details</h3>
                
                {providerForm.provider === "Twilio" && (
                  <>
                    <div className="input-group">
                      <label className="form-label">Account SID</label>
                      <input type="text" className="form-control" value={providerForm.accountSid} onChange={e => setProviderForm({...providerForm, accountSid: e.target.value})} />
                    </div>
                    <div className="input-group">
                      <label className="form-label">Auth Token</label>
                      <input type="password" className="form-control" value={providerForm.authToken} onChange={e => setProviderForm({...providerForm, authToken: e.target.value})} />
                    </div>
                  </>
                )}

                {providerForm.provider === "MSG91" && (
                  <div className="input-group">
                    <label className="form-label">Auth Token</label>
                    <input type="password" className="form-control" value={providerForm.authToken} onChange={e => setProviderForm({...providerForm, authToken: e.target.value})} />
                  </div>
                )}

                {providerForm.provider === "BulkSMSGateway" && (
                  <>
                    <div className="input-group">
                      <label className="form-label">User Name</label>
                      <input type="text" className="form-control" value={providerForm.userName} onChange={e => setProviderForm({...providerForm, userName: e.target.value})} />
                    </div>
                    <div className="input-group">
                      <label className="form-label">Password</label>
                      <input type="password" className="form-control" value={providerForm.password} onChange={e => setProviderForm({...providerForm, password: e.target.value})} />
                    </div>
                  </>
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

      {/* Number Modal */}
      {isNumberModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15, 23, 42, 0.4)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setIsNumberModalOpen(false)}>
          <div style={{ width: "450px", backgroundColor: "white", borderRadius: "8px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "600", margin: 0, color: "var(--dark)" }}>{editingNumber ? "Edit Number" : "Add New Number"}</h2>
              <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }} onClick={() => setIsNumberModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: "1.5rem" }}>
              <div className="input-group">
                <label className="form-label">Phone Number</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. +1234567890" 
                  value={numberForm.number} 
                  onChange={e => setNumberForm({...numberForm, number: e.target.value})} 
                />
              </div>

              <div className="input-group">
                <label className="form-label">Provider</label>
                <CustomSelect 
                  value={numberForm.providerId} 
                  onChange={val => setNumberForm({...numberForm, providerId: val})}
                  placeholder="Select Provider"
                  options={providers.map(p => ({ value: p.id, label: `${p.connectionName} (${p.provider})` }))}
                  style={{ width: "100%" }}
                />
              </div>

              <div className="input-group">
                <label className="form-label">Priority</label>
                <CustomSelect 
                  value={numberForm.priority} 
                  onChange={val => setNumberForm({...numberForm, priority: val})}
                  options={["Normal", "High"]}
                  style={{ width: "100%" }}
                />
              </div>

              <div className="input-group">
                <label className="form-label">Allowed Country</label>
                <CustomSelect 
                  value={numberForm.country} 
                  onChange={val => setNumberForm({...numberForm, country: val})}
                  options={["India", "USA", "UK", "Australia", "Global"]}
                  style={{ width: "100%" }}
                  isMulti={true}
                  hasSearch={true}
                />
              </div>
            </div>

            <div style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid var(--border-color)", display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
              <button className="btn btn-outline" onClick={() => setIsNumberModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveNumber}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Sender ID Modal */}
      {isSenderIdModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15, 23, 42, 0.4)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setIsSenderIdModalOpen(false)}>
          <div style={{ width: "450px", backgroundColor: "white", borderRadius: "8px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "600", margin: 0, color: "var(--dark)" }}>{editingSenderId ? "Edit Sender ID" : "Add Sender ID"}</h2>
              <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }} onClick={() => setIsSenderIdModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label className="form-label">Route</label>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", cursor: "pointer" }}>
                    <input type="radio" name="routeSettings" checked={senderIdForm.route === "Transactional"} onChange={() => setSenderIdForm({ ...senderIdForm, route: "Transactional" })} style={{ accentColor: "var(--primary)" }} /> Transactional
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", cursor: "pointer" }}>
                    <input type="radio" name="routeSettings" checked={senderIdForm.route === "Promotional"} onChange={() => setSenderIdForm({ ...senderIdForm, route: "Promotional" })} style={{ accentColor: "var(--primary)" }} /> Promotional
                  </label>
                </div>
              </div>

              <div className="input-group">
                <label className="form-label">Sender ID</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. MANTRA" 
                  value={senderIdForm.senderId} 
                  onChange={e => setSenderIdForm({...senderIdForm, senderId: e.target.value.toUpperCase()})}
                  maxLength={6}
                />
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>Must be exactly 6 alphabetic characters (e.g. MANTRA).</span>
              </div>

              <div className="input-group">
                <label className="form-label">PE ID (Entity ID)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Add PE ID" 
                  value={senderIdForm.peId} 
                  onChange={e => setSenderIdForm({...senderIdForm, peId: e.target.value})} 
                />
              </div>
            </div>

            <div style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid var(--border-color)", display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
              <button className="btn btn-outline" onClick={() => setIsSenderIdModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveSenderId}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
