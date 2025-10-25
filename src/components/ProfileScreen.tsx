import { User } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Progress } from '@/components/ui/progress';

interface ProfileScreenProps {
  user: User;
  onBack: () => void;
}

export default function ProfileScreen({ user, onBack }: ProfileScreenProps) {
  const missionProgress = (user.missionsCompleted / 6) * 100;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={onBack}>
            <Icon name="ArrowLeft" className="mr-2" size={16} />
            Назад
          </Button>
          <h1 className="text-3xl font-bold pixel-font">Профиль</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="User" size={24} />
                Информация
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Имя</p>
                <p className="text-xl font-bold">{user.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ID</p>
                <p className="text-lg font-mono">{user.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Статус</p>
                <p className="text-lg">{user.status}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-lg">{user.email}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Wallet" size={24} />
                Баланс
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm text-muted-foreground mb-1">Игровая валюта</p>
                <p className="text-3xl font-bold text-primary">{user.balance} ₽</p>
              </div>
              <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                <p className="text-sm text-muted-foreground mb-1">Донат баланс</p>
                <p className="text-3xl font-bold text-accent">{user.donateBalance} 💎</p>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Trophy" size={24} />
                Прогресс миссий
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Пройдено миссий</span>
                  <span className="text-sm font-bold">{user.missionsCompleted}/6</span>
                </div>
                <Progress value={missionProgress} className="h-3" />
              </div>
              
              {user.missionsCompleted === 6 && (
                <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20 text-center">
                  <p className="text-2xl font-bold mb-2">🎖️ Ветеран войны</p>
                  <p className="text-sm text-muted-foreground">Все миссии пройдены!</p>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-muted text-center">
                  <Icon name="Target" className="mx-auto mb-2" size={24} />
                  <p className="text-sm text-muted-foreground">Друзей</p>
                  <p className="text-xl font-bold">{user.friends.length}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted text-center">
                  <Icon name="Zap" className="mx-auto mb-2" size={24} />
                  <p className="text-sm text-muted-foreground">Статус</p>
                  <p className="text-xl font-bold">{user.isOnline ? '🟢' : '🔴'}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted text-center">
                  <Icon name="Award" className="mx-auto mb-2" size={24} />
                  <p className="text-sm text-muted-foreground">Уровень</p>
                  <p className="text-xl font-bold">{Math.floor(user.missionsCompleted * 10)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
