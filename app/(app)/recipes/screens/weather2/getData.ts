// weather2 shares weather's Open-Meteo fetcher (and its unstable_cache
// key) — both screens hit the same API for the same coordinates, so a
// single network request feeds both screens.
export type { DailyForecast, HourlyForecast } from "../weather/getData";

export { default } from "../weather/getData";
