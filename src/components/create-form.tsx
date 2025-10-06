import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { Button } from "../components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";

const PIECES_ENUM = [9, 64, 100];

const imageSchema = z
	.instanceof(File, { message: "Image is required" })
	.refine((file) => file.size > 0 && file.name, {
		message: "Image is required",
	})
	.refine((file) => file.type.startsWith("image/"), {
		message: "Wrong file type, image required",
	})
	.refine((file) => !file || file.size !== 0 || file.size <= 5000000, {
		message: "Max size exceeded",
	});

const schema = z.object({
	image: imageSchema,
	pieces: z.union(PIECES_ENUM.map((i) => z.literal(i))),
});
export type CreateFormSchema = z.infer<typeof schema>;

export default function CreateForm({
	onSubmit,
	className,
}: {
	onSubmit: (values: CreateFormSchema) => void;
	className?: string;
}) {
	const form = useForm<CreateFormSchema>({
		resolver: zodResolver(schema),
		defaultValues: { pieces: PIECES_ENUM[0] },
	});

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className={`flex flex-col gap-y-4 ${className}`}
			>
				<FormField
					control={form.control}
					name="image"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Image</FormLabel>
							<FormControl>
								<Input
									type="file"
									accept="image/*"
									name={field.name}
									onBlur={field.onBlur}
									onChange={(e) => {
										const file = e.target.files?.[0];
										field.onChange(file);
									}}
								/>
							</FormControl>
							<FormDescription>Select an image for the puzzle</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="pieces"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Number of pieces</FormLabel>
							<FormControl>
								<RadioGroup
									onValueChange={(value) => {
										field.onChange(parseInt(value, 10));
									}}
									defaultValue={field.value.toString()}
									className="flex flex-row gap-16"
								>
									{PIECES_ENUM.map((i) => (
										<FormItem className="flex flex-row" key={i}>
											<FormControl>
												<RadioGroupItem value={i.toString()} />
											</FormControl>
											<FormLabel>{i}</FormLabel>
										</FormItem>
									))}
								</RadioGroup>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit" className="mt-8">
					Generate puzzle
				</Button>
			</form>
		</Form>
	);
}
