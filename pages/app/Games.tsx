
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Utensils, Zap } from 'lucide-react';

const Games: React.FC = () => {
    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold mb-6">Игры</h1>
            <p className="text-muted-foreground mb-8">Укрепите знания в интерактивном формате.</p>
            <div className="space-y-6">
                <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Utensils />
                            <span>Собери Блюдо</span>
                        </CardTitle>
                        <CardDescription className="text-indigo-200">Перетащите правильные ингредиенты на тарелку.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg font-semibold">Скоро!</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
                     <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Zap />
                            <span>Цепочка Продаж</span>
                        </CardTitle>
                        <CardDescription className="text-orange-100">Предложите гостю идеальное дополнение к его заказу.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg font-semibold">Скоро!</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Games;
