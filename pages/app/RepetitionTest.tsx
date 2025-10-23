import React, { useState, useEffect, useMemo, useCallback } from 'react';
// FIX: Switched to a named import for react-router-dom to resolve module resolution errors.
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import type { MenuItem } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { AutocompleteInput } from '../../components/ui/AutocompleteInput';

type UserAnswers = {
    ingredients: Set<string>;
    allergens: Set<string>;
    price: string;
};

type Feedback = {
    score: number;
    passed: boolean;
    reason?: 'time_up';
};

const TimerCircle: React.FC<{ timeLeft: number; totalTime: number }> = ({ timeLeft, totalTime }) => {
    const radius = 24;
    const stroke = 4;
    const normalizedRadius = radius - stroke / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const progress = (timeLeft / totalTime) * 100;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    let colorClass = 'text-green-400';
    if (progress < 50) colorClass = 'text-yellow-400';
    if (progress < 25) colorClass = 'text-red-500';

    return (
        <div className="relative w-14 h-14">
            <svg height={radius*2} width={radius*2} className="-rotate-90">
                <circle
                    stroke="hsl(217.2 32.6% 17.5%)"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                <circle
                    className={`transition-all duration-500 ${colorClass}`}
                    stroke="currentColor"
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={`${circumference} ${circumference}`}
                    style={{ strokeDashoffset }}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className={`font-bold text-lg ${colorClass}`}>{timeLeft}</span>
            </div>
        </div>
    );
};

const RepetitionTest: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [deck, setDeck] = useState<MenuItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isChecking, setIsChecking] = useState(false);
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [timeLeft, setTimeLeft] = useState(120);
    
    const [allIngredients, setAllIngredients] = useState<string[]>([]);
    const [allAllergens, setAllAllergens] = useState<string[]>([]);

    const [userAnswers, setUserAnswers] = useState<UserAnswers>({
        ingredients: new Set(),
        allergens: new Set(),
        price: '',
    });

    useEffect(() => {
        const fetchTestData = async () => {
            if (!user) return;
            setIsLoading(true);

            const { data: learnedProgress, error: learnedError } = await supabase
                .from('user_learning_progress')
                .select('menu_item_id')
                .eq('user_id', user.id)
                .eq('status', 'learned');

            if (learnedError || !learnedProgress || learnedProgress.length === 0) {
                setDeck([]);
                setIsLoading(false);
                return;
            }

            const learnedItemIds = learnedProgress.map(p => p.menu_item_id);
            const { data: itemsData, error: itemsError } = await supabase
                .from('menu_items')
                .select('*')
                .in('id', learnedItemIds);
            
            if (itemsError) {
                console.error("RepetitionTest: Error fetching items:", itemsError);
            } else if (itemsData) {
                setDeck((itemsData as MenuItem[]).sort(() => Math.random() - 0.5));

                const ingredientSet = new Set<string>();
                const allergenSet = new Set<string>();
                
                const { data: allItems } = await supabase.from('menu_items').select('key_features');
                
                allItems?.forEach((item: any) => {
                    item.key_features?.ingredients?.forEach((ing: string) => ingredientSet.add(ing.trim().toLowerCase().replace(/\.$/, '')));
                    item.key_features?.allergens?.forEach((a: string) => allergenSet.add(a.trim().toLowerCase().replace(/\.$/, '')));
                });
                
                setAllIngredients(Array.from(ingredientSet).sort());
                setAllAllergens(Array.from(allergenSet).sort());
            }
            setIsLoading(false);
        };
        fetchTestData();
    }, [user]);

    const currentItem = useMemo(() => deck[currentIndex], [deck, currentIndex]);

    const updateRating = useCallback(async (points: number) => {
        if (!user) return;
        // This RPC function should handle incrementing the user's rating atomically.
        const { error } = await supabase.rpc('increment_user_rating', {
            user_id_in: user.id,
            rating_change: points
        });
        if (error) {
            console.error('Failed to update rating via RPC. Maybe the function does not exist?', error);
        }
    }, [user]);
    
    const advanceToNextCard = useCallback(() => {
        setFeedback(null);
        setUserAnswers({ ingredients: new Set(), allergens: new Set(), price: '' });
        if (currentIndex + 1 < deck.length) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setCurrentIndex(deck.length);
        }
    }, [currentIndex, deck.length]);

    const handleCheckAnswer = useCallback(async () => {
        if (!currentItem || !user || isChecking || feedback) return;
        setIsChecking(true);
    
        const correctIngredients = new Set((currentItem.key_features?.ingredients || []).map(s => s.trim().toLowerCase().replace(/\.$/, '')));
        const correctAllergens = new Set((currentItem.key_features?.allergens || []).map(s => s.trim().toLowerCase().replace(/\.$/, '')));
        const correctPrice = currentItem.price.toString();
        
        const totalPossiblePoints = correctIngredients.size + correctAllergens.size + 1;
        let userPoints = 0;
    
        if (userAnswers.price.trim() === correctPrice) userPoints += 1;
    
        let ingredientPoints = 0;
        userAnswers.ingredients.forEach(ing => {
            ingredientPoints += correctIngredients.has(ing) ? 1 : -1;
        });
        userPoints += Math.max(0, ingredientPoints);
    
        let allergenPoints = 0;
        userAnswers.allergens.forEach(allergen => {
            allergenPoints += correctAllergens.has(allergen) ? 1 : -1;
        });
        userPoints += Math.max(0, allergenPoints);
    
        const score = totalPossiblePoints > 0 ? (Math.max(0, userPoints) / totalPossiblePoints) * 100 : 100;
        const passed = score >= 85;
    
        await updateRating(passed ? 10 : -5);

        if (!passed) {
            await supabase
                .from('user_learning_progress')
                .update({ status: 'learning', familiarity_score: 25 })
                .eq('user_id', user.id)
                .eq('menu_item_id', currentItem.id);
        } else {
             await supabase
                .from('user_learning_progress')
                .update({ last_reviewed_at: new Date().toISOString() })
                .eq('user_id', user.id)
                .eq('menu_item_id', currentItem.id);
        }
        
        setFeedback({ score, passed });
    
        setTimeout(() => {
            setIsChecking(false);
            advanceToNextCard();
        }, 2000);
    }, [user, currentItem, userAnswers, isChecking, feedback, advanceToNextCard, updateRating]);

    // Timer countdown effect
    useEffect(() => {
        if (!currentItem || feedback) return;
        if (timeLeft > 0) {
            const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timerId);
        }
    }, [timeLeft, currentItem, feedback]);
    
    // Reset timer for new card
    useEffect(() => {
      setTimeLeft(120);
    }, [currentIndex]);

    // Handle time up
    useEffect(() => {
        if (timeLeft === 0 && !feedback && currentItem) {
            (async () => {
                await updateRating(-5);
                setFeedback({ score: 0, passed: false, reason: 'time_up' });
                setTimeout(advanceToNextCard, 2000);
            })();
        }
    }, [timeLeft, feedback, currentItem, advanceToNextCard, updateRating]);


    const handleAnswerChange = (type: 'ingredients' | 'allergens', value: string) => {
        setUserAnswers(prev => {
            const newSet = new Set(prev[type]);
            newSet.has(value) ? newSet.delete(value) : newSet.add(value);
            return { ...prev, [type]: newSet };
        });
    };
    
    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserAnswers(prev => ({ ...prev, price: e.target.value }));
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div></div>;
    }
    
    if (deck.length === 0 || !currentItem) {
        return (
            <div className="p-4 text-center h-screen flex flex-col items-center justify-center">
                <Card className="p-8">
                    <span className="text-6xl">👍</span>
                    <h1 className="mt-4 text-2xl font-bold">Тест завершен</h1>
                    <p className="text-muted-foreground mt-1">
                        {deck.length > 0 ? 'Вы повторили все карточки!' : 'У вас пока нет карточек для повторения.'}
                    </p>
                    <Button onClick={() => navigate('/app/tests')} className="mt-6 w-full">Вернуться к тестам</Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-4 min-h-screen flex flex-col items-center pb-20">
            <div className="w-full max-w-lg">
                <div className="flex justify-between items-center mt-4 mb-2">
                    <div className="text-left">
                        <h1 className="text-2xl font-bold">Повторение</h1>
                        <p className="text-muted-foreground">Карточка {currentIndex + 1} из {deck.length}</p>
                    </div>
                    <TimerCircle timeLeft={timeLeft} totalTime={120} />
                </div>
                
                {/* Adding a key here forces a re-mount when the item changes, fixing potential state bugs */}
                <div key={currentItem.id}>
                    <div className="w-full h-48 rounded-lg overflow-hidden my-6 relative">
                        <img src={currentItem.image_url} alt={currentItem.name} className="w-full h-full object-cover" />
                        <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/70 to-transparent">
                            <h2 className="text-2xl font-bold text-white">{currentItem.name}</h2>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="font-semibold mb-3 text-lg">Что входит в состав?</h3>
                            <AutocompleteInput
                                label="Начните вводить ингредиент..."
                                options={allIngredients}
                                selectedItems={userAnswers.ingredients}
                                onSelectItem={(item) => handleAnswerChange('ingredients', item)}
                                onRemoveItem={(item) => handleAnswerChange('ingredients', item)}
                            />
                        </div>
                        <div>
                            <h3 className="font-semibold mb-3 text-lg">Какие аллергены?</h3>
                            <AutocompleteInput
                                label="Начните вводить аллерген..."
                                options={allAllergens}
                                selectedItems={userAnswers.allergens}
                                onSelectItem={(item) => handleAnswerChange('allergens', item)}
                                onRemoveItem={(item) => handleAnswerChange('allergens', item)}
                            />
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2 text-lg">Укажите цену (₽)</h3>
                            <Input type="number" placeholder="Например: 550" value={userAnswers.price} onChange={handlePriceChange} />
                        </div>
                    </div>
                </div>

                <Button onClick={handleCheckAnswer} disabled={isChecking || !!feedback} className="w-full mt-8">
                    {isChecking ? 'Проверка...' : 'Проверить'}
                </Button>
                
                {feedback && (
                    <div className={`mt-4 p-4 rounded-lg text-center font-bold transition-opacity ${feedback.passed ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                        {feedback.reason === 'time_up' 
                            ? 'Время вышло! -5 очков.'
                            : feedback.passed 
                                ? `Отлично! +10 очков. Ваш результат: ${feedback.score.toFixed(0)}%` 
                                : `Нужно повторить. -5 очков. Результат: ${feedback.score.toFixed(0)}%`}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RepetitionTest;