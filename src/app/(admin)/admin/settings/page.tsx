"use client";

export default function AdminSettings() {
  return (
    <div>
      <div style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#1f2937", marginBottom: "10px" }}>
          Settings
        </h2>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>
          Configure your store settings, preferences, and system options.
        </p>
      </div>

      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          padding: "40px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          border: "1px solid #e5e7eb",
          textAlign: "center",
        }}
      >
        <i className="fi-rr-settings" style={{ fontSize: "64px", color: "#d1d5db", marginBottom: "20px" }}></i>
        <h3 style={{ fontSize: "20px", fontWeight: "600", color: "#1f2937", marginBottom: "10px" }}>
          Settings
        </h3>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>
          This section is ready for you to add settings and configuration options.
        </p>
      </div>
    </div>
  );
}
