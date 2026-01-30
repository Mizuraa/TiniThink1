import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";

export type UserType = {
  id: string;
  username: string;
  email: string;
  age: number | null;
  school: string | null;
  status: string;
  avatar_url: string | null;
};

export type GroupType = {
  id: string;
  name: string;
  members: { name: string; points: number; user_id: string }[];
};

type ProfileProps = {
  onLogout?: () => void;
};

function getHighestPoints(userId: string, groups: GroupType[]): number {
  const pointsList: number[] = [];
  groups.forEach((group) => {
    group.members.forEach((member) => {
      if (member.user_id === userId) pointsList.push(member.points);
    });
  });
  return pointsList.length > 0 ? Math.max(...pointsList) : 0;
}

function getGroupRankings(
  userId: string,
  groups: GroupType[],
): { group: string; rank: number }[] {
  return groups
    .map((group) => {
      const sorted = [...group.members].sort((a, b) => b.points - a.points);
      const rank = sorted.findIndex((member) => member.user_id === userId);
      if (rank !== -1) {
        return { group: group.name, rank: rank + 1 };
      }
      return null;
    })
    .filter((r): r is { group: string; rank: number } => r !== null);
}

const Profile: React.FC<ProfileProps> = ({ onLogout }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [friends, setFriends] = useState<string[]>([]);
  const [groups, setGroups] = useState<GroupType[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) return;

      // Get profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (profileError) throw profileError;

      // Get friends
      const { data: friendsData } = await supabase
        .from("friends")
        .select("friend_name")
        .eq("user_id", authUser.id);

      // Get groups with member info
      const { data: groupMemberships } = await supabase
        .from("group_members")
        .select(
          `
          group_id,
          points,
          user_id,
          groups (
            id,
            name
          ),
          profiles (username)
        `,
        )
        .eq("user_id", authUser.id);

      // Fetch all members for user's groups
      const groupIds =
        groupMemberships?.map((gm: { group_id: any }) => gm.group_id) || [];
      const { data: allGroupMembers } = await supabase
        .from("group_members")
        .select(
          `
          group_id,
          points,
          user_id,
          profiles (username)
        `,
        )
        .in("group_id", groupIds);

      // Organize groups
      const groupsMap = new Map<string, GroupType>();
      groupMemberships?.forEach(
        (gm: {
          group_id: any;
          points: any;
          user_id: any;
          groups: { id: any; name: any }[];
          profiles: { username: any }[];
        }) => {
          if (
            gm.groups &&
            gm.groups.length > 0 &&
            !groupsMap.has(gm.group_id)
          ) {
            groupsMap.set(gm.group_id, {
              id: gm.groups[0].id,
              name: gm.groups[0].name,
              members: [],
            });
          }
        },
      );

      // Add all members to groups
      allGroupMembers?.forEach((member) => {
        const group = groupsMap.get(member.group_id);
        if (group) {
          group.members.push({
            name: member.profiles[0]?.username,
            points: member.points,
            user_id: member.user_id,
          });
        }
      });

      setUser(profile);
      setFriends(friendsData?.map((f) => f.friend_name) || []);
      setGroups(Array.from(groupsMap.values()));
    } catch (error) {
      console.error("Error loading profile:", error);
      alert("⚠️ ERROR LOADING PROFILE");
    } finally {
      setLoading(false);
    }
  }

  async function addFriend() {
    const name = prompt("ENTER FRIEND NAME:");
    if (!name?.trim()) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("friends")
      .insert({ user_id: user.id, friend_name: name.trim() });

    if (error) {
      alert("⚠️ ERROR ADDING FRIEND");
      console.error(error);
    } else {
      setFriends([...friends, name.trim()]);
    }
  }

  async function removeFriend(index: number) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const friendName = friends[index];

    const { error } = await supabase
      .from("friends")
      .delete()
      .eq("user_id", user.id)
      .eq("friend_name", friendName);

    if (!error) {
      setFriends(friends.filter((_, i) => i !== index));
    } else {
      alert("⚠️ ERROR REMOVING FRIEND");
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("⚠️ FILE TOO LARGE (MAX 2MB)");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      alert("⚠️ ONLY IMAGES ALLOWED");
      return;
    }

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) return;

    const fileExt = file.name.split(".").pop();
    const fileName = `${authUser.id}/avatar.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: data.publicUrl })
        .eq("id", authUser.id);

      if (updateError) throw updateError;

      setUser(user ? { ...user, avatar_url: data.publicUrl } : null);
      alert("✓ AVATAR UPDATED");
    } catch (error: any) {
      console.error("Avatar upload error:", error);
      alert("⚠️ UPLOAD FAILED: " + error.message);
    }
  }

  async function handleLogout() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase
        .from("profiles")
        .update({ status: "offline" })
        .eq("id", user.id);
    }

    await supabase.auth.signOut();
    if (onLogout) onLogout();
  }

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center p-8">
        <div className="pixel-font text-purple-300 text-sm">LOADING...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full flex items-center justify-center p-8">
        <div className="pixel-font text-red-400 text-sm">NOT LOGGED IN</div>
      </div>
    );
  }

  const highestPoints = getHighestPoints(user.id, groups);
  const groupRankings = getGroupRankings(user.id, groups);

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
          <div className="relative">
            <img
              src={
                user.avatar_url || "https://via.placeholder.com/150?text=Avatar"
              }
              alt="Avatar"
              className="w-16 h-16 sm:w-24 sm:h-24 pixel-box border-4 border-purple-400 bg-purple-900 object-cover pixel-shadow cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              title="Click to change avatar"
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
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
          {user.age && (
            <div className="bg-purple-900/50 pixel-box border-2 border-purple-600 p-2 sm:p-3">
              <span className="text-purple-400">AGE:</span>{" "}
              <span className="text-white">{user.age}</span>
            </div>
          )}
          {user.school && (
            <div className="bg-purple-900/50 pixel-box border-2 border-purple-600 p-2 sm:p-3">
              <span className="text-purple-400">SCHOOL:</span>{" "}
              <span className="text-white wrap-break-word">{user.school}</span>
            </div>
          )}
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
              FRIENDS: <span className="text-cyan-400">{friends.length}</span>
            </span>
            <button
              onClick={addFriend}
              className="w-full sm:w-auto px-3 py-2 pixel-box border-2 border-purple-400 bg-purple-700 active:bg-purple-600 text-purple-200 pixel-font text-[9px] sm:text-[10px] min-h-11 sm:min-h-8"
            >
              + ADD FRIEND
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {friends.map((friend, idx) => (
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
              {friends.length}
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

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full px-4 py-3 bg-red-600 border-4 border-red-400 pixel-box text-white pixel-font text-xs hover:bg-red-700 transition-colors"
        >
          ► LOGOUT
        </button>
      </div>
    </div>
  );
};

export default Profile;
