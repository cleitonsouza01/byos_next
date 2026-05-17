import { PNG } from "pngjs";
import type React from "react";
import sharp from "sharp";
import {
	addDimensionsToProps,
	type ComponentProps,
	type RecipeConfig,
	renderRecipeOutputs,
} from "./recipe-renderer";

const NATIVE_RECIPE_WIDTH = 800;
const NATIVE_RECIPE_HEIGHT = 480;

// 3-color palette for Waveshare 12.48" Module B and any future BWR panel.
// Index assignment matches the order the firmware quantizes to in
// docs/byos-waveshare-1248b.md §2.4: index 0 = WHITE (default), 1 = BLACK,
// 2 = RED.
const PALETTE_RGB: Array<[number, number, number]> = [
	[0xff, 0xff, 0xff],
	[0x00, 0x00, 0x00],
	[0xff, 0x00, 0x00],
];

type Args = {
	slug: string;
	Component?: React.ComponentType<ComponentProps> | null;
	props?: ComponentProps;
	config: RecipeConfig | null;
	html?: string;
	cookies?: string;
	outputWidth: number;
	outputHeight: number;
};

/**
 * Classify a single RGB pixel into one of the 3 palette indices using the
 * firmware's quantizer rules verbatim (see §2.4 of the byos-waveshare-1248b
 * doc). Keeps the server-side output identical to what the firmware would
 * derive from any common PNG color type, so the e-paper render matches the
 * preview pixel-for-pixel.
 */
function classify(r: number, g: number, b: number): number {
	if (r > 180 && g < 100 && b < 100) return 2; // RED
	if (r < 100 && g < 100 && b < 100) return 1; // BLACK
	return 0; // WHITE
}

export async function renderRecipeToBwrPng({
	slug,
	Component,
	props,
	config,
	html,
	cookies,
	outputWidth,
	outputHeight,
}: Args): Promise<Buffer | null> {
	const nativeRender = config?.renderSettings?.nativeRender === true;
	// Same cheap-path tradeoff as render-1bit-png: render at 800×480 and
	// scale up unless the recipe is explicitly responsive. The 1304×984
	// panel benefits from native rendering more than smaller panels do,
	// but we keep parity here so the choice lives in one place per recipe.
	const renderWidth = nativeRender ? outputWidth : NATIVE_RECIPE_WIDTH;
	const renderHeight = nativeRender ? outputHeight : NATIVE_RECIPE_HEIGHT;

	const propsWithDimensions = props
		? addDimensionsToProps(props, renderWidth, renderHeight)
		: undefined;

	const native = await renderRecipeOutputs({
		slug,
		Component,
		props: propsWithDimensions,
		config,
		imageWidth: renderWidth,
		imageHeight: renderHeight,
		formats: ["png"],
		html,
		cookies,
	});
	if (!native.png) return null;

	// Decode at the requested device size. Nearest-neighbor avoids creating
	// intermediate greys that would collapse to white during quantization.
	const { data, info } = await sharp(native.png)
		.resize(outputWidth, outputHeight, { kernel: "nearest", fit: "fill" })
		.removeAlpha()
		.raw()
		.toBuffer({ resolveWithObject: true });

	if (info.channels !== 3) {
		// Defensive: removeAlpha() guarantees 3 channels for RGB inputs,
		// but if the upstream renderer ever switches to RGBA without alpha
		// stripping we'd silently corrupt the output. Fail loudly instead.
		return null;
	}

	const png = new PNG({
		width: outputWidth,
		height: outputHeight,
		colorType: 6, // RGBA — pngjs encodes RGBA reliably across runtimes
		bitDepth: 8,
	});

	const pixels = outputWidth * outputHeight;
	for (let i = 0; i < pixels; i++) {
		const r = data[i * 3];
		const g = data[i * 3 + 1];
		const b = data[i * 3 + 2];
		const idx = classify(r, g, b);
		const [pr, pg, pb] = PALETTE_RGB[idx];
		const out = i * 4;
		png.data[out] = pr;
		png.data[out + 1] = pg;
		png.data[out + 2] = pb;
		png.data[out + 3] = 0xff;
	}

	// PNG.sync.write returns a Buffer-compatible Uint8Array; cast for callers
	// that pass it straight to `new Response(new Uint8Array(buf))`.
	return PNG.sync.write(png, {
		colorType: 6,
		bitDepth: 8,
		deflateLevel: 9,
	});
}
