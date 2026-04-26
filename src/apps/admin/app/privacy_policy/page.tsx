"use client";

import Link from "next/link";
import { Typography, Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

const { Title, Text, Paragraph } = Typography;

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `
          radial-gradient(ellipse 80% 50% at 50% 0%, #fff 0%, transparent 60%),
          radial-gradient(ellipse 60% 40% at 100% 0%, #f3e5d7 0.5, transparent 50%),
          radial-gradient(ellipse 50% 50% at 0% 100%, #f3e5d7 0.5, transparent 50%),
          linear-gradient(180deg, #f9f6f2 0%, #f5f0ea 40%, #fff 70%, #f9f6f2 100%)
        `,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Soft background elements */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(circle, #f3e5d718 0%, #f3e5d708 40%, transparent 70%)`,
          top: "-25%",
          right: "-20%",
          filter: "blur(80px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, #f3e5d714 0%, #f3e5d706 40%, transparent 70%)`,
          bottom: "-10%",
          left: "-8%",
          filter: "blur(70px)",
        }}
      />
      
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.back()}
          style={{ marginBottom: 24, color: "#3d3a35" }}
        >
          Back
        </Button>

        <Title level={1} style={{ color: "#3d3a35", marginBottom: 24 }}>
          Privacy Policy
        </Title>

        <Text style={{ color: "#3d3a35", fontSize: 16, display: "block", marginBottom: 24 }}>
          Last updated: April 25, 2026
        </Text>

        <div style={{ marginBottom: 32 }}>
          <Paragraph style={{ color: "#3d3a35", fontSize: 16, lineHeight: 1.7 }}>
            This Privacy Policy describes how Furnigo Pty Ltd ("we", "us", or "our") collects, uses, and shares your personal information when you use our website and services.
          </Paragraph>
          
          <Title level={2} style={{ color: "#3d3a35", marginTop: 32, marginBottom: 16 }}>
            Information We Collect
          </Title>
          
          <Paragraph style={{ color: "#3d3a35", fontSize: 16, lineHeight: 1.7 }}>
            We collect information that you provide to us directly when using our services, including:
          </Paragraph>
          
          <ul style={{ color: "#3d3a35", fontSize: 16, lineHeight: 1.7 }}>
            <li>Personal information such as your name, email address, and contact details</li>
            <li>Information about your furniture requests and preferences</li>
            <li>Communication records from our chat support system</li>
            <li>Payment information for transactions with manufacturers in China</li>
          </ul>

          <Title level={2} style={{ color: "#3d3a35", marginTop: 32, marginBottom: 16 }}>
            How We Use Your Information
          </Title>
          
          <Paragraph style={{ color: "#3d3a35", fontSize: 16, lineHeight: 1.7 }}>
            We use the information we collect to:
          </Paragraph>
          
          <ul style={{ color: "#3d3a35", fontSize: 16, lineHeight: 1.7 }}>
            <li>Provide and improve our services to you</li>
            <li>Process your furniture orders and facilitate communication with manufacturers</li>
            <li>Respond to your inquiries through our chat support</li>
            <li>Send you relevant information about your orders and services</li>
            <li>Comply with legal obligations</li>
          </ul>

          <Title level={2} style={{ color: "#3d3a35", marginTop: 32, marginBottom: 16 }}>
            Information Sharing and Disclosure
          </Title>
          
          <Paragraph style={{ color: "#3d3a35", fontSize: 16, lineHeight: 1.7 }}>
            We may share your information with:
          </Paragraph>
          
          <ul style={{ color: "#3d3a35", fontSize: 16, lineHeight: 1.7 }}>
            <li>Manufacturers in Foshan who produce your furniture</li>
            <li>Shipping and logistics partners</li>
            <li>Customs brokers and other service providers</li>
            <li>Third-party payment processors when handling transactions</li>
          </ul>

          <Paragraph style={{ color: "#3d3a35", fontSize: 16, lineHeight: 1.7 }}>
            We do not sell or rent your personal information to third parties.
          </Paragraph>

          <Title level={2} style={{ color: "#3d3a35", marginTop: 32, marginBottom: 16 }}>
            Data Security
          </Title>
          
          <Paragraph style={{ color: "#3d3a35", fontSize: 16, lineHeight: 1.7 }}>
            We implement appropriate security measures to protect your personal information from unauthorized access, alteration, or destruction. However, no internet transmission is completely secure.
          </Paragraph>

          <Title level={2} style={{ color: "#3d3a35", marginTop: 32, marginBottom: 16 }}>
            Your Rights
          </Title>
          
          <Paragraph style={{ color: "#3d3a35", fontSize: 16, lineHeight: 1.7 }}>
            You have the right to access, update, or delete your personal information at any time. You may also object to processing of your data and request portability.
          </Paragraph>

          <Title level={2} style={{ color: "#3d3a35", marginTop: 32, marginBottom: 16 }}>
            Cookies and Tracking Technologies
          </Title>
          
          <Paragraph style={{ color: "#3d3a35", fontSize: 16, lineHeight: 1.7 }}>
            We use cookies and similar tracking technologies to enhance your experience on our website. You can manage or disable cookies through your browser settings.
          </Paragraph>

          <Title level={2} style={{ color: "#3d3a35", marginTop: 32, marginBottom: 16 }}>
            Changes to This Policy
          </Title>
          
          <Paragraph style={{ color: "#3d3a35", fontSize: 16, lineHeight: 1.7 }}>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.
          </Paragraph>

          <Title level={2} style={{ color: "#3d3a35", marginTop: 32, marginBottom: 16 }}>
            Contact Us
          </Title>
          
          <Paragraph style={{ color: "#3d3a35", fontSize: 16, lineHeight: 1.7 }}>
            If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
          </Paragraph>
          
          <Paragraph style={{ color: "#3d3a35", fontSize: 16, lineHeight: 1.7 }}>
            Furnigo Pty Ltd<br />
            Email: privacy@furnigo.com.au
          </Paragraph>
        </div>
      </div>
    </div>
  );
}