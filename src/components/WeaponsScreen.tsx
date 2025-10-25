import { User } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface WeaponsScreenProps {
  user: User;
  onBack: () => void;
}

const weapons = [
  { id: 1, name: 'Пистолет M9', damage: 15, icon: '🔫', unlocked: true },
  { id: 2, name: 'Автомат AK-47', damage: 35, icon: '🔫', unlocked: true },
  { id: 3, name: 'Снайперская винтовка', damage: 80, icon: '🎯', unlocked: true },
  { id: 4, name: 'Дробовик', damage: 50, icon: '💥', unlocked: true },
  { id: 5, name: 'Гранатомет', damage: 120, icon: '💣', unlocked: true },
  { id: 6, name: 'Огнемет', damage: 60, icon: '🔥', unlocked: true },
];

export default function WeaponsScreen({ user, onBack }: WeaponsScreenProps) {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={onBack}>
            <Icon name="ArrowLeft" className="mr-2" size={16} />
            Назад
          </Button>
          <h1 className="text-3xl font-bold pixel-font">Оружие</h1>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {weapons.map((weapon) => (
            <Card key={weapon.id} className={!weapon.unlocked ? 'opacity-50' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-4xl">{weapon.icon}</span>
                  {weapon.unlocked ? (
                    <Icon name="CheckCircle" className="text-green-500" size={24} />
                  ) : (
                    <Icon name="Lock" className="text-muted-foreground" size={24} />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="font-bold text-lg mb-2">{weapon.name}</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Урон</span>
                    <span className="font-bold text-destructive">{weapon.damage}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Статус</span>
                    <span className={`text-sm font-medium ${weapon.unlocked ? 'text-green-500' : 'text-muted-foreground'}`}>
                      {weapon.unlocked ? 'Разблокировано' : 'Заблокировано'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
