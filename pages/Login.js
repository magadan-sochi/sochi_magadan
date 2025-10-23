import React, { useState } from 'react';
// FIX: Use a direct named import for the useNavigate hook.
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase.js';
import Button from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card.js';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('123@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    console.log('Attempting to log in with:', { email });

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    
    console.log('Supabase sign in response:', { data, error: signInError });

    if (signInError) {
      console.error('Login error:', signInError.message);
      if (signInError.message === 'Email not confirmed') {
        setError('Пожалуйста, подтвердите ваш email. Проверьте почту для завершения регистрации.');
      } else {
        setError('Неверный email или пароль. Попробуйте снова.');
      }
    } else {
      console.log('Login successful, navigating to dashboard.');
      navigate('/app/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Вход</CardTitle>
          <CardDescription>Введите свои данные для входа в аккаунт.</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email">Email</label>
              <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label htmlFor="password">Пароль</label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Вход...' : 'Войти'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;