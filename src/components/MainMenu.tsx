import { User } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

interface MainMenuProps {
  user: User;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

export default function MainMenu({ user, onNavigate, onLogout }: MainMenuProps) {
  const menuItems = [
    { id: 'profile', label: 'Профиль', icon: 'User', color: 'bg-primary' },
    { id: 'friends', label: 'Друзья', icon: 'Users', color: 'bg-accent', badge: user.friendRequests.length },
    { id: 'weapons', label: 'Оружие', icon: 'Sword', color: 'bg-secondary' },
    { id: 'multiplayer', label: 'Мультиплеер', icon: 'Gamepad2', color: 'bg-primary' },
    { id: 'shop', label: 'Магазин', icon: 'ShoppingCart', color: 'bg-accent' },
    { id: 'game', label: 'Играть', icon: 'Play', color: 'bg-secondary', highlight: true },
    { id: 'chat', label: 'Чат', icon: 'MessageSquare', color: 'bg-primary' },
  ];

  if (user.isAdmin) {
    menuItems.push({ id: 'admin', label: 'Админ', icon: 'Shield', color: 'bg-destructive', badge: 0 });
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="absolute inset-0 opacity-5 pixel-pattern"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-5xl md:text-7xl pixel-font text-primary mb-2">WZ</h1>
            <p className="text-muted-foreground">Военный шутер</p>
          </div>
          <Button variant="outline" onClick={onLogout} size="sm">
            <Icon name="LogOut" className="mr-2" size={16} />
            Выход
          </Button>
        </div>

        <Card className="p-4 mb-8 bg-card/50 backdrop-blur border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Добро пожаловать,</p>
              <p className="text-xl font-bold">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.status}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">ID: {user.id}</p>
              <div className="flex gap-4 mt-2">
                <div>
                  <p className="text-xs text-muted-foreground">Баланс</p>
                  <p className="text-lg font-bold text-primary">{user.balance} ₽</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Донат</p>
                  <p className="text-lg font-bold text-accent">{user.donateBalance} 💎</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative p-6 rounded-lg ${item.color} hover:opacity-90 transition-all hover:scale-105 ${
                item.highlight ? 'md:col-span-2 lg:col-span-2' : ''
              }`}
            >
              {item.badge !== undefined && item.badge > 0 && (
                <Badge className="absolute top-2 right-2 bg-destructive">
                  {item.badge}
                </Badge>
              )}
              <div className="flex flex-col items-center gap-3">
                <Icon name={item.icon as any} size={item.highlight ? 48 : 32} />
                <span className={`font-bold ${item.highlight ? 'text-xl pixel-font' : ''}`}>
                  {item.label}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>🎮 Миссий пройдено: {user.missionsCompleted}/6</p>
        </div>
      </div>

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
