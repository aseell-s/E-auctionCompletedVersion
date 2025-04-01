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
