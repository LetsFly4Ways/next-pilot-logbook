"use client";

import { useEffect, useState } from "react";
import { useFormContext, FieldValues, Path, PathValue } from "react-hook-form";

import { Field } from "@/components/ui/field";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { AutosizeTextarea } from "@/components/ui/autosize-textarea";
import { PositionedItem } from "@/components/ui/positioned-group";
import { Skeleton } from "@/components/ui/skeleton";

import { ChevronRight, ChevronsUpDown } from "lucide-react";
import { formatTime, timeToMinutes } from "@/lib/date-utils";
import { Button } from "./button";

// ============================================================================
// UNIVERSAL FIELD COMPONENTS
// ============================================================================

interface BaseFieldProps<T extends FieldValues> {
	name: Path<T>;
	label: string;
	isLoading?: boolean;
}

// TEXT INPUT FIELD
interface TextFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
	required?: boolean;
	type?: "text" | "email" | "tel" | "number" | "password" | "url";
	placeholder?: string;
}

export function TextField<T extends FieldValues>({
	name,
	label,
	isLoading,
	required = false,
	type = "text",
	placeholder,
}: TextFieldProps<T>) {
	const form = useFormContext<T>();

	if (isLoading) {
		return (
			<PositionedItem className="py-2">
				<Skeleton className="h-12 w-full" />
			</PositionedItem>
		);
	}

	return (
		<FormField
			control={form.control}
			name={name}
			render={({ field }) => (
				<Field>
					<PositionedItem className="p-3 flex items-center justify-between">
						<span className="text-sm font-medium w-36">
							{label}
							{required && <span className="text-destructive ml-1">*</span>}
						</span>
						<div className="w-full ml-10 flex flex-col gap-1">
							<Input
								{...field}
								type={type}
								placeholder={placeholder}
								value={field.value ?? ""}
								required={required}
								className="w-full h-fit py-0 border-none dark:bg-transparent focus-visible:border-none focus-visible:ring-0 shadow-none text-right text-sm"
								onChange={(e) => {
									const value =
										type === "number"
											? e.target.value === ""
												? 0
												: parseFloat(e.target.value)
											: e.target.value;
									field.onChange(value);
								}}
							/>
						</div>
					</PositionedItem>
				</Field>
			)}
		/>
	);
}

// DATE FIELD
interface DateFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
	placeholder?: string;
	required?: boolean;
}

export function DateField<T extends FieldValues>({
	name,
	label,
	isLoading,
	placeholder = "Date",
	required = false,
}: DateFieldProps<T>) {
	const form = useFormContext<T>();

	if (isLoading) {
		return (
			<PositionedItem className="py-2">
				<Skeleton className="h-12 w-full" />
			</PositionedItem>
		);
	}

	return (
		<FormField
			control={form.control}
			name={name}
			render={({ field }) => (
				<Field>
					<PositionedItem className="p-3 flex items-center justify-between">
						<span className="text-sm font-medium w-36">
							{label}
							{required && <span className="text-destructive ml-1">*</span>}
						</span>
						<div className="ml-10 flex flex-col gap-1 mr-2">
							<input
								{...field}
								type={"date"}
								placeholder={placeholder}
								value={field.value ?? ""}
								required={required}
								className="w-full h-fit py-0 border-none dark:bg-transparent focus-visible:border-none focus-visible:ring-0 shadow-none text-right text-sm cursor-pointer"
								onChange={(e) => {
									const value = e.target.value;
									field.onChange(value);
								}}
								disabled={isLoading}
							/>
						</div>
					</PositionedItem>
				</Field>
			)}
		/>
	);
}

interface TimeInputFieldProps<T extends FieldValues> {
	name: Path<T>;
	label: string;
	isLoading?: boolean;
	required?: boolean;
	placeholder?: string;
}

export function TimeInputField<T extends FieldValues>({
	name,
	label,
	isLoading,
	required = false,
	placeholder,
}: TimeInputFieldProps<T>) {
	const form = useFormContext<T>();

	if (isLoading) {
		return (
			<PositionedItem className="py-2">
				<Skeleton className="h-12 w-full" />
			</PositionedItem>
		);
	}

	return (
		<FormField
			control={form.control}
			name={name}
			render={({ field, fieldState }) => (
				<Field>
					<PositionedItem className="p-3 flex items-center justify-between">
						<span className="text-sm font-medium w-36">
							{label}
							{required && <span className="text-destructive ml-1">*</span>}
						</span>
						<div className="ml-10 items-end w-full flex flex-col gap-1 mr-2">
							<Input
								{...field}
								type={"time"}
								placeholder={placeholder}
								value={formatTime(field.value ?? 0, "HH:mm", { showZero: true })}
								required={required}
								className="w-2/3 h-fit px-3 py-1 border-none dark:bg-transparent focus-visible:border-none focus-visible:ring-0 shadow-none justify-items-end text-right text-sm cursor-pointer min-w-16 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
								onChange={(e) => {
									const value = e.target.value;
									field.onChange(timeToMinutes(value));
								}}
								disabled={isLoading}
							/>

							{fieldState.error && (
								<span className="text-right text-xs text-red-500 mt-1">
									{fieldState.error.message}
								</span>
							)}
						</div>
					</PositionedItem>
				</Field>
			)}
		/>
	);
}

// DURATION TIME INPUT
interface DurationInputFieldProps<T extends FieldValues> {
	name: Path<T>;
	label: string;
	isLoading?: boolean;
	required?: boolean;
	placeholder?: string;
	referenceMinutesField?: Path<T>; // Field to get the reference duration from (e.g., "total_block_minutes")
}

export function DurationInputField<T extends FieldValues>({
	name,
	label,
	isLoading,
	required = false,
	placeholder,
	referenceMinutesField,
}: DurationInputFieldProps<T>) {
	const form = useFormContext<T>();
	const [isFocused, setIsFocused] = useState(false);

	// Get the reference duration value
	const referenceMinutes = referenceMinutesField
		? (form.watch(referenceMinutesField) as number)
		: null;

	// Get current field value
	const currentValue = form.watch(name) as number;

	// Show button only if: reference exists, field is 0, and field is NOT focused
	const shouldShowButton =
		referenceMinutes &&
		referenceMinutes > 0 &&
		(!currentValue || currentValue === 0) &&
		!isFocused;

	const handleSetFromReference = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (referenceMinutes) {
			form.setValue(name, referenceMinutes as PathValue<T, Path<T>>, { shouldValidate: true });
		}
	};

	if (isLoading) {
		return (
			<PositionedItem className="py-2">
				<Skeleton className="h-12 w-full" />
			</PositionedItem>
		);
	}

	return (
		<FormField
			control={form.control}
			name={name}
			render={({ field, fieldState }) => (
				<Field>
					<PositionedItem className="p-3 flex items-center justify-between">
						<span className="text-sm font-medium w-36">
							{label}
							{required && <span className="text-destructive ml-1">*</span>}
						</span>
						<div className="ml-10 items-end w-full flex flex-col gap-1 mr-2">
							{shouldShowButton ? (
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={handleSetFromReference}
									className="h-fit py-1 px-3 text-sm hover:bg-background/30 cursor-pointer"
								>
									+{formatTime(referenceMinutes!, "HH:mm")}
								</Button>
							) : (
								<>
									<Input
										type="time"
										placeholder={placeholder}
										value={formatTime(field.value ?? 0, "HH:mm", { showZero: true })}
										required={required}
										className="w-2/3 h-fit px-3 py-1 border-none dark:bg-transparent focus-visible:border-none focus-visible:ring-0 shadow-none justify-items-end text-right text-sm cursor-pointer min-w-16 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
										onChange={(e) => {
											const minutes = timeToMinutes(e.target.value);
											field.onChange(minutes);
										}}
										onFocus={() => setIsFocused(true)}
										onBlur={() => {
											setIsFocused(false);
											field.onBlur();
										}}
										disabled={isLoading}
									/>

									{fieldState.error && (
										<span className="text-xs text-red-500 mt-1">
											{fieldState.error.message}
										</span>
									)}
								</>
							)}
						</div>
					</PositionedItem>
				</Field>
			)} />
	);
}

// SWITCH FIELD (BOOLEAN)
export function SwitchField<T extends FieldValues>({
	name,
	label,
	isLoading,
}: BaseFieldProps<T>) {
	const form = useFormContext<T>();

	if (isLoading) {
		return (
			<PositionedItem className="py-2">
				<Skeleton className="h-12 w-full" />
			</PositionedItem>
		);
	}

	return (
		<FormField
			control={form.control}
			name={name}
			render={({ field }) => (
				<Field>
					<PositionedItem className="p-3 flex items-center justify-between">
						<span className="text-sm font-medium w-36">{label}</span>
						<div className="w-full ml-10 flex flex-col gap-1 items-end">
							<Switch
								className="cursor-pointer mr-2 h-6 w-11 data-[state=checked]:bg-green-500"
								thumbClassName="h-5 w-5 data-[state=checked]:translate-x-5"
								checked={Boolean(field.value)}
								onCheckedChange={field.onChange}
							/>
						</div>
					</PositionedItem>
				</Field>
			)}
		/>
	);
}

// SELECT FIELD (SMALL OPTIONS)
interface SelectFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
	options: { label: string; value: string }[];
	placeholder?: string;
	required?: boolean;
}

export function SelectField<T extends FieldValues>({
	name,
	label,
	isLoading,
	options,
	placeholder = "Select",
	required = false,
}: SelectFieldProps<T>) {
	const form = useFormContext<T>();

	if (isLoading) {
		return (
			<PositionedItem className="py-2">
				<Skeleton className="h-12 w-full" />
			</PositionedItem>
		);
	}

	return (
		<FormField
			control={form.control}
			name={name}
			render={({ field }) => (
				<Field>
					<PositionedItem className="p-3 flex items-center justify-between">
						<span className="text-sm font-medium w-36">
							{label}
							{required && <span className="text-destructive ml-1">*</span>}
						</span>
						<div className="w-full ml-10 flex items-center justify-end ">
							{/* <div className="relative flex items-center justify-end"> */}
							<select
								{...field}
								className={`appearance-none rounded-md w-full max-w-48 bg-transparent text-sm pr-8 py-1 border-none focus:ring-0 focus:border-none ${field.value && field.value !== ""
									? "text-foreground"
									: "text-muted-foreground"
									}`}
								style={{ textAlignLast: "right" }}
								value={field.value ?? ""}
								onChange={(e) => field.onChange(e.target.value || undefined)}
							>
								<option value="" disabled>
									{placeholder}
								</option>
								{options.map((opt) => (
									<option key={opt.value} value={opt.value}>
										{opt.label}
									</option>
								))}
							</select>
							<ChevronsUpDown className="absolute right-2 w-4 h-4 pointer-events-none text-muted-foreground" />
						</div>
						{/* </div> */}
					</PositionedItem>
				</Field>
			)}
		/>
	);
}

// DIALOG SELECT FIELD (LARGE OPTIONS - Opens Modal/Dialog)
interface DialogSelectFieldProps<T extends FieldValues>
	extends BaseFieldProps<T> {
	onOpenDialog: () => void;
	placeholder?: string;
	required?: boolean;
}

export function DialogSelectField<T extends FieldValues>({
	name,
	label,
	isLoading,
	onOpenDialog,
	placeholder = "Select",
	required = false,
}: DialogSelectFieldProps<T>) {
	const form = useFormContext<T>();

	if (isLoading) {
		return (
			<PositionedItem className="py-2">
				<Skeleton className="h-12 w-full" />
			</PositionedItem>
		);
	}

	return (
		<FormField
			control={form.control}
			name={name}
			render={({ field }) => (
				<Field>
					<PositionedItem
						role="button"
						className="p-3 flex items-center justify-between cursor-pointer hover:bg-muted/50"
						onClick={onOpenDialog}
					>
						<span className="text-sm font-medium w-36">
							{label}
							{required && <span className="text-destructive ml-1">*</span>}
						</span>
						<div className="w-full ml-10 flex items-center justify-end gap-2 mr-2">
							<span className="text-sm text-right truncate">
								{field.value || (
									<span className="text-muted-foreground">{placeholder}</span>
								)}
							</span>
							<ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
						</div>
					</PositionedItem>
				</Field>
			)}
		/>
	);
}

// OBJECT DIALOG SELECT FIELD (Stores object, displays formatted value)
interface ObjectDialogSelectFieldProps<T extends FieldValues, V> {
	name: Path<T>;
	label: string;
	isLoading?: boolean;
	onOpenDialog: () => void;
	placeholder?: string;
	required?: boolean;
	displayValue: (value: V | null | undefined) => string | null;
}

export function ObjectDialogSelectField<T extends FieldValues, V>({
	name,
	label,
	isLoading,
	onOpenDialog,
	placeholder = "Select",
	required = false,
	displayValue,
}: ObjectDialogSelectFieldProps<T, V>) {
	const form = useFormContext<T>();

	if (isLoading) {
		return (
			<PositionedItem className="py-2">
				<Skeleton className="h-12 w-full" />
			</PositionedItem>
		);
	}

	return (
		<FormField
			control={form.control}
			name={name}
			render={({ field }) => {
				const display = displayValue(field.value as V);

				return (
					<Field>
						<PositionedItem
							role="button"
							className="p-3 flex items-center justify-between cursor-pointer hover:bg-muted/50"
							onClick={onOpenDialog}
						>
							<span className="text-sm font-medium w-36">
								{label}
								{required && <span className="text-destructive ml-1">*</span>}
							</span>
							<div className="w-full ml-10 flex items-center justify-end gap-2 mr-2">
								<span className="text-sm text-right truncate">
									{display || (
										<span className="text-muted-foreground">{placeholder}</span>
									)}
								</span>
								<ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
							</div>
						</PositionedItem>
					</Field>
				);
			}}
		/>
	);
}

interface AsyncDialogSelectFieldProps<T extends FieldValues> {
	name: Path<T>;
	label: string;
	isLoading?: boolean;
	onOpenDialog: () => void;
	placeholder?: string;
	required?: boolean;
	fetchDisplayValue: (id: string) => Promise<string | null>;
}

// Async Dialog Select Field
export function AsyncDialogSelectField<T extends FieldValues>({
	name,
	label,
	isLoading,
	onOpenDialog,
	placeholder = "Select",
	required = false,
	fetchDisplayValue,
}: AsyncDialogSelectFieldProps<T>) {
	const form = useFormContext<T>();
	const fieldValue = form.watch(name);
	const [displayValue, setDisplayValue] = useState<string | null>(null);
	const [isFetching, setIsFetching] = useState(false);

	useEffect(() => {
		if (!fieldValue || typeof fieldValue !== "string") {
			setDisplayValue(null);
			return;
		}

		let cancelled = false;

		async function loadDisplayValue() {
			setIsFetching(true);
			try {
				const value = await fetchDisplayValue(fieldValue as string);
				if (!cancelled) {
					setDisplayValue(value);
				}
			} catch (error) {
				console.error("Error fetching display value:", error);
				if (!cancelled) {
					setDisplayValue(null);
				}
			} finally {
				if (!cancelled) {
					setIsFetching(false);
				}
			}
		}

		loadDisplayValue();

		return () => {
			cancelled = true;
		};
	}, [fieldValue, fetchDisplayValue]);

	if (isLoading) {
		return (
			<PositionedItem className="py-2">
				<Skeleton className="h-12 w-full" />
			</PositionedItem>
		);
	}

	return (
		<FormField
			control={form.control}
			name={name}
			render={() => (
				<Field>
					<PositionedItem
						role="button"
						className="p-3 flex items-center justify-between cursor-pointer hover:bg-muted/50"
						onClick={onOpenDialog}
					>
						<span className="text-sm font-medium w-36">
							{label}
							{required && <span className="text-destructive ml-1">*</span>}
						</span>
						<div className="w-full ml-10 flex items-center justify-end gap-2 mr-2">
							{isFetching ? (
								<Skeleton className="h-4 w-32" />
							) : (
								<span className="text-sm text-right truncate">
									{displayValue || (
										<span className="text-muted-foreground">{placeholder}</span>
									)}
								</span>
							)}
							<ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
						</div>
					</PositionedItem>
				</Field>
			)}
		/>
	);
}

// TEXTAREA FIELD
interface TextareaFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
	rows?: number;
	placeholder?: string;
	required?: boolean;
}

export function TextareaField<T extends FieldValues>({
	name,
	label,
	isLoading,
	rows = 2,
	placeholder,
	required = false,
}: TextareaFieldProps<T>) {
	const form = useFormContext<T>();

	if (isLoading) {
		return (
			<PositionedItem className="py-2">
				<Skeleton className="h-24 w-full" />
			</PositionedItem>
		);
	}

	return (
		<FormField
			control={form.control}
			name={name}
			render={({ field }) => (
				<Field>
					<PositionedItem className="p-3 flex items-center justify-between w-full h-fit">
						<span className="text-sm font-medium w-36">
							{label}
							{required && <span className="text-destructive ml-1">*</span>}
						</span>
						<div className="w-full ml-10 flex flex-col gap-1">
							<AutosizeTextarea
								{...field}
								placeholder={placeholder}
								className="min-h-6 p-0 text-sm font-medium h-fit border-none rounded-sm bg-transparent dark:bg-transparent focus-visible:border-none focus-visible:ring-0 shadow-none w-full text-right resize-none"
								rows={rows}
								value={field.value || ""}
								required={required}
							/>
						</div>
					</PositionedItem>
				</Field>
			)}
		/>
	);
}
