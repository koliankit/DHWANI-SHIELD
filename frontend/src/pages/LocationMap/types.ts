import { EventRecord, LocationSource, GeocodePlace } from '../../types';

export type { EventRecord, LocationSource, GeocodePlace };

export interface SearchArea {
  name: string;
  type: string;
  geo: any;
}

export type FocusState =
  | { type: 'rec'; e: EventRecord; lat: number | null; lng?: number | null }
  | { type: 'place'; lat: number; lng: number }
  | null;

export interface NearbyRecord {
  e: EventRecord;
  d: number;
}
