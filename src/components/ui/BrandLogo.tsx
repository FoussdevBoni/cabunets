// The supplied artwork stays intact. Compact spaces show its wordmark;
// the footer shows the complete emblem and slogan on a white backing.
export function BrandLogo({ full = false }: { full?: boolean }) {
  return full ? (
    <img src="/cabuaffili-original.jpeg" alt="CabuAffili — Recommandez, gagnez, grandissons ensemble"
      width={1280} height={853} className="w-64 max-w-full rounded-xl bg-white" />
  ) : (
    <span className="relative block w-36 h-10 shrink-0 overflow-hidden bg-white" role="img" aria-label="CabuAffili">
      <img src="/cabuaffili-original.jpeg" alt="" aria-hidden="true"
        className="absolute max-w-none w-[176px] h-auto left-[-16px] top-[-63px]" />
    </span>
  );
}
