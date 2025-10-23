

import React, { useState, useEffect } from 'react';
// FIX: Switched to namespace import for react-router-dom to resolve module resolution errors.
import * as ReactRouterDOM from 'react-router-dom';
import { supabase } from '../../services/supabase';
import type { Question, Answer, Quiz as QuizType } from '../../types';
import { Progress } from '../../components/ui/Progress';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';

const Quiz: React.FC = () => {
    const { quizId } = ReactRouterDOM.useParams<{quizId: string}>();
    const navigate = ReactRouterDOM.useNavigate();
    const [quiz, setQuiz] = useState<QuizType | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    
    useEffect(() => {
        const fetchQuizData = async () => {
            if (!quizId) return;
            console.log(`Quiz: Fetching data for quizId: ${quizId}`);
            const quizIdNum = parseInt(quizId);
            
            const { data: quizData, error: quizError } = await supabase
                .from('quizzes')
                .select()
                .eq('id', quizIdNum)
                .single();

            if (quizError || !quizData) {
                console.error("Quiz: Quiz not found:", quizError);
                navigate('/app/tests');
                return;
            }
            console.log("Quiz: Fetched quiz details:", quizData);
            setQuiz(quizData as QuizType);

            const { data: questionsData, error: questionsError } = await supabase
                .from('questions')
                .select()
                .eq('quiz_id', quizIdNum);
            
            if (questionsError || !questionsData || questionsData.length === 0) {
                console.error("Quiz: No questions found for this quiz:", questionsError);
                setQuestions([]);
                return;
            }
            console.log("Quiz: Fetched questions:", questionsData);
            setQuestions(questionsData as Question[]);
            
            const questionIds = questionsData.map(q => q.id);
            const { data: answersData, error: answersError } = await supabase
                .from('answers')
                .select()
                .in('question_id', questionIds);

            if (answersError) {
                console.error("Quiz: Error fetching answers:", answersError);
            } else if (answersData) {
                console.log("Quiz: Fetched answers:", answersData);
                setAnswers(answersData as Answer[]);
            }
        };
        fetchQuizData();
    }, [quizId, navigate]);

    const handleAnswerSelect = (answerId: number) => {
        setSelectedAnswer(answerId);
        const answer = answers.find(a => a.id === answerId);
        if (answer?.is_correct) {
            setScore(score + 1);
        }
        
        setTimeout(() => {
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
                setSelectedAnswer(null);
            } else {
                setShowResult(true);
            }
        }, 1000);
    };

    if (showResult) {
        return (
            <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
                <h1 className="text-4xl font-bold mb-4">Тест завершен!</h1>
                <p className="text-xl text-muted-foreground mb-8">Ваш результат: {score} из {questions.length}</p>
                <Button onClick={() => navigate('/app/tests')}>Вернуться к тестам</Button>
            </div>
        );
    }
    
    if (!quiz || questions.length === 0) {
        return <div className="flex items-center justify-center h-screen">Загрузка викторины...</div>;
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswers = answers.filter(a => a.question_id === currentQuestion.id);
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    
    return (
        <div className="p-4 min-h-screen flex flex-col">
            <div className="mb-4 pt-4">
                <p className="text-muted-foreground mb-2">{quiz.title}</p>
                <Progress value={progress} />
            </div>
            
            <div className="flex-grow flex flex-col justify-center">
                <Card>
                    <CardContent className="p-6">
                        <h2 className="text-2xl font-semibold mb-6 text-center">{currentQuestion.question_text}</h2>
                        <div className="space-y-4">
                            {currentAnswers.map(answer => {
                                const isSelected = selectedAnswer === answer.id;
                                const isCorrect = answer.is_correct;
                                let buttonClass = "justify-start text-left";
                                if (isSelected) {
                                    buttonClass += isCorrect ? ' bg-green-500 hover:bg-green-600' : ' bg-red-500 hover:bg-red-600';
                                }

                                return (
                                    <Button
                                        key={answer.id}
                                        variant="outline"
                                        className={`w-full h-auto py-3 whitespace-normal ${buttonClass}`}
                                        onClick={() => handleAnswerSelect(answer.id)}
                                        disabled={selectedAnswer !== null}
                                    >
                                        {answer.answer_text}
                                    </Button>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Quiz;
