import React, { useState } from "react";
import type { UserType } from "./Profile";

export type GroupType = {
  id: string;
  name: string;
  members: { name: string; points: number }[];
};

type GroupsProps = {
  groups: GroupType[];
  setGroups: React.Dispatch<React.SetStateAction<GroupType[]>>;
  user: UserType;
};

const Groups: React.FC<GroupsProps> = ({ groups, setGroups, user }) => {
  const [showCreate, setShowCreate] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  function handleCreateGroup() {
    if (!groupName.trim()) return;
    setGroups([
      ...groups,
      {
        id: Date.now().toString(),
        name: groupName.trim(),
        members: [
          { name: user.username, points: Math.floor(Math.random() * 1000) },
        ],
      },
    ]);
    setGroupName("");
    setShowCreate(false);
  }

  function handleAddPoints(groupId: string) {
    setGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? {
              ...group,
              members: group.members.map((m) =>
                m.name === user.username ? { ...m, points: m.points + 100 } : m,
              ),
            }
          : group,
      ),
    );
  }

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) || null;

  return (
    <div className="w-full flex items-start justify-center">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        .pixel-font { font-family: 'Press Start 2P', cursive; }
        .pixel-box { border-radius: 0; }
        .pixel-shadow { box-shadow: 4px 4px 0 rgba(139, 92, 246, 0.4), 6px 6px 0 rgba(88, 28, 135, 0.2); }
        input::placeholder { font-family: 'Press Start 2P', cursive; font-size: 0.5rem; }
        @media (min-width: 640px) { input::placeholder { font-size: 0.6rem; } }
      `}</style>

      <div className="w-full max-w-xl lg:max-w-3xl">
        <h2 className="text-lg sm:text-2xl pixel-font text-purple-300 mb-4 sm:mb-6">
          GROUPS
        </h2>

        <div className="mb-4 sm:mb-6">
          <button
            className="w-full sm:w-auto px-4 py-3 bg-cyan-600 active:bg-cyan-500 text-white border-2 sm:border-4 border-cyan-400 pixel-box pixel-font text-[10px] sm:text-xs min-h-[44px]"
            onClick={() => setShowCreate(true)}
          >
            ► CREATE GROUP
          </button>
        </div>

        {showCreate && (
          <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-purple-950/80 pixel-box border-2 sm:border-4 border-purple-500 pixel-shadow max-w-md">
            <input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="GROUP NAME"
              className="mb-3 px-3 py-3 pixel-box w-full bg-purple-950/50 border-2 border-purple-500 text-white pixel-font text-[10px] sm:text-xs focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                className="flex-1 px-3 py-3 bg-green-600 active:bg-green-500 border-2 border-green-400 text-white pixel-box pixel-font text-[10px] sm:text-xs min-h-[44px]"
                onClick={handleCreateGroup}
              >
                ► CREATE
              </button>
              <button
                className="flex-1 px-3 py-3 bg-red-600 active:bg-red-500 border-2 border-red-400 text-white pixel-box pixel-font text-[10px] sm:text-xs min-h-[44px]"
                onClick={() => setShowCreate(false)}
              >
                CANCEL
              </button>
            </div>
          </div>
        )}

        <h3 className="pixel-font text-sm sm:text-base text-purple-300 mb-3">
          YOUR GROUPS
        </h3>

        {groups.length === 0 && (
          <div className="text-purple-400 mb-6 pixel-font text-[10px] sm:text-xs p-4 bg-purple-950/50 pixel-box border-2 border-purple-600">
            NO GROUPS YET
          </div>
        )}

        <div className="space-y-2 sm:space-y-3 mb-6">
          {groups.map((g) => (
            <button
              key={g.id}
              className={`block w-full px-4 py-3 pixel-box border-2 sm:border-4 bg-purple-950/80 text-left pixel-font text-[10px] sm:text-xs min-h-[44px] active:bg-purple-800 transition-colors ${
                g.id === selectedGroupId
                  ? "border-cyan-400 pixel-shadow"
                  : "border-purple-600"
              }`}
              onClick={() => setSelectedGroupId(g.id)}
            >
              {g.name}
            </button>
          ))}
        </div>

        {selectedGroup && (
          <div className="mt-6 sm:mt-8 bg-purple-950/80 pixel-box border-2 sm:border-4 border-purple-500 p-4 sm:p-6 pixel-shadow">
            <h4 className="pixel-font text-sm sm:text-base text-purple-300 mb-4">
              LEADERBOARD - {selectedGroup.name}
            </h4>

            {selectedGroup.members.length === 0 && (
              <div className="text-purple-400 pixel-font text-[10px] sm:text-xs">
                NO MEMBERS
              </div>
            )}

            <div className="space-y-2">
              {selectedGroup.members
                .slice()
                .sort((a, b) => b.points - a.points)
                .map((member, idx) => (
                  <div
                    key={idx}
                    className="bg-purple-900/50 pixel-box border-2 border-purple-600 p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span className="pixel-font text-cyan-400 text-xs sm:text-sm">
                        #{idx + 1}
                      </span>
                      <span className="pixel-font text-purple-200 text-[10px] sm:text-xs truncate">
                        {member.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="pixel-font text-purple-300 text-[10px] sm:text-xs font-bold">
                        {member.points}
                      </span>
                      {member.name === user.username && (
                        <button
                          className="px-2 py-1 sm:px-3 sm:py-2 bg-cyan-600 active:bg-cyan-500 border-2 border-cyan-400 text-white pixel-box pixel-font text-[9px] sm:text-[10px] min-w-[44px] min-h-[32px]"
                          onClick={() => handleAddPoints(selectedGroup.id)}
                        >
                          +100
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Groups;
