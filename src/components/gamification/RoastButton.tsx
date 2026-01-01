import { useState } from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoastCard } from "./RoastCard";

const mockRoastData = {
  headline: "You spent $400 on Uber Eats but have $12 in savings. Make it make sense.",
  roasts: [
    "Your coffee addiction costs more than your gym membership you never use.",
    "You have 6 streaming subscriptions. Pick a struggle.",
    "Your 'treat yourself' budget is treating you to debt.",
  ],
  topSpendCategory: "Uber Eats & DoorDash",
  topSpendAmount: 847,
  savingsVsSpending: { savings: 12, spending: 3200 },
  worstPurchase: "Limited Edition Sneakers (worn once)",
  worstPurchaseAmount: 289,
};

export const RoastButton = () => {
  const [showRoast, setShowRoast] = useState(false);

  return (
    <>
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          onClick={() => setShowRoast(true)}
          className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold py-3 rounded-xl shadow-lg"
        >
          <Flame className="w-5 h-5 mr-2" />
          🔥 Roast My Spending
        </Button>
      </motion.div>

      {showRoast && (
        <RoastCard data={mockRoastData} onClose={() => setShowRoast(false)} />
      )}
    </>
  );
};
