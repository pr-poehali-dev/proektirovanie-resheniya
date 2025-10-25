import { useState } from 'react';
import { StorageService, User } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

export default function AuthScreen({ onLogin }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      const user = StorageService.login(email, password);
      if (user) {
        onLogin(user);
        toast({ title: 'Добро пожаловать!', description: `С возвращением, ${user.name}` });
      } else {
        toast({ title: 'Ошибка', description: 'Неверный email или пароль', variant: 'destructive' });
      }
    } else {
      if (!name || !email || !password) {
        toast({ title: 'Ошибка', description: 'Заполните все поля', variant: 'destructive' });
        return;
      }
      const user = StorageService.register(email, password, name);
      if (user) {
        onLogin(user);
        toast({ title: 'Регистрация успешна!', description: `Добро пожаловать, ${user.name}` });
      } else {
        toast({ title: 'Ошибка', description: 'Пользователь с таким email уже существует', variant: 'destructive' });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="absolute inset-0 opacity-10 pixel-pattern"></div>
      
      <Card className="w-full max-w-md relative z-10 border-primary/20">
        <CardHeader className="text-center">
          <div className="text-6xl pixel-font mb-4 text-primary">WZ</div>
          <CardTitle className="pixel-font text-2xl">WARZONE</CardTitle>
          <CardDescription>Военный пиксельный шутер</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Имя</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Ваше имя"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-muted"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="text"
                placeholder={isLogin ? "Email или логин" : "Email"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-muted"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-muted"
              />
            </div>

            <Button type="submit" className="w-full">
              {isLogin ? 'Войти' : 'Зарегистрироваться'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <style>{`
        .pixel-pattern {
          background-image: 
            linear-gradient(45deg, currentColor 25%, transparent 25%),
            linear-gradient(-45deg, currentColor 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, currentColor 75%),
            linear-gradient(-45deg, transparent 75%, currentColor 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        }
      `}</style>
    </div>
  );
}
