import { useEffect, useState } from "react";

type Choice = { id: number; text: string };
type Q = { id: number; text: string; choices: Choice[]; correctId: number };

const SAMPLE_QUESTIONS: Q[] = [
  {
    id: 1,
    text: "Which one is 2 + 2?",
    choices: [
      { id: 11, text: "3" },
      { id: 12, text: "4" },
      { id: 13, text: "5" },
      { id: 14, text: "22" },
    ],
    correctId: 12,
  },
  {
    id: 2,
    text: "Which animal barks?",
    choices: [
      { id: 21, text: "Cat" },
      { id: 22, text: "Dog" },
      { id: 23, text: "Cow" },
      { id: 24, text: "Bird" },
    ],
    correctId: 22,
  },
  {
    id: 3,
    text: "Which color is the sky on a clear day?",
    choices: [
      { id: 31, text: "Green" },
      { id: 32, text: "Blue" },
      { id: 33, text: "Red" },
      { id: 34, text: "Brown" },
    ],
    correctId: 32,
  },
];

export default function Game() {
  const [questions] = useState<Q[]>(SAMPLE_QUESTIONS);
  const [index, setIndex] = useState(0);
  const [lives, setLives] = useState(3);
  const [selected, setSelected] = useState<number | null>(null);
  const [openedDoorId, setOpenedDoorId] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [shakeDoorId, setShakeDoorId] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  const current = questions[index];

  useEffect(() => {
    if (!current) {
      setFinished(true);
    }
  }, [current]);

  function handleChoose(choiceId: number) {
    if (isAnimating || finished) return;
    setSelected(choiceId);

    const isCorrect = choiceId === current.correctId;

    if (isCorrect) {
      setIsAnimating(true);
      setOpenedDoorId(choiceId);
      setTimeout(() => setZoom(true), 220);
      setTimeout(() => {
        advanceQuestion();
      }, 900);
    } else {
      setShakeDoorId(choiceId);
      setTimeout(() => setShakeDoorId(null), 500);
      setLives((s) => {
        const next = Math.max(0, s - 1);
        if (next === 0) {
          setTimeout(() => setFinished(true), 600);
        }
        return next;
      });
      setTimeout(() => setSelected(null), 600);
    }
  }

  function advanceQuestion() {
    setIsAnimating(false);
    setOpenedDoorId(null);
    setZoom(false);
    setSelected(null);
    const nextIndex = index + 1;
    if (nextIndex >= questions.length) {
      setFinished(true);
    } else {
      setIndex(nextIndex);
    }
  }

  if (!current || finished) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-[#111111] to-[#060606] text-white p-6">
        <div className="max-w-2xl w-full text-center">
          <h2 className="text-3xl font-bold mb-4 text-[#00ffff]">
            Run Finished
          </h2>
          <p className="text-gray-300 mb-6">
            {lives > 0 ? "You completed the run!" : "You ran out of lives!"}
          </p>
          <button
            onClick={() => {
              setIndex(0);
              setLives(3);
              setFinished(false);
              setSelected(null);
            }}
            className="px-6 py-3 rounded bg-[#ff69b4] text-black font-bold hover:scale-105 transition"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-linear-to-b from-[#111] to-[#050505] p-6"
      style={{ perspective: 1200 }}
    >
      <div
        className="w-full max-w-2xl sm:max-w-3xl lg:max-w-4xl relative"
        style={{
          transform: zoom ? "scale(1.18) translateZ(0)" : "scale(1)",
          transition: "transform 420ms ease-out",
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-300">
            Question {index + 1} / {questions.length}
          </div>
          <div className="text-sm text-gray-300">
            Lives: <span className="font-mono text-white">{lives}</span>
          </div>
        </div>

        <div className="bg-neutral-900 text-white rounded-xl p-5 sm:p-6 mb-6 shadow-lg">
          <h3 className="text-lg sm:text-xl font-bold text-[#00ffff]">
            {current.text}
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 place-items-center">
          {current.choices.map((choice, i) => {
            const isOpen = openedDoorId === choice.id;
            const isSelected = selected === choice.id;
            const isShaking = shakeDoorId === choice.id;
            const origin = i % 2 === 0 ? "left" : "right";
            const swingDeg = i % 2 === 0 ? -100 : 100;
            const rotateY = isOpen ? swingDeg : 0;
            const doorKey = `door-${choice.id}`;

            return (
              <div
                key={doorKey}
                className="w-36 h-44 sm:w-44 sm:h-52 relative transform-style-preserve-3d"
              >
                <div
                  onClick={() => handleChoose(choice.id)}
                  role="button"
                  tabIndex={0}
                  className="w-full h-full rounded-lg cursor-pointer select-none flex items-center justify-center bg-linear-to-b from-[#7a4a26] to-[#5a3319] text-white font-semibold shadow-xl border-2 border-[#3f2a16]"
                  style={{
                    transformOrigin: origin,
                    transition: isAnimating
                      ? "transform 420ms cubic-bezier(.22,.9,.35,1)"
                      : "transform 180ms ease",
                    transform: `rotateY(${rotateY}deg)`,
                    boxShadow: isSelected
                      ? "0 18px 35px rgba(255,105,180,0.12)"
                      : undefined,
                  }}
                >
                  <div
                    className={`px-2 text-center ${
                      isShaking ? "animate-shake" : ""
                    }`}
                    style={{ textShadow: "0 2px 10px rgba(0,0,0,0.6)" }}
                  >
                    {choice.text}
                  </div>
                </div>

                <div
                  className="absolute"
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    background: "#c9a66b",
                    right: i % 2 === 0 ? undefined : 14,
                    left: i % 2 === 0 ? 14 : undefined,
                    top: "50%",
                    transform: "translateY(-50%)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15)",
                  }}
                />
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-400">Pick a door — choose wisely.</p>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
          100% { transform: translateX(0); }
        }
        .animate-shake {
          animation: shake 450ms ease;
        }
      `}</style>
    </div>
  );
}
