"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Typography, message, Space } from "antd";
import { MailOutlined } from "@ant-design/icons";
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
      router.replace("/chats");
    } catch {
      message.error("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: `linear-gradient(135deg, ${colors.background} 0%, ${colors.surface} 100%)`,
      }}
    >
      <div
        className="glass-strong"
        style={{
          width: "100%",
          maxWidth: 420,
          padding: "48px 36px",
          borderRadius: 24,
          textAlign: "center",
        }}
      >
        <div style={{ marginBottom: 8 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: colors.primary,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <span style={{ color: colors.white, fontSize: 24, fontWeight: 700 }}>F</span>
          </div>
        </div>

        <Title level={3} style={{ margin: 0, color: colors.text }}>
          Furnigo Admin
        </Title>
        <Text style={{ color: colors.textSecondary, display: "block", marginBottom: 36 }}>
          Sign in to manage chats and customers
        </Text>

        {step === "email" ? (
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Input
              size="large"
              prefix={<MailOutlined style={{ color: colors.textSecondary }} />}
              placeholder="Enter your email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onPressEnter={handleSendOtp}
              style={{ borderRadius: 12, height: 48 }}
            />
            <Button
              type="primary"
              size="large"
              block
              loading={loading}
              onClick={handleSendOtp}
              disabled={!email.trim()}
              style={{ borderRadius: 12, height: 48, fontWeight: 600 }}
            >
              Send Verification Code
            </Button>
          </Space>
        ) : (
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Text style={{ color: colors.textSecondary, display: "block", marginBottom: 4 }}>
              Enter the 6-digit code sent to <strong>{email}</strong>
            </Text>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Input.OTP
                length={6}
                value={code}
                onChange={(val) => { setCode(val); if (val.length === 6) handleVerifyOtp(val); }}
                size="large"
              />
            </div>
            <Button
              type="link"
              size="small"
              onClick={handleSendOtp}
              disabled={loading}
              style={{ color: colors.textSecondary }}
            >
              Resend code
            </Button>
            <Button
              type="link"
              size="small"
              onClick={() => { setStep("email"); setCode(""); }}
              style={{ color: colors.textSecondary }}
            >
              Use a different email
            </Button>
          </Space>
        )}
      </div>
    </div>
  );
}
