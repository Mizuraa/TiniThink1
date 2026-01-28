import React from "react";
import type { GroupType } from "./Groups";

export type UserType = {
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

type ProfileProps = {
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
  groups: GroupType[];
  setGroups: React.Dispatch<React.SetStateAction<GroupType[]>>;
};

function getHighestPoints(username: string, groups: GroupType[]): number {
  const pointsList: number[] = [];
  groups.forEach((group) => {
    group.members.forEach((member) => {
      if (member.name === username) pointsList.push(member.points);
    });
  });
  return pointsList.length > 0 ? Math.max(...pointsList) : 0;
}

function getGroupRankings(
  username: string,
  groups: GroupType[],
): { group: string; rank: number }[] {
  return groups
    .map((group) => {
      const sorted = [...group.members].sort((a, b) => b.points - a.points);
      const rank = sorted.findIndex((member) => member.name === username);
      if (rank !== -1) {
        return { group: group.name, rank: rank + 1 };
      }
      return null;
    })
    .filter((r): r is { group: string; rank: number } => r !== null);
}

const Profile: React.FC<ProfileProps> = ({ user, setUser, groups }) => {
  const highestPoints = getHighestPoints(user.username, groups);
  const groupRankings = getGroupRankings(user.username, groups);

  const addFriend = () => {
    const name = prompt("ENTER FRIEND NAME:");
    if (name && name.trim())
      setUser((prev) => ({
        ...prev,
        friends: [...prev.friends, name.trim()],
      }));
  };

  const removeFriend = (index: number) => {
    setUser((prev) => ({
      ...prev,
      friends: prev.friends.filter((_, i) => i !== index),
    }));
  };

  const topRank =
    groupRankings.length > 0
      ? Math.min(...groupRankings.map((r) => r.rank))
      : null;
  const topRankGroup =
    groupRankings.length > 0
      ? groupRankings.reduce(
          (minGroup, r) => (r.rank < minGroup.rank ? r : minGroup),
          groupRankings[0],
        ).group
      : "";

  return (
    <div className="w-full flex items-start justify-center">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        .pixel-font { font-family: 'Press Start 2P', cursive; }
        .pixel-box { border-radius: 0; }
        .pixel-shadow { box-shadow: 6px 6px 0 rgba(139, 92, 246, 0.5), 8px 8px 0 rgba(88, 28, 135, 0.3); }
      `}</style>

      <div className="max-w-sm sm:max-w-md w-full mx-auto mt-4 sm:mt-10 mb-6 sm:mb-10 px-4 sm:px-6 py-6 sm:py-8 bg-purple-950/90 border-4 sm:border-8 border-purple-500 pixel-box pixel-shadow text-purple-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-6 sm:mb-9">
          <img
            src={user.avatar}
            alt="Avatar"
            className="w-16 h-16 sm:w-18.5 sm:h-18.5 pixel-box border-4 border-purple-400 bg-purple-900 object-cover pixel-shadow"
          />
          <div className="flex-1 text-center sm:text-left">
            <div className="text-white pixel-font text-base sm:text-lg mb-2">
              {user.username}
            </div>
            <span
              className={`inline-block pixel-box px-3 py-1 text-[9px] sm:text-[10px] pixel-font border-2 ${
                user.status === "online"
                  ? "bg-green-600 border-green-400 text-white"
                  : "bg-gray-600 border-gray-400 text-white"
              }`}
            >
              {user.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Basic Info */}
        <div className="mb-4 space-y-2 sm:space-y-3 text-[10px] sm:text-xs pixel-font">
          <div className="bg-purple-900/50 pixel-box border-2 border-purple-600 p-2 sm:p-3">
            <span className="text-purple-400">EMAIL:</span>{" "}
            <span className="text-white">{user.email}</span>
          </div>
          <div className="bg-purple-900/50 pixel-box border-2 border-purple-600 p-2 sm:p-3">
            <span className="text-purple-400">AGE:</span>{" "}
            <span className="text-white">{user.age}</span>
          </div>
          <div className="bg-purple-900/50 pixel-box border-2 border-purple-600 p-2 sm:p-3">
            <span className="text-purple-400">SCHOOL:</span>{" "}
            <span className="text-white wrap-break-word">{user.school}</span>
          </div>
        </div>

        {/* Highest Points */}
        <div className="my-4 bg-purple-900/50 pixel-box border-2 border-purple-600 p-2 sm:p-3 text-[10px] sm:text-xs pixel-font">
          <span className="text-purple-400">HIGHEST POINTS:</span>{" "}
          <span className="text-cyan-400 font-bold">{highestPoints}</span>
        </div>

        {/* Rankings */}
        <div className="my-4 bg-purple-900/50 pixel-box border-2 border-purple-600 p-2 sm:p-3 text-[10px] sm:text-xs pixel-font">
          <span className="text-purple-400">RANKING:</span>{" "}
          {groupRankings.length === 0 ? (
            <span className="text-red-400">NO RANKING</span>
          ) : (
            <span className="text-yellow-400">
              {groupRankings.map((r) => (
                <span key={r.group} className="block sm:inline sm:mr-2">
                  {r.group}: #{r.rank}
                </span>
              ))}
            </span>
          )}
        </div>

        {/* Friends */}
        <div className="my-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
            <span className="pixel-font text-[10px] sm:text-xs text-purple-400">
              FRIENDS:{" "}
              <span className="text-cyan-400">{user.friends.length}</span>
            </span>
            <button
              onClick={addFriend}
              className="w-full sm:w-auto px-3 py-2 pixel-box border-2 border-purple-400 bg-purple-700 active:bg-purple-600 text-purple-200 pixel-font text-[9px] sm:text-[10px] min-h-11 sm:min-h-8"
            >
              + ADD FRIEND
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {user.friends.map((friend, idx) => (
              <span
                key={`${friend}-${idx}`}
                className="inline-flex items-center bg-purple-900/50 pixel-box border-2 border-purple-600 px-2 py-1 text-[9px] sm:text-[10px] text-purple-200 pixel-font"
              >
                {friend}
                <button
                  onClick={() => removeFriend(idx)}
                  className="ml-2 px-1 text-[9px] text-red-400 border border-red-600 pixel-box bg-red-900/50 hover:bg-red-800 min-w-6 min-h-6"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Groups */}
        <div className="my-4 bg-purple-900/50 pixel-box border-2 border-purple-600 p-2 sm:p-3 text-[10px] sm:text-xs pixel-font">
          <span className="text-purple-400">GROUPS:</span>{" "}
          {groups.length === 0 ? (
            <span className="text-red-400">NO GROUPS</span>
          ) : (
            <span className="text-cyan-400 wrap-break-word">
              {groups.map((g) => g.name).join(", ")}
            </span>
          )}
        </div>

        {/* Stats Bar */}
        <div className="mt-6 mb-4 sm:mb-7 grid grid-cols-3 gap-2 sm:gap-4 border-t-4 border-b-4 border-purple-600 py-4">
          <div className="text-center">
            <div className="mb-1 text-[9px] sm:text-[10px] pixel-font text-purple-400">
              POINTS
            </div>
            <div className="text-base sm:text-xl pixel-font text-white">
              {highestPoints}
            </div>
          </div>
          <div className="text-center">
            <div className="mb-1 text-[9px] sm:text-[10px] pixel-font text-purple-400">
              FRIENDS
            </div>
            <div className="text-base sm:text-xl pixel-font text-white">
              {user.friends.length}
            </div>
          </div>
          <div className="text-center">
            <div className="mb-1 text-[9px] sm:text-[10px] pixel-font text-purple-400">
              RANK
            </div>
            {topRank !== null ? (
              <>
                <div className="text-base sm:text-xl pixel-font text-white">
                  #{topRank}
                </div>
                <div className="text-[8px] sm:text-[9px] pixel-font text-purple-300 wrap-break-word">
                  {topRankGroup}
                </div>
              </>
            ) : (
              <div className="text-base sm:text-xl pixel-font text-white">
                —
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
