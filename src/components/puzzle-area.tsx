import { useMemo, useState } from "react";
import type Puzzle from "../puzzle/puzzle";
import type { Point } from "../types/point";
import MovableImage from "./movable-image";

export default function PuzzleArea({ puzzle }: { puzzle: Puzzle }) {
	const anchorPoints = useMemo(() => puzzle.getAnchorPoints(), [puzzle]);
	const [initialPoints, setInitialPoints] = useState<Point[]>([]);

	const onRef = (div: HTMLDivElement) => {
		if (!div || initialPoints.length) return;
		const rect = div.getBoundingClientRect();
		setInitialPoints(
			puzzle.pieces.map(() => puzzle.getRandomPointOut(rect.x, rect.y)),
		);
	};

	return (
		<div
			ref={onRef}
			style={{ width: puzzle.width, height: puzzle.height }}
			className="bg-neutral-100 dark:bg-neutral-900 mt-4"
		>
			{puzzle.pieces.map((imageUrl, i) => (
				<MovableImage
					key={imageUrl}
					src={imageUrl}
					anchorPoints={anchorPoints}
					initial={initialPoints[i]}
					onMove={puzzle.onPieceMove.bind(puzzle)}
					onSnap={puzzle.onPiecePlace.bind(puzzle)}
				/>
			))}
		</div>
	);
}
