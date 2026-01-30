import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export type GroupType = {
  id: string;
  name: string;
  members: { name: string; points: number; user_id: string }[];
};

const Groups: React.FC = () => {
  const [groups, setGroups] = useState<GroupType[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    loadUserAndGroups();
  }, []);

  async function loadUserAndGroups() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();

    if (profile) {
      setUserId(user.id);
      setUsername(profile.username);
    }

    loadGroups(user.id);
  }

  async function loadGroups(uid: string) {
    try {
      // Get groups user is a member of
      const { data: groupMemberships } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", uid);

      if (!groupMemberships || groupMemberships.length === 0) {
        setGroups([]);
        return;
      }

      const groupIds = groupMemberships.map((gm) => gm.group_id);

      // Get group details
      const { data: groupsData } = await supabase
        .from("groups")
        .select("id, name")
        .in("id", groupIds);

      // Get all members for these groups
      const { data: membersData } = await supabase
        .from("group_members")
        .select(
          `
          group_id,
          user_id,
          points,
          profiles (username)
        `,
        )
        .in("group_id", groupIds);

      // Organize into groups
      const groupsMap = new Map<string, GroupType>();

      groupsData?.forEach((group) => {
        groupsMap.set(group.id, {
          id: group.id,
          name: group.name,
          members: [],
        });
      });

      membersData?.forEach((member) => {
        const group = groupsMap.get(member.group_id);
        if (group) {
          group.members.push({
            name: Array.isArray(member.profiles)
              ? member.profiles[0].username
              : (member.profiles as { username: string }).username,
            points: member.points,
            user_id: member.user_id,
          });
        }
      });

      setGroups(Array.from(groupsMap.values()));
    } catch (error) {
      console.error("Error loading groups:", error);
    }
  }

  async function handleCreateGroup() {
    if (!groupName.trim()) return;

    try {
      // Create group
      const { data: group, error: groupError } = await supabase
        .from("groups")
        .insert({ name: groupName.trim(), created_by: userId })
        .select()
        .single();

      if (groupError) throw groupError;

      // Add creator as member
      const { error: memberError } = await supabase
        .from("group_members")
        .insert({
          group_id: group.id,
          user_id: userId,
          points: 0,
        });

      if (memberError) throw memberError;

      loadGroups(userId);
      setGroupName("");
      setShowCreate(false);
      alert("✓ GROUP CREATED");
    } catch (error: any) {
      console.error("Create group error:", error);
      alert("⚠️ CREATE FAILED: " + error.message);
    }
  }

  async function handleAddPoints(groupId: string) {
    try {
      const { data: currentMember } = await supabase
        .from("group_members")
        .select("points")
        .eq("group_id", groupId)
        .eq("user_id", userId)
        .single();

      if (!currentMember) return;

      const { error } = await supabase
        .from("group_members")
        .update({ points: currentMember.points + 100 })
        .eq("group_id", groupId)
        .eq("user_id", userId);

      if (!error) {
        loadGroups(userId);
      }
    } catch (error) {
      console.error("Add points error:", error);
    }
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
            className="w-full sm:w-auto px-4 py-3 bg-cyan-600 active:bg-cyan-500 text-white border-2 sm:border-4 border-cyan-400 pixel-box pixel-font text-[10px] sm:text-xs min-h-11"
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
                className="flex-1 px-3 py-3 bg-green-600 active:bg-green-500 border-2 border-green-400 text-white pixel-box pixel-font text-[10px] sm:text-xs min-h-11"
                onClick={handleCreateGroup}
              >
                ► CREATE
              </button>
              <button
                className="flex-1 px-3 py-3 bg-red-600 active:bg-red-500 border-2 border-red-400 text-white pixel-box pixel-font text-[10px] sm:text-xs min-h-11"
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
              className={`block w-full px-4 py-3 pixel-box border-2 sm:border-4 bg-purple-950/80 text-left pixel-font text-[10px] sm:text-xs min-h-11 active:bg-purple-800 transition-colors ${
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
                      {member.user_id === userId && (
                        <button
                          className="px-2 py-1 sm:px-3 sm:py-2 bg-cyan-600 active:bg-cyan-500 border-2 border-cyan-400 text-white pixel-box pixel-font text-[9px] sm:text-[10px] min-w-11 min-h-8"
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
