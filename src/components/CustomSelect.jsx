"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function CustomSelect({ 
  value, 
  onChange, 
  options, 
  icon: Icon, 
  placeholder = "Select...", 
  style = {},
  className = "",
  isMulti = false,
  hasSearch = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (val) => {
    if (isMulti) {
      const newValue = Array.isArray(value) ? [...value] : [];
      if (newValue.includes(val)) {
        onChange(newValue.filter(v => v !== val));
      } else {
        onChange([...newValue, val]);
      }
    } else {
      onChange(val);
      setIsOpen(false);
      setSearchTerm("");
    }
  };

  const selectedOption = !isMulti && options.find(opt => 
    typeof opt === 'string' ? opt === value : opt.value === value
  );
  
  let displayLabel = placeholder;
  if (isMulti) {
    if (Array.isArray(value) && value.length > 0) {
      const selectedLabels = value.map(v => {
        const o = options.find(opt => typeof opt === 'string' ? opt === v : opt.value === v);
        return o ? (typeof o === 'string' ? o : o.label) : v;
      });
      displayLabel = selectedLabels.join(", ");
    }
  } else {
    if (selectedOption) {
      displayLabel = typeof selectedOption === 'string' ? selectedOption : selectedOption.label;
    }
  }

  const filteredOptions = hasSearch && searchTerm
    ? options.filter(opt => {
        const lbl = typeof opt === 'string' ? opt : opt.label;
        return typeof lbl === 'string' && lbl.toLowerCase().includes(searchTerm.toLowerCase());
      })
    : options;

  return (
    <div 
      ref={dropdownRef} 
      style={{ position: "relative", minWidth: "160px", ...style }} 
      className={className}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          padding: "0.6rem 1rem",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          border: isOpen ? "1px solid var(--primary)" : "1px solid rgba(226, 232, 240, 0.8)",
          borderRadius: "0.75rem",
          boxShadow: isOpen ? "0 0 0 3px rgba(79, 70, 229, 0.15)" : "0 2px 4px rgba(0,0,0,0.02)",
          cursor: "pointer",
          transition: "all 0.2s ease",
          fontSize: "0.95rem",
          fontWeight: "600",
          color: "var(--dark)",
          backdropFilter: "blur(12px)",
          outline: "none"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", overflow: "hidden", whiteSpace: "nowrap" }}>
          {Icon && <Icon size={18} color="var(--primary)" />}
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{displayLabel}</span>
        </div>
        <ChevronDown 
          size={16} 
          color="var(--text-muted)" 
          style={{ 
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", 
            transition: "transform 0.2s ease" 
          }} 
        />
      </button>

      {isOpen && (
        <div 
          style={{
            position: "absolute",
            top: "calc(100% + 0.5rem)",
            left: 0,
            right: 0,
            backgroundColor: "white",
            border: "1px solid var(--border-color)",
            borderRadius: "0.75rem",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            zIndex: 1000,
            padding: "0.5rem",
            animation: "fadeInDown 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            transformOrigin: "top",
            maxHeight: "300px",
            overflowY: "auto"
          }}
        >
          {hasSearch && (
            <div style={{ padding: "0.5rem", borderBottom: "1px solid var(--border-color)", marginBottom: "0.2rem" }}>
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                style={{ width: "100%", padding: "0.4rem 0.6rem", border: "1px solid var(--border-color)", borderRadius: "4px", outline: "none", fontSize: "0.85rem", boxSizing: "border-box" }}
              />
            </div>
          )}
          {filteredOptions.length === 0 ? (
            <div style={{ padding: "0.6rem 0.8rem", color: "var(--text-muted)", fontSize: "0.9rem", textAlign: "center" }}>No results found</div>
          ) : (
            filteredOptions.map((opt, idx) => {
              const optValue = typeof opt === 'string' ? opt : opt.value;
              const optLabel = typeof opt === 'string' ? opt : opt.label;
              const isSelected = isMulti ? (Array.isArray(value) && value.includes(optValue)) : optValue === value;

              return (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); handleSelect(optValue); }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    textAlign: "left",
                    padding: "0.6rem 0.8rem",
                    backgroundColor: isSelected && !isMulti ? "var(--primary-light)" : "transparent",
                    color: isSelected && !isMulti ? "var(--primary)" : "var(--text-main)",
                    border: "none",
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    fontWeight: isSelected && !isMulti ? "600" : "500",
                    transition: "all 0.15s ease",
                    marginBottom: idx !== filteredOptions.length - 1 ? "0.2rem" : 0
                  }}
                  onMouseOver={(e) => {
                    if (!isSelected || isMulti) {
                      e.currentTarget.style.backgroundColor = "#f1f5f9";
                      e.currentTarget.style.color = "var(--dark)";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isSelected || isMulti) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "var(--text-main)";
                    }
                  }}
                >
                  <span>{optLabel}</span>
                  {isMulti && (
                    <input type="checkbox" checked={isSelected} readOnly style={{ pointerEvents: "none" }} />
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
      <style>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: scaleY(0.95) translateY(-5px);
          }
          to {
            opacity: 1;
            transform: scaleY(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
