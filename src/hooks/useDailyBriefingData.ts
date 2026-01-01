import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, subDays, addDays } from "date-fns";

interface UpcomingBill {
  name: string;
  amount: number;
  daysUntil: number;
  logo?: string;
}

interface Opportunity {
  title: string;
  description: string;
  action: string;
  savings: number;
}

interface BriefingData {
  yesterdaySpent: number;
  dailyBudget: number;
  upcomingBills: UpcomingBill[];
  opportunity: Opportunity;
  checkingBalance: number;
  isLoading: boolean;
}

// Map common service names to their categories/icons
const getServiceIcon = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower.includes('netflix')) return '🎬';
  if (lower.includes('spotify')) return '🎵';
  if (lower.includes('electric') || lower.includes('power')) return '⚡';
  if (lower.includes('water')) return '💧';
  if (lower.includes('internet') || lower.includes('wifi')) return '📶';
  if (lower.includes('phone') || lower.includes('mobile')) return '📱';
  if (lower.includes('rent') || lower.includes('mortgage')) return '🏠';
  if (lower.includes('insurance')) return '🛡️';
  if (lower.includes('gym') || lower.includes('fitness')) return '💪';
  if (lower.includes('amazon')) return '📦';
  if (lower.includes('disney')) return '🏰';
  if (lower.includes('hulu')) return '📺';
  if (lower.includes('youtube')) return '▶️';
  if (lower.includes('gas')) return '⛽';
  return '📋';
};

// Calculate APY earnings
const calculateAPYEarnings = (balance: number, apy: number = 4.5): number => {
  return (balance * (apy / 100)) / 12;
};

export function useDailyBriefingData(): BriefingData {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<BriefingData>({
    yesterdaySpent: 0,
    dailyBudget: 80, // Default daily budget
    upcomingBills: [],
    opportunity: {
      title: "Idle Cash Alert",
      description: "You have idle cash that could be working harder.",
      action: "Move to High Yield Savings to earn 4.5% APY",
      savings: 0,
    },
    checkingBalance: 0,
    isLoading: true,
  });

  useEffect(() => {
    const fetchBriefingData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
        const today = format(new Date(), 'yyyy-MM-dd');
        const threeDaysFromNow = format(addDays(new Date(), 3), 'yyyy-MM-dd');

        // Fetch yesterday's transactions
        const { data: transactions, error: txError } = await supabase
          .from('transactions')
          .select('amount')
          .eq('user_id', user.id)
          .eq('transaction_date', yesterday);

        if (txError) console.error('Error fetching transactions:', txError);

        // Calculate yesterday's spending (negative amounts are expenses)
        const yesterdaySpent = transactions
          ? transactions
              .filter(tx => tx.amount < 0)
              .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)
          : 0;

        // Fetch upcoming subscriptions/bills
        const { data: subscriptions, error: subError } = await supabase
          .from('subscriptions')
          .select('service_name, monthly_cost, next_billing_date')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .gte('next_billing_date', today)
          .lte('next_billing_date', threeDaysFromNow)
          .order('next_billing_date', { ascending: true })
          .limit(3);

        if (subError) console.error('Error fetching subscriptions:', subError);

        const upcomingBills: UpcomingBill[] = subscriptions
          ? subscriptions.map(sub => {
              const billDate = new Date(sub.next_billing_date);
              const todayDate = new Date();
              const daysUntil = Math.ceil((billDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
              return {
                name: sub.service_name,
                amount: sub.monthly_cost,
                daysUntil: Math.max(0, daysUntil),
                logo: getServiceIcon(sub.service_name),
              };
            })
          : [];

        // Fetch connected accounts for balance
        const { data: accounts, error: accError } = await supabase
          .from('connected_accounts')
          .select('current_balance, account_type')
          .eq('user_id', user.id)
          .eq('is_active', true);

        if (accError) console.error('Error fetching accounts:', accError);

        // Calculate checking balance
        const checkingBalance = accounts
          ? accounts
              .filter(acc => acc.account_type.toLowerCase() === 'checking')
              .reduce((sum, acc) => sum + (acc.current_balance || 0), 0)
          : 0;

        // Generate opportunity based on checking balance
        const suggestedTransfer = Math.min(checkingBalance * 0.5, 1000); // Transfer up to 50% or $1000
        const potentialEarnings = calculateAPYEarnings(suggestedTransfer);

        const opportunity: Opportunity = checkingBalance > 500
          ? {
              title: "Idle Cash Alert",
              description: `You have $${checkingBalance.toLocaleString()} in your checking account.`,
              action: `Move $${suggestedTransfer.toLocaleString()} to High Yield Savings to earn 4.5% APY`,
              savings: potentialEarnings,
            }
          : {
              title: "Stay on Track",
              description: "Keep up the good work with your spending habits.",
              action: "Set a savings goal to grow your emergency fund",
              savings: 0,
            };

        setData({
          yesterdaySpent: Math.round(yesterdaySpent * 100) / 100,
          dailyBudget: 80, // Could be fetched from user preferences
          upcomingBills,
          opportunity,
          checkingBalance,
          isLoading: false,
        });
      } catch (error) {
        console.error('Error fetching briefing data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBriefingData();
  }, [user]);

  return { ...data, isLoading };
}
