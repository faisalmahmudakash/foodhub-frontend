export default function TagBarPage({
  tags,
  active,
  onChange,
}: {
  tags: string[];
  active: string;
  onChange: (t: string) => void;
}) {
  return (
    <div
      className="max-w-4xl mx-auto"
      style={{
        // background: "#fff",
        // borderBottom: "1px solid #ece5d8",
        // padding: "0 24px",
        position: "sticky",
        top: "60px",
        zIndex: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "6px",
          // overflowX: "auto",
          padding: "12px 0",
          scrollbarWidth: "none",
        }}
      >
        {["All", ...tags].map((t) => (
          <button
            key={t}
            onClick={() => onChange(t)}
            style={{
              flexShrink: 0,
              padding: "7px 18px",
              borderRadius: "50px",
              border: `1.5px solid ${active === t ? "#e85d04" : "#e0d5c4"}`,
              background: active === t ? "#e85d04" : "transparent",
              color: active === t ? "#fff" : "#5a4a35",
              fontWeight: active === t ? 700 : 500,
              fontSize: "0.875rem",
              cursor: "pointer",
              transition: "all .18s",
              whiteSpace: "nowrap",
            }}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
