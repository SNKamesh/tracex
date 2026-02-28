export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "black",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <h1
        style={{
          fontSize: "4rem",
          fontWeight: "bold",
          color: "white",
          marginBottom: "20px",
        }}
      >
        Welcome to <span style={{ color: "#00d8ff" }}>TraceX</span>
      </h1>

      <p
        style={{
          color: "#94a3b8",
          fontSize: "1.2rem",
          maxWidth: "600px",
          marginBottom: "40px",
        }}
      >
        Your ultimate study companion. Focus deeper, learn faster, achieve more.
      </p>

      <a
        href="/signup"
        style={{
          background: "#00d8ff",
          padding: "14px 30px",
          borderRadius: "10px",
          color: "black",
          fontWeight: "600",
          fontSize: "1.2rem",
          textDecoration: "none",
          transition: "0.2s",
        }}
      >
        Get Started →
      </a>
    </div>
  );
}