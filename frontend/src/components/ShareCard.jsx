import { forwardRef } from "react";

function brokerSitesLabel(estimate) {
  if (!estimate || estimate === 0) return "0";
  if (estimate >= 30) return "30+";
  if (estimate >= 20) return "20+";
  if (estimate >= 8) return "8+";
  return `${estimate}+`;
}

const ShareCard = forwardRef(function ShareCard({ score, breachCount, brokerEstimate, exposedAccounts, scanUrl }, ref) {
  const s = Math.min(100, Math.max(0, Number(score) || 0));
  const riskLevel = s <= 25 ? "Low" : s <= 50 ? "Medium" : s <= 75 ? "High" : "Critical";
  const riskColor = s <= 25 ? "#22C55E" : s <= 50 ? "#EAB308" : s <= 75 ? "#F97316" : "#EF4444";
  const footerUrl = scanUrl || "https://protechtable.com/scan";

  return (
    <div
      ref={ref}
      style={{
        width: 440,
        height: 560,
        background: "linear-gradient(135deg, #0a0a1a 0%, #111127 50%, #0a0a1a 100%)",
        borderRadius: 24,
        padding: 40,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: "system-ui, -apple-system, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -60,
          right: -60,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: `${riskColor}15`,
          filter: "blur(60px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -40,
          left: -40,
          width: 160,
          height: 160,
          borderRadius: "50%",
          background: "#facc1510",
          filter: "blur(50px)",
        }}
      />

      <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: "#facc15" }} aria-hidden>
            ⛨
          </span>
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#facc15",
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            ProTechtable
          </span>
        </div>
        <p style={{ color: "#9ca3af", fontSize: 13, marginTop: 4 }}>Digital Safety Score</p>
      </div>

      <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <div
          style={{
            width: 180,
            height: 180,
            borderRadius: "50%",
            border: `6px solid ${riskColor}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 40px ${riskColor}30`,
          }}
        >
          <span style={{ fontSize: 64, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{Math.round(s)}</span>
          <span style={{ fontSize: 16, color: "#9ca3af" }}>/ 100</span>
        </div>
        <p style={{ marginTop: 12, fontSize: 18, fontWeight: 700, color: riskColor }}>{riskLevel} Risk</p>
      </div>

      <div
        style={{
          display: "flex",
          gap: 24,
          position: "relative",
          zIndex: 1,
          borderTop: "1px solid rgba(255,255,255,0.1)",
          paddingTop: 20,
          width: "100%",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 28, fontWeight: 800, color: "#fff" }}>{breachCount ?? 0}</p>
          <p style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1 }}>Breaches</p>
        </div>
        <div style={{ width: 1, background: "rgba(255,255,255,0.1)" }} />
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 28, fontWeight: 800, color: "#fff" }}>{brokerSitesLabel(brokerEstimate)}</p>
          <p style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1 }}>Broker Sites</p>
        </div>
        <div style={{ width: 1, background: "rgba(255,255,255,0.1)" }} />
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 28, fontWeight: 800, color: "#fff" }}>{exposedAccounts ?? breachCount ?? 0}</p>
          <p style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1 }}>Accounts</p>
        </div>
      </div>

      <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#facc15" }}>How safe are you?</p>
        <p style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{footerUrl.replace(/^https?:\/\//, "")}</p>
      </div>
    </div>
  );
});

ShareCard.displayName = "ShareCard";

export default ShareCard;
