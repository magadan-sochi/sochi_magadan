
import React, { useState, useEffect, useMemo, useRef } from 'react';
// FIX: Switched to namespace import for react-router-dom to resolve module resolution errors.
import * as ReactRouterDOM from 'react-router-dom';
import { supabase } from '../../services/supabase';
import type { MenuItem } from '../../types';
import { useAuth } from '../../hooks/useAuth';

const Flashcard: React.FC<{ item: MenuItem; onFlip: () => void; isFlipped: boolean }> = ({ item, onFlip, isFlipped }) => {
    const ingredients = item.key_features?.ingredients;
    const allergens = item.key_features?.allergens;

    return (
        <div className="w-full h-full perspective-1000" onClick={onFlip} style={{ perspective: '1000px' }}>
            <div 
                className={`relative w-full h-full transition-transform duration-700`}
                style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : '' }}
            >
                {/* Front of card */}
                <div className="absolute w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-white/10 backdrop-blur-lg flex flex-col justify-end p-6 text-white" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
                     <img src={item.image_url} alt={item.name} className="absolute top-0 left-0 w-full h-full object-cover -z-10" />
                     <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                    <h2 className="text-3xl font-bold leading-tight">{item.name}</h2>
                    <p className="text-sm text-white/80 mt-2">Нажмите, чтобы увидеть детали</p>
                </div>

                {/* Back of card */}
                <div className="absolute w-full h-full rounded-3xl shadow-2xl border border-white/20 bg-slate-900/60 backdrop-blur-lg flex flex-col p-6 overflow-y-auto no-scrollbar" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                    <h2 className="text-2xl font-bold text-cyan-300 mb-3">{item.name}</h2>
                    <p className="text-gray-300 mb-4 text-sm leading-relaxed">{item.description}</p>
                    
                    {Array.isArray(ingredients) && ingredients.length > 0 && (
                        <div className="mb-4">
                            <h3 className="font-semibold text-white mb-2">Состав:</h3>
                            <div className="flex flex-wrap gap-2">
                                {ingredients.map((ing, idx) => (
                                    <span key={idx} className="bg-cyan-500/20 text-cyan-300 text-xs font-medium px-2.5 py-1 rounded-full">{ing}</span>
                                ))}
                            </div>
                        </div>
                    )}
                     
                    {Array.isArray(allergens) && allergens.length > 0 && (
                        <div className="mb-4">
                            <h3 className="font-semibold text-white mb-2">Аллергены:</h3>
                            <div className="flex flex-wrap gap-2">
                                {allergens.map((allergen, idx) => (
                                    <span key={idx} className="bg-amber-500/20 text-amber-300 text-xs font-medium px-2.5 py-1 rounded-full">{allergen}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-auto pt-4 border-t border-white/10">
                         <p className="text-3xl font-bold text-right text-emerald-400">{item.price} ₽</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const LearnSession: React.FC = () => {
    const { user } = useAuth();
    const [deck, setDeck] = useState<MenuItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [swipeClass, setSwipeClass] = useState('');
    const touchStartPos = useRef<number | null>(null);

    const location = ReactRouterDOM.useLocation();
    const navigate = ReactRouterDOM.useNavigate();
    const { categoryId, categoryName, fetchAll } = (location.state as { categoryId?: number; categoryName?: string, fetchAll?: boolean }) || {};

    useEffect(() => {
        if (!categoryId && !fetchAll) {
            console.warn("LearnSession: No categoryId or fetchAll flag provided, redirecting.");
            navigate('/app/learn');
            return;
        }

        const fetchCards = async () => {
            if (!user) return;
            setIsLoading(true);

            // 1. Fetch IDs of already learned cards
            const { data: learnedProgress, error: learnedError } = await supabase
                .from('user_learning_progress')
                .select('menu_item_id')
                .eq('user_id', user.id)
                .eq('status', 'learned');

            if (learnedError) {
                console.error("LearnSession: Error fetching learned progress:", learnedError);
            }
            const learnedItemIds = learnedProgress ? learnedProgress.map(p => p.menu_item_id) : [];

            // 2. Fetch menu items, excluding the learned ones
            let query = supabase
                .from('menu_items')
                .select()
                .eq('is_active', true);

            if (fetchAll) {
                // Fetch all active items
            } else if (categoryId) {
                query = query.eq('category_id', categoryId);
            }
            
            if (learnedItemIds.length > 0) {
                query = query.not('id', 'in', `(${learnedItemIds.join(',')})`);
            }

            const { data, error } = await query;

            if (error) {
                console.error("LearnSession: Error fetching cards:", error);
            } else if (data) {
                setDeck((data as MenuItem[]).sort(() => Math.random() - 0.5)); // Shuffle deck
            }
            setIsLoading(false);
        };
        fetchCards();
    }, [categoryId, fetchAll, navigate, user]);

    const currentItem = useMemo(() => deck[currentIndex], [deck, currentIndex]);

    const updateProgress = async (cardId: number, status: 'learning' | 'learned') => {
        if (!user) return;
        
        const now = new Date();
        const nextReviewDate = new Date();
        if (status === 'learned') {
            nextReviewDate.setDate(now.getDate() + 7);
        } else {
            nextReviewDate.setDate(now.getDate() + 1);
        }

        const { error } = await supabase
            .from('user_learning_progress')
            .upsert({
                user_id: user.id,
                menu_item_id: cardId,
                status: status,
                last_reviewed_at: now.toISOString(),
                next_review_at: nextReviewDate.toISOString(),
                familiarity_score: status === 'learned' ? 100 : 25
            }, { onConflict: 'user_id, menu_item_id' });

        if (error) console.error('Failed to update learning progress:', error);
    };

    const handleSwipe = (action: 'know' | 'repeat') => {
        if (!currentItem || swipeClass) return;

        setIsFlipped(false);
        
        const currentCard = deck[currentIndex];
        const status = action === 'know' ? 'learned' : 'learning';
        updateProgress(currentCard.id, status);

        setSwipeClass(action === 'know' ? 'animate-slide-out-right' : 'animate-slide-out-left');
        
        setTimeout(() => {
            if (currentIndex + 1 < deck.length) {
                 setCurrentIndex(prevIndex => (prevIndex + 1));
            } else {
                 setCurrentIndex(deck.length); // Go to "completed" state
            }
            setSwipeClass('');
        }, 400); // Match animation duration
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartPos.current = e.targetTouches[0].clientX;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartPos.current === null || isFlipped) return;
        
        const touchEndPos = e.changedTouches[0].clientX;
        const deltaX = touchEndPos - touchStartPos.current;
        const swipeThreshold = 50; 

        if (Math.abs(deltaX) > swipeThreshold) {
            if (deltaX > 0) handleSwipe('know');
            else handleSwipe('repeat');
        }
        touchStartPos.current = null;
    };
    
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400"></div>
            </div>
        );
    }

    if (!currentItem) {
        return (
            <div className="p-4 text-center h-screen flex flex-col items-center justify-center">
                <div className="relative p-8 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-lg shadow-2xl text-center">
                    <span className="text-6xl">🎉</span>
                    <p className="mt-4 text-2xl font-bold text-white">Вы всё изучили!</p>
                    <p className="text-gray-300 mt-1">Отличная работа! Карточки, которые вы знаете, теперь доступны в разделе "Тесты" для повторения.</p>
                    <button 
                        onClick={() => navigate('/app/learn')}
                        className="mt-6 w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/30"
                    >
                        Вернуться к разделам
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden items-center justify-center p-4">
             <div className="absolute top-5 text-center w-full px-4">
                <h1 className="text-2xl font-bold text-white/90 truncate">{categoryName || 'Изучение'}</h1>
                <p className="text-gray-400">
                    Карточка {currentIndex + 1} из {deck.length}
                </p>
            </div>
            <div 
                className={`w-full max-w-sm h-[75vh] max-h-[650px] transition-all duration-300 ${swipeClass}`}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {currentItem && <Flashcard item={currentItem} onFlip={() => setIsFlipped(!isFlipped)} isFlipped={isFlipped} />}
            </div>
            
            <div className="absolute bottom-8 text-center text-gray-400 text-sm w-full max-w-sm px-4">
                <p>Смахните влево, чтобы повторить</p>
                <p>Смахните вправо, если знаете</p>
            </div>
        </div>
    );
};

export default LearnSession;
