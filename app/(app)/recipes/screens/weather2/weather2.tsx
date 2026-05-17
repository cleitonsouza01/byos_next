import { PreSatori } from "@/utils/pre-satori";
import type { HourlyForecast } from "../weather/getData";

// SVG path data inlined so we can render at any size and tint each glyph
// independently. Same source set as the original weather recipe — only the
// sizing helper differs (we tint paths red on hot hours, black otherwise).
const CLOUD_PATH =
	"M32 400C32 479.5 96.5 544 176 544L480 544C550.7 544 608 486.7 608 416C608 364.4 577.5 319.9 533.5 299.7C540.2 286.6 544 271.7 544 256C544 203 501 160 448 160C430.3 160 413.8 164.8 399.6 173.1C375.5 127.3 327.4 96 272 96C192.5 96 128 160.5 128 240C128 248 128.7 255.9 129.9 263.5C73 282.7 32 336.6 32 400z";
const SUN_PATH =
	"M210.2 53.9C217.6 50.8 226 51.7 232.7 56.1L320.5 114.3L408.3 56.1C415 51.7 423.4 50.9 430.8 53.9C438.2 56.9 443.4 63.5 445 71.3L465.9 174.5L569.1 195.4C576.9 197 583.5 202.4 586.5 209.7C589.5 217 588.7 225.5 584.3 232.2L526.1 320L584.3 407.8C588.7 414.5 589.5 422.9 586.5 430.3C583.5 437.7 576.9 443.1 569.1 444.6L465.8 465.4L445 568.7C443.4 576.5 438 583.1 430.7 586.1C423.4 589.1 414.9 588.3 408.2 583.9L320.4 525.7L232.6 583.9C225.9 588.3 217.5 589.1 210.1 586.1C202.7 583.1 197.3 576.5 195.8 568.7L175 465.4L71.7 444.5C63.9 442.9 57.3 437.5 54.3 430.2C51.3 422.9 52.1 414.4 56.5 407.7L114.7 320L56.5 232.2C52.1 225.5 51.3 217.1 54.3 209.7C57.3 202.3 63.9 196.9 71.7 195.4L175 174.6L195.9 71.3C197.5 63.5 202.9 56.9 210.2 53.9zM239.6 320C239.6 275.6 275.6 239.6 320 239.6C364.4 239.6 400.4 275.6 400.4 320C400.4 364.4 364.4 400.4 320 400.4C275.6 400.4 239.6 364.4 239.6 320zM448.4 320C448.4 249.1 390.9 191.6 320 191.6C249.1 191.6 191.6 249.1 191.6 320C191.6 390.9 249.1 448.4 320 448.4C390.9 448.4 448.4 390.9 448.4 320z";
const RAIN_PATH =
	"M160 384C107 384 64 341 64 288C64 245.5 91.6 209.4 129.9 196.8C128.6 190.1 128 183.1 128 176C128 114.1 178.1 64 240 64C283.1 64 320.5 88.3 339.2 124C353.9 106.9 375.7 96 400 96C444.2 96 480 131.8 480 176C480 181.5 479.4 186.8 478.4 192C478.9 192 479.5 192 480 192C533 192 576 235 576 288C576 341 533 384 480 384L160 384zM161.6 452.2C162.7 449.7 165.2 448 168 448C170.8 448 173.3 449.6 174.4 452.2L204.6 520.4C206.8 525.5 208 530.9 208 536.4C208 558.3 189.9 576 168 576C146.1 576 128 558.3 128 536.4C128 530.9 129.2 525.4 131.4 520.4L161.6 452.2zM313.6 452.2C314.7 449.7 317.2 448 320 448C322.8 448 325.3 449.6 326.4 452.2L356.6 520.4C358.8 525.5 360 530.9 360 536.4C360 558.3 341.9 576 320 576C298.1 576 280 558.3 280 536.4C280 530.9 281.2 525.4 283.4 520.4L313.6 452.2zM435.4 520.4L465.6 452.2C466.7 449.7 469.2 448 472 448C474.8 448 477.3 449.6 478.4 452.2L508.6 520.4C510.8 525.5 512 530.9 512 536.4C512 558.3 493.9 576 472 576C450.1 576 432 558.3 432 536.4C432 530.9 433.2 525.4 435.4 520.4z";

function glyphPathFor(desc: string): string {
	const d = desc.toLowerCase();
	if (d.includes("clear") || d.includes("sun")) return SUN_PATH;
	if (
		d.includes("rain") ||
		d.includes("drizzle") ||
		d.includes("snow") ||
		d.includes("thunder")
	)
		return RAIN_PATH;
	return CLOUD_PATH;
}

// fill must be one of the BWR-quantizer-safe colors:
//   - "#000000" → BLACK
//   - "#FF0000" → RED (firmware rule: r>180 && g<100 && b<100)
// Anti-aliased SVG edges between fill and the white background fade
// through high-r,high-g,high-b values which all collapse to WHITE, so
// the body of the glyph stays crisp on the panel.
function sizedGlyph(desc: string, px: number, fill: string = "#000000") {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 640 640"
			width={px}
			height={px}
			fill={fill}
			role="img"
			aria-label={desc}
		>
			<path d={glyphPathFor(desc)} />
		</svg>
	);
}

// PreSatori transforms JSX classNames into Takumi/Satori's `tw` prop but
// only walks the elements it can see directly — it never crosses a React
// component boundary. So we cannot wrap a tile in a child component (the
// inner divs would render unstyled under Takumi). Instead, we describe
// each tile as a plain data object and inline-render the markup in the
// parent. Same content, every node visible to PreSatori.
type Stat = {
	label: string;
	value: string;
	suffix?: string;
	accent?: boolean;
};

interface Weather2Props {
	temperature?: string;
	feelsLike?: string;
	humidity?: string;
	windSpeed?: string;
	description?: string;
	location?: string;
	lastUpdated?: string;
	highTemp?: string;
	lowTemp?: string;
	pressure?: string;
	sunset?: string;
	sunrise?: string;
	hourly?: HourlyForecast[];
	width?: number;
	height?: number;
}

export default function Weather2({
	temperature = "—",
	feelsLike = "—",
	humidity = "—",
	windSpeed = "—",
	description = "—",
	location = "—",
	highTemp = "—",
	lowTemp = "—",
	pressure = "—",
	sunset = "—",
	sunrise = "—",
	hourly = [],
	width = 1304,
	height = 984,
}: Weather2Props) {
	// Pick 8 hours from the upstream feed (forecast_hours=9 means hourly[0]
	// is "now"). Showing 8 keeps each cell roughly 145px wide at 1304 with
	// a 28px outer padding and 12px gaps — readable from across a room.
	const strip = hourly.slice(0, 8);

	// "Hot" temperature accent: tint the big degree symbol red so the
	// number itself stays solid black for max contrast on the panel.
	const tempValue = Number.parseInt(temperature, 10);
	const isHot = Number.isFinite(tempValue) && tempValue >= 80;

	return (
		<PreSatori width={width} height={height}>
			<div className="flex flex-col w-full h-full bg-white text-black font-inter px-10 py-9">
				{/* Header band */}
				<div className="flex flex-row items-baseline justify-between">
					<h1 className="text-6xl font-extrabold tracking-tight">
						Weather Forecast <span className="text-[#FF0000]">2</span>
					</h1>
					<div className="text-3xl font-semibold">
						<span>{location}</span>
						<span className="text-[#FF0000] mx-3">●</span>
						<span>{description}</span>
					</div>
				</div>
				<div className="h-2 bg-[#FF0000] w-full mt-3 mb-7" />

				{/* Hero row: weather glyph · big temp · hi/lo + feels-like */}
				<div className="flex flex-row items-center gap-10">
					<div className="shrink-0">
						{sizedGlyph(description, 210, "#000000")}
					</div>

					<div className="flex flex-row items-start leading-none">
						<span className="text-[10rem] font-extrabold tabular-nums leading-none">
							{temperature}
						</span>
						<span
							className={`text-[7.5rem] font-extrabold leading-none mt-2 ml-2 ${isHot ? "text-[#FF0000]" : "text-black"}`}
						>
							°F
						</span>
					</div>

					<div className="ml-auto flex flex-col gap-2 leading-none">
						<div className="flex items-center gap-4 text-6xl font-extrabold tabular-nums">
							<span className="text-[#FF0000]">↑</span>
							<span>{highTemp}°</span>
						</div>
						<div className="flex items-center gap-4 text-6xl font-extrabold tabular-nums">
							<span>↓</span>
							<span>{lowTemp}°</span>
						</div>
						<div className="text-3xl font-semibold mt-2">
							Feels like {feelsLike}°F
						</div>
						<div className="text-2xl mt-1">
							<span className="text-[#FF0000]">▲</span> {sunrise}
							{"  "}
							<span className="text-[#FF0000] ml-3">▼</span> {sunset}
						</div>
					</div>
				</div>

				<div className="h-1 bg-black w-full mt-7 mb-5" />

				{/* Hourly strip */}
				<div className="flex items-baseline gap-3 mb-3">
					<span className="inline-block h-5 w-2 bg-[#FF0000]" />
					<span className="text-2xl tracking-[0.18em] font-bold">
						HOURLY FORECAST
					</span>
				</div>
				<div className="flex flex-row justify-between gap-3 mb-5">
					{strip.length === 0
						? Array.from({ length: 8 }).map((_, i) => (
								<div
									key={`hourly-empty-${i}`}
									className="flex-1 flex flex-col items-center bg-white pt-3 pb-4"
								>
									<div className="h-2 w-full bg-black" />
									<span className="text-3xl mt-6">—</span>
								</div>
							))
						: strip.map((h, i) => {
								const isNow = i === 0;
								return (
									<div
										key={`hourly-${i}-${h.label}`}
										className="flex-1 flex flex-col items-center bg-white pt-3 pb-4"
									>
										<div
											className={`h-2 w-full ${isNow ? "bg-[#FF0000]" : "bg-black"}`}
										/>
										<span
											className={`text-3xl font-extrabold tracking-wider mt-3 ${isNow ? "text-[#FF0000]" : "text-black"}`}
										>
											{isNow ? "NOW" : h.label}
										</span>
										<div className="my-3">
											{sizedGlyph(h.description, 72, "#000000")}
										</div>
										<span className="text-5xl font-extrabold tabular-nums">
											{h.temperature}°
										</span>
									</div>
								);
							})}
				</div>

				<div className="h-1 bg-black w-full mt-2 mb-5" />

				{/* Stats row: 4 equally-sized tiles inlined here (see the Stat
				    type's comment for why we don't extract a component). */}
				<div className="flex flex-row gap-5 w-full">
					{(
						[
							{ label: "HUMIDITY", value: humidity, suffix: "%" },
							{ label: "WIND", value: windSpeed, suffix: "mph" },
							{ label: "PRESSURE", value: pressure, suffix: "inHg" },
							{
								label: "FEELS",
								value: feelsLike,
								suffix: "°F",
								accent: true,
							},
						] satisfies Stat[]
					).map((s) => (
						<div
							key={s.label}
							className="flex-1 flex flex-col bg-white px-5 pt-3 pb-4"
						>
							<div
								className={`h-2 w-full ${s.accent ? "bg-[#FF0000]" : "bg-black"}`}
							/>
							<span className="text-2xl tracking-[0.18em] font-bold mt-3">
								{s.label}
							</span>
							<div className="flex items-baseline gap-2 mt-3">
								<span className="text-6xl font-extrabold leading-none tabular-nums">
									{s.value}
								</span>
								{s.suffix ? (
									<span className="text-3xl font-bold leading-none">
										{s.suffix}
									</span>
								) : null}
							</div>
						</div>
					))}
				</div>
			</div>
		</PreSatori>
	);
}
