import { PreSatori } from "@/utils/pre-satori";

interface PictureProps {
	width?: number;
	height?: number;
	params?: {
		imageUrl?: string;
		fit?: "cover" | "contain";
	};
}

export default async function Picture({
	width = 800,
	height = 480,
	params,
}: PictureProps) {
	const imageUrl =
		params?.imageUrl ||
		"https://upload.wikimedia.org/wikipedia/commons/3/3a/Cat03.jpg";
	const fit = params?.fit === "contain" ? "contain" : "cover";

	return (
		<PreSatori width={width} height={height}>
			<div className="w-full h-full bg-white flex items-center justify-center">
				<img
					src={imageUrl}
					alt=""
					width={width}
					height={height}
					className="w-full h-full"
					style={{
						objectFit: fit,
						imageRendering: "pixelated",
					}}
				/>
			</div>
		</PreSatori>
	);
}
