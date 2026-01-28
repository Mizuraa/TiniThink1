import { useEffect, useState } from "react";

type Choice = { id: number; text: string };
type Q = { id: number; text: string; choices: Choice[]; correctId: number };

const SAMPLE_QUESTIONS: Q[] = [
  {
    id: 1,
    text: "WHAT IS 2 + 2?",
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
    text: "WHICH ANIMAL BARKS?",
    choices: [
      { id: 21, text: "CAT" },
      { id: 22, text: "DOG" },
      { id: 23, text: "COW" },
      { id: 24, text: "BIRD" },
    ],
    correctId: 22,
  },
  {
    id: 3,
    text: "SKY COLOR ON CLEAR DAY?",
    choices: [
      { id: 31, text: "GREEN" },
      { id: 32, text: "BLUE" },
      { id: 33, text: "RED" },
      { id: 34, text: "BROWN" },
    ],
    correctId: 32,
  },
];

export default function Game() {
  const [questions] = useState<Q[]>(SAMPLE_QUESTIONS);
  const [index, setIndex] = useState(0);
  const [lives, setLives] = useState(3);
  const [selected, setSelected] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
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
    setIsAnimating(true);

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }

    const isCorrect = choiceId === current.correctId;

    if (isCorrect) {
      setTimeout(() => advanceQuestion(), 500);
    } else {
      setLives((s) => {
        const next = Math.max(0, s - 1);
        if (next === 0) {
          setTimeout(() => setFinished(true), 600);
        }
        return next;
      });
      setTimeout(() => {
        setSelected(null);
        setIsAnimating(false);
      }, 600);
    }
  }

  function advanceQuestion() {
    setIsAnimating(false);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-950 to-indigo-950 text-white p-4 sm:p-6">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
          .pixel-font { font-family: 'Press Start 2P', cursive; }
          .pixel-box { border-radius: 0; }
          .pixel-shadow { box-shadow: 6px 6px 0 rgba(139, 92, 246, 0.5), 8px 8px 0 rgba(88, 28, 135, 0.3); }
        `}</style>

        <div className="max-w-md sm:max-w-2xl w-full text-center bg-purple-950/80 pixel-box border-4 sm:border-8 border-purple-500 p-6 sm:p-8 pixel-shadow">
          <h2 className="text-xl sm:text-3xl pixel-font mb-4 text-cyan-300">
            GAME OVER
          </h2>
          <p className="text-purple-300 mb-6 pixel-font text-[10px] sm:text-sm">
            {lives > 0 ? "YOU COMPLETED!" : "NO LIVES LEFT!"}
          </p>
          <button
            onClick={() => {
              setIndex(0);
              setLives(3);
              setFinished(false);
              setSelected(null);
            }}
            className="w-full sm:w-auto px-6 py-4 pixel-box bg-pink-600 border-4 border-pink-400 text-white pixel-font text-xs sm:text-sm min-h-[44px]"
          >
            ► PLAY AGAIN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-950 to-indigo-950 p-4 sm:p-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        .pixel-font { font-family: 'Press Start 2P', cursive; }
        .pixel-box { border-radius: 0; }
        .pixel-shadow { box-shadow: 4px 4px 0 rgba(139, 92, 246, 0.4), 6px 6px 0 rgba(88, 28, 135, 0.2); }
      `}</style>

      <div className="w-full max-w-2xl sm:max-w-3xl lg:max-w-4xl">
        <div className="flex justify-between items-center mb-4 sm:mb-6 pixel-font text-[10px] sm:text-sm text-purple-300">
          <div>
            Q {index + 1} / {questions.length}
          </div>
          <div>
            LIVES: <span className="text-pink-400">{"❤️".repeat(lives)}</span>
          </div>
        </div>

        <div className="bg-purple-950 text-white pixel-box border-2 sm:border-4 border-purple-500 p-4 sm:p-6 mb-6 pixel-shadow">
          <h3 className="text-sm sm:text-lg pixel-font text-cyan-300 text-center leading-relaxed">
            {current.text}
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 place-items-center">
          {current.choices.map((choice) => {
            const isSelected = selected === choice.id;
            const isCorrect = choice.id === current.correctId;
            const showResult = isSelected && isAnimating;

            return (
              <button
                key={choice.id}
                onClick={() => handleChoose(choice.id)}
                disabled={isAnimating}
                className={`
                  w-full min-h-[100px] sm:min-h-[120px] 
                  pixel-box border-4 
                  flex items-center justify-center 
                  text-white pixel-font text-[10px] sm:text-xs 
                  transition-all active:scale-95
                  min-w-[44px]
                  ${
                    showResult && isCorrect
                      ? "bg-green-600 border-green-400 pixel-shadow"
                      : showResult
                        ? "bg-red-600 border-red-400"
                        : "bg-purple-700 border-purple-400 hover:bg-purple-600"
                  }
                  ${isAnimating ? "pointer-events-none" : ""}
                `}
              >
                <div className="px-3 text-center">{choice.text}</div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-purple-400 pixel-font text-[9px] sm:text-[10px]">
            TAP TO CHOOSE
          </p>
        </div>
      </div>
    </div>
  );
}
