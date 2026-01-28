import { useState } from "react";
import {
  Home,
  FolderOpen,
  CreditCard,
  BookOpen,
  Users,
  Gamepad2,
  User,
  Settings,
  LogOut as LogOutIcon,
} from "lucide-react";

import Flashcard from "./dashboard/Flashcard";
import Reviewer from "./dashboard/Reviewer";
import MyGames from "./dashboard/MyGames";
import Profile from "./dashboard/Profile";
import SettingsPage from "./dashboard/Settings";
import LogoutPage from "./dashboard/Logout";
import FolderPage from "./dashboard/Folder";
import GroupsPage from "./dashboard/Groups";

// 1. Types

type MenuKey =
  | "home"
  | "folder"
  | "flashcard"
  | "reviewer"
  | "groups"
  | "mygames"
  | "profile"
  | "settings"
  | "logout";

type UserType = {
  username: string;
  email: string;
  age: number;
  school: string;
  highestPoints: number;
  friends: string[];
  ranking: { group: string; rank: number };
  status: string;
  avatar: string;
};

// 2. Initial user – browser-safe, no os.userInfo

const initialUser: UserType = {
  username: "Guest",
  email: "user@example.com",
  age: 17,
  school: "STI College",
  highestPoints: 0,
  friends: [],
  ranking: { group: "No group", rank: 1 },
  status: "online",
  avatar:
    "https://coin-images.coingecko.com/coins/images/69983/large/uvpdfjkfxrxbhhhq3pwqadwqkjn4.?1760269793",
};

// 3. Small components

function RecentGames() {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="text-base sm:text-lg pixel-font text-purple-300 mb-4 sm:mb-6 flex gap-2 items-center">
        <span className="text-xl sm:text-2xl">🎮</span> RECENT GAMES
      </div>
      <p className="text-[10px] sm:text-xs text-purple-200 text-center max-w-xs">
        Start playing to see your recently played games here.
      </p>
    </div>
  );
}

function RightSidebar() {
  const [open, setOpen] = useState(true);

  return (
    <aside className="w-full bg-purple-950/80 backdrop-blur-sm pixel-box border-4 border-purple-500 p-3 sm:p-4 mt-3 lg:mt-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 text-left"
      >
        <span className="pixel-font text-purple-300 text-[10px] sm:text-xs">
          ANNOUNCEMENTS
        </span>
        <span
          className={`inline-flex h-6 w-6 items-center justify-center border-2 border-purple-400 pixel-box text-purple-300 text-xs transition-transform ${
            open ? "rotate-90" : "rotate-0"
          }`}
        >
          ▸
        </span>
      </button>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
          open
            ? "grid-rows-[1fr] opacity-100 mt-3"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden flex flex-col gap-2">
          <div className="pixel-box bg-purple-900 text-purple-200 px-3 py-2 border-2 border-purple-600 pixel-font text-[9px] sm:text-[10px]">
            🆕 NEW FEATURE – Try the latest game mode!
          </div>
          <div className="pixel-box bg-purple-900 text-purple-200 px-3 py-2 border-2 border-purple-600 pixel-font text-[9px] sm:text-[10px]">
            📅 CHECK SCHEDULE – Upcoming quizzes and events.
          </div>
          <div className="pixel-box bg-purple-900 text-purple-200 px-3 py-2 border-2 border-purple-600 pixel-font text-[9px] sm:text-[10px]">
            🏆 LEADERBOARD – Compete with your classmates.
          </div>
        </div>
      </div>
    </aside>
  );
}

// 4. Main Dashboard

export default function Dashboard() {
  const [active, setActive] = useState<MenuKey>("home");
  const [user] = useState<UserType>(initialUser);
  const [groups, setGroups] = useState<string[]>([]);

  const menuItems: { key: MenuKey; label: string; icon: React.ElementType }[] =
    [
      { key: "home", label: "HOME", icon: Home },
      { key: "folder", label: "FOLDER", icon: FolderOpen },
      { key: "flashcard", label: "FLASHCARD", icon: CreditCard },
      { key: "reviewer", label: "REVIEWER", icon: BookOpen },
      { key: "groups", label: "GROUPS", icon: Users },
      { key: "mygames", label: "GAMES", icon: Gamepad2 },
      { key: "profile", label: "PROFILE", icon: User },
      { key: "settings", label: "SETTINGS", icon: Settings },
    ];

  function renderContent() {
    switch (active) {
      case "home":
        return <RecentGames />;
      case "folder":
        return <FolderPage />;
      case "flashcard":
        return <Flashcard />;
      case "reviewer":
        return <Reviewer />;
      case "groups":
        return <GroupsPage groups={groups} setGroups={setGroups} />;
      case "mygames":
        return <MyGames />;
      case "profile":
        return <Profile user={user} groups={groups} />;
      case "settings":
        return <SettingsPage />;
      case "logout":
        return <LogoutPage />;
      default:
        return null;
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col bg-black text-white overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, #3a2d71 0%, #243b55 100%)",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        
        .pixel-font {
          font-family: 'Press Start 2P', cursive;
          -webkit-font-smoothing: none;
          -moz-osx-font-smoothing: grayscale;
        }
        
        .pixel-box {
          border-radius: 0;
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
        }
        
        .pixel-shadow {
          box-shadow: 
            6px 6px 0 rgba(139, 92, 246, 0.5),
            8px 8px 0 rgba(88, 28, 135, 0.3);
        }
        
        .pixel-shadow-sm {
          box-shadow: 
            4px 4px 0 rgba(139, 92, 246, 0.4),
            6px 6px 0 rgba(88, 28, 135, 0.2);
        }

        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Top Banner */}
      <div className="w-full px-3 sm:px-6 max-w-6xl mx-auto flex justify-center pt-3 sm:pt-6 pb-3">
        <div className="w-full px-4 sm:px-8 py-3 sm:py-5 pixel-box border-4 sm:border-8 border-purple-500 text-center bg-purple-950/95 pixel-shadow">
          <h1 className="text-lg sm:text-2xl lg:text-3xl pixel-font text-purple-300 leading-tight">
            TINITHINK
          </h1>
          <div className="text-purple-400 mt-2 pixel-font text-[9px] sm:text-[10px] lg:text-xs">
            STUDENT HUB
          </div>
        </div>
      </div>

      {/* Body: only MAIN scrolls */}
      <div className="flex-1 w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-6 px-3 sm:px-6 pb-3 sm:pb-6 overflow-hidden min-h-0">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-56 bg-purple-950/80 backdrop-blur-sm pixel-box border-4 border-purple-500 p-3 sm:p-4 flex flex-col gap-2 sm:gap-3 pixel-shadow-sm shrink-0">
          <nav className="flex flex-col gap-1 sm:gap-2">
            {menuItems.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActive(key)}
                className={`text-left px-3 py-2 sm:py-3 pixel-box border-2 pixel-font text-[10px] sm:text-xs flex items-center gap-2 transition-all ${
                  active === key
                    ? "bg-purple-600 border-purple-400 text-white pixel-shadow-sm"
                    : "bg-purple-900/50 border-purple-700 text-purple-300 hover:bg-purple-800 active:bg-purple-800"
                }`}
              >
                <Icon className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate">{label}</span>
              </button>
            ))}

            <button
              onClick={() => setActive("logout")}
              className="text-left px-3 py-2 sm:py-3 pixel-box border-2 bg-red-900/50 border-red-700 text-red-300 hover:bg-red-800 active:bg-red-800 pixel-font text-[10px] sm:text-xs flex items-center gap-2 transition-all"
            >
              <LogOutIcon className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">LOGOUT</span>
            </button>
          </nav>

          <div className="mt-auto border-t-2 border-purple-700 pt-3">
            <div className="text-[9px] sm:text-[10px] text-purple-400 mb-1 pixel-font">
              ACCOUNT
            </div>
            <div className="text-[10px] sm:text-xs pixel-font text-purple-200 truncate">
              {user.username}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-400 pixel-box animate-pulse"></div>
              <span className="text-[9px] pixel-font text-green-400">
                ONLINE
              </span>
            </div>
          </div>
        </aside>

        {/* Main Content – independent scroll */}
        <div className="flex-1 flex flex-col min-h-0">
          <main className="flex-1 bg-purple-950/70 backdrop-blur-lg pixel-box border-4 border-purple-500 p-4 sm:p-6 flex flex-col items-center justify-start pixel-shadow overflow-y-auto hide-scrollbar">
            {renderContent()}
          </main>
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-48 xl:w-56 shrink-0">
          <RightSidebar />
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="w-full bg-purple-950 border-t-4 border-purple-500 px-3 sm:px-6 py-2 flex items-center justify-between pixel-font text-[9px] sm:text-[10px] text-purple-400">
        <span>© 2026 TINITHINK</span>
        <span className="hidden sm:inline">v1.0.0</span>
        <span className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 pixel-box animate-pulse"></div>
          SECURE
        </span>
      </div>
    </div>
  );
}
