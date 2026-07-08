// BookQubit logo — open-book mark + wordmark. Vector, so it stays crisp
// at any size and inherits theme brand colors.
export function LogoMark({ size = 36, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path fill="var(--color-brand-700)" d="M32 16.5c-5.8-4.6-13.2-6.5-20-6.5-1.1 0-2 .9-2 2v33c0 1.1.9 2 2 2 6.8 0 14.2 1.9 18.6 6 .8.7 2 .7 2.8 0 4.4-4.1 11.8-6 18.6-6 1.1 0 2-.9 2-2V12c0-1.1-.9-2-2-2-6.8 0-14.2 1.9-20 6.5z"/>
      <path fill="var(--surface)" d="M29.5 21.8c-4.2-3.1-9.6-4.5-14.5-4.7v27.4c4.9.3 10.1 1.6 14.5 4.3V21.8zM34.5 21.8v27c4.4-2.7 9.6-4 14.5-4.3V17.1c-4.9.2-10.3 1.6-14.5 4.7z"/>
    </svg>
  );
}

export default function Logo({ size = 34, text = true, className = "" }) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <LogoMark size={size} />
      {text && (
        <span className="text-xl font-extrabold tracking-tight">
          Book<span className="text-brand-600">Qubit</span>
        </span>
      )}
    </span>
  );
}
