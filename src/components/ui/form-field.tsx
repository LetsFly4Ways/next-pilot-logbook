"use client";

import {
  Controller,
  type ControllerProps,
  type FieldValues,
} from "react-hook-form";

export function FormField<TFieldValues extends FieldValues>(
  props: ControllerProps<TFieldValues>
) {
  return <Controller {...props} />;
}
