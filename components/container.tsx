export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const base =
    "mx-auto w-full max-w-[1280px] px-6 md:px-8 lg:px-10";
  return (
    <div className={className ? `${base} ${className}` : base}>{children}</div>
  );
}
