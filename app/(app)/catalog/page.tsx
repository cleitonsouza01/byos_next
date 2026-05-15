import { connection } from "next/server";
import {
	fetchCatalogResult,
	fetchTrmnlRecipesPage,
	isExternalCatalogEnabled,
} from "@/lib/catalog";
import { CatalogPage as CatalogClient } from "./catalog-grid";

export const metadata = {
	title: "Catalog",
	description: "Browse TRMNL official and community recipe catalogs.",
};

export default async function CatalogPage() {
	// Without this the page is partially-prerendered at build time, where
	// ENABLE_EXTERNAL_CATALOG isn't set — the resulting static HTML always
	// shows the "External catalog is disabled" state even after the env
	// is flipped at runtime. `connection()` defers render to request time.
	await connection();

	const [community, official] = await Promise.all([
		fetchCatalogResult(),
		fetchTrmnlRecipesPage(1),
	]);

	return (
		<CatalogClient
			communityEntries={community.entries}
			communityError={community.error}
			externalCatalogEnabled={isExternalCatalogEnabled()}
			officialEntries={official.recipes}
			officialError={official.error}
			officialNextPage={official.nextPage}
			officialTotal={official.total}
		/>
	);
}
