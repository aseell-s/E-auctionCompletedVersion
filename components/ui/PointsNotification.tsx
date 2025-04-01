import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FiAward, FiX } from "react-icons/fi";
import { motion } from "framer-motion";

// Keep track of which toasts have been shown already
const shownToasts = new Set<string>();

interface PointsNotificationProps {
  auctionId: string;
  title: string;
  pointsAwarded: number;
  onDismiss: () => void;
}

export const PointsNotification = ({
  auctionId,
  title,
  pointsAwarded,
  onDismiss,
}: PointsNotificationProps) => {
  return (
    <motion.div
      className="flex items-start p-2 overflow-hidden relative"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Close button */}
      <button
        onClick={onDismiss}
        className="absolute top-1 right-1 p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        aria-label="Close notification"
      >
        <FiX size={16} className="text-gray-500" />
      </button>

      <div className="mr-3 mt-1">
        <motion.div
          className="bg-gradient-to-br from-amber-300 to-amber-500 p-2.5 rounded-full shadow-md"
          initial={{ scale: 0.8, rotate: -10 }}
          animate={{
            scale: 1,
            rotate: 0,
            transition: { delay: 0.1, type: "spring", stiffness: 200 },
          }}
        >
          <FiAward className="text-white h-6 w-6" />
        </motion.div>
      </div>

      <div className="flex-1 pr-6">
        <motion.h3
          className="text-lg font-bold flex items-center mb-1 text-amber-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Points Earned! 🎉
        </motion.h3>

        <motion.p
          className="text-sm mb-1.5 text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Your auction has successfully ended:
        </motion.p>

        <motion.p
          className="text-sm font-medium mb-2 text-gray-800 line-clamp-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          "{title}"
        </motion.p>

        <motion.div
          className="flex items-center bg-gradient-to-r from-amber-50 to-amber-100 p-2 rounded-md border border-amber-200"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          <div className="flex items-baseline">
            <span className="text-sm text-amber-700 font-medium">
              You earned{" "}
            </span>
            <motion.span
              className="mx-1.5 text-2xl font-bold bg-gradient-to-br from-amber-500 to-amber-700 bg-clip-text text-transparent"
              initial={{ scale: 0.5 }}
              animate={{
                scale: [0.5, 1.2, 1],
                transition: { delay: 0.6, duration: 0.5, times: [0, 0.6, 1] },
              }}
            >
              +{pointsAwarded}
            </motion.span>
            <span className="text-sm text-amber-700 font-medium">points</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

/**
 * Show a toast notification for points earned
 */
export const showPointsEarnedToast = (
  auctionTitle: string,
  pointsAwarded: number
) => {
  // Create a unique key for this toast based on title and points
  const toastKey = `${auctionTitle}-${pointsAwarded}`;

  // Check if we've already shown this toast
  if (shownToasts.has(toastKey)) {
    return;
  }

  // Mark this toast as shown
  shownToasts.add(toastKey);

  toast.custom(
    (id) => (
      <PointsNotification
        auctionId={id.toString()}
        title={auctionTitle}
        pointsAwarded={pointsAwarded}
        onDismiss={() => toast.dismiss(id)}
      />
    ),
    {
      duration: 8000,
      position: "top-center",
      className:
        "bg-white rounded-xl shadow-xl border border-amber-200 overflow-hidden py-2 px-1",
      // Add id to prevent duplicate toasts
      id: toastKey,
    }
  );
};
