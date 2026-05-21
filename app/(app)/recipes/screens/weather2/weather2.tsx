import { PreSatori } from "@/utils/pre-satori";
import type { DailyForecast, HourlyForecast } from "../weather/getData";

// Weather glyphs adapted from Lucide. Every Open-Meteo state gets its
// own glyph. PreSatori only walks JSX it sees directly so each branch
// is inlined as literal SVG (no helper components).
function weatherIcon(
	code: number,
	size: number,
	cloudFill: "#000000" | "#FFFFFF" = "#000000",
	isDay = 1,
) {
	const isClear = code === 0 || code === 1;
	const isPartCloud = code === 2;
	const isNight = isDay === 0;
	const isOvercast = code === 3;
	const isFog = code === 45 || code === 48;
	const isDrizzle = code >= 51 && code <= 57;
	const isRain = (code >= 61 && code <= 67) || (code >= 80 && code <= 82);
	const isSnow =
		(code >= 71 && code <= 77) || code === 85 || code === 86;
	const isThunder = code === 95 || code === 96 || code === 99;

	const cloudBig =
		"M 6 42 a 13 13 0 0 1 13 -11 c 3 -10 18 -12 23 -2 a 9 9 0 0 1 12 8 a 9 9 0 0 1 -9 9 H 18 a 11 11 0 0 1 -12 -4 z";
	const cloudHigh =
		"M 4 30 a 11 11 0 0 1 11 -9 c 3 -8 16 -10 20 -2 a 8 8 0 0 1 10 7 a 8 8 0 0 1 -8 8 H 15 a 10 10 0 0 1 -11 -4 z";

	if (isClear) {
		// Night: red crescent moon. Day: red sun + rays.
		if (isNight) {
			return (
				<svg width={size} height={size} viewBox="0 0 56 56" role="img" aria-label="Clear night">
					<path
						d="M 38 6 a 22 22 0 1 0 12 38 a 17 17 0 0 1 -12 -38 z"
						fill="#FF0000"
					/>
				</svg>
			);
		}
		return (
			<svg width={size} height={size} viewBox="0 0 56 56" role="img" aria-label="Clear">
				<circle cx="28" cy="28" r="13" fill="#FF0000" />
				<g stroke="#FF0000" strokeWidth="3.5" strokeLinecap="round">
					<line x1="28" y1="3" x2="28" y2="9" />
					<line x1="28" y1="47" x2="28" y2="53" />
					<line x1="3" y1="28" x2="9" y2="28" />
					<line x1="47" y1="28" x2="53" y2="28" />
					<line x1="9" y1="9" x2="13" y2="13" />
					<line x1="43" y1="43" x2="47" y2="47" />
					<line x1="47" y1="9" x2="43" y2="13" />
					<line x1="13" y1="43" x2="9" y2="47" />
				</g>
			</svg>
		);
	}
	if (isPartCloud) {
		// Night: crescent moon peeking out behind the cloud. Day: sun.
		if (isNight) {
			return (
				<svg width={size} height={size} viewBox="0 0 56 56" role="img" aria-label="Partly cloudy night">
					<path
						d="M 40 4 a 14 14 0 1 0 8 24 a 11 11 0 0 1 -8 -24 z"
						fill="#FF0000"
					/>
					<path d={cloudBig} fill={cloudFill} />
				</svg>
			);
		}
		return (
			<svg width={size} height={size} viewBox="0 0 56 56" role="img" aria-label="Partly cloudy">
				<circle cx="38" cy="18" r="10" fill="#FF0000" />
				<path d={cloudBig} fill={cloudFill} />
			</svg>
		);
	}
	if (isOvercast) {
		return (
			<svg width={size} height={size} viewBox="0 0 56 56" role="img" aria-label="Overcast">
				<path d={cloudBig} fill={cloudFill} />
			</svg>
		);
	}
	if (isFog) {
		return (
			<svg width={size} height={size} viewBox="0 0 56 56" role="img" aria-label="Fog">
				<path d={cloudHigh} fill={cloudFill} />
				<g stroke="#FF0000" strokeWidth="3.5" strokeLinecap="round">
					<line x1="10" y1="42" x2="42" y2="42" />
					<line x1="6" y1="50" x2="50" y2="50" />
				</g>
			</svg>
		);
	}
	if (isDrizzle) {
		return (
			<svg width={size} height={size} viewBox="0 0 56 56" role="img" aria-label="Drizzle">
				<path d={cloudHigh} fill={cloudFill} />
				<g stroke="#FF0000" strokeWidth="3" strokeLinecap="round">
					<line x1="14" y1="40" x2="14" y2="44" />
					<line x1="28" y1="42" x2="28" y2="46" />
					<line x1="42" y1="40" x2="42" y2="44" />
				</g>
			</svg>
		);
	}
	if (isRain) {
		return (
			<svg width={size} height={size} viewBox="0 0 56 56" role="img" aria-label="Rain">
				<path d={cloudHigh} fill={cloudFill} />
				<g stroke="#FF0000" strokeWidth="4" strokeLinecap="round">
					<line x1="14" y1="40" x2="14" y2="52" />
					<line x1="28" y1="42" x2="28" y2="54" />
					<line x1="42" y1="40" x2="42" y2="52" />
				</g>
			</svg>
		);
	}
	if (isSnow) {
		return (
			<svg width={size} height={size} viewBox="0 0 56 56" role="img" aria-label="Snow">
				<path d={cloudHigh} fill={cloudFill} />
				<g stroke="#FF0000" strokeWidth="2.5" strokeLinecap="round">
					<line x1="14" y1="40" x2="14" y2="50" />
					<line x1="28" y1="44" x2="28" y2="54" />
					<line x1="42" y1="40" x2="42" y2="50" />
				</g>
			</svg>
		);
	}
	if (isThunder) {
		return (
			<svg width={size} height={size} viewBox="0 0 56 56" role="img" aria-label="Thunderstorm">
				<path d={cloudHigh} fill={cloudFill} />
				<path d="M 28 32 L 18 48 L 26 48 L 22 56 L 38 38 L 30 38 L 36 32 Z" fill="#FF0000" />
			</svg>
		);
	}
	return (
		<svg width={size} height={size} viewBox="0 0 56 56" role="img" aria-label="Cloudy">
			<path d={cloudBig} fill={cloudFill} />
		</svg>
	);
}

interface Weather2Props {
	temperature?: string;
	feelsLike?: string;
	humidity?: string;
	windSpeed?: string;
	description?: string;
	location?: string;
	highTemp?: string;
	lowTemp?: string;
	pressure?: string;
	sunset?: string;
	sunrise?: string;
	timezone?: string;
	hourly?: HourlyForecast[];
	daily?: DailyForecast[];
	width?: number;
	height?: number;
}

// Design A — Editorial Poster, wall-display scaled. The panel hangs on
// a wall 2-3 m away, so nothing on it should be smaller than a fist.
// Vertical budget at 1304×984:
//   ─ Header 70 (location · date · clock at 30 px each)
//   ─ Red rule 6
//   ─ Hero 480 (temp 440 px DM Serif red + condition / range column)
//   ─ Hairline 2
//   ─ Stats 230 (humidity & wind values 264 px = 60 % of 440)
//   ─ Hairline 2
//   ─ Forecast ~194 (NEXT 8 HOURS row + 5-DAY OUTLOOK row)
//   ─ 984 px total · no chrome padding around the body
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
	timezone = "UTC",
	hourly = [],
	daily = [],
	width = 1304,
	height = 984,
}: Weather2Props) {
	const now = new Date();
	const clock = now.toLocaleString("en-US", {
		timeZone: timezone,
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});
	const dayHeader = now
		.toLocaleString("en-US", {
			timeZone: timezone,
			weekday: "short",
			month: "short",
			day: "numeric",
		})
		.toUpperCase();

	const hourlyRow = hourly.slice(0, 8);
	const dailyRow = daily.slice(0, 5);

	// Typography scale — explicit constants so the 60 % rule and every
	// other ratio is auditable. Sizes are tuned for ~2 m viewing on a
	// 12.48" panel (≈131 ppi).
	const TEMP_SIZE = 380;
	const TEMP_DEG_SIZE = 200;
	const COND_SIZE = 92;
	const STAT_VALUE_SIZE = Math.round(TEMP_SIZE * 0.6); // 228

	return (
		<PreSatori width={width} height={height}>
			<div className="flex flex-col w-full h-full bg-white text-black font-inter">
				{/* ───── Header — full width, no chrome padding ───── */}
				<div
					className="flex flex-row items-center justify-between"
					style={{ height: 70, padding: "0 36px" }}
				>
					<div
						className="text-3xl font-bold uppercase"
						style={{ letterSpacing: "0.28em" }}
					>
						{location}
					</div>
					<div
						className="text-3xl font-bold uppercase"
						style={{ letterSpacing: "0.18em" }}
					>
						{dayHeader} · {clock}
					</div>
				</div>
				<div style={{ height: 6, backgroundColor: "#FF0000" }} />

				{/* ───── Hero — temp dominates 60 % of width ───── */}
				<div
					className="flex flex-row"
					style={{ height: 440, padding: "0 36px" }}
				>
					<div
						className="flex flex-row"
						style={{ width: 740, alignItems: "flex-start" }}
					>
						<span
							className="font-dmserif"
							style={{
								fontSize: `${TEMP_SIZE}px`,
								color: "#FF0000",
								lineHeight: 0.86,
								letterSpacing: "-0.04em",
							}}
						>
							{temperature}
						</span>
						<span
							className="font-dmserif"
							style={{
								fontSize: `${TEMP_DEG_SIZE}px`,
								color: "#FF0000",
								lineHeight: 0.86,
							}}
						>
							°
						</span>
					</div>
					<div
						className="flex flex-col"
						style={{ flex: 1, justifyContent: "center", paddingTop: 30 }}
					>
						<div
							className="font-dmserif"
							style={{
								fontSize: `${COND_SIZE}px`,
								lineHeight: 1,
								fontStyle: "italic",
								color: "#000000",
							}}
						>
							{description}.
						</div>
						<div className="text-4xl font-bold" style={{ marginTop: 20 }}>
							Feels like {feelsLike}°
						</div>
						<div
							className="flex flex-row items-baseline"
							style={{ gap: 36, marginTop: 18 }}
						>
							<span
								className="font-bold"
								style={{ fontSize: "76px", color: "#FF0000" }}
							>
								↑ {highTemp}°
							</span>
							<span className="font-bold" style={{ fontSize: "76px" }}>
								↓ {lowTemp}°
							</span>
						</div>
					</div>
				</div>
				<div style={{ height: 2, backgroundColor: "#000000" }} />

				{/* ───── Stats row — humidity & wind 228 px (60 % of temp) ───── */}
				<div className="flex flex-row" style={{ height: 240 }}>
					<div
						className="flex flex-col"
						style={{
							flex: 1,
							borderRight: "2px solid #000000",
							padding: "12px 36px",
							justifyContent: "center",
						}}
					>
						<div
							className="text-4xl font-bold uppercase"
							style={{ letterSpacing: "0.32em" }}
						>
							Humidity
						</div>
						<div className="flex flex-row items-baseline" style={{ marginTop: 4 }}>
							<span
								className="tabular-nums font-inter"
								style={{
									fontWeight: 900,
									fontSize: `${STAT_VALUE_SIZE}px`,
									lineHeight: 1,
								}}
							>
								{humidity}
							</span>
							<span
								className="font-bold"
								style={{ fontSize: "76px", marginLeft: 12 }}
							>
								%
							</span>
						</div>
					</div>
					<div
						className="flex flex-col"
						style={{
							flex: 1,
							borderRight: "2px solid #000000",
							padding: "12px 36px",
							justifyContent: "center",
						}}
					>
						<div
							className="text-4xl font-bold uppercase"
							style={{ letterSpacing: "0.32em" }}
						>
							Wind
						</div>
						<div className="flex flex-row items-baseline" style={{ marginTop: 4 }}>
							<span
								className="tabular-nums font-inter"
								style={{
									fontWeight: 900,
									fontSize: `${STAT_VALUE_SIZE}px`,
									lineHeight: 1,
								}}
							>
								{windSpeed}
							</span>
							<span
								className="font-bold"
								style={{ fontSize: "60px", marginLeft: 12 }}
							>
								mph
							</span>
						</div>
					</div>
					<div
						className="flex flex-col"
						style={{
							width: 320,
							padding: "16px 28px",
							justifyContent: "center",
							gap: 14,
						}}
					>
						<div className="flex flex-col">
							<span
								className="text-xl font-bold uppercase"
								style={{ letterSpacing: "0.24em" }}
							>
								Pressure
							</span>
							<span className="text-5xl font-bold tabular-nums">
								{pressure}
								<span
									className="text-xl font-bold"
									style={{ marginLeft: 8, letterSpacing: "0.18em" }}
								>
									hPa
								</span>
							</span>
						</div>
						<div className="flex flex-col">
							<span
								className="text-xl font-bold uppercase"
								style={{ letterSpacing: "0.24em" }}
							>
								Sun
							</span>
							<span className="text-5xl font-bold tabular-nums">
								<span style={{ color: "#FF0000" }}>▲</span> {sunrise}
							</span>
							<span className="text-5xl font-bold tabular-nums">
								<span style={{ color: "#FF0000" }}>▼</span> {sunset}
							</span>
						</div>
					</div>
				</div>
				<div style={{ height: 2, backgroundColor: "#000000" }} />

				{/* ───── Forecast — NEXT 8 HOURS row, then 5-DAY row ───── */}
				<div className="flex flex-col" style={{ flex: 1 }}>
					{/* Hourly */}
					<div
						className="flex flex-row"
						style={{
							flex: 1,
							borderBottom: "2px solid #000000",
							padding: "8px 24px",
						}}
					>
						{hourlyRow.map((h, i) => {
							const isNow = i === 0;
							return (
								<div
									key={`h-${i}-${h.label}`}
									className="flex flex-col items-center justify-between"
									style={{ flex: 1, minWidth: 0 }}
								>
									<span
										className="text-2xl font-bold tabular-nums uppercase"
										style={{
											letterSpacing: "0.06em",
											color: isNow ? "#FF0000" : "#000000",
										}}
									>
										{isNow ? "NOW" : h.label}
									</span>
									{weatherIcon(h.weatherCode, 80, "#000000", h.isDay)}
									<span
										className="tabular-nums font-inter"
										style={{
											fontWeight: 900,
											fontSize: "56px",
											lineHeight: 1,
											color: isNow ? "#FF0000" : "#000000",
										}}
									>
										{h.temperature}°
									</span>
								</div>
							);
						})}
					</div>
					{/* Daily */}
					<div
						className="flex flex-row"
						style={{ flex: 1, padding: "8px 24px" }}
					>
						{dailyRow.map((d, i) => {
							const isToday = i === 0;
							return (
								<div
									key={`d-${i}-${d.label}`}
									className="flex flex-col items-center justify-between"
									style={{ flex: 1, minWidth: 0 }}
								>
									<span
										className="text-3xl font-bold uppercase"
										style={{
											letterSpacing: "0.12em",
											color: isToday ? "#FF0000" : "#000000",
										}}
									>
										{d.label}
									</span>
									{weatherIcon(d.weatherCode, 96)}
									<div
										className="flex flex-row items-baseline"
										style={{ gap: 12 }}
									>
										<span
											className="tabular-nums font-inter"
											style={{
												fontWeight: 900,
												fontSize: "52px",
												lineHeight: 1,
												color: "#FF0000",
											}}
										>
											{d.highTemp}°
										</span>
										<span
											className="text-4xl font-bold tabular-nums"
											style={{ lineHeight: 1 }}
										>
											{d.lowTemp}°
										</span>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</PreSatori>
	);
}
