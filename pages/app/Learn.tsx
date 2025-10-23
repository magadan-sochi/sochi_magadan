

import React, { useState, useEffect } from 'react';
// FIX: Switched to named imports for react-router-dom to resolve component access errors.
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import type { MenuSection, MenuCategory, SectionCategory } from '../../types';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { ArrowRight } from 'lucide-react';

interface SectionWithCategories extends MenuSection {
    categories: MenuCategory[];
}

const Learn: React.FC = () => {
    const [sections, setSections] = useState<SectionWithCategories[]>([]);
    const [expandedSection, setExpandedSection] = useState<number | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMenuData = async () => {
            console.log('Learn: Fetching menu data...');
            const [
                { data: sectionsData },
                { data: categoriesData },
                { data: sectionCategoriesData }
            ] = await Promise.all([
                supabase.from('menu_sections').select('*').eq('is_active', true),
                supabase.from('menu_categories').select('*'),
                supabase.from('section_categories').select('*')
            ]);

            console.log('Learn: Fetched sections:', sectionsData);

            if (sectionsData && categoriesData && sectionCategoriesData) {
                const categoryMap = new Map<number, MenuCategory>();
                (categoriesData as MenuCategory[]).forEach(cat => categoryMap.set(cat.id, cat));

                const enrichedSections = (sectionsData as MenuSection[]).map(section => {
                    const categoryIds = (sectionCategoriesData as SectionCategory[])
                        .filter(sc => sc.section_id === section.id)
                        .map(sc => sc.category_id);
                    
                    const categories = categoryIds.map(id => categoryMap.get(id)).filter((cat): cat is MenuCategory => cat !== undefined);
                    
                    return { ...section, categories };
                }).filter(section => section.categories.length > 0); 

                setSections(enrichedSections);
            }
        };
        fetchMenuData();
    }, []);

    const toggleSection = (id: number) => {
        setExpandedSection(expandedSection === id ? null : id);
    };

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold mb-6">Учить</h1>
            <p className="text-muted-foreground mb-8">Выберите раздел меню для начала изучения карточек.</p>
            
            <Card 
              onClick={() => navigate('/app/learn/session', { state: { fetchAll: true, categoryName: 'Все меню' } })}
              className="mb-6 cursor-pointer group relative overflow-hidden bg-gradient-to-r from-cyan-500/80 to-blue-500/80 p-5 border-blue-400/50 transition-transform hover:scale-105"
            >
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/20 rounded-full transition-transform group-hover:scale-[15]"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="font-bold text-xl text-white">Учить все</h3>
                    <p className="text-sm text-blue-100">Изучать карточки из всех разделов</p>
                </div>
                <ArrowRight className="w-8 h-8 text-white transition-transform group-hover:translate-x-1" />
              </div>
            </Card>

            <div className="space-y-4">
                {sections.map(section => (
                    <div key={section.id} className="border border-border/30 rounded-lg overflow-hidden bg-secondary/30">
                        <button
                            onClick={() => toggleSection(section.id)}
                            className="w-full text-left p-4 flex justify-between items-center bg-secondary/50 hover:bg-secondary/80 transition-colors"
                        >
                            <span className="text-lg font-semibold">{section.name}</span>
                             <svg className={`w-5 h-5 transition-transform ${expandedSection === section.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </button>
                        <div
                            className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedSection === section.id ? 'max-h-96' : 'max-h-0'}`}
                        >
                            <div className="p-4 space-y-2 bg-background/50">
                                {section.categories.map(category => (
                                    <div key={category.id} className="flex justify-between items-center p-2 rounded hover:bg-accent/50">
                                        <span>{category.name}</span>
                                        <Button size="sm" onClick={() => navigate('/app/learn/session', { state: { categoryId: category.id, categoryName: category.name }})}>Начать</Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Learn;