import confetti from "canvas-confetti";
import type { Point } from "@/types/point";

const IMAGE_WIDTH = 800;
const LEFT_ANGLE = Math.PI;
const RIGHT_ANGLE = 0;
const TOP_ANGLE = 1.5 * Math.PI;
const BOTTOM_ANGLE = 0.5 * Math.PI;
const CONFETTI_COLORS = ["#29cdff", "#78ff44", "#fdff6a", "#ff718d"];

export default class Puzzle {
	public pieces: string[];
	public width: number = 0;
	public height: number = 0;
	private piecesPerAxis: number;
	private newPieceSize: number = 0;
	private arcRadius: number = 0;
	private totalPieceSize: number = 0;
	private anchorPoints?: Map<Point, string>;
	private goodPieces: Set<string> = new Set();
	private finished: boolean = false;

	constructor(
		private imageUrl: string,
		piecesNumber: number,
	) {
		this.pieces = [];
		// TODO optimization
		this.piecesPerAxis = Math.sqrt(piecesNumber);
	}

	private onImageLoad(img: HTMLImageElement) {
		const pieceSize = Math.min(img.height, img.width) / this.piecesPerAxis;
		this.newPieceSize = IMAGE_WIDTH / this.piecesPerAxis;
		this.width = this.newPieceSize * this.piecesPerAxis;
		this.height = this.newPieceSize * this.piecesPerAxis;
		this.arcRadius = this.newPieceSize / 6;
		this.totalPieceSize = this.newPieceSize + 2 * this.arcRadius;
		const arcRealRadius = (this.arcRadius * pieceSize) / this.newPieceSize;

		// create hidden canvas
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		if (ctx == null) throw "created canvas context is null";
		canvas.width = this.newPieceSize + this.arcRadius * 2;
		canvas.height = this.newPieceSize + this.arcRadius * 2;

		// bitwise for right & bottom holes in pieces at y, x
		const holes: number[][] = [];

		for (let y = 0; y < this.piecesPerAxis; y++) {
			holes[y] = [];
			for (let x = 0; x < this.piecesPerAxis; x++) {
				const topHole = y > 0 ? ((holes[y - 1]?.[x] ?? 0) & 1) === 0 : null;
				const leftHole = x > 0 ? ((holes[y]?.[x - 1] ?? 0) & 2) === 0 : null;
				const bottomHole =
					y < this.piecesPerAxis - 1 ? this.randomBool() : null;
				const rightHole = x < this.piecesPerAxis - 1 ? this.randomBool() : null;

				// biome-ignore lint/correctness/noSelfAssign: usefull here ton reset path and image in canvas
				canvas.width = canvas.width;

				ctx.beginPath();
				ctx.moveTo(this.arcRadius, this.arcRadius);
				if (topHole != null) {
					ctx.lineTo(
						this.newPieceSize / 2 - this.arcRadius / 2,
						this.arcRadius,
					);
					ctx.arc(
						this.newPieceSize / 2 + this.arcRadius,
						this.arcRadius,
						this.arcRadius,
						LEFT_ANGLE,
						RIGHT_ANGLE,
						topHole,
					);
				}
				ctx.lineTo(this.newPieceSize + this.arcRadius, this.arcRadius);
				if (rightHole != null) {
					ctx.lineTo(this.newPieceSize + this.arcRadius, this.newPieceSize / 2);
					ctx.arc(
						this.arcRadius + this.newPieceSize,
						this.arcRadius + this.newPieceSize / 2,
						this.arcRadius,
						TOP_ANGLE,
						BOTTOM_ANGLE,
						rightHole,
					);
				}
				ctx.lineTo(
					this.arcRadius + this.newPieceSize,
					this.arcRadius + this.newPieceSize,
				);
				if (bottomHole != null) {
					ctx.lineTo(
						this.newPieceSize / 2 + this.arcRadius * 2,
						this.arcRadius + this.newPieceSize,
					);
					ctx.arc(
						this.arcRadius + this.newPieceSize / 2,
						this.newPieceSize + this.arcRadius,
						this.arcRadius,
						RIGHT_ANGLE,
						LEFT_ANGLE,
						bottomHole,
					);
				}
				ctx.lineTo(this.arcRadius, this.arcRadius + this.newPieceSize);
				if (leftHole != null) {
					ctx.lineTo(
						this.arcRadius,
						this.newPieceSize / 2 + this.arcRadius * 2,
					);
					ctx.arc(
						this.arcRadius,
						this.arcRadius + this.newPieceSize / 2,
						this.arcRadius,
						BOTTOM_ANGLE,
						TOP_ANGLE,
						leftHole,
					);
				}
				ctx.closePath();
				ctx.clip();

				// biome-ignore lint/style/noNonNullAssertion: not null
				holes[y]![x] = (bottomHole ? 1 : 0) | ((rightHole ? 1 : 0) << 1);

				const sourceX = x * pieceSize - arcRealRadius;
				const sourceY = y * pieceSize - arcRealRadius;
				const sourceWidth = pieceSize + arcRealRadius + arcRealRadius;
				const sourceHeight = pieceSize + arcRealRadius + arcRealRadius;

				ctx.drawImage(
					img,
					sourceX,
					sourceY,
					sourceWidth,
					sourceHeight,
					0,
					0,
					canvas.width,
					canvas.height,
				);

				const croppedDataUrl = canvas.toDataURL();
				this.pieces.push(croppedDataUrl);
			}
		}
	}

	public async createPieces(): Promise<void> {
		const img = new Image();
		img.src = this.imageUrl;
		await new Promise((res, rej) => {
			img.onload = () => {
				try {
					this.onImageLoad(img);
					res(null);
				} catch (_) {
					rej(null);
				}
			};
		});
	}

	public getAnchorPoints(): Point[] {
		if (!this.anchorPoints) {
			this.anchorPoints = new Map();
			const piecesIterator = this.pieces[Symbol.iterator]();
			for (let y = 0; y < this.piecesPerAxis; ++y) {
				for (let x = 0; x < this.piecesPerAxis; ++x) {
					const piece = piecesIterator.next();
					if (piece.done || !piece.value)
						return this.anchorPoints.keys().toArray();
					this.anchorPoints.set(
						{
							x: x * this.newPieceSize - this.arcRadius,
							y: y * this.newPieceSize - this.arcRadius,
						},
						piece.value,
					);
				}
			}
		}
		return this.anchorPoints.keys().toArray();
	}

	private randomLocIn(): number {
		return Math.floor(Math.random() * (IMAGE_WIDTH + 1));
	}

	private randomIntBetween(min: number, max: number): number {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	public getRandomPoint(): Point {
		const point = {
			x: this.randomLocIn(),
			y: this.randomLocIn(),
		};
		return point;
	}

	public getRandomPointOut(parentX: number, parentY: number): Point {
		const y = this.randomIntBetween(
			-parentY,
			window.innerHeight - this.totalPieceSize - parentY,
		);
		if (Math.random() > 0.5)
			return {
				x: this.randomIntBetween(-parentX, -this.totalPieceSize),
				y,
			};
		else
			return {
				x: this.randomIntBetween(
					IMAGE_WIDTH,
					window.innerWidth - this.totalPieceSize - parentX,
				),
				y,
			};
	}

	private randomBool(): boolean {
		return Math.random() >= 0.5;
	}

	public onPieceMove(src: string) {
		this.goodPieces.delete(src);
	}

	public onPiecePlace(src: string, point: Point) {
		if (!this.anchorPoints) return;
		const relatedSrc = this.anchorPoints.get(point);
		if (!relatedSrc || src !== relatedSrc) this.goodPieces.delete(src);
		else this.goodPieces.add(src);
		if (this.goodPieces.size === this.pieces.length) this.onFinish();
	}

	private onFinish() {
		if (this.finished) return;
		this.finished = true;

		const end = Date.now() + 1000;

		const frame = () => {
			if (Date.now() > end) return;

			confetti({
				particleCount: CONFETTI_COLORS.length,
				angle: 60,
				spread: 55,
				startVelocity: 60,
				origin: { x: 0, y: 0.5 },
				colors: CONFETTI_COLORS,
			});
			confetti({
				particleCount: CONFETTI_COLORS.length,
				angle: 120,
				spread: 55,
				startVelocity: 60,
				origin: { x: 1, y: 0.5 },
				colors: CONFETTI_COLORS,
			});

			requestAnimationFrame(frame);
		};

		frame();
	}
}
