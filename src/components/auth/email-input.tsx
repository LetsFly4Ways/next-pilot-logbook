import { Controller, useFormContext } from "react-hook-form";

import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type EmailInputProps = {
  name?: string;
  placeholder?: string;
  disabled: boolean;
};

export function EmailInput({
  name = "email",
  placeholder = "name@email.com",
  disabled,
}: EmailInputProps) {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error: fieldError } }) => (
        <Field data-invalid={!!fieldError} className="gap-2">
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            {...field}
            disabled={disabled}
            placeholder={placeholder}
            type="email"
            aria-invalid={!!fieldError}
            className="text-sm"
          />
          {fieldError && <FieldError>{fieldError.message}</FieldError>}
        </Field>
      )}
    />
  );
}
