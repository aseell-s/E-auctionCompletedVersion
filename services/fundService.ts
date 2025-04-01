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
