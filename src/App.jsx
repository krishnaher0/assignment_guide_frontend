import React from "react";

function App() {
  return (
    <div style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>
      <h1>Hello !</h1>
      <p>Welcome to assignment Submission application.</p>

      <button
        onClick={() => alert("Button clicked!")}
        style={{
          padding: "10px 20px",
          borderRadius: "6px",
          border: "none",
          background: "#333",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        Click Me
      </button>
    </div>
  );
}

export default App;
