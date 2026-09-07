"use client";

import { useState, useRef, useEffect } from "react";
import { useNotifications } from "@/context/NotificationContext";
import { Plus, LayoutTemplate, X } from "lucide-react";
import toast from "react-hot-toast";
import CustomSelect from "@/components/CustomSelect";

export default function TriggerPage() {
  const { triggers, addTrigger, selectedCompany } = useNotifications();
  const [isCreatingTrigger, setIsCreatingTrigger] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Trigger Creation State
  const [selectedTriggerType, setSelectedTriggerType] = useState(null);
  const [triggerScope, setTriggerScope] = useState("all");
  const [selectedApps, setSelectedApps] = useState([]);
  const [isAppDropdownOpen, setIsAppDropdownOpen] = useState(false);
  const [triggerName, setTriggerName] = useState("Untitled Trigger");
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsAppDropdownOpen(false);
      }
    }
    
    if (isAppDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAppDropdownOpen]);

  const isSaveActive = selectedTriggerType !== null && (triggerScope === "all" || (triggerScope === "some" && selectedApps.length > 0)) && triggerName.trim() !== "";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "600", color: "var(--dark)", margin: 0 }}>Triggers</h1>
          <p style={{ color: "var(--text-muted)", margin: "0.25rem 0 0 0", fontSize: "0.9rem" }}>Showing triggers for {selectedCompany}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsCreatingTrigger(true)}>
          <span>Add New Trigger</span> <Plus size={18} />
        </button>
      </div>

      <div style={{ backgroundColor: "white", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border-color)", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", marginBottom: "2rem" }}>
        {triggers.length === 0 ? (
          <div style={{ padding: "4rem 1rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
            <LayoutTemplate size={48} style={{ color: "var(--text-muted)", opacity: 0.5, marginBottom: "0.5rem" }} />
            <h3 style={{ color: "var(--dark)", fontSize: "1.2rem", fontWeight: "600" }}>No triggers configured</h3>
            <p style={{ color: "var(--text-muted)", maxWidth: "400px" }}>This container has no triggers. Create one to define when your notifications should be sent.</p>
            <button className="btn btn-primary" onClick={() => setIsCreatingTrigger(true)} style={{ marginTop: "1rem" }}>
              Create New Trigger
            </button>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-muted)" }}>
                  <th style={{ padding: "1rem 1.5rem", width: "40px" }}>
                    <input type="checkbox" style={{ cursor: "pointer", width: "16px", height: "16px" }} />
                  </th>
                  <th style={{ padding: "1rem 1.5rem", fontWeight: "500" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
                      Name
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5"></path><polyline points="5 12 12 5 19 12"></polyline></svg>
                    </div>
                  </th>
                  <th style={{ padding: "1rem 1.5rem", fontWeight: "500" }}>Event Type</th>
                  <th style={{ padding: "1rem 1.5rem", fontWeight: "500" }}>Filter</th>
                  <th style={{ padding: "1rem 1.5rem", fontWeight: "500" }}>Tags</th>
                  <th style={{ padding: "1rem 1.5rem", fontWeight: "500" }}>Last Edited</th>
                </tr>
              </thead>
              <tbody>
                {triggers.map(trigger => (
                  <tr key={trigger.id} className="table-row">
                    <td>
                      <input type="checkbox" style={{ cursor: "pointer", width: "16px", height: "16px" }} />
                    </td>
                    <td style={{ color: "var(--primary)", cursor: "pointer", fontWeight: "600" }}>{trigger.name}</td>
                    <td style={{ color: "var(--text-main)" }}>{trigger.eventType}</td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <span style={{ backgroundColor: "#f1f5f9", padding: "0.2rem 0.6rem", borderRadius: "4px", color: "var(--dark)", fontSize: "0.85rem", fontWeight: "500" }}>{trigger.filterField}</span>
                        <span style={{ color: "var(--text-main)" }}>{trigger.filterCondition}</span>
                      </div>
                    </td>
                    <td style={{ color: "var(--text-main)" }}>{trigger.tags}</td>
                    <td style={{ color: "var(--text-muted)" }}>{trigger.lastEdited}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isCreatingTrigger && (
        <>
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15, 23, 42, 0.4)", zIndex: 999, transition: "opacity 0.3s" }} onClick={() => setIsCreatingTrigger(false)}></div>
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "600px", backgroundColor: "white", zIndex: 1000, display: "flex", flexDirection: "column", boxShadow: "-4px 0 15px rgba(0,0,0,0.1)", animation: "slideInRight 0.3s ease-out" }}>
            <div style={{ backgroundColor: "white", padding: "0.75rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center" }} onClick={() => setIsCreatingTrigger(false)}>
                  <X size={20} />
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <input
                    type="text"
                    value={triggerName}
                    onChange={(e) => setTriggerName(e.target.value)}
                    style={{ fontSize: "1.1rem", border: "none", outline: "none", color: "var(--dark)", width: "200px", backgroundColor: "transparent" }}
                  />
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-muted)", cursor: "pointer" }}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <button 
                  style={{ 
                    backgroundColor: isSaveActive ? "#1a73e8" : "#f1f5f9", 
                    color: isSaveActive ? "white" : "#94a3b8", 
                    border: "none", 
                    padding: "0.5rem 1.2rem", 
                    borderRadius: "4px", 
                    fontSize: "0.9rem", 
                    fontWeight: "500", 
                    cursor: isSaveActive ? "pointer" : "not-allowed",
                    transition: "all 0.2s"
                  }}
                  onClick={() => {
                    if (isSaveActive) {
                      const newTrigger = {
                        id: Date.now(),
                        name: triggerName,
                        eventType: selectedTriggerType,
                        filterField: triggerScope === "all" ? "All Platforms" : "Platform",
                        filterCondition: triggerScope === "some" ? `equals ${selectedApps.join(", ")}` : "",
                        tags: 0,
                        lastEdited: "Just now"
                      };
                      addTrigger(newTrigger);

                      setIsCreatingTrigger(false);
                      setSelectedTriggerType(null);
                      setTriggerScope("all");
                      setSelectedApps([]);
                      setTriggerName("Untitled Trigger");
                    }
                  }}
                >
                  Save
                </button>
                <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                </button>
              </div>
            </div>

            <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "2rem" }}>
              <div 
                style={{ width: "100%", maxWidth: "800px", backgroundColor: "white", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", position: "relative", cursor: !selectedTriggerType ? "pointer" : "default", transition: "box-shadow 0.2s" }}
                onClick={() => !selectedTriggerType && setIsDrawerOpen(true)}
                onMouseEnter={(e) => !selectedTriggerType && (e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)")}
                onMouseLeave={(e) => !selectedTriggerType && (e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)")}
              >
                <div style={{ padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: selectedTriggerType ? "1px solid var(--border-color)" : "none" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: "500", margin: 0, color: "var(--dark)" }}>Trigger Configuration</h3>
                  <button 
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
                    onClick={(e) => { e.stopPropagation(); setIsDrawerOpen(true); }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                  </button>
                </div>

                {!selectedTriggerType ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1.5rem", paddingBottom: "2.5rem" }}>
                    <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transform: "rotate(45deg)", overflow: "visible" }}>
                        <circle cx="9" cy="9" r="5"></circle>
                        <circle cx="15" cy="15" r="5"></circle>
                      </svg>
                    </div>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", margin: 0 }}>Choose a trigger type to begin setup...</p>
                  </div>
                ) : (
                  <div style={{ padding: "1.5rem", paddingTop: "0.5rem", paddingBottom: "2.5rem" }}>
                    <div style={{ marginBottom: "2.5rem" }}>
                      <label style={{ display: "block", color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>Trigger Type</label>
                      <div 
                        style={{ border: "1px solid var(--border-color)", borderRadius: "6px", padding: "1rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", backgroundColor: "white", transition: "background-color 0.2s" }}
                        onClick={() => setIsDrawerOpen(true)}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "white"}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                          <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#4285f4", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"></circle>
                              <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                          </div>
                          <span style={{ fontWeight: "500", color: "var(--dark)", fontSize: "1rem" }}>{selectedTriggerType}</span>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: "block", color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>This trigger fires on</label>
                      <div style={{ display: "flex", gap: "2rem", marginBottom: "1.5rem" }}>
                        <label 
                          style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.95rem", color: "var(--dark)" }}
                          title="All App and Web"
                        >
                          <input 
                            type="radio" 
                            name="triggerScope" 
                            checked={triggerScope === "all"} 
                            onChange={() => setTriggerScope("all")}
                            style={{ width: "16px", height: "16px", accentColor: "#4285f4", cursor: "pointer" }}
                          />
                          All Platforms
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.95rem", color: "var(--dark)" }}>
                          <input 
                            type="radio" 
                            name="triggerScope" 
                            checked={triggerScope === "some"} 
                            onChange={() => setTriggerScope("some")}
                            style={{ width: "16px", height: "16px", accentColor: "#4285f4", cursor: "pointer" }}
                          />
                          Some Platforms
                        </label>
                      </div>

                      {triggerScope === "some" && (
                        <div style={{ border: "1px solid var(--border-color)", borderRadius: "6px", padding: "1.5rem", backgroundColor: "white" }}>
                          <div style={{ display: "flex", gap: "1rem", alignItems: "center", position: "relative" }}>
                            <CustomSelect
                              value="Platform Name"
                              onChange={() => {}}
                              options={["Platform Name"]}
                              style={{ flex: 1 }}
                            />
                            <CustomSelect
                              value="equals"
                              onChange={() => {}}
                              options={["equals", "contains"]}
                              style={{ flex: 1 }}
                            />
                            
                            <div style={{ flex: 1, position: "relative" }} ref={dropdownRef}>
                              <div 
                                style={{ padding: "0.5rem 1rem", border: "1px solid var(--border-color)", borderRadius: "4px", backgroundColor: "#f8fafc", color: "var(--dark)", fontSize: "0.9rem", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                                onClick={() => setIsAppDropdownOpen(!isAppDropdownOpen)}
                              >
                                <span>{selectedApps.length > 0 ? `${selectedApps.length} selected` : "Select platforms..."}</span>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isAppDropdownOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}><path d="m6 9 6 6 6-6" /></svg>
                              </div>

                              {isAppDropdownOpen && (
                                <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: "4px", backgroundColor: "white", border: "1px solid var(--border-color)", borderRadius: "4px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", zIndex: 10, maxHeight: "200px", overflowY: "auto" }}>
                                  {["MantraCare", "TherapyMantra", "Physio Mantra", "Web Platform"].map(app => (
                                    <label key={app} style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer", fontSize: "0.9rem", color: "var(--dark)", padding: "0.75rem 1rem", borderBottom: "1px solid #f1f5f9" }}>
                                      <input 
                                        type="checkbox"
                                        checked={selectedApps.includes(app)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedApps([...selectedApps, app]);
                                          } else {
                                            setSelectedApps(selectedApps.filter(a => a !== app));
                                          }
                                        }}
                                        style={{ width: "16px", height: "16px", accentColor: "#4285f4", cursor: "pointer" }}
                                      />
                                      {app}
                                    </label>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {isDrawerOpen && (
              <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "400px", backgroundColor: "white", boxShadow: "-2px 0 8px rgba(0,0,0,0.15)", zIndex: 1010, display: "flex", flexDirection: "column", animation: "slideIn 0.3s ease-out forwards" }}>
                <div style={{ padding: "1rem 1.5rem", backgroundColor: "var(--dark)", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "500" }}>Choose trigger type</h3>
                  <button style={{ background: "none", border: "none", cursor: "pointer", color: "white", opacity: 0.8 }} onClick={() => setIsDrawerOpen(false)}>
                    <X size={20} />
                  </button>
                </div>

                <div style={{ flex: 1, overflowY: "auto", padding: "1rem 0" }}>
                  <div style={{ padding: "0.5rem 1.5rem", fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.5rem" }}>
                    Event Types
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {[
                      "Signup",
                      "Session Booked",
                      "Session Completed",
                      "Session is Started",
                      "Session Link Generated",
                      "Message Sent",
                      "Profile Edited",
                      "Invite Code added"
                    ].map((type) => (
                      <div
                        key={type}
                        style={{ padding: "0.85rem 1.5rem", borderBottom: "1px solid #f1f5f9", cursor: "pointer", display: "flex", alignItems: "center", gap: "1rem", transition: "background-color 0.2s" }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                        onClick={() => {
                          setSelectedTriggerType(type);
                          setIsDrawerOpen(false);
                        }}
                      >
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                        </div>
                        <span style={{ fontSize: "0.95rem", color: "var(--dark)", fontWeight: "500" }}>{type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
