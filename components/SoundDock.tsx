"use client";

import { useState } from "react";
import { Music, ChevronDown, ChevronUp } from "lucide-react";

export default function SoundDock() {
  const [minimized, setMinimized] = useState(true);

  return (
    <aside
      className={`sound-dock-wrap ${minimized ? "sound-dock-minimized" : "sound-dock-expanded"}`}
      aria-label="Soundtrack player"
    >
      <button
        className="sound-dock-toggle"
        type="button"
        aria-label={minimized ? "Expand music player" : "Minimize music player"}
        aria-expanded={!minimized}
        onClick={() => setMinimized((prev) => !prev)}
        title={minimized ? "Expand soundtrack player" : "Minimize soundtrack player"}
      >
        <span className="sound-dock-toggle-icon">
          <Music size={13} />
        </span>
        {!minimized && <span className="sound-dock-toggle-label">NOW PLAYING</span>}
        <span className="sound-dock-toggle-caret">
          {minimized ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </span>
      </button>

      <div className="sound-dock-body" aria-hidden={minimized}>
        <iframe
          title="Play or pause in the pool on Spotify"
          src="https://open.spotify.com/embed/track/7bUyB6btwXllCHQhNBWZ2C?utm_source=generator&si=ce3b03d78e5d4d4d&theme=0"
          width="100%"
          height="80"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      </div>
    </aside>
  );
}
