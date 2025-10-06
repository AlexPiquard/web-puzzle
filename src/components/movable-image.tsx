import { motion, type TargetAndTransition, useMotionValue } from "motion/react";
import { useEffect } from "react";
import type { Point } from "@/types/point";

function snapToClosest(
	{ x, y }: Point,
	anchors: Point[],
	threshold = 100,
): Point | null {
	if (!anchors.length || !(0 in anchors)) return null;
	let closest = anchors[0];
	let minDist = Math.hypot(x - closest.x, y - closest.y);
	anchors.forEach((pt) => {
		const dist = Math.hypot(x - pt.x, y - pt.y);
		if (dist < minDist) {
			closest = pt;
			minDist = dist;
		}
	});
	if (minDist <= threshold) return closest;
	return null;
}

export default function MovableImage({
	src,
	anchorPoints,
	initial,
	onMove,
	onSnap,
}: {
	key: string;
	src: string;
	anchorPoints: Point[];
	initial?: Point;
	onMove?: (src: string) => void;
	onSnap?: (src: string, point: Point) => void;
}) {
	const x = useMotionValue(initial?.x ?? 0);
	const y = useMotionValue(initial?.y ?? 0);

	// biome-ignore lint/correctness/useExhaustiveDependencies: useless
	useEffect(() => {
		if (!initial) return;
		x.set(initial.x);
		y.set(initial.y);
	}, [initial]);

	const onDragEnd = () => {
		const point = {
			x: x.get(),
			y: y.get(),
		};
		const snap = snapToClosest(point, anchorPoints);
		if (!snap) {
			onMove?.(src);
			return;
		}
		x.set(snap.x);
		y.set(snap.y);
		onSnap?.(src, snap);
	};

	return (
		<motion.img
			drag
			dragMomentum={false}
			initial={initial as TargetAndTransition}
			style={{ x, y }}
			onDragEnd={onDragEnd}
			key={src}
			src={src}
			className="absolute"
		/>
	);
}
