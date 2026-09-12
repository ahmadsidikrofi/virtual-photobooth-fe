export function StepCard({
  stepNumber,
  title,
  description,
}) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-[#E6DFD5] bg-white/70 p-5 sm:p-6 transition-all duration-200 hover:bg-white hover:border-[#F5A623]/60 hover:shadow-xs">
      <div>
        <span className="font-mono text-xs font-bold text-[#F5A623] tracking-wider">
          LANGKAH {stepNumber}
        </span>
        <h3 className="mt-3 text-base sm:text-lg font-bold text-[#1F1A16]">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-[#757068]">
          {description}
        </p>
      </div>
    </div>
  );
}
