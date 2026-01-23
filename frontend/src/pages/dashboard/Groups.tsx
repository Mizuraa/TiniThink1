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
                m.name === user.username ? { ...m, points: m.points + 100 } : m
              ),
            }
          : group
      )
    );
  }

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) || null;

  return (
    <div className="w-full flex items-start justify-center">
      <div className="w-full max-w-xl lg:max-w-3xl">
        <h2 className="text-2xl font-bold text-[#00ffff] mb-6">Groups</h2>
        <div className="mb-6">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded font-bold"
            onClick={() => setShowCreate(true)}
          >
            Create Group
          </button>
        </div>
        {showCreate && (
          <div className="mb-6 p-4 bg-white/10 rounded shadow max-w-md">
            <input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group name"
              className="mb-2 px-2 py-1 rounded w-full bg-gray-800 text-white"
            />
            <button
              className="px-3 py-1 bg-[#00ffff] text黑 rounded font-bold"
              onClick={handleCreateGroup}
            >
              Create
            </button>
            <button
              className="ml-3 px-3 py-1 bg-red-400 text-white rounded"
              onClick={() => setShowCreate(false)}
            >
              Cancel
            </button>
          </div>
        )}
        <h3 className="font-bold mb-2">Your Groups</h3>
        {groups.length === 0 && (
          <div className="text-gray-400 mb-6">No groups yet.</div>
        )}
        <div className="space-y-3 mb-6">
          {groups.map((g) => (
            <button
              key={g.id}
              className={`block px-4 py-2 bg-white/5 rounded font-bold text-left w-full ${
                g.id === selectedGroupId ? "border-2 border-[#00ffff]" : ""
              }`}
              onClick={() => setSelectedGroupId(g.id)}
            >
              {g.name}
            </button>
          ))}
        </div>
        {selectedGroup && (
          <div className="mt-8 bg-white/10 rounded p-4">
            <h4 className="font-bold text-lg mb-2">
              Leaderboard – {selectedGroup.name}
            </h4>
            {selectedGroup.members.length === 0 && (
              <div className="text-gray-400">No members yet.</div>
            )}
            <table className="w-full mb-2">
              <thead>
                <tr>
                  <th className="text-left">Name</th>
                  <th className="text-right">Points</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {selectedGroup.members
                  .slice()
                  .sort((a, b) => b.points - a.points)
                  .map((member, idx) => (
                    <tr key={idx} className="border-b border-white/20">
                      <td>{member.name}</td>
                      <td className="text-right font-bold">{member.points}</td>
                      <td>
                        {member.name === user.username && (
                          <button
                            className="ml-2 px-2 py-1 bg-blue-400 text-white rounded"
                            onClick={() => handleAddPoints(selectedGroup.id)}
                          >
                            +100
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Groups;
