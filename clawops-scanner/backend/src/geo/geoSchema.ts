/**
 * ClawOps Scanner - GEO Schema Definitions
 */

export interface GEOQueryResult {
  query: string;
  mentioned: boolean;
  rank: number | null;
  snippet: string | null;
  source: string;
  context: string | null;
}

export interface GEOBenchmarkEntry {
  placeId: string;
  businessName: string;
  geoScore: number;
  mentionRate: number;
  avgRank: number | null;
  queriesUsed: number;
  queriesFound: number;
  results: GEOQueryResult[];
}

export interface GEOBenchmarkResponse {
  target: GEOBenchmarkEntry;
  competitors: GEOBenchmarkEntry[];
  summary: {
    targetRank: number;
    totalCompared: number;
    topCompetitor: string | null;
    industryAvgScore: number;
  };
  generatedAt: string;
}

export interface NearbyCompetitor {
  place_id: string;
  name: string;
  rating: number;
  reviews: number;
  distance_m: number;
  types: string[];
}
