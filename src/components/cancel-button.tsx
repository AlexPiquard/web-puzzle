import { X } from "lucide-react";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export function CancelButton({
	onClick,
}: {
	onClick: React.MouseEventHandler<HTMLButtonElement>;
}) {
	return (
		<Tooltip>
			<TooltipTrigger>
				<Button variant="outline" size="icon" onClick={onClick}>
					<X />
				</Button>
			</TooltipTrigger>
			<TooltipContent>Close puzzle</TooltipContent>
		</Tooltip>
	);
}
