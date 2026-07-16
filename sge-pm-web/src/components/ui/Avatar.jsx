import { withBase } from "../../utils/basePath";

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const COLORS = [
  "#1E6FD9", "#059669", "#D97706", "#7C3AED",
  "#DC2626", "#0891B2", "#CA8A04", "#E11D48",
];

function hashColor(name) {
  if (!name) return COLORS[0];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
}

export function Avatar({ name, src, size = 32, className = "" }) {
  const fullSrc = src && !src.startsWith("http") ? withBase(src) : src;

  if (fullSrc) {
    return (
      <img
        className={`avatar ${className}`.trim()}
        src={fullSrc}
        alt={name || "avatar"}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }}
      />
    );
  }

  return (
    <span
      className={`avatar avatar--initials ${className}`.trim()}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: hashColor(name),
        color: "#fff",
        fontWeight: 700,
        fontSize: size * 0.38,
        flexShrink: 0,
        lineHeight: 1,
      }}
      title={name}
    >
      {getInitials(name)}
    </span>
  );
}

export function AvatarGroup({ users = [], max = 3, size = 28 }) {
  const visible = users.slice(0, max);
  const extra = users.length - max;

  return (
    <div className="avatar-group" style={{ display: "flex", alignItems: "center" }}>
      {visible.map((u, i) => (
        <div key={u.id || i} style={{ marginLeft: i > 0 ? -8 : 0, zIndex: max - i, position: "relative" }}>
          <Avatar name={u.nome} src={u.avatar_url} size={size} />
        </div>
      ))}
      {extra > 0 && (
        <span
          className="avatar avatar--extra"
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#e2e8f0",
            color: "#475569",
            fontWeight: 700,
            fontSize: size * 0.35,
            marginLeft: -8,
            zIndex: 0,
            border: "2px solid #fff",
            flexShrink: 0,
          }}
        >
          +{extra}
        </span>
      )}
    </div>
  );
}
