import Image from "next/image";

interface LogoProps {
  size?: number;
  showText?: boolean;
  textColor?: string;
  textSize?: number;
}

export function Logo({ size = 40, showText = false, textColor, textSize = 18 }: LogoProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.3,
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <Image
          src="/logo.png"
          alt="Furnigo"
          width={size}
          height={size}
          style={{ objectFit: "contain", width: size, height: size }}
          priority
        />
      </div>
      {showText && (
        <span style={{ color: textColor, fontSize: textSize, fontWeight: 600 }}>
          Furnigo
        </span>
      )}
    </div>
  );
}
