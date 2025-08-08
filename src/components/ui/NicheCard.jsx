// NicheCard.jsx - shadcn/ui styled card for niche selection
export default function NicheCard({
  icon,
  title,
  description,
  selected,
  onClick,
}) {
  return (
    <button
      className={`group relative flex flex-col items-center justify-center border rounded-xl p-6 shadow-sm transition-all duration-200 
        bg-card hover:bg-card/80 hover:shadow-lg focus:ring-2 focus:ring-primary/50 outline-none w-40 h-40 m-2
        dark:bg-card dark:hover:bg-card/90 dark:border-border
        ${
          selected
            ? "border-primary ring-2 ring-primary/40 bg-primary/5 dark:bg-primary/10"
            : "border-border hover:border-primary/30"
        }`}
      onClick={onClick}
      aria-pressed={selected}
    >
      <span className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-200">
        {icon}
      </span>
      <span className="font-semibold text-lg mb-1 text-card-foreground dark:text-foreground">
        {title}
      </span>
      <span className="text-xs text-muted-foreground text-center leading-tight">
        {description}
      </span>
      {selected && (
        <span className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs font-medium shadow-sm">
          Selected
        </span>
      )}
    </button>
  );
}
