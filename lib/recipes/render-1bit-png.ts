import type React from "react";
import sharp from "sharp";
import { DitheringMethod, renderBmp } from "@/utils/render-bmp";
import { renderPng } from "@/utils/render-png";
import {
	addDimensionsToProps,
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
	const nativeRender = config?.renderSettings?.nativeRender === true;
	// Recipes with a responsive layout opt in to render directly at the device
	// size. Everything else uses the cheap path: render at 800×480, then
	// nearest-neighbor resize down so existing 800×480-designed recipes still
	// fit on smaller panels (mediocre quality, zero per-recipe work).
	const renderWidth = nativeRender ? outputWidth : NATIVE_RECIPE_WIDTH;
	const renderHeight = nativeRender ? outputHeight : NATIVE_RECIPE_HEIGHT;

	// Match the OG /api/bitmap flow: thread the actual render dimensions into
	// the component's props so responsive recipes can branch on width/height.
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

	const sized = nativeRender
		? native.png
		: await sharp(native.png)
				.resize(outputWidth, outputHeight, { kernel: "nearest", fit: "fill" })
				.png()
				.toBuffer();

	const bmp = await renderBmp(sized, {
		width: outputWidth,
		height: outputHeight,
		grayscale: 2,
		ditheringMethod: DitheringMethod.FLOYD_STEINBERG,
		applyEdgeSnap: config?.renderSettings?.applyEdgeSnap ?? true,
	});
	if (!bmp) return null;

	return (await renderPng(bmp)) ?? null;
}
