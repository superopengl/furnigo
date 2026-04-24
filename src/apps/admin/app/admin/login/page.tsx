"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Typography, App, Space, Spin } from "antd";
import { MailOutlined, LoadingOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { colors } from "@/lib/theme";

const { Title, Text } = Typography;

type Step = "email" | "otp";

export default function LoginPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otpId, setOtpId] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { message } = App.useApp();
  const router = useRouter();

  const handleSendOtp = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await api<{ otp_id: string; expires_in: number }>("/auth/otp/send", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.success) {
        setOtpId(res.data.otp_id);
        setStep("otp");
        message.success("Verification code sent to your email");
      } else {
        message.error(res.error.message);
      }
    } catch {
      message.error("Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (value?: string) => {
    const otp = value ?? code;
    if (!otp.trim() || otp.length !== 6) return;
    setLoading(true);
    try {
      const res = await api<{
        user: { id: string; email: string; display_name: string | null; role: string };
        token: string;
      }>("/auth/otp/verify", {
        method: "POST",
        body: JSON.stringify({ otp_id: otpId, code: otp.trim() }),
      });

      if (!res.success) {
        message.error(res.error.message);
        return;
      }

      const { user: u, token } = res.data;

      if (u.role === "client") {
        message.error("Access restricted to admin and agent users");
        return;
      }

      login(
        { id: u.id, email: u.email, displayName: u.display_name, role: u.role },
        token,
      );
      router.replace("/admin/chats");
    } catch {
      message.error("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="login-dark-theme"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "#0f0d0b",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Grid overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 80%)",
        }}
      />

      {/* Animated gradient orbs */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.secondary}35 0%, transparent 70%)`,
          top: "-10%",
          right: "-10%",
          filter: "blur(80px)",
          animation: "float1 8s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.accent}28 0%, transparent 70%)`,
          bottom: "-15%",
          left: "-10%",
          filter: "blur(90px)",
          animation: "float2 10s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 350,
          height: 350,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.primary}22 0%, transparent 70%)`,
          top: "40%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          filter: "blur(60px)",
          animation: "float3 12s ease-in-out infinite",
        }}
      />

      {/* Horizontal light streak */}
      <div
        style={{
          position: "absolute",
          width: "120%",
          height: 1,
          top: "35%",
          left: "-10%",
          background: `linear-gradient(90deg, transparent 0%, ${colors.accent}30 30%, ${colors.secondary}40 50%, ${colors.accent}30 70%, transparent 100%)`,
          filter: "blur(1px)",
          animation: "streak 6s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: 80,
          top: "calc(35% - 40px)",
          left: 0,
          background: `linear-gradient(90deg, transparent 10%, ${colors.secondary}08 40%, ${colors.accent}06 60%, transparent 90%)`,
          filter: "blur(30px)",
          animation: "streak 6s ease-in-out infinite",
        }}
      />

      {/* Diagonal accent lines */}
      <div
        style={{
          position: "absolute",
          width: 300,
          height: 1,
          top: "22%",
          right: "5%",
          background: `linear-gradient(90deg, transparent, ${colors.accent}18, transparent)`,
          transform: "rotate(-25deg)",
          filter: "blur(0.5px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 200,
          height: 1,
          bottom: "28%",
          left: "8%",
          background: `linear-gradient(90deg, transparent, ${colors.secondary}15, transparent)`,
          transform: "rotate(20deg)",
          filter: "blur(0.5px)",
        }}
      />

      {/* Corner ring decoration */}
      <div
        style={{
          position: "absolute",
          width: 300,
          height: 300,
          borderRadius: "50%",
          border: `1px solid ${colors.accent}10`,
          top: -100,
          left: -100,
          animation: "spin 30s linear infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 200,
          height: 200,
          borderRadius: "50%",
          border: `1px solid ${colors.secondary}0c`,
          bottom: -60,
          right: -60,
          animation: "spin 25s linear infinite reverse",
        }}
      />

      {/* Noise texture overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
        }}
      />

      {/* Floating glass shards — decorative */}
      <div
        style={{
          position: "absolute",
          width: 160,
          height: 160,
          borderRadius: 28,
          background: "rgba(255, 255, 255, 0.03)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          top: "12%",
          left: "8%",
          transform: "rotate(-12deg)",
          animation: "floatShard1 14s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 120,
          height: 120,
          borderRadius: 24,
          background: "rgba(255, 255, 255, 0.025)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          bottom: "15%",
          right: "6%",
          transform: "rotate(18deg)",
          animation: "floatShard2 12s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 90,
          height: 90,
          borderRadius: 20,
          background: "rgba(255, 255, 255, 0.02)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: "1px solid rgba(255, 255, 255, 0.04)",
          top: "60%",
          left: "4%",
          transform: "rotate(8deg)",
          animation: "floatShard3 16s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 70,
          height: 70,
          borderRadius: 16,
          background: "rgba(255, 255, 255, 0.02)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          border: "1px solid rgba(255, 255, 255, 0.04)",
          top: "18%",
          right: "12%",
          transform: "rotate(-22deg)",
          animation: "floatShard2 18s ease-in-out infinite reverse",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 110,
          height: 60,
          borderRadius: 20,
          background: "rgba(255, 255, 255, 0.018)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: "1px solid rgba(255, 255, 255, 0.035)",
          bottom: "22%",
          left: "15%",
          transform: "rotate(-6deg)",
          animation: "floatShard1 20s ease-in-out infinite reverse",
        }}
      />

      {/* Glass card */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 420,
          padding: "48px 36px",
          borderRadius: 24,
          textAlign: "center",
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 24px 80px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06), inset 0 -1px 0 rgba(255, 255, 255, 0.02)",
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: 8 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: `linear-gradient(135deg, ${colors.secondary}, ${colors.accent})`,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
              boxShadow: `0 8px 24px ${colors.secondary}40`,
            }}
          >
            <span style={{ color: "#fff", fontSize: 24, fontWeight: 700 }}>F</span>
          </div>
        </div>

        <Title level={2} style={{ margin: 0, color: "rgba(255, 255, 255, 0.92)", marginBlockEnd: "2rem" }}>
          Furnigo Admin
        </Title>

        {step === "email" ? (
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Input
              size="large"
              prefix={<MailOutlined style={{ color: "rgba(255,255,255,0.35)" }} />}
              placeholder="Enter your email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onPressEnter={handleSendOtp}
              style={{
                borderRadius: 12,
                height: 48,
                background: "rgba(255, 255, 255, 0.07)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "rgba(255, 255, 255, 0.9)",
              }}
            />
            <Button
              type="primary"
              size="large"
              block
              loading={loading}
              onClick={handleSendOtp}
              disabled={!email.trim()}
              style={{
                borderRadius: 12,
                height: 48,
                fontWeight: 600,
                background: `linear-gradient(135deg, ${colors.secondary}, ${colors.accent})`,
                border: "none",
                boxShadow: `0 4px 20px ${colors.secondary}40`,
              }}
            >
              Send Verification Code
            </Button>
          </Space>
        ) : (
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Text style={{ color: "rgba(255, 255, 255, 0.4)", display: "block", marginBottom: 4 }}>
              Enter the 6-digit code sent to{" "}
              <strong style={{ color: "rgba(255, 255, 255, 0.75)" }}>{email}</strong>
            </Text>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Input.OTP
                length={6}
                value={code}
                onChange={(val) => { setCode(val); if (val.length === 6) handleVerifyOtp(val); }}
                size="large"
              />
            </div>
            {loading && (
              <Spin indicator={<LoadingOutlined style={{ color: colors.accent }} />} />
            )}
            <Button
              type="link"
              size="small"
              onClick={handleSendOtp}
              disabled={loading}
              style={{ color: "rgba(255, 255, 255, 0.3)" }}
            >
              Resend code
            </Button>
            <Button
              type="link"
              size="small"
              onClick={() => { setStep("email"); setCode(""); }}
              style={{ color: "rgba(255, 255, 255, 0.3)" }}
            >
              Use a different email
            </Button>
          </Space>
        )}
      </div>

      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => router.push("/")}
        style={{
          position: "relative",
          marginTop: 20,
          color: "rgba(255, 255, 255, 0.35)",
          fontSize: 14,
        }}
      >
        Back to Home
      </Button>

      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, 20px) scale(1.05); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(25px, -30px) scale(1.08); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.15); }
        }
        @keyframes streak {
          0%, 100% { opacity: 0.6; transform: scaleX(0.9); }
          50% { opacity: 1; transform: scaleX(1.05); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes floatShard1 {
          0%, 100% { transform: rotate(-12deg) translate(0, 0); opacity: 0.7; }
          50% { transform: rotate(-8deg) translate(10px, -15px); opacity: 1; }
        }
        @keyframes floatShard2 {
          0%, 100% { transform: rotate(18deg) translate(0, 0); opacity: 0.6; }
          50% { transform: rotate(22deg) translate(-12px, 10px); opacity: 1; }
        }
        @keyframes floatShard3 {
          0%, 100% { transform: rotate(8deg) translate(0, 0); opacity: 0.5; }
          50% { transform: rotate(4deg) translate(8px, -12px); opacity: 0.9; }
        }
        .login-dark-theme .ant-input-affix-wrapper {
          background: rgba(255, 255, 255, 0.07) !important;
          border-color: rgba(255, 255, 255, 0.12) !important;
          padding-left: 14px !important;
        }
        .login-dark-theme .ant-input-affix-wrapper:focus,
        .login-dark-theme .ant-input-affix-wrapper-focused {
          border-color: ${colors.accent} !important;
          box-shadow: 0 0 0 2px ${colors.accent}25 !important;
        }
        .login-dark-theme .ant-input-affix-wrapper .ant-input-prefix {
          margin-inline-end: 10px !important;
        }
        .login-dark-theme .ant-input {
          background: transparent !important;
          border: none !important;
          color: rgba(255, 255, 255, 0.9) !important;
        }
        .login-dark-theme .ant-input::placeholder {
          color: rgba(255, 255, 255, 0.3) !important;
        }
        .login-dark-theme .ant-input:focus,
        .login-dark-theme .ant-input-focused {
          border-color: ${colors.accent} !important;
          box-shadow: 0 0 0 2px ${colors.accent}25 !important;
        }
        .login-dark-theme .ant-otp-input {
          background: rgba(255, 255, 255, 0.07) !important;
          border-color: rgba(255, 255, 255, 0.15) !important;
          color: rgba(255, 255, 255, 0.9) !important;
          font-weight: 600;
        }
        .login-dark-theme .ant-otp-input:focus {
          border-color: ${colors.accent} !important;
          box-shadow: 0 0 0 2px ${colors.accent}25 !important;
        }
      `}</style>
    </div>
  );
}
