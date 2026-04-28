"use client";

import Link from "next/link";
import { Typography } from "antd";
import {
  MessageOutlined,
  StarOutlined,
  CompassOutlined,
  HomeOutlined,
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
    icon: <MessageOutlined style={{ fontSize: 28 }} />,
    title: "AI-Assisted Private Chat",
    description:
      "One-to-one conversation through a dedicated app with AI support — no social media noise, just focused service.",
    image:
      "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?auto=format&fit=crop&w=600&q=80",
  },
  {
    icon: <StarOutlined style={{ fontSize: 28 }} />,
    title: "Curated Selection for You",
    description:
      "Personalised product recommendations tailored to your style, space, and budget — handpicked by our experts.",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80",
  },
  {
    icon: <CompassOutlined style={{ fontSize: 28 }} />,
    title: "Guided Factory Tours",
    description:
      "Optional overseas trip to Foshan for hands-on, one-stop shopping — see, touch, and choose in person.",
    image:
      "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?auto=format&fit=crop&w=600&q=80",
  },
  {
    icon: <HomeOutlined style={{ fontSize: 28 }} />,
    title: "Factory-to-Door Delivery",
    description:
      "Complete logistics from packing and shipping to customs clearance and white-glove setup in your home.",
    image:
      "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=600&q=80",
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
        @keyframes homeFloat3 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
          50% { transform: translate(-12px, -18px) scale(1.08); opacity: 0.8; }
        }
        .download-btn {
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .download-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.15) !important;
        }
        .category-card {
          transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .category-card:hover {
          transform: translateY(-6px) scale(1.02);
          box-shadow: 0 24px 64px rgba(61,50,40,0.2) !important;
        }
        .category-card:hover .category-overlay {
          background: linear-gradient(180deg, transparent 20%, rgba(44,36,32,0.65) 100%) !important;
        }
        .category-card:hover .category-label {
          transform: translateY(-4px);
        }
        .category-card:hover .category-glass {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
        .feature-card {
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 60px rgba(61,50,40,0.12), 0 0 0 1px rgba(255,255,255,0.5) inset !important;
        }
      `}</style>

      {/* Background orbs */}
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.secondary}16 0%, ${colors.secondary}06 40%, transparent 70%)`,
          top: "-25%",
          right: "-20%",
          filter: "blur(100px)",
          animation: "homeFloat1 12s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.accent}12 0%, ${colors.accent}04 40%, transparent 70%)`,
          bottom: "15%",
          left: "-10%",
          filter: "blur(80px)",
          animation: "homeFloat2 14s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.secondary}0c 0%, transparent 70%)`,
          top: "45%",
          left: "35%",
          filter: "blur(70px)",
          animation: "homeFloat3 16s ease-in-out infinite",
        }}
      />

      {/* Header — overlays the hero with glass */}
      <header
        style={{
          position: "absolute",
          top: 12,
          left: 32,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: "10px 20px",
          borderRadius: 16,
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        }}
      >
        <Logo size={36} showText textColor={colors.white} />
      </header>

      {/* Hero — full-width banner with background image */}
      <section
        style={{
          position: "relative",
          width: "100%",
          minHeight: "40vh",
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
                    "linear-gradient(180deg, transparent 40%, rgba(44,36,32,0.45) 100%)",
                  transition: "background 0.5s",
                }}
              />
              <div
                className="category-glass"
                style={{
                  position: "absolute",
                  bottom: 16,
                  left: 16,
                  right: 16,
                  padding: "10px 16px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(16px) saturate(180%)",
                  WebkitBackdropFilter: "blur(16px) saturate(180%)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  opacity: 0.85,
                  transform: "translateY(4px)",
                  transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                }}
              >
                <Text
                  style={{
                    color: colors.white,
                    fontSize: 15,
                    fontWeight: 600,
                    letterSpacing: 0.3,
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
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 32px 80px",
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 24,
        }}
      >
        {features.map((f) => (
          <div
            key={f.title}
            className="feature-card"
            style={{
              borderRadius: 20,
              overflow: "hidden",
              display: "flex",
              background: "rgba(255,255,255,0.55)",
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)",
              border: "1px solid rgba(255,255,255,0.6)",
              boxShadow: "0 8px 32px rgba(61,50,40,0.06), 0 0 0 0.5px rgba(255,255,255,0.4) inset",
            }}
          >
            <div
              style={{
                width: 200,
                minHeight: 200,
                flexShrink: 0,
                position: "relative",
              }}
            >
              <img
                src={f.image}
                alt={f.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>
            <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.6)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.7)",
                  boxShadow: "0 2px 8px rgba(61,50,40,0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: colors.secondary,
                  marginBottom: 16,
                }}
              >
                {f.icon}
              </div>
              <Text
                strong
                style={{
                  color: colors.text,
                  fontSize: 18,
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
                  lineHeight: 1.7,
                }}
              >
                {f.description}
              </Text>
            </div>
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
              background: "linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 32,
              left: 32,
              bottom: 32,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "32px 40px",
              maxWidth: 480,
              borderRadius: 20,
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
              border: "1px solid rgba(255,255,255,0.18)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
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
          padding: "24px 24px",
          margin: "0 32px 24px",
          borderRadius: 16,
          background: "rgba(255,255,255,0.45)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.5)",
          boxShadow: "0 4px 20px rgba(61,50,40,0.04)",
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
