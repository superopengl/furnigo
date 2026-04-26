"use client";

import { Typography, Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

const { Title, Text, Paragraph } = Typography;

export default function TermsOfUsagePage() {
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
          Terms of Use
        </Title>

        <Text style={{ color: "#3d3a35", fontSize: 16, display: "block", marginBottom: 24 }}>
          Last updated: April 25, 2026
        </Text>

        <div style={{ marginBottom: 32 }}>
          <Paragraph style={{ color: "#3d3a35", fontSize: 16, lineHeight: 1.7 }}>
            These Terms of Use ("Terms") govern your access to and use of the Furnigo website, mobile application, and related services ("Services"). By accessing or using our Services, you agree to be bound by these Terms.
          </Paragraph>
          
          <Title level={2} style={{ color: "#3d3a35", marginTop: 32, marginBottom: 16 }}>
            Use of Services
          </Title>
          
          <Paragraph style={{ color: "#3d3a35", fontSize: 16, lineHeight: 1.7 }}>
            You may use our Services only for lawful purposes and in a manner consistent with these Terms. You agree not to:
          </Paragraph>
          
          <ul style={{ color: "#3d3a35", fontSize: 16, lineHeight: 1.7 }}>
            <li>Use the Services in any way that violates applicable laws or regulations</li>
            <li>Access content that you are not authorized to access</li>
            <li>Attempt to interfere with the proper functioning of our Services</li>
          </ul>

          <Title level={2} style={{ color: "#3d3a35", marginTop: 32, marginBottom: 16 }}>
            Furniture Orders and Transactions
          </Title>
          
          <Paragraph style={{ color: "#3d3a35", fontSize: 16, lineHeight: 1.7 }}>
            When placing an order for furniture through our platform:
          </Paragraph>
          
          <ul style={{ color: "#3d3a35", fontSize: 16, lineHeight: 1.7 }}>
            <li>You are entering into a contract with the Foshan manufacturer directly</li>
            <li>Our services include coordination between you and manufacturers, but we are not a party to your purchase contracts</li>
            <li>All payments must be processed through our secure payment system</li>
          </ul>

          <Title level={2} style={{ color: "#3d3a35", marginTop: 32, marginBottom: 16 }}>
            Intellectual Property
          </Title>
          
          <Paragraph style={{ color: "#3d3a35", fontSize: 16, lineHeight: 1.7 }}>
            All intellectual property rights in our Services belong to Furnigo Pty Ltd or its licensors. You may not use any trademarks, logos, or copyrighted content without our express permission.
          </Paragraph>

          <Title level={2} style={{ color: "#3d3a35", marginTop: 32, marginBottom: 16 }}>
            User Accounts
          </Title>
          
          <Paragraph style={{ color: "#3d3a35", fontSize: 16, lineHeight: 1.7 }}>
            To access certain features of our Services, you may need to create an account. You are responsible for maintaining the security of your account and all activities under your account.
          </Paragraph>

          <Title level={2} style={{ color: "#3d3a35", marginTop: 32, marginBottom: 16 }}>
            Limitation of Liability
          </Title>
          
          <Paragraph style={{ color: "#3d3a35", fontSize: 16, lineHeight: 1.7 }}>
            Furnigo Pty Ltd shall not be liable for any indirect, incidental, special, consequential or punitive damages arising out of your use of the Services. Our maximum liability for any claim is limited to the amount paid by you for our services.
          </Paragraph>

          <Title level={2} style={{ color: "#3d3a35", marginTop: 32, marginBottom: 16 }}>
            Termination
          </Title>
          
          <Paragraph style={{ color: "#3d3a35", fontSize: 16, lineHeight: 1.7 }}>
            We may terminate or suspend your access to our Services immediately, without prior notice or liability for any reason, including if you breach these Terms.
          </Paragraph>

          <Title level={2} style={{ color: "#3d3a35", marginTop: 32, marginBottom: 16 }}>
            Changes to Terms
          </Title>
          
          <Paragraph style={{ color: "#3d3a35", fontSize: 16, lineHeight: 1.7 }}>
            We may update these Terms from time to time. If we make material changes, we will notify you by email or through a prominent notice on our Services.
          </Paragraph>

          <Title level={2} style={{ color: "#3d3a35", marginTop: 32, marginBottom: 16 }}>
            Contact Us
          </Title>
          
          <Paragraph style={{ color: "#3d3a35", fontSize: 16, lineHeight: 1.7 }}>
            If you have any questions about these Terms of Use, please contact us at:
          </Paragraph>
          
          <Paragraph style={{ color: "#3d3a35", fontSize: 16, lineHeight: 1.7 }}>
            Furnigo Pty Ltd<br />
            Email: terms@furnigo.com.au
          </Paragraph>
        </div>
      </div>
    </div>
  );
}