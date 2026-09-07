"use client";

import { useState } from "react";
import { Mail, Save, Server, ShieldCheck, Zap, Send, Settings, CheckCircle2, Activity } from "lucide-react";

const EMAIL_PROVIDERS = {
  Sendgrid: ["donotreply@mantra.care", "support@mantra.care", "provider@mantra.care"],
  Brevo: ["donotreply@mantra.care", "donotreply@mantracare.com", "provider@mantra.care", "provider@mantracare.com"],
  SES: ["donotreply@mantra.care", "donotreply@mantracare.org", "provider@mantra.care", "provider@mantracare.org"]
};

const PROVIDER_INFO = {
  Sendgrid: { icon: Send, color: "#1E88E5", desc: "High deliverability, best for marketing blasts." },
  Brevo: { icon: Zap, color: "#009688", desc: "Automated workflows and transactional sync." },
  SES: { icon: Server, color: "#FF9800", desc: "AWS infrastructure, highly scalable & secure." },
};

export default function EmailPage() {
  const [provider, setProvider] = useState("Sendgrid");
  const [senderEmail, setSenderEmail] = useState(EMAIL_PROVIDERS["Sendgrid"][0]);

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", paddingBottom: "3rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "700", color: "var(--dark)", display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
            <Mail size={28} color="var(--primary)" /> Email Infrastructure
          </h1>
          <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "0.95rem" }}>Manage your global sender identities and delivery routing.</p>
        </div>
        <button className="btn btn-primary" onClick={() => alert("Settings saved successfully!")} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.25rem", borderRadius: "0.5rem", fontWeight: "600", boxShadow: "0 4px 6px -1px rgba(14, 165, 233, 0.3)" }}>
          <Save size={18} /> Save Changes
        </button>
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
        
        {/* Section 1: Provider Selection */}
        <div className="card" style={{ padding: 0, overflow: "hidden", border: "1px solid var(--border-color)", borderRadius: "0.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-color)", backgroundColor: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "600", color: "var(--dark)", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Server size={18} color="var(--text-muted)" /> Active SMTP Provider
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "0.25rem 0 0 0" }}>Select the primary routing engine for outgoing emails.</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", fontWeight: "600", color: "#10b981", backgroundColor: "#d1fae5", padding: "0.25rem 0.75rem", borderRadius: "2rem" }}>
              <Activity size={14} /> System Operational
            </div>
          </div>
          
          <div style={{ padding: "1.5rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
            {Object.keys(EMAIL_PROVIDERS).map(p => {
              const info = PROVIDER_INFO[p];
              const isSelected = provider === p;
              const Icon = info.icon;
              
              return (
                <div 
                  key={p}
                  onClick={() => {
                    setProvider(p);
                    setSenderEmail(EMAIL_PROVIDERS[p][0]);
                  }}
                  style={{ 
                    border: `2px solid ${isSelected ? "var(--primary)" : "var(--border-color)"}`, 
                    borderRadius: "0.5rem", 
                    padding: "1.25rem", 
                    cursor: "pointer",
                    backgroundColor: isSelected ? "#f0f9ff" : "white",
                    transition: "all 0.2s ease",
                    position: "relative"
                  }}
                >
                  {isSelected && (
                    <div style={{ position: "absolute", top: "1rem", right: "1rem", color: "var(--primary)" }}>
                      <CheckCircle2 size={20} />
                    </div>
                  )}
                  <div style={{ width: "40px", height: "40px", borderRadius: "0.5rem", backgroundColor: `${info.color}15`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem", color: info.color }}>
                    <Icon size={20} />
                  </div>
                  <h4 style={{ fontSize: "1.1rem", fontWeight: "600", color: "var(--dark)", margin: "0 0 0.25rem 0" }}>{p}</h4>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.4 }}>{info.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Sender Identity */}
        <div className="card" style={{ padding: 0, overflow: "hidden", border: "1px solid var(--border-color)", borderRadius: "0.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-color)", backgroundColor: "#f8fafc" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "600", color: "var(--dark)", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <ShieldCheck size={18} color="var(--text-muted)" /> Sender Identity
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "0.25rem 0 0 0" }}>Configure the default FROM address for {provider}.</p>
          </div>
          
          <div style={{ padding: "1.5rem" }}>
            <div className="input-group" style={{ maxWidth: "500px", marginBottom: 0 }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                Verified Domain Addresses
              </label>
              <div style={{ position: "relative" }}>
                <select 
                  className="form-control" 
                  value={senderEmail} 
                  onChange={(e) => setSenderEmail(e.target.value)}
                  style={{ padding: "0.75rem 1rem", fontSize: "1rem", appearance: "none", backgroundColor: "white", cursor: "pointer", border: "1px solid var(--border-color)", borderRadius: "0.5rem", width: "100%" }}
                >
                  {EMAIL_PROVIDERS[provider].map(email => (
                    <option key={email} value={email}>{email}</option>
                  ))}
                </select>
                <div style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-muted)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#10b981" }} />
                DKIM & SPF verified for this identity.
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
