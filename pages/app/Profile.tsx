

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabase';
import type { Achievement } from '../../types';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Trophy, Star } from 'lucide-react';
// FIX: Switched to a named import for react-router-dom to resolve module resolution errors.
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'stats' | 'achievements'>('stats');
    const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
    const [userAchievementIds, setUserAchievementIds] = useState<Set<number>>(new Set());
    const [learnedCardsCount, setLearnedCardsCount] = useState(0);
    const [rating, setRating] = useState(0);

    useEffect(() => {
        if (!user) return;

        const fetchProfileData = async () => {
            console.log(`Profile: Fetching data for user: ${user.id}`);
            
            // Fetch user-specific data like rating
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('rating')
                .eq('id', user.id)
                .single();

            if (userError) {
                console.error("Profile: Error fetching user data:", userError);
            } else if (userData) {
                setRating(userData.rating || 0);
            }

            // Fetch achievements
            const { data: allAchData, error: allAchError } = await supabase.from('achievements').select();
            const { data: userAchData, error: userAchError } = await supabase
                .from('user_achievements')
                .select('achievement_id')
                .eq('user_id', user.id);
            
            if(allAchError || userAchError) {
                console.error("Profile: Error fetching achievements", allAchError || userAchError);
            }

            if (allAchData) setAllAchievements(allAchData as Achievement[]);
            if (userAchData) {
                const ids = new Set((userAchData as {achievement_id: number}[]).map(ua => ua.achievement_id));
                setUserAchievementIds(ids);
            }

            // Fetch learning stats
            const { count, error: countError } = await supabase
                .from('user_learning_progress')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('status', 'learned');
            
            if (countError) {
                console.error("Profile: Error fetching learned cards count:", countError);
            } else {
                setLearnedCardsCount(count || 0);
            }
        };

        fetchProfileData();
    }, [user]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    return (
        <div className="p-4 space-y-6">
            <div className="flex flex-col items-center space-y-2 pt-4">
                <Avatar className="w-24 h-24">
                    <AvatarImage src={`https://i.pravatar.cc/150?u=${user?.id}`} />
                    <AvatarFallback className="text-3xl">{user?.full_name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <h1 className="text-2xl font-bold">{user?.full_name}</h1>
                <p className="text-muted-foreground">{user?.email}</p>
            </div>
            
            <div className="flex w-full bg-secondary/50 p-1 rounded-md">
                <button 
                    onClick={() => setActiveTab('stats')}
                    className={`w-1/2 p-2 rounded transition-colors text-sm font-medium ${activeTab === 'stats' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                >
                    Статистика
                </button>
                <button 
                    onClick={() => setActiveTab('achievements')}
                    className={`w-1/2 p-2 rounded transition-colors text-sm font-medium ${activeTab === 'achievements' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                >
                    Достижения
                </button>
            </div>
            
            {activeTab === 'stats' && (
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Обзор</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                             <div className="text-center p-4 rounded-lg bg-secondary/50">
                                <p className="text-3xl font-bold">{learnedCardsCount}</p>
                                <p className="text-sm text-muted-foreground">Карточек изучено</p>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-secondary/50">
                                <p className="text-3xl font-bold">{rating}</p>
                                <p className="text-sm text-muted-foreground">Рейтинг</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === 'achievements' && (
                <div className="grid grid-cols-3 gap-4">
                    {allAchievements.map(ach => {
                        const isUnlocked = userAchievementIds.has(ach.id);
                        return (
                            <div key={ach.id} className={`flex flex-col items-center text-center p-4 rounded-lg transition-opacity ${isUnlocked ? 'bg-secondary/50' : 'bg-secondary/20 opacity-60'}`}>
                                <Trophy className={`w-10 h-10 mb-2 ${isUnlocked ? 'text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.7)]' : 'text-muted-foreground'}`} />
                                <h3 className="font-semibold text-sm">{ach.name}</h3>
                                <p className="text-xs text-muted-foreground mt-1">{ach.description}</p>
                            </div>
                        );
                    })}
                </div>
            )}
             <Button variant="outline" className="w-full" onClick={handleSignOut}>
                Выйти
            </Button>
        </div>
    );
};

export default Profile;