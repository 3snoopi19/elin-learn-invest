import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DASHBOARD_CARDS } from "@/config/dashboard.layout";
import { dedupeCards } from "@/utils/dashboard/dedupe";
import { DashboardCardRenderer } from "@/utils/dashboard/ComponentMapper";
import { motion } from "framer-motion";
const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [userProfile, setUserProfile] = useState<any>(null);
  const { toast } = useToast();

  // Get deduplicated dashboard cards
  const dashboardCards = dedupeCards(DASHBOARD_CARDS);

  // Check if user just completed the quiz
  useEffect(() => {
    if (searchParams.get('quiz_completed') === 'true') {
      toast({
        title: "🎉 Risk Profile Complete!",
        description: "Your personalized investment recommendations are now available.",
      });
    }
  }, [searchParams, toast]);

  // Redirect non-authenticated users
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (error) throw error;
        setUserProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [user]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Render dashboard cards from centralized config */}
        <div className="space-y-8">
          {dashboardCards.map((card, index) => (
            <DashboardCardRenderer
              key={card.key}
              componentName={card.component}
              gridSpan={card.gridSpan}
              props={{
                userName: user.user_metadata?.first_name || 'Investor',
                hasRiskProfile: !!userProfile?.risk_profile,
                animationDelay: index * 0.1,
                ...card.props
              }}
            />
          ))}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;