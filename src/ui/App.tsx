import { useState, useMemo, useEffect } from 'react';
import {
  getVehicleCatalog,
  getPackageCatalog,
  saveCustomVehicle,
  saveCustomPackage,
} from '../engine/catalog';
import { computeSpatialFit } from '../engine/spatial';
import { simulateTemporalDynamics } from '../engine/temporal';
import type {
  VehicleSpec,
  CargoPackageSpec,
  ViewMode,
  RenderStyle3D,
} from '../engine/types';
import { Realtime3DCanvas } from './Realtime3DCanvas';
import { IsometricVehicle25D } from './IsometricVehicle25D';
import { Blueprint2DView } from './Blueprint2DView';
import { SpatialCapacityPanel } from './SpatialCapacityPanel';
import { TemporalSimulatorPanel } from './TemporalSimulatorPanel';
import { MultiStopUnloadPanel } from './MultiStopUnloadPanel';
import { FleetSplitterPanel } from './FleetSplitterPanel';
import { CarbonInsettingPanel } from './CarbonInsettingPanel';
import { AssetForgeModal } from './AssetForgeModal';
import { ProjectBridgeBar } from './ProjectBridgeBar';
import { SuiteDock } from './SuiteDock';

export function App() {
  const [vehicleCatalog, setVehicleCatalog] = useState<VehicleSpec[]>(() => getVehicleCatalog());
  const [packageCatalog, setPackageCatalog] = useState<CargoPackageSpec[]>(() => getPackageCatalog());

  // Active Vehicle & Package
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('dry-van-53');
  const [selectedPackageId, setSelectedPackageId] = useState<string>('pallet-gma-48x40');
  const [quantityOverride, setQuantityOverride] = useState<number | null>(null);

  // View Controls
  const [viewMode, setViewMode] = useState<ViewMode>('3d');
  const [renderStyle3D, setRenderStyle3D] = useState<RenderStyle3D>('cutaway');
  const [doorsOpen, setDoorsOpen] = useState<boolean>(true);
  const [isoCutaway, setIsoCutaway] = useState<boolean>(true);

  // Temporal Simulation Parameters
  const [distanceMiles, setDistanceMiles] = useState<number>(600);
  const [speedMph, setSpeedMph] = useState<number>(65);

  // Modal State
  const [isForgeModalOpen, setIsForgeModalOpen] = useState(false);
  const [forgeInitialTab, setForgeInitialTab] = useState<'vehicle' | 'package'>('vehicle');

  const selectedVehicle = useMemo(() => {
    return vehicleCatalog.find((v) => v.id === selectedVehicleId) || vehicleCatalog[0];
  }, [vehicleCatalog, selectedVehicleId]);

  const selectedPackage = useMemo(() => {
    return packageCatalog.find((p) => p.id === selectedPackageId) || packageCatalog[0];
  }, [packageCatalog, selectedPackageId]);

  // Spatial Fit Calculation
  const spatialFit = useMemo(() => {
    return computeSpatialFit(selectedVehicle, selectedPackage, quantityOverride ?? undefined);
  }, [selectedVehicle, selectedPackage, quantityOverride]);

  // Temporal Simulation Calculation
  const temporalSimulation = useMemo(() => {
    return simulateTemporalDynamics(
      selectedVehicle,
      spatialFit.totalWeightLbs,
      distanceMiles,
      speedMph,
      spatialFit.placedUnits,
      selectedPackage.category
    );
  }, [selectedVehicle, spatialFit.totalWeightLbs, distanceMiles, speedMph, spatialFit.placedUnits, selectedPackage]);

  // Handle URL Parameter Sync (if launched from other projects)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const vParam = params.get('vehicle');
    if (vParam) {
      const match = vehicleCatalog.find((v) => v.id === vParam || v.code.toLowerCase() === vParam.toLowerCase());
      if (match) setSelectedVehicleId(match.id);
    }
  }, [vehicleCatalog]);

  const handleSaveCustomVehicle = (newVehicle: VehicleSpec) => {
    saveCustomVehicle(newVehicle);
    setVehicleCatalog(getVehicleCatalog());
    setSelectedVehicleId(newVehicle.id);
  };

  const handleSaveCustomPackage = (newPkg: CargoPackageSpec) => {
    saveCustomPackage(newPkg);
    setPackageCatalog(getPackageCatalog());
    setSelectedPackageId(newPkg.id);
    setQuantityOverride(null);
  };

  return (
    <div className="studio-app-container">
      <SuiteDock currentProductId="product-04-asset-studio" />
      {/* Top Project Bridge Header */}
      <ProjectBridgeBar
        vehicle={selectedVehicle}
        selectedPackage={selectedPackage}
        spatialFit={spatialFit}
        simulation={temporalSimulation}
        distanceMiles={distanceMiles}
        speedMph={speedMph}
        onOpenForgeModal={() => {
          setForgeInitialTab('vehicle');
          setIsForgeModalOpen(true);
        }}
      />

      {/* Main Studio Body */}
      <div className="studio-main-layout">
        {/* LEFT COLUMN: VEHICLE CATALOG & SPEC SHEET */}
        <aside className="vehicle-selector-sidebar">
          <div className="sidebar-header">
            <h4>Commercial Vehicle Fleet</h4>
            <span className="count-badge">{vehicleCatalog.length} Units</span>
          </div>

          <div className="vehicle-category-list">
            <label htmlFor="vehicle-main-select" className="sidebar-group-label">Select Cargo Vehicle:</label>
            <select
              id="vehicle-main-select"
              aria-label="Select Commercial Cargo Vehicle"
              className="vehicle-main-select"
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
            >
              <optgroup label="Class 8 Combinations (Semi-Trucks)">
                {vehicleCatalog
                  .filter((v) => v.category === 'class_8_combination')
                  .map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Class 6/7 Commercial Straight Trucks">
                {vehicleCatalog
                  .filter((v) => v.category === 'straight_truck_class_6_7')
                  .map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Light Commercial Vans & Hotshots">
                {vehicleCatalog
                  .filter((v) => v.category === 'light_commercial_van')
                  .map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Specialized Bulk Carriers">
                {vehicleCatalog
                  .filter((v) => v.category === 'specialized_bulk')
                  .map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Zero-Emission & Alternative Powertrains">
                {vehicleCatalog
                  .filter((v) => v.category === 'alternative_powertrain')
                  .map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>

          {/* Active Vehicle Hero Card */}
          <div className="active-vehicle-card">
            <div className="card-top-row">
              <span className="code-badge">{selectedVehicle.code}</span>
              <span className="dot-badge">{selectedVehicle.regulatory.dotClass}</span>
            </div>
            <h3 className="vehicle-name">{selectedVehicle.name}</h3>
            <p className="vehicle-desc">{selectedVehicle.description}</p>

            {/* Quick Specs List */}
            <div className="specs-list">
              <div className="spec-row">
                <span className="spec-k">Max Legal Payload:</span>
                <strong className="spec-v text-emerald">{selectedVehicle.weight.maxPayloadLbs.toLocaleString()} lbs</strong>
              </div>
              <div className="spec-row">
                <span className="spec-k">Interior Cavity:</span>
                <strong className="spec-v">{selectedVehicle.interior.lengthFt}'L x {selectedVehicle.interior.widthFt}'W x {selectedVehicle.interior.heightFt}'H</strong>
              </div>
              <div className="spec-row">
                <span className="spec-k">Door Aperture:</span>
                <strong className="spec-v text-rose">{selectedVehicle.interior.doorWidthFt.toFixed(1)}'W x {selectedVehicle.interior.doorHeightFt.toFixed(1)}'H</strong>
              </div>
              <div className="spec-row">
                <span className="spec-k">Cargo Volume:</span>
                <strong className="spec-v">{selectedVehicle.volumetric.cubicFt.toLocaleString()} cu ft ({selectedVehicle.volumetric.cubicMeters} m³)</strong>
              </div>
              <div className="spec-row">
                <span className="spec-k">Powertrain:</span>
                <strong className="spec-v">{selectedVehicle.powertrain.horsepower} HP ({selectedVehicle.powertrain.axles})</strong>
              </div>
              <div className="spec-row">
                <span className="spec-k">Loaded Fuel Range:</span>
                <strong className="spec-v text-cyan">{selectedVehicle.fuelEnergy.loadedRangeMiles} mi ({selectedVehicle.fuelEnergy.loadedMpg} {selectedVehicle.fuelEnergy.fuelType === 'electric' ? 'mi/kWh' : selectedVehicle.fuelEnergy.fuelType === 'hydrogen' ? 'mi/kg' : 'MPG'})</strong>
              </div>
              <div className="spec-row">
                <span className="spec-k">Steer / Tandem Axle:</span>
                <strong className="spec-v">{selectedVehicle.regulatory.bridgeLawAxleLimits.steerLbs / 1000}k / {selectedVehicle.regulatory.bridgeLawAxleLimits.trailerTandemLbs / 1000}k lbs</strong>
              </div>
            </div>

            <button
              className="btn-add-vehicle-sidebar"
              onClick={() => {
                setForgeInitialTab('vehicle');
                setIsForgeModalOpen(true);
              }}
            >
              + Author Custom Vehicle
            </button>
          </div>
        </aside>

        {/* RIGHT / MAIN CONTENT: CANVAS VIEWS & ANALYTIC CONTROLS */}
        <main className="studio-canvas-stage">
          {/* View Mode Switcher Header */}
          <div className="view-mode-tabs-bar">
            <div className="tabs-left">
              <button
                className={`tab-btn ${viewMode === '3d' ? 'active' : ''}`}
                onClick={() => setViewMode('3d')}
              >
                🎮 Real-time 3D Canvas (Three.js WebGL)
              </button>
              <button
                className={`tab-btn ${viewMode === '2.5d' ? 'active' : ''}`}
                onClick={() => setViewMode('2.5d')}
              >
                📐 2.5D Isometric Technical (Axonometric)
              </button>
              <button
                className={`tab-btn ${viewMode === '2d' ? 'active' : ''}`}
                onClick={() => setViewMode('2d')}
              >
                📏 2D Orthographic CAD Blueprint (3-View)
              </button>
            </div>

            <div className="tabs-right">
              <span className="status-indicator">
                <span className="indicator-dot pulse-green" />
                Live Spatial Sync Active
              </span>
            </div>
          </div>

          {/* Active View Renderer */}
          <div className="canvas-viewport-box">
            {viewMode === '3d' && (
              <Realtime3DCanvas
                vehicle={selectedVehicle}
                selectedPackage={selectedPackage}
                placements={spatialFit.gridPlacements}
                renderStyle={renderStyle3D}
                doorsOpen={doorsOpen}
                onToggleDoors={() => setDoorsOpen(!doorsOpen)}
                onSetRenderStyle={setRenderStyle3D}
              />
            )}

            {viewMode === '2.5d' && (
              <IsometricVehicle25D
                vehicle={selectedVehicle}
                selectedPackage={selectedPackage}
                placements={spatialFit.gridPlacements}
                cutaway={isoCutaway}
                onToggleCutaway={() => setIsoCutaway(!isoCutaway)}
              />
            )}

            {viewMode === '2d' && (
              <Blueprint2DView vehicle={selectedVehicle} />
            )}
          </div>

          {/* CONTROLS & ENGINES SECTION: SPATIAL & TEMPORAL */}
          <div className="controls-engines-grid">
            {/* SPATIAL CAPACITY & FIT PANEL */}
            <SpatialCapacityPanel
              vehicle={selectedVehicle}
              packageCatalog={packageCatalog}
              selectedPackage={selectedPackage}
              quantityOverride={quantityOverride}
              spatialFit={spatialFit}
              onSelectPackage={(pkg) => {
                setSelectedPackageId(pkg.id);
                setQuantityOverride(null);
              }}
              onSetQuantity={setQuantityOverride}
              onOpenForgeModal={(tab) => {
                setForgeInitialTab(tab);
                setIsForgeModalOpen(true);
              }}
            />

            {/* TEMPORAL SIMULATION PANEL */}
            <TemporalSimulatorPanel
              vehicle={selectedVehicle}
              simulation={temporalSimulation}
              distanceMiles={distanceMiles}
              speedMph={speedMph}
              onSetDistance={setDistanceMiles}
              onSetSpeed={setSpeedMph}
            />
          </div>

          {/* MULTI-STOP DROP SEQUENCE & DYNAMIC CG AXLE SIMULATOR */}
          <MultiStopUnloadPanel vehicle={selectedVehicle} />

          {/* MULTI-VEHICLE FLEET SPLITTER & DEMAND PARTITIONING */}
          <FleetSplitterPanel />

          {/* GLEC FRAMEWORK V3.0 / EPA SMARTWAY CARBON INSETTING */}
          <CarbonInsettingPanel defaultMiles={distanceMiles} vehicleName={selectedVehicle.name} />
        </main>
      </div>

      {/* Asset Forge Modal */}
      {isForgeModalOpen && (
        <AssetForgeModal
          initialTab={forgeInitialTab}
          onClose={() => setIsForgeModalOpen(false)}
          onSaveVehicle={handleSaveCustomVehicle}
          onSavePackage={handleSaveCustomPackage}
        />
      )}
    </div>
  );
}
