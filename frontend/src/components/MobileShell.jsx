export default function MobileShell({ children, className = '' }) {
  return <main className={`mobile-shell ${className}`}>{children}</main>;
}
