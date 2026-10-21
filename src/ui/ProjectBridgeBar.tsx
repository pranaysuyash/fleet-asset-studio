import React, { useState } from 'react';
import type {
  VehicleSpec,
  CargoPackageSpec,
  SpatialFitResult,
  TemporalSimulation,
} from '../engine/types';
import {
  buildCargoFitBridgeUrl,
  buildFreightPricingBridgeUrl,
  buildHosPlannerBridgeUrl,
  exportOpenLogisticsAssetJson,
  exportSpecCsv,
} from '../engine/bridges';

interface ProjectBridgeBarProps {
  vehicle: VehicleSpec;
  selectedPackage: CargoPackageSpec;
  spatialFit: SpatialFitResult;
  simulation: TemporalSimulation;
  distanceMiles: number;
  speedMph: number;
  onOpenForgeModal: () => void;
}

export const ProjectBridgeBar: React.FC<ProjectBridgeBarProps> = ({
  vehicle,
  selectedPackage,
  spatialFit,
  simulation,
  distanceMiles,
  speedMph,
  onOpenForgeModal,
}) => {
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const handleSendToCargoFit = () => {
    const url = buildCargoFitBridgeUrl(vehicle, selectedPackage, spatialFit.placedUnits);
    window.open(url, '_blank');
  };

  const handleSendToFreightPricing = () => {
    const url = buildFreightPricingBridgeUrl(
      vehicle,
      spatialFit.totalWeightLbs,
      distanceMiles,
      Boolean(selectedPackage.hazmatClass)
    );
    window.open(url, '_blank');
  };

  const handleSendToHosPlanner = () => {
    const url = buildHosPlannerBridgeUrl(vehicle, distanceMiles, speedMph);
    window.open(url, '_blank');
  };

  const handleExportJson = () => {
    const jsonStr = exportOpenLogisticsAssetJson(vehicle, selectedPackage, spatialFit, simulation);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${vehicle.code}_${selectedPackage.id}_asset_spec.json`;
    a.click();
    URL.revokeObjectURL(url);

    setCopyFeedback('✓ JSON Downloaded');
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  const handleExportCsv = () => {
    const csvStr = exportSpecCsv(vehicle);
    const blob = new Blob([csvStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${vehicle.code}_specifications.csv`;
    a.click();
    URL.revokeObjectURL(url);

    setCopyFeedback('✓ CSV Downloaded');
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  return (
    <header className="bridge-bar-header">
      <div className="header-top-row">
        <div className="brand-group">
          <div className="brand-logo">🚛</div>
          <div>
            <div className="brand-title">
              TRUCKING <span className="product-tag">Product 04</span>
            </div>
            <div className="brand-subtitle">Fleet & Cargo Asset Studio · 3D / 2.5D / CAD Engine</div>
          </div>
        </div>

        {/* Portfolio Cross-Navigation */}
        <nav className="portfolio-nav">
          <a
            href="http://localhost:5173/"
            target="_blank"
            rel="noreferrer"
            className="nav-link"
            title="Product 01: Cargo Fit 3D Optimizer (Port 5173)"
          >
            P01: Cargo Fit
          </a>
          <a
            href="http://localhost:5174/"
            target="_blank"
            rel="noreferrer"
            className="nav-link"
            title="Product 02: Freight Pricing & Tactical HUD (Port 5174)"
          >
            P02: Freight Pricing
          </a>
          <a
            href="http://localhost:5175/"
            target="_blank"
            rel="noreferrer"
            className="nav-link"
            title="Product 03: HOS Corridor Planner (Port 5175)"
          >
            P03: HOS Planner
          </a>
          <span className="nav-link active">
            P04: Asset Studio
          </span>
        </nav>
      </div>

      {/* Action Feeds Strip */}
      <div className="header-action-row">
        <div className="action-buttons-group">
          <button
            className="bridge-btn btn-cargofit"
            onClick={handleSendToCargoFit}
            title="Feed equipment dimensions & cargo rows into Product 01 (Cargo Fit)"
          >
            ↗ Send to Cargo Fit (P01)
          </button>
          <button
            className="bridge-btn btn-pricing"
            onClick={handleSendToFreightPricing}
            title="Feed vehicle tare, fuel MPG & payload weight into Product 02 (Freight Pricing HUD)"
          >
            ↗ Dispatch to Freight Pricing (P02)
          </button>
          <button
            className="bridge-btn btn-hos"
            onClick={handleSendToHosPlanner}
            title="Feed vehicle range, driving speed & fuel stops into Product 03 (HOS Planner)"
          >
            ↗ Plan Corridor in HOS (P03)
          </button>
        </div>

        <div className="export-buttons-group">
          <button className="btn-secondary-chip" onClick={handleExportJson}>
            {copyFeedback === '✓ JSON Downloaded' ? copyFeedback : '📋 Export JSON'}
          </button>
          <button className="btn-secondary-chip" onClick={handleExportCsv}>
            {copyFeedback === '✓ CSV Downloaded' ? copyFeedback : '📊 Export CSV'}
          </button>
          <button className="btn-forge-highlight" onClick={onOpenForgeModal}>
            + Forge Asset
          </button>
        </div>
      </div>
    </header>
  );
};
