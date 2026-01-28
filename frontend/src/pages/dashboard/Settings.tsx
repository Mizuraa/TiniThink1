import React, { useState } from "react";

const Settings: React.FC = () => {
  const [username, setUsername] = useState<string>("PLAYER_1");
  const [email, setEmail] = useState<string>("user@example.com");
  const [notifications, setNotifications] = useState<boolean>(true);

  function handleSave() {
    alert("✓ SETTINGS SAVED!");
  }

  return (
    <div className="w-full flex items-center justify-center">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        .pixel-font { font-family: 'Press Start 2P', cursive; }
        .pixel-box { border-radius: 0; }
        .pixel-shadow { box-shadow: 4px 4px 0 rgba(139, 92, 246, 0.4), 6px 6px 0 rgba(88, 28, 135, 0.2); }
        input::placeholder { font-family: 'Press Start 2P', cursive; font-size: 0.5rem; }
        @media (min-width: 640px) { input::placeholder { font-size: 0.6rem; } }
      `}</style>

      <div className="max-w-md sm:max-w-lg lg:max-w-2xl w-full mx-auto p-4 sm:p-6 bg-purple-950/70 pixel-box border-2 sm:border-4 border-purple-500 pixel-shadow">
        <h2 className="text-lg sm:text-2xl pixel-font text-purple-300 mb-4 sm:mb-6">
          SETTINGS
        </h2>

        <div className="space-y-4 sm:space-y-6">
          <div>
            <label
              className="pixel-font text-[10px] sm:text-xs text-purple-300 block mb-2"
              htmlFor="username"
            >
              USERNAME
            </label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-3 pixel-box bg-purple-950/50 border-2 border-purple-500 text-white pixel-font text-[10px] sm:text-xs focus:outline-none focus:border-purple-400"
              autoComplete="username"
            />
          </div>

          <div>
            <label
              className="pixel-font text-[10px] sm:text-xs text-purple-300 block mb-2"
              htmlFor="email"
            >
              EMAIL
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-3 pixel-box bg-purple-950/50 border-2 border-purple-500 text-white pixel-font text-[10px] sm:text-xs focus:outline-none focus:border-purple-400"
              autoComplete="email"
            />
          </div>

          <div className="flex items-center gap-3 p-4 bg-purple-900/50 pixel-box border-2 border-purple-600">
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              id="notifications"
              className="w-5 h-5"
            />
            <label
              htmlFor="notifications"
              className="pixel-font text-[10px] sm:text-xs text-purple-300"
            >
              EMAIL NOTIFICATIONS
            </label>
          </div>

          <button
            onClick={handleSave}
            className="w-full px-4 py-4 bg-cyan-600 active:bg-cyan-500 border-2 sm:border-4 border-cyan-400 text-white pixel-box pixel-font text-[10px] sm:text-xs min-h-[44px]"
          >
            ► SAVE SETTINGS
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
