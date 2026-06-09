import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import useDashboardData from '../../hooks/useDashboardData'; // Custom Hook Import
import { Loader2 } from 'lucide-react';

// Components
import Header from '../../components/Dashboard/Header';
import HeroCard from '../../components/Dashboard/HeroCard';
import MoodChart from '../../components/Dashboard/MoodChart';
import StatsPanel from '../../components/Dashboard/StatsPanel';
import ActivityChart from '../../components/Dashboard/ActivityChart';
import MoodHeatmap from '../../components/Dashboard/MoodHeatmap';
import WeeklyReportCard from '../../components/Dashboard/WeeklyReportCard';
import GamificationCard from '../../components/Dashboard/GamificationCard';
const Dashboard = () => {
  const { user } = useAuth();
  const { setCurrentTheme, palette } = useTheme();

  // Custom Hook se saara data aur loading state mil gaya
  const { 
    stats, 
    latestMood, 
    chartData, 
    moodHistory, 
    activityData, 
    loading 
  } = useDashboardData();

  // Side Effect: Theme update karna jab latestMood change ho
  useEffect(() => {
    if (latestMood?.mood) {
      setCurrentTheme(latestMood.mood);
    }
  }, [latestMood, setCurrentTheme]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="animate-spin text-white w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-10">
      
      {/* 1. Header Section */}
      <Header user={user} palette={palette} />

      {/* 2. AI Weekly Report (Highlight) */}
      <WeeklyReportCard />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 3. Left Column (Main Charts) */}
        <div className="lg:col-span-2 space-y-6">
            <HeroCard latestMood={latestMood} />
            <MoodChart data={chartData} palette={palette} />
            <MoodHeatmap moodHistory={moodHistory} />
        </div>

        {/* 4. Right Column (Stats & Breakdown) */}
        <div className="space-y-6">
          <GamificationCard user={user} />
            <StatsPanel stats={stats} palette={palette} />
            <ActivityChart data={activityData} />
        </div>
        
      </div>
    </div>
  );
};

export default Dashboard;