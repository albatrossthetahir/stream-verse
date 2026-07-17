"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext(null);

// Curated grid of premium avatars (sleek gradients with modern geometric patterns/icons)
export const PRESETS_AVATARS = [
  { id: "avatar-1", name: "Crimson Eclipse", class: "bg-gradient-to-tr from-red-700 to-black border border-red-600" },
  { id: "avatar-2", name: "Obsidian Core", class: "bg-gradient-to-tr from-zinc-900 to-black border border-white" },
  { id: "avatar-3", name: "Lumina Red", class: "bg-[#e50914] text-white border border-white" },
  { id: "avatar-4", name: "Starlight White", class: "bg-white text-black font-black" },
  { id: "avatar-5", name: "Velvet Crimson", class: "bg-gradient-to-tr from-red-600 to-red-950 border border-zinc-700" },
  { id: "avatar-6", name: "Shadow Grid", class: "bg-gradient-to-tr from-black to-zinc-900 border border-red-700" }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Load auth data from localStorage
    const savedUser = localStorage.getItem("streamverse_user");
    const savedActiveProfile = localStorage.getItem("streamverse_active_profile");

    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      
      // Load user profiles
      const userProfiles = localStorage.getItem(`streamverse_profiles_${parsedUser.email}`);
      if (userProfiles) {
        const parsedProfiles = JSON.parse(userProfiles);
        setProfiles(parsedProfiles);
      } else {
        // Create a default initial profile
        const defaultProfile = {
          id: "p-" + Date.now(),
          name: "Main User",
          avatarId: "avatar-1"
        };
        const initial = [defaultProfile];
        setProfiles(initial);
        localStorage.setItem(`streamverse_profiles_${parsedUser.email}`, JSON.stringify(initial));
      }

      if (savedActiveProfile) {
        setActiveProfile(JSON.parse(savedActiveProfile));
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    // Mock authentication
    try {
      const mockUser = {
        email,
        token: "mock-jwt-token-" + Date.now(),
        role: email.toLowerCase().includes("admin") ? "ADMIN" : "USER"
      };
      setUser(mockUser);
      localStorage.setItem("streamverse_user", JSON.stringify(mockUser));

      // Fetch or initialize profiles
      const userProfiles = localStorage.getItem(`streamverse_profiles_${email}`);
      let currentProfiles = [];
      if (userProfiles) {
        currentProfiles = JSON.parse(userProfiles);
      } else {
        currentProfiles = [
          {
            id: "p-" + Date.now(),
            name: "Owner",
            avatarId: "avatar-1"
          }
        ];
        localStorage.setItem(`streamverse_profiles_${email}`, JSON.stringify(currentProfiles));
      }
      setProfiles(currentProfiles);
      setActiveProfile(null);
      localStorage.removeItem("streamverse_active_profile");

      router.push("/profiles");
      return { success: true };
    } catch (err) {
      return { success: false, error: "Invalid credentials" };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password) => {
    setLoading(true);
    try {
      const mockUser = {
        email,
        token: "mock-jwt-token-" + Date.now(),
        role: email.toLowerCase().includes("admin") ? "ADMIN" : "USER"
      };
      setUser(mockUser);
      localStorage.setItem("streamverse_user", JSON.stringify(mockUser));

      const defaultProfiles = [
        {
          id: "p-" + Date.now(),
          name: "Owner",
          avatarId: "avatar-1"
        }
      ];
      setProfiles(defaultProfiles);
      localStorage.setItem(`streamverse_profiles_${email}`, JSON.stringify(defaultProfiles));
      setActiveProfile(null);
      localStorage.removeItem("streamverse_active_profile");

      router.push("/profiles");
      return { success: true };
    } catch (err) {
      return { success: false, error: "Signup failed" };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setProfiles([]);
    setActiveProfile(null);
    localStorage.removeItem("streamverse_user");
    localStorage.removeItem("streamverse_active_profile");
    router.push("/login");
  };

  const selectProfile = (profile) => {
    setActiveProfile(profile);
    localStorage.setItem("streamverse_active_profile", JSON.stringify(profile));
    router.push("/browse");
  };

  const createProfile = (name, avatarId) => {
    if (profiles.length >= 5) {
      return { success: false, error: "Maximum of 5 profiles allowed" };
    }
    const newProfile = {
      id: "p-" + Date.now(),
      name,
      avatarId: avatarId || "avatar-1"
    };
    const updated = [...profiles, newProfile];
    setProfiles(updated);
    if (user) {
      localStorage.setItem(`streamverse_profiles_${user.email}`, JSON.stringify(updated));
    }
    return { success: true, profile: newProfile };
  };

  const editProfile = (id, newName, newAvatarId) => {
    const updated = profiles.map((p) => {
      if (p.id === id) {
        return { ...p, name: newName, avatarId: newAvatarId };
      }
      return p;
    });
    setProfiles(updated);
    if (user) {
      localStorage.setItem(`streamverse_profiles_${user.email}`, JSON.stringify(updated));
    }
    // Update active profile if it was edited
    if (activeProfile && activeProfile.id === id) {
      const updatedActive = { ...activeProfile, name: newName, avatarId: newAvatarId };
      setActiveProfile(updatedActive);
      localStorage.setItem("streamverse_active_profile", JSON.stringify(updatedActive));
    }
    return { success: true };
  };

  const deleteProfile = (id) => {
    if (profiles.length <= 1) {
      return { success: false, error: "Must keep at least one profile" };
    }
    const updated = profiles.filter((p) => p.id !== id);
    setProfiles(updated);
    if (user) {
      localStorage.setItem(`streamverse_profiles_${user.email}`, JSON.stringify(updated));
    }
    if (activeProfile && activeProfile.id === id) {
      setActiveProfile(null);
      localStorage.removeItem("streamverse_active_profile");
    }
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profiles,
        activeProfile,
        loading,
        login,
        signup,
        logout,
        selectProfile,
        createProfile,
        editProfile,
        deleteProfile,
        avatars: PRESETS_AVATARS
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
