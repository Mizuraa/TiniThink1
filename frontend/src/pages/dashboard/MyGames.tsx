import { useEffect, useState } from "react";
import { EditGame } from "../../components/EditGame";
import { PlayGame } from "../../components/PlayGame";
import { PlayOptionsModal } from "../../components/PlayOptionsModal";
import CreateGame from "../CreateGame";

type Choice = { text: string; correct: boolean };
type Question = { text: string; choices: Choice[] };
type Game = {
  id: string;
  title: string;
  creatorId: string;
  questions: Question[];
};

export default function MyGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [playingGame, setPlayingGame] = useState<Game | null>(null);
  const [playOptionsGame, setPlayOptionsGame] = useState<Game | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const creatorId = "user123";

  useEffect(() => {
    fetch(`http://localhost:8080/game/my-games?creatorId=${creatorId}`)
      .then((res) => res.json())
      .then(setGames)
      .catch((e) => {
        alert(
          "Error loading games: " +
            (e instanceof Error ? e.message : String(e)),
        );
      });
  }, []);

  async function handleDelete(gameId: string) {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;
    setLoadingId(gameId);
    try {
      const res = await fetch(`http://localhost:8080/game/${gameId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const text = await res.text();
        alert("Failed to delete quiz:\n" + text);
      } else {
        setGames((games) => games.filter((g) => g.id !== gameId));
      }
    } catch (e) {
      alert("Error deleting quiz: " + String(e));
    }
    setLoadingId(null);
  }

  const handleGameEdited = async () => {
    setEditingGame(null);
    fetch(`http://localhost:8080/game/my-games?creatorId=${creatorId}`)
      .then((res) => res.json())
      .then(setGames);
  };

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
          onClick={() => setShowCreate(true)}
          className="mb-6 px-6 py-3 bg-purple-600 text-white font-bold pixel-border border-purple-500 hover:bg-purple-700 transition-colors text-sm"
          style={{ imageRendering: "pixelated" }}
        >
          CREATE GAME
        </button>

        {showCreate && (
          <CreateGame
            onCreated={() => {
              setShowCreate(false);
              fetch(
                `http://localhost:8080/game/my-games?creatorId=${creatorId}`,
              )
                .then((res) => res.json())
                .then(setGames);
            }}
          />
        )}

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
                  className="px-4 py-2 bg-purple-600 text-white font-bold pixel-border border-purple-500 hover:bg-purple-700 transition-colors text-xs"
                  onClick={() => setPlayOptionsGame(game)}
                  title="Play quiz"
                >
                  PLAY
                </button>
                <button
                  className="px-4 py-2 bg-purple-700 text-white font-bold pixel-border border-purple-600 hover:bg-purple-800 transition-colors text-xs"
                  onClick={() => setEditingGame(game)}
                  title="Edit quiz"
                >
                  EDIT
                </button>
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

        {editingGame && (
          <EditGame
            game={editingGame}
            onClose={() => setEditingGame(null)}
            onSaved={handleGameEdited}
          />
        )}
        {playingGame && (
          <PlayGame game={playingGame} onClose={() => setPlayingGame(null)} />
        )}
        {playOptionsGame && (
          <PlayOptionsModal
            game={playOptionsGame}
            onSolo={() => {
              setPlayingGame(playOptionsGame);
              setPlayOptionsGame(null);
            }}
            onInvite={() => setPlayOptionsGame(null)}
            onCancel={() => setPlayOptionsGame(null)}
          />
        )}
      </div>
    </div>
  );
}
