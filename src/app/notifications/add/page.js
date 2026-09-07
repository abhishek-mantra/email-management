"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useNotifications } from "@/context/NotificationContext";
import dynamic from "next/dynamic";
import { ArrowLeft, Save, Smartphone, Mail, MessageSquare, Info, Monitor, X, ChevronDown, ChevronUp, ChevronRight, Variable, Eye, Send } from "lucide-react";
import Link from "next/link";
import "react-quill-new/dist/quill.snow.css";
import toast from "react-hot-toast";
import CustomSelect from "@/components/CustomSelect";

// Dynamically import ReactQuill to prevent SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const APP_SCREENS = [
  "Pain Areas", "Depression", "Physic Neck", "Anxiety", "Stress",
  "Adolescent", "Workplace", "Sleep", "Parenting", "Grief",
  "Acceptance", "Postpartum", "Sexuality", "Eating Disorder",
  "Emotional Wellbeing", "UserStats"
]
const CORPORATES = ["EY", "Google", "Microsoft", "Amazon", "Apple", "Netflix", "Accenture", "Deloitte"];
const TIMEZONES = ["IST (GMT+5:30)", "EST (GMT-5:00)", "PST (GMT-8:00)", "GMT (GMT+0:00)"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const EMAIL_PROVIDERS = {
  Sendgrid: ["donotreply@mantra.care", "support@mantra.care", "provider@mantra.care"],
  Brevo: ["donotreply@mantra.care", "donotreply@mantracare.com", "provider@mantra.care", "provider@mantracare.com"],
  SES: ["donotreply@mantra.care", "donotreply@mantracare.org", "provider@mantra.care", "provider@mantracare.org"]
};

// Removed hardcoded NOTIFICATION_TEMPLATES

const NOTIFICATION_VARIABLES = [
  { label: "Client Name", value: "{{client_name}}" },
  { label: "Order ID", value: "{{order_id}}" },
  { label: "Provider Name", value: "{{provider_name}}" },
  { label: "Session Date", value: "{{session_date}}" },
  { label: "Session Time", value: "{{session_time}}" },
  { label: "Session Link", value: "{{session_link}}" }
];

const SAMPLE_VARIABLE_MAP = {
  client_name: "Jordan Lee",
  order_id: "ORD-98231",
  provider_name: "Dr. Amara Singh",
  session_date: "Aug 20, 2026",
  session_time: "10:30 AM",
  session_link: "https://meet.mantra.care/session/jordan-lee"
};

const VariableDropdown = ({ onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="tooltip-container" ref={dropdownRef}>
      <button 
        type="button"
        style={{ padding: "0.35rem 0.8rem", fontSize: "0.78rem", borderRadius: "9999px", backgroundColor: "white", border: "1px solid #cbd5e1", color: "var(--primary)", display: "flex", alignItems: "center", gap: "0.3rem", cursor: "pointer", transition: "all 0.2s", fontWeight: "600" }}
        onClick={() => setIsOpen(!isOpen)}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = "white"}
      >
        <span style={{ fontSize: "1rem", fontWeight: "300", lineHeight: 1 }}>+</span> Variables
      </button>
      {isOpen && (
        <div style={{ position: "absolute", zIndex: 100, top: "100%", right: 0, marginTop: "0.5rem", width: "320px", backgroundColor: "white", borderRadius: "8px", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)", border: "1px solid var(--border-color)", padding: "0.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.25rem" }}>
            {NOTIFICATION_VARIABLES.map(v => (
              <button
                key={v.value}
                type="button"
                style={{ textAlign: "left", padding: "0.5rem 0.75rem", background: "none", border: "1px solid transparent", borderRadius: "6px", cursor: "pointer", display: "flex", flexDirection: "column", gap: "0.2rem", transition: "all 0.2s" }}
                onClick={() => { onSelect(v.value); setIsOpen(false); }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#f8fafc"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.borderColor = "transparent"; }}
              >
                <span style={{ fontWeight: "500", color: "var(--dark)", fontSize: "0.8rem" }}>{v.label}</span>
                <span style={{ color: "var(--primary)", opacity: 0.8, fontSize: "0.7rem", fontFamily: "monospace" }}>{v.value}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

function AddNotificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const isBulk = searchParams.get("mode") === "bulk";
  const { notifications, triggers, addNotification, updateNotification, templates, addLog } = useNotifications();
  const existing = editId ? notifications.find(n => n.id === Number(editId)) : null;

  const [formData, setFormData] = useState(() => ({
    userType: existing?.userType || existing?.category || "Client",
    name: existing?.name || existing?.description || "",
    description: existing?.description || "",
    type: existing?.type || "App",
    actionScreen: existing?.actionScreen || APP_SCREENS[0],
    emailProvider: existing?.emailProvider || "Sendgrid",
    senderEmail: existing?.senderEmail || "donotreply@mantra.care",
    emailSubject: existing?.emailSubject || "",
    emailContent: existing?.emailContent || "",
    smsContent: existing?.smsContent || "",
    service: existing?.service || "Therapy",
    orderPurchased: existing?.orderPurchased || "Yes",
    trigger: existing?.trigger || (triggers && triggers.length > 0 ? triggers[0].name : "On signup"),
    timing: existing?.timing || "Instantly",
    eventType: existing?.eventType || "One-time",
    scheduleDate: existing?.scheduleDate || "",
    scheduleTime: existing?.scheduleTime || "",
    scheduleTimezone: existing?.scheduleTimezone || "IST (GMT+5:30)",
    recurringFrequency: existing?.recurringFrequency || "Weekly",
    recurringDays: existing?.recurringDays || [],
    recurringTime: existing?.recurringTime || "",
    recurringTimezone: existing?.recurringTimezone || "IST (GMT+5:30)",
    monthlySchedules: existing?.monthlySchedules || [{ id: 1, date: "", time: "", timezone: "IST (GMT+5:30)" }],
    visibleToAll: existing?.visibleToAll || false,
    selectedServices: existing?.selectedServices || [],
    selectedCorporates: existing?.selectedCorporates || [],
    appNotificationType: existing?.appNotificationType || "App Screen",
    appTextContent: existing?.appTextContent || "",
    status: existing?.status || "Active",
    templateName: existing?.templateName || ""
  }));

  const [isBasicDetailsOpen, setIsBasicDetailsOpen] = useState(true);
  const [isTriggerOpen, setIsTriggerOpen] = useState(true);
  const [isContentSetupOpen, setIsContentSetupOpen] = useState(true);
  const [isConditionsOpen, setIsConditionsOpen] = useState(true);
  const [errors, setErrors] = useState({});

  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
  const [corporateDropdownOpen, setCorporateDropdownOpen] = useState(false);

  const corporateDropdownRef = useRef(null);
  const serviceDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (corporateDropdownRef.current && !corporateDropdownRef.current.contains(event.target)) {
        setCorporateDropdownOpen(false);
      }
      if (serviceDropdownRef.current && !serviceDropdownRef.current.contains(event.target)) {
        setServiceDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [emailInputMode, setEmailInputMode] = useState("Text");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewMode, setPreviewMode] = useState("laptop");

  // Test Dispatch state
  const [testRecipientEmail, setTestRecipientEmail] = useState("qa-tester@mantracare.com");
  const [testRecipientPhone, setTestRecipientPhone] = useState("+1 (555) 019-2834");
  const [isSendingTestDispatch, setIsSendingTestDispatch] = useState(false);

  const substituteVariables = (text) => {
    if (!text) return "";
    let result = text;
    Object.entries(SAMPLE_VARIABLE_MAP).forEach(([key, val]) => {
      result = result.replace(new RegExp(`{{\\s*${key}\\s*}}`, "g"), val);
    });
    return result;
  };

  const handleSendTestDispatch = () => {
    const isSms = formData.type === "SMS";
    const target = isSms ? testRecipientPhone.trim() : testRecipientEmail.trim();

    if (!target) {
      toast.error(`Please provide a valid ${isSms ? "phone number" : "email address"}`);
      return;
    }

    setIsSendingTestDispatch(true);

    setTimeout(() => {
      let payloadContent = "";
      if (formData.type === "Email") {
        payloadContent = substituteVariables(formData.emailContent || "Empty email body");
      } else if (formData.type === "SMS") {
        payloadContent = substituteVariables(formData.smsContent || "Empty SMS content");
      } else {
        payloadContent = substituteVariables(formData.appTextContent || `Opened screen: ${formData.actionScreen}`);
      }

      const newLog = addLog({
        id: Date.now(),
        notificationId: editId ? `TEST-${editId}` : `TEST-DRAFT-${Math.floor(1000 + Math.random() * 9000)}`,
        serviceType: formData.type || "Email",
        sentTo: target,
        event: "Sent",
        status: "Delivered",
        templateName: formData.templateName || formData.name || "Draft Notification",
        payload: payloadContent,
        isTest: true,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19)
      });

      setIsSendingTestDispatch(false);
      toast.success(`Test message dispatched to "${target}"! Saved as Log #${newLog.id} in Recent Logs.`, { duration: 4500 });
    }, 450);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Please enter a name";

    if (formData.type === "Email") {
      if (!formData.emailSubject.trim()) newErrors.emailSubject = "Please enter an email subject";

      // React Quill often leaves empty paragraph tags when "empty"
      const strippedContent = formData.emailContent.replace(/(<([^>]+)>)/gi, "").trim();
      if (!strippedContent) newErrors.emailContent = "Please enter the email content";
    }

    if (formData.type === "SMS" && !formData.smsContent.trim()) {
      newErrors.smsContent = "Please enter the SMS content";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fix the errors before saving.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setErrors({});

    let formattedTrigger = "";
    if (isBulk) {
      const parts = [];
      if (formData.selectedServices.length > 0) parts.push(formData.selectedServices.join(", "));
      if (formData.visibleToAll) {
        parts.push("All Corporates");
      } else if (formData.selectedCorporates.length > 0) {
        parts.push(formData.selectedCorporates.join(", "));
      }

      const audienceStr = parts.length > 0 ? parts.join(" | ") : "Unspecified";

      let timingStr = "";
      if (formData.eventType === "One-time") {
        timingStr = `One-time: ${formData.scheduleDate || "-"} at ${formData.scheduleTime || "-"} ${formData.scheduleTimezone}`;
      } else {
        if (formData.recurringFrequency === "Daily") {
          timingStr = `Recurring (Daily): at ${formData.recurringTime || "-"} ${formData.recurringTimezone}`;
        } else if (formData.recurringFrequency === "Weekly") {
          const daysStr = formData.recurringDays.length ? formData.recurringDays.join(", ") : "No days";
          timingStr = `Recurring (Weekly): ${daysStr} at ${formData.recurringTime || "-"} ${formData.recurringTimezone}`;
        } else {
          timingStr = `Recurring (Monthly): ${formData.monthlySchedules.length} date(s)`;
        }
      }

      formattedTrigger = `Bulk [${audienceStr}] - ${timingStr}`;
    } else {
      const parts = [];
      if (formData.selectedServices.length > 0) parts.push(formData.selectedServices.join(", "));
      if (formData.visibleToAll) {
        parts.push("All Corporates");
      } else if (formData.selectedCorporates.length > 0) {
        parts.push(formData.selectedCorporates.join(", "));
      }

      const audienceStr = parts.length > 0 ? `[${parts.join(" | ")}]` : "";

      formattedTrigger = formData.timing === "Instantly"
        ? `Instantly on ${formData.trigger.toLowerCase()} ${audienceStr}`.trim()
        : `${formData.timing} post ${formData.trigger.toLowerCase()} ${audienceStr}`.trim();
    }

    const payload = {
      ...formData,
      category: formData.userType,
      description: formData.name,
      action: formData.type === "App" ? `Open App> ${formData.appNotificationType === "App Screen" ? formData.actionScreen : "Text"}` : `${formData.type} Notification`,
      displayTrigger: formattedTrigger,
      campaignType: isBulk ? "bulk" : "timebased",
    };

    if (editId) {
      updateNotification(Number(editId), payload);
      toast.success("Notification updated successfully!");
    } else {
      addNotification(payload);
      toast.success("Notification created successfully!");
    }

    router.push("/notifications");
  };

  return (
    <div>
      <div style={{ position: "sticky", top: 0, zIndex: 50, backgroundColor: "rgba(255, 255, 255, 0.85)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 0", marginBottom: "1rem", borderBottom: "1px solid rgba(226, 232, 240, 0.6)", margin: "-1.5rem -1.5rem 1.5rem -1.5rem", paddingLeft: "1.5rem", paddingRight: "1.5rem" }}>
        <Link href="/notifications" className="btn btn-outline" style={{ padding: "0.5rem" }}>
          <ArrowLeft size={18} />
        </Link>
        <div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.25rem", marginBottom: "0.1rem" }}>
            <Link href="/notifications" style={{ textDecoration: "none", color: "inherit" }} className="hover:text-[var(--primary)] transition-colors">Notifications</Link>
            <ChevronRight size={12} />
            <span style={{ color: "var(--dark)" }}>{editId ? "Edit" : "New"}</span>
          </div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: "800", fontFamily: "var(--font-display)", color: "var(--dark)", margin: 0, letterSpacing: "-0.02em" }}>
            {isBulk ? "Add Bulk Campaign" : (editId ? "Edit Notification" : "Add New Notification")}
          </h1>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button 
            type="button" 
            className="btn btn-outline"
            onClick={() => setShowPreviewModal(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", fontWeight: 600 }}
          >
            <Eye size={16} /> Preview & Test
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            <Save size={18} /> Save Notification
          </button>
        </div>
      </div>

      {!isBulk && (
        <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
          <label style={{ fontSize: "1.1rem", fontWeight: "700", fontFamily: "var(--font-display)", color: "var(--dark)", margin: 0 }}>Trigger Event:</label>
          <CustomSelect
            value={formData.trigger}
            onChange={val => setFormData({ ...formData, trigger: val })}
            options={triggers && triggers.length > 0 
              ? triggers.map(t => ({ value: t.name, label: t.name }))
              : [{ value: "", label: "No triggers available" }]}
            style={{ width: "400px", margin: 0 }}
          />
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.5rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* Basic Details */}
          <div className="card" style={{ padding: "0", overflow: "visible" }}>
            <div 
              style={{ padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", backgroundColor: "rgba(248, 250, 252, 0.6)", borderBottom: isBasicDetailsOpen ? "1px solid var(--border-color)" : "none" }}
              onClick={() => setIsBasicDetailsOpen(!isBasicDetailsOpen)}
            >
              <h2 style={{ fontSize: "1.1rem", margin: 0, color: "var(--dark)", fontWeight: "700", fontFamily: "var(--font-display)" }}>Basic Details</h2>
              <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
                {isBasicDetailsOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>

            <div className={`accordion-content ${isBasicDetailsOpen ? "open" : ""}`}>
              <div className="accordion-content-inner">
                <div style={{ padding: "1.5rem" }}>
                <div className="input-group">
                  <label>User Type</label>
                  <div style={{ display: "flex", gap: "1.5rem" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "normal", cursor: "pointer" }}>
                      <input type="radio" name="userType" value="Client" checked={formData.userType === "Client"} onChange={handleChange} style={{ width: "16px", height: "16px", accentColor: "var(--primary)" }} />
                      Client
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "normal", cursor: "pointer" }}>
                      <input type="radio" name="userType" value="Provider" checked={formData.userType === "Provider"} onChange={handleChange} style={{ width: "16px", height: "16px", accentColor: "var(--primary)" }} />
                      Provider
                    </label>
                  </div>
                </div>

                <div className="input-group">
                  <label>Name</label>
                  <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Welcome Series 1" />
                </div>

                <div className="input-group">
                  <label>Description</label>
                  <textarea className="form-control" name="description" value={formData.description} onChange={handleChange} rows="3" placeholder="Internal description..."></textarea>
                </div>
                </div>
              </div>
            </div>
          </div>



          {/* Content Setup */}
          <div className="card" style={{ padding: "0", overflow: "visible" }}>
            <div 
              style={{ padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", backgroundColor: "rgba(248, 250, 252, 0.6)", borderBottom: isContentSetupOpen ? "1px solid var(--border-color)" : "none" }}
              onClick={() => setIsContentSetupOpen(!isContentSetupOpen)}
            >
              <h2 style={{ fontSize: "1.1rem", margin: 0, color: "var(--dark)", fontWeight: "700", fontFamily: "var(--font-display)" }}>Content Setup</h2>
              <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
                {isContentSetupOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>

            <div className={`accordion-content ${isContentSetupOpen ? "open" : ""}`}>
              <div className="accordion-content-inner">
                <div style={{ padding: "1.5rem" }}>
                <div className="input-group">
                  <label>Template</label>
                  <CustomSelect
                    value={formData.templateName || ""}
                    onChange={(val) => {
                      if (val && templates[val]) {
                        setFormData(prev => ({
                          ...prev,
                          templateName: val,
                          emailSubject: templates[val].subject || "",
                          emailContent: templates[val].email || "",
                          smsContent: templates[val].text || "",
                          appTextContent: templates[val].text || ""
                        }));
                      }
                    }}
                    placeholder="Select a predefined template..."
                    options={Object.keys(templates).map(t => ({ value: t, label: t }))}
                    style={{ width: "400px" }}
                  />
                </div>

                <div className="input-group">
                  <label>Type</label>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  className={`btn ${formData.type === "App" ? "btn-primary" : "btn-outline"}`}
                  onClick={() => setFormData({ ...formData, type: "App" })}
                >
                  <Smartphone size={16} /> App Notification
                </button>
                <button
                  className={`btn ${formData.type === "Mobile" ? "btn-primary" : "btn-outline"}`}
                  onClick={() => setFormData({ ...formData, type: "Mobile" })}
                  title="It will show in Mobile Notification pannel"
                >
                  <Smartphone size={16} /> Mobile Notification
                </button>
                <button
                  className={`btn ${formData.type === "Email" ? "btn-primary" : "btn-outline"}`}
                  onClick={() => setFormData({ ...formData, type: "Email" })}
                >
                  <Mail size={16} /> Email
                </button>
                <button
                  className={`btn ${formData.type === "SMS" ? "btn-primary" : "btn-outline"}`}
                  onClick={() => setFormData({ ...formData, type: "SMS" })}
                >
                  <MessageSquare size={16} /> SMS
                </button>
              </div>
            </div>

            {formData.type === "App" && (
              <div style={{ marginTop: "1.5rem" }}>
                <div className="input-group">
                  <label>App Notification Type</label>
                  <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "normal", cursor: "pointer" }}>
                      <input type="radio" name="appNotificationType" value="App Screen" checked={formData.appNotificationType === "App Screen"} onChange={handleChange} style={{ width: "16px", height: "16px", accentColor: "var(--primary)" }} />
                      App Screen
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "normal", cursor: "pointer" }}>
                      <input type="radio" name="appNotificationType" value="Text" checked={formData.appNotificationType === "Text"} onChange={handleChange} style={{ width: "16px", height: "16px", accentColor: "var(--primary)" }} />
                      Text
                    </label>
                  </div>
                </div>

                {formData.appNotificationType === "App Screen" && (
                  <div className="input-group">
                    <label>Action (Screen)</label>
                    <CustomSelect
                      value={formData.actionScreen}
                      onChange={val => setFormData({ ...formData, actionScreen: val })}
                      options={APP_SCREENS.map(s => ({ value: s, label: s }))}
                      style={{ width: "400px" }}
                    />
                  </div>
                )}

                {formData.appNotificationType === "Text" && (
                  <div className="input-group">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "0.5rem" }}>
                      <label style={{ marginBottom: 0 }}>Text Content</label>
                      <VariableDropdown onSelect={(v) => setFormData(f => ({ ...f, appTextContent: f.appTextContent + v }))} />
                    </div>
                    <textarea className="form-control" name="appTextContent" value={formData.appTextContent} onChange={handleChange} rows="4" placeholder="Enter text content..."></textarea>
                  </div>
                )}
              </div>
            )}

            {formData.type === "Mobile" && (
              <div style={{ marginTop: "1.5rem" }}>
                <div className="input-group">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "0.5rem" }}>
                    <label style={{ marginBottom: 0 }}>Text Content</label>
                    <VariableDropdown onSelect={(v) => setFormData(f => ({ ...f, appTextContent: f.appTextContent + v }))} />
                  </div>
                  <textarea className="form-control" name="appTextContent" value={formData.appTextContent} onChange={handleChange} rows="4" placeholder="Enter text content..."></textarea>
                </div>
              </div>
            )}

            {formData.type === "Email" && (
              <div style={{ marginTop: "1rem" }}>
                <div className="input-group">
                  <label>Sender Email</label>
                  <CustomSelect
                    value={formData.senderEmail}
                    onChange={val => setFormData({ ...formData, senderEmail: val })}
                    options={EMAIL_PROVIDERS[formData.emailProvider] ? EMAIL_PROVIDERS[formData.emailProvider].map(e => ({ value: e, label: e })) : []}
                    style={{ width: "400px" }}
                  />
                </div>

                <div className="input-group">
                  <label>Email Subject</label>
                  <input type="text" className={`form-control ${errors.emailSubject ? 'has-error' : ''}`} style={errors.emailSubject ? {borderColor: "var(--danger)"} : {}} name="emailSubject" value={formData.emailSubject} onChange={handleChange} placeholder="Enter subject line..." />
                  {errors.emailSubject && <span style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "-0.2rem" }}>{errors.emailSubject}</span>}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "0.5rem" }}>
                  <label style={{ fontWeight: "500", fontSize: "0.875rem", marginBottom: 0 }}>Email Content</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <VariableDropdown onSelect={(v) => setFormData(f => ({ ...f, emailContent: f.emailContent + v }))} />
                    <div style={{ display: "flex", backgroundColor: "white", borderRadius: "9999px", padding: "2px", border: "1px solid rgba(226, 232, 240, 0.9)" }}>
                      <button
                        style={{ padding: "0.25rem 0.75rem", fontSize: "0.75rem", borderRadius: "9999px", backgroundColor: emailInputMode === "Text" ? "var(--navy-gradient)" : "transparent", color: emailInputMode === "Text" ? "white" : "var(--text-muted)", fontWeight: "600" }}
                        onClick={() => setEmailInputMode("Text")}
                      >
                        Visual
                      </button>
                      <button
                        style={{ padding: "0.25rem 0.75rem", fontSize: "0.75rem", borderRadius: "9999px", backgroundColor: emailInputMode === "HTML" ? "var(--navy-gradient)" : "transparent", color: emailInputMode === "HTML" ? "white" : "var(--text-muted)", fontWeight: "600" }}
                        onClick={() => setEmailInputMode("HTML")}
                      >
                        Code
                      </button>
                    </div>
                  </div>
                </div>

                {emailInputMode === "Text" ? (
                  <div style={{ border: `1px solid ${errors.emailContent ? 'var(--danger)' : 'var(--border-color)'}`, borderRadius: "1rem", overflow: "hidden", backgroundColor: "white" }}>
                    <ReactQuill
                      theme="snow"
                      value={formData.emailContent}
                      onChange={(content) => setFormData({ ...formData, emailContent: content })}
                      style={{ height: "200px", border: "none" }}
                    />
                  </div>
                ) : (
                  <textarea
                    className="form-control"
                    style={{ minHeight: "240px", width: "100%", fontFamily: "monospace", padding: "1rem", whiteSpace: "pre-wrap", borderColor: errors.emailContent ? "var(--danger)" : "var(--border-color)" }}
                    value={formData.emailContent}
                    onChange={(e) => setFormData({ ...formData, emailContent: e.target.value })}
                    placeholder={`<!DOCTYPE html>\n<html>\n  <head></head>\n  <body>\n    <h1>Hello World</h1>\n    <p>Your content here.</p>\n  </body>\n</html>`}
                  />
                )}
                {errors.emailContent && <div style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "0.2rem" }}>{errors.emailContent}</div>}
              </div>
            )}

            {formData.type === "SMS" && (
              <div style={{ marginTop: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "0.5rem" }}>
                  <label style={{ fontWeight: "500", fontSize: "0.875rem", marginBottom: 0 }}>SMS Content</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <VariableDropdown onSelect={(v) => setFormData(f => ({ ...f, smsContent: f.smsContent + v }))} />
                    <span style={{ fontSize: "0.75rem", color: formData.smsContent.length > 160 ? "var(--danger)" : "var(--text-muted)" }}>
                      {formData.smsContent.length}/160 characters
                    </span>
                  </div>
                </div>
                <textarea
                  className={`form-control ${errors.smsContent ? 'has-error' : ''}`}
                  style={{ minHeight: "150px", width: "100%", resize: "vertical", borderColor: errors.smsContent ? "var(--danger)" : "var(--border-color)" }}
                  value={formData.smsContent}
                  onChange={(e) => setFormData({ ...formData, smsContent: e.target.value })}
                  name="smsContent"
                  placeholder="Enter SMS message..."
                />
                {errors.smsContent && <div style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "0.2rem" }}>{errors.smsContent}</div>}
              </div>
            )}
              </div>
              </div>
            </div>
          </div>

          {/* Conditions */}
          <div className="card" style={{ padding: "0", overflow: "visible" }}>
            <div 
              style={{ padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", backgroundColor: "rgba(248, 250, 252, 0.6)", borderBottom: isConditionsOpen ? "1px solid var(--border-color)" : "none" }}
              onClick={() => setIsConditionsOpen(!isConditionsOpen)}
            >
              <h2 style={{ fontSize: "1.1rem", margin: 0, color: "var(--dark)", fontWeight: "700", fontFamily: "var(--font-display)" }}>
                {isBulk ? "Conditions & Scheduling" : "Conditions"}
              </h2>
              <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
                {isConditionsOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>

            <div className={`accordion-content ${isConditionsOpen ? "open" : ""}`}>
              <div className="accordion-content-inner">
                <div style={{ padding: "1.5rem" }}>

              <div style={{ display: "grid", gridTemplateColumns: isBulk ? "1fr" : "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid var(--border-color)", alignItems: "end" }}>
                {!isBulk && (
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase", marginBottom: "0.5rem" }}>Send Timing</label>
                    <CustomSelect
                      value={formData.timing}
                      onChange={val => setFormData({ ...formData, timing: val })}
                      options={["Instantly", "1 Day", "2 Days", "7 Days", "14 Days", "30 Days"]}
                      style={{ width: "100%" }}
                    />
                  </div>
                )}

                {/* Toggle Row */}
                <div style={{ backgroundColor: "rgba(255, 255, 255, 0.6)", borderRadius: "16px", padding: "1rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid rgba(226, 232, 240, 0.9)", backdropFilter: "blur(8px)" }}>
                  <div>
                    <div style={{ fontWeight: "600", color: "var(--dark)", marginBottom: "0.2rem", fontSize: "0.95rem" }}>Visible to all corporates</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Enable to show this event to every corporate division</div>
                  </div>
                  <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      style={{ display: "none" }}
                      checked={formData.visibleToAll}
                      onChange={(e) => setFormData({ ...formData, visibleToAll: e.target.checked })}
                    />
                    <div style={{ width: "40px", height: "22px", backgroundColor: formData.visibleToAll ? "var(--primary)" : "#cbd5e1", borderRadius: "20px", position: "relative", transition: "background-color 0.2s" }}>
                      <div style={{ width: "18px", height: "18px", backgroundColor: "white", borderRadius: "50%", position: "absolute", top: "2px", left: formData.visibleToAll ? "20px" : "2px", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                    </div>
                  </label>
                </div>
              </div>

              {/* Dropdowns Row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>

                {/* Corporates Dropdown */}
                <div style={{ position: "relative" }} ref={corporateDropdownRef}>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                    Target Corporates
                  </label>
                  <div
                    style={{
                      padding: "0.75rem 1rem",
                      border: "1px solid var(--border-color)",
                      borderRadius: "0.5rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: formData.visibleToAll ? "not-allowed" : "pointer",
                      backgroundColor: formData.visibleToAll ? "#f1f5f9" : "white",
                      color: formData.visibleToAll ? "#94a3b8" : "var(--dark)"
                    }}
                    onClick={() => !formData.visibleToAll && setCorporateDropdownOpen(!corporateDropdownOpen)}
                  >
                    <span style={{ fontSize: "0.9rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {formData.selectedCorporates.length > 0 
                        ? `${formData.selectedCorporates.length} selected`
                        : "Select corporates"}
                    </span>
                    <ChevronDown size={16} color="var(--text-muted)" />
                  </div>
                  
                  {corporateDropdownOpen && !formData.visibleToAll && (
                    <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: "4px", backgroundColor: "white", border: "1px solid var(--border-color)", borderRadius: "0.5rem", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", zIndex: 10, maxHeight: "250px", overflowY: "auto" }}>
                      <div style={{ padding: "0.5rem", borderBottom: "1px solid #f1f5f9" }}>
                        <input type="text" placeholder="Search..." style={{ width: "100%", padding: "0.5rem", border: "1px solid var(--border-color)", borderRadius: "4px", outline: "none", fontSize: "0.85rem" }} />
                      </div>
                      {CORPORATES.map(corp => (
                        <label key={corp} style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer", fontSize: "0.9rem", color: "var(--dark)", padding: "0.75rem 1rem", borderBottom: "1px solid #f8fafc", transition: "background-color 0.1s" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                          <input 
                            type="checkbox"
                            checked={formData.selectedCorporates.includes(corp)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ ...formData, selectedCorporates: [...formData.selectedCorporates, corp] });
                              } else {
                                setFormData({ ...formData, selectedCorporates: formData.selectedCorporates.filter(c => c !== corp) });
                              }
                            }}
                            style={{ width: "16px", height: "16px", accentColor: "var(--primary)", cursor: "pointer" }}
                          />
                          {corp}
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Services Dropdown */}
                <div style={{ position: "relative" }} ref={serviceDropdownRef}>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                    Visible to Services (B2C)
                  </label>
                  <div
                    style={{
                      padding: "0.75rem 1rem",
                      border: "1px solid var(--border-color)",
                      borderRadius: "0.5rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      backgroundColor: "white"
                    }}
                    onClick={() => setServiceDropdownOpen(!serviceDropdownOpen)}
                  >
                    <span style={{ fontSize: "0.9rem", color: "var(--dark)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {formData.selectedServices.length > 0 
                        ? `${formData.selectedServices.length} selected`
                        : "Select services"}
                    </span>
                    <ChevronDown size={16} color="var(--text-muted)" />
                  </div>
                  
                  {serviceDropdownOpen && (
                    <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: "4px", backgroundColor: "white", border: "1px solid var(--border-color)", borderRadius: "0.5rem", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", zIndex: 10, maxHeight: "250px", overflowY: "auto" }}>
                      {["Therapy", "Psychiatry", "Couples", "Teen", "Diet", "Physio", "Sleep", "Yoga"].map(service => (
                        <label key={service} style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer", fontSize: "0.9rem", color: "var(--dark)", padding: "0.75rem 1rem", borderBottom: "1px solid #f8fafc", transition: "background-color 0.1s" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                          <input 
                            type="checkbox"
                            checked={formData.selectedServices.includes(service)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ ...formData, selectedServices: [...formData.selectedServices, service] });
                              } else {
                                setFormData({ ...formData, selectedServices: formData.selectedServices.filter(s => s !== service) });
                              }
                            }}
                            style={{ width: "16px", height: "16px", accentColor: "var(--primary)", cursor: "pointer" }}
                          />
                          {service}
                        </label>
                      ))}
                    </div>
                  )}
                </div>

              </div>
                <div style={{ marginBottom: "2rem" }}>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                    Event Type
                  </label>
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <div
                      onClick={() => setFormData({ ...formData, eventType: "One-time" })}
                      style={{
                        flex: 1,
                        padding: "1rem",
                        border: formData.eventType === "One-time" ? "2px solid var(--primary)" : "1px solid var(--border-color)",
                        borderRadius: "16px",
                        cursor: "pointer",
                        backgroundColor: formData.eventType === "One-time" ? "rgba(20, 86, 240, 0.06)" : "white",
                        boxShadow: formData.eventType === "One-time" ? "0 4px 14px rgba(20,86,240,0.12)" : "none",
                      }}
                    >
                      <div style={{ fontWeight: "700", fontFamily: "var(--font-display)", color: formData.eventType === "One-time" ? "var(--primary)" : "var(--dark)", marginBottom: "0.25rem" }}>One-time</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Single occurrence</div>
                    </div>
                    <div
                      onClick={() => setFormData({ ...formData, eventType: "Recurring" })}
                      style={{
                        flex: 1,
                        padding: "1rem",
                        border: formData.eventType === "Recurring" ? "2px solid var(--primary)" : "1px solid var(--border-color)",
                        borderRadius: "16px",
                        cursor: "pointer",
                        backgroundColor: formData.eventType === "Recurring" ? "rgba(20, 86, 240, 0.06)" : "white",
                        boxShadow: formData.eventType === "Recurring" ? "0 4px 14px rgba(20,86,240,0.12)" : "none",
                      }}
                    >
                      <div style={{ fontWeight: "700", fontFamily: "var(--font-display)", color: formData.eventType === "Recurring" ? "var(--primary)" : "var(--dark)", marginBottom: "0.25rem" }}>Recurring</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Multiple sessions</div>
                    </div>
                  </div>
                </div>

                {/* Schedule Details */}
                {formData.eventType === "One-time" ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase" }}>Date</label>
                      <input type="date" className="form-control" value={formData.scheduleDate} onChange={(e) => setFormData({ ...formData, scheduleDate: e.target.value })} />
                    </div>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase" }}>Time</label>
                      <input type="time" className="form-control" value={formData.scheduleTime} onChange={(e) => setFormData({ ...formData, scheduleTime: e.target.value })} />
                    </div>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase" }}>Timezone</label>
                      <CustomSelect
                        value={formData.scheduleTimezone}
                        onChange={val => setFormData({ ...formData, scheduleTimezone: val })}
                        options={TIMEZONES.map(tz => ({ value: tz, label: tz }))}
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>
                ) : (
                  <div style={{ border: "1px solid rgba(226, 232, 240, 0.9)", borderRadius: "16px", padding: "1.5rem", backgroundColor: "rgba(255, 255, 255, 0.55)", backdropFilter: "blur(8px)" }}>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: "700", fontFamily: "var(--font-display)", color: "var(--dark)", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--primary)" }} />
                      SCHEDULE
                    </h3>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
                      <div className="input-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase" }}>Frequency</label>
                        <CustomSelect
                          value={formData.recurringFrequency}
                          onChange={val => setFormData({ ...formData, recurringFrequency: val })}
                          options={["Daily", "Weekly", "Monthly"]}
                          style={{ width: "100%" }}
                        />
                      </div>

                      <div>
                        {formData.recurringFrequency === "Daily" && (
                          <div style={{ backgroundColor: "#eff6ff", borderRadius: "0.375rem", padding: "1rem", border: "1px solid #bfdbfe" }}>
                            <div style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--primary)", textTransform: "uppercase", marginBottom: "0.25rem" }}>Daily Schedule</div>
                            <div style={{ fontSize: "0.875rem", color: "var(--primary)" }}>This event will repeat every single day (Mon-Sun).</div>
                          </div>
                        )}
                        {formData.recurringFrequency === "Weekly" && (
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase" }}>Days</label>
                            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                              {DAYS.map(day => (
                                <button
                                  key={day}
                                  onClick={() => {
                                    const newDays = formData.recurringDays.includes(day)
                                      ? formData.recurringDays.filter(d => d !== day)
                                      : [...formData.recurringDays, day];
                                    setFormData({ ...formData, recurringDays: newDays });
                                  }}
                                  style={{
                                    padding: "0.5rem 1rem",
                                    borderRadius: "9999px",
                                    border: "none",
                                    fontWeight: "600",
                                    fontFamily: "var(--font-display)",
                                    fontSize: "0.85rem",
                                    backgroundColor: formData.recurringDays.includes(day) ? "var(--navy-gradient)" : "white",
                                    color: formData.recurringDays.includes(day) ? "white" : "var(--dark)",
                                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                                    cursor: "pointer"
                                  }}
                                >
                                  {day}
                                </button>
                              ))}
                            </div>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic" }}>Select applicable days for the weekly session</span>
                          </div>
                        )}
                        {formData.recurringFrequency === "Monthly" && (
                          <div style={{ backgroundColor: "#eff6ff", borderRadius: "0.375rem", padding: "1rem", border: "1px solid #bfdbfe" }}>
                            <div style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--primary)", textTransform: "uppercase", marginBottom: "0.25rem" }}>Monthly Schedule</div>
                            <div style={{ fontSize: "0.875rem", color: "var(--primary)" }}>Repeats on the specific dates and times selected below.</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {(formData.recurringFrequency === "Daily" || formData.recurringFrequency === "Weekly") && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase" }}>Time</label>
                          <input type="time" className="form-control" value={formData.recurringTime} onChange={(e) => setFormData({ ...formData, recurringTime: e.target.value })} />
                        </div>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase" }}>Timezone</label>
                          <CustomSelect
                            value={formData.recurringTimezone}
                            onChange={val => setFormData({ ...formData, recurringTimezone: val })}
                            options={TIMEZONES.map(tz => ({ value: tz, label: tz }))}
                            style={{ width: "100%" }}
                          />
                        </div>
                      </div>
                    )}

                    {formData.recurringFrequency === "Monthly" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {formData.monthlySchedules.map((schedule, index) => (
                          <div key={schedule.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "1rem", alignItems: "end" }}>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                              <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase" }}>Date</label>
                              <input type="date" className="form-control" value={schedule.date} onChange={(e) => {
                                const newSchedules = [...formData.monthlySchedules];
                                newSchedules[index].date = e.target.value;
                                setFormData({ ...formData, monthlySchedules: newSchedules });
                              }} />
                            </div>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                              <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase" }}>Time</label>
                              <input type="time" className="form-control" value={schedule.time} onChange={(e) => {
                                const newSchedules = [...formData.monthlySchedules];
                                newSchedules[index].time = e.target.value;
                                setFormData({ ...formData, monthlySchedules: newSchedules });
                              }} />
                            </div>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                              <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase" }}>Timezone</label>
                              <CustomSelect
                                value={schedule.timezone}
                                onChange={val => {
                                  const newSchedules = [...formData.monthlySchedules];
                                  newSchedules[index].timezone = val;
                                  setFormData({ ...formData, monthlySchedules: newSchedules });
                                }}
                                options={TIMEZONES.map(tz => ({ value: tz, label: tz }))}
                                style={{ width: "100%" }}
                              />
                            </div>
                            {formData.monthlySchedules.length > 1 && (
                              <button
                                onClick={() => {
                                  const newSchedules = formData.monthlySchedules.filter((_, i) => i !== index);
                                  setFormData({ ...formData, monthlySchedules: newSchedules });
                                }}
                                style={{ padding: "0.5rem", borderRadius: "0.375rem", border: "1px solid var(--danger)", backgroundColor: "white", color: "var(--danger)", cursor: "pointer", height: "38px" }}
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          className="btn btn-outline"
                          style={{ alignSelf: "flex-start", marginTop: "0.5rem" }}
                          onClick={() => setFormData({ ...formData, monthlySchedules: [...formData.monthlySchedules, { id: Date.now(), date: "", time: "", timezone: "IST (GMT+5:30)" }] })}
                        >
                          + Add Schedule
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              </div>
            </div>

          </div>

        </div>

        {/* Right Sidebar - Helper info */}
        <div>
          <div className="card" style={{ padding: "1.5rem", backgroundColor: "rgba(255, 255, 255, 0.6)", border: "1px dashed #cbd5e1" }}>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "1rem", color: "var(--primary)" }}>
              <Info size={18} />
              <h3 style={{ fontSize: "1rem", fontWeight: "700", fontFamily: "var(--font-display)" }}>Tips</h3>
            </div>
            <ul style={{ fontSize: "0.875rem", color: "var(--text-muted)", paddingLeft: "1.2rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <li>Use <strong>Time Based</strong> triggers to engage users days after an event.</li>
              <li>Keep SMS under 160 characters to avoid multi-part messages.</li>
              <li>Always preview email templates on mobile before saving.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Preview & Test Dispatch Modal */}
      {showPreviewModal && (
        <div 
          style={{ 
            position: "fixed", 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: "rgba(15,23,42,0.65)", 
            backdropFilter: "blur(4px)",
            zIndex: 100, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            padding: "1rem"
          }}
          onClick={() => setShowPreviewModal(false)}
        >
          <div 
            className="card" 
            style={{ 
              width: "100%",
              maxWidth: previewMode === "mobile" ? "480px" : "860px", 
              maxHeight: "90vh", 
              display: "flex", 
              flexDirection: "column", 
              transition: "max-width 0.25s ease",
              borderRadius: "1.5rem",
              boxShadow: "0 25px 50px -12px rgba(15,23,42,0.35)",
              overflow: "hidden",
              padding: 0
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f8fafc" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ 
                  padding: "0.3rem 0.75rem", 
                  borderRadius: "100px", 
                  fontSize: "0.75rem", 
                  fontWeight: 700, 
                  backgroundColor: "rgba(20,86,240,0.1)", 
                  color: "var(--primary)" 
                }}>
                  {formData.type} Channel
                </span>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--dark)", margin: 0 }}>
                  Preview &amp; Test Dispatch
                </h3>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ display: "flex", backgroundColor: "rgba(15,23,42,0.06)", borderRadius: "100px", padding: "2px" }}>
                  <button 
                    type="button" 
                    className={`btn ${previewMode === "laptop" ? "btn-primary" : "btn-outline"}`} 
                    style={{ padding: "0.35rem 0.75rem", borderRadius: "100px", fontSize: "0.78rem", border: "none" }} 
                    onClick={() => setPreviewMode("laptop")} 
                    title="Laptop View"
                  >
                    <Monitor size={15} /> Desktop
                  </button>
                  <button 
                    type="button" 
                    className={`btn ${previewMode === "mobile" ? "btn-primary" : "btn-outline"}`} 
                    style={{ padding: "0.35rem 0.75rem", borderRadius: "100px", fontSize: "0.78rem", border: "none" }} 
                    onClick={() => setPreviewMode("mobile")} 
                    title="Mobile View"
                  >
                    <Smartphone size={15} /> Mobile
                  </button>
                </div>
                <button 
                  className="btn btn-outline" 
                  style={{ padding: "0.4rem", border: "none", color: "var(--text-muted)" }} 
                  onClick={() => setShowPreviewModal(false)} 
                  title="Close Preview"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Preview Frame Body */}
            <div style={{ flex: 1, padding: "1.5rem", backgroundColor: "#f1f5f9", overflowY: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
              <div 
                style={{ 
                  backgroundColor: "white", 
                  width: "100%", 
                  maxWidth: previewMode === "mobile" ? "360px" : "780px", 
                  padding: previewMode === "mobile" ? "1.25rem" : "1.75rem", 
                  border: previewMode === "mobile" ? "3px solid #334155" : "1px solid var(--border-color)", 
                  borderRadius: previewMode === "mobile" ? "24px" : "12px", 
                  minHeight: previewMode === "mobile" ? "380px" : "220px", 
                  boxShadow: "0 8px 20px -4px rgba(0, 0, 0, 0.08)",
                  boxSizing: "border-box"
                }}
              >
                {formData.type === "Email" && (
                  <div>
                    <div style={{ marginBottom: "1rem", paddingBottom: "0.75rem", borderBottom: "1px solid #e2e8f0" }}>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "0.2rem" }}>
                        From: <strong>{formData.senderEmail}</strong> (via {formData.emailProvider})
                      </div>
                      <h4 style={{ fontSize: "1.1rem", color: "var(--dark)", margin: 0, fontWeight: 700 }}>
                        {substituteVariables(formData.emailSubject) || <span style={{ color: "#94a3b8", fontStyle: "italic" }}>No subject specified</span>}
                      </h4>
                    </div>
                    <div
                      className="email-preview-content"
                      style={{ overflowWrap: "break-word", wordBreak: "break-word", whiteSpace: "normal", fontSize: "0.92rem", lineHeight: 1.6 }}
                      dangerouslySetInnerHTML={{ __html: substituteVariables(formData.emailContent) || "<p style='color: #9ca3af; font-style: italic;'>No email body content entered yet...</p>" }}
                    />
                  </div>
                )}

                {formData.type === "SMS" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
                      <span>Sender ID: <strong>MANTRA</strong></span>
                      <span>Length: {(formData.smsContent || "").length} chars</span>
                    </div>
                    <div style={{ backgroundColor: "#e2e8f0", padding: "1rem 1.25rem", borderRadius: "18px 18px 18px 4px", color: "var(--dark)", fontSize: "0.95rem", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                      {substituteVariables(formData.smsContent) || "No SMS content entered yet..."}
                    </div>
                  </div>
                )}

                {formData.type === "App" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div style={{ backgroundColor: "#1e293b", color: "white", padding: "1rem", borderRadius: "12px", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Smartphone size={18} color="white" />
                      </div>
                      <div>
                        <div style={{ fontSize: "0.88rem", fontWeight: 700 }}>{formData.name || "MantraCare Notification"}</div>
                        <div style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                          Target Screen: <strong>{formData.actionScreen}</strong>
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: "0.75rem", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.85rem" }}>
                      {substituteVariables(formData.appTextContent) || `Opens screen: ${formData.actionScreen}`}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ width: "100%", maxWidth: previewMode === "mobile" ? "360px" : "780px", padding: "0.6rem 0.9rem", borderRadius: "8px", backgroundColor: "#fef9c3", border: "1px solid #fef08a", fontSize: "0.78rem", color: "#854d0e", boxSizing: "border-box" }}>
                <strong>Dynamic variables replaced with sample values:</strong> <code>client_name</code> &rarr; &quot;Jordan Lee&quot;, <code>order_id</code> &rarr; &quot;ORD-98231&quot;, <code>provider_name</code> &rarr; &quot;Dr. Amara Singh&quot;
              </div>
            </div>

            {/* Test Send Section in Footer */}
            <div style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid var(--border-color)", backgroundColor: "#ffffff" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1, minWidth: "280px" }}>
                  <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--dark)", whiteSpace: "nowrap" }}>
                    Send Test To:
                  </label>
                  {formData.type === "SMS" ? (
                    <input
                      type="tel"
                      className="form-control"
                      value={testRecipientPhone}
                      onChange={(e) => setTestRecipientPhone(e.target.value)}
                      placeholder="+1 (555) 019-2834"
                      style={{ fontSize: "0.85rem", padding: "0.45rem 0.75rem", flex: 1 }}
                    />
                  ) : (
                    <input
                      type="email"
                      className="form-control"
                      value={testRecipientEmail}
                      onChange={(e) => setTestRecipientEmail(e.target.value)}
                      placeholder="e.g. test-recipient@mantracare.com"
                      style={{ fontSize: "0.85rem", padding: "0.45rem 0.75rem", flex: 1 }}
                    />
                  )}
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSendTestDispatch}
                    disabled={isSendingTestDispatch}
                    style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.45rem 1rem", fontSize: "0.85rem", whiteSpace: "nowrap" }}
                  >
                    {isSendingTestDispatch ? "Sending..." : <><Send size={14} /> Send Test</>}
                  </button>
                </div>

                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => setShowPreviewModal(false)}
                  style={{ padding: "0.45rem 1rem", fontSize: "0.85rem" }}
                >
                  Close Preview
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default function AddNotificationPage() {
  return (
    <Suspense fallback={<div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>Loading form...</div>}>
      <AddNotificationContent />
    </Suspense>
  );
}
