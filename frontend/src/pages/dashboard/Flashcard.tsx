import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";

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

  useEffect(() => {
    loadFlashcards();
  }, []);

  async function loadFlashcards() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("flashcards")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        const formatted = data.map((card) => ({
          id: card.id,
          question: card.question,
          answer: card.answer,
          path: [
            { level: "course" as const, name: card.course },
            ...(card.subject
              ? [{ level: "subject" as const, name: card.subject }]
              : []),
            ...(card.grade_level
              ? [{ level: "grade" as const, name: card.grade_level }]
              : []),
            ...(card.quarter
              ? [{ level: "quarter" as const, name: card.quarter }]
              : []),
          ],
        }));
        setCards(formatted);

        // Rebuild paths
        const paths: Record<string, HierarchyPath> = {};
        data.forEach((card) => {
          if (!paths[card.course]) {
            paths[card.course] = [{ level: "course", name: card.course }];
          }
        });
        setPathsByCourse(paths);
      }
    } catch (error) {
      console.error("Error loading flashcards:", error);
    }
  }

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

  async function addCard() {
    if (!question.trim() || !answer.trim()) {
      alert("⚠️ FILL BOTH FIELDS");
      return;
    }
    if (!hasActivePath) {
      alert("⚠️ SET COURSE AND SUBJECT FIRST");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      alert("⚠️ LOGIN REQUIRED");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("flashcards")
        .insert({
          user_id: user.id,
          course: currentPath[0]?.name || "",
          subject: currentPath[1]?.name || null,
          grade_level: currentPath[2]?.name || null,
          quarter: currentPath[3]?.name || null,
          question: question.trim(),
          answer: answer.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newCard: FlashcardData = {
          id: data.id,
          question: data.question,
          answer: data.answer,
          path: [...currentPath],
        };
        setCards([...cards, newCard]);
        setQuestion("");
        setAnswer("");
        alert("✓ CARD ADDED");
      }
    } catch (error: any) {
      console.error("Add card error:", error);
      alert("⚠️ SAVE FAILED: " + error.message);
    }
  }

  async function deleteCard(id: string) {
    try {
      const { error } = await supabase.from("flashcards").delete().eq("id", id);

      if (error) throw error;

      setCards(cards.filter((card) => card.id !== id));
    } catch (error) {
      alert("⚠️ DELETE FAILED");
    }
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
              className="px-3 py-2 bg-green-600 active:bg-green-500 border-2 border-green-400 pixel-box text-white pixel-font text-[10px] sm:text-xs whitespace-nowrap"
            >
              ► ADD
            </button>
          </div>

          {activeCourse && (
            <button
              onClick={removeActiveCourse}
              className="text-[9px] sm:text-[10px] pixel-font text-red-400 hover:text-red-300 underline text-left"
            >
              REMOVE COURSE
            </button>
          )}
        </div>
      </div>

      {/* Path Navigation */}
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-purple-950/80 pixel-box border-2 sm:border-4 border-purple-500 pixel-shadow">
        <h3 className="pixel-font mb-3 text-[10px] sm:text-xs text-purple-300">
          PATH
        </h3>

        <div className="flex flex-wrap gap-2 mb-3">
          {currentPath.map((item, idx) => (
            <button
              key={`${item.level}-${idx}`}
              onClick={() => resetToPathIndex(idx)}
              className="px-2 py-1 bg-cyan-600 border-2 border-cyan-400 text-white pixel-box pixel-font text-[9px] sm:text-[10px]"
            >
              {item.name} {idx === currentPath.length - 1 && "▼"}
            </button>
          ))}
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

        <button
          onClick={addCard}
          disabled={!hasActivePath || loading}
          className="w-full px-3 py-2 bg-cyan-600 active:bg-cyan-500 border-2 border-cyan-400 pixel-box text-white pixel-font text-[10px] sm:text-xs disabled:opacity-40"
        >
          {loading ? "SAVING..." : "► ADD CARD"}
        </button>

        <p className="text-[9px] sm:text-[10px] pixel-font text-purple-400 mt-2">
          PATH: {contextLabel}
        </p>
      </div>

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
