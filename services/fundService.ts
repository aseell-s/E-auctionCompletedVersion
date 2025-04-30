// This file defines the `fundService` object, which provides utility functions for managing user funds.
// 1. `addFunds`: Adds a specified amount to a user's account balance.
//    - Validates the input (userId and amount must be valid).
//    - Updates the user's balance in the database using Prisma.
// 2. `getUserBalance`: Retrieves the current balance of a user.
//    - Fetches the user's balance from the database.
//    - Returns the balance or 0 if the user is not found.
// 3. `hasSufficientFunds`: Checks if a user has enough funds for a specific amount.
//    - Retrieves the user's balance using `getUserBalance`.
//    - Compares the balance with the required amount and returns a boolean.

import prisma from "@/lib/prisma";

export const fundService = {
  /**
   * Add funds to a user's account
   */
  addFunds: async (userId: string, amount: number) => {
    if (!userId || typeof amount !== "number" || amount <= 0) {
      throw new Error("Valid userId and positive amount are required");
    }

    return await prisma.user.update({
      where: { id: userId },
      data: {
        amount: {
          increment: amount,
        },
      },
    });
  },

  /**
   * Get a user's current balance
   */
  getUserBalance: async (userId: string) => {
    if (!userId) throw new Error("UserId is required");

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { amount: true },
    });

    return user?.amount || 0;
  },

  /**
   * Check if user has sufficient funds
   */
  hasSufficientFunds: async (userId: string, requiredAmount: number) => {
    const balance = await fundService.getUserBalance(userId);
    return balance >= requiredAmount;
  },
};
