/**
 * Firmware version management service
 * Handles checking for firmware updates via GitHub API with caching
 */

import { compareVersions } from "@/utils/helpers";

export interface FirmwareRelease {
	version: string; // e.g., "1.7.3"
	tag: string; // e.g., "v1.7.3"
	downloadUrl: string; // S3 URL
	publishedAt: string;
}

// GitHub API endpoint for latest release
const GITHUB_API_URL =
	"https://api.github.com/repos/usetrmnl/trmnl-firmware/releases/latest";

// S3 CDN URL pattern for firmware binaries
const FIRMWARE_CDN_URL = "https://trmnl-fw.s3.us-east-2.amazonaws.com";

// Cache configuration
let cachedRelease: FirmwareRelease | null = null;
let cacheTime = 0;
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

/**
 * Get the firmware download URL for a given version
 * @param version - Version string without "v" prefix (e.g., "1.7.3")
 */
export function getFirmwareUrl(version: string): string {
	return `${FIRMWARE_CDN_URL}/FW${version}.bin`;
}

/**
 * Check if a firmware update is available
 * @param currentVersion - Current device firmware version
 * @param latestVersion - Latest available firmware version
 * @returns true if update is available
 */
export function isUpdateAvailable(
	currentVersion: string | null,
	latestVersion: string,
): boolean {
	if (!currentVersion) return false;
	return compareVersions(currentVersion, latestVersion) < 0;
}

/**
 * Fetch the latest firmware release from GitHub API
 * Results are cached for 6 hours to avoid rate limits
 * @returns FirmwareRelease object or null if fetch fails
 */
export async function getLatestFirmware(): Promise<FirmwareRelease | null> {
	const now = Date.now();

	// Return cached release if still valid
	if (cachedRelease && now - cacheTime < CACHE_TTL) {
		return cachedRelease;
	}

	try {
		const response = await fetch(GITHUB_API_URL, {
			headers: {
				Accept: "application/vnd.github.v3+json",
				"User-Agent": "BYOS-TRMNL",
			},
			// Use Next.js cache with revalidation
			next: { revalidate: 21600 }, // 6 hours
		});

		if (!response.ok) {
			console.error(
				`Failed to fetch firmware release: ${response.status} ${response.statusText}`,
			);
			return cachedRelease; // Return stale cache if available
		}

		const data = await response.json();

		// Extract version from tag (remove 'v' prefix)
		const tag = data.tag_name || "";
		const version = tag.replace(/^v/i, "");

		if (!version) {
			console.error("Invalid release data: missing tag_name");
			return cachedRelease;
		}

		const release: FirmwareRelease = {
			version,
			tag,
			downloadUrl: getFirmwareUrl(version),
			publishedAt: data.published_at || new Date().toISOString(),
		};

		// Update cache
		cachedRelease = release;
		cacheTime = now;

		return release;
	} catch (error) {
		console.error("Error fetching firmware release:", error);
		return cachedRelease; // Return stale cache if available
	}
}

// Reachability is cached alongside the release so we issue at most one HEAD
// per URL per TTL window rather than on every device poll.
const reachableUrls = new Map<string, boolean>();

/**
 * Verify a firmware binary actually exists before we tell a device to flash
 * it. The TRMNL firmware treats `update_firmware: true` as a command to
 * download + flash; pointing it at a 404 puts the device in a failed-OTA
 * retry loop where it never renders the screen. A cheap HEAD guards against
 * that.
 * @param url - Candidate firmware binary URL
 */
export async function isFirmwareUrlReachable(url: string): Promise<boolean> {
	const cached = reachableUrls.get(url);
	if (cached !== undefined) return cached;
	try {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 5000);
		const response = await fetch(url, {
			method: "HEAD",
			signal: controller.signal,
		});
		clearTimeout(timeout);
		const ok = response.ok;
		reachableUrls.set(url, ok);
		return ok;
	} catch {
		reachableUrls.set(url, false);
		return false;
	}
}

/**
 * Clear the firmware cache (useful for testing)
 */
export function clearFirmwareCache(): void {
	cachedRelease = null;
	cacheTime = 0;
	reachableUrls.clear();
}
