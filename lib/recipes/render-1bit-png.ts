import type React from "react";
import sharp from "sharp";
import { DitheringMethod, renderBmp } from "@/utils/render-bmp";
import { renderPng } from "@/utils/render-png";
import {
	type ComponentProps,
	type RecipeConfig,
	renderRecipeOutputs,
} from "./recipe-renderer";

const NATIVE_RECIPE_WIDTH = 800;
const NATIVE_RECIPE_HEIGHT = 480;

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

export async function renderRecipeTo1BitPng({
	slug,
	Component,
	props,
	config,
	html,
	cookies,
	outputWidth,
	outputHeight,
}: Args): Promise<Buffer | null> {
	// Render the recipe at its native 800×480 size as a regular PNG.
	const native = await renderRecipeOutputs({
		slug,
		Component,
		props,
		config,
		imageWidth: NATIVE_RECIPE_WIDTH,
		imageHeight: NATIVE_RECIPE_HEIGHT,
		formats: ["png"],
		html,
		cookies,
	});
	if (!native.png) return null;

	// Cheap-path resize: nearest-neighbor to the device's output size.
	const resizedPng = await sharp(native.png)
		.resize(outputWidth, outputHeight, { kernel: "nearest", fit: "fill" })
		.png()
		.toBuffer();

	// Dither to 1-bit BMP at the output size, then convert to 1-bit PNG.
	const bmp = await renderBmp(resizedPng, {
		width: outputWidth,
		height: outputHeight,
		grayscale: 2,
		ditheringMethod: DitheringMethod.FLOYD_STEINBERG,
		applyEdgeSnap: config?.renderSettings?.applyEdgeSnap ?? true,
	});
	if (!bmp) return null;

	return (await renderPng(bmp)) ?? null;
}
