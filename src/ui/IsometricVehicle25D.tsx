import React from 'react';
import type {
  VehicleSpec,
  CargoPackageSpec,
  GridPlacement,
} from '../engine/types';

interface IsometricVehicle25DProps {
  vehicle: VehicleSpec;
  selectedPackage: CargoPackageSpec;
  placements: GridPlacement[];
  cutaway: boolean;
  onToggleCutaway: () => void;
}

export const IsometricVehicle25D: React.FC<IsometricVehicle25DProps> = ({
  vehicle,
  selectedPackage,
  placements,
  cutaway,
  onToggleCutaway,
}) => {
  const isFlatbed =
    vehicle.subtype.includes('flatbed') ||
    vehicle.subtype.includes('step_deck') ||
    vehicle.subtype.includes('lowboy');
  const isTanker = vehicle.subtype.includes('tanker');
  const isStraight = vehicle.category === 'straight_truck_class_6_7';
  const isVan = vehicle.category === 'light_commercial_van';
  const isElectric = vehicle.fuelEnergy.fuelType === 'electric';

  const extL = vehicle.exterior.lengthFt;
  const extH = vehicle.exterior.heightFt;

  return (
    <div className="iso-25d-wrapper">
      <div className="iso-controls-bar">
        <div className="iso-title">
          <span>Axonometric 30° True Isometric Technical Projection</span>
        </div>
        <button
          className={`iso-cutaway-toggle ${cutaway ? 'active' : ''}`}
          onClick={onToggleCutaway}
        >
          {cutaway ? '🔍 Show Solid Skin' : '👁 Cutaway Deck / Cargo Hold'}
        </button>
      </div>

      <div className="iso-svg-container">
        <svg
          viewBox="0 0 920 480"
          className="iso-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="groundGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>

            <linearGradient id="cabBlue" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={isElectric ? '#0891b2' : '#2563eb'} />
              <stop offset="100%" stopColor={isElectric ? '#06b6d4' : '#3b82f6'} />
            </linearGradient>

            <linearGradient id="trailerSide" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>

            <linearGradient id="tankerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f1f5f9" />
              <stop offset="50%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>

            <linearGradient id="deckWood" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>

            <pattern id="gridPattern" width="40" height="20" patternUnits="userSpaceOnUse">
              <path d="M 0 10 L 20 0 L 40 10 L 20 20 Z" fill="none" stroke="rgba(56, 189, 248, 0.08)" strokeWidth="1" />
            </pattern>
          </defs>

          {/* Holographic Isometric Ground Pad */}
          <ellipse cx="460" cy="360" rx="430" ry="90" fill="url(#groundGrad)" stroke="#1e293b" strokeWidth="2" />
          <ellipse cx="460" cy="360" rx="410" ry="80" fill="url(#gridPattern)" />

          {/* Ground Shadow */}
          <polygon
            points="140,375 510,285 790,320 420,410"
            fill="rgba(0, 0, 0, 0.55)"
            filter="blur(8px)"
          />

          {/* ===================== CHASSIS & WHEELS ===================== */}
          {/* Tandem Axle Wheels (Rear) */}
          <g fill="#0f172a" stroke="#475569" strokeWidth="3">
            <ellipse cx="230" cy="365" rx="16" ry="22" />
            <ellipse cx="230" cy="365" rx="7" ry="10" fill="#94a3b8" />
            <ellipse cx="280" cy="355" rx="16" ry="22" />
            <ellipse cx="280" cy="355" rx="7" ry="10" fill="#94a3b8" />
          </g>

          {/* Steer / Front Axle Wheels */}
          <g fill="#0f172a" stroke="#475569" strokeWidth="3">
            <ellipse cx="710" cy="325" rx="16" ry="22" />
            <ellipse cx="710" cy="325" rx="7" ry="10" fill="#94a3b8" />
            <ellipse cx="660" cy="335" rx="16" ry="22" />
            <ellipse cx="660" cy="335" rx="7" ry="10" fill="#94a3b8" />
          </g>

          {/* ===================== VEHICLE BODY ===================== */}
          {!isVan && !isStraight ? (
            /* CLASS 8 COMBINATION (Trailer + Tractor) */
            <g>
              {/* Tractor Cab */}
              {/* Cab Main Body */}
              <polygon
                points="600,290 730,260 760,270 760,220 630,240 600,250"
                fill="url(#cabBlue)"
                stroke="#1d4ed8"
                strokeWidth="1.5"
              />
              {/* Cab Hood */}
              <polygon
                points="700,265 770,250 780,265 710,280"
                fill="#1e40af"
                stroke="#1e3a8a"
                strokeWidth="1"
              />
              {/* Windshield */}
              <polygon
                points="680,240 735,230 730,255 675,265"
                fill="#0f172a"
                stroke="#38bdf8"
                strokeWidth="1"
                opacity="0.85"
              />
              {/* Aerodynamic Roof Fairing */}
              <polygon
                points="600,250 630,240 645,190 615,200"
                fill="#3b82f6"
                stroke="#1d4ed8"
                strokeWidth="1"
              />
              {/* Dual Chrome Stacks (if diesel) */}
              {!isElectric && (
                <g stroke="#cbd5e1" strokeWidth="3">
                  <line x1="605" y1="250" x2="605" y2="180" />
                  <line x1="615" y1="248" x2="615" y2="178" />
                </g>
              )}

              {/* TRAILER */}
              {isFlatbed ? (
                /* Flatbed Platform Deck */
                <g>
                  {/* Deck Top Surface */}
                  <polygon
                    points="170,330 590,240 600,255 180,345"
                    fill="url(#deckWood)"
                    stroke="#64748b"
                    strokeWidth="1.5"
                  />
                  {/* Deck Side Rail */}
                  <polygon
                    points="180,345 600,255 600,275 180,365"
                    fill="#1e293b"
                    stroke="#475569"
                    strokeWidth="1.5"
                  />
                  {/* Headache Rack */}
                  <polygon
                    points="585,240 595,238 595,190 585,192"
                    fill="#64748b"
                    stroke="#334155"
                    strokeWidth="1.5"
                  />
                </g>
              ) : isTanker ? (
                /* Cylindrical Tanker Body */
                <g>
                  <ellipse cx="380" cy="275" rx="200" ry="42" fill="url(#tankerGrad)" stroke="#475569" strokeWidth="2" />
                  <ellipse cx="180" cy="315" rx="35" ry="45" fill="#94a3b8" stroke="#334155" strokeWidth="2" />
                  {/* Catwalk on top */}
                  <line x1="200" y1="255" x2="560" y2="200" stroke="#f8fafc" strokeWidth="3" />
                </g>
              ) : (
                /* Dry Van or Reefer Box */
                <g>
                  {/* Trailer Front Wall */}
                  <polygon
                    points="560,250 590,243 590,140 560,147"
                    fill="#e2e8f0"
                    stroke="#94a3b8"
                    strokeWidth="1"
                  />
                  {/* Trailer Roof */}
                  <polygon
                    points="170,225 560,147 590,140 200,218"
                    fill="#f8fafc"
                    stroke="#cbd5e1"
                    strokeWidth="1"
                  />
                  {/* Trailer Side Wall (with cutaway opacity) */}
                  <polygon
                    points="170,225 560,147 560,275 170,353"
                    fill={cutaway ? 'rgba(241, 245, 249, 0.18)' : 'url(#trailerSide)'}
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                  />
                  {/* Trailer Rear Door Face */}
                  <polygon
                    points="170,225 170,353 140,345 140,217"
                    fill="#94a3b8"
                    stroke="#64748b"
                    strokeWidth="1.5"
                  />
                  {/* Reefer Unit on Nose */}
                  {vehicle.regulatory.tempControl && (
                    <polygon
                      points="585,190 600,186 600,150 585,154"
                      fill="#0284c7"
                      stroke="#0369a1"
                      strokeWidth="1"
                    />
                  )}
                </g>
              )}
            </g>
          ) : isStraight ? (
            /* CLASS 6/7 STRAIGHT TRUCK */
            <g>
              <polygon
                points="580,285 710,260 710,210 580,230"
                fill="url(#cabBlue)"
                stroke="#1d4ed8"
                strokeWidth="1.5"
              />
              <polygon
                points="240,240 570,180 570,290 240,350"
                fill={cutaway ? 'rgba(241, 245, 249, 0.2)' : 'url(#trailerSide)'}
                stroke="#94a3b8"
                strokeWidth="1.5"
              />
              <polygon
                points="240,240 570,180 590,175 260,235"
                fill="#f8fafc"
                stroke="#cbd5e1"
                strokeWidth="1"
              />
            </g>
          ) : (
            /* HIGH-ROOF CARGO VAN */
            <g>
              <polygon
                points="300,240 680,180 680,295 300,355"
                fill={cutaway ? 'rgba(241, 245, 249, 0.25)' : 'url(#cabBlue)'}
                stroke="#1d4ed8"
                strokeWidth="1.5"
              />
              <polygon
                points="300,240 680,180 700,175 320,235"
                fill="#38bdf8"
                stroke="#0284c7"
                strokeWidth="1"
              />
            </g>
          )}

          {/* ===================== ISOMETRIC CARGO PACKAGES ON DECK ===================== */}
          {(cutaway || isFlatbed) && placements.length > 0 && (
            <g>
              {placements.slice(0, 36).map((p, idx) => {
                // Map 3D grid placement into 2D isometric SVG projected coordinates
                const isoX = 360 + (p.col * 18 - p.row * 12);
                const isoY = 320 + (p.row * 6 + p.col * 4) - p.tier * 22;

                const color = selectedPackage.color || '#d97706';

                if (selectedPackage.shape === 'cylinder') {
                  return (
                    <g key={idx}>
                      <ellipse cx={isoX} cy={isoY} rx="8" ry="5" fill={color} stroke="#0f172a" strokeWidth="1" />
                      <path
                        d={`M ${isoX - 8} ${isoY} L ${isoX - 8} ${isoY + 12} A 8 5 0 0 0 ${isoX + 8} ${isoY + 12} L ${isoX + 8} ${isoY} Z`}
                        fill={color}
                        stroke="#0f172a"
                        strokeWidth="1"
                        opacity="0.9"
                      />
                    </g>
                  );
                }

                return (
                  <g key={idx}>
                    {/* Top Face */}
                    <polygon
                      points={`${isoX},${isoY - 8} ${isoX + 12},${isoY - 14} ${isoX + 24},${isoY - 8} ${isoX + 12},${isoY - 2}`}
                      fill="#f59e0b"
                      stroke="#78350f"
                      strokeWidth="0.8"
                    />
                    {/* Left Face */}
                    <polygon
                      points={`${isoX},${isoY - 8} ${isoX + 12},${isoY - 2} ${isoX + 12},${isoY + 12} ${isoX},${isoY + 6}`}
                      fill="#d97706"
                      stroke="#78350f"
                      strokeWidth="0.8"
                    />
                    {/* Right Face */}
                    <polygon
                      points={`${isoX + 12},${isoY - 2} ${isoX + 24},${isoY - 8} ${isoX + 24},${isoY + 6} ${isoX + 12},${isoY + 12}`}
                      fill="#b45309"
                      stroke="#78350f"
                      strokeWidth="0.8"
                    />
                  </g>
                );
              })}
            </g>
          )}

          {/* ===================== TECHNICAL DIMENSION CALLOUTS ===================== */}
          {/* Length Leader Line */}
          <g stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3">
            <line x1="170" y1="380" x2="170" y2="430" />
            <line x1="780" y1="280" x2="780" y2="350" />
            <line x1="170" y1="420" x2="780" y2="340" strokeDasharray="none" markerEnd="url(#arrow)" />
          </g>
          <text x="440" y="405" fill="#38bdf8" fontSize="13" fontWeight="600" fontFamily="JetBrains Mono">
            OVERALL LENGTH: {extL} FT
          </text>

          {/* Height Leader Line */}
          <g stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3">
            <line x1="120" y1="215" x2="90" y2="215" />
            <line x1="120" y1="355" x2="90" y2="355" />
            <line x1="100" y1="215" x2="100" y2="355" strokeDasharray="none" />
          </g>
          <text x="35" y="290" fill="#38bdf8" fontSize="12" fontWeight="600" fontFamily="JetBrains Mono">
            {extH} FT HT
          </text>

          {/* Axle Limits Callouts */}
          <g>
            {/* Steer Axle */}
            <circle cx="710" cy="355" r="4" fill="#10b981" />
            <line x1="710" y1="355" x2="750" y2="395" stroke="#10b981" strokeWidth="1.5" />
            <text x="755" y="400" fill="#10b981" fontSize="11" fontFamily="JetBrains Mono">
              Steer: {vehicle.regulatory.bridgeLawAxleLimits.steerLbs.toLocaleString()} lbs
            </text>

            {/* Trailer Tandem */}
            <circle cx="230" cy="390" r="4" fill="#a855f7" />
            <line x1="230" y1="390" x2="200" y2="425" stroke="#a855f7" strokeWidth="1.5" />
            <text x="140" y="440" fill="#a855f7" fontSize="11" fontFamily="JetBrains Mono">
              Tandem: {vehicle.regulatory.bridgeLawAxleLimits.trailerTandemLbs.toLocaleString()} lbs
            </text>
          </g>
        </svg>
      </div>

      <div className="iso-footer-metrics">
        <div className="metric-chip">
          <span className="chip-label">GVWR</span>
          <strong className="chip-value">{vehicle.weight.gvwrLbs.toLocaleString()} lbs</strong>
        </div>
        <div className="metric-chip">
          <span className="chip-label">Max Payload</span>
          <strong className="chip-value text-emerald">{vehicle.weight.maxPayloadLbs.toLocaleString()} lbs</strong>
        </div>
        <div className="metric-chip">
          <span className="chip-label">Interior Cavity</span>
          <strong className="chip-value">{vehicle.interior.lengthFt}'L x {vehicle.interior.widthFt}'W x {vehicle.interior.heightFt}'H</strong>
        </div>
        <div className="metric-chip">
          <span className="chip-label">GMA Pallet Cap</span>
          <strong className="chip-value text-cyan">{vehicle.volumetric.standardGmaPalletFloorCap} floor / {vehicle.volumetric.doubleStackPalletCap} dbl</strong>
        </div>
        <div className="metric-chip">
          <span className="chip-label">Powertrain</span>
          <strong className="chip-value">{vehicle.powertrain.horsepower} HP ({vehicle.powertrain.axles})</strong>
        </div>
      </div>
    </div>
  );
};
