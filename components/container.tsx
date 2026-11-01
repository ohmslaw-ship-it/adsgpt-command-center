export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const base =
    "mx-auto w-full max-w-[1600px] px-5 md:px-8 lg:px-12";
  return (
    <div className={className ? `${base} ${className}` : base}>{children}</div>
  );
}
