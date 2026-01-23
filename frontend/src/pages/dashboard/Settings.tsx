import React, { useState } from "react";

const Settings: React.FC = () => {
  const [username, setUsername] = useState<string>("user123");
  const [email, setEmail] = useState<string>("user@example.com");
  const [notifications, setNotifications] = useState<boolean>(true);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    alert("Settings saved (not really, this is just a frontend demo)!");
  }

  return (
    <div className="w-full flex items-center justify-center">
      <div className="max-w-md sm:max-w-lg lg:max-w-2xl w-full mx-auto p-4 sm:p-6 bg-black/70 rounded-xl">
        <h2 className="text-2xl font-bold text-[#00ffff] mb-6">Settings</h2>
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="font-semibold block mb-1" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 rounded bg-gray-800 text-white"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded bg-gray-800 text-white"
              autoComplete="email"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              id="notifications"
            />
            <label htmlFor="notifications" className="font-semibold">
              Email Notifications
            </label>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-[#00ffff] text-black rounded font-bold"
          >
            Save Settings
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
