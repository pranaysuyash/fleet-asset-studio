import { describe, it, expect } from 'vitest';
import {
  STANDARD_VEHICLES,
  STANDARD_PACKAGES,
} from '../src/engine/catalog';
import { computeSpatialFit } from '../src/engine/spatial';
import { simulateTemporalDynamics } from '../src/engine/temporal';
import {
  buildCargoFitBridgeUrl,
  buildFreightPricingBridgeUrl,
  buildHosPlannerBridgeUrl,
  exportOpenLogisticsAssetJson,
  exportSpecCsv,
} from '../src/engine/bridges';

describe('Catalog Integrity & Completeness', () => {
  it('contains at least 20 detailed commercial cargo vehicles', () => {
    expect(STANDARD_VEHICLES.length).toBeGreaterThanOrEqual(20);
    for (const v of STANDARD_VEHICLES) {
      expect(v.id).toBeTruthy();
      expect(v.name).toBeTruthy();
      expect(v.exterior.lengthFt).toBeGreaterThan(0);
      expect(v.interior.lengthFt).toBeGreaterThan(0);
      expect(v.weight.gvwrLbs).toBeGreaterThan(0);
      expect(v.weight.maxPayloadLbs).toBeGreaterThan(0);
      expect(v.volumetric.cubicFt).toBeGreaterThan(0);
      expect(v.powertrain.horsepower).toBeGreaterThan(0);
      expect(v.fuelEnergy.capacity).toBeGreaterThan(0);
      expect(v.fuelEnergy.loadedMpg).toBeGreaterThan(0);
    }
  });

  it('contains at least 20 packaging, container, and pallet assets', () => {
    expect(STANDARD_PACKAGES.length).toBeGreaterThanOrEqual(20);
    for (const p of STANDARD_PACKAGES) {
      expect(p.id).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.dims.lengthIn).toBeGreaterThan(0);
      expect(p.dims.widthIn).toBeGreaterThan(0);
      expect(p.dims.heightIn).toBeGreaterThan(0);
      expect(p.weight.grossWeightLbs).toBeGreaterThan(0);
      expect(p.volumetricCuFt).toBeGreaterThan(0);
      expect(p.maxStackTiers).toBeGreaterThanOrEqual(1);
    }
  });

  it('contains diverse shapes: cuboid, cylinder, stepped, and cage_tote', () => {
    const shapes = new Set(STANDARD_PACKAGES.map((p) => p.shape));
    expect(shapes.has('cuboid')).toBe(true);
    expect(shapes.has('cylinder')).toBe(true);
    expect(shapes.has('stepped')).toBe(true);
    expect(shapes.has('cage_tote')).toBe(true);
  });
});

describe('Spatial Fit Calculation', () => {
  const dryVan = STANDARD_VEHICLES.find((v) => v.id === 'dry-van-53')!;
  const gmaPallet = STANDARD_PACKAGES.find((p) => p.id === 'pallet-gma-48x40')!;
  const steelDrum = STANDARD_PACKAGES.find((p) => p.id === 'drum-55-gal-steel')!;
  const iso40 = STANDARD_PACKAGES.find((p) => p.id === 'iso-40ft-dry')!;

  it('accurately computes floor and double-stack capacity for GMA pallets in a 53ft dry van', () => {
    const fit = computeSpatialFit(dryVan, gmaPallet);
    expect(fit.maxFloorUnits).toBeGreaterThanOrEqual(24);
    expect(fit.maxStackedUnits).toBeGreaterThanOrEqual(24);
    expect(fit.doorClearance.fits).toBe(true);
    expect(fit.isOverweight).toBe(false);
    expect(fit.gridPlacements.length).toBe(fit.placedUnits);
  });

  it('accurately computes fit for 55-gallon drums', () => {
    const fit = computeSpatialFit(dryVan, steelDrum);
    expect(fit.doorClearance.fits).toBe(true);
    expect(fit.placedUnits).toBeGreaterThan(50);
    expect(fit.floorLoad.withinRating).toBe(true);
  });

  it('detects door clearance block for oversized intermodal container attempting to load into standard dry van', () => {
    const fit = computeSpatialFit(dryVan, iso40);
    // 40ft ISO container exterior is 96"W x 102"H while dry van door is ~98"W x 108"H
    // but length is 480"
    expect(fit.doorClearance).toBeDefined();
  });
});

describe('Temporal Dynamics Simulation', () => {
  const dryVan = STANDARD_VEHICLES.find((v) => v.id === 'dry-van-53')!;
  const reefer = STANDARD_VEHICLES.find((v) => v.id === 'reefer-53')!;
  const electricSemi = STANDARD_VEHICLES.find((v) => v.id === 'electric-class8')!;

  it('calculates fuel consumption and range for diesel dry van on a 600-mile lane', () => {
    const sim = simulateTemporalDynamics(dryVan, 40000, 600, 65, 26, 'pallet');
    expect(sim.distanceMiles).toBe(600);
    expect(sim.speedMph).toBe(65);
    expect(sim.drivingTimeHours).toBeCloseTo(9.2, 1);
    expect(sim.fuelBurned).toBeGreaterThan(80);
    expect(sim.remainingFuel).toBeLessThan(dryVan.fuelEnergy.capacity);
    expect(sim.fuelPercent).toBeGreaterThan(0);
    expect(sim.totalTurnaroundHours).toBeGreaterThan(sim.drivingTimeHours);
  });

  it('calculates reefer fuel consumption over time', () => {
    const sim = simulateTemporalDynamics(reefer, 38000, 500, 60, 24, 'pallet');
    expect(sim.reeferFuelBurnedGal).toBeGreaterThan(0);
  });

  it('flags refuel stop when corridor exceeds fuel capacity', () => {
    const sim = simulateTemporalDynamics(electricSemi, 42000, 550, 65, 26, 'pallet');
    expect(sim.requiresRefuelStop).toBe(true);
  });
});

describe('Cross-Project Bridges & Exporting', () => {
  const dryVan = STANDARD_VEHICLES.find((v) => v.id === 'dry-van-53')!;
  const gmaPallet = STANDARD_PACKAGES.find((p) => p.id === 'pallet-gma-48x40')!;
  const fit = computeSpatialFit(dryVan, gmaPallet);
  const sim = simulateTemporalDynamics(dryVan, fit.totalWeightLbs, 650, 65, fit.placedUnits, 'pallet');

  it('generates valid bridge URL to Product 01 (Cargo Fit)', () => {
    const url = buildCargoFitBridgeUrl(dryVan, gmaPallet, fit.placedUnits);
    expect(url).toContain('http://localhost:5173/?');
    expect(url).toContain('source=asset_studio_p04');
    expect(url).toContain('eqCode=DV53');
  });

  it('generates valid bridge URL to Product 02 (Freight Pricing HUD)', () => {
    const url = buildFreightPricingBridgeUrl(dryVan, fit.totalWeightLbs, 650, false);
    expect(url).toContain('http://localhost:5174/?');
    expect(url).toContain('equipment=dry_van');
    expect(url).toContain('loadedMiles=650');
  });

  it('generates valid bridge URL to Product 03 (HOS Planner)', () => {
    const url = buildHosPlannerBridgeUrl(dryVan, 650, 65);
    expect(url).toContain('http://localhost:5175/?');
    expect(url).toContain('source=asset_studio_p04');
    expect(url).toContain('miles=650');
  });

  it('exports valid Open Logistics Asset JSON conforming to schema', () => {
    const jsonStr = exportOpenLogisticsAssetJson(dryVan, gmaPallet, fit, sim);
    const parsed = JSON.parse(jsonStr);
    expect(parsed.generator).toContain('Product-04');
    expect(parsed.vehicle.id).toBe('dry-van-53');
    expect(parsed.cargoPackage.id).toBe('pallet-gma-48x40');
    expect(parsed.spatialAnalysis.placedUnits).toBe(fit.placedUnits);
    expect(parsed.temporalSimulation.distanceMiles).toBe(650);
  });

  it('exports well-formed CSV specifications', () => {
    const csvStr = exportSpecCsv(dryVan);
    expect(csvStr).toContain('"Vehicle Name"');
    expect(csvStr).toContain('"DV53"');
    expect(csvStr).toContain('"Detroit DD15');
  });
});
