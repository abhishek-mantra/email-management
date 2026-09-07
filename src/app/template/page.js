"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Plus, Mail, MessageSquare, MoreVertical, X, Smartphone, 
  Bold, Italic, Underline, Strikethrough, Link as LinkIcon, 
  List, ListOrdered, Heading, Trash2, Eye, Send, Monitor, 
  Smartphone as PhoneIcon, Check, Code, Sparkles, ChevronDown, 
  ChevronUp, Eraser, Bell, FileText, CheckCircle2, AlertCircle,
  LayoutGrid, LayoutTemplate, Edit, Zap, Search
} from "lucide-react";
import { useNotifications } from "@/context/NotificationContext";
import CustomSelect from "@/components/CustomSelect";
import toast from "react-hot-toast";

// Lightweight, robust Rich Text Editor with real-time editing and token insertion
const RichTextEditor = ({ value, onChange }) => {
  const [mode, setMode] = useState("visual");
  const [showVarDropdown, setShowVarDropdown] = useState(false);
  const editorRef = useRef(null);
  const isInternalChangeRef = useRef(false);
  const savedRangeRef = useRef(null);

  // Sync content when value changes externally (initial mount, template switch, or switching from Code mode)
  useEffect(() => {
    if (mode === "visual" && editorRef.current) {
      if (isInternalChangeRef.current) {
        isInternalChangeRef.current = false;
        return;
      }
      if (editorRef.current.innerHTML !== (value || "")) {
        editorRef.current.innerHTML = value || "";
      }
    }
  }, [value, mode]);

  // Keep track of cursor position / selection in editor
  const recordSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current && editorRef.current.contains(sel.anchorNode)) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    editorRef.current?.focus();
    if (savedRangeRef.current) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }
  };

  const execCommand = (command, val = null) => {
    restoreSelection();
    document.execCommand(command, false, val);
    if (editorRef.current) {
      isInternalChangeRef.current = true;
      onChange(editorRef.current.innerHTML);
    }
    recordSelection();
  };

  const insertVariable = (varName) => {
    restoreSelection();
    const token = `{{${varName}}}`;
    const sel = window.getSelection();
    
    if (sel && sel.rangeCount > 0 && editorRef.current && editorRef.current.contains(sel.anchorNode)) {
      document.execCommand("insertText", false, token);
    } else if (savedRangeRef.current && editorRef.current && editorRef.current.contains(savedRangeRef.current.commonAncestorContainer)) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
      document.execCommand("insertText", false, token);
    } else if (editorRef.current) {
      editorRef.current.innerHTML = (editorRef.current.innerHTML || "") + token;
    }
    
    if (editorRef.current) {
      isInternalChangeRef.current = true;
      onChange(editorRef.current.innerHTML);
    }
    recordSelection();
    setShowVarDropdown(false);
  };

  const handleInput = () => {
    if (editorRef.current) {
      isInternalChangeRef.current = true;
      onChange(editorRef.current.innerHTML);
      recordSelection();
    }
  };

  const insertLink = () => {
    const url = prompt("Enter hyperlink URL:", "https://");
    if (url && url.trim() && url !== "https://") {
      execCommand("createLink", url.trim());
    }
  };

  const availableVars = [
    { label: "Client Name", value: "client_name" },
    { label: "Provider Name", value: "provider_name" },
    { label: "Session Date", value: "session_date" },
    { label: "Session Time", value: "session_time" },
    { label: "Phone Number", value: "number" },
    { label: "Credits", value: "credits" }
  ];

  return (
    <div style={{ border: "1px solid rgba(226, 232, 240, 0.9)", borderRadius: "1rem", overflow: "hidden", backgroundColor: "#ffffff", boxShadow: "0 1px 3px rgba(15,23,42,0.06)", display: "flex", flexDirection: "column" }}>
      {/* Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(15,23,42,0.08)", padding: "0.5rem 0.85rem", backgroundColor: "rgba(248,250,252,0.95)", flexWrap: "wrap", gap: "0.5rem" }}>
        <div style={{ display: "flex", gap: "0.25rem", alignItems: "center", opacity: mode === "visual" ? 1 : 0.4, pointerEvents: mode === "visual" ? "auto" : "none", flexWrap: "wrap" }}>
          {/* Format / Headings */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execCommand("formatBlock", "<p>")}
            title="Normal text"
            style={{ padding: "0.3rem 0.5rem", background: "none", border: "1px solid rgba(15,23,42,0.08)", borderRadius: "6px", cursor: "pointer", fontSize: "0.78rem", fontWeight: "600", color: "var(--dark)" }}
          >
            P
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execCommand("formatBlock", "<h1>")}
            title="Heading 1"
            style={{ padding: "0.3rem 0.5rem", background: "none", border: "1px solid rgba(15,23,42,0.08)", borderRadius: "6px", cursor: "pointer", fontSize: "0.78rem", fontWeight: "700", color: "var(--dark)" }}
          >
            H1
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execCommand("formatBlock", "<h2>")}
            title="Heading 2"
            style={{ padding: "0.3rem 0.5rem", background: "none", border: "1px solid rgba(15,23,42,0.08)", borderRadius: "6px", cursor: "pointer", fontSize: "0.78rem", fontWeight: "700", color: "var(--dark)" }}
          >
            H2
          </button>

          <div style={{ width: "1px", height: "18px", backgroundColor: "rgba(15,23,42,0.12)", margin: "0 0.2rem" }} />

          {/* Inline Styles */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execCommand("bold")}
            title="Bold"
            style={{ padding: "0.3rem 0.4rem", background: "none", border: "none", cursor: "pointer", color: "var(--dark)", borderRadius: "6px" }}
          >
            <Bold size={15} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execCommand("italic")}
            title="Italic"
            style={{ padding: "0.3rem 0.4rem", background: "none", border: "none", cursor: "pointer", color: "var(--dark)", borderRadius: "6px" }}
          >
            <Italic size={15} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execCommand("underline")}
            title="Underline"
            style={{ padding: "0.3rem 0.4rem", background: "none", border: "none", cursor: "pointer", color: "var(--dark)", borderRadius: "6px" }}
          >
            <Underline size={15} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execCommand("strikeThrough")}
            title="Strikethrough"
            style={{ padding: "0.3rem 0.4rem", background: "none", border: "none", cursor: "pointer", color: "var(--dark)", borderRadius: "6px" }}
          >
            <Strikethrough size={15} />
          </button>

          <div style={{ width: "1px", height: "18px", backgroundColor: "rgba(15,23,42,0.12)", margin: "0 0.2rem" }} />

          {/* Lists */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execCommand("insertUnorderedList")}
            title="Bullet List"
            style={{ padding: "0.3rem 0.4rem", background: "none", border: "none", cursor: "pointer", color: "var(--dark)", borderRadius: "6px" }}
          >
            <List size={15} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execCommand("insertOrderedList")}
            title="Numbered List"
            style={{ padding: "0.3rem 0.4rem", background: "none", border: "none", cursor: "pointer", color: "var(--dark)", borderRadius: "6px" }}
          >
            <ListOrdered size={15} />
          </button>

          <div style={{ width: "1px", height: "18px", backgroundColor: "rgba(15,23,42,0.12)", margin: "0 0.2rem" }} />

          {/* Link */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={insertLink}
            title="Insert Link"
            style={{ padding: "0.3rem 0.4rem", background: "none", border: "none", cursor: "pointer", color: "var(--dark)", borderRadius: "6px" }}
          >
            <LinkIcon size={15} />
          </button>

          {/* Clear formatting */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execCommand("removeFormat")}
            title="Clear formatting"
            style={{ padding: "0.3rem 0.4rem", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", borderRadius: "6px" }}
          >
            <Eraser size={15} />
          </button>

          <div style={{ width: "1px", height: "18px", backgroundColor: "rgba(15,23,42,0.12)", margin: "0 0.2rem" }} />

          {/* Variables Dropdown Button */}
          <div style={{ position: "relative" }}>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); recordSelection(); }}
              onClick={() => setShowVarDropdown(!showVarDropdown)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.3rem 0.65rem",
                background: "rgba(20,86,240,0.08)",
                border: "1px solid rgba(20,86,240,0.2)",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.8rem",
                fontWeight: "600",
                color: "var(--primary)"
              }}
            >
              <Sparkles size={13} />
              Variables
              <ChevronDown size={12} />
            </button>

            {showVarDropdown && (
              <div 
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  marginTop: "4px",
                  backgroundColor: "#ffffff",
                  border: "1px solid rgba(15,23,42,0.12)",
                  borderRadius: "8px",
                  boxShadow: "0 10px 25px -5px rgba(15,23,42,0.18)",
                  padding: "0.35rem",
                  zIndex: 20,
                  width: "210px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px"
                }}
              >
                <div style={{ padding: "0.3rem 0.5rem", fontSize: "0.7rem", fontWeight: "700", textTransform: "uppercase", color: "#94a3b8", letterSpacing: "0.04em" }}>
                  Insert Dynamic Variable
                </div>
                {availableVars.map((v) => (
                  <button
                    key={v.value}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => insertVariable(v.value)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.45rem 0.6rem",
                      background: "none",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      textAlign: "left",
                      color: "var(--dark)",
                      transition: "background 0.15s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(20,86,240,0.08)"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <span>{v.label}</span>
                    <code style={{ fontSize: "0.72rem", color: "var(--primary)", backgroundColor: "rgba(20,86,240,0.06)", padding: "1px 4px", borderRadius: "3px" }}>{`{{${v.value}}}`}</code>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Visual / Code Mode Switcher */}
        <div style={{ display: "flex", border: "1px solid rgba(15,23,42,0.12)", borderRadius: "100px", overflow: "hidden", fontSize: "0.78rem", fontWeight: "600", backgroundColor: "rgba(241,245,249,0.7)" }}>
          <button
            type="button"
            onClick={() => setMode("visual")}
            style={{
              padding: "0.3rem 0.85rem",
              background: mode === "visual" ? "var(--navy-gradient)" : "transparent",
              color: mode === "visual" ? "#ffffff" : "var(--text-muted)",
              border: "none",
              cursor: "pointer",
              transition: "all 0.15s"
            }}
          >
            Visual
          </button>
          <button
            type="button"
            onClick={() => setMode("code")}
            style={{
              padding: "0.3rem 0.85rem",
              background: mode === "code" ? "var(--navy-gradient)" : "transparent",
              color: mode === "code" ? "#ffffff" : "var(--text-muted)",
              border: "none",
              borderLeft: "1px solid rgba(15,23,42,0.1)",
              cursor: "pointer",
              transition: "all 0.15s"
            }}
          >
            Code &lt;/&gt;
          </button>
        </div>
      </div>

      {/* Editor Content Body */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "260px" }}>
        {mode === "visual" ? (
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning={true}
            onInput={handleInput}
            onKeyUp={recordSelection}
            onMouseUp={recordSelection}
            onBlur={recordSelection}
            className="editor-content-area"
            data-placeholder="Start typing your email template content here..."
            style={{
              padding: "1.25rem 1.5rem",
              minHeight: "260px",
              maxHeight: "380px",
              overflowY: "auto",
              cursor: "text"
            }}
          />
        ) : (
          <textarea
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter raw HTML content..."
            style={{
              padding: "1.25rem 1.5rem",
              border: "none",
              outline: "none",
              flex: 1,
              minHeight: "260px",
              maxHeight: "380px",
              resize: "vertical",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              fontSize: "0.85rem",
              lineHeight: "1.6",
              color: "#0f172a",
              backgroundColor: "#f8fafc"
            }}
          />
        )}
      </div>

      {/* Quick Variable Badges Bar */}
      <div style={{ padding: "0.55rem 1rem", borderTop: "1px solid rgba(15,23,42,0.06)", backgroundColor: "#fbfcfd", display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
        <span style={{ fontSize: "0.75rem", fontWeight: "600", color: "#64748b", display: "flex", alignItems: "center", gap: "0.25rem" }}>
          <Sparkles size={12} style={{ color: "var(--primary)" }} /> Click to insert:
        </span>
        {availableVars.map((v) => (
          <button
            key={v.value}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => insertVariable(v.value)}
            style={{
              padding: "0.2rem 0.55rem",
              borderRadius: "100px",
              backgroundColor: "rgba(20,86,240,0.06)",
              border: "1px solid rgba(20,86,240,0.18)",
              color: "var(--primary)",
              fontSize: "0.75rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.15s"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(20,86,240,0.15)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(20,86,240,0.06)"; e.currentTarget.style.transform = "none"; }}
          >
            + {`{{${v.value}}}`}
          </button>
        ))}
      </div>
    </div>
  );
};

export default function TemplatePage() {
  const { templates, notifications, selectedCompany, addTemplate, updateTemplate, deleteTemplate, updateTemplateStatus, smsSettings, updateSmsSettings, addLog, emailSettings } = useNotifications();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("email");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [previewDevice, setPreviewDevice] = useState("desktop"); // "desktop" | "mobile"
  const [previewChannel, setPreviewChannel] = useState("email"); // "email" | "sms"
  const [editingTemplateName, setEditingTemplateName] = useState(null); // null if creating new
  const [formData, setFormData] = useState({ 
    name: "", subject: "", email: "", pushContent: "",
    status: "Active",
    smsTwilioEnabled: false, smsTwilioContent: "",
    smsMsg91Enabled: false, smsMsg91TemplateId: "", smsMsg91Content: "", smsMsg91Language: "English",
    smsBulkEnabled: false, smsBulkTemplateId: "", smsBulkContent: "", smsBulkLanguage: "English"
  });

  // Dedicated Test Dispatch State
  const [testModalTemplate, setTestModalTemplate] = useState(null);
  const [testChannel, setTestChannel] = useState("Email"); // "Email" | "SMS"
  const [testRecipientEmail, setTestRecipientEmail] = useState("qa-testing@mantracare.com");
  const [testRecipientPhone, setTestRecipientPhone] = useState("+1 (555) 019-2834");
  const [isSendingTest, setIsSendingTest] = useState(false);

  const sampleMap = {
    client_name: "Jordan Lee",
    provider_name: "Dr. Amara Singh",
    session_date: "Aug 20, 2026",
    session_time: "10:30 AM",
    number: "+1 (800) 555-0199",
    credits: "250",
    member_name: "Alex Taylor"
  };

  const [testVariables, setTestVariables] = useState({ ...sampleMap });

  const getUsedInCount = (templateName, templateEmail) => {
    if (!notifications) return 0;
    return notifications.filter(n => 
      n.templateName === templateName || 
      n.name === templateName || 
      (templateEmail && n.emailContent === templateEmail)
    ).length;
  };

  const handleOpenSendTest = (template, e) => {
    if (e) e.stopPropagation();
    setTestModalTemplate(template);
    const hasEmail = Boolean(template.email || template.subject);
    const hasSms = Boolean(template.smsTwilioContent || template.smsMsg91Content || template.smsBulkContent || template.sms);
    if (!hasEmail && hasSms) {
      setTestChannel("SMS");
    } else {
      setTestChannel("Email");
    }
  };

  const renderSubstitutedEmail = (htmlContent, customVars = sampleMap) => {
    if (!htmlContent) return "<p style='color:#64748b;font-style:italic;'>No email HTML configured for this template.</p>";
    let result = htmlContent;
    Object.entries(customVars).forEach(([key, val]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
      result = result.replace(regex, `<span style="background-color:#fef08a;color:#854d0e;padding:1px 5px;border-radius:3px;font-weight:600;">${val}</span>`);
    });
    return result;
  };

  const renderSubstitutedText = (text, customVars = sampleMap) => {
    if (!text) return "";
    let result = text;
    Object.entries(customVars).forEach(([key, val]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
      result = result.replace(regex, val);
    });
    return result;
  };

  const handleExecuteSendTest = () => {
    if (!testModalTemplate) return;

    const targetRecipient = testChannel === "Email" ? testRecipientEmail.trim() : testRecipientPhone.trim();
    if (!targetRecipient) {
      toast.error(`Please provide a destination ${testChannel === "Email" ? "email address" : "phone number"}`);
      return;
    }

    setIsSendingTest(true);

    setTimeout(() => {
      const smsText = testModalTemplate.smsTwilioContent || testModalTemplate.smsMsg91Content || testModalTemplate.smsBulkContent || testModalTemplate.sms || testModalTemplate.pushContent || "";
      const renderedPayload = testChannel === "Email" 
        ? renderSubstitutedEmail(testModalTemplate.email, testVariables) 
        : renderSubstitutedText(smsText, testVariables);

      const createdLog = addLog({
        id: Date.now(),
        notificationId: `TEST-TPL-${Math.floor(1000 + Math.random() * 9000)}`,
        serviceType: testChannel,
        sentTo: targetRecipient,
        event: "Sent",
        status: "Delivered",
        templateName: testModalTemplate.name,
        payload: renderedPayload,
        isTest: true,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19)
      });

      setIsSendingTest(false);
      setTestModalTemplate(null);
      toast.success(
        `Test ${testChannel} successfully dispatched to "${targetRecipient}"! Log #${createdLog.id} saved in Recent Logs.`,
        { duration: 5000 }
      );
    }, 450);
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

  const [typeFilter, setTypeFilter] = useState("All Channels");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"

  const allTemplatesEntries = Object.entries(templates || {});
  const totalTemplates = allTemplatesEntries.length;
  const activeTemplatesCount = allTemplatesEntries.filter(([_, d]) => (d.status || "Active") === "Active").length;
  const draftTemplatesCount = allTemplatesEntries.filter(([_, d]) => d.status === "Draft" || d.status === "Inactive").length;
  const emailTemplatesCount = allTemplatesEntries.filter(([_, d]) => d.email || d.subject).length;
  const smsTemplatesCount = allTemplatesEntries.filter(([_, d]) => 
    d.smsTwilioEnabled || d.smsMsg91Enabled || d.smsBulkEnabled || 
    d.smsTwilioContent || d.smsMsg91Content || d.smsBulkContent || 
    d.text || d.pushContent
  ).length;
  const inUseCount = allTemplatesEntries.filter(([name, d]) => getUsedInCount(name, d.email) > 0).length;

  const formatTokensInText = (text) => {
    if (!text) return <span style={{ color: "var(--text-subtle)", fontStyle: "italic" }}>No text preview configured</span>;
    const parts = text.split(/(\{\{[^}]+\}\})/g);
    return parts.map((part, i) => {
      if (part.startsWith("{{") && part.endsWith("}}")) {
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              padding: "0.05rem 0.35rem",
              fontSize: "0.75rem",
              fontFamily: "var(--font-mono, monospace)",
              fontWeight: 600,
              color: "var(--primary)",
              backgroundColor: "rgba(20, 86, 240, 0.08)",
              border: "1px solid rgba(20, 86, 240, 0.16)",
              borderRadius: "5px",
              margin: "0 0.15rem",
              verticalAlign: "baseline"
            }}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const templatesList = allTemplatesEntries.map(([name, data]) => ({
    name,
    ...data
  })).filter(t => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      t.name.toLowerCase().includes(query) || 
      (t.subject && t.subject.toLowerCase().includes(query)) ||
      (t.text && t.text.toLowerCase().includes(query));
    
    if (!matchesSearch) return false;

    if (typeFilter === "Email") {
      return Boolean(t.email || t.subject);
    }
    if (typeFilter === "SMS & Push") {
      return Boolean(t.smsTwilioEnabled || t.smsMsg91Enabled || t.smsBulkEnabled || t.smsTwilioContent || t.smsMsg91Content || t.smsBulkContent || t.text || t.pushContent);
    }
    if (typeFilter === "Active Only") {
      return (t.status || "Active") === "Active";
    }
    if (typeFilter === "Drafts Only") {
      return t.status === "Draft";
    }
    if (typeFilter === "Inactive Only") {
      return t.status === "Inactive";
    }
    if (typeFilter === "In Active Use") {
      return getUsedInCount(t.name, t.email) > 0;
    }
    return true;
  });

  const openCreateModal = () => {
    setEditingTemplateName(null);
    setFormData({ 
      name: "", subject: "", email: "", pushContent: "",
      status: "Active",
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
      status: template.status || "Active",
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
      status: formData.status || "Active",
      subject: formData.subject, email: formData.email, text: textPreview, pushContent: formData.pushContent,
      smsTwilioEnabled: formData.smsTwilioEnabled, smsTwilioContent: formData.smsTwilioContent,
      smsMsg91Enabled: formData.smsMsg91Enabled, smsMsg91TemplateId: formData.smsMsg91TemplateId, smsMsg91Content: formData.smsMsg91Content, smsMsg91Language: formData.smsMsg91Language,
      smsBulkEnabled: formData.smsBulkEnabled, smsBulkTemplateId: formData.smsBulkTemplateId, smsBulkContent: formData.smsBulkContent, smsBulkLanguage: formData.smsBulkLanguage
    };

    if (editingTemplateName) {
      updateTemplate(editingTemplateName, formData.name, templateData);
      toast.success(`Template "${formData.name}" updated successfully`);
    } else {
      addTemplate(formData.name, templateData);
      toast.success(`Template "${formData.name}" created successfully`);
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
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1.5rem 2.5rem 1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "800", fontFamily: "var(--font-display)", color: "var(--dark)", margin: 0, letterSpacing: "-0.025em" }}>Notification Templates</h1>
          <p style={{ color: "var(--text-muted)", margin: "0.25rem 0 0 0", fontSize: "0.875rem" }}>Message copies, multi-channel layouts, and substitution presets for {selectedCompany}</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={openCreateModal}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem" }}
        >
          <Plus size={16} /> Create Template
        </button>
      </div>

      {/* KPI Stat Capsules (matching Notifications & Triggers) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", marginBottom: "1.75rem" }}>
        <div style={{ backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)", borderRadius: "1.25rem", border: "1px solid rgba(255,255,255,0.8)", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-subtle)", fontFamily: "var(--font-display)", margin: 0 }}>TOTAL TEMPLATES</p>
            <h3 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--dark)", fontFamily: "var(--font-display)", margin: "0.25rem 0 0 0", letterSpacing: "-0.02em" }}>{totalTemplates}</h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "0.25rem 0 0 0" }}>Configured message presets</p>
          </div>
          <div style={{ width: "48px", height: "48px", borderRadius: "16px", backgroundColor: "rgba(20,86,240,0.08)", border: "1px solid rgba(20,86,240,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
            <LayoutTemplate size={20} />
          </div>
        </div>

        <div style={{ backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)", borderRadius: "1.25rem", border: "1px solid rgba(255,255,255,0.8)", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-subtle)", fontFamily: "var(--font-display)", margin: 0 }}>ACTIVE STATUS</p>
            <h3 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--dark)", fontFamily: "var(--font-display)", margin: "0.25rem 0 0 0", letterSpacing: "-0.02em" }}>{activeTemplatesCount}</h3>
            <p style={{ fontSize: "12px", color: "#16a34a", margin: "0.25rem 0 0 0", fontWeight: 600 }}>Production ready</p>
          </div>
          <div style={{ width: "48px", height: "48px", borderRadius: "16px", backgroundColor: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#16a34a" }}>
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div style={{ backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)", borderRadius: "1.25rem", border: "1px solid rgba(255,255,255,0.8)", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-subtle)", fontFamily: "var(--font-display)", margin: 0 }}>DRAFTS & INACTIVE</p>
            <h3 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--dark)", fontFamily: "var(--font-display)", margin: "0.25rem 0 0 0", letterSpacing: "-0.02em" }}>{draftTemplatesCount}</h3>
            <p style={{ fontSize: "12px", color: "#d97706", margin: "0.25rem 0 0 0", fontWeight: 600 }}>WIP or archived</p>
          </div>
          <div style={{ width: "48px", height: "48px", borderRadius: "16px", backgroundColor: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#d97706" }}>
            <AlertCircle size={20} />
          </div>
        </div>

        <div style={{ backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)", borderRadius: "1.25rem", border: "1px solid rgba(255,255,255,0.8)", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-subtle)", fontFamily: "var(--font-display)", margin: 0 }}>IN ACTIVE USE</p>
            <h3 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--dark)", fontFamily: "var(--font-display)", margin: "0.25rem 0 0 0", letterSpacing: "-0.02em" }}>{inUseCount}</h3>
            <p style={{ fontSize: "12px", color: "var(--primary)", margin: "0.25rem 0 0 0", fontWeight: 600 }}>Linked to notification rules</p>
          </div>
          <div style={{ width: "48px", height: "48px", borderRadius: "16px", backgroundColor: "rgba(20,86,240,0.08)", border: "1px solid rgba(20,86,240,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
            <Zap size={20} />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
        {/* Toolbar: Search, Filters & View Toggle */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1, minWidth: "280px", maxWidth: "560px" }}>
            <div style={{ position: "relative", width: "100%" }}>
              <Search size={15} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input 
                type="text" 
                placeholder="Search templates by name, subject, or content..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.55rem 1rem 0.55rem 2.3rem",
                  borderRadius: "14px",
                  border: "1px solid rgba(226, 232, 240, 0.9)",
                  outline: "none",
                  fontSize: "0.875rem",
                  backgroundColor: "#ffffff",
                  fontFamily: "var(--font-sans)"
                }}
              />
            </div>
            <CustomSelect
              value={typeFilter}
              onChange={(val) => setTypeFilter(val)}
              options={["All Channels", "Active Only", "Drafts Only", "Inactive Only", "Email", "SMS & Push", "In Active Use"]}
              style={{ width: "180px" }}
            />
          </div>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            {/* View Mode Toggle */}
            <div className="pill-switcher" style={{ padding: "0.25rem" }}>
              <button
                type="button"
                className={viewMode === "grid" ? "active" : ""}
                onClick={() => setViewMode("grid")}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.35rem 0.75rem", fontSize: "0.8rem" }}
                title="Grid Card View"
              >
                <LayoutGrid size={14} /> Cards
              </button>
              <button
                type="button"
                className={viewMode === "table" ? "active" : ""}
                onClick={() => setViewMode("table")}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.35rem 0.75rem", fontSize: "0.8rem" }}
                title="Table View"
              >
                <List size={14} /> Table
              </button>
            </div>
          </div>
        </div>

        {templatesList.length === 0 ? (
          <div style={{ padding: "4rem 1rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
            <LayoutTemplate size={44} style={{ color: "var(--text-muted)", opacity: 0.4, marginBottom: "0.25rem" }} />
            <h3 style={{ color: "var(--dark)", fontSize: "1.15rem", fontWeight: "700", fontFamily: "var(--font-display)", margin: 0 }}>
              {searchQuery ? `No templates found matching "${searchQuery}"` : "No templates configured"}
            </h3>
            <p style={{ color: "var(--text-muted)", maxWidth: "380px", fontSize: "0.875rem", margin: 0 }}>
              {searchQuery ? "Try clearing your search query or switching channel filter to 'All Channels'." : "Create notification presets for transaction emails, alerts, and SMS broadcasts."}
            </p>
            {!searchQuery && (
              <button className="btn btn-primary" onClick={openCreateModal} style={{ marginTop: "0.5rem" }}>
                <Plus size={16} /> Create Template
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          /* Sleek Consistent Executive Cards */
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.25rem" }}>
            {templatesList.map((template, idx) => {
              const usedCount = getUsedInCount(template.name, template.email);
              const hasEmail = Boolean(template.email || template.subject);
              const hasSms = Boolean(
                template.smsTwilioEnabled || 
                template.smsMsg91Enabled || 
                template.smsBulkEnabled || 
                template.smsTwilioContent || 
                template.smsMsg91Content || 
                template.smsBulkContent || 
                template.text
              );
              const hasPush = Boolean(template.pushContent);

              const smsGateways = [];
              if (template.smsTwilioEnabled) smsGateways.push("Twilio");
              if (template.smsMsg91Enabled) smsGateways.push("MSG91");
              if (template.smsBulkEnabled) smsGateways.push("Bulk");
              const gatewaysLabel = smsGateways.length > 0 ? `(${smsGateways.join(", ")})` : "";

              const previewSnippet = template.text || (template.email ? template.email.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : "");

              return (
                <div 
                  key={idx} 
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "1.25rem",
                    border: "1px solid rgba(226, 232, 240, 0.9)",
                    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04), 0 4px 12px -2px rgba(15, 23, 42, 0.03)",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 10px 25px -4px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(20, 86, 240, 0.16)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 1px 3px rgba(15, 23, 42, 0.04), 0 4px 12px -2px rgba(15, 23, 42, 0.03)";
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  {/* Card Body */}
                  <div style={{ padding: "1.25rem 1.25rem 1rem 1.25rem", display: "flex", flexDirection: "column", flex: 1 }}>
                    {/* Header: Icon, Name & Pipeline Link count */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem", marginBottom: "0.75rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
                        <div style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "12px",
                          backgroundColor: hasEmail ? "rgba(20, 86, 240, 0.08)" : "rgba(139, 92, 246, 0.08)",
                          border: hasEmail ? "1px solid rgba(20, 86, 240, 0.15)" : "1px solid rgba(139, 92, 246, 0.15)",
                          color: hasEmail ? "var(--primary)" : "#7c3aed",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0
                        }}>
                          {hasEmail ? <Mail size={17} /> : <MessageSquare size={17} />}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <h3 
                            onClick={() => openEditModal(template)}
                            style={{ 
                              margin: 0, 
                              fontSize: "1.05rem", 
                              fontWeight: 700, 
                              fontFamily: "var(--font-display)", 
                              color: "var(--dark)", 
                              letterSpacing: "-0.01em",
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis"
                            }}
                            title="Click to edit template"
                          >
                            {template.name}
                          </h3>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>
                            {hasEmail && hasSms ? "Multi-channel (Email + SMS)" : hasEmail ? "Email Template" : "SMS / Push"}
                          </span>
                        </div>
                      </div>

                      {/* Status & Usage Badges */}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                        {/* Interactive Status Pill */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const currentStatus = template.status || "Active";
                            const cycle = { "Active": "Draft", "Draft": "Inactive", "Inactive": "Active" };
                            const next = cycle[currentStatus] || "Active";
                            updateTemplateStatus(template.name, next);
                            toast.success(`Template "${template.name}" marked as ${next}`);
                          }}
                          style={{
                            border: "none",
                            cursor: "pointer",
                            padding: "0.22rem 0.65rem",
                            borderRadius: "9999px",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            fontFamily: "var(--font-display)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.3rem",
                            backgroundColor: (template.status || "Active") === "Active" ? "#ecfdf5" : template.status === "Draft" ? "#fef3c7" : "#f1f5f9",
                            color: (template.status || "Active") === "Active" ? "#065f46" : template.status === "Draft" ? "#92400e" : "#475569",
                            border: (template.status || "Active") === "Active" ? "1px solid rgba(16,185,129,0.3)" : template.status === "Draft" ? "1px solid rgba(245,158,11,0.3)" : "1px solid rgba(148,163,184,0.3)",
                            transition: "all 0.15s ease"
                          }}
                          title="Click to cycle status: Active -> Draft -> Inactive"
                        >
                          <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: (template.status || "Active") === "Active" ? "#10b981" : template.status === "Draft" ? "#f59e0b" : "#94a3b8" }}></span>
                          {template.status || "Active"}
                        </button>

                        {/* Usage Badge */}
                        {usedCount > 0 ? (
                          <span style={{
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            color: "#15803d",
                            backgroundColor: "#dcfce7",
                            border: "1px solid rgba(34, 197, 94, 0.2)",
                            padding: "0.22rem 0.6rem",
                            borderRadius: "9999px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.3rem",
                            flexShrink: 0
                          }}>
                            <CheckCircle2 size={11} /> {usedCount} {usedCount === 1 ? "pipeline" : "pipelines"}
                          </span>
                        ) : (
                          <span style={{
                            fontSize: "0.72rem",
                            fontWeight: 600,
                            color: "var(--text-subtle)",
                            backgroundColor: "#f1f5f9",
                            padding: "0.22rem 0.6rem",
                            borderRadius: "9999px",
                            flexShrink: 0
                          }}>
                            Unlinked
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Channel tags */}
                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.85rem" }}>
                      {hasEmail && (
                        <span style={{
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          color: "var(--primary)",
                          backgroundColor: "rgba(20, 86, 240, 0.08)",
                          border: "1px solid rgba(20, 86, 240, 0.16)",
                          padding: "0.18rem 0.55rem",
                          borderRadius: "9999px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.25rem"
                        }}>
                          <Mail size={11} /> Email
                        </span>
                      )}
                      {hasSms && (
                        <span style={{
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          color: "#7c3aed",
                          backgroundColor: "rgba(139, 92, 246, 0.08)",
                          border: "1px solid rgba(139, 92, 246, 0.16)",
                          padding: "0.18rem 0.55rem",
                          borderRadius: "9999px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.25rem"
                        }}>
                          <MessageSquare size={11} /> SMS {gatewaysLabel}
                        </span>
                      )}
                      {hasPush && (
                        <span style={{
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          color: "#059669",
                          backgroundColor: "rgba(16, 185, 129, 0.08)",
                          border: "1px solid rgba(16, 185, 129, 0.16)",
                          padding: "0.18rem 0.55rem",
                          borderRadius: "9999px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.25rem"
                        }}>
                          <Bell size={11} /> App Push
                        </span>
                      )}
                    </div>

                    {/* Subject Line */}
                    {template.subject && (
                      <div style={{ marginBottom: "0.75rem" }}>
                        <span style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-subtle)", fontFamily: "var(--font-display)", display: "block", marginBottom: "0.2rem" }}>
                          Subject
                        </span>
                        <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--dark)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {template.subject}
                        </div>
                      </div>
                    )}

                    {/* Preview Snippet */}
                    <div style={{ marginTop: "auto" }}>
                      <span style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-subtle)", fontFamily: "var(--font-display)", display: "block", marginBottom: "0.25rem" }}>
                        Preview Snippet
                      </span>
                      <div style={{
                        backgroundColor: "#f8fafc",
                        border: "1px solid #edf2f7",
                        borderRadius: "10px",
                        padding: "0.75rem 0.85rem",
                        fontSize: "0.82rem",
                        lineHeight: 1.5,
                        color: "var(--text-main)",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        minHeight: "4.2rem"
                      }}>
                        {formatTokensInText(previewSnippet)}
                      </div>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div style={{
                    padding: "0.75rem 1.25rem",
                    borderTop: "1px solid #f1f5f9",
                    backgroundColor: "#ffffff",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem", height: "auto", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
                      onClick={() => setPreviewTemplate(template)}
                      title="Preview Rendered Template"
                    >
                      <Eye size={13} /> Preview
                    </button>

                    <div style={{ display: "flex", gap: "0.45rem", alignItems: "center" }}>
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem", height: "auto", display: "inline-flex", alignItems: "center", gap: "0.35rem", color: "var(--primary)" }}
                        onClick={(e) => handleOpenSendTest(template, e)}
                        title="Send Test Dispatch"
                      >
                        <Send size={13} /> Test
                      </button>

                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem", height: "auto", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
                        onClick={() => openEditModal(template)}
                        title="Edit Template"
                      >
                        <Edit size={13} /> Edit
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDelete(template.name, e)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#94a3b8",
                          cursor: "pointer",
                          padding: "0.35rem",
                          borderRadius: "6px",
                          display: "inline-flex",
                          alignItems: "center",
                          transition: "color 0.15s, background-color 0.15s"
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.backgroundColor = "#fee2e2"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.backgroundColor = "transparent"; }}
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
        ) : (
          /* High Density Enterprise Table View */
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem", minWidth: "900px" }}>
              <thead className="thead-dark">
                <tr style={{ textAlign: "left" }}>
                  <th style={{ padding: "1rem 1.25rem" }}>Template Name</th>
                  <th style={{ padding: "1rem 1.25rem" }}>Status</th>
                  <th style={{ padding: "1rem 1.25rem" }}>Channels</th>
                  <th style={{ padding: "1rem 1.25rem" }}>Subject</th>
                  <th style={{ padding: "1rem 1.25rem" }}>Message Preview</th>
                  <th style={{ padding: "1rem 1.25rem" }}>Usage</th>
                  <th style={{ padding: "1rem 1.25rem", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {templatesList.map((template, idx) => {
                  const usedCount = getUsedInCount(template.name, template.email);
                  const hasEmail = Boolean(template.email || template.subject);
                  const hasSms = Boolean(
                    template.smsTwilioEnabled || 
                    template.smsMsg91Enabled || 
                    template.smsBulkEnabled || 
                    template.smsTwilioContent || 
                    template.smsMsg91Content || 
                    template.smsBulkContent || 
                    template.text
                  );
                  const hasPush = Boolean(template.pushContent);
                  const previewSnippet = template.text || (template.email ? template.email.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : "");

                  return (
                    <tr 
                      key={idx} 
                      style={{ borderBottom: "1px solid var(--border-color)", transition: "background-color 0.15s" }} 
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"} 
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      <td style={{ padding: "1rem 1.25rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                          <div style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
                            backgroundColor: hasEmail ? "rgba(20, 86, 240, 0.08)" : "rgba(139, 92, 246, 0.08)",
                            color: hasEmail ? "var(--primary)" : "#7c3aed",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0
                          }}>
                            {hasEmail ? <Mail size={15} /> : <MessageSquare size={15} />}
                          </div>
                          <div>
                            <span 
                              onClick={() => openEditModal(template)}
                              style={{ fontWeight: 600, color: "var(--dark)", cursor: "pointer", display: "block" }}
                            >
                              {template.name}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "1rem 1.25rem" }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const currentStatus = template.status || "Active";
                            const cycle = { "Active": "Draft", "Draft": "Inactive", "Inactive": "Active" };
                            const next = cycle[currentStatus] || "Active";
                            updateTemplateStatus(template.name, next);
                            toast.success(`Template "${template.name}" marked as ${next}`);
                          }}
                          style={{
                            border: "none",
                            cursor: "pointer",
                            padding: "0.22rem 0.65rem",
                            borderRadius: "9999px",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            fontFamily: "var(--font-display)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.3rem",
                            backgroundColor: (template.status || "Active") === "Active" ? "#ecfdf5" : template.status === "Draft" ? "#fef3c7" : "#f1f5f9",
                            color: (template.status || "Active") === "Active" ? "#065f46" : template.status === "Draft" ? "#92400e" : "#475569",
                            border: (template.status || "Active") === "Active" ? "1px solid rgba(16,185,129,0.3)" : template.status === "Draft" ? "1px solid rgba(245,158,11,0.3)" : "1px solid rgba(148,163,184,0.3)",
                            transition: "all 0.15s ease"
                          }}
                          title="Click to cycle status: Active -> Draft -> Inactive"
                        >
                          <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: (template.status || "Active") === "Active" ? "#10b981" : template.status === "Draft" ? "#f59e0b" : "#94a3b8" }}></span>
                          {template.status || "Active"}
                        </button>
                      </td>
                      <td style={{ padding: "1rem 1.25rem" }}>
                        <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
                          {hasEmail && (
                            <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--primary)", backgroundColor: "rgba(20, 86, 240, 0.08)", padding: "0.15rem 0.5rem", borderRadius: "9999px" }}>
                              Email
                            </span>
                          )}
                          {hasSms && (
                            <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#7c3aed", backgroundColor: "rgba(139, 92, 246, 0.08)", padding: "0.15rem 0.5rem", borderRadius: "9999px" }}>
                              SMS
                            </span>
                          )}
                          {hasPush && (
                            <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#059669", backgroundColor: "rgba(16, 185, 129, 0.08)", padding: "0.15rem 0.5rem", borderRadius: "9999px" }}>
                              Push
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "1rem 1.25rem", color: "var(--dark)", fontWeight: 500, maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {template.subject || "—"}
                      </td>
                      <td style={{ padding: "1rem 1.25rem", color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "280px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {previewSnippet || "—"}
                      </td>
                      <td style={{ padding: "1rem 1.25rem" }}>
                        {usedCount > 0 ? (
                          <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "#15803d", backgroundColor: "#dcfce7", padding: "0.2rem 0.55rem", borderRadius: "9999px", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                            <CheckCircle2 size={11} /> {usedCount} {usedCount === 1 ? "pipeline" : "pipelines"}
                          </span>
                        ) : (
                          <span style={{ fontSize: "0.74rem", fontWeight: 600, color: "var(--text-subtle)", backgroundColor: "#f1f5f9", padding: "0.2rem 0.55rem", borderRadius: "9999px" }}>
                            Unlinked
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "1rem 1.25rem", textAlign: "right" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.4rem", alignItems: "center" }}>
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{ padding: "0.25rem 0.55rem", fontSize: "0.78rem", height: "auto" }}
                            onClick={() => setPreviewTemplate(template)}
                            title="Preview"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{ padding: "0.25rem 0.55rem", fontSize: "0.78rem", height: "auto", color: "var(--primary)" }}
                            onClick={(e) => handleOpenSendTest(template, e)}
                            title="Send Test"
                          >
                            <Send size={13} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{ padding: "0.25rem 0.55rem", fontSize: "0.78rem", height: "auto" }}
                            onClick={() => openEditModal(template)}
                            title="Edit"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDelete(template.name, e)}
                            style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "0.25rem" }}
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div 
          style={{ 
            position: "fixed", 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: "rgba(15, 23, 42, 0.55)", 
            zIndex: 999, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            backdropFilter: "blur(4px)",
            padding: "1rem"
          }} 
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            style={{ 
              width: "min(960px, 95vw)", 
              height: "min(880px, 92vh)", 
              maxHeight: "92vh",
              backgroundColor: "rgba(255, 255, 255, 0.97)", 
              backdropFilter: "blur(24px)", 
              border: "1px solid rgba(255, 255, 255, 0.85)", 
              borderRadius: "28px", 
              boxShadow: "0 25px 60px -12px rgba(15, 23, 42, 0.28)", 
              display: "flex", 
              flexDirection: "column", 
              overflow: "hidden", 
              animation: "slideInUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)" 
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: "1.25rem 2rem", borderBottom: "1px solid rgba(15,23,42,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#ffffff", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: "700", fontFamily: "var(--font-display)", margin: 0, color: "var(--dark)" }}>
                  {editingTemplateName ? `Edit Template: ${editingTemplateName}` : "Create New Template"}
                </h2>
                <span style={{ 
                  fontFamily: "var(--font-display)",
                  fontSize: "11px", 
                  fontWeight: "700", 
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  padding: "0.2rem 0.65rem", 
                  borderRadius: "9999px", 
                  backgroundColor: "rgba(20, 86, 240, 0.08)", 
                  border: "1px solid rgba(20, 86, 240, 0.2)",
                  color: "var(--primary)" 
                }}>
                  {editingTemplateName ? "Configured" : "Draft"}
                </span>
              </div>
              <button 
                type="button"
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "0.5rem", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }} 
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"} 
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"} 
                onClick={() => setIsModalOpen(false)}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Secondary Pill Switcher Tab Bar (Design_1.md standard) */}
            <div style={{ 
              padding: "0.85rem 2rem", 
              borderBottom: "1px solid rgba(15,23,42,0.06)", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between", 
              backgroundColor: "rgba(248,250,252,0.85)", 
              flexShrink: 0 
            }}>
              <div style={{ 
                display: "inline-flex", 
                padding: "0.25rem", 
                backgroundColor: "rgba(255, 255, 255, 0.9)", 
                backdropFilter: "blur(12px)", 
                border: "1px solid rgba(226, 232, 240, 0.9)", 
                borderRadius: "9999px", 
                gap: "0.25rem", 
                boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.02)" 
              }}>
                <button
                  type="button"
                  onClick={() => setActiveTab("email")}
                  style={{
                    padding: "0.45rem 1.15rem",
                    borderRadius: "9999px",
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "0.825rem",
                    letterSpacing: "0.01em",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    background: activeTab === "email" ? "var(--navy-gradient)" : "transparent",
                    color: activeTab === "email" ? "#ffffff" : "#45515e",
                    boxShadow: activeTab === "email" ? "0 3px 10px rgba(24, 30, 37, 0.28)" : "none"
                  }}
                >
                  <Mail size={15} /> Email Config
                  <span style={{ 
                    fontSize: "10px", 
                    padding: "1px 6px", 
                    borderRadius: "100px", 
                    fontWeight: 700, 
                    background: activeTab === "email" ? "rgba(255,255,255,0.25)" : "rgba(15,23,42,0.06)", 
                    color: activeTab === "email" ? "#ffffff" : "#64748b" 
                  }}>
                    Primary
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("sms")}
                  style={{
                    padding: "0.45rem 1.15rem",
                    borderRadius: "9999px",
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "0.825rem",
                    letterSpacing: "0.01em",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    background: activeTab === "sms" ? "var(--navy-gradient)" : "transparent",
                    color: activeTab === "sms" ? "#ffffff" : "#45515e",
                    boxShadow: activeTab === "sms" ? "0 3px 10px rgba(24, 30, 37, 0.28)" : "none"
                  }}
                >
                  <MessageSquare size={15} /> SMS Config
                  {(formData.smsTwilioEnabled || formData.smsMsg91Enabled || formData.smsBulkEnabled) && (
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: activeTab === "sms" ? "#ffffff" : "#10b981", display: "inline-block" }} />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("push")}
                  style={{
                    padding: "0.45rem 1.15rem",
                    borderRadius: "9999px",
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "0.825rem",
                    letterSpacing: "0.01em",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    background: activeTab === "push" ? "var(--navy-gradient)" : "transparent",
                    color: activeTab === "push" ? "#ffffff" : "#45515e",
                    boxShadow: activeTab === "push" ? "0 3px 10px rgba(24, 30, 37, 0.28)" : "none"
                  }}
                >
                  <Smartphone size={15} /> Push Config
                  {formData.pushContent && (
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: activeTab === "push" ? "#ffffff" : "#10b981", display: "inline-block" }} />
                  )}
                </button>
              </div>

              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Sparkles size={13} style={{ color: "var(--primary)" }} />
                <span>Supports dynamic variable tokens</span>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "1.75rem 2rem", overflowY: "auto", flex: 1, backgroundColor: "#fafafa" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: "1.25rem", marginBottom: "1.5rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", fontFamily: "var(--font-display)", color: "var(--dark)", marginBottom: "0.5rem" }}>
                    Template Name *
                  </label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Welcome Series 1"
                    style={{ width: "100%", padding: "0.75rem 1.15rem", border: "1px solid var(--border-color)", borderRadius: "14px", outline: "none", fontSize: "0.92rem", backgroundColor: "#ffffff", fontFamily: "var(--font-sans)" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", fontFamily: "var(--font-display)", color: "var(--dark)", marginBottom: "0.5rem" }}>
                    Lifecycle Status
                  </label>
                  <div style={{ display: "flex", gap: "0.25rem", padding: "0.3rem", backgroundColor: "#ffffff", border: "1px solid var(--border-color)", borderRadius: "14px" }}>
                    {[
                      { id: "Active", label: "Active", color: "#10b981", bg: "#ecfdf5", text: "#065f46" },
                      { id: "Draft", label: "Draft", color: "#f59e0b", bg: "#fef3c7", text: "#92400e" },
                      { id: "Inactive", label: "Inactive", color: "#94a3b8", bg: "#f1f5f9", text: "#475569" }
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, status: st.id })}
                        style={{
                          flex: 1,
                          padding: "0.45rem 0.5rem",
                          border: "none",
                          borderRadius: "10px",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.35rem",
                          backgroundColor: (formData.status || "Active") === st.id ? st.bg : "transparent",
                          color: (formData.status || "Active") === st.id ? st.text : "var(--text-muted)",
                          boxShadow: (formData.status || "Active") === st.id ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                          transition: "all 0.15s"
                        }}
                      >
                        <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: st.color }} />
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {activeTab === "email" && (
                <>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                      <label style={{ fontSize: "0.85rem", fontWeight: "600", fontFamily: "var(--font-display)", color: "var(--dark)" }}>
                        Email Subject *
                      </label>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Supports {`{{client_name}}`} etc.</span>
                    </div>
                    <input 
                      type="text" 
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Enter subject line..."
                      style={{ width: "100%", padding: "0.75rem 1.15rem", border: "1px solid var(--border-color)", borderRadius: "14px", outline: "none", fontSize: "0.92rem", backgroundColor: "#ffffff", fontFamily: "var(--font-sans)" }}
                    />
                  </div>
                  
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                      <label style={{ fontSize: "0.85rem", fontWeight: "600", fontFamily: "var(--font-display)", color: "var(--dark)" }}>
                        Email Content & Layout
                      </label>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Fully editable rich text & HTML</span>
                    </div>
                    <RichTextEditor 
                      value={formData.email}
                      onChange={(val) => setFormData({ ...formData, email: val })}
                    />
                  </div>
                </>
              )}

              {activeTab === "sms" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  {/* Twilio Card */}
                  <div style={{ border: "1px solid rgba(226, 232, 240, 0.9)", borderRadius: "16px", overflow: "hidden", backgroundColor: "#ffffff", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
                    <div 
                      style={{ padding: "1.1rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem", cursor: "pointer", backgroundColor: expandedSms === "Twilio" ? "rgba(248, 250, 252, 0.8)" : "#ffffff", borderBottom: expandedSms === "Twilio" ? "1px solid var(--border-color)" : "none" }} 
                      onClick={() => setExpandedSms(expandedSms === "Twilio" ? "" : "Twilio")}
                    >
                      <input 
                        type="checkbox" 
                        checked={formData.smsTwilioEnabled} 
                        onChange={(e) => setFormData({ ...formData, smsTwilioEnabled: e.target.checked })} 
                        onClick={(e) => e.stopPropagation()} 
                        style={{ cursor: "pointer", width: "18px", height: "18px", accentColor: "var(--primary)" }} 
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span style={{ fontWeight: "700", fontFamily: "var(--font-display)", color: "var(--dark)", fontSize: "0.95rem" }}>Twilio Cloud SMS</span>
                          <span style={{ 
                            fontSize: "11px", 
                            fontWeight: "700", 
                            fontFamily: "var(--font-display)", 
                            padding: "0.15rem 0.5rem", 
                            borderRadius: "100px", 
                            backgroundColor: formData.smsTwilioEnabled ? "rgba(16, 185, 129, 0.1)" : "rgba(100, 116, 139, 0.1)",
                            color: formData.smsTwilioEnabled ? "#059669" : "#64748b"
                          }}>
                            {formData.smsTwilioEnabled ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Standard international transactional SMS gateway</span>
                      </div>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{expandedSms === "Twilio" ? "▲" : "▼"}</span>
                    </div>

                    {expandedSms === "Twilio" && (
                      <div style={{ padding: "1.25rem 1.5rem", backgroundColor: "#fafafa" }}>
                        <div style={{ marginBottom: "0.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <label style={{ fontSize: "0.85rem", fontWeight: "600", fontFamily: "var(--font-display)", color: "var(--dark)" }}>SMS Content</label>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            {(formData.smsTwilioContent || "").length} chars • {Math.ceil((formData.smsTwilioContent || "").length / 160) || 1} segment(s)
                          </span>
                        </div>
                        <textarea 
                          value={formData.smsTwilioContent}
                          onChange={(e) => setFormData({ ...formData, smsTwilioContent: e.target.value })}
                          placeholder="Enter plain text message for SMS notifications... e.g. Hi {{client_name}}, your appointment is confirmed."
                          style={{ width: "100%", padding: "1rem", border: "1px solid var(--border-color)", borderRadius: "12px", outline: "none", minHeight: "120px", resize: "vertical", fontFamily: "inherit", fontSize: "0.92rem", backgroundColor: "#ffffff" }}
                        />
                        <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.4rem", alignItems: "center", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>Insert:</span>
                          {["client_name", "provider_name", "session_date", "session_time"].map((token) => (
                            <button
                              key={token}
                              type="button"
                              onClick={() => setFormData({ ...formData, smsTwilioContent: (formData.smsTwilioContent || "") + ` {{${token}}}` })}
                              style={{ padding: "0.15rem 0.5rem", borderRadius: "100px", border: "1px solid rgba(20,86,240,0.2)", backgroundColor: "rgba(20,86,240,0.06)", color: "var(--primary)", fontSize: "0.75rem", fontWeight: "600", cursor: "pointer" }}
                            >
                              + {`{{${token}}}`}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* MSG91 Card */}
                  <div style={{ border: "1px solid rgba(226, 232, 240, 0.9)", borderRadius: "16px", overflow: "hidden", backgroundColor: "#ffffff", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
                    <div 
                      style={{ padding: "1.1rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem", cursor: "pointer", backgroundColor: expandedSms === "MSG91" ? "rgba(248, 250, 252, 0.8)" : "#ffffff", borderBottom: expandedSms === "MSG91" ? "1px solid var(--border-color)" : "none" }} 
                      onClick={() => setExpandedSms(expandedSms === "MSG91" ? "" : "MSG91")}
                    >
                      <input 
                        type="checkbox" 
                        checked={formData.smsMsg91Enabled} 
                        onChange={(e) => setFormData({ ...formData, smsMsg91Enabled: e.target.checked })} 
                        onClick={(e) => e.stopPropagation()} 
                        style={{ cursor: "pointer", width: "18px", height: "18px", accentColor: "var(--primary)" }} 
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span style={{ fontWeight: "700", fontFamily: "var(--font-display)", color: "var(--dark)", fontSize: "0.95rem" }}>MSG91 SMS Gateway</span>
                          <span style={{ 
                            fontSize: "11px", 
                            fontWeight: "700", 
                            fontFamily: "var(--font-display)", 
                            padding: "0.15rem 0.5rem", 
                            borderRadius: "100px", 
                            backgroundColor: formData.smsMsg91Enabled ? "rgba(16, 185, 129, 0.1)" : "rgba(100, 116, 139, 0.1)",
                            color: formData.smsMsg91Enabled ? "#059669" : "#64748b"
                          }}>
                            {formData.smsMsg91Enabled ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Indian DLT compliant transactional SMS route</span>
                      </div>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{expandedSms === "MSG91" ? "▲" : "▼"}</span>
                    </div>

                    {expandedSms === "MSG91" && (
                      <div style={{ padding: "1.25rem 1.5rem", backgroundColor: "#fafafa", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                          <div>
                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", fontFamily: "var(--font-display)", color: "var(--dark)", marginBottom: "0.4rem" }}>Select Sender ID *</label>
                            <CustomSelect value={defaultSenderId} onChange={(val) => { if(val === "ADD_NEW") setShowAddSenderId(true); }} options={senderIdOptions} style={{ width: "100%", padding: "0.7rem", borderRadius: "10px", border: "1px solid var(--border-color)", backgroundColor: "#ffffff" }} />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", fontFamily: "var(--font-display)", color: "var(--dark)", marginBottom: "0.4rem" }}>DLT Template ID</label>
                            <input 
                              type="text" 
                              value={formData.smsMsg91TemplateId} 
                              onChange={(e) => setFormData({ ...formData, smsMsg91TemplateId: e.target.value })}
                              placeholder="e.g. 1477178463446456650"
                              style={{ width: "100%", padding: "0.7rem 1rem", border: "1px solid var(--border-color)", borderRadius: "10px", outline: "none", fontSize: "0.92rem", backgroundColor: "#ffffff" }}
                            />
                          </div>
                        </div>

                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                            <label style={{ fontSize: "0.85rem", fontWeight: "600", fontFamily: "var(--font-display)", color: "var(--dark)" }}>SMS Content *</label>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                              {(formData.smsMsg91Content || "").length} chars
                            </span>
                          </div>
                          <textarea 
                            value={formData.smsMsg91Content} 
                            onChange={(e) => setFormData({ ...formData, smsMsg91Content: e.target.value })}
                            placeholder="Enter Message Here... Variables as ##name##, ##number##"
                            style={{ width: "100%", padding: "1rem", border: "1px solid var(--border-color)", borderRadius: "12px", outline: "none", minHeight: "120px", resize: "vertical", fontFamily: "inherit", fontSize: "0.92rem", backgroundColor: "#ffffff" }}
                          />
                          <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.4rem", alignItems: "center", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>Insert:</span>
                            {["name", "provider", "date", "time"].map((token) => (
                              <button
                                key={token}
                                type="button"
                                onClick={() => setFormData({ ...formData, smsMsg91Content: (formData.smsMsg91Content || "") + ` ##${token}##` })}
                                style={{ padding: "0.15rem 0.5rem", borderRadius: "100px", border: "1px solid rgba(20,86,240,0.2)", backgroundColor: "rgba(20,86,240,0.06)", color: "var(--primary)", fontSize: "0.75rem", fontWeight: "600", cursor: "pointer" }}
                              >
                                + {`##${token}##`}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bulk SMS Gateway Card */}
                  <div style={{ border: "1px solid rgba(226, 232, 240, 0.9)", borderRadius: "16px", overflow: "hidden", backgroundColor: "#ffffff", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
                    <div 
                      style={{ padding: "1.1rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem", cursor: "pointer", backgroundColor: expandedSms === "Bulk" ? "rgba(248, 250, 252, 0.8)" : "#ffffff", borderBottom: expandedSms === "Bulk" ? "1px solid var(--border-color)" : "none" }} 
                      onClick={() => setExpandedSms(expandedSms === "Bulk" ? "" : "Bulk")}
                    >
                      <input 
                        type="checkbox" 
                        checked={formData.smsBulkEnabled} 
                        onChange={(e) => setFormData({ ...formData, smsBulkEnabled: e.target.checked })} 
                        onClick={(e) => e.stopPropagation()} 
                        style={{ cursor: "pointer", width: "18px", height: "18px", accentColor: "var(--primary)" }} 
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span style={{ fontWeight: "700", fontFamily: "var(--font-display)", color: "var(--dark)", fontSize: "0.95rem" }}>Bulk SMS Gateway</span>
                          <span style={{ 
                            fontSize: "11px", 
                            fontWeight: "700", 
                            fontFamily: "var(--font-display)", 
                            padding: "0.15rem 0.5rem", 
                            borderRadius: "100px", 
                            backgroundColor: formData.smsBulkEnabled ? "rgba(16, 185, 129, 0.1)" : "rgba(100, 116, 139, 0.1)",
                            color: formData.smsBulkEnabled ? "#059669" : "#64748b"
                          }}>
                            {formData.smsBulkEnabled ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>High-throughput bulk dispatch gateway</span>
                      </div>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{expandedSms === "Bulk" ? "▲" : "▼"}</span>
                    </div>

                    {expandedSms === "Bulk" && (
                      <div style={{ padding: "1.25rem 1.5rem", backgroundColor: "#fafafa", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                          <div>
                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", fontFamily: "var(--font-display)", color: "var(--dark)", marginBottom: "0.4rem" }}>Select Sender ID *</label>
                            <CustomSelect value={defaultSenderId} onChange={(val) => { if(val === "ADD_NEW") setShowAddSenderId(true); }} options={senderIdOptions} style={{ width: "100%", padding: "0.7rem", borderRadius: "10px", border: "1px solid var(--border-color)", backgroundColor: "#ffffff" }} />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", fontFamily: "var(--font-display)", color: "var(--dark)", marginBottom: "0.4rem" }}>DLT Template ID</label>
                            <input 
                              type="text" 
                              value={formData.smsBulkTemplateId} 
                              onChange={(e) => setFormData({ ...formData, smsBulkTemplateId: e.target.value })}
                              placeholder="e.g. 1477178463446456650"
                              style={{ width: "100%", padding: "0.7rem 1rem", border: "1px solid var(--border-color)", borderRadius: "10px", outline: "none", fontSize: "0.92rem", backgroundColor: "#ffffff" }}
                            />
                          </div>
                        </div>

                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                            <label style={{ fontSize: "0.85rem", fontWeight: "600", fontFamily: "var(--font-display)", color: "var(--dark)" }}>SMS Content *</label>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                              {(formData.smsBulkContent || "").length} chars
                            </span>
                          </div>
                          <textarea 
                            value={formData.smsBulkContent} 
                            onChange={(e) => setFormData({ ...formData, smsBulkContent: e.target.value })}
                            placeholder="Enter Message Here... Variables as {#var#}"
                            style={{ width: "100%", padding: "1rem", border: "1px solid var(--border-color)", borderRadius: "12px", outline: "none", minHeight: "120px", resize: "vertical", fontFamily: "inherit", fontSize: "0.92rem", backgroundColor: "#ffffff" }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "push" && (
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1.5rem" }}>
                  <div>
                    <div style={{ marginBottom: "1.25rem" }}>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", fontFamily: "var(--font-display)", color: "var(--dark)", marginBottom: "0.5rem" }}>
                        Push Notification Title
                      </label>
                      <input 
                        type="text"
                        value={formData.pushTitle || formData.subject || ""}
                        onChange={(e) => setFormData({ ...formData, pushTitle: e.target.value })}
                        placeholder="e.g. New Session Update"
                        style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid var(--border-color)", borderRadius: "12px", outline: "none", fontSize: "0.92rem", backgroundColor: "#ffffff" }}
                      />
                    </div>

                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                        <label style={{ fontSize: "0.85rem", fontWeight: "600", fontFamily: "var(--font-display)", color: "var(--dark)" }}>
                          Push Notification Message Body
                        </label>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {(formData.pushContent || "").length} / 180 chars
                        </span>
                      </div>
                      <textarea 
                        value={formData.pushContent}
                        onChange={(e) => setFormData({ ...formData, pushContent: e.target.value })}
                        placeholder="Enter short, concise text for mobile push notifications..."
                        style={{ width: "100%", padding: "1rem", border: "1px solid var(--border-color)", borderRadius: "14px", outline: "none", minHeight: "140px", resize: "vertical", fontFamily: "inherit", fontSize: "0.92rem", backgroundColor: "#ffffff" }}
                      />
                      <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.4rem", alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>Insert:</span>
                        {["client_name", "provider_name", "session_date", "session_time"].map((token) => (
                          <button
                            key={token}
                            type="button"
                            onClick={() => setFormData({ ...formData, pushContent: (formData.pushContent || "") + ` {{${token}}}` })}
                            style={{ padding: "0.2rem 0.55rem", borderRadius: "100px", border: "1px solid rgba(20,86,240,0.2)", backgroundColor: "rgba(20,86,240,0.06)", color: "var(--primary)", fontSize: "0.75rem", fontWeight: "600", cursor: "pointer" }}
                          >
                            + {`{{${token}}}`}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Push Mobile Mockup Preview */}
                  <div style={{ backgroundColor: "#ffffff", border: "1px solid var(--border-color)", borderRadius: "16px", padding: "1.25rem", display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", color: "#94a3b8", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                      <Smartphone size={14} /> Lock Screen Preview
                    </span>
                    <div style={{ backgroundColor: "#0f172a", borderRadius: "20px", padding: "1.25rem 1rem", color: "#ffffff", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                      <div style={{ backgroundColor: "rgba(255,255,255,0.14)", backdropFilter: "blur(12px)", borderRadius: "14px", padding: "0.85rem", border: "1px solid rgba(255,255,255,0.12)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                            <div style={{ width: "16px", height: "16px", borderRadius: "4px", backgroundColor: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: "800" }}>M</div>
                            <span style={{ fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.02em" }}>MantraCare</span>
                          </div>
                          <span style={{ fontSize: "0.7rem", opacity: 0.6 }}>now</span>
                        </div>
                        <div style={{ fontWeight: "700", fontSize: "0.85rem", marginBottom: "0.2rem" }}>
                          {formData.pushTitle || formData.subject || "Appointment Reminder"}
                        </div>
                        <div style={{ fontSize: "0.78rem", opacity: 0.85, lineHeight: "1.4" }}>
                          {renderSubstitutedText(formData.pushContent || "Tap to review your upcoming session with MantraCare.")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Modal Footer (Design_1.md standards) */}
            <div style={{ 
              padding: "1.1rem 2rem", 
              borderTop: "1px solid var(--border-color)", 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              backgroundColor: "#ffffff", 
              flexShrink: 0,
              boxShadow: "0 -4px 16px rgba(0,0,0,0.03)"
            }}>
              <button 
                type="button" 
                className="btn btn-outline"
                style={{ fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
                onClick={() => {
                  setPreviewTemplate({
                    name: formData.name || "Draft Template",
                    subject: formData.subject,
                    email: formData.email,
                    text: formData.smsTwilioContent || formData.smsMsg91Content || formData.smsBulkContent || formData.email
                  });
                }}
              >
                <Eye size={15} /> Preview Template
              </button>

              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleSave}
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem" }}
                >
                  <Check size={16} /> Save Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showAddSenderId && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15, 23, 42, 0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(2px)" }}>
          <div style={{ width: "500px", backgroundColor: "rgba(255,255,255,0.92)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.7)", borderRadius: "1.75rem", boxShadow: "0 24px 60px rgba(15,23,42,0.18)", display: "flex", flexDirection: "column", padding: "2rem" }}>
            <h3 style={{ margin: "0 0 1.5rem 0", fontSize: "1.2rem", fontWeight: "700", fontFamily: "var(--font-display)", color: "var(--dark)" }}>Add Sender ID</h3>
            
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
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(15,23,42,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "rgba(248,250,252,0.8)" }}>
              <div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: "700", fontFamily: "var(--font-display)", color: "var(--dark)", margin: 0 }}>
                  Template Preview
                </h3>
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  Template: <strong>{previewTemplate.name}</strong>
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                {/* Channel Switcher if SMS available */}
                {(previewTemplate.smsTwilioContent || previewTemplate.smsMsg91Content || previewTemplate.smsBulkContent || previewTemplate.sms) && (
                  <div style={{ display: "flex", backgroundColor: "rgba(15,23,42,0.06)", borderRadius: "100px", padding: "2px" }}>
                    <button
                      type="button"
                      onClick={() => setPreviewChannel("email")}
                      style={{
                        padding: "4px 10px",
                        border: "none",
                        borderRadius: "100px",
                        backgroundColor: previewChannel === "email" ? "var(--navy-gradient, linear-gradient(135deg,#181e25,#2c3e50))" : "transparent",
                        color: previewChannel === "email" ? "white" : "var(--text-muted)",
                        cursor: "pointer",
                        fontSize: "0.75rem",
                        fontWeight: "600"
                      }}
                    >
                      Email
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewChannel("sms")}
                      style={{
                        padding: "4px 10px",
                        border: "none",
                        borderRadius: "100px",
                        backgroundColor: previewChannel === "sms" ? "var(--navy-gradient, linear-gradient(135deg,#181e25,#2c3e50))" : "transparent",
                        color: previewChannel === "sms" ? "white" : "var(--text-muted)",
                        cursor: "pointer",
                        fontSize: "0.75rem",
                        fontWeight: "600"
                      }}
                    >
                      SMS
                    </button>
                  </div>
                )}

                {/* Device Switcher */}
                <div style={{ display: "flex", backgroundColor: "rgba(15,23,42,0.06)", borderRadius: "100px", padding: "2px" }}>
                  <button 
                    type="button" 
                    onClick={() => setPreviewDevice("desktop")}
                    style={{ 
                      padding: "4px 10px", 
                      border: "none", 
                      borderRadius: "100px", 
                      backgroundColor: previewDevice === "desktop" ? "var(--navy-gradient, linear-gradient(135deg,#181e25,#2c3e50))" : "transparent", 
                      color: previewDevice === "desktop" ? "white" : "var(--text-muted)", 
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
                      padding: "4px 10px", 
                      border: "none", 
                      borderRadius: "100px", 
                      backgroundColor: previewDevice === "mobile" ? "var(--navy-gradient, linear-gradient(135deg,#181e25,#2c3e50))" : "transparent", 
                      color: previewDevice === "mobile" ? "white" : "var(--text-muted)", 
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

            {/* Content Meta Headers */}
            {previewChannel === "email" ? (
              <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border-color)", backgroundColor: "#ffffff", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <div><span style={{ color: "var(--text-muted)", fontWeight: "600" }}>From:</span> MantraCare Notifications &lt;donotreply@mantra.care&gt;</div>
                <div><span style={{ color: "var(--text-muted)", fontWeight: "600" }}>To:</span> Jordan Lee &lt;jordan.lee@example.com&gt;</div>
                <div><span style={{ color: "var(--text-muted)", fontWeight: "600" }}>Subject:</span> <strong>{renderSubstitutedText(previewTemplate.subject)}</strong></div>
              </div>
            ) : (
              <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border-color)", backgroundColor: "#ffffff", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <div><span style={{ color: "var(--text-muted)", fontWeight: "600" }}>Sender ID:</span> MANTRA</div>
                <div><span style={{ color: "var(--text-muted)", fontWeight: "600" }}>To:</span> +1 (800) 555-0199 (Jordan Lee)</div>
              </div>
            )}

            {/* Render Frame */}
            <div style={{ padding: "1.5rem", flex: 1, overflowY: "auto", backgroundColor: "#f8fafc", display: "flex", flexDirection: "column", alignItems: previewDevice === "mobile" ? "center" : "stretch" }}>
              <div 
                style={{ 
                  backgroundColor: "white", 
                  padding: "1.75rem", 
                  borderRadius: previewDevice === "mobile" ? "24px" : "8px", 
                  border: previewDevice === "mobile" ? "4px solid #334155" : "1px solid var(--border-color)", 
                  width: previewDevice === "mobile" ? "340px" : "100%",
                  minHeight: previewDevice === "mobile" ? "440px" : "220px", 
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                  boxSizing: "border-box"
                }}
              >
                {previewChannel === "email" ? (
                  <div dangerouslySetInnerHTML={{ __html: renderSubstitutedEmail(previewTemplate.email) }} />
                ) : (
                  <div style={{ whiteSpace: "pre-wrap", fontSize: "0.95rem", color: "var(--dark)", lineHeight: 1.6, padding: "0.5rem" }}>
                    {renderSubstitutedText(previewTemplate.smsTwilioContent || previewTemplate.smsMsg91Content || previewTemplate.smsBulkContent || previewTemplate.sms || previewTemplate.text || "No SMS text configured.")}
                  </div>
                )}
              </div>

              <div style={{ marginTop: "1rem", padding: "0.75rem 1rem", borderRadius: "8px", backgroundColor: "#fef9c3", border: "1px solid #fef08a", fontSize: "0.8rem", color: "#854d0e", width: "100%", boxSizing: "border-box" }}>
                <strong>Substituted dynamic variables:</strong> <code>client_name</code> &rarr; &quot;Jordan Lee&quot;, <code>provider_name</code> &rarr; &quot;Dr. Amara Singh&quot;, <code>session_date</code> &rarr; &quot;Aug 20, 2026&quot;
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid var(--border-color)", backgroundColor: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button 
                type="button" 
                className="btn btn-primary"
                style={{ padding: "0.5rem 1.1rem", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
                onClick={() => {
                  const targetTpl = previewTemplate;
                  setPreviewTemplate(null);
                  handleOpenSendTest(targetTpl);
                }}
              >
                <Send size={14} /> Configure & Send Test Dispatch
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setPreviewTemplate(null)}>
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Send Test Dispatch Modal */}
      {testModalTemplate && (
        <div 
          style={{ 
            position: "fixed", 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: "rgba(15,23,42,0.6)", 
            backdropFilter: "blur(4px)", 
            zIndex: 1000, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            padding: "1rem" 
          }}
          onClick={() => setTestModalTemplate(null)}
        >
          <div 
            className="card" 
            style={{ 
              width: "100%", 
              maxWidth: "620px", 
              backgroundColor: "white", 
              borderRadius: "1.25rem", 
              boxShadow: "0 24px 48px -12px rgba(15,23,42,0.25)", 
              border: "1px solid rgba(226,232,240,0.9)", 
              overflow: "hidden", 
              display: "flex", 
              flexDirection: "column",
              animation: "fadeIn 0.2s ease-out"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #e2e8f0", backgroundColor: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(20,86,240,0.1)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Send size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--dark)", margin: 0 }}>
                    Send Test Dispatch
                  </h3>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    Template: <strong style={{ color: "var(--primary)" }}>{testModalTemplate.name}</strong>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setTestModalTemplate(null)} 
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "0.25rem" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem", maxHeight: "70vh", overflowY: "auto" }}>
              
              {/* Channel Selector */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--dark)", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Dispatch Channel
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <button
                    type="button"
                    onClick={() => setTestChannel("Email")}
                    style={{
                      padding: "0.75rem",
                      borderRadius: "10px",
                      border: testChannel === "Email" ? "2px solid var(--primary)" : "1px solid #e2e8f0",
                      backgroundColor: testChannel === "Email" ? "rgba(20,86,240,0.04)" : "#ffffff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      textAlign: "left",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <Mail size={18} color={testChannel === "Email" ? "var(--primary)" : "#64748b"} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.88rem", color: testChannel === "Email" ? "var(--primary)" : "var(--dark)" }}>Email Dispatch</div>
                      <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>Via active SMTP / SES</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTestChannel("SMS")}
                    style={{
                      padding: "0.75rem",
                      borderRadius: "10px",
                      border: testChannel === "SMS" ? "2px solid var(--primary)" : "1px solid #e2e8f0",
                      backgroundColor: testChannel === "SMS" ? "rgba(20,86,240,0.04)" : "#ffffff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      textAlign: "left",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <MessageSquare size={18} color={testChannel === "SMS" ? "var(--primary)" : "#64748b"} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.88rem", color: testChannel === "SMS" ? "var(--primary)" : "var(--dark)" }}>SMS Dispatch</div>
                      <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>Via Twilio / Plivo Gateway</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Recipient Destination Input */}
              <div style={{ backgroundColor: "#f8fafc", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                {testChannel === "Email" ? (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                      <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--dark)" }}>
                        Recipient Destination Email <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Sender: donotreply@mantra.care</span>
                    </div>
                    <input
                      type="email"
                      className="form-control"
                      value={testRecipientEmail}
                      onChange={(e) => setTestRecipientEmail(e.target.value)}
                      placeholder="e.g. yourname@company.com or test@mantracare.com"
                      style={{ backgroundColor: "white", fontSize: "0.9rem", width: "100%", boxSizing: "border-box" }}
                      required
                    />
                    <p style={{ margin: "0.35rem 0 0 0", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      The test email will be addressed directly to this recipient with rendered dynamic variables.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                      <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--dark)" }}>
                        Recipient Phone Number <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Sender ID: MANTRA</span>
                    </div>
                    <input
                      type="tel"
                      className="form-control"
                      value={testRecipientPhone}
                      onChange={(e) => setTestRecipientPhone(e.target.value)}
                      placeholder="e.g. +1 (555) 019-2834 or +91 9876543210"
                      style={{ backgroundColor: "white", fontSize: "0.9rem", width: "100%", boxSizing: "border-box" }}
                      required
                    />
                    <p style={{ margin: "0.35rem 0 0 0", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      Provide country code and mobile number to receive the simulated SMS payload.
                    </p>
                  </div>
                )}
              </div>

              {/* Dynamic Variables Customizer */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--dark)", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Test Substitution Variables
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
                  <div>
                    <span style={{ fontSize: "0.74rem", fontWeight: 600, color: "var(--text-muted)" }}>client_name</span>
                    <input
                      type="text"
                      className="form-control"
                      value={testVariables.client_name}
                      onChange={(e) => setTestVariables({ ...testVariables, client_name: e.target.value })}
                      style={{ fontSize: "0.82rem", padding: "0.35rem 0.6rem", width: "100%", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: "0.74rem", fontWeight: 600, color: "var(--text-muted)" }}>provider_name</span>
                    <input
                      type="text"
                      className="form-control"
                      value={testVariables.provider_name}
                      onChange={(e) => setTestVariables({ ...testVariables, provider_name: e.target.value })}
                      style={{ fontSize: "0.82rem", padding: "0.35rem 0.6rem", width: "100%", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: "0.74rem", fontWeight: 600, color: "var(--text-muted)" }}>session_date</span>
                    <input
                      type="text"
                      className="form-control"
                      value={testVariables.session_date}
                      onChange={(e) => setTestVariables({ ...testVariables, session_date: e.target.value })}
                      style={{ fontSize: "0.82rem", padding: "0.35rem 0.6rem", width: "100%", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: "0.74rem", fontWeight: 600, color: "var(--text-muted)" }}>session_time</span>
                    <input
                      type="text"
                      className="form-control"
                      value={testVariables.session_time}
                      onChange={(e) => setTestVariables({ ...testVariables, session_time: e.target.value })}
                      style={{ fontSize: "0.82rem", padding: "0.35rem 0.6rem", width: "100%", boxSizing: "border-box" }}
                    />
                  </div>
                </div>
              </div>

              {/* Substituted Payload Preview Box */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--dark)", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Live Dispatched Payload Preview
                </label>
                <div 
                  style={{ 
                    maxHeight: "150px", 
                    overflowY: "auto", 
                    padding: "0.75rem 1rem", 
                    borderRadius: "8px", 
                    backgroundColor: "#f8fafc", 
                    border: "1px solid #e2e8f0", 
                    fontSize: "0.82rem" 
                  }}
                >
                  {testChannel === "Email" ? (
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--dark)", marginBottom: "0.4rem" }}>
                        Subject: {renderSubstitutedText(testModalTemplate.subject, testVariables)}
                      </div>
                      <div 
                        dangerouslySetInnerHTML={{ __html: renderSubstitutedEmail(testModalTemplate.email, testVariables) }} 
                        style={{ borderTop: "1px solid #e2e8f0", paddingTop: "0.5rem" }}
                      />
                    </div>
                  ) : (
                    <div style={{ whiteSpace: "pre-wrap", color: "var(--dark)", lineHeight: 1.5 }}>
                      {renderSubstitutedText(
                        testModalTemplate.smsTwilioContent || testModalTemplate.smsMsg91Content || testModalTemplate.smsBulkContent || testModalTemplate.sms || testModalTemplate.text || "Hello {{client_name}}, your session with {{provider_name}} is confirmed.",
                        testVariables
                      )}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #e2e8f0", backgroundColor: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => setTestModalTemplate(null)}
                disabled={isSendingTest}
              >
                Cancel
              </button>
              
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={handleExecuteSendTest}
                disabled={isSendingTest}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", minWidth: "160px", justifyContent: "center" }}
              >
                {isSendingTest ? (
                  <>
                    <span className="spinner" style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.6s linear infinite" }}></span>
                    Dispatching...
                  </>
                ) : (
                  <>
                    <Send size={15} /> Send Test Dispatch
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
