import { TriangleAlert } from "lucide-react";

interface ErrorContainerProps {
  title: string;
  message?: string;
}

export const ErrorContainer = ({ title, message }: ErrorContainerProps) => {
  if (!message && !title) return null;

  return (
    <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-3 text-sm text-destructive">
      <TriangleAlert className="h-5 w-5" />
      <div className="flex-col gap-2">
        <h2 className="font-semibold">{title}</h2>
        <p>{message}</p>
      </div>
    </div>
  );
};
