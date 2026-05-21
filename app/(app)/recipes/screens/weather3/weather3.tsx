import { PreSatori } from "@/utils/pre-satori";
import type { DailyForecast, HourlyForecast } from "../weather/getData";

function weatherIcon(
	code: number,
	size: number,
	cloudFill: "#000000" | "#FFFFFF" = "#000000",
) {
	const isClear = code === 0 || code === 1;
	const isPartCloud = code === 2;
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

interface Weather3Props {
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

// Design B — Timeline Spine, wall-display scaled.
// Vertical budget at 1304×984 (no chrome padding):
//   ─ Header 80 px (location · date · clock at 32 px)
//   ─ Red rule 6 px
//   ─ Hero + stats 360 px (temp 320 px red Inter Black + humidity / wind 192 px = 60 % of 320)
//   ─ Chart 340 px (24-hour curve filling)
//   ─ Daily 198 px (5 cells with 100 px icons + 60 px temps)
//   ─ 984 px total
export default function Weather3({
	temperature = "—",
	humidity = "—",
	windSpeed = "—",
	description = "—",
	location = "—",
	sunset = "—",
	sunrise = "—",
	timezone = "UTC",
	hourly = [],
	daily = [],
	width = 1304,
	height = 984,
}: Weather3Props) {
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

	const CHART_W = 1232;
	const CHART_H = 280;
	const CHART_TOP = 24;
	const CHART_BOTTOM = 240;
	const PLOT_H = CHART_BOTTOM - CHART_TOP;

	const hours = hourly.slice(0, 24);
	const temps = hours.map((h) => Number(h.temperature) || 0);
	const minT = temps.length ? Math.min(...temps) - 2 : 0;
	const maxT = temps.length ? Math.max(...temps) + 2 : 1;
	const rangeT = Math.max(1, maxT - minT);
	const stepX = hours.length > 1 ? CHART_W / (hours.length - 1) : CHART_W;

	const tempY = (t: number) =>
		CHART_BOTTOM - ((t - minT) / rangeT) * PLOT_H;
	const points = temps
		.map((t, i) => `${Math.round(i * stepX)},${Math.round(tempY(t))}`)
		.join(" ");

	const precipHours: number[] = [];
	hours.forEach((h, i) => {
		const c = h.weatherCode;
		if (
			(c >= 51 && c <= 67) ||
			(c >= 80 && c <= 82) ||
			(c >= 95 && c <= 99)
		) {
			precipHours.push(i);
		}
	});

	const axisStops = hours
		.map((h, i) => ({ i, label: i === 0 ? "NOW" : h.label }))
		.filter((s) => s.i % 4 === 0);

	const maxIdx = temps.indexOf(Math.max(...temps));
	const minIdx = temps.indexOf(Math.min(...temps));
	const dailyList = daily.slice(0, 5);

	// Typography scale — explicit so the 60 % rule is auditable.
	const TEMP_SIZE = 260;
	const TEMP_DEG_SIZE = 130;
	const STAT_VALUE_SIZE = Math.round(TEMP_SIZE * 0.6); // 156

	return (
		<PreSatori width={width} height={height}>
			<div className="flex flex-col w-full h-full bg-white text-black font-inter">
				{/* ───── Header ───── */}
				<div
					className="flex flex-row items-center justify-between"
					style={{ height: 80, padding: "0 36px" }}
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

				{/* ───── Hero + Stats ───── */}
				<div className="flex flex-row" style={{ height: 290, padding: "8px 36px" }}>
					<div
						className="flex flex-col"
						style={{ width: 700, justifyContent: "center" }}
					>
						<div
							className="text-5xl font-bold"
							style={{ marginBottom: 8 }}
						>
							{description}
						</div>
						<div className="flex flex-row" style={{ alignItems: "flex-start" }}>
							<span
								className="tabular-nums font-inter"
								style={{
									fontWeight: 900,
									fontSize: `${TEMP_SIZE}px`,
									color: "#FF0000",
									lineHeight: 0.88,
									letterSpacing: "-0.05em",
								}}
							>
								{temperature}
							</span>
							<span
								className="font-inter"
								style={{
									fontWeight: 900,
									fontSize: `${TEMP_DEG_SIZE}px`,
									color: "#FF0000",
									lineHeight: 0.88,
								}}
							>
								°
							</span>
						</div>
					</div>
					<div
						className="flex flex-row"
						style={{ flex: 1, border: "3px solid #000000", marginLeft: 14 }}
					>
						<div
							className="flex flex-col justify-center"
							style={{
								flex: 1,
								borderRight: "3px solid #000000",
								padding: "18px 24px",
							}}
						>
							<div
								className="text-3xl font-bold uppercase"
								style={{ letterSpacing: "0.24em" }}
							>
								Humidity
							</div>
							<div
								className="flex flex-row items-baseline"
								style={{ marginTop: 4 }}
							>
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
									style={{ fontSize: "52px", marginLeft: 10 }}
								>
									%
								</span>
							</div>
						</div>
						<div
							className="flex flex-col justify-center"
							style={{ flex: 1, padding: "18px 24px" }}
						>
							<div
								className="text-3xl font-bold uppercase"
								style={{ letterSpacing: "0.24em" }}
							>
								Wind
							</div>
							<div
								className="flex flex-row items-baseline"
								style={{ marginTop: 4 }}
							>
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
									style={{ fontSize: "44px", marginLeft: 10 }}
								>
									mph
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* ───── 24-Hour Chart ───── */}
				<div
					className="flex flex-col"
					style={{
						height: 420,
						margin: "0 36px",
						border: "3px solid #000000",
						padding: "14px 18px",
					}}
				>
					<div
						className="flex flex-row justify-between"
						style={{ marginBottom: 6 }}
					>
						<span
							className="text-2xl font-bold uppercase"
							style={{ color: "#FF0000", letterSpacing: "0.24em" }}
						>
							24-Hour Forecast
						</span>
						<span
							className="text-2xl font-bold uppercase"
							style={{ letterSpacing: "0.18em" }}
						>
							▲ {sunrise}  ▼ {sunset}
						</span>
					</div>
					<div
						style={{
							display: "flex",
							flex: 1,
							flexDirection: "column",
							position: "relative",
						}}
					>
						<div style={{ display: "flex", position: "relative" }}>
							<svg
								width={CHART_W}
								height={CHART_H}
								viewBox={`0 0 ${CHART_W} ${CHART_H}`}
							>
								<g stroke="#000000" strokeWidth="1" strokeDasharray="3 6">
									<line
										x1={Math.round(6 * stepX)}
										y1={CHART_TOP}
										x2={Math.round(6 * stepX)}
										y2={CHART_BOTTOM}
									/>
									<line
										x1={Math.round(12 * stepX)}
										y1={CHART_TOP}
										x2={Math.round(12 * stepX)}
										y2={CHART_BOTTOM}
									/>
									<line
										x1={Math.round(18 * stepX)}
										y1={CHART_TOP}
										x2={Math.round(18 * stepX)}
										y2={CHART_BOTTOM}
									/>
								</g>
								<line
									x1="0"
									y1={CHART_BOTTOM}
									x2={CHART_W}
									y2={CHART_BOTTOM}
									stroke="#000000"
									strokeWidth="2"
								/>
								<g
									stroke="#FF0000"
									strokeWidth={Math.max(10, Math.round(stepX * 0.7))}
								>
									{precipHours.map((i) => (
										<line
											key={`p-${i}`}
											x1={Math.round(i * stepX)}
											y1={CHART_BOTTOM - 28}
											x2={Math.round(i * stepX)}
											y2={CHART_BOTTOM}
										/>
									))}
								</g>
								<line
									x1="0"
									y1={CHART_TOP}
									x2="0"
									y2={CHART_BOTTOM}
									stroke="#FF0000"
									strokeWidth="8"
								/>
								{temps.length > 1 && (
									<polyline
										points={points}
										fill="none"
										stroke="#FF0000"
										strokeWidth="6"
										strokeLinejoin="round"
										strokeLinecap="round"
									/>
								)}
								<g fill="#FF0000">
									{temps.map((t, i) => (
										<circle
											key={`n-${i}`}
											cx={Math.round(i * stepX)}
											cy={Math.round(tempY(t))}
											r={i % 4 === 0 ? 9 : 4}
										/>
									))}
								</g>
							</svg>
							{temps.length > 0 && (
								<div
									style={{
										position: "absolute",
										left: "10px",
										top: `${Math.round((tempY(temps[0]) / CHART_H) * 100 - 12)}%`,
										color: "#FF0000",
										fontWeight: 900,
										fontSize: "36px",
									}}
								>
									{temps[0]}°
								</div>
							)}
							{maxIdx > 0 && (
								<div
									style={{
										position: "absolute",
										left: `${Math.round((maxIdx * stepX / CHART_W) * 100)}%`,
										top: `${Math.round((tempY(temps[maxIdx]) / CHART_H) * 100 - 12)}%`,
										color: "#FF0000",
										fontWeight: 900,
										fontSize: "36px",
										transform: "translateX(-50%)",
									}}
								>
									{temps[maxIdx]}°
								</div>
							)}
							{minIdx !== maxIdx && minIdx > 0 && (
								<div
									style={{
										position: "absolute",
										left: `${Math.round((minIdx * stepX / CHART_W) * 100)}%`,
										top: `${Math.round((tempY(temps[minIdx]) / CHART_H) * 100 + 2)}%`,
										color: "#000000",
										fontWeight: 900,
										fontSize: "36px",
										transform: "translateX(-50%)",
									}}
								>
									{temps[minIdx]}°
								</div>
							)}
							{precipHours.length > 0 && (
								<div
									style={{
										position: "absolute",
										left: `${Math.round((precipHours[0] * stepX / CHART_W) * 100)}%`,
										top: "6px",
										color: "#FF0000",
										fontWeight: 900,
										fontSize: "22px",
										letterSpacing: "0.24em",
									}}
								>
									PRECIP
								</div>
							)}
						</div>
						{/* X-axis labels (every 4 hours) */}
						<div
							style={{
								display: "flex",
								flexDirection: "row",
								marginTop: 6,
							}}
						>
							{axisStops.map((s, idx) => (
								<div
									key={`a-${s.i}`}
									className="text-2xl font-bold uppercase"
									style={{
										width:
											idx === axisStops.length - 1
												? `${Math.round(((CHART_W - s.i * stepX) / CHART_W) * 100)}%`
												: `${Math.round(((axisStops[idx + 1].i - s.i) * stepX / CHART_W) * 100)}%`,
										letterSpacing: "0.12em",
										color: idx === 0 ? "#FF0000" : "#000000",
									}}
								>
									{s.label}
								</div>
							))}
						</div>
					</div>
				</div>

				{/* ───── 5-Day Strip ───── */}
				<div className="flex flex-row" style={{ flex: 1, padding: "10px 24px" }}>
					{dailyList.map((d, i) => {
						const isToday = i === 0;
						return (
							<div
								key={`d-${i}-${d.label}`}
								className="flex flex-col items-center justify-between"
								style={{
									flex: 1,
									minWidth: 0,
									padding: "10px 6px",
									borderRight:
										i < dailyList.length - 1 ? "2px solid #000000" : "none",
								}}
							>
								<span
									className="text-3xl font-bold uppercase"
									style={{
										letterSpacing: "0.14em",
										color: isToday ? "#FF0000" : "#000000",
									}}
								>
									{d.label}
								</span>
								{weatherIcon(d.weatherCode, 96)}
								<div
									className="flex flex-row items-baseline"
									style={{ gap: 14 }}
								>
									<span
										className="tabular-nums font-inter"
										style={{
											fontWeight: 900,
											fontSize: "60px",
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
		</PreSatori>
	);
}
