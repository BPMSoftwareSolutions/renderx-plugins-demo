import React from "react";

export function HeaderControls() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", gap: 8 }}>
      <button style={{ padding: "6px 10px", fontSize: 12 }} title="New">New</button>
      <button style={{ padding: "6px 10px", fontSize: 12 }} title="Open">Open</button>
      <button style={{ padding: "6px 10px", fontSize: 12 }} title="Save">Save</button>
    </div>
  );
}

