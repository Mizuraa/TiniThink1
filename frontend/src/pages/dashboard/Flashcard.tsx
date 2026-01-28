import React, { useState, useRef } from "react";

type FolderLevel = "subject" | "grade" | "quarter";

type HierarchyPathItem = {
  level: "course" | FolderLevel;
  name: string;
};

type HierarchyPath = HierarchyPathItem[];

type FlashcardData = {
  id: string;
  question: string;
  answer: string;
  path: HierarchyPath;
};

const MOCK_FOLDER_FILES = [
  { id: "file1", name: "Biology_Lecture.pdf" },
  { id: "file2", name: "HistoryNotes.pdf" },
];

const LEVEL_ORDER: FolderLevel[] = ["subject", "grade", "quarter"];

const LEVEL_LABEL: Record<FolderLevel, string> = {
  subject: "SUBJECT",
  grade: "GRADE LEVEL",
  quarter: "QUARTER",
};

export default function Flashcard() {
  const [cards, setCards] = useState<FlashcardData[]>([]);
  const [courseInput, setCourseInput] = useState("");
  const [activeCourse, setActiveCourse] = useState("");
  const [pathsByCourse, setPathsByCourse] = useState<
    Record<string, HierarchyPath>
  >({});
  const [currentLevelValue, setCurrentLevelValue] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const existingCourses = Object.keys(pathsByCourse);

  const currentPath: HierarchyPath = (() => {
    if (!activeCourse) return [];
    const base: HierarchyPathItem = { level: "course", name: activeCourse };
    const extra = pathsByCourse[activeCourse]?.slice(1) || [];
    return [base, ...extra];
  })();

  const currentLevel: FolderLevel | null = (() => {
    if (!activeCourse) return null;
    const depth = currentPath.length - 1;
    if (depth >= LEVEL_ORDER.length) return null;
    return LEVEL_ORDER[depth];
  })();

  function isSamePath(a: HierarchyPath, b: HierarchyPath): boolean {
    if (a.length !== b.length) return false;
    return a.every(
      (item, idx) =>
        item.level === b[idx].level &&
        item.name.toLowerCase() === b[idx].name.toLowerCase(),
    );
  }

  const visibleCards = cards.filter((c) => isSamePath(c.path, currentPath));
  const contextLabel =
    currentPath.length > 0
      ? currentPath.map((p) => p.name).join(" → ")
      : "NONE";
  const atFinalLevel = currentLevel === null && !!activeCourse;
  const hasActivePath = activeCourse !== "" && currentPath.length >= 2;

  function handleCreateOrUseCourse() {
    const trimmed = courseInput.trim();
    if (!trimmed) {
      alert("⚠️ PLEASE TYPE COURSE NAME");
      return;
    }
    setActiveCourse(trimmed);
    setPathsByCourse((prev) => {
      if (prev[trimmed]) return prev;
      return { ...prev, [trimmed]: [{ level: "course", name: trimmed }] };
    });
    setCurrentLevelValue("");
  }

  function handleSelectExistingCourse(course: string) {
    if (!course) {
      setActiveCourse("");
      return;
    }
    setActiveCourse(course);
    setPathsByCourse((prev) => {
      if (prev[course]) return prev;
      return { ...prev, [course]: [{ level: "course", name: course }] };
    });
    setCurrentLevelValue("");
  }

  function removeActiveCourse() {
    if (!activeCourse) return;
    if (!window.confirm(`⚠️ REMOVE "${activeCourse}" AND ALL FLASHCARDS?`))
      return;
    setPathsByCourse((prev) => {
      const copy = { ...prev };
      delete copy[activeCourse];
      return copy;
    });
    setCards((prev) =>
      prev.filter((card) => card.path[0]?.name !== activeCourse),
    );
    setActiveCourse("");
    setCurrentLevelValue("");
  }

  function handleSaveAndNext() {
    if (!activeCourse || !currentLevel) return;
    if (!currentLevelValue.trim()) {
      alert(`⚠️ PLEASE ENTER ${LEVEL_LABEL[currentLevel]}`);
      return;
    }
    const value = currentLevelValue.trim();
    setPathsByCourse((prev) => {
      const base: HierarchyPathItem = { level: "course", name: activeCourse };
      const existing = prev[activeCourse] || [base];
      const updated: HierarchyPath = [
        ...existing,
        { level: currentLevel, name: value },
      ];
      return { ...prev, [activeCourse]: updated };
    });
    setCurrentLevelValue("");
  }

  function resetToPathIndex(index: number) {
    if (!activeCourse) return;
    setPathsByCourse((prev) => {
      const existing = prev[activeCourse];
      if (!existing) return prev;
      const sliced = existing.slice(0, index + 1);
      return { ...prev, [activeCourse]: sliced };
    });
  }

  function clearPathKeepCourse() {
    if (!activeCourse) return;
    setPathsByCourse((prev) => ({
      ...prev,
      [activeCourse]: [{ level: "course", name: activeCourse }],
    }));
    setCurrentLevelValue("");
  }

  function addCard() {
    if (!question.trim() || !answer.trim()) {
      alert("⚠️ FILL BOTH FIELDS");
      return;
    }
    if (!hasActivePath) {
      alert("⚠️ SET COURSE AND SUBJECT FIRST");
      return;
    }
    const newCard: FlashcardData = {
      id: Date.now().toString(),
      question: question.trim(),
      answer: answer.trim(),
      path: [...currentPath],
    };
    setCards((prev) => [...prev, newCard]);
    setQuestion("");
    setAnswer("");
  }

  function deleteCard(id: string) {
    setCards((prev) => prev.filter((card) => card.id !== id));
  }

  function openAIDialog() {
    if (!hasActivePath) {
      alert("⚠️ SET PATH BEFORE AI GENERATION");
      return;
    }
    setShowAIDialog(true);
  }

  return (
    <div className="w-full">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        .pixel-font { font-family: 'Press Start 2P', cursive; }
        .pixel-box { border-radius: 0; }
        .pixel-shadow { box-shadow: 4px 4px 0 rgba(139, 92, 246, 0.4), 6px 6px 0 rgba(88, 28, 135, 0.2); }
        input::placeholder, select { font-family: 'Press Start 2P', cursive; font-size: 0.5rem; }
        @media (min-width: 640px) { input::placeholder, select { font-size: 0.6rem; } }
      `}</style>

      <h2 className="text-base sm:text-xl pixel-font text-purple-300 mb-4 sm:mb-6">
        FLASHCARDS
      </h2>

      {/* Course Selection */}
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-purple-950/80 pixel-box border-2 sm:border-4 border-purple-500 pixel-shadow">
        <h3 className="pixel-font mb-3 text-[10px] sm:text-xs text-purple-300">
          COURSE SELECTION
        </h3>
        <div className="flex flex-col gap-3">
          <select
            value={activeCourse}
            onChange={(e) => handleSelectExistingCourse(e.target.value)}
            className="px-3 py-2 pixel-box bg-purple-950/50 border-2 border-purple-500 text-white pixel-font text-[10px] sm:text-xs focus:outline-none w-full"
          >
            <option value="">SELECT COURSE</option>
            {existingCourses.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <input
              value={courseInput}
              onChange={(e) => setCourseInput(e.target.value)}
              placeholder="NEW COURSE NAME"
              className="flex-1 px-3 py-2 pixel-box bg-purple-950/50 border-2 border-purple-500 text-white pixel-font text-[10px] sm:text-xs focus:outline-none"
            />
            <button
              onClick={handleCreateOrUseCourse}
              className="px-3 py-2 bg-cyan-600 active:bg-cyan-500 border-2 border-cyan-400 pixel-box text-white pixel-font text-[10px] sm:text-xs whitespace-nowrap"
            >
              ► USE
            </button>
          </div>

          <button
            onClick={removeActiveCourse}
            disabled={!activeCourse}
            className="px-3 py-2 bg-red-600 active:bg-red-500 border-2 border-red-500 pixel-box text-white pixel-font text-[10px] sm:text-xs disabled:opacity-40"
          >
            REMOVE COURSE
          </button>
        </div>
      </div>

      {/* Path Organization */}
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-purple-950/80 pixel-box border-2 sm:border-4 border-purple-500 pixel-shadow">
        <h3 className="pixel-font mb-3 text-[10px] sm:text-xs text-purple-300">
          PATH ORGANIZATION
        </h3>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-[10px] sm:text-xs pixel-font text-purple-400">
            PATH:
          </span>
          {currentPath.length === 0 ? (
            <span className="text-[9px] sm:text-[10px] pixel-font text-purple-500">
              NO PATH SET
            </span>
          ) : (
            currentPath.map((item, idx) => (
              <button
                key={`${item.level}-${idx}`}
                onClick={() => resetToPathIndex(idx)}
                className="px-2 py-1 bg-cyan-600 border-2 border-cyan-400 text-white pixel-box pixel-font text-[9px] sm:text-[10px]"
              >
                {item.name} {idx === currentPath.length - 1 && "▼"}
              </button>
            ))
          )}
          {currentPath.length > 0 && (
            <button
              onClick={clearPathKeepCourse}
              className="text-[9px] sm:text-[10px] pixel-font text-red-400 hover:text-red-300 underline"
            >
              CLEAR
            </button>
          )}
        </div>

        <p className="text-[9px] sm:text-[10px] pixel-font text-purple-400 mb-3">
          {hasActivePath
            ? `ACTIVE: ${contextLabel}`
            : "SET COURSE + SUBJECT TO START"}
        </p>

        {activeCourse && currentLevel && (
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              value={currentLevelValue}
              onChange={(e) => setCurrentLevelValue(e.target.value)}
              placeholder={LEVEL_LABEL[currentLevel]}
              className="flex-1 px-3 py-2 pixel-box bg-purple-950/50 border-2 border-purple-500 text-white pixel-font text-[10px] sm:text-xs focus:outline-none"
            />
            <button
              onClick={handleSaveAndNext}
              className="px-3 py-2 bg-green-600 active:bg-green-500 border-2 border-green-400 pixel-box text-white pixel-font text-[10px] sm:text-xs whitespace-nowrap"
            >
              ► SAVE
            </button>
          </div>
        )}

        {activeCourse && atFinalLevel && (
          <p className="text-[9px] sm:text-[10px] pixel-font text-green-400 mt-2">
            ✓ ALL LEVELS SET
          </p>
        )}
      </div>

      {/* Flashcard Creation */}
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-purple-950/80 pixel-box border-2 sm:border-4 border-purple-500 pixel-shadow">
        <h3 className="pixel-font mb-3 text-[10px] sm:text-xs text-purple-300">
          CREATE FLASHCARD
        </h3>

        <div className="flex flex-col gap-2 mb-3">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="QUESTION"
            className="px-3 py-2 pixel-box bg-purple-950/50 border-2 border-purple-500 text-white pixel-font text-[10px] sm:text-xs focus:outline-none w-full"
          />
          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="ANSWER"
            className="px-3 py-2 pixel-box bg-purple-950/50 border-2 border-purple-500 text-white pixel-font text-[10px] sm:text-xs focus:outline-none w-full"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={addCard}
            disabled={!hasActivePath}
            className="flex-1 px-3 py-2 bg-cyan-600 active:bg-cyan-500 border-2 border-cyan-400 pixel-box text-white pixel-font text-[10px] sm:text-xs disabled:opacity-40"
          >
            ► ADD CARD
          </button>
          <button
            onClick={openAIDialog}
            disabled={loading || !hasActivePath}
            className="flex-1 px-3 py-2 bg-pink-600 active:bg-pink-500 border-2 border-pink-400 pixel-box text-white pixel-font text-[10px] sm:text-xs disabled:opacity-40"
          >
            {loading ? "PROCESSING..." : "AI GENERATE"}
          </button>
        </div>

        <p className="text-[9px] sm:text-[10px] pixel-font text-purple-400 mt-2">
          PATH: {contextLabel}
        </p>
      </div>

      {/* AI Dialog */}
      {showAIDialog && (
        <div className="fixed z-50 left-0 top-0 w-full h-full bg-black/90 flex items-center justify-center p-4">
          <div className="bg-purple-950 border-4 border-purple-500 pixel-box max-w-md w-full p-4 sm:p-6 pixel-shadow relative">
            <h3 className="pixel-font text-sm sm:text-base text-purple-300 mb-4">
              AI GENERATE
            </h3>
            <p className="pixel-font text-[9px] sm:text-[10px] text-purple-400 mb-3">
              PATH: {contextLabel}
            </p>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full mb-3 px-4 py-2 bg-cyan-600 active:bg-cyan-500 border-2 border-cyan-400 pixel-box text-white pixel-font text-[10px] sm:text-xs"
            >
              ► UPLOAD FILE
            </button>
            <input
              type="file"
              style={{ display: "none" }}
              ref={fileInputRef}
              accept=".pdf,.doc,.docx,.txt"
            />

            <div className="mb-3">
              <p className="pixel-font text-[9px] sm:text-[10px] text-purple-300 mb-2">
                FOLDER FILES:
              </p>
              {MOCK_FOLDER_FILES.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center gap-2 mb-2 p-2 bg-purple-900/50 border-2 border-purple-600 pixel-box"
                >
                  <span className="flex-1 text-[9px] sm:text-[10px] pixel-font text-purple-200">
                    {f.name}
                  </span>
                  <button className="px-2 py-1 bg-green-600 border-2 border-green-400 text-white pixel-box pixel-font text-[9px]">
                    USE
                  </button>
                </div>
              ))}
            </div>

            <button
              className="absolute top-2 right-2 text-lg pixel-font text-purple-300 hover:text-purple-100"
              onClick={() => setShowAIDialog(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Flashcards Grid */}
      <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {visibleCards.length === 0 ? (
          <div className="pixel-font text-[10px] sm:text-xs text-purple-400 col-span-full text-center py-8">
            NO FLASHCARDS YET
          </div>
        ) : (
          visibleCards.map((card) => (
            <FlipCard
              key={card.id}
              id={card.id}
              question={card.question}
              answer={card.answer}
              context={card.path.map((p) => p.name).join(" → ")}
              onDelete={deleteCard}
            />
          ))
        )}
      </div>
    </div>
  );
}

function FlipCard({
  id,
  question,
  answer,
  context,
  onDelete,
}: {
  id: string;
  question: string;
  answer: string;
  context: string;
  onDelete: (id: string) => void;
}) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="w-full h-44 sm:h-48 perspective cursor-pointer mx-auto"
      onClick={() => setFlipped((f) => !f)}
      style={{ perspective: "1000px" }}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 ${flipped ? "rotate-y-180" : ""}`}
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front */}
        <div
          className="absolute w-full h-full bg-purple-600 text-white pixel-box border-4 border-purple-400 flex flex-col items-center justify-center text-center pixel-font p-3"
          style={{ backfaceVisibility: "hidden" }}
        >
          <button
            className="absolute top-1 right-1 text-[9px] bg-red-600 border-2 border-red-400 px-2 py-1 pixel-box pixel-font"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
          >
            DEL
          </button>
          <div className="mb-2 text-[8px] sm:text-[9px] text-purple-200">
            {context}
          </div>
          <div className="text-xs sm:text-sm">{question}</div>
        </div>

        {/* Back */}
        <div
          className="absolute w-full h-full bg-green-600 text-white pixel-box border-4 border-green-400 flex items-center justify-center text-center pixel-font p-3"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="text-xs sm:text-sm">{answer}</div>
        </div>
      </div>
    </div>
  );
}
