import type { NextRequest } from "next/server";
import { cache } from "react";
import NotFoundScreen from "@/app/(app)/recipes/screens/not-found/not-found";
import { getCurrentUserId } from "@/lib/auth/get-user";
import { buildRecipeElement, logger } from "@/lib/recipes/recipe-renderer";
import { renderRecipeTo1BitPng } from "@/lib/recipes/render-1bit-png";
import { renderRecipeToBwrPng } from "@/lib/recipes/render-bwr-png";
import {
	parseRequestHeaders,
	resolveUserIdFromApiKey,
} from "../../display/utils";

const DEFAULT_WIDTH = 640;
const DEFAULT_HEIGHT = 384;

// Devices that use the 3-color BWR pipeline. Detected by the requested
// dimensions matching a known BWR panel, since the firmware doesn't
// currently advertise its palette in headers. Keep this list in sync with
// data/trmnl/models.local.json palette_ids === ["color-3bwr"].
const BWR_PANELS: Array<{ width: number; height: number }> = [
	{ width: 1304, height: 984 },
];

function isBwrPanel(width: number, height: number): boolean {
	return BWR_PANELS.some((p) => p.width === width && p.height === height);
}

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ slug?: string[] }> },
) {
	const headers = parseRequestHeaders(req);
	try {
		const { slug = ["not-found"] } = await params;
		const slugPath = Array.isArray(slug) ? slug.join("/") : slug;
		const recipeSlug = slugPath.replace(".png", "");

		const { searchParams } = new URL(req.url);
		const w = parseInt(searchParams.get("width") || "", 10);
		const h = parseInt(searchParams.get("height") || "", 10);
		const width = w > 0 ? w : DEFAULT_WIDTH;
		const height = h > 0 ? h : DEFAULT_HEIGHT;
		const bwr = isBwrPanel(width, height);

		logger.info(
			`PNG request: ${slugPath} → ${width}x${height} ${bwr ? "BWR" : "1-bit"}`,
		);

		// Same fallback as /api/bitmap — dashboard previews need
		// session-scoped userId to see catalog-installed liquid recipes.
		const userId = headers.apiKey
			? await resolveUserIdFromApiKey(headers.apiKey)
			: await getCurrentUserId();
		const cookieHeader = req.headers.get("cookie") || undefined;

		const png = bwr
			? await renderBwrPngCached(
					recipeSlug,
					width,
					height,
					userId,
					cookieHeader,
				)
			: await render1BitPngCached(
					recipeSlug,
					width,
					height,
					userId,
					cookieHeader,
				);

		if (!png || png.length === 0) {
			logger.warn(`PNG render empty for ${recipeSlug}, falling back`);
			return await renderFallbackPng(width, height, bwr);
		}

		return new Response(new Uint8Array(png), {
			headers: {
				"Content-Type": "image/png",
				"Content-Length": png.length.toString(),
				// Cache for one minute on the firmware side. Firmware doesn't
				// honor this but a reverse proxy might.
				"Cache-Control": "public, max-age=60",
			},
		});
	} catch (error) {
		logger.error("Error generating PNG:", error);
		return await renderFallbackPng(DEFAULT_WIDTH, DEFAULT_HEIGHT, false);
	}
}

const render1BitPngCached = cache(
	async (
		recipeId: string,
		width: number,
		height: number,
		userId: string | null,
		cookies?: string,
	) => {
		const built = await buildRecipeElement({
			slug: recipeId,
			userId: userId ?? undefined,
		});
		return renderRecipeTo1BitPng({
			slug: recipeId,
			Component: built.Component,
			props: built.props,
			config: built.config,
			html: built.html,
			cookies,
			outputWidth: width,
			outputHeight: height,
		});
	},
);

const renderBwrPngCached = cache(
	async (
		recipeId: string,
		width: number,
		height: number,
		userId: string | null,
		cookies?: string,
	) => {
		const built = await buildRecipeElement({
			slug: recipeId,
			userId: userId ?? undefined,
		});
		return renderRecipeToBwrPng({
			slug: recipeId,
			Component: built.Component,
			props: built.props,
			config: built.config,
			html: built.html,
			cookies,
			outputWidth: width,
			outputHeight: height,
		});
	},
);

const renderFallbackPng = cache(
	async (width: number, height: number, bwr: boolean) => {
		try {
			const png = bwr
				? await renderRecipeToBwrPng({
						slug: "not-found",
						Component: NotFoundScreen,
						props: { slug: "not-found" },
						config: null,
						outputWidth: width,
						outputHeight: height,
					})
				: await renderRecipeTo1BitPng({
						slug: "not-found",
						Component: NotFoundScreen,
						props: { slug: "not-found" },
						config: null,
						outputWidth: width,
						outputHeight: height,
					});
			if (!png) throw new Error("fallback render returned null");
			return new Response(new Uint8Array(png), {
				headers: {
					"Content-Type": "image/png",
					"Content-Length": png.length.toString(),
				},
			});
		} catch (err) {
			logger.error("Error generating fallback PNG:", err);
			return new Response("Error generating image", {
				status: 500,
				headers: { "Content-Type": "text/plain" },
			});
		}
	},
);
