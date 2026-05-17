import baseGetData from "../weather/getData";

// weather2 shares weather's Open-Meteo fetcher (and its unstable_cache
// key) — both screens hit the same API for the same coordinates, so a
// single network request feeds both. We wrap it here only to preserve
// the `layout` param through to the component, since the upstream
// fetcher discards anything it doesn't use.
export type { HourlyForecast } from "../weather/getData";

type Params = {
	location?: string;
	latitude?: number;
	longitude?: number;
	layout?: string;
};

export default async function getData(params?: Params) {
	const weather = await baseGetData(params);
	return {
		...weather,
		// Default to "chart" if no param is set (e.g. mono-user mode with
		// no per-screen overrides). The component clamps unknown values.
		layout: params?.layout ?? "chart",
	};
}
