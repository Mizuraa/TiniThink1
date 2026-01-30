import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Choice = { text: string; correct: boolean };
type Question = { text: string; choices: Choice[] };
type Game = {
  id: string;
  title: string;
  creator_id: string;
  questions: Question[];
};

export default function MyGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [qText, setQText] = useState("");
  const [choiceInputs, setChoiceInputs] = useState<
    { text: string; isCorrect: boolean }[]
  >([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);

  useEffect(() => {
    loadGames();
  }, []);

  async function loadGames() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.log("No user logged in");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("creator_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setGames(data || []);
    } catch (e: any) {
      console.error("Error loading games:", e);
      alert("⚠️ ERROR LOADING GAMES: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(gameId: string) {
    if (!window.confirm("⚠️ DELETE THIS QUIZ?")) return;

    setLoadingId(gameId);
    try {
      const { error } = await supabase
        .from("quizzes")
        .delete()
        .eq("id", gameId);

      if (error) throw error;

      setGames((games) => games.filter((g) => g.id !== gameId));
      alert("✓ QUIZ DELETED");
    } catch (e: any) {
      console.error("Delete error:", e);
      alert("⚠️ DELETE FAILED: " + e.message);
    } finally {
      setLoadingId(null);
    }
  }

  function updateChoiceInput(idx: number, v: string) {
    setChoiceInputs(
      choiceInputs.map((c, i) => (i === idx ? { ...c, text: v } : c)),
    );
  }

  function markCorrect(idx: number) {
    setChoiceInputs(
      choiceInputs.map((c, i) => ({
        ...c,
        isCorrect: i === idx,
      })),
    );
  }

  function addQuestion() {
    if (!qText.trim()) {
      alert("⚠️ ENTER QUESTION");
      return;
    }
    if (!choiceInputs.some((c) => c.isCorrect)) {
      alert("⚠️ SELECT CORRECT ANSWER");
      return;
    }
    const clonedChoices = choiceInputs.map((c) => ({ ...c }));
    setQuestions((questions) => [
      ...questions,
      {
        text: qText.trim(),
        choices: clonedChoices.map((c) => ({
          text: c.text,
          correct: c.isCorrect,
        })),
      },
    ]);
    setQText("");
    setChoiceInputs([
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ]);
  }

  async function saveGame() {
    if (!title.trim()) {
      alert("⚠️ ENTER TITLE");
      return;
    }

    if (questions.length === 0) {
      alert("⚠️ ADD AT LEAST ONE QUESTION");
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
      const { error } = await supabase.from("quizzes").insert({
        title: title.trim(),
        creator_id: user.id,
        questions: questions,
      });

      if (error) throw error;

      alert("✓ GAME SAVED!");
      setTitle("");
      setQuestions([]);
      setShowCreate(false);
      loadGames();
    } catch (e: any) {
      console.error("Save error:", e);
      alert("⚠️ SAVE FAILED: " + e.message);
    }
  }

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center p-8">
        <div className="pixel-font text-purple-300 text-sm">LOADING...</div>
      </div>
    );
  }

  return (
    <div className="w-full flex items-start justify-center pixel-art">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        
        .pixel-art {
          font-family: 'Press Start 2P', monospace;
          image-rendering: pixelated;
          image-rendering: crisp-edges;
        }
        
        .pixel-art * {
          image-rendering: pixelated;
          image-rendering: crisp-edges;
        }
        
        .pixel-border {
          box-shadow: 
            0 0 0 2px #000,
            0 0 0 4px currentColor,
            4px 4px 0 4px #000;
        }
        
        .pixel-glow {
          filter: drop-shadow(0 0 2px currentColor) drop-shadow(0 0 4px currentColor);
        }
      `}</style>

      <div className="w-full max-w-xl lg:max-w-3xl">
        <h2
          className="text-xl md:text-2xl font-bold text-purple-300 mb-6 pixel-glow"
          style={{ lineHeight: "1.8" }}
        >
          MY GAMES
        </h2>

        <button
          onClick={() => setShowCreate(!showCreate)}
          className="mb-6 px-6 py-3 bg-purple-600 text-white font-bold pixel-border border-purple-500 hover:bg-purple-700 transition-colors text-sm"
          style={{ imageRendering: "pixelated" }}
        >
          {showCreate ? "CANCEL" : "CREATE GAME"}
        </button>

        {/* Create Game Form */}
        {showCreate && (
          <div className="mb-6 p-6 bg-black border-2 border-purple-500 pixel-border">
            <h3 className="text-lg font-bold text-cyan-400 mb-4 pixel-glow">
              CREATE NEW GAME
            </h3>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="GAME TITLE"
              className="w-full px-4 py-3 rounded-xl bg-black text-purple-300 mb-5 border border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400 font-semibold pixel-font text-sm"
            />

            <label className="text-sm text-cyan-400 mb-1 block pixel-font">
              QUESTION
            </label>
            <textarea
              value={qText}
              onChange={(e) => setQText(e.target.value)}
              placeholder="TYPE YOUR QUESTION"
              className="w-full px-4 py-3 rounded-xl bg-black text-white mb-4 border border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 pixel-font text-sm"
              rows={2}
            />

            <div className="mb-4">
              <div className="text-sm text-cyan-400 mb-2 pixel-font">
                CHOICES
              </div>
              {choiceInputs.map((c, i) => (
                <div key={i} className="flex gap-2 mb-2 items-center">
                  <input
                    value={c.text}
                    onChange={(e) => updateChoiceInput(i, e.target.value)}
                    placeholder={`CHOICE ${i + 1}`}
                    className="flex-1 px-3 py-2 rounded-lg bg-black text-white border border-cyan-400 focus:outline-none pixel-font text-xs"
                  />
                  <input
                    type="radio"
                    name="correct"
                    checked={c.isCorrect}
                    onChange={() => markCorrect(i)}
                    className="accent-purple-500"
                  />
                  <span className="text-xs text-purple-300 pixel-font">
                    CORRECT
                  </span>
                </div>
              ))}
              <button
                onClick={addQuestion}
                className="w-full py-2 rounded-lg bg-cyan-600 text-black font-bold shadow-lg hover:bg-cyan-500 transition pixel-font text-xs"
              >
                ADD QUESTION
              </button>
            </div>

            {questions.length > 0 && (
              <div className="mb-4">
                <h4 className="font-bold text-purple-300 mb-2 pixel-font text-sm">
                  QUESTIONS ADDED: {questions.length}
                </h4>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {questions.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-black/60 rounded-xl border border-cyan-400/40"
                    >
                      <div className="text-cyan-400 font-bold pixel-font text-xs">
                        {q.text}
                      </div>
                      <ul className="text-xs">
                        {q.choices.map((c, i) => (
                          <li
                            key={i}
                            className="text-purple-300 pixel-font text-[10px]"
                          >
                            {c.text}{" "}
                            {c.correct && (
                              <span className="text-green-400 font-bold">
                                (CORRECT)
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={saveGame}
              className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold shadow-lg hover:bg-purple-500 transition pixel-font text-sm"
            >
              SAVE GAME
            </button>
          </div>
        )}

        {/* Games List */}
        <div className="mt-6 space-y-4">
          {games.length === 0 && (
            <div
              className="text-purple-300 bg-black p-6 pixel-border border-purple-500 text-xs"
              style={{ lineHeight: "2" }}
            >
              NO GAMES YET.
            </div>
          )}
          {games.map((game) => (
            <div
              key={game.id}
              className="p-4 bg-black pixel-border border-purple-500 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div className="flex-1">
                <div
                  className="font-bold text-purple-300 pixel-glow mb-2 text-sm"
                  style={{ lineHeight: "1.8" }}
                >
                  {game.title.toUpperCase()}
                </div>
                <div
                  className="text-gray-300 text-xs"
                  style={{ lineHeight: "1.8" }}
                >
                  QUESTIONS: {game.questions.length}
                </div>
              </div>
              <div className="flex gap-3 flex-wrap">
                <button
                  className="px-4 py-2 bg-red-900 text-white font-bold pixel-border border-red-700 hover:bg-red-950 transition-colors text-xs"
                  onClick={() => handleDelete(game.id)}
                  disabled={loadingId === game.id}
                  title="Delete quiz"
                >
                  {loadingId === game.id ? "DEL..." : "DELETE"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
