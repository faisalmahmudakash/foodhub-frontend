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
    <div className="sticky top-0 z-10 rounded-b-2xl border-b border-[#ece5d8] bg-[#f5f1eb] px-3">
      <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
        {["All", ...tags].map((t) => (
          <button
            key={t}
            onClick={() => onChange(t)}
            className={`
              shrink-0 whitespace-nowrap rounded-full border px-4 py-2
              text-sm transition-all duration-200
              sm:px-5
              ${
                active === t
                  ? "border-[#e85d04] bg-[#e85d04] font-bold text-white"
                  : "border-[#e0d5c4] bg-transparent font-medium text-[#5a4a35] hover:border-[#e85d04] hover:text-[#e85d04]"
              }
            `}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
