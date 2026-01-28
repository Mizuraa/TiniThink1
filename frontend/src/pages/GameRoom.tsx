import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import character from "../assets/character_placeholder.png";
import door from "../assets/door_placeholder.png";

type Choice = { id: number; text: string };
type Question = { id: number; text: string; ordering?: number };

export default function GameRoom() {
  const { quizId } = useParams<{ quizId: string }>();
  const [session, setSession] = useState<{ id: number; lives: number } | null>(
    null,
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
        },
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
      <div className="h-screen flex items-center justify-center bg-black text-white pixel-art">
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
          
          .pixel-bg {
            background-image: 
              repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, transparent 1px, transparent 2px, rgba(255,255,255,0.03) 3px),
              repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, transparent 1px, transparent 2px, rgba(255,255,255,0.03) 3px);
          }
        `}</style>
        <div className="text-center p-8 bg-neutral-900 pixel-border border-purple-500">
          <h2
            className="text-2xl font-bold mb-4 pixel-glow text-purple-400"
            style={{ lineHeight: "1.8" }}
          >
            GAME OVER
          </h2>
          <p className="mt-4 text-gray-300 text-xs" style={{ lineHeight: "2" }}>
            THANKS FOR PLAYING
          </p>
          <p className="text-gray-400 text-xs mt-2" style={{ lineHeight: "2" }}>
            REPLAY FROM MENU
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white pixel-art pixel-bg">
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
        
        .pixel-bg {
          background-image: 
            repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, transparent 1px, transparent 2px, rgba(255,255,255,0.03) 3px),
            repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, transparent 1px, transparent 2px, rgba(255,255,255,0.03) 3px);
        }
        
        .pixel-bounce:hover {
          animation: bounce 0.3s ease-in-out;
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        
        .pixel-pulse {
          animation: pulse 1s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>

      <div className="w-full max-w-3xl lg:max-w-5xl px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div
            className="text-sm bg-neutral-900 px-4 py-2 pixel-border border-purple-500"
            style={{ lineHeight: "1.8" }}
          >
            LIVES: <span className="text-purple-400">{"♥".repeat(lives)}</span>
          </div>
          <div
            className="text-xs text-gray-400 bg-neutral-900 px-4 py-2 pixel-border border-gray-600"
            style={{ lineHeight: "1.8" }}
          >
            QUIZ: {quizId}
          </div>
        </div>

        <div className="flex justify-center mb-10">
          <div className="relative">
            <img
              src={character}
              alt="Character"
              className="w-32 h-32 sm:w-48 sm:h-48 object-contain pixel-glow"
              style={{ imageRendering: "pixelated" }}
            />
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-3 bg-black/50 rounded-full blur-sm"></div>
          </div>
        </div>

        <div className="bg-neutral-900 p-6 sm:p-8 mb-10 pixel-border border-purple-500">
          <h1
            className="text-base sm:text-lg font-bold text-center text-purple-300 pixel-glow"
            style={{ lineHeight: "2" }}
          >
            {question.text.toUpperCase()}
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
              className={`bg-purple-900 pixel-border border-purple-600 p-4 sm:p-6 cursor-pointer pixel-bounce transition-transform ${
                isAnswering ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              <div className="flex flex-col items-center gap-4">
                <img
                  src={door}
                  alt="Door"
                  className="w-16 h-16 sm:w-24 sm:h-24 object-contain"
                  style={{ imageRendering: "pixelated" }}
                />
                <div
                  className="text-white font-bold text-center text-xs sm:text-sm"
                  style={{ lineHeight: "1.8" }}
                >
                  {c.text.toUpperCase()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {resultMsg && (
          <div className="mt-8 text-center">
            <div className="inline-block bg-neutral-900 px-8 py-4 pixel-border border-purple-400">
              <span
                className="text-xl sm:text-2xl font-bold text-purple-300 pixel-pulse pixel-glow"
                style={{ lineHeight: "1.8" }}
              >
                {resultMsg.toUpperCase()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
