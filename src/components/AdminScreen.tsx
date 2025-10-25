import { useState } from 'react';
import { StorageService, CustomBlock } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AdminScreenProps {
  onBack: () => void;
}

export default function AdminScreen({ onBack }: AdminScreenProps) {
  const [targetUser, setTargetUser] = useState('');
  const [amount, setAmount] = useState('');
  const [blockType, setBlockType] = useState<'link' | 'html' | 'image'>('link');
  const [blockTitle, setBlockTitle] = useState('');
  const [blockContent, setBlockContent] = useState('');
  const [blockThumbnail, setBlockThumbnail] = useState('');
  const [customBlocks, setCustomBlocks] = useState<CustomBlock[]>(StorageService.getCustomBlocks());
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

  const handleAddBlock = () => {
    if (!blockTitle || !blockContent) {
      toast({ title: 'Ошибка', description: 'Заполните все поля', variant: 'destructive' });
      return;
    }

    const newBlock: CustomBlock = {
      id: Date.now().toString(),
      type: blockType,
      title: blockTitle,
      content: blockContent,
      thumbnail: blockThumbnail || undefined,
      createdAt: Date.now(),
    };

    StorageService.addCustomBlock(newBlock);
    setCustomBlocks(StorageService.getCustomBlocks());
    toast({ title: 'Блок добавлен!', description: 'Новый блок успешно создан' });

    setBlockTitle('');
    setBlockContent('');
    setBlockThumbnail('');
  };

  const handleDeleteBlock = (blockId: string) => {
    StorageService.deleteCustomBlock(blockId);
    setCustomBlocks(StorageService.getCustomBlocks());
    toast({ title: 'Блок удален' });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setBlockContent(reader.result as string);
      toast({ title: 'Изображение загружено!', description: 'Можно сохранить блок' });
    };
    reader.readAsDataURL(file);
  };

  const allUsers = StorageService.getUsers();

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={onBack}>
            <Icon name="ArrowLeft" className="mr-2" size={16} />
            Назад
          </Button>
          <h1 className="text-3xl font-bold pixel-font text-destructive">Админ панель</h1>
        </div>

        <Tabs defaultValue="balance">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="balance">
              <Icon name="DollarSign" className="mr-2" size={16} />
              Баланс
            </TabsTrigger>
            <TabsTrigger value="editor">
              <Icon name="Edit" className="mr-2" size={16} />
              Редактор
            </TabsTrigger>
            <TabsTrigger value="users">
              <Icon name="Users" className="mr-2" size={16} />
              Пользователи
            </TabsTrigger>
          </TabsList>

          <TabsContent value="balance">
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
          </TabsContent>

          <TabsContent value="editor">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Plus" size={24} />
                    Создать блок
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Тип блока</Label>
                    <Select value={blockType} onValueChange={(v: any) => setBlockType(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="link">Ссылка</SelectItem>
                        <SelectItem value="html">HTML скрипт</SelectItem>
                        <SelectItem value="image">Изображение</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="blockTitle">Название</Label>
                    <Input
                      id="blockTitle"
                      placeholder="Название блока"
                      value={blockTitle}
                      onChange={(e) => setBlockTitle(e.target.value)}
                    />
                  </div>

                  {blockType === 'link' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="blockContent">URL ссылки</Label>
                        <Input
                          id="blockContent"
                          placeholder="https://example.com"
                          value={blockContent}
                          onChange={(e) => setBlockContent(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="blockThumbnail">URL миниатюры (опционально)</Label>
                        <Input
                          id="blockThumbnail"
                          placeholder="https://example.com/image.jpg"
                          value={blockThumbnail}
                          onChange={(e) => setBlockThumbnail(e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  {blockType === 'html' && (
                    <div className="space-y-2">
                      <Label htmlFor="blockContent">HTML код</Label>
                      <Textarea
                        id="blockContent"
                        placeholder="<div>Ваш HTML код</div>"
                        value={blockContent}
                        onChange={(e) => setBlockContent(e.target.value)}
                        rows={6}
                      />
                    </div>
                  )}

                  {blockType === 'image' && (
                    <div className="space-y-2">
                      <Label htmlFor="imageUpload">Загрузить изображение</Label>
                      <Input
                        id="imageUpload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                      {blockContent && (
                        <div className="mt-4">
                          <img src={blockContent} alt="Preview" className="max-w-full h-auto rounded border" />
                        </div>
                      )}
                    </div>
                  )}

                  <Button onClick={handleAddBlock} className="w-full">
                    <Icon name="Plus" className="mr-2" size={16} />
                    Добавить блок
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Layout" size={24} />
                    Созданные блоки ({customBlocks.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {customBlocks.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Нет блоков</p>
                  ) : (
                    <div className="space-y-4">
                      {customBlocks.map(block => (
                        <div key={block.id} className="p-4 rounded-lg bg-muted">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold">{block.title}</span>
                                <span className="text-xs px-2 py-1 rounded bg-primary/20">{block.type}</span>
                              </div>
                              {block.type === 'link' && (
                                <a href={block.content} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                                  {block.content}
                                </a>
                              )}
                              {block.type === 'html' && (
                                <pre className="text-xs bg-background p-2 rounded mt-2 overflow-x-auto max-w-full">
                                  {block.content.substring(0, 100)}...
                                </pre>
                              )}
                              {block.type === 'image' && (
                                <img src={block.content} alt={block.title} className="mt-2 max-w-xs rounded" />
                              )}
                            </div>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteBlock(block.id)}>
                              <Icon name="Trash2" size={16} />
                            </Button>
                          </div>
                          {block.thumbnail && (
                            <img src={block.thumbnail} alt="thumbnail" className="mt-2 max-w-xs rounded" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Users" size={24} />
                  Все пользователи ({allUsers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
