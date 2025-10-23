
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabase';
import type { Achievement } from '../../types';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/Avatar';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { BookOpenIcon } from '../../components/icons/BookOpenIcon';
import { Trophy, ArrowRight } from 'lucide-react';
// FIX: Switched to a named import for react-router-dom to resolve module resolution errors.
import { useNavigate } from 'react-router-dom';


const ProgressCircle: React.FC<{ progress: number; radius?: number; strokeWidth?: number }> = ({ progress, radius = 60, strokeWidth = 10 }) => {
    const normalizedRadius = radius - strokeWidth / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
            <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
            </defs>
            <circle
                stroke="hsl(217.2 32.6% 17.5%)"
                fill="transparent"
                strokeWidth={strokeWidth}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
            />
            <circle
                stroke="url(#progressGradient)"
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference + ' ' + circumference}
                style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease-out' }}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
            />
        </svg>
    );
};


const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [learnedCount, setLearnedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        console.log('Dashboard: Fetching data for user:', user.id);

        const { data: progressData, error: progressError } = await supabase
            .from('user_learning_progress')
            .select('status')
            .eq('user_id', user.id);
        
        if(progressError) console.error("Dashboard: Error fetching progress", progressError);
        else console.log('Dashboard: Fetched progress data:', progressData);

        const { count: totalItemsCount, error: totalCountError } = await supabase
            .from('menu_items')
            .select('*', { count: 'exact', head: true });
        
        if(totalCountError) console.error("Dashboard: Error fetching total items count", totalCountError);
        else console.log('Dashboard: Fetched total items count:', totalItemsCount);


        if (progressData && totalItemsCount) {
            const learned = progressData.filter(p => p.status === 'learned').length;
            setLearnedCount(learned);
            setTotalCount(totalItemsCount);
            setProgress(totalItemsCount > 0 ? (learned / totalItemsCount) * 100 : 0);
        }

        const { data: userAchievementsData, error: userAchError } = await supabase
            .from('user_achievements')
            .select('achievement_id')
            .eq('user_id', user.id);

        if(userAchError) console.error("Dashboard: Error fetching user achievements", userAchError);
        else console.log('Dashboard: Fetched user achievements IDs:', userAchievementsData);

        if (userAchievementsData && userAchievementsData.length > 0) {
            const achievementIds = userAchievementsData.map(ua => ua.achievement_id);
            const { data: achievementsData, error: achError } = await supabase
                .from('achievements')
                .select('*')
                .in('id', achievementIds);
            
            if(achError) console.error("Dashboard: Error fetching achievements details", achError);
            else console.log('Dashboard: Fetched achievements details:', achievementsData);

            if (achievementsData) setAchievements(achievementsData);
        } else {
            setAchievements([]);
        }
      }
    };
    fetchData();
  }, [user]);

  return (
    <div className="p-4 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">Добро пожаловать!</p>
          <h1 className="text-3xl font-bold">Привет, {user?.full_name?.split(' ')[0] || 'User'}!</h1>
        </div>
        <Avatar className="w-12 h-12">
          <AvatarImage src={`https://i.pravatar.cc/150?u=${user?.id}`} alt="User avatar" />
          <AvatarFallback>{user?.full_name?.[0] || 'U'}</AvatarFallback>
        </Avatar>
      </div>

      <Card className="bg-gradient-to-br from-blue-500/30 to-purple-500/30 border-purple-400/50 p-6 text-center">
        <CardContent className="p-0 flex flex-col items-center justify-center">
            <div className="relative w-[120px] h-[120px]">
                <ProgressCircle progress={progress} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold">{Math.round(progress)}%</span>
                    <span className="text-sm text-muted-foreground">Изучено</span>
                </div>
            </div>
            <p className="mt-4 text-lg">Вы изучили {learnedCount} из {totalCount} карточек!</p>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Начните сегодня</h2>
        <Card 
          onClick={() => navigate('/app/learn')}
          className="cursor-pointer group relative overflow-hidden bg-gradient-to-r from-green-500/80 to-teal-500/80 p-5 border-teal-400/50 transition-transform hover:scale-105"
        >
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/20 rounded-full transition-transform group-hover:scale-[15]"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1">
                <h3 className="font-bold text-xl text-white">Учить карточки</h3>
                <p className="text-sm text-green-100">Перейти к разделам меню</p>
            </div>
            <ArrowRight className="w-8 h-8 text-white transition-transform group-hover:translate-x-1" />
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Последние достижения</h2>
        {achievements.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {achievements.slice(0, 3).map(ach => (
                <Card key={ach.id} className="p-4 text-center space-y-2 bg-secondary/50 border-yellow-400/30">
                    <Trophy className="w-10 h-10 mx-auto text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.7)]"/>
                    <h3 className="font-semibold text-sm">{ach.name}</h3>
                </Card>
            ))}
          </div>
        ) : <p className="text-muted-foreground p-4 text-center">Достижений пока нет. Продолжайте учиться!</p>}
      </div>
    </div>
  );
};

export default Dashboard;