import { useState } from 'react';
import { StorageService } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

interface AdminScreenProps {
  onBack: () => void;
}

export default function AdminScreen({ onBack }: AdminScreenProps) {
  const [targetUser, setTargetUser] = useState('');
  const [amount, setAmount] = useState('');
  const { toast } = useToast();

  const handleGiveBalance = (isDonate: boolean = false) => {
    const users = StorageService.getUsers();
    const target = users.find(u => u.id === targetUser || u.name === targetUser);
    
    if (!target) {
      toast({ 
        title: 'Ошибка', 
        description: 'Пользователь не найден', 
        variant: 'destructive' 
      });
      return;
    }

    const amountNum = parseInt(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({ 
        title: 'Ошибка', 
        description: 'Введите корректную сумму', 
        variant: 'destructive' 
      });
      return;
    }

    if (isDonate) {
      target.donateBalance += amountNum;
    } else {
      target.balance += amountNum;
    }

    StorageService.updateUser(target);
    toast({ 
      title: 'Успешно!', 
      description: `Выдано ${amountNum} ${isDonate ? '💎' : '₽'} пользователю ${target.name}` 
    });
    
    setTargetUser('');
    setAmount('');
  };

  const allUsers = StorageService.getUsers();

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={onBack}>
            <Icon name="ArrowLeft" className="mr-2" size={16} />
            Назад
          </Button>
          <h1 className="text-3xl font-bold pixel-font text-destructive">Админ панель</h1>
        </div>

        <div className="space-y-6">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Shield" size={24} />
                Выдача баланса
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="targetUser">Ник или ID пользователя</Label>
                <Input
                  id="targetUser"
                  placeholder="Введите ник или ID"
                  value={targetUser}
                  onChange={(e) => setTargetUser(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Сумма</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Введите сумму"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  className="flex-1"
                  onClick={() => handleGiveBalance(false)}
                >
                  <Icon name="DollarSign" className="mr-2" size={16} />
                  Выдать игровую валюту
                </Button>
                <Button 
                  className="flex-1"
                  variant="secondary"
                  onClick={() => handleGiveBalance(true)}
                >
                  <Icon name="Sparkles" className="mr-2" size={16} />
                  Выдать донат валюту
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Users" size={24} />
                Все пользователи ({allUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {allUsers.map(user => (
                  <div key={user.id} className="p-3 rounded-lg bg-muted flex items-center justify-between">
                    <div>
                      <p className="font-bold flex items-center gap-2">
                        {user.name}
                        {user.isAdmin && <Icon name="Shield" className="text-destructive" size={16} />}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ID: {user.id} • {user.status}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-primary font-bold">{user.balance} ₽</p>
                      <p className="text-accent font-bold">{user.donateBalance} 💎</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
