"use client";

import Link from "next/link";
import { Typography } from "antd";
import {
  CustomerServiceOutlined,
  ShopOutlined,
  GlobalOutlined,
  AppleOutlined,
  AndroidOutlined,
} from "@ant-design/icons";
import { colors } from "@/lib/theme";
import { Logo } from "@/components/Logo";

const { Title, Text, Paragraph } = Typography;

const IMAGES = {
  hero: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1920&q=80",
  livingRoom:
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80",
  dining:
    "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=600&q=80",
  bedroom:
    "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=600&q=80",
  workspace:
    "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=600&q=80",
  lifestyle:
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=80",
};

const categories = [
  { label: "Living Room", image: IMAGES.livingRoom },
  { label: "Dining", image: IMAGES.dining },
  { label: "Bedroom", image: IMAGES.bedroom },
  { label: "Workspace", image: IMAGES.workspace },
];

const features = [
  {
    icon: <CustomerServiceOutlined style={{ fontSize: 28 }} />,
    title: "Live Chat Support",
    description:
      "Respond to customer inquiries in real-time with our integrated messaging system.",
  },
  {
    icon: <ShopOutlined style={{ fontSize: 28 }} />,
    title: "Order Management",
    description:
      "Track orders from Foshan manufacturers through shipping, customs, and delivery.",
  },
  {
    icon: <GlobalOutlined style={{ fontSize: 28 }} />,
    title: "End-to-End Service",
    description:
      "Manage trip arrangements, purchase guidance, and door-to-door delivery.",
  },
];

export default function HomePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.background,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes homeFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-20px, 15px) scale(1.04); }
        }
        @keyframes homeFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(15px, -20px) scale(1.06); }
        }
        .download-btn {
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .download-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.15) !important;
        }
        .category-card {
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .category-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 60px rgba(61,50,40,0.18) !important;
        }
        .category-card:hover .category-overlay {
          background: linear-gradient(180deg, transparent 30%, rgba(44,36,32,0.7) 100%) !important;
        }
        .category-card:hover .category-label {
          transform: translateY(-4px);
        }
        .feature-card {
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .feature-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 48px rgba(61,50,40,0.12) !important;
        }
      `}</style>

      {/* Background orbs */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.secondary}14 0%, transparent 70%)`,
          top: "-25%",
          right: "-20%",
          filter: "blur(100px)",
          animation: "homeFloat1 12s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.accent}10 0%, transparent 70%)`,
          bottom: "20%",
          left: "-10%",
          filter: "blur(80px)",
          animation: "homeFloat2 14s ease-in-out infinite",
        }}
      />

      {/* Header — overlays the hero */}
      <header
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: "20px 32px",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <Logo size={40} showText textColor={colors.white} />
      </header>

      {/* Hero — full-width banner with background image */}
      <section
        style={{
          position: "relative",
          width: "100%",
          minHeight: "55vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* Background image */}
        <img
          src={IMAGES.hero}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 40%",
          }}
        />
        {/* Dark warm overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(
              180deg,
              ${colors.primary}e0 0%,
              ${colors.primary}a0 40%,
              ${colors.primary}80 70%,
              ${colors.primary}c0 100%
            )`,
          }}
        />

        {/* Content centered on top */}
        <div
          style={{
            position: "relative",
            textAlign: "center",
            maxWidth: 720,
            padding: "80px 32px",
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "6px 18px",
              borderRadius: 20,
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.15)",
              marginBottom: 28,
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            <Text
              style={{
                color: "rgba(255,255,255,0.85)",
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: 0.5,
              }}
            >
              Australian Furniture, Direct from Foshan
            </Text>
          </div>

          <Title
            style={{
              color: colors.white,
              fontSize: "clamp(36px, 5vw, 60px)",
              fontWeight: 700,
              lineHeight: 1.1,
              margin: "0 0 20px",
            }}
          >
            Premium furniture,{" "}
            <span
              style={{
                background: `linear-gradient(135deg, ${colors.accent}, #d4a84a)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              delivered to your door
            </span>
          </Title>

          <Paragraph
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: "clamp(15px, 2vw, 18px)",
              maxWidth: 540,
              margin: "0 auto 40px",
              lineHeight: 1.7,
            }}
          >
            We connect Australian home buyers with Foshan manufacturers. From
            factory tours to customs clearance and setup — we handle everything.
          </Paragraph>

          <div
            style={{
              display: "flex",
              gap: 16,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <a
              href="#"
              className="download-btn"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "14px 28px",
                borderRadius: 14,
                background: colors.white,
                color: colors.primary,
                textDecoration: "none",
                fontSize: 15,
                fontWeight: 600,
                boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
              }}
            >
              <AppleOutlined style={{ fontSize: 22 }} />
              App Store
            </a>
            <a
              href="#"
              className="download-btn"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "14px 28px",
                borderRadius: 14,
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                color: colors.white,
                textDecoration: "none",
                fontSize: 15,
                fontWeight: 600,
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <AndroidOutlined style={{ fontSize: 22 }} />
              Google Play
            </a>
          </div>
        </div>
      </section>

      {/* Showcase — furniture categories */}
      <section
        style={{
          position: "relative",
          maxWidth: 1200,
          margin: "0 auto",
          padding: "60px 32px 80px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 20,
          }}
        >
          {categories.map((cat) => (
            <div
              key={cat.label}
              className="category-card"
              style={{
                borderRadius: 20,
                overflow: "hidden",
                position: "relative",
                aspectRatio: "3/4",
                cursor: "pointer",
                boxShadow: `0 8px 32px ${colors.primary}0c`,
              }}
            >
              <img
                src={cat.image}
                alt={cat.label}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
              <div
                className="category-overlay"
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(180deg, transparent 40%, rgba(44,36,32,0.55) 100%)",
                  transition: "background 0.4s",
                }}
              />
              <div
                className="category-label"
                style={{
                  position: "absolute",
                  bottom: 20,
                  left: 20,
                  right: 20,
                  transition: "transform 0.4s",
                }}
              >
                <Text
                  style={{
                    color: colors.white,
                    fontSize: 18,
                    fontWeight: 600,
                    textShadow: "0 1px 4px rgba(0,0,0,0.3)",
                  }}
                >
                  {cat.label}
                </Text>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section
        style={{
          position: "relative",
          maxWidth: 1000,
          margin: "0 auto",
          padding: "0 24px 80px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 20,
        }}
      >
        {features.map((f) => (
          <div
            key={f.title}
            className="glass feature-card"
            style={{
              padding: "32px 28px",
              borderRadius: 20,
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
            <Text
              strong
              style={{
                color: colors.text,
                fontSize: 17,
                display: "block",
                marginBottom: 8,
              }}
            >
              {f.title}
            </Text>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 14,
                lineHeight: 1.6,
              }}
            >
              {f.description}
            </Text>
          </div>
        ))}
      </section>

      {/* Lifestyle banner */}
      <section
        style={{
          position: "relative",
          maxWidth: 1200,
          margin: "0 auto 80px",
          padding: "0 32px",
        }}
      >
        <div
          style={{
            borderRadius: 28,
            overflow: "hidden",
            position: "relative",
            height: 360,
          }}
        >
          <img
            src={IMAGES.lifestyle}
            alt="Beautiful home interior"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(135deg, ${colors.primary}d0 0%, ${colors.primary}60 50%, transparent 100%)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "48px 56px",
              maxWidth: 520,
            }}
          >
            <Title
              level={2}
              style={{
                color: colors.white,
                fontSize: 34,
                fontWeight: 700,
                lineHeight: 1.2,
                margin: "0 0 16px",
              }}
            >
              Quality craftsmanship, factory-direct pricing
            </Title>
            <Paragraph
              style={{
                color: "rgba(255,255,255,0.8)",
                fontSize: 16,
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Every piece is sourced directly from Foshan&apos;s finest
              manufacturers. We personally verify quality before shipping to
              Australia.
            </Paragraph>
          </div>
        </div>
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
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
            Furnigo Pty Ltd
          </Text>
          <div style={{ display: "flex", gap: 20, marginTop: 8 }}>
            <Link
              href="/privacy_policy"
              style={{
                color: colors.textSecondary,
                fontSize: 12,
                textDecoration: "none",
              }}
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms_of_use"
              style={{
                color: colors.textSecondary,
                fontSize: 12,
                textDecoration: "none",
              }}
            >
              Terms of Use
            </Link>
            <Link
              href="/admin/login"
              style={{
                color: colors.textSecondary,
                fontSize: 12,
                textDecoration: "none",
              }}
            >
              Admin Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
