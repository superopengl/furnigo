"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Typography } from "antd";
import {
  ArrowRightOutlined,
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
  hero: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
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
  const router = useRouter();

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
        .hero-image-main {
          transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .hero-image-main:hover {
          transform: scale(1.02);
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
        <Logo size={40} showText textColor={colors.text} />

        <Button
          type="text"
          onClick={() => router.push("/admin/login")}
          style={{ color: colors.textSecondary, fontSize: 14 }}
        >
          Admin Portal <ArrowRightOutlined />
        </Button>
      </header>

      {/* Hero — split layout with image */}
      <section
        style={{
          position: "relative",
          maxWidth: 1200,
          margin: "0 auto",
          padding: "60px 32px 80px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 60,
          alignItems: "center",
        }}
      >
        {/* Left: text content */}
        <div>
          <div
            style={{
              display: "inline-block",
              padding: "6px 16px",
              borderRadius: 20,
              background: `${colors.accent}12`,
              border: `1px solid ${colors.accent}20`,
              marginBottom: 28,
            }}
          >
            <Text
              style={{
                color: colors.secondary,
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              Australian Furniture, Direct from Foshan
            </Text>
          </div>

          <Title
            style={{
              color: colors.text,
              fontSize: "clamp(32px, 4vw, 52px)",
              fontWeight: 700,
              lineHeight: 1.12,
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
              fontSize: 17,
              maxWidth: 480,
              lineHeight: 1.7,
              margin: "0 0 36px",
            }}
          >
            We connect Australian home buyers with Foshan manufacturers. From
            factory tours to customs clearance and setup — we handle everything.
          </Paragraph>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <a
              href="#"
              className="download-btn"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "14px 28px",
                borderRadius: 14,
                background: colors.primary,
                color: colors.white,
                textDecoration: "none",
                fontSize: 15,
                fontWeight: 600,
                boxShadow: `0 4px 16px ${colors.primary}40`,
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
                background: colors.white,
                color: colors.text,
                textDecoration: "none",
                fontSize: 15,
                fontWeight: 600,
                border: `1px solid ${colors.border}`,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <AndroidOutlined style={{ fontSize: 22 }} />
              Google Play
            </a>
          </div>
        </div>

        {/* Right: hero image composition */}
        <div style={{ position: "relative" }}>
          {/* Main image */}
          <div
            className="hero-image-main"
            style={{
              borderRadius: 24,
              overflow: "hidden",
              boxShadow: `0 24px 64px ${colors.primary}18, 0 8px 24px ${colors.primary}0c`,
              aspectRatio: "4/3",
              position: "relative",
            }}
          >
            <img
              src={IMAGES.hero}
              alt="Modern furniture showroom"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
            {/* Warm overlay tint */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `linear-gradient(135deg, ${colors.secondary}08, ${colors.accent}06)`,
                pointerEvents: "none",
              }}
            />
          </div>

          {/* Decorative accent frame */}
          <div
            style={{
              position: "absolute",
              width: "70%",
              height: "70%",
              border: `2px solid ${colors.accent}30`,
              borderRadius: 24,
              top: -16,
              right: -16,
              zIndex: -1,
            }}
          />

          {/* Floating stat badge */}
          <div
            className="glass-strong"
            style={{
              position: "absolute",
              bottom: -20,
              left: -20,
              padding: "16px 24px",
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              gap: 12,
              zIndex: 2,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: `linear-gradient(135deg, ${colors.secondary}, ${colors.accent})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: colors.white,
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              ✓
            </div>
            <div>
              <Text
                style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 700,
                  color: colors.text,
                }}
              >
                Factory Direct
              </Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                Save up to 60%
              </Text>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase — furniture categories */}
      <section
        style={{
          position: "relative",
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 32px 80px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <Text
            style={{
              color: colors.secondary,
              fontSize: 13,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 1.5,
            }}
          >
            Our Collections
          </Text>
          <Title
            level={2}
            style={{
              color: colors.text,
              fontSize: 32,
              fontWeight: 700,
              margin: "8px 0 0",
            }}
          >
            Furniture for every room
          </Title>
        </div>

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
          </div>
        </div>
      </footer>
    </div>
  );
}
