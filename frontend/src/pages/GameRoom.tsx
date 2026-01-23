import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import character from "../assets/character_placeholder.png";
import door from "../assets/door_placeholder.png";

type Choice = { id: number; text: string };
type Question = { id: number; text: string; ordering?: number };

export default function GameRoom() {
  const { quizId } = useParams<{ quizId: string }>();
  const [session, setSession] = useState<{ id: number; lives: number } | null>(
    null
  );
  const [question, setQuestion] = useState<Question | null>(null);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [isAnswering, setIsAnswering] = useState(false);
  const [resultMsg, setResultMsg] = useState("");
  const [lives, setLives] = useState(3);

  type MockQuiz = {
    questions: Question[];
    choices: { [key: number]: Choice[] };
    correct: { [key: number]: number };
  };

  const mockQuiz: MockQuiz = {
    questions: [
      { id: 101, text: "Who is the founder of TiniThink?" },
      { id: 102, text: "What color is the sky?" },
      { id: 103, text: "Which door has the key?" },
    ],
    choices: {
      101: [
        { id: 201, text: "Royeth" },
        { id: 202, text: "Aguilar" },
      ],
      102: [
        { id: 301, text: "Blue" },
        { id: 302, text: "Green" },
      ],
      103: [
        { id: 401, text: "Left" },
        { id: 402, text: "Right" },
      ],
    },
    correct: { 101: 201, 102: 301, 103: 401 },
  };

  useEffect(() => {
    async function start() {
      try {
        const res = await fetch("http://localhost:8080/api/game/start", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
          },
          body: JSON.stringify({ quizId: Number(quizId ?? 1) }),
        });
        if (!res.ok) throw new Error("no backend");
        const data = await res.json();
        setSession(data.session);
        setQuestion(data.currentQuestion);
        setChoices(data.currentChoices);
        setLives(data.lives ?? 3);
        return;
      } catch (err) {
        // fallback to mock
        setSession({ id: 1, lives: 3 });
        setQuestion(mockQuiz.questions[0]);
        setChoices(mockQuiz.choices[mockQuiz.questions[0].id]);
        setLives(3);
      }
    }
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  async function handleChoice(choiceId: number) {
    if (!session || !question || isAnswering) return;
    setIsAnswering(true);
    setResultMsg("");

    try {
      const res = await fetch(
        `http://localhost:8080/api/game/${session.id}/answer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
          },
          body: JSON.stringify({ questionId: question.id, choiceId }),
        }
      );

      if (!res.ok) {
        // fallback to local logic if backend inaccessible
        const correct = mockQuiz.correct[question.id];
        const isCorrect = correct === choiceId;
        if (isCorrect) {
          setResultMsg("Tama! 🎉");
        } else {
          setResultMsg("Mali!");
          setLives((s) => Math.max(0, s - 1));
        }
        // move to next mock question
        const idx = mockQuiz.questions.findIndex((q) => q.id === question.id);
        const next = mockQuiz.questions[idx + 1] ?? null;
        setTimeout(() => {
          setQuestion(next);
          if (next) setChoices(mockQuiz.choices[next.id]);
          setIsAnswering(false);
          setResultMsg("");
        }, 700);
        return;
      }

      const payload = await res.json();
      setResultMsg(payload.isCorrect ? "Tama! 🎉" : "Mali!");
      setLives(payload.newLives ?? lives - (payload.isCorrect ? 0 : 1));

      if (payload.finished) {
        setTimeout(() => {
          setQuestion(null);
          setChoices([]);
        }, 900);
      } else {
        setTimeout(() => {
          setQuestion(payload.nextQuestion);
          setChoices(payload.nextChoices || []);
          setIsAnswering(false);
          setResultMsg("");
        }, 700);
      }
    } catch (err) {
      setIsAnswering(false);
      setResultMsg("Network error");
    }
  }

  if (!question) {
    return (
      <div className="h-screen flex items-center justify-center bg-linear-to-b from-black to-gray-900 text-white">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Game Over / Finished</h2>
          <p className="mt-2 text-gray-300">
            Thanks for playing — replay from the menu.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-black to-gray-900 text-white">
      <div className="w-full max-w-3xl lg:max-w-5xl px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="text-lg">
            Lives: <span className="font-mono">{"❤️".repeat(lives)}</span>
          </div>
          <div className="text-sm text-gray-400">Quiz: {quizId}</div>
        </div>

        <div className="flex justify-center mb-8">
          <img
            src={character}
            alt="Character"
            className="w-32 h-32 sm:w-40 sm:h-40 object-contain drop-shadow-2xl"
          />
        </div>

        <div className="bg-neutral-800 p-4 sm:p-6 rounded-xl mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-center">
            {question.text}
          </h1>
        </div>

        <div
          className={`grid gap-4 sm:gap-6 ${
            choices.length === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2"
          }`}
        >
          {choices.map((c) => (
            <div
              key={c.id}
              onClick={() => handleChoice(c.id)}
              className={`bg-linear-to-br from-red-700 to-red-900 rounded-xl p-4 sm:p-6 cursor-pointer hover:scale-105 transform transition ${
                isAnswering ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <img
                  src={door}
                  alt="Door"
                  className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
                />
                <div className="text-white font-bold text-center text-sm sm:text-base">
                  {c.text}
                </div>
              </div>
            </div>
          ))}
        </div>

        {resultMsg && (
          <div className="mt-6 text-center text-2xl font-bold animate-pulse">
            {resultMsg}
          </div>
        )}
      </div>
    </div>
  );
}
