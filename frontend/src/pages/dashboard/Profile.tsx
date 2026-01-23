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
  groups: GroupType[]
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
    const name = prompt("Friend name?");
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
          groupRankings[0]
        ).group
      : "";

  return (
    <div className="w-full flex items-start justify-center">
      <div className="max-w-sm sm:max-w-md w-full mx-auto mt-10 mb-10 px-6 py-8 bg-[#171825] border border-[#23263a] rounded-2xl shadow-[0_2px_34px_rgba(30,32,70,0.18),0_2px_10px_rgba(0,0,0,0.12)] text-[#f1f1fa]">
        {/* Header */}
        <div className="flex items-center gap-6 mb-9">
          <img
            src={user.avatar}
            alt="User avatar"
            className="w-[74px] h-[74px] rounded-full border-[2.5px] border-[#28294c] bg-[#191a28] object-cover shadow-[0_2px_12px_#131326] mb-1"
          />
          <div className="flex-1">
            <div className="text-white font-semibold text-[23px]">
              {user.username}
            </div>
            <span
              className={`mt-2 inline-block rounded px-4 py-[5px] text-[13.5px] font-semibold tracking-[0.08em] ${
                user.status === "online"
                  ? "bg-[#425dff] text-white"
                  : "bg-[#9496b8] text-white"
              }`}
            >
              {user.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Basic info */}
        <div className="mb-3 space-y-2">
          <div>
            <span className="font-medium text-[#8a8aab]">Email: </span>
            <span className="font-semibold text-white">{user.email}</span>
          </div>
          <div>
            <span className="font-medium text-[#8a8aab]">Age: </span>
            <span className="font-semibold text-white">{user.age}</span>
          </div>
          <div>
            <span className="font-medium text-[#8a8aab]">School: </span>
            <span className="font-semibold text-white">{user.school}</span>
          </div>
        </div>

        {/* Highest points */}
        <div className="my-4">
          <span className="font-medium text-[#8a8aab]">
            Highest Points (from groups):{" "}
          </span>
          <span className="font-semibold text-[#00ffff]">{highestPoints}</span>
        </div>

        {/* Rankings */}
        <div className="my-4">
          <span className="font-medium text-[#8a8aab]">Ranking: </span>
          {groupRankings.length === 0 ? (
            <span className="font-semibold text-[#e55353]">
              No group ranking
            </span>
          ) : (
            <span className="font-semibold text-[#ffd700]">
              {groupRankings.map((r) => (
                <span key={r.group} className="mr-2">
                  {r.group}: #{r.rank}
                </span>
              ))}
            </span>
          )}
        </div>

        {/* Friends */}
        <div className="my-4">
          <span className="font-medium text-[#8a8aab]">Friends: </span>
          <span className="font-semibold text-[#00ffff]">
            {user.friends.length}
          </span>
          <button
            onClick={addFriend}
            className="ml-3 inline-flex items-center rounded-lg border border-[#35366a] bg-[#23263a] px-3.5 py-1.5 text-xs font-semibold text-[#d1d5de] hover:bg-[#2b3050] transition"
          >
            Add Friend
          </button>

          <div className="mt-2 flex flex-wrap gap-2">
            {user.friends.map((friend, idx) => (
              <span
                key={`${friend}-${idx}`}
                className="inline-flex items-center rounded-full bg-[#23263a] px-3 py-1 text-xs text-[#e5e7f3]"
              >
                {friend}
                <button
                  onClick={() => removeFriend(idx)}
                  className="ml-1 rounded bg-[#31141a] px-1.5 text-[10px] font-semibold text-[#f68989] border border-[#522837] hover:bg-[#4b1d29]"
                >
                  Remove
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Groups */}
        <div className="my-4">
          <span className="font-medium text-[#8a8aab]">Groups: </span>
          {groups.length === 0 ? (
            <span className="font-semibold text-[#e55353]">No groups yet</span>
          ) : (
            <span className="font-semibold text-[#00ffff]">
              {groups.map((g) => g.name).join(", ")}
            </span>
          )}
        </div>

        {/* Stats bar */}
        <div className="mt-4 mb-7 flex justify-center gap-10 border-y border-[#23263a] py-4">
          <div>
            <div className="mb-1 text-[13px] font-medium text-[#76789b]">
              Highest Points
            </div>
            <div className="text-[22px] font-semibold">{highestPoints}</div>
          </div>
          <div>
            <div className="mb-1 text-[13px] font-medium text-[#76789b]">
              Friends
            </div>
            <div className="text-[22px] font-semibold">
              {user.friends.length}
            </div>
          </div>
          <div>
            <div className="mb-1 text-[13px] font-medium text-[#76789b]">
              Top Ranking
            </div>
            {topRank !== null ? (
              <>
                <div className="text-[22px] font-semibold">
                  #{topRank} <span className="text-[16px]">★</span>
                </div>
                <div className="text-[13px] font-semibold text-[#aeb2cf]">
                  {topRankGroup}
                </div>
              </>
            ) : (
              <div className="text-[22px] font-semibold">—</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
