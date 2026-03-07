/**
 * ClawOps Scanner - Normalize Scan Input
 */

import type { ScanInput, NormalizedScanInput, ManualScanInput, DropdownScanInput, LoggedInScanInput } from './meoSchema';

function isManualInput(input: ScanInput): input is ManualScanInput {
  return 'businessName' in input && 'location' in input && !('place_id' in input) && !('selectedPlace' in input);
}

function isDropdownInput(input: ScanInput): input is DropdownScanInput {
  return 'selectedPlace' in input && typeof (input as any).selectedPlace?.place_id === 'string';
}

function isLoggedInInput(input: ScanInput): input is LoggedInScanInput {
  return 'businessName' in input && 'place_id' in input;
}

export function normalizeScanInput(input: ScanInput): NormalizedScanInput {
  if (isDropdownInput(input)) {
    const sp = input.selectedPlace;
    return {
      businessName: sp.structured_formatting?.main_text || sp.description || '',
      location: sp.structured_formatting?.secondary_text || sp.description || '',
      place_id: sp.place_id,
    };
  }

  if (isLoggedInInput(input)) {
    return {
      businessName: input.businessName,
      location: input.location || '',
      place_id: input.place_id,
    };
  }

  if (isManualInput(input)) {
    return {
      businessName: input.businessName,
      location: input.location,
    };
  }

  return { businessName: '', location: '' };
}
