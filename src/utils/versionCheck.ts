import { AppUpdateSettings, CURRENT_APP_VERSION } from '../types';

/**
 * Compares two semver-like strings (e.g. "1.0.4", "1.1.0", "2.0")
 * Returns:
 *  - positive number if v1 > v2
 *  - negative number if v1 < v2
 *  - 0 if v1 === v2
 */
export function compareVersions(v1: string = '0.0.0', v2: string = '0.0.0'): number {
  const cleanV1 = v1.replace(/^v/i, '').trim();
  const cleanV2 = v2.replace(/^v/i, '').trim();

  const parts1 = cleanV1.split('.').map(p => parseInt(p, 10) || 0);
  const parts2 = cleanV2.split('.').map(p => parseInt(p, 10) || 0);

  const maxLen = Math.max(parts1.length, parts2.length);

  for (let i = 0; i < maxLen; i++) {
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }

  return 0;
}

/**
 * Returns true if v1 is strictly lower than v2
 */
export function isVersionLower(currentVersion: string, targetVersion: string): boolean {
  return compareVersions(currentVersion, targetVersion) < 0;
}

/**
 * Checks if an update is mandatory/required for the current app build
 */
export function isUpdateRequired(
  currentVersion: string = CURRENT_APP_VERSION,
  updateSettings?: AppUpdateSettings
): boolean {
  if (!updateSettings || updateSettings.enabled !== true) {
    return false;
  }

  const targetVersion = updateSettings.minRequiredVersion || updateSettings.latestVersion || '1.0.0';
  
  // Only trigger update if current version is strictly lower than target version AND update is enabled
  const lowerThanTarget = isVersionLower(currentVersion, targetVersion);
  const lowerThanLatest = isVersionLower(currentVersion, updateSettings.latestVersion || targetVersion);

  if (updateSettings.forceUpdate) {
    return lowerThanTarget || lowerThanLatest;
  }

  return lowerThanTarget;
}
