// BookQubit "Q" mark (UI v2): magnifier ring + open book + qubit dot. Pure SVG, scales to any size.
// Gradient ids are unique per instance so several logos on one page never collide.
import { useId } from "react";

export function LogoMark({ size = 34, className = "" }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 220 220" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id={`${id}r`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FBE08A" /><stop offset=".55" stopColor="#E0AE34" /><stop offset="1" stopColor="#A9770A" /></linearGradient>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F9D976" /><stop offset="1" stopColor="#C8961E" /></linearGradient>
        <linearGradient id={`${id}a`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F6A04A" /><stop offset="1" stopColor="#C9521B" /></linearGradient>
      </defs>
      <path d="M155.9,175.5 A80,80 0 1 1 175.5,155.9" fill="none" stroke={`url(#${id}r)`} strokeWidth="20" strokeLinecap="round" />
      <line x1="163" y1="163" x2="208" y2="208" stroke={`url(#${id}a)`} strokeWidth="22" strokeLinecap="round" />
      <path d="M106,93 C93,84 75,82 58,87 L58,140 C75,135 93,137 106,147 Z" fill={`url(#${id}g)`} />
      <path d="M114,93 C127,84 145,82 162,87 L162,140 C145,135 127,137 114,147 Z" fill={`url(#${id}a)`} />
      <circle cx="110" cy="64" r="8.5" fill="#8B6CFF" />
    </svg>
  );
}

export function Wordmark({ className = "" }) {
  return (
    <span className={`font-display text-[1.35rem] font-bold tracking-tight ${className}`}>
      Book<span className="text-brand-700">Qubit</span>
    </span>
  );
}

export default function Logo({ size = 34, text = true, className = "" }) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <LogoMark size={size} />
      {text && <Wordmark />}
    </span>
  );
}
