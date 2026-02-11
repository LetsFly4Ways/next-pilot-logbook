export const MarkdownComponents = {
  h1: ({ ...props }) => (
    <h1 className="text-2xl font-bold tracking-tight mb-4 text-primary" {...props} />
  ),
  h2: ({ ...props }) => (
    <h2 className="text-xl font-semibold mt-8 mb-4 border-b pb-2" {...props} />
  ),
  p: ({ ...props }) => (
    <p className="leading-7 not-first:mt-6" {...props} />
  ),
  ul: ({ ...props }) => (
    <ul className="my-6 ml-6 list-disc [&>li]:mt-2" {...props} />
  ),
  a: ({ ...props }) => (
    <a className="font-medium text-primary underline underline-offset-4 hover:text-primary/80" {...props} />
  ),
  // You can even style code blocks
  code: ({ ...props }) => (
    <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold" {...props} />
  ),
};
