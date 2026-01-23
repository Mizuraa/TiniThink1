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
  path: HierarchyPath; // Course → Subject → Grade → Quarter
};

const MOCK_FOLDER_FILES = [
  { id: "file1", name: "Biology_Lecture.pdf" },
  { id: "file2", name: "HistoryNotes.pdf" },
];

const LEVEL_ORDER: FolderLevel[] = ["subject", "grade", "quarter"];

const LEVEL_LABEL: Record<FolderLevel, string> = {
  subject: "Subject",
  grade: "Grade Level",
  quarter: "Quarter",
};

export default function FlashcardOrganized() {
  // All flashcards
  const [cards, setCards] = useState<FlashcardData[]>([]);

  // Course creation + selection
  const [courseInput, setCourseInput] = useState(""); // user typed
  const [activeCourse, setActiveCourse] = useState(""); // selected/confirmed

  // For each course, store its deeper path (course always index 0)
  const [pathsByCourse, setPathsByCourse] = useState<
    Record<string, HierarchyPath>
  >({});

  // Current level (subject/grade/quarter) input
  const [currentLevelValue, setCurrentLevelValue] = useState("");

  // Flashcard fields
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  // AI dialog / loading
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
        item.name.toLowerCase() === b[idx].name.toLowerCase()
    );
  }

  const visibleCards = cards.filter((c) => isSamePath(c.path, currentPath));

  const contextLabel =
    currentPath.length > 0
      ? currentPath.map((p) => p.name).join(" → ")
      : "None";

  const atFinalLevel = currentLevel === null && !!activeCourse;

  // Active path = course + at least Subject
  const hasActivePath = activeCourse !== "" && currentPath.length >= 2;

  // -------- COURSE SELECTION --------
  function handleCreateOrUseCourse() {
    const trimmed = courseInput.trim();
    if (!trimmed) {
      alert("Please type a course name.");
      return;
    }
    setActiveCourse(trimmed);
    setPathsByCourse((prev) => {
      if (prev[trimmed]) return prev;
      return {
        ...prev,
        [trimmed]: [{ level: "course", name: trimmed }],
      };
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
      return {
        ...prev,
        [course]: [{ level: "course", name: course }],
      };
    });
    setCurrentLevelValue("");
  }

  function removeActiveCourse() {
    if (!activeCourse) return;
    if (
      !window.confirm(`Remove course "${activeCourse}" and all its flashcards?`)
    )
      return;

    setPathsByCourse((prev) => {
      const copy = { ...prev };
      delete copy[activeCourse];
      return copy;
    });

    setCards((prev) =>
      prev.filter((card) => card.path[0]?.name !== activeCourse)
    );

    setActiveCourse("");
    setCurrentLevelValue("");
  }

  // -------- PATH ORGANIZATION --------
  function handleSaveAndNext() {
    if (!activeCourse || !currentLevel) return;
    if (!currentLevelValue.trim()) {
      alert(`Please enter a ${LEVEL_LABEL[currentLevel]}.`);
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
      return {
        ...prev,
        [activeCourse]: updated,
      };
    });

    setCurrentLevelValue("");
  }

  function resetToPathIndex(index: number) {
    if (!activeCourse) return;
    setPathsByCourse((prev) => {
      const existing = prev[activeCourse];
      if (!existing) return prev;
      const sliced = existing.slice(0, index + 1);
      return {
        ...prev,
        [activeCourse]: sliced,
      };
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

  // -------- FLASHCARD CREATION / DELETE --------
  function addCard() {
    if (!question.trim() || !answer.trim()) {
      alert("Please fill out both question and answer.");
      return;
    }
    if (!hasActivePath) {
      alert("Please set Course and Subject (path) before adding flashcards.");
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
      alert("Please set Course and Subject (path) before generating with AI.");
      return;
    }
    setShowAIDialog(true);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    if (!hasActivePath) return;

    setLoading(true);
    setShowAIDialog(false);

    try {
      const formData = new FormData();
      formData.append("file", e.target.files[0]);
      formData.append("path", JSON.stringify(currentPath));

      const response = await fetch("/api/ai-flashcards-from-upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      const newCards: FlashcardData[] = data.flashcards.map(
        (fc: any, idx: number) => ({
          id: (Date.now() + idx).toString(),
          question: fc.question,
          answer: fc.answer,
          path: [...currentPath],
        })
      );

      setCards((prev) => [...prev, ...newCards]);
    } catch (err) {
      console.error(err);
      alert("Failed to generate flashcards from file.");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function generateFromFolderFile(fileId: string) {
    if (!hasActivePath) return;

    setLoading(true);
    setShowAIDialog(false);

    try {
      const response = await fetch("/api/generate-flashcards-from-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId, path: currentPath }),
      });

      const data = await response.json();
      const newCards: FlashcardData[] = data.flashcards.map(
        (fc: any, idx: number) => ({
          id: (Date.now() + idx).toString(),
          question: fc.question,
          answer: fc.answer,
          path: [...currentPath],
        })
      );

      setCards((prev) => [...prev, ...newCards]);
    } catch (err) {
      console.error(err);
      alert("Failed to generate flashcards from folder file.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Flashcards</h2>

      {/* SECTION 1: Course selection */}
      <div className="mb-6 p-4 bg-gray-900 rounded-lg">
        <h3 className="font-semibold mb-3 text-sm text-gray-100">
          Course selection
        </h3>
        <div className="flex flex-wrap items-end gap-4">
          {/* Dropdown of existing courses */}
          <div className="flex flex-col">
            <label className="text-xs text-gray-400 mb-1">Active course</label>
            <select
              value={activeCourse}
              onChange={(e) => handleSelectExistingCourse(e.target.value)}
              className="px-3 py-2 rounded bg-gray-800 text-white w-52 text-sm"
            >
              <option value="">Select existing course</option>
              {existingCourses.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </div>

          {/* Input to create / rename course */}
          <div className="flex flex-col">
            <label className="text-xs text-gray-400 mb-1">
              Create or rename active course
            </label>
            <input
              value={courseInput}
              onChange={(e) => setCourseInput(e.target.value)}
              placeholder="Type course (e.g., Filipino)"
              className="px-3 py-2 rounded bg-gray-800 text-white w-52 text-sm"
            />
          </div>

          <button
            onClick={handleCreateOrUseCourse}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-semibold"
          >
            Use Course
          </button>

          <button
            onClick={removeActiveCourse}
            disabled={!activeCourse}
            className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded text-xs disabled:opacity-40"
          >
            Remove Course
          </button>
        </div>
      </div>

      {/* SECTION 2: Path organization */}
      <div className="mb-6 p-4 bg-gray-900 rounded-lg">
        <h3 className="font-semibold mb-3 text-sm text-gray-100">
          Path organization
        </h3>

        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-sm text-gray-300 mr-1">Path:</span>
          {currentPath.length === 0 && (
            <span className="text-sm text-gray-500 italic">
              No path yet. Set a course and start with Subject.
            </span>
          )}
          {currentPath.map((item, idx) => (
            <button
              key={`${item.level}-${idx}`}
              onClick={() => resetToPathIndex(idx)}
              className="px-2 py-1 bg-blue-600 text-white rounded text-xs flex items-center gap-1"
            >
              {item.name}
              {idx === currentPath.length - 1 && <span>▼</span>}
            </button>
          ))}
          {currentPath.length > 0 && (
            <button
              onClick={clearPathKeepCourse}
              className="ml-2 text-xs text-red-300 hover:text-red-400 underline"
            >
              Clear path (keep Course)
            </button>
          )}
        </div>

        <p className="text-xs text-gray-400 mb-3">
          {hasActivePath
            ? `Active path: ${contextLabel}.`
            : "No active path yet. Add Subject under the selected course to activate."}
        </p>

        {/* Subject / Grade / Quarter input */}
        {activeCourse && currentLevel && (
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col">
              <label className="text-xs text-gray-400 mb-1">
                {LEVEL_LABEL[currentLevel]}
              </label>
              <input
                value={currentLevelValue}
                onChange={(e) => setCurrentLevelValue(e.target.value)}
                placeholder={`Type ${LEVEL_LABEL[currentLevel]}`}
                className="px-3 py-2 rounded bg-gray-800 text-white w-56 text-sm"
              />
            </div>
            <button
              onClick={handleSaveAndNext}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded text-sm font-semibold"
            >
              Save & Next
            </button>
          </div>
        )}

        {activeCourse && atFinalLevel && (
          <p className="text-xs text-gray-400 mt-2">
            All levels set. You are now in the most specific path.
          </p>
        )}
      </div>

      {/* SECTION 3: Flashcard creation */}
      <div className="mb-6 p-4 bg-gray-900 rounded-lg">
        <h3 className="font-semibold mb-3 text-sm text-gray-100">
          Flashcard creation
        </h3>

        <div className="flex flex-wrap items-end gap-4 mb-4">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter question"
            className="px-3 py-2 rounded bg-gray-800 text-white w-56 text-sm"
          />
          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Enter answer"
            className="px-3 py-2 rounded bg-gray-800 text-white w-56 text-sm"
          />
          <button
            onClick={addCard}
            className="px-4 py-2 bg-[#00ffff] text-black rounded text-sm font-bold disabled:opacity-40"
            disabled={!hasActivePath}
          >
            Add Flashcard
          </button>
          <button
            onClick={openAIDialog}
            className="px-4 py-2 bg-[#ff69b4] text-white rounded text-sm font-bold disabled:opacity-40"
            disabled={loading || !hasActivePath}
          >
            {loading ? "Processing..." : "Generate with AI"}
          </button>
        </div>

        <p className="text-xs text-gray-400">
          Current path: {contextLabel}. Flashcards will only be stored here.
        </p>
      </div>

      {/* AI Dialog */}
      {showAIDialog && (
        <div className="fixed z-50 left-0 top-0 w-full h-full bg-black/70 flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl shadow max-w-md w-full relative">
            <h3 className="font-bold text-lg mb-4">
              Generate Flashcards with AI
            </h3>
            <p className="mb-2 text-sm text-gray-700">
              Current path: {contextLabel}
            </p>
            <p className="mb-2">Choose file source:</p>
            <div className="mb-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded mr-4"
              >
                Input File from Device
              </button>
              <input
                type="file"
                style={{ display: "none" }}
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.txt"
              />
              <span className="text-gray-400 text-xs">
                (PDF, DOCX, TXT supported)
              </span>
            </div>
            <div>
              <p className="mb-1 font-semibold">
                Or use a file from your folder:
              </p>
              {MOCK_FOLDER_FILES.length === 0 && (
                <p className="text-gray-400">No files found in folder.</p>
              )}
              {MOCK_FOLDER_FILES.map((f) => (
                <div key={f.id} className="flex items-center gap-2 mb-2">
                  <span>{f.name}</span>
                  <button
                    className="px-2 py-1 bg-green-600 text-white rounded"
                    onClick={() => generateFromFolderFile(f.id)}
                  >
                    Use for Flashcards
                  </button>
                </div>
              ))}
            </div>
            <button
              className="absolute top-2 right-2 text-xl"
              onClick={() => setShowAIDialog(false)}
              title="Close"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Flashcards list */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleCards.length === 0 && (
          <div className="text-gray-400">
            No flashcards
            {contextLabel !== "None" && ` in "${contextLabel}"`} yet.
          </div>
        )}
        {visibleCards.map((card) => (
          <FlipCard
            key={card.id}
            id={card.id}
            question={card.question}
            answer={card.answer}
            context={card.path.map((p) => p.name).join(" → ")}
            onDelete={deleteCard}
          />
        ))}
      </div>
    </div>
  );
}

// Flip-card with delete button
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
      className="group w-72 h-44 perspective cursor-pointer mx-auto"
      onClick={() => setFlipped((f) => !f)}
      style={{ perspective: "1000px" }}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 ease-in-out ${
          flipped ? "transform rotate-y-180" : ""
        }`}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front */}
        <div
          className="absolute w-full h-full bg-blue-600 text-white rounded-xl shadow-lg flex flex-col items-center justify-center text-center font-bold text-lg px-3"
          style={{
            backfaceVisibility: "hidden",
            boxShadow: "0 4px 12px #0003",
          }}
        >
          <button
            className="absolute top-1 right-2 text-xs bg-red-600 px-2 py-1 rounded"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
          >
            Delete
          </button>
          <div className="mb-2 text-xs font-normal text-gray-100">
            {context}
          </div>
          {question}
        </div>

        {/* Back */}
        <div
          className="absolute w-full h-full bg-green-600 text-white rounded-xl shadow-lg flex items-center justify-center text-center font-bold text-lg px-3"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            boxShadow: "0 4px 12px #0003",
          }}
        >
          {answer}
        </div>
      </div>
    </div>
  );
}
