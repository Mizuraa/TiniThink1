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
          "Error loading games: " + (e instanceof Error ? e.message : String(e))
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
    <div className="w-full flex items-start justify-center">
      <div className="w-full max-w-xl lg:max-w-3xl">
        <h2 className="text-2xl font-bold text-[#00ffff] mb-4 drop-shadow-[0_0_12px_#00ffff]">
          My Games
        </h2>
        <button
          onClick={() => setShowCreate(true)}
          className="mb-6 px-4 py-2 rounded bg-[#ff69b4] text-white font-bold shadow-[0_0_14px_#ff69b4] hover:bg-[#ea53a6] transition"
        >
          Create Game
        </button>

        {showCreate && (
          <CreateGame
            onCreated={() => {
              setShowCreate(false);
              fetch(
                `http://localhost:8080/game/my-games?creatorId=${creatorId}`
              )
                .then((res) => res.json())
                .then(setGames);
            }}
          />
        )}

        <div className="mt-4 space-y-4">
          {games.length === 0 && (
            <div className="text-[#00ffff] bg-black/60 rounded p-4 shadow-[0_0_10px_#00ffff2a]">
              No games yet.
            </div>
          )}
          {games.map((game) => (
            <div
              key={game.id}
              className="p-3 bg-black border-2 border-[#00ffff] rounded-xl flex justify-between items-center shadow-[0_0_18px_#00ffff4a]"
            >
              <div>
                <div className="font-bold text-[#00ffff] drop-shadow-[0_0_8px_#00ffff]">
                  {game.title}
                </div>
                <div className="text-gray-300 text-sm">
                  Questions: {game.questions.length}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 rounded bg-[#00ffff]/20 text-[#00ffff] font-semibold shadow-[0_0_8px_#00ffff] hover:bg-[#00ffff]/40 transition"
                  onClick={() => setPlayOptionsGame(game)}
                  title="Play quiz"
                >
                  Play
                </button>
                <button
                  className="px-3 py-1 rounded bg-[#ff69b4]/20 text-[#ff69b4] font-semibold shadow-[0_0_8px_#ff69b4] hover:bg-[#ff69b4]/40 transition"
                  onClick={() => setEditingGame(game)}
                  title="Edit quiz"
                >
                  Edit
                </button>
                <button
                  className="px-3 py-1 rounded bg-[#ff1744]/20 text-[#ff1744] font-semibold shadow-[0_0_8px_#ff1744] hover:bg-[#ff1744]/40 transition"
                  onClick={() => handleDelete(game.id)}
                  disabled={loadingId === game.id}
                  title="Delete quiz"
                >
                  {loadingId === game.id ? "Deleting..." : "Delete"}
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
