import { useState } from "react";

type ReviewItem = {
  term: string;
  definition: string;
  highlightColor?: string;
  underline?: boolean;
};

const COLORS = [
  "#00ffff",
  "#ffc107",
  "#fd2e2e",
  "#54ff47",
  "#ff73e9",
  "#3e98ff",
];

export function Reviewer() {
  const [term, setTerm] = useState("");
  const [definition, setDefinition] = useState("");
  const [reviewList, setReviewList] = useState<ReviewItem[]>([]);
  const [nextHighlightColor, setNextHighlightColor] = useState<
    string | undefined
  >(undefined);
  const [nextUnderline, setNextUnderline] = useState(false);

  function addItem() {
    if (!term.trim() || !definition.trim()) return;
    setReviewList((prev) => [
      ...prev,
      {
        term: term.trim(),
        definition: definition.trim(),
        highlightColor: nextHighlightColor,
        underline: nextUnderline,
      },
    ]);
    setTerm("");
    setDefinition("");
    setNextHighlightColor(undefined);
    setNextUnderline(false);
  }

  function removeItem(idx: number) {
    setReviewList((prev) => prev.filter((_, i) => i !== idx));
  }

  return (
    <div className="w-full flex items-center justify-center">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        .pixel-font { font-family: 'Press Start 2P', cursive; }
        .pixel-box { border-radius: 0; }
        .pixel-shadow { box-shadow: 4px 4px 0 rgba(139, 92, 246, 0.4), 6px 6px 0 rgba(88, 28, 135, 0.2); }
        input::placeholder, textarea::placeholder { font-family: 'Press Start 2P', cursive; font-size: 0.5rem; }
        @media (min-width: 640px) { 
          input::placeholder, textarea::placeholder { font-size: 0.6rem; } 
        }
      `}</style>

      <div className="w-full max-w-full lg:max-w-2xl p-4 sm:p-6 flex flex-col bg-purple-950/70 pixel-box border-2 sm:border-4 border-purple-500 pixel-shadow overflow-hidden">
        <h2 className="text-lg sm:text-2xl pixel-font text-purple-300 mb-4 sm:mb-6 text-left">
          REVIEWER
        </h2>

        {/* Input Row */}
        <div className="mb-3 flex flex-col gap-3 w-full">
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="TERM"
            className="px-3 py-3 pixel-box bg-purple-950/50 border-2 border-purple-500 text-white pixel-font text-[10px] sm:text-xs w-full focus:outline-none"
          />
          <input
            value={definition}
            onChange={(e) => setDefinition(e.target.value)}
            placeholder="DEFINITION"
            className="px-3 py-3 pixel-box bg-purple-950/50 border-2 border-purple-500 text-white pixel-font text-[10px] sm:text-xs w-full focus:outline-none"
          />
          <button
            onClick={addItem}
            className="w-full px-4 py-3 bg-cyan-600 active:bg-cyan-500 border-2 border-cyan-400 text-white pixel-box pixel-font text-[10px] sm:text-xs min-h-[44px]"
          >
            ► ADD TERM
          </button>
        </div>

        {/* Highlight Controls */}
        <div className="flex flex-col gap-3 my-3 w-full">
          <div className="bg-purple-900/50 pixel-box border-2 border-purple-600 p-3">
            <span className="text-purple-300 pixel-font text-[9px] sm:text-[10px] block mb-2">
              TITLE HIGHLIGHT:
            </span>
            <div className="flex flex-wrap gap-2 items-center">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setNextHighlightColor(c)}
                  className="pixel-box border-2"
                  style={{
                    width: 32,
                    height: 32,
                    background: c,
                    borderColor: nextHighlightColor === c ? "#fff" : "#666",
                  }}
                  title={`Pick color ${c}`}
                />
              ))}
              {nextHighlightColor && (
                <button
                  className="px-2 py-1 text-[9px] bg-white text-black pixel-box border-2 border-gray-400 pixel-font min-w-[32px] min-h-[32px]"
                  onClick={() => setNextHighlightColor(undefined)}
                  title="Remove highlight"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          <button
            className="px-4 py-3 pixel-box border-2 border-purple-500 bg-purple-900/50 pixel-font text-[10px] sm:text-xs text-purple-300 min-h-[44px]"
            style={{
              textDecoration: nextUnderline ? "underline" : "none",
            }}
            onClick={() => setNextUnderline((u) => !u)}
            title="Toggle Underline"
          >
            {nextUnderline ? "UNDERLINE: ON" : "UNDERLINE: OFF"}
          </button>
        </div>

        <h3 className="pixel-font text-sm sm:text-base text-purple-300 mb-4 text-left">
          REVIEW TERMS
        </h3>

        {/* List */}
        <div className="space-y-3 sm:space-y-4 w-full">
          {reviewList.length === 0 && (
            <div className="text-purple-400 text-left pixel-font text-[10px] sm:text-xs p-4 bg-purple-900/50 pixel-box border-2 border-purple-600">
              NO TERMS YET
            </div>
          )}
          {reviewList.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col bg-purple-950/80 pixel-box border-2 sm:border-4 border-purple-500 px-3 sm:px-4 py-3 w-full relative pixel-shadow"
              style={{ alignItems: "flex-start" }}
            >
              <button
                title="Remove"
                className="absolute right-2 top-2 text-red-400 px-2 py-1 text-sm pixel-font min-w-[32px] min-h-[32px] bg-red-900/50 pixel-box border-2 border-red-600"
                onClick={() => removeItem(idx)}
              >
                ×
              </button>
              <div className="flex flex-wrap items-center gap-2 pr-10 sm:pr-12">
                <span
                  className="pixel-font text-sm sm:text-base text-white"
                  style={{
                    color: item.highlightColor ?? "#00ffff",
                    background: item.highlightColor
                      ? item.highlightColor + "44"
                      : undefined,
                    padding: "2px 6px",
                  }}
                >
                  {item.term}
                </span>
                <span className="pixel-font text-purple-400">-</span>
                <span
                  className="pixel-font text-[10px] sm:text-xs text-white/90"
                  style={{
                    textDecoration: item.underline ? "underline" : "none",
                    textDecorationColor: item.underline ? "#fff" : undefined,
                  }}
                >
                  {item.definition}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default Reviewer;
