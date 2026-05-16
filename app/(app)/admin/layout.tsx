import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type React from "react";
import { auth } from "@/lib/auth/auth";

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// Mono-user mode (AUTH_ENABLED=false) has no session but the synthetic
	// user is implicitly admin — same model used by requireAdmin() in the
	// server actions, so admin pages are safe to render here too.
	if (!auth) {
		return <>{children}</>;
	}

	const session = await auth.api.getSession({
		headers: await headers(),
	});

	const userRole = (session?.user as { role?: string } | undefined)?.role;
	if (userRole !== "admin") {
		redirect("/");
	}

	return <>{children}</>;
}
