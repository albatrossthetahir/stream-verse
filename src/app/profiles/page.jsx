"use client";
import React, { useState } from "react";
import { useAuth, PRESETS_AVATARS } from "../../context/AuthContext";
import { useRouter } from "next/navigation";

export default function ProfilesPage() {
  const {
    user,
    profiles,
    logout,
    selectProfile,
    createProfile,
    editProfile,
    deleteProfile
  } = useAuth();
  
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const [newProfileName, setNewProfileName] = useState("");
  const [selectedAvatarId, setSelectedAvatarId] = useState(PRESETS_AVATARS[0].id);
  
  const [editingProfile, setEditingProfile] = useState(null);
  const [editProfileName, setEditProfileName] = useState("");
  const [editAvatarId, setEditAvatarId] = useState("");

  const router = useRouter();

  // If loading and user is not set, or no user found in local storage
  if (typeof window !== "undefined" && !localStorage.getItem("streamverse_user")) {
    router.push("/login");
    return null;
  }

  const handleCreateProfileSubmit = (e) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;
    const res = createProfile(newProfileName.trim(), selectedAvatarId);
    if (res.success) {
      setNewProfileName("");
      setSelectedAvatarId(PRESETS_AVATARS[0].id);
      setShowAddModal(false);
    } else {
      alert(res.error);
    }
  };

  const handleEditProfileSubmit = (e) => {
    e.preventDefault();
    if (!editProfileName.trim()) return;
    const res = editProfile(editingProfile.id, editProfileName.trim(), editAvatarId);
    if (res.success) {
      setShowEditModal(false);
      setEditingProfile(null);
    }
  };

  const handleDeleteProfileClick = (id) => {
    if (confirm("Are you sure you want to delete this profile? All watchlist data will be lost.")) {
      const res = deleteProfile(id);
      if (res.success) {
        setShowEditModal(false);
        setEditingProfile(null);
      } else {
        alert(res.error);
      }
    }
  };

  const getAvatarClass = (avatarId) => {
    const avatar = PRESETS_AVATARS.find((a) => a.id === avatarId);
    return avatar ? avatar.class : "bg-gray-600";
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center font-sans px-4 select-none relative overflow-hidden">
      {/* Visual Ambient glow backgrounds */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-red-950/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-red-950/15 blur-[120px] pointer-events-none" />

      {/* Top Header branding constraint check */}
      <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <h1 className="text-2xl font-bold tracking-widest text-[#e50914] uppercase">
          Luminaea
        </h1>
        <button
          onClick={logout}
          className="text-gray-400 hover:text-white transition-colors text-sm font-medium border border-gray-600 px-3 py-1.5 rounded-md hover:bg-white/5"
        >
          Sign Out
        </button>
      </header>

      {/* Main Container */}
      <div className="z-10 text-center max-w-4xl w-full py-16">
        <h2 className="text-3xl md:text-5xl font-semibold mb-10 transition-all duration-300">
          {isEditingMode ? "Manage Profiles:" : "Who's watching?"}
        </h2>

        {/* Profile Card Grid */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-12">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="group flex flex-col items-center cursor-pointer"
              onClick={() => {
                if (isEditingMode) {
                  setEditingProfile(profile);
                  setEditProfileName(profile.name);
                  setEditAvatarId(profile.avatarId);
                  setShowEditModal(true);
                } else {
                  selectProfile(profile);
                }
              }}
            >
              {/* Profile Avatar Frame */}
              <div className="relative w-28 h-28 md:w-36 md:h-36 mb-4 rounded-lg overflow-hidden transition-all duration-300 transform group-hover:scale-105 group-hover:ring-4 group-hover:ring-white">
                <div className={`w-full h-full ${getAvatarClass(profile.avatarId)} flex items-center justify-center`}>
                  {/* Geometric initials or abstract representation */}
                  <span className="text-3xl md:text-4xl font-bold text-white tracking-wider">
                    {profile.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Edit overlay icon */}
                {isEditingMode && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-8 h-8 text-white stroke-2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Profile Name */}
              <span className="text-gray-400 group-hover:text-white transition-colors text-base md:text-lg">
                {profile.name}
              </span>
            </div>
          ))}

          {/* Add Profile Button (Max 5 constraint) */}
          {profiles.length < 5 && (
            <div
              className="group flex flex-col items-center cursor-pointer"
              onClick={() => setShowAddModal(true)}
            >
              <div className="w-28 h-28 md:w-36 md:h-36 mb-4 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center transition-all duration-300 transform group-hover:scale-105 group-hover:border-white group-hover:bg-white/5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-12 h-12 text-gray-500 group-hover:text-white transition-colors"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <span className="text-gray-500 group-hover:text-white transition-colors text-base md:text-lg">
                Add Profile
              </span>
            </div>
          )}
        </div>

        {/* Action Toggle Button */}
        <button
          onClick={() => setIsEditingMode(!isEditingMode)}
          className={`border text-sm font-semibold tracking-widest uppercase py-3 px-6 md:px-8 transition-colors duration-300 ${
            isEditingMode
              ? "border-[#e50914] bg-[#e50914] text-white hover:bg-red-700"
              : "border-gray-500 text-gray-400 hover:border-white hover:text-white"
          }`}
        >
          {isEditingMode ? "Done" : "Manage Profiles"}
        </button>
      </div>

      {/* CREATE NEW PROFILE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-all duration-300">
          <div className="bg-black border border-zinc-800 rounded-xl p-6 md:p-8 max-w-lg w-full text-left relative shadow-2xl">
            <h3 className="text-2xl font-bold mb-4">Add Profile</h3>
            <p className="text-sm text-gray-400 mb-6">
              Add a profile for another person watching Luminaea.
            </p>

            <form onSubmit={handleCreateProfileSubmit}>
              {/* Form Input fields */}
              <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
                <div className="w-24 h-24 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                  <div className={`w-full h-full ${getAvatarClass(selectedAvatarId)}`} />
                </div>
                <div className="w-full">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    Profile Name
                  </label>
                  <input
                    type="text"
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    placeholder="Enter name"
                    maxLength={15}
                    className="w-full bg-black text-white py-3 px-4 rounded-lg outline-none border border-zinc-800 focus:border-[#e50914] transition-colors text-base"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Avatar Selection Grid */}
              <div className="mb-6">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                  Choose Avatar Styling
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                  {PRESETS_AVATARS.map((avatar) => (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => setSelectedAvatarId(avatar.id)}
                      className={`w-10 h-10 rounded-md ${
                        avatar.class
                      } transition-all duration-200 focus:outline-none ${
                        selectedAvatarId === avatar.id
                          ? "ring-4 ring-white scale-110 shadow-lg"
                          : "opacity-60 hover:opacity-100 hover:scale-105"
                      }`}
                      title={avatar.name}
                    />
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-end mt-8">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-transparent border border-gray-600 hover:border-white text-white font-medium py-2 px-5 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#e50914] hover:bg-red-700 text-white font-medium py-2 px-5 rounded-md transition-colors"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT/DELETE PROFILE MODAL */}
      {showEditModal && editingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-all duration-300">
          <div className="bg-black border border-zinc-800 rounded-xl p-6 md:p-8 max-w-lg w-full text-left relative shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold">Edit Profile</h3>
              <button
                type="button"
                onClick={() => handleDeleteProfileClick(editingProfile.id)}
                className="text-red-500 hover:text-red-400 text-xs font-semibold flex items-center gap-1 bg-red-950/20 hover:bg-red-950/40 px-3 py-1.5 rounded"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0M4.5 18.015L12 9l7.5 9.015"
                  />
                </svg>
                Delete Profile
              </button>
            </div>

            <form onSubmit={handleEditProfileSubmit}>
              <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
                <div className="w-24 h-24 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                  <div className={`w-full h-full ${getAvatarClass(editAvatarId)}`} />
                </div>
                <div className="w-full">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    Profile Name
                  </label>
                  <input
                    type="text"
                    value={editProfileName}
                    onChange={(e) => setEditProfileName(e.target.value)}
                    placeholder="Enter name"
                    maxLength={15}
                    className="w-full bg-black text-white py-3 px-4 rounded-lg outline-none border border-zinc-800 focus:border-[#e50914] transition-colors text-base"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Avatar Selection Grid */}
              <div className="mb-6">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                  Choose Avatar Styling
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                  {PRESETS_AVATARS.map((avatar) => (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => setEditAvatarId(avatar.id)}
                      className={`w-10 h-10 rounded-md ${
                        avatar.class
                      } transition-all duration-200 focus:outline-none ${
                        editAvatarId === avatar.id
                          ? "ring-4 ring-white scale-110 shadow-lg"
                          : "opacity-60 hover:opacity-100 hover:scale-105"
                      }`}
                      title={avatar.name}
                    />
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-end mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingProfile(null);
                  }}
                  className="bg-transparent border border-gray-600 hover:border-white text-white font-medium py-2 px-5 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#e50914] hover:bg-red-700 text-white font-medium py-2 px-5 rounded-md transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
