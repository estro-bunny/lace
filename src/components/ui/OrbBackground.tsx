"use client";

export default function OrbBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      <div className="orb orb-primary" style={{ top: "-10%", left: "-5%" }} />
      <div className="orb orb-secondary" style={{ top: "40%", right: "-8%" }} />
      <div className="orb orb-tertiary" style={{ bottom: "-5%", left: "30%" }} />
    </div>
  );
}
