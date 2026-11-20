import React from 'react';

interface PetalOverlayProps {
  burstKey: number;
  count?: number;
}

const PETAL_PRESETS = [
  { left: '8%', delay: '0s', duration: '6.8s', driftX: '42px', rot: '210deg', size: 18, color: '#B8293D' },
  { left: '16%', delay: '0.35s', duration: '7.4s', driftX: '-32px', rot: '-190deg', size: 15, color: '#D45666' },
  { left: '25%', delay: '0.15s', duration: '6.2s', driftX: '28px', rot: '260deg', size: 20, color: '#A31F32' },
  { left: '36%', delay: '0.6s', duration: '7.8s', driftX: '-45px', rot: '-230deg', size: 16, color: '#CE4457' },
  { left: '48%', delay: '0.2s', duration: '6.6s', driftX: '34px', rot: '180deg', size: 19, color: '#B4263A' },
  { left: '58%', delay: '0.5s', duration: '7.1s', driftX: '-28px', rot: '240deg', size: 15, color: '#DC6B79' },
  { left: '68%', delay: '0.1s', duration: '6.9s', driftX: '48px', rot: '-200deg', size: 18, color: '#9E1B2E' },
  { left: '78%', delay: '0.45s', duration: '7.6s', driftX: '-38px', rot: '220deg', size: 16, color: '#C73B4E' },
  { left: '88%', delay: '0.25s', duration: '6.5s', driftX: '-26px', rot: '-250deg', size: 19, color: '#B8293D' },
  { left: '94%', delay: '0.7s', duration: '7.3s', driftX: '-44px', rot: '195deg', size: 14, color: '#D95D6D' },
  { left: '12%', delay: '1.1s', duration: '7.0s', driftX: '36px', rot: '205deg', size: 16, color: '#C73B4E' },
  { left: '42%', delay: '1.3s', duration: '6.7s', driftX: '-30px', rot: '-180deg', size: 17, color: '#9E1B2E' },
  { left: '72%', delay: '1.0s', duration: '7.5s', driftX: '25px', rot: '255deg', size: 15, color: '#DC6B79' },
  { left: '84%', delay: '1.4s', duration: '6.4s', driftX: '-35px', rot: '-215deg', size: 18, color: '#B4263A' },
];

export const PetalOverlay: React.FC<PetalOverlayProps> = ({ burstKey, count = 14 }) => {
  if (burstKey === 0) return null;

  const petals = PETAL_PRESETS.slice(0, count);

  return (
    <div
      key={burstKey}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
    >
      {petals.map((p, idx) => (
        <div
          key={idx}
          className="animate-petal-drift absolute -top-8"
          style={
            {
              left: p.left,
              '--drift-delay': p.delay,
              '--drift-duration': p.duration,
              '--drift-x': p.driftX,
              '--drift-rot': p.rot,
            } as React.CSSProperties
          }
        >
          <svg
            width={p.size}
            height={p.size * 1.25}
            viewBox="0 0 24 30"
            fill="none"
            className="drop-shadow-sm"
          >
            <path
              d="M12 2C18.5 5 22 12 20 19.5C18.2 25.5 13.5 28.5 12 28.5C10.5 28.5 5.8 25.5 4 19.5C2 12 5.5 5 12 2Z"
              fill={p.color}
              fillOpacity="0.88"
            />
            <path
              d="M12 4C15.5 7.5 17 13.5 15.5 19.5C14.3 23.5 12.5 26 12 27C11.5 26 9.5 22.5 9 18.5C8.5 13 9.5 7.5 12 4Z"
              fill="#F8B4BE"
              fillOpacity="0.22"
            />
          </svg>
        </div>
      ))}
    </div>
  );
};
