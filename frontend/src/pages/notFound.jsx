import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #020817 0%, #1e293b 100%)",
      color: "#e2e8f0",
      fontFamily: "DM Sans, sans-serif",
      padding: "20px",
      textAlign: "center",
    }}>
      <div style={{ maxWidth: "600px" }}>
        <h1 style={{
          fontSize: "120px",
          fontWeight: "700",
          margin: "0",
          background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          404
        </h1>
        
        <h2 style={{
          fontSize: "32px",
          fontWeight: "600",
          margin: "20px 0 10px 0",
          color: "#e2e8f0",
        }}>
          Page Not Found
        </h2>
        
        <p style={{
          fontSize: "16px",
          color: "#94a3b8",
          margin: "10px 0 30px 0",
          lineHeight: "1.6",
        }}>
          Oops! The page you're looking for doesn't exist. It might have been removed or the URL might be incorrect.
        </p>
        
        <Link
          to="/"
          style={{
            display: "inline-block",
            padding: "12px 32px",
            background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
            color: "#fff",
            textDecoration: "none",
            borderRadius: "8px",
            fontWeight: "600",
            transition: "transform 0.3s ease",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"}
          onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
}
