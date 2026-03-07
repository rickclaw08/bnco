/**
 * ClawOps Scanner - MEO Explain Schema
 */

export type DriverStatus = 'good' | 'warn' | 'bad' | 'disabled';

export interface ExplainCTA {
  label: string;
  action: 'upload_photos' | 'reply_reviews' | 'get_more_reviews' | 'complete_profile' | 'connect_gbp' | 'refresh';
}

export interface MEOExplainDriver {
  id: string;
  title: string;
  status: DriverStatus;
  observedValue: string;
  why: string;
  impactPoints: number | null;
  impactLabel: string;
  cta: ExplainCTA;
}

export interface MEOExplainAction {
  id: string;
  title: string;
  description: string;
  pointGain: number | null;
  timeEstimate: string;
  cta: ExplainCTA;
}

export interface MEOExplainData {
  placeId: string;
  businessName: string;
  address: string;
  rating: number | null;
  reviewCount: number | null;
  photoCount: number | null;
  photoCountMayBeLimited: boolean;
  ownerReplyRate: number | null;
  ownerReplyRateSource: 'places' | 'gbp' | 'unavailable';
  fieldsPresent: {
    website: boolean | null;
    phone: boolean | null;
    hours: boolean | null;
    description: boolean | null;
    categories: boolean | null;
    attributes: boolean | null;
  };
  reliabilityCap: {
    enabled: boolean;
    capValue: number | null;
    reason: string | null;
  };
  score: {
    current: number;
    raw: number | null;
    rawBeforeCap: number | null;
  };
  potential: {
    enabled: boolean;
    potentialScore: number | null;
    basis: string;
  };
  callout: string;
  drivers: MEOExplainDriver[];
  helped: string[];
  heldBack: string[];
  actions: MEOExplainAction[];
  lastRefreshedAt: string;
}
