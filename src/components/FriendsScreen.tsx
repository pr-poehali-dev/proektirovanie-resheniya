import { useState } from 'react';
import { User, StorageService } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface FriendsScreenProps {
  user: User;
  onBack: () => void;
  refreshUser: () => void;
}

export default function FriendsScreen({ user, onBack, refreshUser }: FriendsScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const allUsers = StorageService.getUsers();
  const friends = allUsers.filter(u => user.friends.includes(u.id));
  const friendRequests = allUsers.filter(u => user.friendRequests.includes(u.id));
  
  const searchResults = searchQuery.trim() 
    ? allUsers.filter(u => 
        u.id !== user.id && 
        !user.friends.includes(u.id) &&
        !user.sentRequests.includes(u.id) &&
        (u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.id.includes(searchQuery))
      ).slice(0, 5)
    : [];

  const handleSendRequest = (targetUser: User) => {
    const users = StorageService.getUsers();
    const currentUser = users.find(u => u.id === user.id);
    const target = users.find(u => u.id === targetUser.id);

    if (currentUser && target) {
      currentUser.sentRequests.push(target.id);
      target.friendRequests.push(currentUser.id);
      StorageService.saveUsers(users);
      refreshUser();
      toast({ title: 'Заявка отправлена!', description: `Заявка отправлена пользователю ${target.name}` });
      setSearchQuery('');
    }
  };

  const handleAcceptRequest = (requesterId: string) => {
    const users = StorageService.getUsers();
    const currentUser = users.find(u => u.id === user.id);
    const requester = users.find(u => u.id === requesterId);

    if (currentUser && requester) {
      currentUser.friendRequests = currentUser.friendRequests.filter(id => id !== requesterId);
      currentUser.friends.push(requesterId);
      requester.sentRequests = requester.sentRequests.filter(id => id !== user.id);
      requester.friends.push(user.id);
      StorageService.saveUsers(users);
      refreshUser();
      toast({ title: 'Друг добавлен!', description: `${requester.name} добавлен в друзья` });
    }
  };

  const handleRejectRequest = (requesterId: string) => {
    const users = StorageService.getUsers();
    const currentUser = users.find(u => u.id === user.id);
    const requester = users.find(u => u.id === requesterId);

    if (currentUser && requester) {
      currentUser.friendRequests = currentUser.friendRequests.filter(id => id !== requesterId);
      requester.sentRequests = requester.sentRequests.filter(id => id !== user.id);
      StorageService.saveUsers(users);
      refreshUser();
      toast({ title: 'Заявка отклонена' });
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={onBack}>
            <Icon name="ArrowLeft" className="mr-2" size={16} />
            Назад
          </Button>
          <h1 className="text-3xl font-bold pixel-font">Друзья</h1>
        </div>

        <div className="space-y-6">
          {friendRequests.length > 0 && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Bell" size={24} />
                  Входящие заявки
                  <Badge className="ml-auto">{friendRequests.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {friendRequests.map(requester => (
                  <div key={requester.id} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${requester.isOnline ? 'bg-green-500' : 'bg-gray-500'}`} />
                      <div>
                        <p className="font-bold">{requester.name}</p>
                        <p className="text-sm text-muted-foreground">ID: {requester.id}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleAcceptRequest(requester.id)}>
                        <Icon name="Check" size={16} />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleRejectRequest(requester.id)}>
                        <Icon name="X" size={16} />
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
                <Icon name="Search" size={24} />
                Найти друга
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Введите имя или ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchResults.map(foundUser => (
                <div key={foundUser.id} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${foundUser.isOnline ? 'bg-green-500' : 'bg-gray-500'}`} />
                    <div>
                      <p className="font-bold">{foundUser.name}</p>
                      <p className="text-sm text-muted-foreground">ID: {foundUser.id}</p>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => handleSendRequest(foundUser)}>
                    <Icon name="UserPlus" className="mr-2" size={16} />
                    Добавить
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Users" size={24} />
                Список друзей ({friends.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {friends.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">У вас пока нет друзей</p>
              ) : (
                <div className="space-y-3">
                  {friends.map(friend => (
                    <div key={friend.id} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${friend.isOnline ? 'bg-green-500' : 'bg-gray-500'}`} />
                        <div>
                          <p className="font-bold">{friend.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {friend.status} • ID: {friend.id}
                          </p>
                        </div>
                      </div>
                      {friend.isOnline && (
                        <Badge className="bg-green-600">Online</Badge>
                      )}
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
