import type { NextRequest } from "next/server";
import { cache } from "react";
import NotFoundScreen from "@/app/(app)/recipes/screens/not-found/not-found";
import { getCurrentUserId } from "@/lib/auth/get-user";
import { buildRecipeElement, logger } from "@/lib/recipes/recipe-renderer";
import { renderRecipeTo1BitPng } from "@/lib/recipes/render-1bit-png";
import {
	parseRequestHeaders,
	resolveUserIdFromApiKey,
} from "../../display/utils";

const DEFAULT_WIDTH = 640;
const DEFAULT_HEIGHT = 384;

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

		logger.info(`PNG request: ${slugPath} → ${width}x${height} 1-bit`);

		// Same fallback as /api/bitmap — dashboard previews need
		// session-scoped userId to see catalog-installed liquid recipes.
		const userId = headers.apiKey
			? await resolveUserIdFromApiKey(headers.apiKey)
			: await getCurrentUserId();
		const cookieHeader = req.headers.get("cookie") || undefined;

		const png = await render1BitPngCached(
			recipeSlug,
			width,
			height,
			userId,
			cookieHeader,
		);

		if (!png || png.length === 0) {
			logger.warn(`PNG render empty for ${recipeSlug}, falling back`);
			return await renderFallback1BitPng(width, height);
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
		logger.error("Error generating 1-bit PNG:", error);
		return await renderFallback1BitPng();
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

const renderFallback1BitPng = cache(
	async (width: number = DEFAULT_WIDTH, height: number = DEFAULT_HEIGHT) => {
		try {
			const png = await renderRecipeTo1BitPng({
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
