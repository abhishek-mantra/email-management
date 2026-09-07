"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, X, Globe, Phone, Mail, Activity, CheckCircle2, Building, Search, Send, ShieldCheck, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useNotifications } from "@/context/NotificationContext";

export default function OrganizationPage() {
  const router = useRouter();
  const { organizations, allData, addOrganization, deleteOrganization, selectedCompany, setSelectedCompany } = useNotifications();
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    website: "",
    contactNumber: "",
    contactEmail: ""
  });

  const handleDelete = (id, name) => {
    if (confirm(`Are you sure you want to delete organization "${name}"?`)) {
      deleteOrganization(id);
      toast.success("Organization deleted successfully");
    }
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Organization Name is required");
      return;
    }

    const created = addOrganization(formData);
    toast.success(`Organization "${created.name}" created with company key "${created.companyKey}"`);
    setIsAddModalOpen(false);
    setFormData({ name: "", website: "", contactNumber: "", contactEmail: "" });
  };

  // Compute accurate deduplicated aggregate KPIs
  const totalOrgs = organizations.length;
  let totalDispatches = 0;
  let totalDelivered = 0;
  let totalEndpoints = 0;

  organizations.forEach(org => {
    const key = org.companyKey || org.name;
    const orgLogs = (allData && allData[key]?.logs) || [];
    const dispatchMap = {};
    orgLogs.forEach(l => {
      const dKey = `${l.notificationId || ""}_${l.sentTo || ""}_${(l.timestamp || "").split(" ")[0]}`;
      if (!dispatchMap[dKey]) dispatchMap[dKey] = { sent: false, delivered: false };
      if (l.event === "Sent" || l.event === "Failed") dispatchMap[dKey].sent = true;
      if (l.event === "Received" || l.event === "Viewed") dispatchMap[dKey].delivered = true;
    });
    const dispatches = Object.values(dispatchMap);
    totalDispatches += dispatches.length;
    totalDelivered += dispatches.filter(d => d.delivered).length;
    totalEndpoints += (org.webhooks?.length || 0) + (org.emailReports?.length || 0);
  });

  const overallHealth = totalDispatches > 0 ? Math.min(100, Math.round((totalDelivered / totalDispatches) * 100)) : 98;

  const filteredOrgs = organizations.filter(o => 
    o.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (o.companyKey && o.companyKey.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (o.website && o.website.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div style={{ padding: "0 1rem 2rem 1rem", maxWidth: "1240px", margin: "0 auto" }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "800", fontFamily: "var(--font-display)", color: "var(--dark)", margin: 0, letterSpacing: "-0.025em" }}>Organizations</h1>
          <p style={{ color: "var(--text-muted)", margin: "0.25rem 0 0 0", fontSize: "0.875rem" }}>
            Client workspaces, reporting endpoints, and tenant delivery telemetry
          </p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setIsAddModalOpen(true)}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
        >
          <Plus size={16} /> Add Organization
        </button>
      </div>

      {/* KPI Stat Capsules (Design_1.md Section 4.4) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", marginBottom: "1.75rem" }}>
        <div style={{ backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)", borderRadius: "1.25rem", border: "1px solid rgba(255,255,255,0.8)", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-subtle)", fontFamily: "var(--font-display)", margin: 0 }}>TOTAL CLIENTS</p>
            <h3 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--dark)", fontFamily: "var(--font-display)", margin: "0.25rem 0 0 0", letterSpacing: "-0.02em" }}>{totalOrgs}</h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "0.25rem 0 0 0" }}>Active workspace tenants</p>
          </div>
          <div style={{ width: "48px", height: "48px", borderRadius: "16px", backgroundColor: "rgba(20,86,240,0.08)", border: "1px solid rgba(20,86,240,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
            <Building size={20} />
          </div>
        </div>

        <div style={{ backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)", borderRadius: "1.25rem", border: "1px solid rgba(255,255,255,0.8)", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-subtle)", fontFamily: "var(--font-display)", margin: 0 }}>TOTAL DISPATCHES</p>
            <h3 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--dark)", fontFamily: "var(--font-display)", margin: "0.25rem 0 0 0", letterSpacing: "-0.02em" }}>{totalDispatches}</h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "0.25rem 0 0 0" }}>Across all tenant logs</p>
          </div>
          <div style={{ width: "48px", height: "48px", borderRadius: "16px", backgroundColor: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#059669" }}>
            <Send size={20} />
          </div>
        </div>

        <div style={{ backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)", borderRadius: "1.25rem", border: "1px solid rgba(255,255,255,0.8)", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-subtle)", fontFamily: "var(--font-display)", margin: 0 }}>DELIVERY RATE</p>
            <h3 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--dark)", fontFamily: "var(--font-display)", margin: "0.25rem 0 0 0", letterSpacing: "-0.02em" }}>{overallHealth}%</h3>
            <p style={{ fontSize: "12px", color: "#059669", margin: "0.25rem 0 0 0", fontWeight: 600 }}>Optimal pipeline state</p>
          </div>
          <div style={{ width: "48px", height: "48px", borderRadius: "16px", backgroundColor: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#059669" }}>
            <ShieldCheck size={20} />
          </div>
        </div>

        <div style={{ backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)", borderRadius: "1.25rem", border: "1px solid rgba(255,255,255,0.8)", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-subtle)", fontFamily: "var(--font-display)", margin: 0 }}>ACTIVE ENDPOINTS</p>
            <h3 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--dark)", fontFamily: "var(--font-display)", margin: "0.25rem 0 0 0", letterSpacing: "-0.02em" }}>{totalEndpoints}</h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "0.25rem 0 0 0" }}>Webhooks & Email digests</p>
          </div>
          <div style={{ width: "48px", height: "48px", borderRadius: "16px", backgroundColor: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#7c3aed" }}>
            <Activity size={20} />
          </div>
        </div>
      </div>

      {/* Main Table Card (Design_1.md Section 4.3) */}
      <div className="card" style={{ padding: "0", overflow: "hidden", borderRadius: "20px" }}>
        {/* Search Toolbar */}
        <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "rgba(255,255,255,0.6)" }}>
          <div style={{ position: "relative", width: "320px" }}>
            <Search size={15} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input 
              type="text"
              placeholder="Search organizations or keys..."
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
            Showing {filteredOrgs.length} of {totalOrgs} organizations
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "900px" }}>
            <thead className="thead-dark">
              <tr style={{ textAlign: "left" }}>
                <th style={{ padding: "1rem 1.5rem" }}>ID</th>
                <th style={{ padding: "1rem 1.5rem" }}>Client / Company</th>
                <th style={{ padding: "1rem 1.5rem" }}>Website</th>
                <th style={{ padding: "1rem 1.5rem" }}>All-Time Performance</th>
                <th style={{ padding: "1rem 1.5rem", textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrgs.map((org, index) => {
                const companyKey = org.companyKey || org.name;
                const orgLogs = (allData && allData[companyKey]?.logs) || [];
                const dispatchMap = {};
                orgLogs.forEach(l => {
                  const dKey = `${l.notificationId || ""}_${l.sentTo || ""}_${(l.timestamp || "").split(" ")[0]}`;
                  if (!dispatchMap[dKey]) dispatchMap[dKey] = { sent: false, delivered: false };
                  if (l.event === "Sent" || l.event === "Failed") dispatchMap[dKey].sent = true;
                  if (l.event === "Received" || l.event === "Viewed") dispatchMap[dKey].delivered = true;
                });
                const dispatches = Object.values(dispatchMap);
                const totalSent = dispatches.length;
                const delivered = dispatches.filter(d => d.delivered).length;
                const deliveryRate = totalSent > 0 ? Math.min(100, Math.round((delivered / totalSent) * 100)) : 0;
                const isCurrentActive = selectedCompany === companyKey;

                return (
                  <tr 
                    key={org.id} 
                    style={{ 
                      borderBottom: index !== organizations.length - 1 ? "1px solid var(--border-color)" : "none", 
                      transition: "background-color 0.2s",
                      backgroundColor: isCurrentActive ? "rgba(20, 86, 240, 0.02)" : "transparent"
                    }} 
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isCurrentActive ? "rgba(20, 86, 240, 0.05)" : "#f8fafc"} 
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isCurrentActive ? "rgba(20, 86, 240, 0.02)" : "transparent"}
                  >
                    <td style={{ padding: "1rem 1.5rem", color: "var(--dark)", fontWeight: "600", fontSize: "0.9rem", fontFamily: "var(--font-mono)" }}>
                      {org.id}
                    </td>
                    <td style={{ padding: "1rem 1.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontWeight: "600", color: "var(--dark)" }}>{org.name}</span>
                        {isCurrentActive && (
                          <span style={{ padding: "0.15rem 0.5rem", borderRadius: "100px", backgroundColor: "#ecfdf5", color: "#065f46", fontSize: "0.72rem", fontWeight: 700, border: "1px solid rgba(16,185,129,0.3)" }}>
                            Active
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Key: <code>{org.companyKey}</code></div>
                    </td>
                    <td style={{ padding: "1rem 1.5rem" }}>
                      {org.website ? (
                        <a 
                          href={org.website.startsWith("http") ? org.website : `https://${org.website}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          style={{ color: "var(--primary)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.9rem" }}
                        >
                          <Globe size={14} /> {org.website}
                        </a>
                      ) : (
                        <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "1rem 1.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.3rem 0.85rem", borderRadius: "9999px", backgroundColor: "#e0e7ff", color: "#1e40af", fontSize: "0.78rem", fontWeight: "600", fontFamily: "var(--font-display)" }}>
                          <Activity size={13} /> {totalSent} Sent
                        </div>
                        <div style={{ 
                          display: "inline-flex", 
                          alignItems: "center", 
                          gap: "0.35rem", 
                          padding: "0.3rem 0.85rem", 
                          borderRadius: "9999px", 
                          backgroundColor: deliveryRate >= 80 ? "#ecfdf5" : totalSent === 0 ? "#f1f5f9" : "#fffbeb", 
                          color: deliveryRate >= 80 ? "#065f46" : totalSent === 0 ? "#64748b" : "#92400e", 
                          fontSize: "0.78rem", 
                          fontWeight: "600",
                          fontFamily: "var(--font-display)" 
                        }}>
                          <CheckCircle2 size={13} /> {totalSent > 0 ? `${deliveryRate}% Delivery` : "No Activity"}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "0.5rem", alignItems: "center" }}>
                        {!isCurrentActive ? (
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{ padding: "0.35rem 0.65rem", height: "auto", fontSize: "0.78rem", color: "var(--primary)" }}
                            onClick={() => {
                              setSelectedCompany(companyKey);
                              toast.success(`Switched active workspace to "${org.name}"`);
                            }}
                            title="Switch active company to this workspace"
                          >
                            Switch
                          </button>
                        ) : (
                          <span style={{ fontSize: "0.78rem", color: "#16a34a", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0 0.35rem" }}>
                            <CheckCircle2 size={13} /> Selected
                          </span>
                        )}
                        <button 
                          className="btn btn-outline"
                          style={{ padding: "0.35rem 0.65rem", height: "auto" }}
                          title="Edit"
                          onClick={() => router.push(`/organization/edit?id=${org.id}`)}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="btn btn-outline"
                          style={{ padding: "0.35rem 0.65rem", height: "auto", color: "var(--danger)", borderColor: "rgba(239, 68, 68, 0.3)" }}
                          title="Delete"
                          onClick={() => handleDelete(org.id, org.name)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {organizations.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                    No organizations found. Click <strong>Add Organization</strong> to create your first client.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Organization Modal */}
      {isAddModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15, 23, 42, 0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)", padding: "1rem" }}>
          <div className="card" style={{ width: "100%", maxWidth: "520px", backgroundColor: "var(--glass-solid)", borderRadius: "1.75rem", overflow: "hidden", boxShadow: "0 24px 60px -12px rgba(15, 23, 42, 0.35), inset 0 0 0 1px rgba(255,255,255,0.6)" }}>
            <div style={{ padding: "1.5rem 1.75rem", borderBottom: "1px solid rgba(226, 232, 240, 0.9)", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "rgba(248, 250, 252, 0.8)" }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: "700", fontFamily: "var(--font-display)", margin: 0, color: "var(--dark)" }}>Add New Organization</h2>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "0.25rem" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div className="input-group" style={{ margin: 0 }}>
                <label>Organization / Client Name *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. DentalMantra"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  autoFocus
                />
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  This will also create a new selectable workspace key in the top company switcher.
                </span>
              </div>

              <div className="input-group" style={{ margin: 0 }}>
                <label>Website</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. dentalmantra.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="input-group" style={{ margin: 0 }}>
                  <label>Contact Number</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="+91 9999999999"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  />
                </div>
                <div className="input-group" style={{ margin: 0 }}>
                  <label>Contact Email</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    placeholder="admin@example.com"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Organization</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
