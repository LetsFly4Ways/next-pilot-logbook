import { useFormContext, Controller } from "react-hook-form";
import { useState } from "react";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { EyeIcon, EyeOffIcon } from "lucide-react";

type PasswordInputProps = {
  name?: string;
  placeholder?: string;
  disabled: boolean;
};

export function PasswordInput({
  name = "password",
  placeholder = "Password",
  disabled,
}: PasswordInputProps) {
  const { control } = useFormContext();
  const [passwordVisibility, setPasswordVisibility] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error: fieldError } }) => (
        <Field data-invalid={!!fieldError} className="gap-2">
          <FieldLabel htmlFor={name}>{placeholder}</FieldLabel>
          <div className="relative">
            <Input
              {...field}
              id={name}
              type={passwordVisibility ? "text" : "password"}
              autoComplete="on"
              disabled={disabled}
              placeholder={placeholder}
              aria-invalid={!!fieldError}
              className="text-sm"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:bg-transparent cursor-pointer"
              onClick={() => setPasswordVisibility(!passwordVisibility)}
              disabled={disabled}
            >
              {passwordVisibility ? (
                <EyeIcon className="h-4 w-4" aria-hidden="true" />
              ) : (
                <EyeOffIcon className="h-4 w-4" aria-hidden="true" />
              )}

              <span className="sr-only">
                {passwordVisibility ? "Hide password" : "Show password"}
              </span>
            </Button>
          </div>
          {fieldError && <FieldError>{fieldError.message}</FieldError>}
        </Field>
      )}
    />
  );
}
