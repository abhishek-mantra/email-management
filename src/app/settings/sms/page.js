"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, X, Phone, Server, Tag, ShieldCheck, Search, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { useNotifications } from "@/context/NotificationContext";
import CustomSelect from "@/components/CustomSelect";

export default function SmsSettingsPage() {
  const { smsSettings, updateSmsSettings, selectedCompany } = useNotifications();
  const [activeTab, setActiveTab] = useState("number"); // 'number' | 'provider' | 'sender'
  const [searchQuery, setSearchQuery] = useState("");

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

  // Filtered lists
  const filteredNumbers = numbers.filter(n =>
    n.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.priority.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(n.id).includes(searchQuery)
  );

  const filteredProviders = providers.filter(p =>
    p.connectionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(p.id).includes(searchQuery)
  );

  const filteredSenderIds = senderIds.filter(s =>
    s.senderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.peId && s.peId.toLowerCase().includes(searchQuery.toLowerCase())) ||
    String(s.id).includes(searchQuery)
  );

  const primaryGateway = providers.length > 0 ? providers[0].provider : "Twilio";

  return (
    <div style={{ maxWidth: "1240px", margin: "0 auto", paddingBottom: "3rem" }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "800", fontFamily: "var(--font-display)", color: "var(--dark)", margin: 0, letterSpacing: "-0.025em" }}>SMS Settings</h1>
          <p style={{ color: "var(--text-muted)", margin: "0.25rem 0 0 0", fontSize: "0.875rem" }}>
            Sender IDs, gateway credentials, and phone numbers for {selectedCompany}
          </p>
        </div>
        {activeTab === "number" ? (
          <button className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem" }} onClick={() => openNumberModal()}>
            <Plus size={16} /> Add New Number
          </button>
        ) : activeTab === "provider" ? (
          <button className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem" }} onClick={() => openProviderModal()}>
            <Plus size={16} /> Connect Provider
          </button>
        ) : (
          <button className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem" }} onClick={() => openSenderIdModal()}>
            <Plus size={16} /> Add Sender ID
          </button>
        )}
      </div>

      {/* KPI Stat Capsules (Design_1.md Section 4.4) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", marginBottom: "1.75rem" }}>
        <div style={{ backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)", borderRadius: "1.25rem", border: "1px solid rgba(255,255,255,0.8)", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-subtle)", fontFamily: "var(--font-display)", margin: 0 }}>ACTIVE NUMBERS</p>
            <h3 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--dark)", fontFamily: "var(--font-display)", margin: "0.25rem 0 0 0", letterSpacing: "-0.02em" }}>{numbers.length}</h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "0.25rem 0 0 0" }}>Dispatched virtual lines</p>
          </div>
          <div style={{ width: "48px", height: "48px", borderRadius: "16px", backgroundColor: "rgba(20,86,240,0.08)", border: "1px solid rgba(20,86,240,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
            <Phone size={20} />
          </div>
        </div>

        <div style={{ backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)", borderRadius: "1.25rem", border: "1px solid rgba(255,255,255,0.8)", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-subtle)", fontFamily: "var(--font-display)", margin: 0 }}>CONNECTED PROVIDERS</p>
            <h3 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--dark)", fontFamily: "var(--font-display)", margin: "0.25rem 0 0 0", letterSpacing: "-0.02em" }}>{providers.length}</h3>
            <p style={{ fontSize: "12px", color: "#059669", margin: "0.25rem 0 0 0", fontWeight: 600 }}>Integrated SMS relays</p>
          </div>
          <div style={{ width: "48px", height: "48px", borderRadius: "16px", backgroundColor: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#059669" }}>
            <Server size={20} />
          </div>
        </div>

        <div style={{ backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)", borderRadius: "1.25rem", border: "1px solid rgba(255,255,255,0.8)", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-subtle)", fontFamily: "var(--font-display)", margin: 0 }}>APPROVED SENDER IDS</p>
            <h3 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--dark)", fontFamily: "var(--font-display)", margin: "0.25rem 0 0 0", letterSpacing: "-0.02em" }}>{senderIds.length}</h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "0.25rem 0 0 0" }}>DLT verified headers</p>
          </div>
          <div style={{ width: "48px", height: "48px", borderRadius: "16px", backgroundColor: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#7c3aed" }}>
            <Tag size={20} />
          </div>
        </div>

        <div style={{ backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)", borderRadius: "1.25rem", border: "1px solid rgba(255,255,255,0.8)", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-subtle)", fontFamily: "var(--font-display)", margin: 0 }}>PRIMARY GATEWAY</p>
            <h3 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--dark)", fontFamily: "var(--font-display)", margin: "0.25rem 0 0 0", letterSpacing: "-0.02em" }}>{primaryGateway}</h3>
            <p style={{ fontSize: "12px", color: "#0284c7", margin: "0.25rem 0 0 0", fontWeight: 600 }}>Default routing engine</p>
          </div>
          <div style={{ width: "48px", height: "48px", borderRadius: "16px", backgroundColor: "rgba(2,132,199,0.08)", border: "1px solid rgba(2,132,199,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#0284c7" }}>
            <ShieldCheck size={20} />
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
            className={activeTab === "number" ? "pill-option active" : "pill-option"}
            onClick={() => setActiveTab("number")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.45rem",
              background: activeTab === "number" ? "var(--navy-gradient)" : "transparent",
              color: activeTab === "number" ? "#ffffff" : "#45515e",
              boxShadow: activeTab === "number" ? "0 3px 10px rgba(24, 30, 37, 0.28)" : "none"
            }}
          >
            <Phone size={14} /> Numbers ({numbers.length})
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
          <button
            type="button"
            className={activeTab === "sender" ? "pill-option active" : "pill-option"}
            onClick={() => setActiveTab("sender")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.45rem",
              background: activeTab === "sender" ? "var(--navy-gradient)" : "transparent",
              color: activeTab === "sender" ? "#ffffff" : "#45515e",
              boxShadow: activeTab === "sender" ? "0 3px 10px rgba(24, 30, 37, 0.28)" : "none"
            }}
          >
            <Tag size={14} /> Sender IDs ({senderIds.length})
          </button>
        </div>

        {/* Search Filter Pill (Design_1.md Section 4.5) */}
        <div style={{ position: "relative", width: "320px" }}>
          <Search size={15} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input 
            type="text"
            placeholder={activeTab === "number" ? "Search numbers, priority..." : activeTab === "provider" ? "Search providers, connections..." : "Search sender IDs, routes..."}
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
        {activeTab === "number" && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
              <thead className="thead-dark">
                <tr style={{ textAlign: "left" }}>
                  <th style={{ padding: "1rem 1.25rem", fontSize: "0.75rem", textTransform: "uppercase" }}>ID</th>
                  <th style={{ padding: "1rem 1.25rem", fontSize: "0.75rem", textTransform: "uppercase" }}>Number</th>
                  <th style={{ padding: "1rem 1.25rem", fontSize: "0.75rem", textTransform: "uppercase" }}>Provider</th>
                  <th style={{ padding: "1rem 1.25rem", fontSize: "0.75rem", textTransform: "uppercase" }}>Priority & Coverage</th>
                  <th style={{ padding: "1rem 1.25rem", fontSize: "0.75rem", textTransform: "uppercase", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredNumbers.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                      {searchQuery ? `No numbers matching "${searchQuery}"` : "No phone numbers configured. Click Add New Number to register one."}
                    </td>
                  </tr>
                ) : filteredNumbers.map(num => {
                  const provider = providers.find(p => p.id === num.providerId);
                  return (
                    <tr 
                      key={num.id} 
                      style={{ borderBottom: "1px solid #f1f5f9", transition: "background-color 0.15s" }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"} 
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      <td style={{ padding: "1rem 1.25rem", fontWeight: "600", color: "var(--dark)", fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>#{num.id}</td>
                      <td style={{ padding: "1rem 1.25rem", color: "var(--primary)", fontWeight: "600", fontFamily: "var(--font-mono)" }}>{num.number}</td>
                      <td style={{ padding: "1rem 1.25rem", color: "var(--dark)", fontWeight: "500" }}>
                        <span style={{ padding: "0.25rem 0.65rem", backgroundColor: "rgba(20,86,240,0.06)", borderRadius: "8px", border: "1px solid rgba(20,86,240,0.12)", color: "var(--primary)", fontSize: "0.85rem", fontWeight: "600" }}>
                          {provider ? provider.connectionName : "Unknown"}
                        </span>
                      </td>
                      <td style={{ padding: "1rem 1.25rem" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                          <span style={{ padding: "0.25rem 0.75rem", backgroundColor: num.priority === "High" ? "#fee2e2" : "#f1f5f9", color: num.priority === "High" ? "#b91c1c" : "var(--dark)", borderRadius: "100px", fontSize: "0.78rem", fontWeight: "700", width: "fit-content", fontFamily: "var(--font-display)" }}>
                            {num.priority}
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "500" }}>{Array.isArray(num.country) ? num.country.join(", ") : (num.country || "India")}</span>
                        </div>
                      </td>
                      <td style={{ padding: "1rem 1.25rem", textAlign: "right" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                          <button className="btn btn-outline" style={{ padding: "0.35rem 0.65rem", height: "auto" }} onClick={() => openNumberModal(num)} title="Edit"><Edit size={15} /></button>
                          <button className="btn btn-outline" style={{ padding: "0.35rem 0.65rem", height: "auto", color: "var(--danger)", borderColor: "rgba(239, 68, 68, 0.3)" }} onClick={() => deleteNumber(num.id)} title="Delete"><Trash2 size={15} /></button>
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
                  <th style={{ padding: "1rem 1.25rem", fontSize: "0.75rem", textTransform: "uppercase" }}>Engine Provider</th>
                  <th style={{ padding: "1rem 1.25rem", fontSize: "0.75rem", textTransform: "uppercase", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProviders.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                      {searchQuery ? `No providers matching "${searchQuery}"` : "No SMS providers connected. Click Connect Provider to link Twilio, MSG91, or BulkSMS."}
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

        {activeTab === "sender" && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
              <thead className="thead-dark">
                <tr style={{ textAlign: "left" }}>
                  <th style={{ padding: "1rem 1.25rem", fontSize: "0.75rem", textTransform: "uppercase" }}>ID</th>
                  <th style={{ padding: "1rem 1.25rem", fontSize: "0.75rem", textTransform: "uppercase" }}>Route</th>
                  <th style={{ padding: "1rem 1.25rem", fontSize: "0.75rem", textTransform: "uppercase" }}>Sender ID</th>
                  <th style={{ padding: "1rem 1.25rem", fontSize: "0.75rem", textTransform: "uppercase" }}>PE ID (Entity ID)</th>
                  <th style={{ padding: "1rem 1.25rem", fontSize: "0.75rem", textTransform: "uppercase", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredSenderIds.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                      {searchQuery ? `No Sender IDs matching "${searchQuery}"` : "No Sender IDs configured. Click Add Sender ID to whitelist a DLT header."}
                    </td>
                  </tr>
                ) : filteredSenderIds.map(sender => (
                  <tr 
                    key={sender.id} 
                    style={{ borderBottom: "1px solid #f1f5f9", transition: "background-color 0.15s" }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"} 
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <td style={{ padding: "1rem 1.25rem", fontWeight: "600", color: "var(--dark)", fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>#{sender.id}</td>
                    <td style={{ padding: "1rem 1.25rem" }}>
                      <span style={{ padding: "0.25rem 0.75rem", backgroundColor: sender.route === "Transactional" ? "#e0e7ff" : "#fce7f3", color: sender.route === "Transactional" ? "#4f46e5" : "#db2777", borderRadius: "100px", fontSize: "0.78rem", fontWeight: "700", fontFamily: "var(--font-display)" }}>
                        {sender.route}
                      </span>
                    </td>
                    <td style={{ padding: "1rem 1.25rem", color: "var(--primary)", fontWeight: "700", fontSize: "1rem", letterSpacing: "1px", fontFamily: "var(--font-mono)" }}>{sender.senderId}</td>
                    <td style={{ padding: "1rem 1.25rem", color: "var(--text-main)", fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>{sender.peId || "—"}</td>
                    <td style={{ padding: "1rem 1.25rem", textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                        <button className="btn btn-outline" style={{ padding: "0.35rem 0.65rem", height: "auto" }} onClick={() => openSenderIdModal(sender)} title="Edit"><Edit size={15} /></button>
                        <button className="btn btn-outline" style={{ padding: "0.35rem 0.65rem", height: "auto", color: "var(--danger)", borderColor: "rgba(239, 68, 68, 0.3)" }} onClick={() => deleteSenderId(sender.id)} title="Delete"><Trash2 size={15} /></button>
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
              <h2 style={{ fontSize: "1.15rem", fontWeight: "700", fontFamily: "var(--font-display)", margin: 0, color: "var(--dark)" }}>{editingProvider ? "Edit SMS Provider" : "Connect SMS Provider"}</h2>
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
                  placeholder="e.g. Production Twilio Relay" 
                  value={providerForm.connectionName} 
                  onChange={e => setProviderForm({...providerForm, connectionName: e.target.value})} 
                  required
                />
              </div>

              <div className="input-group" style={{ margin: 0 }}>
                <label className="form-label">Engine Provider</label>
                <CustomSelect 
                  value={providerForm.provider} 
                  onChange={val => setProviderForm({...providerForm, provider: val})}
                  options={["Twilio", "MSG91", "BulkSMSGateway"]}
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <h3 style={{ fontSize: "0.95rem", fontWeight: "700", fontFamily: "var(--font-display)", color: "var(--dark)", margin: 0 }}>API & Authentication Credentials</h3>
                
                {providerForm.provider === "Twilio" && (
                  <>
                    <div className="input-group" style={{ margin: 0 }}>
                      <label className="form-label">Account SID</label>
                      <input type="text" className="form-control" placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" value={providerForm.accountSid} onChange={e => setProviderForm({...providerForm, accountSid: e.target.value})} />
                    </div>
                    <div className="input-group" style={{ margin: 0 }}>
                      <label className="form-label">Auth Token</label>
                      <input type="password" className="form-control" placeholder="••••••••••••••••••••••••••••••••" value={providerForm.authToken} onChange={e => setProviderForm({...providerForm, authToken: e.target.value})} />
                    </div>
                  </>
                )}

                {providerForm.provider === "MSG91" && (
                  <div className="input-group" style={{ margin: 0 }}>
                    <label className="form-label">Auth Token</label>
                    <input type="password" className="form-control" placeholder="msg91_auth_token_key" value={providerForm.authToken} onChange={e => setProviderForm({...providerForm, authToken: e.target.value})} />
                  </div>
                )}

                {providerForm.provider === "BulkSMSGateway" && (
                  <>
                    <div className="input-group" style={{ margin: 0 }}>
                      <label className="form-label">User Name</label>
                      <input type="text" className="form-control" placeholder="gateway_username" value={providerForm.userName} onChange={e => setProviderForm({...providerForm, userName: e.target.value})} />
                    </div>
                    <div className="input-group" style={{ margin: 0 }}>
                      <label className="form-label">Password</label>
                      <input type="password" className="form-control" placeholder="••••••••" value={providerForm.password} onChange={e => setProviderForm({...providerForm, password: e.target.value})} />
                    </div>
                  </>
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

      {/* Number Modal */}
      {isNumberModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15, 23, 42, 0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)", padding: "1rem" }} onClick={() => setIsNumberModalOpen(false)}>
          <div style={{ width: "100%", maxWidth: "480px", backgroundColor: "rgba(255,255,255,0.95)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.8)", borderRadius: "1.75rem", boxShadow: "0 24px 60px -12px rgba(15, 23, 42, 0.35)", display: "flex", flexDirection: "column", overflow: "hidden" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "1.25rem 1.5rem", backgroundColor: "rgba(248,250,252,0.85)", borderBottom: "1px solid rgba(226, 232, 240, 0.9)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "1.15rem", fontWeight: "700", fontFamily: "var(--font-display)", margin: 0, color: "var(--dark)" }}>{editingNumber ? "Edit Phone Number" : "Add New Phone Number"}</h2>
              <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }} onClick={() => setIsNumberModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div className="input-group" style={{ margin: 0 }}>
                <label className="form-label">Phone Number *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="+1 (555) 000-0000" 
                  value={numberForm.number} 
                  onChange={e => setNumberForm({...numberForm, number: e.target.value})} 
                  required
                />
              </div>

              <div className="input-group" style={{ margin: 0 }}>
                <label className="form-label">Connected SMS Provider *</label>
                <CustomSelect 
                  value={numberForm.providerId} 
                  onChange={val => setNumberForm({...numberForm, providerId: val})}
                  placeholder="Select Provider"
                  options={providers.map(p => ({ value: p.id, label: `${p.connectionName} (${p.provider})` }))}
                  style={{ width: "100%" }}
                />
              </div>

              <div className="input-group" style={{ margin: 0 }}>
                <label className="form-label">Priority Routing</label>
                <CustomSelect 
                  value={numberForm.priority} 
                  onChange={val => setNumberForm({...numberForm, priority: val})}
                  options={["Normal", "High"]}
                  style={{ width: "100%" }}
                />
              </div>

              <div className="input-group" style={{ margin: 0 }}>
                <label className="form-label">Allowed Countries</label>
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

            <div style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid var(--border-color)", display: "flex", justifyContent: "flex-end", gap: "0.75rem", backgroundColor: "rgba(248, 250, 252, 0.85)" }}>
              <button className="btn btn-outline" onClick={() => setIsNumberModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveNumber}>Save Number</button>
            </div>
          </div>
        </div>
      )}

      {/* Sender ID Modal */}
      {isSenderIdModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15, 23, 42, 0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)", padding: "1rem" }} onClick={() => setIsSenderIdModalOpen(false)}>
          <div style={{ width: "100%", maxWidth: "480px", backgroundColor: "rgba(255,255,255,0.95)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.8)", borderRadius: "1.75rem", boxShadow: "0 24px 60px -12px rgba(15, 23, 42, 0.35)", display: "flex", flexDirection: "column", overflow: "hidden" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "1.25rem 1.5rem", backgroundColor: "rgba(248,250,252,0.85)", borderBottom: "1px solid rgba(226, 232, 240, 0.9)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "1.15rem", fontWeight: "700", fontFamily: "var(--font-display)", margin: 0, color: "var(--dark)" }}>{editingSenderId ? "Edit Sender ID" : "Register Sender ID"}</h2>
              <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }} onClick={() => setIsSenderIdModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: "0.85rem" }}>DLT Route</label>
                <div style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", cursor: "pointer" }}>
                    <input type="radio" name="routeSettings" checked={senderIdForm.route === "Transactional"} onChange={() => setSenderIdForm({ ...senderIdForm, route: "Transactional" })} style={{ accentColor: "var(--primary)" }} /> Transactional
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", cursor: "pointer" }}>
                    <input type="radio" name="routeSettings" checked={senderIdForm.route === "Promotional"} onChange={() => setSenderIdForm({ ...senderIdForm, route: "Promotional" })} style={{ accentColor: "var(--primary)" }} /> Promotional
                  </label>
                </div>
              </div>

              <div className="input-group" style={{ margin: 0 }}>
                <label className="form-label">Sender ID (Header) *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. MANTRA" 
                  value={senderIdForm.senderId} 
                  onChange={e => setSenderIdForm({...senderIdForm, senderId: e.target.value.toUpperCase()})}
                  maxLength={6}
                  style={{ textTransform: "uppercase", letterSpacing: "1px", fontWeight: "700", fontFamily: "var(--font-mono)" }}
                  required
                />
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>Must be exactly 6 alphabetic characters registered on telecom portal.</span>
              </div>

              <div className="input-group" style={{ margin: 0 }}>
                <label className="form-label">Principal Entity ID (PE ID)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. 170115890000000" 
                  value={senderIdForm.peId} 
                  onChange={e => setSenderIdForm({...senderIdForm, peId: e.target.value})} 
                  style={{ fontFamily: "var(--font-mono)" }}
                />
              </div>
            </div>

            <div style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid var(--border-color)", display: "flex", justifyContent: "flex-end", gap: "0.75rem", backgroundColor: "rgba(248, 250, 252, 0.85)" }}>
              <button className="btn btn-outline" onClick={() => setIsSenderIdModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveSenderId}>Save Sender ID</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
