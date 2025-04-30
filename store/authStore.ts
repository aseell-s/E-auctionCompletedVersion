// This file defines an authentication store using Zustand for state management.
// 1. Manages authentication-related state, including:
//    - `user`: The currently authenticated user.
//    - `isLoading`: Whether authentication data is being loaded.
//    - `error`: Any error related to authentication.
// 2. Provides actions to update the state:
//    - `setUser`: Updates the current user.
//    - `setLoading`: Updates the loading state.
//    - `setError`: Updates the error state.
//    - `syncWithSession`: Syncs the store with a NextAuth session.
//    - `logout`: Clears the user and error state to log out the user.
// 3. Uses Zustand's `create` function to define the store.

"use client";

import { create } from "zustand";
import { User, AuthState } from "../types/index";
import { Session } from "next-auth";

interface AuthStore extends AuthState {
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  syncWithSession: (session: Session | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,
  error: null,

  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  syncWithSession: (session) => {
    if (session?.user) {
      set({
        user: {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.name || undefined,
          role: session.user.role,
          isApproved: session.user.isApproved,
        },
        isLoading: false,
        error: null,
      });
    } else {
      set({
        user: null,
        isLoading: false,
        error: null,
      });
    }
  },

  logout: () => set({ user: null, error: null }),
}));
