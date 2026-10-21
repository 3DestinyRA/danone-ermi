import { EPP_ITEMS } from "../../config/hotspots";
import EppIcon from "./EppIcon";

const EPP_LOOKUP = Object.values(EPP_ITEMS).reduce((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {});

export default function EPPBadges({ ids = [] }) {
  if (!ids.length) {
    return (
      <div className="text-[13px] text-[color:var(--color-text-dim)] italic">
        Sin EPP específico para este punto.
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-2">
      {ids.map((id) => {
        const item = EPP_LOOKUP[id];
        if (!item) return null;
        return (
          <li
            key={id}
            className="flex items-center gap-2.5 rounded-xl bg-[color:var(--color-surface)] hover:bg-[color:var(--color-surface-hi)] border border-[color:var(--color-border)] px-2.5 py-2.5 transition-colors"
            title={item.label}
          >
            <span className="shrink-0 w-9 h-9 rounded-lg bg-white border border-[color:var(--color-border)] flex items-center justify-center text-[color:var(--color-brand)]">
              <EppIcon id={id} className="w-5 h-5" />
            </span>
            <span className="text-[12.5px] font-semibold text-[color:var(--color-text)] leading-tight">
              {item.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
