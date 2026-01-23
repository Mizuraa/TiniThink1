import { useState } from "react";

// Types
type ChoiceInput = { text: string; isCorrect: boolean };
type QuestionInput = { text: string; choices: ChoiceInput[] };

export default function CreateGame({ onCreated }: { onCreated?: () => void }) {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<QuestionInput[]>([]);
  const [qText, setQText] = useState("");
  const [choiceInputs, setChoiceInputs] = useState<ChoiceInput[]>([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);

  function updateChoiceInput(idx: number, v: string) {
    setChoiceInputs(
      choiceInputs.map((c, i) => (i === idx ? { ...c, text: v } : c))
    );
  }

  function markCorrect(idx: number) {
    setChoiceInputs(
      choiceInputs.map((c, i) => ({
        ...c,
        isCorrect: i === idx,
      }))
    );
  }

  function addQuestion() {
    if (!qText.trim()) return;
    if (!choiceInputs.some((c) => c.isCorrect)) {
      alert("Please select a correct answer.");
      return;
    }
    const clonedChoices = choiceInputs.map((c) => ({ ...c }));
    setQuestions((questions) => [
      ...questions,
      {
        text: qText.trim(),
        choices: clonedChoices,
      },
    ]);
    setQText("");
    setChoiceInputs([
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ]);
  }

  async function saveGame() {
    const payload = {
      title,
      creatorId: "user123",
      questions: questions.map((q) => ({
        text: q.text,
        timeLimit: 20,
        choices: q.choices.map((c) => ({
          text: c.text,
          correct: !!c.isCorrect,
        })),
      })),
    };

    try {
      const res = await fetch("http://localhost:8080/game/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.text();
        alert("Failed to save game:\n" + err);
        return;
      }
      alert("Game saved successfully!");
      setTitle("");
      setQuestions([]);
      if (onCreated) onCreated();
    } catch (e: any) {
      alert("Error saving game:\n" + e.message);
    }
  }

  return (
    <div className="w-full flex items-center justify-center">
      <div className="w-full max-w-md sm:max-w-lg lg:max-w-2xl mx-auto bg-black border-2 border-[#00ffff] rounded-xl shadow-[0_0_20px_#00ffff80] p-6 sm:p-8">
        <h2 className="text-2xl font-extrabold text-[#00ffff] mb-6 text-center drop-shadow-[0_0_12px_#00ffff]">
          Create Game
        </h2>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Game title"
          className="w-full px-4 py-3 rounded-xl bg-black text-[#ff69b4] mb-5 border border-[#ff69b4] focus:outline-none focus:ring-2 focus:ring-[#ff69b4] font-semibold"
        />
        <label className="text-sm text-[#00ffff] mb-1 block">Question</label>
        <textarea
          value={qText}
          onChange={(e) => setQText(e.target.value)}
          placeholder="Type your question"
          className="w-full px-4 py-3 rounded-xl bg-black text-white mb-4 border border-[#00ffff] focus:outline-none focus:ring-2 focus:ring-[#00ffff]"
          rows={2}
        />
        <div className="mb-4">
          <div className="text-sm text-[#00ffff] mb-2">Choices</div>
          {choiceInputs.map((c, i) => (
            <div key={i} className="flex gap-2 mb-2 items-center">
              <input
                value={c.text}
                onChange={(e) => updateChoiceInput(i, e.target.value)}
                placeholder={`Choice ${i + 1}`}
                className="flex-1 px-3 py-2 rounded-lg bg-black text-white border border-[#00ffff] focus:outline-none"
              />
              <input
                type="radio"
                name="correct"
                checked={c.isCorrect}
                onChange={() => markCorrect(i)}
                className="accent-[#ff69b4]"
              />
              <span className="text-xs text-[#ff69b4]">Correct</span>
            </div>
          ))}
          <button
            onClick={addQuestion}
            className="w-full py-2 rounded-lg bg-[#00ffff] text-black font-bold shadow-[0_0_8px_#00ffff] hover:bg-[#00e6e6] transition"
          >
            Add Question
          </button>
        </div>
        <div>
          {questions.length > 0 && (
            <h3 className="font-bold text-[#ff69b4] mb-2">Questions Added</h3>
          )}
          <div className="max-h-64 overflow-y-auto space-y-2">
            {questions.map((q, idx) => (
              <div
                key={idx}
                className="mb-2 p-3 bg-black/60 rounded-xl border border-[#00ffff]/40"
              >
                <div className="text-[#00ffff] font-bold">{q.text}</div>
                <ul>
                  {q.choices.map((c, i) => (
                    <li key={i} className="text-[#ff69b4]">
                      {c.text}{" "}
                      {c.isCorrect && (
                        <span className="text-green-400 font-bold">
                          (correct)
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={saveGame}
          className="mt-6 w-full py-3 bg-[#ff69b4] text-white rounded-xl font-bold shadow-[0_0_10px_#ff69b4] hover:bg-[#ea53a6] transition"
        >
          Save Game
        </button>
      </div>
    </div>
  );
}
