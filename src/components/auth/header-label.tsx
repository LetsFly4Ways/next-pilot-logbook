interface HeaderLabelProps {
  label: string;
}

export const HeaderLabel = ({ label }: HeaderLabelProps) => {
  return (
    <div className="flex flex-col space-y-2 text-center">
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
};
