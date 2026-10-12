import { LocationSource } from './types';

export const SRC: Record<LocationSource, { label: string; color: string }> = {
  VERIFIED: { label: 'VERIFIED LOCATION', color: '#2ec4b6' },
  ESTIMATED: { label: 'ESTIMATED AREA', color: '#f0a73a' },
  SAMPLE: { label: 'SAMPLE LOCATION', color: '#8fb3c9' },
  UNAVAILABLE: { label: 'LOCATION UNAVAILABLE', color: '#e5534b' }
};

export const RADIUS_PRESETS = [100, 250, 500, 1000, 5000, 25000, 100000];

/**
 * Computes great-circle distance between two coordinates in meters (Haversine formula).
 */
export function hav(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const r = Math.PI / 180;
  const p = (lat2 - lat1) * r;
  const l = (lon2 - lon1) * r;
  const x =
    Math.sin(p / 2) ** 2 +
    Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(l / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

/**
 * Formats a metric distance into human-readable m or km.
 */
export function fmt(meters: number): string {
  if (meters >= 1000) {
    const km = meters / 1000;
    return (meters % 1000 ? km.toFixed(1) : km.toFixed(0)) + ' km';
  }
  return Math.round(meters) + ' m';
}

const METERS_PER_DEGREE = 111320;

/**
 * Constructs a 96-vertex circle polygon feature in GeoJSON.
 */
export function circle(lat: number, lng: number, radiusMeters: number): any {
  const coordinates: [number, number][] = [];
  const latCos = Math.max(0.01, Math.cos((lat * Math.PI) / 180));
  for (let i = 0; i <= 96; i++) {
    const angle = (i / 96) * 2 * Math.PI;
    const ptLng = lng + (radiusMeters * Math.sin(angle)) / (METERS_PER_DEGREE * latCos);
    const ptLat = lat + (radiusMeters * Math.cos(angle)) / METERS_PER_DEGREE;
    coordinates.push([ptLng, ptLat]);
  }
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [coordinates]
    }
  };
}

/**
 * Ray-casting algorithm to test if (x=lng, y=lat) is inside a linear ring.
 */
export function inRing(x: number, y: number, ring: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

/**
 * Determines whether point (lng, lat) is within a GeoJSON Polygon or MultiPolygon.
 */
export function inGeo(lng: number, lat: number, geo: any): boolean {
  if (!geo) return false;
  const polygons: [number, number][][][] =
    geo.type === 'Polygon'
      ? [geo.coordinates]
      : geo.type === 'MultiPolygon'
      ? geo.coordinates
      : [];

  return polygons.some(
    (rings) =>
      inRing(lng, lat, rings[0]) &&
      !rings.slice(1).some((hole) => inRing(lng, lat, hole))
  );
}

/**
 * Computes optimal MapLibre camera zoom for a given radius and stage width.
 */
export function zoomFor(radiusMeters: number, lat: number, stageWidth: number): number {
  const width = stageWidth > 0 ? stageWidth : 800;
  return Math.min(
    17,
    Math.max(
      1.5,
      Math.log2(
        (78271.52 * Math.cos((lat * Math.PI) / 180) * width) / (radiusMeters * 5)
      )
    )
  );
}

export const EMPTY_GEOJSON = {
  type: 'FeatureCollection',
  features: []
};
