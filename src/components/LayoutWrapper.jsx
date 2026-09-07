"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import { NotificationProvider, useNotifications } from "../context/NotificationContext";
import { Menu, Building2 } from "lucide-react";
import CustomSelect from "./CustomSelect";

function LayoutContent({ children, isSidebarOpen, setIsSidebarOpen }) {
  const { selectedCompany, setSelectedCompany, organizations } = useNotifications();
  const companyOptions = organizations && organizations.length > 0
    ? organizations.map(o => o.companyKey)
    : [selectedCompany];

  return (
    <div className="app-layout">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="main-content">
        <header className="top-header">
          <button
            className="mobile-menu-btn"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu size={24} />
          </button>
          <div style={{ marginLeft: "auto", display: "flex", gap: "1rem", alignItems: "center" }}>
            <CustomSelect
              value={selectedCompany}
              onChange={setSelectedCompany}
              options={companyOptions}
              icon={Building2}
              style={{ width: "200px" }}
              className="company-dropdown"
            />
          </div>
        </header>

        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}

export default function LayoutWrapper({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <NotificationProvider>
      <LayoutContent isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}>
        {children}
      </LayoutContent>
    </NotificationProvider>
  );
}
