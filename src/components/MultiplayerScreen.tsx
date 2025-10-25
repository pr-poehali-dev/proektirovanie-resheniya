import { useState } from 'react';
import { User, StorageService, GameLobby } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface MultiplayerScreenProps {
  user: User;
  onBack: () => void;
}

export default function MultiplayerScreen({ user, onBack }: MultiplayerScreenProps) {
  const [lobbies, setLobbies] = useState<GameLobby[]>(StorageService.getLobbies());
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const createLobby = () => {
    const newLobby: GameLobby = {
      id: Date.now().toString(),
      hostId: user.id,
      hostName: user.name,
      players: [user.id],
      maxPlayers: 4,
      isActive: true,
    };
    
    const updatedLobbies = [...lobbies, newLobby];
    setLobbies(updatedLobbies);
    StorageService.saveLobbies(updatedLobbies);
    toast({ title: 'Лобби создано!', description: 'Ожидайте присоединения игроков' });
  };

  const joinLobby = (lobby: GameLobby) => {
    if (lobby.players.includes(user.id)) {
      toast({ title: 'Ошибка', description: 'Вы уже в этом лобби', variant: 'destructive' });
      return;
    }
    
    if (lobby.players.length >= lobby.maxPlayers) {
      toast({ title: 'Ошибка', description: 'Лобби заполнено', variant: 'destructive' });
      return;
    }

    lobby.players.push(user.id);
    const updatedLobbies = lobbies.map(l => l.id === lobby.id ? lobby : l);
    setLobbies(updatedLobbies);
    StorageService.saveLobbies(updatedLobbies);
    toast({ title: 'Успешно!', description: `Вы присоединились к лобби ${lobby.hostName}` });
  };

  const leaveLobby = (lobbyId: string) => {
    const lobby = lobbies.find(l => l.id === lobbyId);
    if (!lobby) return;

    lobby.players = lobby.players.filter(id => id !== user.id);
    
    let updatedLobbies;
    if (lobby.players.length === 0) {
      updatedLobbies = lobbies.filter(l => l.id !== lobbyId);
    } else {
      updatedLobbies = lobbies.map(l => l.id === lobbyId ? lobby : l);
    }
    
    setLobbies(updatedLobbies);
    StorageService.saveLobbies(updatedLobbies);
    toast({ title: 'Вы покинули лобби' });
  };

  const activeLobbies = lobbies.filter(l => l.isActive);
  const myLobbies = activeLobbies.filter(l => l.players.includes(user.id));

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={onBack}>
            <Icon name="ArrowLeft" className="mr-2" size={16} />
            Назад
          </Button>
          <h1 className="text-3xl font-bold pixel-font">Мультиплеер</h1>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Plus" size={24} />
                Быстрая игра
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" size="lg" onClick={createLobby}>
                <Icon name="Gamepad2" className="mr-2" size={20} />
                Создать лобби
              </Button>
              
              <div className="relative">
                <Input
                  placeholder="Найти игрока по нику или ID"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {myLobbies.length > 0 && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Users" size={24} />
                  Мои лобби
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {myLobbies.map(lobby => (
                  <div key={lobby.id} className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-bold">{lobby.hostName}</p>
                        <p className="text-sm text-muted-foreground">Хост: {lobby.hostName}</p>
                      </div>
                      <Badge>{lobby.players.length}/{lobby.maxPlayers}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" disabled>
                        <Icon name="Play" className="mr-2" size={16} />
                        Начать игру
                      </Button>
                      <Button variant="destructive" onClick={() => leaveLobby(lobby.id)}>
                        <Icon name="LogOut" size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Globe" size={24} />
                Доступные лобби
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeLobbies.filter(l => !myLobbies.includes(l)).length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Нет доступных лобби</p>
              ) : (
                <div className="space-y-3">
                  {activeLobbies.filter(l => !myLobbies.includes(l)).map(lobby => (
                    <div key={lobby.id} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                      <div>
                        <p className="font-bold">{lobby.hostName}</p>
                        <p className="text-sm text-muted-foreground">
                          Игроков: {lobby.players.length}/{lobby.maxPlayers}
                        </p>
                      </div>
                      <Button size="sm" onClick={() => joinLobby(lobby)}>
                        <Icon name="UserPlus" className="mr-2" size={16} />
                        Присоединиться
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
