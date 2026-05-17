// weather2 reuses weather's Open-Meteo fetcher verbatim. Both recipes
// hit the same API for the same coordinates, so sharing the unstable_cache
// key inside the original module is a feature: a single network request
// feeds both screens.

export type { HourlyForecast } from "../weather/getData";
export { default } from "../weather/getData";
