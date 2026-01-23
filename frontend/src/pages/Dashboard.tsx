import { useState } from "react";
import MyGames from "./dashboard/MyGames";
import CreateGame from "./CreateGame";
import Folder from "./dashboard/Folder";
import Flashcard from "./dashboard/Flashcard";
import { Reviewer } from "./dashboard/Reviewer";
import Groups from "./dashboard/Groups";
import type { GroupType } from "./dashboard/Groups";
import Settings from "./dashboard/Settings";
import Profile from "./dashboard/Profile";
import type { UserType } from "./dashboard/Profile";
import Logout from "./dashboard/Logout";

type MenuKey =
  | "home"
  | "create"
  | "mygames"
  | "flashcard"
  | "folder"
  | "reviewer"
  | "groups"
  | "profile"
  | "settings"
  | "logout";

const initialUser: UserType = {
  username: "user123",
  email: "user@example.com",
  age: 17,
  school: "STI College Ortigas-Cainta",
  highestPoints: 0,
  friends: [""],
  ranking: { group: "", rank: 1 },
  status: "online",
  avatar:
    "https://coin-images.coingecko.com/coins/images/69983/large/uvpdfjkfxrxbhhhq3pwqadwqkjn4.?1760269793",
};

function RecentGames() {
  const games = [
    { title: "Math Quiz", icon: "🧮" },
    { title: "Memorization", icon: "🧠" },
    { title: "Flashcard Quiz", icon: "🎴" },
  ];
  return (
    <div className="flex flex-col items-center w-full">
      <div className="text-lg sm:text-xl font-bold text-[#c776d6] mb-3 flex gap-2 items-center drop-shadow-[0_0_10px_#e0c3fc]">
        <span className="text-xl sm:text-2xl">🎮</span> Recent Games
      </div>
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        {games.map((game, idx) => (
          <div
            key={idx}
            className="bg-black border-2 border-[#c776d6] rounded-xl p-3 sm:p-5 min-w-[150px] sm:min-w-[170px] flex flex-col items-center shadow-[0_0_12px_#c776d6]"
          >
            <div className="text-3xl sm:text-4xl mb-2">{game.icon}</div>
            <div className="font-semibold text-[#c776d6] mb-2 drop-shadow-[0_0_8px_#c776d6] text-sm sm:text-base text-center">
              {game.title}
            </div>
            <button className="rounded bg-linear-to-r from-[#c776d6] to-[#e0c3fc] px-3 py-1 text-white text-xs sm:text-sm font-bold mt-1 shadow-[0_0_8px_#c776d6] hover:from-[#e0c3fc] hover:to-[#c776d6] transition">
              {idx % 2 === 0 ? "Continue" : "Play Again"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function RightSidebar() {
  const [open, setOpen] = useState(true);

  return (
    <aside className="w-full bg-black/80 backdrop-blur-sm rounded-xl p-3 border-2 border-[#e0c3fc] mt-3 lg:mt-0 text-xs sm:text-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 text-left"
      >
        <span className="font-semibold text-[#c776d6] text-sm drop-shadow-[0_0_6px_#e0c3fc]">
          Announcements
        </span>
        <span
          className={`inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#e0c3fc]/40 text-[#e0c3fc] text-xs transition-transform ${
            open ? "rotate-0" : "-rotate-90"
          }`}
        >
          ▸
        </span>
      </button>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
          open
            ? "grid-rows-[1fr] opacity-100 mt-2"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden flex flex-col gap-2">
          <div className="rounded bg-black text-[#e0c3fc] px-3 py-2 border border-[#e0c3fc]/30 shadow-[0_0_8px_#e0c3fc40]">
            🆕 New feature coming soon
          </div>
          <div className="rounded bg-black text-[#c776d6] px-3 py-2 border border-[#c776d6]/40 shadow-[0_0_8px_#c776d660]">
            📅 Check your schedule
          </div>
          <div className="rounded bg-black text-[#e0c3fc] px-3 py-2 border border-[#e0c3fc]/30 shadow-[0_0_8px_#e0c3fc40]">
            🏆 Leaderboard updated
          </div>
        </div>
      </div>
    </aside>
  );
}

export default function Dashboard() {
  const [active, setActive] = useState<MenuKey>("home");
  const [groups, setGroups] = useState<GroupType[]>([]);
  const [user, setUser] = useState<UserType>(initialUser);

  function renderContent() {
    switch (active) {
      case "create":
        return <CreateGame onCreated={() => setActive("mygames")} />;
      case "mygames":
        return <MyGames />;
      case "folder":
        return <Folder />;
      case "flashcard":
        return <Flashcard />;
      case "reviewer":
        return <Reviewer />;
      case "groups":
        return <Groups groups={groups} setGroups={setGroups} user={user} />;
      case "settings":
        return <Settings />;
      case "profile":
        return (
          <Profile
            user={user}
            setUser={setUser}
            groups={groups}
            setGroups={setGroups}
          />
        );
      case "logout":
        return <Logout />;
      default:
        return <RecentGames />;
    }
  }

  return (
    <div
      className="
        min-h-screen
        flex flex-col
        bg-black text-white
        overflow-hidden        /* desktop & tablet: no scroll */
        max-sm:overflow-y-auto /* phones: vertical scroll when needed */
        max-sm:overflow-x-hidden
      "
      style={{
        background: "linear-gradient(to bottom, #3a2d71 0%, #243b55 100%)",
      }}
    >
      {/* top banner */}
      <div className="w-full px-4 sm:px-8 max-w-4xl mx-auto flex justify-center pt-4 sm:pt-6 pb-3">
        <div
          className="w-full px-6 sm:px-8 py-4 sm:py-5 rounded-xl border-2 border-[#c776d6] shadow-[0_0_20px_#c776d6] text-center bg-black"
          style={{
            background: "rgba(20,20,20,0.96)",
          }}
        >
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#c776d6] drop-shadow-[0_0_10px_#e0c3fc] leading-tight">
            Welcome to Tinithink
          </h1>
          <div className="text-[#e0c3fc] mt-2 font-medium drop-shadow-[0_0_8px_#e0c3fc] text-sm sm:text-base">
            Your student hub for learning, organizing, and reviewing.
          </div>
        </div>
      </div>

      {/* body */}
      <div className="flex-1 w-full max-w-5xl xl:max-w-6xl mx-auto flex flex-wrap lg:flex-nowrap items-start lg:items-stretch gap-4 lg:gap-6 px-4 sm:px-6 pb-4 sm:pb-6">
        {/* left sidebar */}
        <aside className="w-full lg:w-56 bg-black/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 flex flex-col gap-3 sm:gap-4 border-2 border-[#c776d6]">
          <nav className="flex flex-col gap-2">
            {[
              ["home", "Home"],
              ["folder", "Folder"],
              ["flashcard", "Flashcards"],
              ["reviewer", "Reviewer"],
              ["groups", "Groups"],
              ["mygames", "Games"],
              ["profile", "Profile"],
              ["settings", "Settings"],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActive(key as MenuKey)}
                className={`text-left px-3 py-3 sm:py-2 rounded-md font-bold text-sm sm:text-base min-h-11 flex items-center ${
                  active === key
                    ? "bg-linear-to-r from-[#c776d6]/30 to-[#e0c3fc]/30 text-[#c776d6] shadow-[0_0_10px_#c776d6]"
                    : "hover:bg-[#e0c3fc]/10 text-[#c776d6]"
                }`}
              >
                {label}
              </button>
            ))}
            <button
              onClick={() => setActive("logout")}
              className="text-left px-3 py-3 sm:py-2 rounded-md hover:bg-[#e0c3fc]/10 text-[#c776d6] font-bold text-sm sm:text-base min-h-11 flex items-center"
            >
              Logout
            </button>
          </nav>
          <div className="mt-auto border-t border-[#e0c3fc]/20 pt-3 sm:pt-4">
            <div className="text-xs sm:text-sm text-[#e0c3fc] mb-1 sm:mb-2">
              Account
            </div>
            <div className="text-sm text-white/80 truncate">
              {user.username}
            </div>
          </div>
        </aside>

        {/* main center */}
        <div className="flex-1 flex justify-center">
          <main className="w-full max-w-xl lg:max-w-3xl bg-black/70 backdrop-blur-lg rounded-xl p-4 sm:p-6 flex flex-col items-center justify-start shadow-[0_0_14px_#c776d6]">
            {renderContent()}
          </main>
        </div>

        {/* right sidebar */}
        <div className="w-full lg:w-40 xl:w-48 shrink-0">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}
