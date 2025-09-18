import React from "react";
import { loadLayoutManifest, validateLayoutManifest } from "./layoutManifest";
import { SlotContainer } from "./SlotContainer";

export function LayoutEngine() {
	const [manifest, setManifest] = React.useState<any | null>(null);
	const [failed, setFailed] = React.useState(false);

	React.useEffect(() => {
		// Guard for non-browser environments (SSR/tests)
		if (typeof window === "undefined") return;
		let alive = true;
		loadLayoutManifest()
			.then((m: any) => {
				if (!alive) return;
				if (!m) {
					setFailed(true);
					return;
				}
				validateLayoutManifest(m); // ESLint rule expects this call
				setManifest(m);
			})
			.catch((e: any) => {
				console.error(e);
				if (alive) setFailed(true);
			});
		return () => {
			alive = false;
		};
	}, []);

	// If manifest failed to load, render legacy fallback internally
	if (failed) {
		return (
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "320px 1fr 360px",
					height: "100vh",
				}}
			>
				<div data-slot="library" style={{ position: "relative" }}>
					<SlotContainer slot="library" />
				</div>
				<div data-slot="canvas" style={{ position: "relative" }}>
					<SlotContainer slot="canvas" capabilities={{ droppable: true }} />
				</div>
				<div data-slot="controlPanel" style={{ position: "relative" }}>
					<SlotContainer slot="controlPanel" />
				</div>
			</div>
		);
	}

	// If no manifest yet, render container only (satisfies responsive test container query)
	if (!manifest)
		return <div data-layout-container style={{ display: "grid" }} />;

	// Grid-based layout (Option A)
	const layout = manifest.layout || {};
	let cols: string[] = layout.columns || [];
	let rows: string[] = layout.rows || [];
	const areas: string[][] = layout.areas || [];

	// Apply first matching responsive override
	const resp = Array.isArray(layout.responsive) ? layout.responsive : [];
	for (const r of resp) {
		if (
			typeof matchMedia === "function" &&
			r.media &&
			matchMedia(r.media).matches
		) {
			cols = r.columns || cols;
			rows = r.rows || rows;
			break;
		}
	}

	const style: React.CSSProperties = {
		display: "grid",
		gridTemplateColumns: cols.join(" "),
		gridTemplateRows: rows.join(" "),
		height: "100vh", // Match legacy layout so grid cells fill viewport
	};

	// Map capabilities by slot name from manifest
	const capsBySlot: Record<string, { droppable?: boolean }> = {};
	try {
		const slots = Array.isArray(manifest.slots) ? manifest.slots : [];
		for (const s of slots) {
			const name = s?.name;
			if (!name) continue;
			const caps = s?.capabilities || {};
			capsBySlot[name] = { droppable: !!caps.droppable };
		}
	} catch {}

	return (
		<div data-layout-container style={style}>
			{areas.flatMap((row, rIdx) =>
				row.map((slotName, cIdx) => (
					<div
						key={`${rIdx}-${cIdx}`}
						data-slot={slotName}
						style={{
							gridRow: rIdx + 1,
							gridColumn: cIdx + 1,
							position: "relative",
						}}
					>
						<SlotContainer
							slot={slotName}
							capabilities={capsBySlot[slotName]}
						/>
					</div>
				))
			)}
		</div>
	);
}
