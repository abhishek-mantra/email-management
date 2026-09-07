"use client";

import { useState, Suspense } from "react";
import { ArrowLeft, Save, Plus, Edit, Copy, X, Check, Eye } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import CustomSelect from "@/components/CustomSelect";

import { useNotifications } from "@/context/NotificationContext";

function OrganizationEditContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orgId = searchParams.get("id");
  const { organizations, updateOrganization } = useNotifications();

  const currentOrg = organizations.find(o => o.id === orgId);

  // Client Details State
  const [clientDetails, setClientDetails] = useState(() => ({
    name: currentOrg?.name || "",
    website: currentOrg?.website || "",
    contactNumber: currentOrg?.contactNumber || "+91 9999999999",
    contactEmail: currentOrg?.contactEmail || "contact@example.com"
  }));

  // Log Reporting State
  const [reportingType, setReportingType] = useState(() => currentOrg?.reportingType || "Webhook");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // 'webhook' or 'email'

  // Webhooks Mock Data
  const [webhooks, setWebhooks] = useState(() => currentOrg?.webhooks || []);

  // Emails Mock Data
  const [emailReports, setEmailReports] = useState(() => currentOrg?.emailReports || []);

  // Form states for modals
  const [webhookForm, setWebhookForm] = useState({
    name: "", service: "Email", event: "On Delivered Events", method: "POST", url: "", contentType: "JSON", enabled: true, payload: "{\n  \"UUID\": \"{{UUID}}\",\n  \"CRQID\": \"{{CRQID}}\"\n}"
  });

  const [emailForm, setEmailForm] = useState({
    name: "", service: "Email", event: "On Failed Events", emailAddress: "", enabled: true
  });

  const handleSaveClientDetails = () => {
    if (!currentOrg) return;
    updateOrganization(orgId, {
      name: clientDetails.name,
      website: clientDetails.website,
      contactNumber: clientDetails.contactNumber,
      contactEmail: clientDetails.contactEmail,
      reportingType,
      webhooks,
      emailReports
    });
    toast.success("Organization details updated successfully");
  };

  const handleCreateWebhook = () => {
    const updated = [...webhooks, { id: Date.now(), name: webhookForm.name, service: webhookForm.service, url: webhookForm.url, event: webhookForm.event }];
    setWebhooks(updated);
    if (currentOrg) {
      updateOrganization(orgId, { webhooks: updated });
    }
    setIsModalOpen(false);
    toast.success("Webhook created successfully");
  };

  const handleCreateEmailReport = () => {
    const updated = [...emailReports, { id: Date.now(), name: emailForm.name, service: emailForm.service, emailAddress: emailForm.emailAddress, event: emailForm.event }];
    setEmailReports(updated);
    if (currentOrg) {
      updateOrganization(orgId, { emailReports: updated });
    }
    setIsModalOpen(false);
    toast.success("Email report created successfully");
  };

  if (!currentOrg) {
    return (
      <div style={{ padding: "3rem", textAlign: "center" }}>
        <h2 style={{ color: "var(--dark)" }}>Organization Not Found</h2>
        <p style={{ color: "var(--text-muted)", margin: "1rem 0" }}>No organization found with ID &quot;{orgId}&quot;.</p>
        <Link href="/organization" className="btn btn-primary">Back to Organizations</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto", paddingBottom: "5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/organization" className="btn btn-outline" style={{ padding: "0.5rem" }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "600", color: "var(--dark)", margin: 0 }}>
              Edit Organization: {clientDetails.name || orgId}
            </h1>
            <p style={{ color: "var(--text-muted)", margin: "0.25rem 0 0 0", fontSize: "0.9rem" }}>
              Update client details and configure log reporting
            </p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleSaveClientDetails}>
          <Save size={18} /> Save Changes
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        
        {/* Client Details Section */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: "600", color: "var(--dark)", margin: "0 0 1.5rem 0" }}>Client Details</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <div className="input-group">
              <label>Client Name</label>
              <input 
                type="text" 
                className="form-control" 
                value={clientDetails.name} 
                onChange={e => setClientDetails({...clientDetails, name: e.target.value})} 
              />
            </div>
            <div className="input-group">
              <label>Website</label>
              <input 
                type="text" 
                className="form-control" 
                value={clientDetails.website} 
                onChange={e => setClientDetails({...clientDetails, website: e.target.value})} 
              />
            </div>
            <div className="input-group">
              <label>Contact Number</label>
              <input 
                type="text" 
                className="form-control" 
                value={clientDetails.contactNumber} 
                onChange={e => setClientDetails({...clientDetails, contactNumber: e.target.value})} 
              />
            </div>
            <div className="input-group">
              <label>Contact Email</label>
              <input 
                type="email" 
                className="form-control" 
                value={clientDetails.contactEmail} 
                onChange={e => setClientDetails({...clientDetails, contactEmail: e.target.value})} 
              />
            </div>
          </div>
        </div>

        {/* Log Reporting Section */}
        <div className="card" style={{ padding: "1.5rem", overflow: "visible" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: "600", color: "var(--dark)", margin: 0 }}>Log Reporting</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Reporting on:</span>
              <CustomSelect 
                value={reportingType}
                onChange={setReportingType}
                options={["Webhook", "Email"]}
                style={{ width: "150px" }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "2rem", backgroundColor: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "var(--dark)", marginBottom: "0.75rem" }}>Types of request logs to create:</label>
            <div style={{ display: "flex", gap: "1.5rem" }}>
              {["Received", "Sent", "Viewed", "Failed", "Skipped"].map(logType => (
                <label key={logType} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.9rem" }}>
                  <input type="checkbox" defaultChecked style={{ width: "16px", height: "16px", accentColor: "var(--primary)" }} />
                  {logType}
                </label>
              ))}
            </div>
          </div>

          {/* Webhook Table */}
          {reportingType === "Webhook" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: "600", margin: 0 }}>Configured Webhooks</h3>
                <button className="btn btn-primary" onClick={() => { setModalType("webhook"); setIsModalOpen(true); }}>
                  <Plus size={16} /> Create Webhook
                </button>
              </div>
              
              <div style={{ overflowX: "auto", border: "1px solid var(--border-color)", borderRadius: "8px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid var(--border-color)" }}>
                      <th style={{ padding: "1rem", fontWeight: "600", color: "#64748b", fontSize: "0.75rem" }}>Webhook Name</th>
                      <th style={{ padding: "1rem", fontWeight: "600", color: "#64748b", fontSize: "0.75rem" }}>Service</th>
                      <th style={{ padding: "1rem", fontWeight: "600", color: "#64748b", fontSize: "0.75rem" }}>Url</th>
                      <th style={{ padding: "1rem", fontWeight: "600", color: "#64748b", fontSize: "0.75rem" }}>Event</th>
                    </tr>
                  </thead>
                  <tbody>
                    {webhooks.map(wh => (
                      <tr key={wh.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                        <td style={{ padding: "1rem", color: "var(--dark)", fontSize: "0.9rem" }}>{wh.name}</td>
                        <td style={{ padding: "1rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>{wh.service}</td>
                        <td style={{ padding: "1rem", color: "var(--text-muted)", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span style={{ maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{wh.url}</span>
                          <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }} title="Copy URL"><Copy size={14} /></button>
                        </td>
                        <td style={{ padding: "1rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>{wh.event}</td>
                      </tr>
                    ))}
                    {webhooks.length === 0 && (
                      <tr><td colSpan="4" style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>No Webhooks configured</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Email Table */}
          {reportingType === "Email" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: "600", margin: 0 }}>Configured Email Reports</h3>
                <button className="btn btn-primary" onClick={() => { setModalType("email"); setIsModalOpen(true); }}>
                  <Plus size={16} /> Create Email Report
                </button>
              </div>
              
              <div style={{ overflowX: "auto", border: "1px solid var(--border-color)", borderRadius: "8px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid var(--border-color)" }}>
                      <th style={{ padding: "1rem", fontWeight: "600", color: "#64748b", fontSize: "0.75rem" }}>Report Name</th>
                      <th style={{ padding: "1rem", fontWeight: "600", color: "#64748b", fontSize: "0.75rem" }}>Service</th>
                      <th style={{ padding: "1rem", fontWeight: "600", color: "#64748b", fontSize: "0.75rem" }}>Email Address</th>
                      <th style={{ padding: "1rem", fontWeight: "600", color: "#64748b", fontSize: "0.75rem" }}>Event</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emailReports.map(er => (
                      <tr key={er.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                        <td style={{ padding: "1rem", color: "var(--dark)", fontSize: "0.9rem" }}>{er.name}</td>
                        <td style={{ padding: "1rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>{er.service}</td>
                        <td style={{ padding: "1rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>{er.emailAddress}</td>
                        <td style={{ padding: "1rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>{er.event}</td>
                      </tr>
                    ))}
                    {emailReports.length === 0 && (
                      <tr><td colSpan="4" style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>No Email Reports configured</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* CREATE MODALS */}
      {isModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
          <div className="card" style={{ width: "100%", maxWidth: modalType === "webhook" ? "700px" : "500px", maxHeight: "90vh", overflowY: "auto", padding: "2rem", backgroundColor: "white" }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "600", margin: 0 }}>{modalType === "webhook" ? "Create Webhook" : "Create Email Report"}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><X size={20} /></button>
            </div>

            {modalType === "webhook" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div className="input-group">
                  <label>Webhook Name*</label>
                  <input type="text" className="form-control" value={webhookForm.name} onChange={e => setWebhookForm({...webhookForm, name: e.target.value})} placeholder="e.g. OTP-Report" />
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                  <div className="input-group" style={{ overflow: "visible" }}>
                    <label>Select Service</label>
                    <CustomSelect value={webhookForm.service} onChange={val => setWebhookForm({...webhookForm, service: val})} options={["Email", "App Notification", "SMS", "Text Notification"]} />
                  </div>
                  <div className="input-group" style={{ overflow: "visible" }}>
                    <label>Select Event*</label>
                    <CustomSelect value={webhookForm.event} onChange={val => setWebhookForm({...webhookForm, event: val})} options={["On Delivered Events", "On Report Received", "On Failed Events", "On Rejected Events"]} />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "1.5rem" }}>
                  <div className="input-group" style={{ width: "150px", overflow: "visible" }}>
                    <label>Method</label>
                    <CustomSelect value={webhookForm.method} onChange={val => setWebhookForm({...webhookForm, method: val})} options={["POST", "GET", "PUT"]} />
                  </div>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label>URL*</label>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <input type="text" className="form-control" style={{ flex: 1 }} value={webhookForm.url} onChange={e => setWebhookForm({...webhookForm, url: e.target.value})} placeholder="https://" />
                      <button className="btn btn-outline" style={{ padding: "0 1rem" }}><Copy size={16} /></button>
                    </div>
                  </div>
                </div>

                <div className="input-group" style={{ overflow: "visible" }}>
                  <label>Content-Type*</label>
                  <CustomSelect value={webhookForm.contentType} onChange={val => setWebhookForm({...webhookForm, contentType: val})} options={["JSON", "Form-Data", "XML"]} />
                </div>

                {/* Tabs */}
                <div style={{ border: "1px solid var(--border-color)", borderRadius: "8px", overflow: "hidden", marginTop: "1rem" }}>
                  <div style={{ display: "flex", borderBottom: "1px solid var(--border-color)", backgroundColor: "#f8fafc" }}>
                    <div style={{ flex: 1, padding: "0.75rem", textAlign: "center", fontWeight: "600", color: "var(--primary)", borderBottom: "2px solid var(--primary)" }}>Body</div>
                    <div style={{ flex: 1, padding: "0.75rem", textAlign: "center", color: "var(--text-muted)", cursor: "pointer" }}>Headers</div>
                  </div>
                  <div style={{ padding: "1rem" }}>
                    <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.5rem", display: "block" }}>Webhook Payload*</label>
                    <textarea 
                      className="form-control" 
                      rows="8" 
                      style={{ fontFamily: "monospace", fontSize: "0.85rem", backgroundColor: "#f8fafc" }}
                      value={webhookForm.payload}
                      onChange={e => setWebhookForm({...webhookForm, payload: e.target.value})}
                    ></textarea>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>Use <code style={{ color: "var(--primary)" }}>{`{{}}`}</code> to add dynamic fields.</p>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontWeight: "600", fontSize: "0.95rem" }}>Webhook Status :</span>
                    <label style={{ position: 'relative', display: 'inline-block', width: '40px', height: '22px' }}>
                      <input type="checkbox" style={{ opacity: 0, width: 0, height: 0 }} checked={webhookForm.enabled} onChange={() => setWebhookForm({...webhookForm, enabled: !webhookForm.enabled})} />
                      <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: webhookForm.enabled ? '#22c55e' : '#cbd5e1', transition: '.4s', borderRadius: '34px' }}></span>
                      <span style={{ position: 'absolute', content: '""', height: '16px', width: '16px', left: webhookForm.enabled ? '20px' : '3px', bottom: '3px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%' }}></span>
                    </label>
                    <span style={{ fontSize: "0.9rem", color: webhookForm.enabled ? "var(--dark)" : "var(--text-muted)" }}>{webhookForm.enabled ? "Enabled" : "Disabled"}</span>
                  </div>
                  
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <button className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Close</button>
                    <button className="btn btn-primary" onClick={handleCreateWebhook}>Create</button>
                  </div>
                </div>
              </div>
            )}

            {modalType === "email" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div className="input-group">
                  <label>Report Name*</label>
                  <input type="text" className="form-control" value={emailForm.name} onChange={e => setEmailForm({...emailForm, name: e.target.value})} placeholder="e.g. Daily Failed Summary" />
                </div>
                
                <div className="input-group" style={{ overflow: "visible" }}>
                  <label>Select Service</label>
                  <CustomSelect value={emailForm.service} onChange={val => setEmailForm({...emailForm, service: val})} options={["All", "Email", "App Notification", "SMS", "Text Notification"]} />
                </div>
                
                <div className="input-group" style={{ overflow: "visible" }}>
                  <label>Select Event*</label>
                  <CustomSelect value={emailForm.event} onChange={val => setEmailForm({...emailForm, event: val})} options={["On Failed Events", "Daily Digest", "Weekly Summary"]} />
                </div>

                <div className="input-group">
                  <label>Target Email Address*</label>
                  <input type="email" className="form-control" value={emailForm.emailAddress} onChange={e => setEmailForm({...emailForm, emailAddress: e.target.value})} placeholder="admin@example.com" />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontWeight: "600", fontSize: "0.95rem" }}>Report Status :</span>
                    <label style={{ position: 'relative', display: 'inline-block', width: '40px', height: '22px' }}>
                      <input type="checkbox" style={{ opacity: 0, width: 0, height: 0 }} checked={emailForm.enabled} onChange={() => setEmailForm({...emailForm, enabled: !emailForm.enabled})} />
                      <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: emailForm.enabled ? '#22c55e' : '#cbd5e1', transition: '.4s', borderRadius: '34px' }}></span>
                      <span style={{ position: 'absolute', content: '""', height: '16px', width: '16px', left: emailForm.enabled ? '20px' : '3px', bottom: '3px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%' }}></span>
                    </label>
                    <span style={{ fontSize: "0.9rem", color: emailForm.enabled ? "var(--dark)" : "var(--text-muted)" }}>{emailForm.enabled ? "Enabled" : "Disabled"}</span>
                  </div>
                  
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <button className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Close</button>
                    <button className="btn btn-primary" onClick={handleCreateEmailReport}>Create</button>
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </div>
      )}

    </div>
  );
}

export default function OrganizationEditPage() {
  return (
    <Suspense fallback={<div style={{ padding: "2rem" }}>Loading...</div>}>
      <OrganizationEditContent />
    </Suspense>
  );
}
