"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, X, Globe, Phone, Mail, Activity, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useNotifications } from "@/context/NotificationContext";

export default function OrganizationPage() {
  const router = useRouter();
  const { organizations, allData, addOrganization, deleteOrganization } = useNotifications();

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

  return (
    <div style={{ padding: "0 1rem 2rem 1rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "600", color: "var(--dark)", margin: 0 }}>Organizations</h1>
          <p style={{ color: "var(--text-muted)", margin: "0.25rem 0 0 0", fontSize: "0.9rem" }}>
            Manage your clients, notification pipelines, and reporting endpoints
          </p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus size={18} /> Add Organization
        </button>
      </div>

      <div className="card" style={{ padding: "0", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "900px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid var(--border-color)" }}>
                <th style={{ padding: "1rem 1.5rem", fontWeight: "600", color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>ID</th>
                <th style={{ padding: "1rem 1.5rem", fontWeight: "600", color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Client / Company</th>
                <th style={{ padding: "1rem 1.5rem", fontWeight: "600", color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Website</th>
                <th style={{ padding: "1rem 1.5rem", fontWeight: "600", color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>All-Time Performance</th>
                <th style={{ padding: "1rem 1.5rem", fontWeight: "600", color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {organizations.map((org, index) => {
                // Compute performance stats for this org from its logs
                const companyKey = org.companyKey || org.name;
                const orgLogs = (allData && allData[companyKey]?.logs) || [];
                const totalSent = orgLogs.filter(l => l.event === "Sent").length;
                const delivered = orgLogs.filter(l => l.event === "Received" || l.event === "Viewed").length;
                const deliveryRate = totalSent > 0 ? Math.round((delivered / totalSent) * 100) : 0;

                return (
                  <tr 
                    key={org.id} 
                    style={{ borderBottom: index !== organizations.length - 1 ? "1px solid var(--border-color)" : "none", transition: "background-color 0.2s" }} 
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"} 
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <td style={{ padding: "1rem 1.5rem", color: "var(--dark)", fontWeight: "600", fontSize: "0.9rem" }}>
                      {org.id}
                    </td>
                    <td style={{ padding: "1rem 1.5rem" }}>
                      <div style={{ fontWeight: "600", color: "var(--dark)" }}>{org.name}</div>
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
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.25rem 0.6rem", borderRadius: "6px", backgroundColor: "#eff6ff", color: "#1e40af", fontSize: "0.8rem", fontWeight: "600" }}>
                          <Activity size={13} /> {totalSent} Sent
                        </div>
                        <div style={{ 
                          display: "inline-flex", 
                          alignItems: "center", 
                          gap: "0.35rem", 
                          padding: "0.25rem 0.6rem", 
                          borderRadius: "6px", 
                          backgroundColor: deliveryRate >= 80 ? "#ecfdf5" : totalSent === 0 ? "#f1f5f9" : "#fffbeb", 
                          color: deliveryRate >= 80 ? "#065f46" : totalSent === 0 ? "#64748b" : "#92400e", 
                          fontSize: "0.8rem", 
                          fontWeight: "600" 
                        }}>
                          <CheckCircle2 size={13} /> {totalSent > 0 ? `${deliveryRate}% Delivery` : "No Activity"}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "0.5rem" }}>
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
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15, 23, 42, 0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(2px)", padding: "1rem" }}>
          <div className="card" style={{ width: "100%", maxWidth: "520px", backgroundColor: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.15)" }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f8fafc" }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: "600", margin: 0, color: "var(--dark)" }}>Add New Organization</h2>
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
