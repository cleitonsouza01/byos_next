import { PreSatori } from "@/utils/pre-satori";
import type { HourlyForecast } from "./getData";
import {
	CloudIcon,
	FogIcon,
	humidityIcon,
	pressureIcon,
	RainIcon,
	SnowIcon,
	SunIcon,
	sunriseIcon,
	sunsetIcon,
	ThunderIcon,
	tempDown,
	tempIcon,
	tempUp,
	windIcon,
} from "./icons";

interface WeatherProps {
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
	latitude?: number;
	longitude?: number;
	hourly?: HourlyForecast[];
	width?: number;
	height?: number;
}

const getWeatherIcon = (desc: string) => {
	const lowerDesc = desc.toLowerCase();
	if (lowerDesc.includes("rain") || lowerDesc.includes("drizzle"))
		return RainIcon;
	if (lowerDesc.includes("snow")) return SnowIcon;
	if (lowerDesc.includes("cloud")) return CloudIcon;
	if (lowerDesc.includes("clear") || lowerDesc.includes("sun")) return SunIcon;
	if (lowerDesc.includes("fog") || lowerDesc.includes("mist")) return FogIcon;
	if (lowerDesc.includes("thunder")) return ThunderIcon;
	return CloudIcon;
};

// Compact SVG glyphs sized for the hourly strip. Reuses the same filled
// shapes as icons.tsx (Cloud / Sun / Rain-cloud) inlined at 36×36 so we
// don't have to thread CSS sizing through Satori's style allowlist.
const HOURLY_CLOUD =
	"M32 400C32 479.5 96.5 544 176 544L480 544C550.7 544 608 486.7 608 416C608 364.4 577.5 319.9 533.5 299.7C540.2 286.6 544 271.7 544 256C544 203 501 160 448 160C430.3 160 413.8 164.8 399.6 173.1C375.5 127.3 327.4 96 272 96C192.5 96 128 160.5 128 240C128 248 128.7 255.9 129.9 263.5C73 282.7 32 336.6 32 400z";
const HOURLY_SUN =
	"M210.2 53.9C217.6 50.8 226 51.7 232.7 56.1L320.5 114.3L408.3 56.1C415 51.7 423.4 50.9 430.8 53.9C438.2 56.9 443.4 63.5 445 71.3L465.9 174.5L569.1 195.4C576.9 197 583.5 202.4 586.5 209.7C589.5 217 588.7 225.5 584.3 232.2L526.1 320L584.3 407.8C588.7 414.5 589.5 422.9 586.5 430.3C583.5 437.7 576.9 443.1 569.1 444.6L465.8 465.4L445 568.7C443.4 576.5 438 583.1 430.7 586.1C423.4 589.1 414.9 588.3 408.2 583.9L320.4 525.7L232.6 583.9C225.9 588.3 217.5 589.1 210.1 586.1C202.7 583.1 197.3 576.5 195.8 568.7L175 465.4L71.7 444.5C63.9 442.9 57.3 437.5 54.3 430.2C51.3 422.9 52.1 414.4 56.5 407.7L114.7 320L56.5 232.2C52.1 225.5 51.3 217.1 54.3 209.7C57.3 202.3 63.9 196.9 71.7 195.4L175 174.6L195.9 71.3C197.5 63.5 202.9 56.9 210.2 53.9zM239.6 320C239.6 275.6 275.6 239.6 320 239.6C364.4 239.6 400.4 275.6 400.4 320C400.4 364.4 364.4 400.4 320 400.4C275.6 400.4 239.6 364.4 239.6 320zM448.4 320C448.4 249.1 390.9 191.6 320 191.6C249.1 191.6 191.6 249.1 191.6 320C191.6 390.9 249.1 448.4 320 448.4C390.9 448.4 448.4 390.9 448.4 320z";
const HOURLY_RAIN =
	"M160 384C107 384 64 341 64 288C64 245.5 91.6 209.4 129.9 196.8C128.6 190.1 128 183.1 128 176C128 114.1 178.1 64 240 64C283.1 64 320.5 88.3 339.2 124C353.9 106.9 375.7 96 400 96C444.2 96 480 131.8 480 176C480 181.5 479.4 186.8 478.4 192C478.9 192 479.5 192 480 192C533 192 576 235 576 288C576 341 533 384 480 384L160 384zM161.6 452.2C162.7 449.7 165.2 448 168 448C170.8 448 173.3 449.6 174.4 452.2L204.6 520.4C206.8 525.5 208 530.9 208 536.4C208 558.3 189.9 576 168 576C146.1 576 128 558.3 128 536.4C128 530.9 129.2 525.4 131.4 520.4L161.6 452.2zM313.6 452.2C314.7 449.7 317.2 448 320 448C322.8 448 325.3 449.6 326.4 452.2L356.6 520.4C358.8 525.5 360 530.9 360 536.4C360 558.3 341.9 576 320 576C298.1 576 280 558.3 280 536.4C280 530.9 281.2 525.4 283.4 520.4L313.6 452.2zM435.4 520.4L465.6 452.2C466.7 449.7 469.2 448 472 448C474.8 448 477.3 449.6 478.4 452.2L508.6 520.4C510.8 525.5 512 530.9 512 536.4C512 558.3 493.9 576 472 576C450.1 576 432 558.3 432 536.4C432 530.9 433.2 525.4 435.4 520.4z";

const glyphFor = (desc: string): { path: string; label: string } => {
	const d = desc.toLowerCase();
	if (d.includes("clear") || d.includes("sun"))
		return { path: HOURLY_SUN, label: "Clear" };
	if (
		d.includes("rain") ||
		d.includes("drizzle") ||
		d.includes("snow") ||
		d.includes("thunder")
	)
		return { path: HOURLY_RAIN, label: "Precipitation" };
	return { path: HOURLY_CLOUD, label: "Cloud" };
};

const sizedGlyph = (desc: string, px: number) => {
	const { path, label } = glyphFor(desc);
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 640 640"
			width={px}
			height={px}
			role="img"
			aria-label={label}
		>
			<path d={path} />
		</svg>
	);
};

export default function Weather({
	temperature = "Loading...",
	feelsLike = "Loading...",
	humidity = "Loading...",
	windSpeed = "Loading...",
	description = "Loading...",
	location = "Loading...",
	lastUpdated = "Loading...",
	highTemp = "Loading...",
	lowTemp = "Loading...",
	pressure = "Loading...",
	sunset = "Loading...",
	sunrise = "Loading...",
	hourly = [],
	width = 800,
	height = 480,
}: WeatherProps) {
	const isHalfScreen = width === 400 && height === 480;
	// Small e-paper panels (e.g. XIAO + Waveshare 7.5" V1 at 640×384) get a
	// dedicated layout: top-line summary + hourly strip + two stats.
	const isSmallScreen = !isHalfScreen && width <= 700;

	if (isSmallScreen) {
		// Pick 4 hours stepped 2h apart, starting from +2h (or fall back to
		// the first 4 if upstream hasn't supplied a deep enough forecast).
		const stripSource =
			hourly.length >= 9
				? [hourly[2], hourly[4], hourly[6], hourly[8]]
				: hourly.slice(1, 5);
		const strip = stripSource.filter(Boolean) as HourlyForecast[];

		return (
			<PreSatori width={width} height={height}>
				<div className="flex flex-col w-full h-full bg-white text-black px-5 py-3">
					{/* Hero row: big icon + huge temperature + ↑↓ */}
					<div className="flex flex-row items-center">
						<div className="shrink-0 mr-4">{sizedGlyph(description, 96)}</div>
						<div className="flex flex-col leading-none flex-1">
							<span className="text-8xl font-inter">{temperature}°</span>
							<div className="flex flex-row items-center text-3xl mt-2 font-blockkie">
								{tempUp} {highTemp}°
								<span className="inline-block w-4" />
								{tempDown} {lowTemp}°
							</div>
						</div>
					</div>

					{/* Subtitle row */}
					<div className="text-2xl mt-1">
						{location} · {description}
					</div>

					<div className="w-full border-t-2 border-black mt-2 mb-2" />

					{/* 4-cell forecast strip — stepped 2h apart */}
					<div className="flex flex-row justify-between items-stretch flex-1 pb-1">
						{strip.length === 0
							? Array.from({ length: 4 }).map((_, i) => (
									<div
										key={`hourly-placeholder-${i}`}
										className="flex flex-col items-center justify-center flex-1 text-3xl text-gray-500"
									>
										—
									</div>
								))
							: strip.map((h, i) => (
									<div
										key={`hourly-${i}-${h.label}`}
										className="flex flex-col items-center justify-between flex-1"
									>
										<span className="text-3xl leading-none">{h.label}</span>
										<div>{sizedGlyph(h.description, 56)}</div>
										<span className="text-4xl leading-none font-inter">
											{h.temperature}°
										</span>
									</div>
								))}
					</div>
				</div>
			</PreSatori>
		);
	}

	// Existing 800×480 / 400×480 layout — unchanged behaviour.
	const weatherStats = [
		{ label: "Feels Like", value: `${feelsLike}°C`, icon: tempIcon },
		{ label: "Humidity", value: `${humidity}%`, icon: humidityIcon },
		{ label: "Wind Speed", value: `${windSpeed} km/h`, icon: windIcon },
		{ label: "Pressure", value: `${pressure} hPa`, icon: pressureIcon },
		{ label: "Sunrise", value: `${sunrise}`, icon: sunriseIcon },
		{ label: "Sunset", value: `${sunset}`, icon: sunsetIcon },
	];

	return (
		<PreSatori width={width} height={height}>
			<div className="flex flex-col w-full h-full bg-white text-black">
				<div
					className={`flex p-4 sm:flex-row items-center justify-between ${isHalfScreen ? "flex-row" : "flex-col sm:flex-row"}`}
				>
					<h2
						className={`font-inter ${isHalfScreen ? "text-8xl" : "text-9xl"}`}
					>
						{temperature}°C
					</h2>
					<div className="flex flex-col items-center justify-center">
						{getWeatherIcon(description)}
						{!isHalfScreen && (
							<div className="text-4xl mt-4 font-blockkie">
								<div className="flex flex-row items-center">
									{tempUp} {highTemp}°C
									{tempDown} {lowTemp}°C
								</div>
							</div>
						)}
					</div>
				</div>
				<div className="p-4 flex flex-col flex-1">
					<div
						className={`w-full flex flex-col flex-1 mb-4 ${isHalfScreen ? "gap-2" : "gap-4"} grid grid-cols-2 sm:grid-cols-3`}
					>
						{weatherStats.map((stat, index) => (
							<div
								key={index}
								className=" rounded-xl border border-black flex-1 flex flex-row items-center"
							>
								<div className="p-2 max-h-16">{stat.icon}</div>
								<div className="flex flex-col sm:ml-2">
									<div
										className={`leading-none m-0 ${isHalfScreen ? "text-2xl" : "text-3xl"}`}
									>
										{stat.label}
									</div>
									<div
										className={`leading-none m-0 ${isHalfScreen ? "text-2xl" : "text-3xl"}`}
									>
										{stat.value}
									</div>
								</div>
							</div>
						))}
					</div>
					<div className="w-full flex flex-col sm:flex-row  sm:justify-between items-center text-2xl text-white p-2 rounded-xl bg-gray-500">
						<div>{location}</div>
						<div>{lastUpdated && <span>Last updated: {lastUpdated}</span>}</div>
					</div>
				</div>
			</div>
		</PreSatori>
	);
}
