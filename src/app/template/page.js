"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Mail, MessageSquare, MoreVertical, X, Smartphone, Bold, Italic, Underline, Link as LinkIcon, List, Heading, Trash2, Eye, Send, Monitor, Smartphone as PhoneIcon } from "lucide-react";
import { useNotifications } from "@/context/NotificationContext";
import CustomSelect from "@/components/CustomSelect";
import toast from "react-hot-toast";

// Lightweight Rich Text Editor
const RichTextEditor = ({ value, onChange }) => {
  const [mode, setMode] = useState("visual");
  const editorRef = useRef(null);

  // Sync content when value changes externally (e.g. on load)
  useEffect(() => {
    if (mode === "visual" && editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value, mode]);

  const execCommand = (command, val = null) => {
    document.execCommand(command, false, val);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = (e) => {
    onChange(e.currentTarget.innerHTML);
  };

  return (
    <div style={{ border: "1px solid var(--border-color)", borderRadius: "8px", overflow: "hidden", backgroundColor: "white", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", padding: "0.5rem", backgroundColor: "#f8fafc" }}>
        {/* Toolbar */}
        <div style={{ display: "flex", gap: "0.25rem", opacity: mode === "visual" ? 1 : 0.5, pointerEvents: mode === "visual" ? "auto" : "none" }}>
          <button type="button" onClick={() => execCommand("bold")} style={{ padding: "0.25rem", background: "none", border: "none", cursor: "pointer", color: "var(--dark)", borderRadius: "4px" }}><Bold size={16} /></button>
          <button type="button" onClick={() => execCommand("italic")} style={{ padding: "0.25rem", background: "none", border: "none", cursor: "pointer", color: "var(--dark)", borderRadius: "4px" }}><Italic size={16} /></button>
          <button type="button" onClick={() => execCommand("underline")} style={{ padding: "0.25rem", background: "none", border: "none", cursor: "pointer", color: "var(--dark)", borderRadius: "4px" }}><Underline size={16} /></button>
          <div style={{ width: "1px", backgroundColor: "var(--border-color)", margin: "0 0.25rem" }}></div>
          <button type="button" onClick={() => execCommand("insertUnorderedList")} style={{ padding: "0.25rem", background: "none", border: "none", cursor: "pointer", color: "var(--dark)", borderRadius: "4px" }}><List size={16} /></button>
          <button type="button" onClick={() => {
            const url = prompt("Enter URL:");
            if (url) execCommand("createLink", url);
          }} style={{ padding: "0.25rem", background: "none", border: "none", cursor: "pointer", color: "var(--dark)", borderRadius: "4px" }}><LinkIcon size={16} /></button>
          <div style={{ width: "1px", backgroundColor: "var(--border-color)", margin: "0 0.25rem" }}></div>
          <CustomSelect
            value="Variables"
            onChange={(val) => {
              if (val !== "Variables") {
                execCommand("insertText", `{{${val}}}`);
              }
            }}
            options={["Variables", "client_name", "provider_name", "session_date"]}
            style={{ width: "120px", padding: "0.25rem", fontSize: "0.8rem", minHeight: "28px" }}
          />
        </div>

        {/* Mode Toggle */}
        <div style={{ display: "flex", border: "1px solid var(--border-color)", borderRadius: "4px", overflow: "hidden", fontSize: "0.8rem", fontWeight: "500" }}>
          <button type="button" onClick={() => setMode("visual")} style={{ padding: "0.25rem 0.75rem", background: mode === "visual" ? "var(--primary)" : "white", color: mode === "visual" ? "white" : "var(--dark)", border: "none", cursor: "pointer" }}>Visual</button>
          <button type="button" onClick={() => setMode("code")} style={{ padding: "0.25rem 0.75rem", background: mode === "code" ? "var(--primary)" : "white", color: mode === "code" ? "white" : "var(--dark)", border: "none", borderLeft: "1px solid var(--border-color)", cursor: "pointer" }}>Code</button>
        </div>
      </div>

      <div style={{ padding: "0", flex: 1, display: "flex", flexDirection: "column", minHeight: "250px" }}>
        {mode === "visual" ? (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            style={{ padding: "1rem", outline: "none", flex: 1, overflowY: "auto", color: "var(--text-main)", lineHeight: "1.6" }}
          />
        ) : (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{ padding: "1rem", border: "none", outline: "none", flex: 1, resize: "none", fontFamily: "monospace", fontSize: "0.9rem", color: "var(--text-main)" }}
          />
        )}
      </div>
    </div>
  );
};

export default function TemplatePage() {
  const { templates, notifications, selectedCompany, addTemplate, updateTemplate, deleteTemplate, smsSettings, updateSmsSettings } = useNotifications();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("email");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [previewDevice, setPreviewDevice] = useState("desktop"); // "desktop" | "mobile"
  const [editingTemplateName, setEditingTemplateName] = useState(null); // null if creating new
  const [formData, setFormData] = useState({ 
    name: "", subject: "", email: "", pushContent: "",
    smsTwilioEnabled: false, smsTwilioContent: "",
    smsMsg91Enabled: false, smsMsg91TemplateId: "", smsMsg91Content: "", smsMsg91Language: "English",
    smsBulkEnabled: false, smsBulkTemplateId: "", smsBulkContent: "", smsBulkLanguage: "English"
  });

  const getUsedInCount = (templateName, templateEmail) => {
    if (!notifications) return 0;
    return notifications.filter(n => 
      n.templateName === templateName || 
      n.name === templateName || 
      (templateEmail && n.emailContent === templateEmail)
    ).length;
  };

  const handleSendTest = (template, e) => {
    if (e) e.stopPropagation();
    toast.success(`Test email dispatched for "${template.name}" to QA test recipient.`);
  };

  const sampleMap = {
    client_name: "Jordan Lee",
    provider_name: "Dr. Amara Singh",
    session_date: "Aug 20, 2026",
    session_time: "10:30 AM",
    number: "+1 (800) 555-0199",
    credits: "250",
    member_name: "Alex Taylor"
  };

  const renderSubstitutedEmail = (htmlContent) => {
    if (!htmlContent) return "<p style='color:#64748b;font-style:italic;'>No email HTML configured for this template.</p>";
    let result = htmlContent;
    Object.entries(sampleMap).forEach(([key, val]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
      result = result.replace(regex, `<span style="background-color:#fef08a;color:#854d0e;padding:1px 5px;border-radius:3px;font-weight:600;">${val}</span>`);
    });
    return result;
  };

  const renderSubstitutedText = (text) => {
    if (!text) return "";
    let result = text;
    Object.entries(sampleMap).forEach(([key, val]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
      result = result.replace(regex, val);
    });
    return result;
  };
  
  const [expandedSms, setExpandedSms] = useState("Twilio");
  const [showAddSenderId, setShowAddSenderId] = useState(false);
  const [newSenderIdForm, setNewSenderIdForm] = useState({ route: "Transactional", senderId: "", peId: "" });

  const existingSenderIds = smsSettings?.senderIds || [];
  const defaultSenderId = existingSenderIds.length > 0 ? existingSenderIds[0].senderId : (smsSettings?.providers?.[0]?.connectionName || "MTRSMS");
  const senderIdOptions = [
    ...existingSenderIds.map(s => s.senderId),
    defaultSenderId,
    { value: "ADD_NEW", label: <span style={{ color: "var(--primary)", display: "flex", alignItems: "center", gap: "0.25rem" }}><Plus size={14} /> Add Sender ID</span> }
  ].filter((v, i, a) => a.indexOf(v) === i || typeof v === "object"); // Deduplicate string values

  const handleAddSenderIdSubmit = () => {
    if (!newSenderIdForm.senderId) {
      alert("Please enter a Sender ID");
      return;
    }
    const newId = existingSenderIds.length > 0 ? Math.max(...existingSenderIds.map(s => s.id)) + 1 : 1;
    const newSenderIdObj = { id: newId, ...newSenderIdForm };
    updateSmsSettings({ ...(smsSettings || {}), senderIds: [...existingSenderIds, newSenderIdObj] });
    setShowAddSenderId(false);
    setNewSenderIdForm({ route: "Transactional", senderId: "", peId: "" });
  };

  const templatesList = Object.entries(templates).map(([name, data]) => ({
    name,
    ...data
  })).filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.subject.toLowerCase().includes(searchQuery.toLowerCase()));

  const openCreateModal = () => {
    setEditingTemplateName(null);
    setFormData({ 
      name: "", subject: "", email: "", pushContent: "",
      smsTwilioEnabled: false, smsTwilioContent: "",
      smsMsg91Enabled: false, smsMsg91TemplateId: "", smsMsg91Content: "", smsMsg91Language: "English",
      smsBulkEnabled: false, smsBulkTemplateId: "", smsBulkContent: "", smsBulkLanguage: "English"
    });
    setActiveTab("email");
    setExpandedSms("Twilio");
    setIsModalOpen(true);
  };

  const openEditModal = (template) => {
    setEditingTemplateName(template.name);
    setFormData({ 
      name: template.name, subject: template.subject, email: template.email, pushContent: template.pushContent || "",
      smsTwilioEnabled: template.smsTwilioEnabled || false, smsTwilioContent: template.smsTwilioContent || template.text || "",
      smsMsg91Enabled: template.smsMsg91Enabled || false, smsMsg91TemplateId: template.smsMsg91TemplateId || template.dltTemplateId || "", smsMsg91Content: template.smsMsg91Content || template.text || "", smsMsg91Language: template.smsMsg91Language || "English",
      smsBulkEnabled: template.smsBulkEnabled || false, smsBulkTemplateId: template.smsBulkTemplateId || template.dltTemplateId || "", smsBulkContent: template.smsBulkContent || template.text || "", smsBulkLanguage: template.smsBulkLanguage || "English"
    });
    setActiveTab("email");
    setExpandedSms("Twilio");
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) return alert("Template Name is required.");
    
    // Save backwards compatibility text for list view (just take the first enabled one's text)
    const textPreview = formData.smsTwilioEnabled ? formData.smsTwilioContent : (formData.smsMsg91Enabled ? formData.smsMsg91Content : formData.smsBulkContent);

    const templateData = { 
      subject: formData.subject, email: formData.email, text: textPreview, pushContent: formData.pushContent,
      smsTwilioEnabled: formData.smsTwilioEnabled, smsTwilioContent: formData.smsTwilioContent,
      smsMsg91Enabled: formData.smsMsg91Enabled, smsMsg91TemplateId: formData.smsMsg91TemplateId, smsMsg91Content: formData.smsMsg91Content, smsMsg91Language: formData.smsMsg91Language,
      smsBulkEnabled: formData.smsBulkEnabled, smsBulkTemplateId: formData.smsBulkTemplateId, smsBulkContent: formData.smsBulkContent, smsBulkLanguage: formData.smsBulkLanguage
    };

    if (editingTemplateName) {
      updateTemplate(editingTemplateName, formData.name, templateData);
    } else {
      addTemplate(formData.name, templateData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (name, e) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete the "${name}" template?`)) {
      deleteTemplate(name);
    }
  };

  return (
    <div style={{ padding: "0 2rem 2rem 2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "600", color: "var(--dark)", margin: 0 }}>Notification Templates</h1>
          <p style={{ color: "var(--text-muted)", margin: "0.25rem 0 0 0", fontSize: "0.9rem" }}>Showing templates for {selectedCompany}</p>
        </div>
      </div>

      <div className="card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div style={{ position: "relative", width: "300px" }}>
            <input 
              type="text" 
              placeholder="Search templates..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: "100%", padding: "0.6rem 1rem 0.6rem 2.5rem", borderRadius: "6px", border: "1px solid var(--border-color)", outline: "none", fontSize: "0.9rem" }}
            />
            <svg style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <CustomSelect
              value="All Types"
              onChange={() => {}}
              options={["All Types", "Email", "SMS / App"]}
              style={{ width: "150px" }}
            />
            <button className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }} onClick={openCreateModal}>
              <Plus size={18} /> Create Template
            </button>
          </div>
        </div>

        {templatesList.length === 0 ? (
          <div style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>
            No templates found matching &quot;{searchQuery}&quot;
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
            {templatesList.map((template, idx) => {
              const usedCount = getUsedInCount(template.name, template.email);
              return (
                <div 
                  key={idx} 
                  style={{ border: "1px solid var(--border-color)", borderRadius: "8px", overflow: "hidden", backgroundColor: "white", transition: "box-shadow 0.2s, transform 0.2s", cursor: "pointer", display: "flex", flexDirection: "column" }} 
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)"; e.currentTarget.style.transform = "translateY(-2px)"; }} 
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}
                  onClick={() => openEditModal(template)}
                >
                  <div style={{ padding: "1.25rem", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "600", color: "var(--dark)", marginBottom: "0.5rem" }}>{template.name}</h3>
                      <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: "500", color: "#64748b", display: "flex", alignItems: "center", gap: "0.25rem", backgroundColor: "#f1f5f9", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>
                          <Mail size={12} /> Email
                        </span>
                        <span style={{ fontSize: "0.75rem", fontWeight: "500", color: "#64748b", display: "flex", alignItems: "center", gap: "0.25rem", backgroundColor: "#f1f5f9", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>
                          <MessageSquare size={12} /> SMS / App
                        </span>
                        <span style={{ 
                          fontSize: "0.72rem", 
                          fontWeight: "600", 
                          color: usedCount > 0 ? "var(--primary)" : "#64748b", 
                          backgroundColor: usedCount > 0 ? "var(--primary-light)" : "#f1f5f9", 
                          padding: "0.2rem 0.55rem", 
                          borderRadius: "100px" 
                        }}>
                          Used in {usedCount} {usedCount === 1 ? "notification" : "notifications"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: "1.25rem", backgroundColor: "#f8fafc", flex: 1 }}>
                    <div style={{ marginBottom: "0.75rem" }}>
                      <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "600", color: "#94a3b8", display: "block", marginBottom: "0.25rem" }}>Subject</span>
                      <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--dark)", fontWeight: "500" }}>{template.subject}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "600", color: "#94a3b8", display: "block", marginBottom: "0.25rem" }}>Preview</span>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-main)", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: "1.5" }}>
                        {template.text}
                      </p>
                    </div>
                  </div>
                  
                  {/* Card Actions Footer */}
                  <div style={{ padding: "0.75rem 1.25rem", borderTop: "1px solid var(--border-color)", backgroundColor: "#ffffff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ padding: "0.3rem 0.65rem", fontSize: "0.8rem", height: "auto", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
                      onClick={(e) => { e.stopPropagation(); setPreviewTemplate(template); }}
                    >
                      <Eye size={13} /> Preview
                    </button>

                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ padding: "0.3rem 0.65rem", fontSize: "0.8rem", height: "auto", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
                        onClick={(e) => handleSendTest(template, e)}
                        title="Send test message to QA"
                      >
                        <Send size={13} /> Send test
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => handleDelete(template.name, e)} 
                        style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "0.3rem", opacity: 0.8 }} 
                        title="Delete Template"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15, 23, 42, 0.5)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(2px)" }} onClick={() => setIsModalOpen(false)}>
          <div style={{ width: "900px", height: "90vh", backgroundColor: "white", borderRadius: "12px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", animation: "slideInUp 0.3s ease-out" }} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{ padding: "1.25rem 2rem", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f8fafc", borderRadius: "12px 12px 0 0" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "600", margin: 0, color: "var(--dark)" }}>
                {editingTemplateName ? `Edit Template: ${editingTemplateName}` : "Create New Template"}
              </h2>
              <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "0.5rem", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#e2e8f0"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"} onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ borderBottom: "1px solid var(--border-color)", display: "flex", backgroundColor: "white", padding: "0 2rem" }}>
              <button 
                style={{ padding: "1rem 1.5rem", background: "none", border: "none", borderBottom: activeTab === "email" ? "2px solid var(--primary)" : "2px solid transparent", color: activeTab === "email" ? "var(--primary)" : "var(--text-muted)", fontWeight: "500", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", transition: "all 0.2s" }}
                onClick={() => setActiveTab("email")}
              >
                <Mail size={16} /> Email Config
              </button>
              <button 
                style={{ padding: "1rem 1.5rem", background: "none", border: "none", borderBottom: activeTab === "sms" ? "2px solid var(--primary)" : "2px solid transparent", color: activeTab === "sms" ? "var(--primary)" : "var(--text-muted)", fontWeight: "500", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", transition: "all 0.2s" }}
                onClick={() => setActiveTab("sms")}
              >
                <MessageSquare size={16} /> SMS Config
              </button>
              <button 
                style={{ padding: "1rem 1.5rem", background: "none", border: "none", borderBottom: activeTab === "push" ? "2px solid var(--primary)" : "2px solid transparent", color: activeTab === "push" ? "var(--primary)" : "var(--text-muted)", fontWeight: "500", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", transition: "all 0.2s" }}
                onClick={() => setActiveTab("push")}
              >
                <Smartphone size={16} /> Push Config
              </button>
            </div>

            <div style={{ padding: "2rem", overflowY: "auto", flex: 1, backgroundColor: "#fcfcfc" }}>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--dark)", marginBottom: "0.5rem" }}>Template Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Welcome Series 1"
                  style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid var(--border-color)", borderRadius: "6px", outline: "none", fontSize: "0.95rem" }}
                />
              </div>

              {activeTab === "email" && (
                <>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--dark)", marginBottom: "0.5rem" }}>Email Subject</label>
                    <input 
                      type="text" 
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Enter subject line..."
                      style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid var(--border-color)", borderRadius: "6px", outline: "none", fontSize: "0.95rem" }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--dark)", marginBottom: "0.5rem" }}>Email Content</label>
                    <RichTextEditor 
                      value={formData.email}
                      onChange={(val) => setFormData({ ...formData, email: val })}
                    />
                  </div>
                </>
              )}

              {activeTab === "sms" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {/* Twilio Accordion */}
                  <div style={{ border: "1px solid var(--border-color)", borderRadius: "8px", overflow: "hidden", backgroundColor: "white" }}>
                    <div style={{ padding: "1rem", display: "flex", alignItems: "center", gap: "1rem", cursor: "pointer", backgroundColor: expandedSms === "Twilio" ? "#f8fafc" : "white" }} onClick={() => setExpandedSms(expandedSms === "Twilio" ? "" : "Twilio")}>
                      <input type="checkbox" checked={formData.smsTwilioEnabled} onChange={(e) => setFormData({ ...formData, smsTwilioEnabled: e.target.checked })} onClick={(e) => e.stopPropagation()} style={{ cursor: "pointer", width: "16px", height: "16px" }} />
                      <span style={{ fontWeight: "600", color: "var(--dark)", flex: 1 }}>Check 1 Twilio</span>
                      <span style={{ color: "var(--text-muted)" }}>{expandedSms === "Twilio" ? "▲" : "▼"}</span>
                    </div>
                    {expandedSms === "Twilio" && (
                      <div style={{ padding: "1.5rem", borderTop: "1px solid var(--border-color)", borderBottom: "1px solid var(--border-color)" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                          <div>
                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--dark)", marginBottom: "0.5rem" }}>SMS Content</label>
                            <textarea 
                              value={formData.smsTwilioContent}
                              onChange={(e) => setFormData({ ...formData, smsTwilioContent: e.target.value })}
                              placeholder="Enter plain text message for SMS notifications..."
                              style={{ width: "100%", padding: "1rem", border: "1px solid var(--border-color)", borderRadius: "6px", outline: "none", minHeight: "150px", resize: "vertical", fontFamily: "inherit", fontSize: "0.95rem" }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* MSG91 Accordion */}
                  <div style={{ border: "1px solid var(--border-color)", borderRadius: "8px", overflow: "hidden", backgroundColor: "white" }}>
                    <div style={{ padding: "1rem", display: "flex", alignItems: "center", gap: "1rem", cursor: "pointer", backgroundColor: expandedSms === "MSG91" ? "#f8fafc" : "white" }} onClick={() => setExpandedSms(expandedSms === "MSG91" ? "" : "MSG91")}>
                      <input type="checkbox" checked={formData.smsMsg91Enabled} onChange={(e) => setFormData({ ...formData, smsMsg91Enabled: e.target.checked })} onClick={(e) => e.stopPropagation()} style={{ cursor: "pointer", width: "16px", height: "16px" }} />
                      <span style={{ fontWeight: "600", color: "var(--dark)", flex: 1 }}>Check 2 MSG91</span>
                      <span style={{ color: "var(--text-muted)" }}>{expandedSms === "MSG91" ? "▲" : "▼"}</span>
                    </div>
                    {expandedSms === "MSG91" && (
                      <div style={{ padding: "1.5rem", borderTop: "1px solid var(--border-color)", borderBottom: "1px solid var(--border-color)" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                          <div style={{ display: "flex", gap: "1rem" }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--dark)", marginBottom: "0.5rem" }}>Select Sender ID*</label>
                              <CustomSelect value={defaultSenderId} onChange={(val) => { if(val === "ADD_NEW") setShowAddSenderId(true); }} options={senderIdOptions} style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--border-color)" }} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--dark)", marginBottom: "0.5rem" }}>DLT Template ID</label>
                              <input 
                                type="text" value={formData.smsMsg91TemplateId} onChange={(e) => setFormData({ ...formData, smsMsg91TemplateId: e.target.value })}
                                placeholder="e.g. 1477178463446456650"
                                style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid var(--border-color)", borderRadius: "6px", outline: "none", fontSize: "0.95rem" }}
                              />
                            </div>
                          </div>

                          <div style={{ border: "1px solid var(--border-color)", borderRadius: "6px", overflow: "hidden" }}>
                            <div style={{ padding: "0.75rem", borderBottom: "1px solid var(--border-color)", backgroundColor: "#f8fafc" }}>
                              <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--dark)" }}>SMS Content *</span>
                              <CustomSelect value={formData.smsMsg91Language} onChange={(val) => setFormData({ ...formData, smsMsg91Language: val })} options={["English", "Unicode"]} style={{ display: "block", marginTop: "0.5rem", width: "150px" }} />
                            </div>
                            <textarea 
                              value={formData.smsMsg91Content} onChange={(e) => setFormData({ ...formData, smsMsg91Content: e.target.value })}
                              placeholder="Enter Message Here..."
                              style={{ width: "100%", padding: "1rem", border: "none", outline: "none", minHeight: "150px", resize: "vertical", fontFamily: "inherit", fontSize: "0.95rem" }}
                            />
                          </div>
                          <div>
                            <button type="button" style={{ color: "var(--primary)", background: "none", border: "none", fontWeight: "500", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem", padding: "0" }}><Plus size={16} /> Add Variable</button>
                            <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}><strong>Variables:</strong> Should be defined as ##name##, ##number## and so on.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bulk SMS Gateway Accordion */}
                  <div style={{ border: "1px solid var(--border-color)", borderRadius: "8px", overflow: "hidden", backgroundColor: "white" }}>
                    <div style={{ padding: "1rem", display: "flex", alignItems: "center", gap: "1rem", cursor: "pointer", backgroundColor: expandedSms === "Bulk" ? "#f8fafc" : "white" }} onClick={() => setExpandedSms(expandedSms === "Bulk" ? "" : "Bulk")}>
                      <input type="checkbox" checked={formData.smsBulkEnabled} onChange={(e) => setFormData({ ...formData, smsBulkEnabled: e.target.checked })} onClick={(e) => e.stopPropagation()} style={{ cursor: "pointer", width: "16px", height: "16px" }} />
                      <span style={{ fontWeight: "600", color: "var(--dark)", flex: 1 }}>Check 3 Bulk SMS Gateway</span>
                      <span style={{ color: "var(--text-muted)" }}>{expandedSms === "Bulk" ? "▲" : "▼"}</span>
                    </div>
                    {expandedSms === "Bulk" && (
                      <div style={{ padding: "1.5rem", borderTop: "1px solid var(--border-color)", borderBottom: "1px solid var(--border-color)" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                          <div style={{ display: "flex", gap: "1rem" }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--dark)", marginBottom: "0.5rem" }}>Select Sender ID*</label>
                              <CustomSelect value={defaultSenderId} onChange={(val) => { if(val === "ADD_NEW") setShowAddSenderId(true); }} options={senderIdOptions} style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--border-color)" }} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--dark)", marginBottom: "0.5rem" }}>DLT Template ID</label>
                              <input 
                                type="text" value={formData.smsBulkTemplateId} onChange={(e) => setFormData({ ...formData, smsBulkTemplateId: e.target.value })}
                                placeholder="e.g. 1477178463446456650"
                                style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid var(--border-color)", borderRadius: "6px", outline: "none", fontSize: "0.95rem" }}
                              />
                            </div>
                          </div>

                          <div style={{ border: "1px solid var(--border-color)", borderRadius: "6px", overflow: "hidden" }}>
                            <div style={{ padding: "0.75rem", borderBottom: "1px solid var(--border-color)", backgroundColor: "#f8fafc" }}>
                              <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--dark)" }}>SMS Content *</span>
                              <CustomSelect value={formData.smsBulkLanguage} onChange={(val) => setFormData({ ...formData, smsBulkLanguage: val })} options={["English", "Unicode"]} style={{ display: "block", marginTop: "0.5rem", width: "150px" }} />
                            </div>
                            <textarea 
                              value={formData.smsBulkContent} onChange={(e) => setFormData({ ...formData, smsBulkContent: e.target.value })}
                              placeholder="Enter Message Here..."
                              style={{ width: "100%", padding: "1rem", border: "none", outline: "none", minHeight: "150px", resize: "vertical", fontFamily: "inherit", fontSize: "0.95rem" }}
                            />
                          </div>
                          <div>
                            <button type="button" style={{ color: "var(--primary)", background: "none", border: "none", fontWeight: "500", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem", padding: "0" }}><Plus size={16} /> Add Variable</button>
                            <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}><strong>Variables:</strong> Should be defined as {"{#var#}"} and so on.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {activeTab === "push" && (
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--dark)", marginBottom: "0.5rem" }}>App Push Notification Content</label>
                  <textarea 
                    value={formData.pushContent}
                    onChange={(e) => setFormData({ ...formData, pushContent: e.target.value })}
                    placeholder="Enter short text for push notification..."
                    style={{ width: "100%", padding: "1rem", border: "1px solid var(--border-color)", borderRadius: "6px", outline: "none", minHeight: "150px", resize: "vertical", fontFamily: "inherit", fontSize: "0.95rem" }}
                  />
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div style={{ padding: "1.25rem 2rem", borderTop: "1px solid var(--border-color)", display: "flex", justifyContent: "flex-end", gap: "1rem", backgroundColor: "white", borderRadius: "0 0 12px 12px" }}>
              <button className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>Save Template</button>
            </div>
          </div>
        </div>
      )}
      {showAddSenderId && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15, 23, 42, 0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(2px)" }}>
          <div style={{ width: "500px", backgroundColor: "white", borderRadius: "8px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", padding: "2rem" }}>
            <h3 style={{ margin: "0 0 1.5rem 0", fontSize: "1.2rem", fontWeight: "600", color: "var(--dark)" }}>Add Sender ID</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                <span style={{ width: "120px", fontWeight: "600", fontSize: "0.9rem", color: "var(--dark)", textAlign: "right" }}>Route</span>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", cursor: "pointer" }}>
                    <input type="radio" name="route" checked={newSenderIdForm.route === "Transactional"} onChange={() => setNewSenderIdForm({ ...newSenderIdForm, route: "Transactional" })} /> Transactional
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", cursor: "pointer" }}>
                    <input type="radio" name="route" checked={newSenderIdForm.route === "Promotional"} onChange={() => setNewSenderIdForm({ ...newSenderIdForm, route: "Promotional" })} /> Promotional
                  </label>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                <span style={{ width: "120px", fontWeight: "600", fontSize: "0.9rem", color: "var(--dark)", textAlign: "right" }}>Sender ID</span>
                <input type="text" placeholder="Please Enter Sender ID" value={newSenderIdForm.senderId} onChange={(e) => setNewSenderIdForm({ ...newSenderIdForm, senderId: e.target.value })} style={{ flex: 1, padding: "0.6rem 1rem", border: "1px solid var(--border-color)", borderRadius: "4px", outline: "none", fontSize: "0.9rem" }} />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                <span style={{ width: "120px", fontWeight: "600", fontSize: "0.9rem", color: "var(--dark)", textAlign: "right" }}>PE ID(Entity ID)</span>
                <input type="text" placeholder="Add PE ID" value={newSenderIdForm.peId} onChange={(e) => setNewSenderIdForm({ ...newSenderIdForm, peId: e.target.value })} style={{ flex: 1, padding: "0.6rem 1rem", border: "1px solid var(--border-color)", borderRadius: "4px", outline: "none", fontSize: "0.9rem" }} />
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "2rem" }}>
              <button className="btn btn-primary" onClick={handleAddSenderIdSubmit} style={{ backgroundColor: "#10b981", borderColor: "#10b981", padding: "0.5rem 1.25rem" }}>Submit</button>
              <button className="btn btn-primary" onClick={() => setNewSenderIdForm({ route: "Transactional", senderId: "", peId: "" })} style={{ backgroundColor: "#3b82f6", borderColor: "#3b82f6", padding: "0.5rem 1.25rem" }}>Reset</button>
              <div style={{ flex: 1 }}></div>
              <button className="btn btn-outline" onClick={() => setShowAddSenderId(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal with Sample Data */}
      {previewTemplate && (
        <div 
          style={{ 
            position: "fixed", 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: "rgba(15, 23, 42, 0.6)", 
            zIndex: 1000, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            backdropFilter: "blur(2px)", 
            padding: "1rem" 
          }} 
          onClick={() => setPreviewTemplate(null)}
        >
          <div 
            className="card" 
            style={{ 
              width: "100%", 
              maxWidth: previewDevice === "desktop" ? "780px" : "420px", 
              maxHeight: "90vh", 
              backgroundColor: "white", 
              borderRadius: "12px", 
              display: "flex", 
              flexDirection: "column", 
              overflow: "hidden", 
              transition: "max-width 0.25s ease",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
            }} 
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f8fafc" }}>
              <div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: "600", color: "var(--dark)", margin: 0 }}>
                  Template Preview (Sample Data)
                </h3>
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  Template: <strong>{previewTemplate.name}</strong>
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ display: "flex", backgroundColor: "#e2e8f0", borderRadius: "6px", padding: "2px" }}>
                  <button 
                    type="button" 
                    onClick={() => setPreviewDevice("desktop")}
                    style={{ 
                      padding: "4px 8px", 
                      border: "none", 
                      borderRadius: "4px", 
                      backgroundColor: previewDevice === "desktop" ? "white" : "transparent", 
                      color: previewDevice === "desktop" ? "var(--primary)" : "var(--text-muted)", 
                      cursor: "pointer", 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "4px", 
                      fontSize: "0.75rem", 
                      fontWeight: "600" 
                    }}
                  >
                    <Monitor size={14} /> Desktop
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setPreviewDevice("mobile")}
                    style={{ 
                      padding: "4px 8px", 
                      border: "none", 
                      borderRadius: "4px", 
                      backgroundColor: previewDevice === "mobile" ? "white" : "transparent", 
                      color: previewDevice === "mobile" ? "var(--primary)" : "var(--text-muted)", 
                      cursor: "pointer", 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "4px", 
                      fontSize: "0.75rem", 
                      fontWeight: "600" 
                    }}
                  >
                    <PhoneIcon size={14} /> Mobile
                  </button>
                </div>
                <button 
                  onClick={() => setPreviewTemplate(null)} 
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "0.25rem" }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Email Meta Headers */}
            <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border-color)", backgroundColor: "#ffffff", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <div><span style={{ color: "var(--text-muted)", fontWeight: "600" }}>From:</span> MantraCare Notifications &lt;donotreply@mantra.care&gt;</div>
              <div><span style={{ color: "var(--text-muted)", fontWeight: "600" }}>To:</span> Jordan Lee &lt;jordan.lee@example.com&gt;</div>
              <div><span style={{ color: "var(--text-muted)", fontWeight: "600" }}>Subject:</span> <strong>{renderSubstitutedText(previewTemplate.subject)}</strong></div>
            </div>

            {/* Email Render Frame */}
            <div style={{ padding: "1.5rem", flex: 1, overflowY: "auto", backgroundColor: "#f8fafc" }}>
              <div 
                style={{ 
                  backgroundColor: "white", 
                  padding: "1.75rem", 
                  borderRadius: "8px", 
                  border: "1px solid var(--border-color)", 
                  minHeight: "220px", 
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)" 
                }}
                dangerouslySetInnerHTML={{ __html: renderSubstitutedEmail(previewTemplate.email) }}
              />

              <div style={{ marginTop: "1rem", padding: "0.75rem 1rem", borderRadius: "6px", backgroundColor: "#fef9c3", border: "1px solid #fef08a", fontSize: "0.8rem", color: "#854d0e" }}>
                <strong>Substituted dynamic variables:</strong> <code>client_name</code> &rarr; &quot;Jordan Lee&quot;, <code>provider_name</code> &rarr; &quot;Dr. Amara Singh&quot;, <code>session_date</code> &rarr; &quot;Aug 20, 2026&quot;
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid var(--border-color)", backgroundColor: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button 
                type="button" 
                className="btn btn-primary"
                style={{ padding: "0.45rem 1rem", fontSize: "0.85rem" }}
                onClick={() => handleSendTest(previewTemplate)}
              >
                <Send size={14} /> Send Test to Sample Recipient
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setPreviewTemplate(null)}>
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
