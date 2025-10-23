import React, { useState, useEffect } from 'react';
// FIX: Switched to a named import for react-router-dom to resolve module resolution errors.
// FIX-GEMINI: Downgrading react-router-dom hooks to v5 to fix module export errors.
import { useHistory } from 'react-router-dom';
import { supabase } from '../../services/supabase.ts';
import type { Quiz } from '../../types.ts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card.tsx';
import { FileTextIcon } from '../../components/icons/FileTextIcon.tsx';
import { RefreshCw } from 'lucide-react';

const Tests: React.FC = () => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    // FIX-GEMINI: Using useHistory hook for v5 compatibility.
    const history = useHistory();

    useEffect(() => {
        const fetchQuizzes = async () => {
            console.log('Tests: Fetching quizzes...');
            const { data, error } = await supabase.from('quizzes').select();
            if (error) {
                console.error("Tests: Error fetching quizzes:", error);
            } else if (data) {
                console.log("Tests: Fetched quizzes:", data);
                setQuizzes(data as Quiz[]);
            }
        };
        fetchQuizzes();
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold mb-6">Тесты</h1>
            <p className="text-muted-foreground mb-8">Проверьте свои знания, пройдя один из тестов.</p>
            <div className="space-y-4">
                {/* FIX-GEMINI: Using history.push for v5 navigation. */}
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => history.push(`/app/tests/repetition`)}>
                    <CardHeader>
                        <div className="flex items-start space-x-4">
                            <RefreshCw className="w-6 h-6 mt-1 text-primary"/>
                            <div>
                                <CardTitle>Повторение</CardTitle>
                                <CardDescription>Проверьте усвоенные карточки, чтобы закрепить материал.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {quizzes.map(quiz => (
                    // FIX-GEMINI: Using history.push for v5 navigation.
                    <Card key={quiz.id} className="hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => history.push(`/app/tests/${quiz.id}`)}>
                        <CardHeader>
                            <div className="flex items-start space-x-4">
                                <FileTextIcon className="w-6 h-6 mt-1 text-primary"/>
                                <div>
                                    <CardTitle>{quiz.title}</CardTitle>
                                    <CardDescription>{quiz.description}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Tests;
