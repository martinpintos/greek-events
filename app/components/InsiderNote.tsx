export function InsiderNote({ text }: { text: string }) {
  return (
    <div className="relative bg-paper-3 border border-line p-4 md:p-5">
      <span className="absolute -top-2.5 left-4 inline-block px-2 py-0.5 bg-ink text-paper font-mono text-[9px] font-semibold uppercase tracking-[0.16em]">
        From the editor
      </span>
      <p className="display-h italic text-[17px] md:text-[19px] leading-[1.28] m-0">
        {text}
      </p>
      <div className="mt-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.08em] text-mute">
        <span className="w-4 h-px bg-current opacity-50" />
        M.K., resident editor
      </div>
    </div>
  );
}
