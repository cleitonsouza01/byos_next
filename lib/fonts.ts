import fs from "fs";
import { Geist_Mono as FontMono, Geist as FontSans } from "next/font/google";
import localFont from "next/font/local";
import path from "path";
import { cache } from "react";

// Each entry maps a logical key to its on-disk TTF. Multiple keys may
// share a family name (e.g. inter / interBold / interBlack all surface
// to Satori/Takumi as family "inter" with weights 400/700/900) so that
// `font-bold` / `font-extrabold` resolve to a real outline instead of
// dropping into Takumi's pixel-bitmap fallback.
const fontPaths = {
	blockKie:     path.join(process.cwd(), "public", "fonts", "BlockKie.ttf"),
	geneva9:      path.join(process.cwd(), "public", "fonts", "geneva-9.ttf"),
	inter:        path.join(process.cwd(), "public", "fonts", "Inter_18pt-Regular.ttf"),
	interBold:    path.join(process.cwd(), "public", "fonts", "Inter-Bold.ttf"),
	interBlack:   path.join(process.cwd(), "public", "fonts", "Inter-Black.ttf"),
	dmserif:      path.join(process.cwd(), "public", "fonts", "DMSerifDisplay-Regular.ttf"),
	amberygarden: path.join(process.cwd(), "public", "fonts", "AmberyGardenRegular.ttf"),
};

// Per-file weight + family override used by getTakumiFonts so Takumi
// can resolve `font-bold` / `font-extrabold` instead of pixel-bitmapping.
// Weight is constrained to the literal union Satori's FontOptions
// accepts so the consuming `new ImageResponse({ fonts })` typechecks.
type TakumiWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
const fontWeightMap: Record<string, { family: string; weight: TakumiWeight }> = {
	blockKie:     { family: "blockkie",     weight: 400 },
	geneva9:      { family: "geneva9",      weight: 400 },
	inter:        { family: "inter",        weight: 400 },
	interBold:    { family: "inter",        weight: 700 },
	interBlack:   { family: "inter",        weight: 900 },
	dmserif:      { family: "dmserif",      weight: 400 },
	amberygarden: { family: "amberygarden", weight: 400 },
};

// System fonts configuration
export const fontSans = FontSans({
	subsets: ["latin"],
	variable: "--font-sans",
	display: "swap",
	preload: true,
	adjustFontFallback: true, // Automatically handles fallback fonts
});

export const fontMono = FontMono({
	subsets: ["latin"],
	variable: "--font-mono",
	display: "swap",
	preload: true,
	adjustFontFallback: true,
});

// Display fonts configuration
export const blockKie = localFont({
	src: "../public/fonts/BlockKie.ttf",
	variable: "--font-blockkie",
	preload: true,
	display: "block", // Block rendering until font is loaded for consistent display
	weight: "400",
	style: "normal",
});

// UI fonts configuration
export const geneva9 = localFont({
	src: "../public/fonts/geneva-9.ttf",
	variable: "--font-geneva9",
	preload: true,
	display: "swap", // Use fallback while loading
	weight: "400",
	style: "normal",
});

export const inter = localFont({
	src: "../public/fonts/Inter_18pt-Regular.ttf",
	variable: "--font-inter",
	preload: true,
	display: "swap",
	weight: "400",
	style: "normal",
});

export const amberygarden = localFont({
	src: "../public/fonts/AmberyGardenRegular.ttf",
	variable: "--font-amberygarden",
	preload: true,
	display: "swap",
	weight: "400",
	style: "normal",
});

export const dmserif = localFont({
	src: "../public/fonts/DMSerifDisplay-Regular.ttf",
	variable: "--font-dmserif",
	preload: true,
	display: "swap",
	weight: "400",
	style: "normal",
});

// Font variables organized by purpose
export const fonts = {
	sans: fontSans,
	mono: fontMono,
	blockKie: blockKie,
	geneva9: geneva9,
	inter: inter,
	amberygarden: amberygarden,
	dmserif: dmserif,
} as const;

// Helper to get all font variables
export const getAllFontVariables = () =>
	Object.values(fonts)
		.map((font) => font.variable)
		.join(" ");

export const loadFont = cache(() => {
	try {
		return Object.entries(fontPaths).reduce(
			(acc, [fontName, fontPath]) => {
				acc[fontName] = Buffer.from(fs.readFileSync(fontPath));
				return acc;
			},
			{} as Record<string, Buffer>,
		);
	} catch (error) {
		console.error("Error loading fonts:", error);
		return null;
	}
});

/**
 * Returns an array of Takumi-compatible font objects
 * @param fonts Object containing font buffers from loadFont()
 * @returns Array of font configurations for Takumi
 */
export const getTakumiFonts = () => {
	const fonts = loadFont();
	if (!fonts) return [];
	const style = "normal" as const;

	const takumiFonts = Object.entries(fonts).map(([fontName, fontBuffer]) => {
		let data: ArrayBuffer;
		if (fontBuffer instanceof ArrayBuffer) {
			data = fontBuffer;
		}
		data = Uint8Array.from(fontBuffer).buffer;

		const mapping = fontWeightMap[fontName] ?? {
			family: fontName,
			weight: 400,
		};

		return {
			name: mapping.family,
			data: data,
			weight: mapping.weight,
			style: style,
		};
	});

	return takumiFonts;
};

// Returns the font family declared on the element via `font-XXX`
// Tailwind class, or undefined when none is set. Returning undefined
// lets Satori/Takumi do normal CSS inheritance — each recipe declares
// its font once on the root and child elements inherit. Previously
// this defaulted to "blockkie" (a pixel bitmap) on every untagged
// element, which broke inheritance and forced fallback rendering for
// recipes that wanted clean vector type.
export const extractFontFamily = (className?: string): string | undefined => {
	if (!className) return undefined;
	const fontClass = className.split(" ").find((cls) => cls.startsWith("font-"));
	return fontClass?.replace("font-", "") || undefined;
};
