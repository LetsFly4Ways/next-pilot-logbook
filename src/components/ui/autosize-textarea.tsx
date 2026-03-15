// https://ui.spectrumhq.in/docs/autosize-textarea
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useImperativeHandle } from "react";

interface UseAutosizeTextAreaProps {
  textAreaRef: React.RefObject<HTMLTextAreaElement | null>;
  minHeight?: number;
  maxHeight?: number;
  triggerAutoSize: string;
}

export const useAutosizeTextArea = ({
  textAreaRef,
  triggerAutoSize,
  maxHeight = Number.MAX_SAFE_INTEGER,
  minHeight = 0,
}: UseAutosizeTextAreaProps) => {
  const [init, setInit] = React.useState(true);
  React.useEffect(() => {
    // We need to reset the height momentarily to get the correct scrollHeight for the textarea
    const offsetBorder = 2;
    const textArea = textAreaRef.current;

    if (textArea) {
      if (init) {
        textArea.style.minHeight = `${minHeight + offsetBorder}px`;
        if (maxHeight > minHeight) {
          textArea.style.maxHeight = `${maxHeight}px`;
        }
        setInit(false);
      }
      textArea.style.height = `${minHeight + offsetBorder}px`;
      const scrollHeight = textArea.scrollHeight;
      // We then set the height directly, outside of the render loop
      // Trying to set this with state or a ref will product an incorrect value.
      if (scrollHeight > maxHeight) {
        textArea.style.height = `${maxHeight}px`;
      } else {
        textArea.style.height = `${scrollHeight + offsetBorder}px`;
      }
    }
  }, [textAreaRef, triggerAutoSize, init, minHeight, maxHeight]);
};

export type AutosizeTextAreaRef = {
  textArea: HTMLTextAreaElement;
  maxHeight: number;
  minHeight: number;
};

type AutosizeTextAreaProps = {
  maxHeight?: number;
  minHeight?: number;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const AutosizeTextarea = React.forwardRef<
  AutosizeTextAreaRef,
  AutosizeTextAreaProps
>(
  (
    {
      maxHeight = Number.MAX_SAFE_INTEGER,
      minHeight,
      className,
      onChange,
      value,
      rows,
      ...props
    }: AutosizeTextAreaProps,
    ref: React.Ref<AutosizeTextAreaRef>
  ) => {
    const textAreaRef = React.useRef<HTMLTextAreaElement | null>(null);
    const [triggerAutoSize, setTriggerAutoSize] = React.useState("");

    // Calculate minHeight from rows if minHeight not explicitly provided
    const computedMinHeight = React.useMemo(() => {
      if (minHeight !== undefined) return minHeight;
      if (rows !== undefined) {
        // Approximate: each row is ~24px (depends on line-height and font-size)
        // Adjust this multiplier based on your actual line-height
        return rows * 24;
      }
      return 26; // default fallback
    }, [minHeight, rows]);

    useAutosizeTextArea({
      textAreaRef: textAreaRef,
      triggerAutoSize: triggerAutoSize,
      maxHeight,
      minHeight: computedMinHeight,
    });

    useImperativeHandle(ref, () => ({
      textArea: textAreaRef.current as HTMLTextAreaElement,
      focus: () => textAreaRef?.current?.focus(),
      maxHeight,
      minHeight: computedMinHeight,
    }));

    React.useEffect(() => {
      setTriggerAutoSize(value as string);
    }, [props?.defaultValue, value]);

    return (
      <textarea
        {...props}
        value={value}
        ref={textAreaRef}
        className={cn(
          "flex w-full rounded-md bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:border-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onChange={(e) => {
          setTriggerAutoSize(e.target.value);
          onChange?.(e);
        }}
      />
    );
  }
);
AutosizeTextarea.displayName = "AutosizeTextarea";
