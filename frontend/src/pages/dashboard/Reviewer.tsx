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
      <div className="w-full max-w-full lg:max-w-2xl p-4 sm:p-6 flex flex-col bg-black/70 rounded-xl overflow-hidden">
        <h2 className="text-2xl font-bold text-[#00ffff] mb-6 text-left">
          Reviewer
        </h2>

        {/* inputs row */}
        <div className="mb-3 flex flex-col sm:flex-row gap-3 w-full">
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Term"
            className="px-3 py-2 rounded bg-gray-800 text-white w-full sm:flex-1"
          />
          <input
            value={definition}
            onChange={(e) => setDefinition(e.target.value)}
            placeholder="Definition"
            className="px-3 py-2 rounded bg-gray-800 text-white w-full sm:flex-1"
          />
          <button
            onClick={addItem}
            className="px-4 py-2 bg-blue-600 text-white rounded font-bold whitespace-nowrap"
          >
            Add
          </button>
        </div>

        {/* highlight + underline controls */}
        <div className="flex flex-col sm:flex-row gap-3 my-3 w-full">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-gray-300 font-medium text-sm">
              Title highlight:
            </span>
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setNextHighlightColor(c)}
                className="rounded-full border"
                style={{
                  width: 22,
                  height: 22,
                  background: c,
                  borderColor: nextHighlightColor === c ? "#333333" : "#aaaaaa",
                }}
                title={`Pick color ${c}`}
              />
            ))}
            {nextHighlightColor && (
              <button
                className="px-1 text-xs bg-white text-black rounded border border-gray-400"
                onClick={() => setNextHighlightColor(undefined)}
                title="Remove highlight"
              >
                ×
              </button>
            )}
          </div>
          <button
            className="px-4 py-1 rounded font-bold border self-start"
            style={{
              textDecoration: nextUnderline ? "underline" : "none",
            }}
            onClick={() => setNextUnderline((u) => !u)}
            title="Toggle Underline for Definition"
          >
            Underline
          </button>
        </div>

        <h3 className="font-semibold mb-4 text-left">Review Terms</h3>

        {/* list */}
        <div className="space-y-4 w-full">
          {reviewList.length === 0 && (
            <div className="text-gray-400 text-left">No terms added yet.</div>
          )}
          {reviewList.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col bg-white/5 rounded px-4 py-3 w-full relative"
              style={{ alignItems: "flex-start" }}
            >
              <button
                title="Remove"
                className="absolute right-2 top-2 text-red-400 px-2 text-lg font-bold"
                onClick={() => removeItem(idx)}
              >
                ×
              </button>
              <div className="flex flex-wrap items-center gap-2 pr-6">
                <span
                  className="font-bold text-lg text-white"
                  style={{
                    color: item.highlightColor ?? "#00ffff",
                    background: item.highlightColor
                      ? item.highlightColor + "44"
                      : undefined,
                    padding: "1px 6px",
                    borderRadius: 6,
                  }}
                >
                  {item.term}
                </span>
                <span>-</span>
                <span
                  className="font-medium text-white/90"
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
