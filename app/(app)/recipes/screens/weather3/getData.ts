// weather3 (Timeline Spine) reuses weather's Open-Meteo fetcher — both
// recipes hit the same API for the same coords, so the unstable_cache
// key dedupes the request and a single fetch feeds both screens.
export type { DailyForecast, HourlyForecast } from "../weather/getData";

export { default } from "../weather/getData";
