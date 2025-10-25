import { User, StorageService, ShopItem } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ShopScreenProps {
  user: User;
  onBack: () => void;
  refreshUser: () => void;
}

const shopItems: ShopItem[] = [
  { id: 'w1', name: 'Пистолет Desert Eagle', type: 'weapon', price: 2500, damage: 45, description: 'Мощный пистолет с высоким уроном' },
  { id: 'w2', name: 'Штурмовая винтовка M4A1', type: 'weapon', price: 5000, damage: 40, description: 'Точная винтовка для средних дистанций' },
  { id: 'w3', name: 'Снайперская винтовка AWP', type: 'weapon', price: 8000, donatePrice: 150, damage: 100, description: 'Убийство с одного выстрела' },
  { id: 't1', name: 'Легкий танк T-34', type: 'tank', price: 15000, description: 'Быстрый и маневренный танк' },
  { id: 't2', name: 'Тяжелый танк KV-2', type: 'tank', price: 25000, donatePrice: 500, description: 'Мощная броня и орудие' },
  { id: 'v1', name: 'Джип Willys', type: 'vehicle', price: 5000, description: 'Быстрая разведывательная машина' },
  { id: 'v2', name: 'БТР-80', type: 'vehicle', price: 12000, description: 'Бронетранспортер для отряда' },
];

export default function ShopScreen({ user, onBack, refreshUser }: ShopScreenProps) {
  const { toast } = useToast();

  const handlePurchase = (item: ShopItem, useDonate: boolean = false) => {
    const users = StorageService.getUsers();
    const currentUser = users.find(u => u.id === user.id);
    
    if (!currentUser) return;

    if (useDonate && item.donatePrice) {
      if (currentUser.donateBalance >= item.donatePrice) {
        currentUser.donateBalance -= item.donatePrice;
        StorageService.updateUser(currentUser);
        refreshUser();
        toast({ 
          title: 'Покупка успешна!', 
          description: `${item.name} приобретен за ${item.donatePrice} 💎` 
        });
      } else {
        toast({ 
          title: 'Недостаточно средств', 
          description: 'Не хватает донат баланса', 
          variant: 'destructive' 
        });
      }
    } else {
      if (currentUser.balance >= item.price) {
        currentUser.balance -= item.price;
        StorageService.updateUser(currentUser);
        refreshUser();
        toast({ 
          title: 'Покупка успешна!', 
          description: `${item.name} приобретен за ${item.price} ₽` 
        });
      } else {
        toast({ 
          title: 'Недостаточно средств', 
          description: 'Не хватает игровой валюты', 
          variant: 'destructive' 
        });
      }
    }
  };

  const renderItems = (type: ShopItem['type']) => {
    const items = shopItems.filter(item => item.type === type);
    
    return items.length === 0 ? (
      <p className="text-center text-muted-foreground py-8">Товары скоро появятся</p>
    ) : (
      <div className="grid md:grid-cols-2 gap-4">
        {items.map(item => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {type === 'weapon' && <Icon name="Sword" size={24} />}
                {type === 'tank' && '🚜'}
                {type === 'vehicle' && '🚙'}
                <span className="text-lg">{item.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{item.description}</p>
              
              {item.damage && (
                <div className="flex items-center justify-between p-2 rounded bg-muted">
                  <span className="text-sm">Урон</span>
                  <span className="font-bold text-destructive">{item.damage}</span>
                </div>
              )}

              <div className="space-y-2">
                <Button 
                  className="w-full" 
                  onClick={() => handlePurchase(item)}
                  disabled={user.balance < item.price}
                >
                  <Icon name="ShoppingCart" className="mr-2" size={16} />
                  Купить за {item.price} ₽
                </Button>
                
                {item.donatePrice && (
                  <Button 
                    className="w-full" 
                    variant="secondary"
                    onClick={() => handlePurchase(item, true)}
                    disabled={user.donateBalance < item.donatePrice}
                  >
                    <Icon name="Sparkles" className="mr-2" size={16} />
                    Купить за {item.donatePrice} 💎
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={onBack}>
            <Icon name="ArrowLeft" className="mr-2" size={16} />
            Назад
          </Button>
          <h1 className="text-3xl font-bold pixel-font">Магазин</h1>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex justify-around">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Баланс</p>
                <p className="text-2xl font-bold text-primary">{user.balance} ₽</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Донат баланс</p>
                <p className="text-2xl font-bold text-accent">{user.donateBalance} 💎</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="weapon">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="weapon">
              <Icon name="Sword" className="mr-2" size={16} />
              Оружие
            </TabsTrigger>
            <TabsTrigger value="tank">
              🚜 Танки
            </TabsTrigger>
            <TabsTrigger value="vehicle">
              🚙 Машины
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="weapon">{renderItems('weapon')}</TabsContent>
          <TabsContent value="tank">{renderItems('tank')}</TabsContent>
          <TabsContent value="vehicle">{renderItems('vehicle')}</TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
