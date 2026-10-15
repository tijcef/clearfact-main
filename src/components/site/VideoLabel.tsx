import { Play } from "lucide-react";
export function VideoLabel() {
  return (
    <span className="inline-flex items-center gap-1 rounded bg-black/80 px-2 py-1 text-xs font-semibold text-white">
      <Play className="h-3 w-3 fill-current" aria-hidden="true" />
      Video
    </span>
  );
}
