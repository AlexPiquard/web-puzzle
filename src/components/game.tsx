import { useState } from "react";
import Puzzle from "@/puzzle/puzzle";
import { CancelButton } from "./cancel-button";
import type { CreateFormSchema } from "./create-form";
import CreateForm from "./create-form";
import PuzzleArea from "./puzzle-area";
import { ModeToggle } from "./ui/mode-toggle";

export function Game() {
	const [puzzle, setPuzzle] = useState<Puzzle>();

	const create = async (values: CreateFormSchema) => {
		try {
			const imageUrl = URL.createObjectURL(values.image);

			const puzzle = new Puzzle(imageUrl, values.pieces);
			await puzzle.createPieces();
			setPuzzle(puzzle);

			// TODO release the previously created URL when no longer needed
			// preview.onload = () => URL.revokeObjectURL(imageUrl);
		} catch (error) {
			console.error(error);
		}
	};

	const cancel = () => {
		if (!puzzle) return;
		setPuzzle(undefined);
	};

	return (
		<>
			<div className="flex flex-row justify-between items-center max-w-lg w-full">
				<h1 className="text-5xl font-bold my-4 leading-tight">Puzzle</h1>
				<div className="flex flex-row justify-center gap-x-4">
					<ModeToggle />
					{puzzle && <CancelButton onClick={cancel} />}
				</div>
			</div>
			{!puzzle && (
				<div className="mt-64 mx-auto w-full max-w-lg text-left">
					<CreateForm onSubmit={create} />
				</div>
			)}
			{puzzle && <PuzzleArea puzzle={puzzle} />}
		</>
	);
}
