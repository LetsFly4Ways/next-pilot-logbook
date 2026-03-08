"use client";

import { useRef, useState } from "react";

import { useFormContext, FieldValues, Path, PathValue } from "react-hook-form";
import { formatTime, timeToMinutes } from "@/lib/time-utils";
import { cn } from "@/lib/utils";

import { Field } from "@/components/ui/field";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { AutosizeTextarea } from "@/components/ui/autosize-textarea";
import { PositionedItem } from "@/components/ui/positioned-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

import { ChevronRight, ChevronsUpDown, Eye, EyeOff } from "lucide-react";

// ============================================================================
// UNIVERSAL FIELD COMPONENTS
// ============================================================================

interface BaseFieldProps<T extends FieldValues> {
	name: Path<T>;
	label: string;
	isLoading?: boolean;
	disabled?: boolean;
	required?: boolean;
}

// TEXT INPUT FIELD
interface TextFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
	type?: "text" | "email" | "tel" | "number" | "password" | "url";
	placeholder?: string;
}

export function TextField<T extends FieldValues>({
	name,
	label,
	isLoading,
	required = false,
	disabled = false,
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
			render={({ field, fieldState }) => (
				<Field>
					<PositionedItem
						invalid={!!fieldState.error}
						className="p-3 flex items-center justify-between"
					>
						<span className="text-sm font-medium w-36">
							{label}
							{required && <span className="text-destructive ml-1">*</span>}
						</span>
						<div className="w-full ml-10 flex flex-col gap-1">
							<Input
								{...field}
								type={type}
								placeholder={
									fieldState.error?.message
										? fieldState.error.message
										: placeholder
								}
								value={field.value ?? ""}
								required={required}
								disabled={disabled}
								className={cn(
									"w-full h-fit py-0 border-none dark:bg-transparent focus-visible:border-none focus-visible:ring-0 shadow-none text-right text-sm",
									fieldState.error && "placeholder:text-destructive placeholder:font-normal"
								)}
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

// PASSWORD INPUT
interface PasswordFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
	placeholder?: string;
}

export function PasswordField<T extends FieldValues>({
	name,
	label,
	isLoading,
	required = false,
	disabled = false,
	placeholder,
}: PasswordFieldProps<T>) {
	const form = useFormContext<T>();
	const [showPassword, setShowPassword] = useState(false);

	if (isLoading) {
		return (
			<PositionedItem className="py-2">
				<Skeleton className="h-12 w-full" />
			</PositionedItem>
		);
	}

	const toggleVisibility = () => setShowPassword((prev) => !prev);

	return (
		<FormField
			control={form.control}
			name={name}
			render={({ field }) => (
				<Field>
					<PositionedItem className="p-3 flex items-center justify-between">
						{/* Label Side */}
						<span className="text-sm font-medium w40 shrink-0">
							{label}
							{required && <span className="text-destructive ml-1">*</span>}
						</span>

						{/* Input Side */}
						<div className="w-full ml-10 flex items-center gap-2">
							<Input
								{...field}
								type={showPassword ? "text" : "password"}
								placeholder={placeholder}
								value={field.value ?? ""}
								required={required}
								disabled={disabled}
								className="w-full h-fit py-0 border-none dark:bg-transparent focus-visible:border-none focus-visible:ring-0 shadow-none text-right text-sm"
							/>

							{/* Toggle Button */}
							<button
								type="button"
								onClick={toggleVisibility}
								disabled={disabled}
								className="text-muted-foreground hover:text-foreground transition-colors outline-none focus:ring-0"
								tabIndex={-1} // Prevents tab-key focus for smoother form navigation
							>
								{showPassword ? (
									<Eye className="size-4" />
								) : (
									<EyeOff className="size-4" />
								)}
							</button>
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
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
					<PositionedItem
						invalid={!!fieldState.error}
						className="p-3 flex items-center justify-between"
					>
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
								className={cn(
									"w-full h-fit py-0 border-none dark:bg-transparent focus-visible:border-none focus-visible:ring-0 shadow-none text-right text-sm",
									fieldState.error && !field.value && "text-destructive"
								)}
								onChange={(e) => {
									const raw = e.target.value;

									if (debounceRef.current) clearTimeout(debounceRef.current);

									debounceRef.current = setTimeout(() => {
										const parsed = new Date(raw);
										if (!raw || isNaN(parsed.getTime())) return;
										field.onChange(parsed.toISOString().split("T")[0]);
									}, 100);
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
					<PositionedItem
						invalid={!!fieldState.error}
						className="p-3 flex items-center justify-between"
					>
						<span className="text-sm font-medium w-36">
							{label}
							{required && <span className="text-destructive ml-1">*</span>}
						</span>
						<div className="flex flex-col items-center gap-x-3 gap-y-1">
							<Input
								{...field}
								type={"time"}
								placeholder={
									fieldState.error?.message
										? fieldState.error.message
										: placeholder
								}
								value={formatTime(field.value ?? 0, "HH:mm", { showZero: true })}
								required={required}
								className={cn(
									"w-full h-fit py-0 border-none dark:bg-transparent focus-visible:border-none focus-visible:ring-0 shadow-none text-right text-sm",
									fieldState.error && "placeholder:text-destructive placeholder:font-normal"
								)}
								onChange={(e) => {
									const value = e.target.value;
									field.onChange(timeToMinutes(value));
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

	const referenceMinutes = referenceMinutesField
		? (form.watch(referenceMinutesField) as number)
		: null;

	const currentValue = form.watch(name) as number;

	const shouldShowButton =
		referenceMinutes &&
		referenceMinutes > 0 &&
		(!currentValue || currentValue === 0) &&
		!isFocused;

	const handleSetFromReference = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (referenceMinutes) {
			form.setValue(name, referenceMinutes as PathValue<T, Path<T>>, {
				shouldValidate: true,
			});
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
					<PositionedItem
						invalid={!!fieldState.error}
						className="p-3 flex items-center justify-between"
					>
						<span className="text-sm font-medium w-36 shrink-0">
							{label}
							{required && <span className="text-destructive ml-1">*</span>}
						</span>
						<div className="flex flex-col items-center gap-x-3 gap-y-1">
							{shouldShowButton ? (
								// Button state: no value yet and a reference exists.
								// Error isn't shown here since the button itself is the
								// call-to-action — the row border strip is enough signal.
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={handleSetFromReference}
									className={cn(
										"h-fit py-1 px-3 text-sm hover:bg-background/30 cursor-pointer",
										// Tint the button border red when invalid so it's obvious
										// even in this "pre-fill" state
										fieldState.error && "border-destructive/60 text-destructive"
									)}
								>
									+{formatTime(referenceMinutes!, "HH:mm")}
								</Button>
							) : (
								<Input
									type="time"
									// Error message as placeholder when field is empty
									placeholder={fieldState.error?.message ?? placeholder}
									value={formatTime(field.value ?? 0, "HH:mm", { showZero: true })}
									required={required}
									className={cn(
										"h-fit px-3 py-1 border dark:bg-transparent focus-visible:border-none focus-visible:ring-0 shadow-none justify-items-end text-right text-sm cursor-pointer min-w-16 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none",
										// Stable border so no layout shift between states
										fieldState.error
											? "border-destructive/60 placeholder:text-destructive placeholder:text-xs placeholder:font-normal"
											: "border-transparent"
									)}
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
							)}
						</div>
					</PositionedItem>
				</Field>
			)}
		/>
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
			render={({ field, fieldState }) => (
				<Field>
					<PositionedItem
						invalid={!!fieldState.error}
						className="p-3 flex items-center justify-between"
					>
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
			render={({ field, fieldState }) => (
				<Field>
					<PositionedItem
						invalid={!!fieldState.error}
						className="p-3 flex items-center justify-between">
						<span className="text-sm font-medium w-36">
							{label}
							{required && <span className="text-destructive ml-1">*</span>}
						</span>
						<div className="w-full ml-10 flex items-center justify-end">
							<select
								{...field}
								className={cn(
									"appearance-none rounded-md w-full max-w-48 bg-transparent text-sm pr-8 py-1 border-none focus:ring-0 focus:border-none",
									field.value && field.value !== ""
										? "text-foreground"
										: fieldState.error
											? "text-destructive"
											: "text-muted-foreground"
								)}
								style={{ textAlignLast: "right" }}
								value={field.value ?? ""}
								onChange={(e) => field.onChange(e.target.value || undefined)}
							>
								<option value="" disabled>
									{fieldState.error?.message ?? placeholder}
								</option>
								{options.map((opt) => (
									<option key={opt.value} value={opt.value}>
										{opt.label}
									</option>
								))}
							</select>
							<ChevronsUpDown className="absolute right-3 w-4 h-4 pointer-events-none text-muted-foreground" />
						</div>
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
			render={({ field, fieldState }) => (
				<Field>
					<PositionedItem
						role="button"
						invalid={!!fieldState.error}
						className="p-3 flex items-center justify-between cursor-pointer hover:bg-muted/50"
						onClick={onOpenDialog}
					>
						<span className="text-sm font-medium w-36">
							{label}
							{required && <span className="text-destructive ml-1">*</span>}
						</span>
						<div className="w-full ml-10 flex items-center justify-end gap-2 mr-2">
							<span
								className={cn(
									"text-sm text-right truncate",
									!field.value && fieldState.error
										? "text-destructive text-xs"
										: !field.value
											? "text-muted-foreground"
											: "text-foreground"
								)}
							>
								{field.value
									? field.value
									: fieldState.error?.message
										? fieldState.error.message
										: placeholder}
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
interface ObjectDialogSelectFieldProps<T extends FieldValues, TObject extends object> {
	name: Path<T>;
	label: string;
	isLoading?: boolean;
	onOpenDialog: () => void;
	placeholder?: string;
	required?: boolean;
	displayValue: (value: TObject | null | undefined) => string | null;
}

export function ObjectDialogSelectField<T extends FieldValues, TObject extends object>({
	name,
	label,
	isLoading,
	onOpenDialog,
	placeholder = "Select",
	required = false,
	displayValue,
}: ObjectDialogSelectFieldProps<T, TObject>) {
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
			render={({ field, fieldState }) => {
				const display = displayValue(field.value as TObject | null | undefined);
				const hasValue = display !== null && display !== "";

				return (
					<Field>
						<PositionedItem
							role="button"
							invalid={!!fieldState.error}
							className="p-3 flex items-center justify-between cursor-pointer hover:bg-muted/50 w-full overflow-hidden" // Added w-full and overflow-hidden
							onClick={onOpenDialog}
						>
							<span className="text-sm font-medium w-36 shrink-0"> {/* Added shrink-0 to keep label width stable */}
								{label}
								{required && <span className="text-destructive ml-1">*</span>}
							</span>

							{/* The container for the value needs min-w-0 to allow truncation */}
							<div className="min-w-0 flex-1 ml-4 flex items-center justify-end gap-2">
								<span
									className={cn(
										"text-sm text-right truncate",
										!hasValue && fieldState.error
											? "text-destructive text-xs"
											: !hasValue
												? "text-muted-foreground"
												: "text-foreground"
									)}
								>
									{hasValue
										? display
										: fieldState.error?.message
											? fieldState.error.message
											: placeholder}
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

// TEXTAREA FIELD
interface TextareaFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
	rows?: number;
	placeholder?: string;
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
			render={({ field, fieldState }) => (
				<Field>
					<PositionedItem
						invalid={!!fieldState.error}
						className="p-3 flex items-center justify-between min-h-12 h-fit"
					>
						<span className="text-sm font-medium w-36">
							{label}
							{required && <span className="text-destructive ml-1">*</span>}
						</span>
						<div className="flex flex-col items-center w-full gap-x-3 gap-y-1">
							<AutosizeTextarea
								{...field}
								placeholder={fieldState.error?.message ?? placeholder}
								className={cn(
									"min-h-6 p-0 text-sm font-medium h-fit border-none rounded-sm bg-transparent dark:bg-transparent focus-visible:border-none focus-visible:ring-0 shadow-none w-full text-right resize-none",
									fieldState.error && "placeholder:text-destructive placeholder:font-normal"
								)}
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
