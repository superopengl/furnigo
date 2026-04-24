"use client";

import { useRouter } from "next/navigation";
import { Button, Typography } from "antd";
import { ArrowRightOutlined, CustomerServiceOutlined, ShopOutlined, GlobalOutlined } from "@ant-design/icons";
import { colors } from "@/lib/theme";

const { Title, Text, Paragraph } = Typography;

const features = [
  {
    icon: <CustomerServiceOutlined style={{ fontSize: 28 }} />,
    title: "Live Chat Support",
    description: "Respond to customer inquiries in real-time with our integrated messaging system.",
  },
  {
    icon: <ShopOutlined style={{ fontSize: 28 }} />,
    title: "Order Management",
    description: "Track orders from Foshan manufacturers through shipping, customs, and delivery.",
  },
  {
    icon: <GlobalOutlined style={{ fontSize: 28 }} />,
    title: "End-to-End Service",
    description: "Manage trip arrangements, purchase guidance, and door-to-door delivery.",
  },
];

export default function HomePage() {
  const router = useRouter();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `
          radial-gradient(ellipse 80% 50% at 50% 0%, ${colors.surface} 0%, transparent 60%),
          radial-gradient(ellipse 60% 40% at 100% 0%, ${colors.secondary}0c 0%, transparent 50%),
          radial-gradient(ellipse 50% 50% at 0% 100%, ${colors.accent}08 0%, transparent 50%),
          linear-gradient(180deg, ${colors.background} 0%, #f5f0ea 40%, ${colors.surface} 70%, ${colors.background} 100%)
        `,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Warm gradient orbs */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.secondary}18 0%, ${colors.secondary}08 40%, transparent 70%)`,
          top: "-25%",
          right: "-20%",
          filter: "blur(80px)",
          animation: "homeFloat1 12s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.accent}14 0%, ${colors.accent}06 40%, transparent 70%)`,
          bottom: "-10%",
          left: "-8%",
          filter: "blur(70px)",
          animation: "homeFloat2 14s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.secondary}0a 0%, transparent 70%)`,
          top: "50%",
          left: "30%",
          filter: "blur(60px)",
          animation: "homeFloat3 16s ease-in-out infinite",
        }}
      />

      {/* Soft horizontal light band */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: 200,
          top: "30%",
          background: `linear-gradient(180deg, transparent, ${colors.surface}80, transparent)`,
          opacity: 0.6,
        }}
      />

      {/* Subtle dot pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(${colors.border}40 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse 50% 40% at 50% 35%, black 10%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse 50% 40% at 50% 35%, black 10%, transparent 70%)",
        }}
      />

      <style>{`
        @keyframes homeFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-20px, 15px) scale(1.04); }
        }
        @keyframes homeFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(15px, -20px) scale(1.06); }
        }
        @keyframes homeFloat3 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
          50% { transform: translate(-10px, -15px) scale(1.1); opacity: 1; }
        }
      `}</style>

      {/* Header */}
      <header
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 32px",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${colors.secondary}, ${colors.accent})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 4px 16px ${colors.secondary}25`,
            }}
          >
            <span style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>F</span>
          </div>
          <Text strong style={{ color: colors.text, fontSize: 18 }}>
            Furnigo
          </Text>
        </div>

        <Button
          type="text"
          onClick={() => router.push("/admin/login")}
          style={{ color: colors.textSecondary, fontSize: 14 }}
        >
          Admin Login <ArrowRightOutlined />
        </Button>
      </header>

      {/* Hero */}
      <section
        style={{
          position: "relative",
          textAlign: "center",
          padding: "80px 24px 60px",
          maxWidth: 800,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "6px 16px",
            borderRadius: 20,
            background: `${colors.accent}12`,
            border: `1px solid ${colors.accent}20`,
            marginBottom: 24,
          }}
        >
          <Text style={{ color: colors.secondary, fontSize: 13, fontWeight: 500 }}>
            Australian Furniture, Direct from Foshan
          </Text>
        </div>

        <Title
          style={{
            color: colors.text,
            fontSize: "clamp(32px, 5vw, 56px)",
            fontWeight: 700,
            lineHeight: 1.15,
            margin: "0 0 20px",
          }}
        >
          Premium furniture,{" "}
          <span
            style={{
              background: `linear-gradient(135deg, ${colors.secondary}, ${colors.accent})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            delivered to your door
          </span>
        </Title>

        <Paragraph
          style={{
            color: colors.textSecondary,
            fontSize: "clamp(15px, 2vw, 18px)",
            maxWidth: 560,
            margin: "0 auto 40px",
            lineHeight: 1.6,
          }}
        >
          We connect Australian home buyers with Foshan manufacturers. From factory tours
          to customs clearance and setup — we handle everything.
        </Paragraph>

        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <Button
            type="primary"
            size="large"
            onClick={() => router.push("/admin/login")}
            style={{
              borderRadius: 12,
              height: 50,
              padding: "0 32px",
              fontWeight: 600,
              background: `linear-gradient(135deg, ${colors.secondary}, ${colors.accent})`,
              border: "none",
              boxShadow: `0 4px 24px ${colors.secondary}30`,
            }}
          >
            Get Started
          </Button>
          <Button
            size="large"
            onClick={() => router.push("/admin/login")}
            style={{
              borderRadius: 12,
              height: 50,
              padding: "0 32px",
              fontWeight: 500,
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: `1px solid ${colors.border}`,
              color: colors.text,
            }}
          >
            Admin Portal
          </Button>
        </div>
      </section>

      {/* Features */}
      <section
        style={{
          position: "relative",
          maxWidth: 1000,
          margin: "0 auto",
          padding: "40px 24px 80px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 20,
        }}
      >
        {features.map((f) => (
          <div
            key={f.title}
            className="glass"
            style={{
              padding: "32px 28px",
              borderRadius: 20,
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 40px ${colors.primary}10`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "none";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(61,50,40,0.08)";
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: `linear-gradient(135deg, ${colors.secondary}18, ${colors.accent}12)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: colors.secondary,
                marginBottom: 20,
              }}
            >
              {f.icon}
            </div>
            <Text strong style={{ color: colors.text, fontSize: 17, display: "block", marginBottom: 8 }}>
              {f.title}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 1.6 }}>
              {f.description}
            </Text>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer
        style={{
          position: "relative",
          textAlign: "center",
          padding: "24px",
          borderTop: `1px solid ${colors.border}`,
        }}
      >
        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
          Furnigo Pty Ltd
        </Text>
      </footer>
    </div>
  );
}
