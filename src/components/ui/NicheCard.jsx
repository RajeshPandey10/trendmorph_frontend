// NicheCard.jsx - Modern styled card for niche selection
export default function NicheCard({
  icon,
  title,
  description,
  selected,
  onClick,
}) {
  return (
    <button
      className={`group relative flex flex-col items-center justify-center rounded-xl p-4 sm:p-6 transition-all duration-300 
        w-full sm:w-40 h-32 sm:h-40 m-1 sm:m-2 modern-button modern-focus float-element
        ${
          selected
            ? "glass-effect border-primary ring-2 ring-primary/40 bg-primary/10 dark:bg-primary/15 modern-shadow-lg glow-border"
            : "glass-effect border-border/50 hover:border-primary/50 modern-shadow hover:modern-shadow-lg"
        }`}
      onClick={onClick}
      aria-pressed={selected}
      style={{
        animationDelay: `${Math.random() * 2}s`,
      }}
    >
      <span className="text-2xl sm:text-4xl mb-1 sm:mb-2 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 filter group-hover:drop-shadow-lg">
        {icon}
      </span>
      <span className="font-semibold text-sm sm:text-lg mb-0.5 sm:mb-1 text-card-foreground dark:text-foreground group-hover:text-primary transition-colors duration-300">
        {title}
      </span>
      <span className="text-xs text-muted-foreground text-center leading-tight group-hover:text-foreground/80 transition-colors duration-300 hidden sm:block">
        {description}
      </span>
      {selected && (
        <span className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 sm:px-2 text-xs font-medium shadow-sm">
          ✓
        </span>
      )}
    </button>
  );
}
