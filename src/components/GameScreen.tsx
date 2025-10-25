import { useState, useEffect, useRef } from 'react';
import { User, StorageService } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface GameScreenProps {
  user: User;
  missionId: number | null;
  onBack: () => void;
  onStartMission: (missionId: number) => void;
  refreshUser: () => void;
}

interface Mission {
  id: number;
  name: string;
  description: string;
  difficulty: string;
  enemies: number;
  reward: number;
}

const missions: Mission[] = [
  { id: 1, name: 'Первая кровь', description: 'Ваше первое задание - зачистить вражескую базу', difficulty: 'Легко', enemies: 5, reward: 500 },
  { id: 2, name: 'Операция "Буря"', description: 'Штурм укрепленной позиции противника', difficulty: 'Легко', enemies: 8, reward: 800 },
  { id: 3, name: 'Защита конвоя', description: 'Защитите союзный конвой от атаки', difficulty: 'Средне', enemies: 12, reward: 1200 },
  { id: 4, name: 'Ночной рейд', description: 'Скрытая операция в темноте', difficulty: 'Средне', enemies: 15, reward: 1500 },
  { id: 5, name: 'Битва за город', description: 'Масштабное сражение в руинах города', difficulty: 'Сложно', enemies: 20, reward: 2500 },
  { id: 6, name: 'Последний бой', description: 'Финальная операция - остановите врага', difficulty: 'Очень сложно', enemies: 30, reward: 5000 },
];

interface Enemy {
  id: number;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
}

interface Bullet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export default function GameScreen({ user, missionId, onBack, onStartMission, refreshUser }: GameScreenProps) {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'victory' | 'defeat'>('menu');
  const [playerX, setPlayerX] = useState(400);
  const [playerY, setPlayerY] = useState(500);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [bombCooldown, setBombCooldown] = useState(0);
  const [score, setScore] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const currentMission = missionId ? missions.find(m => m.id === missionId) : null;

  useEffect(() => {
    if (gameState === 'playing' && currentMission) {
      const enemyList: Enemy[] = [];
      for (let i = 0; i < currentMission.enemies; i++) {
        enemyList.push({
          id: i,
          x: Math.random() * 700 + 50,
          y: Math.random() * 200 + 50,
          health: 50,
          maxHealth: 50,
        });
      }
      setEnemies(enemyList);
      setPlayerHealth(100);
      setScore(0);
    }
  }, [gameState, currentMission]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = setInterval(() => {
      setBullets(prev => prev.map(b => ({ ...b, x: b.x + b.vx, y: b.y + b.vy })).filter(b => b.y > 0 && b.y < 600));
      
      if (bombCooldown > 0) {
        setBombCooldown(prev => prev - 100);
      }

      setEnemies(prev => {
        const updated = prev.map(enemy => {
          const hitBullets = bullets.filter(b => 
            Math.abs(b.x - enemy.x) < 20 && Math.abs(b.y - enemy.y) < 20
          );
          
          if (hitBullets.length > 0) {
            setBullets(prev => prev.filter(b => !hitBullets.includes(b)));
            return { ...enemy, health: enemy.health - 25 };
          }
          return enemy;
        }).filter(e => e.health > 0);

        if (updated.length === 0 && gameState === 'playing') {
          setGameState('victory');
        }

        return updated;
      });

      if (Math.random() < 0.02 && enemies.length > 0) {
        const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];
        if (randomEnemy) {
          setPlayerHealth(prev => {
            const newHealth = prev - 5;
            if (newHealth <= 0) {
              setGameState('defeat');
              return 0;
            }
            return newHealth;
          });
        }
      }
    }, 100);

    return () => clearInterval(gameLoop);
  }, [gameState, bullets, enemies, bombCooldown]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || gameState !== 'playing') return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#1A1F2C';
    ctx.fillRect(0, 0, 800, 600);

    ctx.fillStyle = '#8B5CF6';
    ctx.fillRect(playerX - 15, playerY - 15, 30, 30);

    enemies.forEach(enemy => {
      ctx.fillStyle = '#F97316';
      ctx.fillRect(enemy.x - 15, enemy.y - 15, 30, 30);
      
      ctx.fillStyle = '#0EA5E9';
      ctx.fillRect(enemy.x - 15, enemy.y - 25, 30 * (enemy.health / enemy.maxHealth), 5);
    });

    bullets.forEach(bullet => {
      ctx.fillStyle = '#FFFF00';
      ctx.fillRect(bullet.x - 3, bullet.y - 3, 6, 6);
    });
  }, [playerX, playerY, enemies, bullets, gameState]);

  useEffect(() => {
    if (gameState === 'victory' && currentMission) {
      const users = StorageService.getUsers();
      const currentUser = users.find(u => u.id === user.id);
      
      if (currentUser) {
        currentUser.balance += currentMission.reward;
        
        if (currentMission.id > currentUser.missionsCompleted) {
          currentUser.missionsCompleted = currentMission.id;
          
          if (currentMission.id === 6) {
            currentUser.status = 'Ветеран войны 🎖️';
          }
        }
        
        StorageService.updateUser(currentUser);
        refreshUser();
      }
    }
  }, [gameState]);

  const handleMove = (dx: number, dy: number) => {
    setPlayerX(prev => Math.max(20, Math.min(780, prev + dx)));
    setPlayerY(prev => Math.max(300, Math.min(580, prev + dy)));
  };

  const handleShoot = () => {
    const newBullet: Bullet = {
      id: Date.now(),
      x: playerX,
      y: playerY - 20,
      vx: 0,
      vy: -10,
    };
    setBullets(prev => [...prev, newBullet]);
  };

  const handleBomb = () => {
    if (bombCooldown > 0) {
      toast({ title: 'Кулдаун!', description: `Авиабомба будет готова через ${Math.ceil(bombCooldown / 1000)}с`, variant: 'destructive' });
      return;
    }

    setEnemies(prev => prev.map(e => ({ ...e, health: Math.max(0, e.health - 50) })).filter(e => e.health > 0));
    setBombCooldown(5000);
    toast({ title: '💥 АВИАБОМБА!', description: 'Массовое поражение!' });
  };

  if (!currentMission && gameState === 'menu') {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" onClick={onBack}>
              <Icon name="ArrowLeft" className="mr-2" size={16} />
              Назад
            </Button>
            <h1 className="text-3xl font-bold pixel-font">Миссии</h1>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {missions.map(mission => {
              const isLocked = mission.id > user.missionsCompleted + 1;
              const isCompleted = mission.id <= user.missionsCompleted;

              return (
                <Card key={mission.id} className={isLocked ? 'opacity-50' : ''}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Миссия {mission.id}</span>
                      {isCompleted && <Icon name="CheckCircle" className="text-green-500" size={24} />}
                      {isLocked && <Icon name="Lock" className="text-muted-foreground" size={24} />}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-bold text-lg mb-2">{mission.name}</h3>
                      <p className="text-sm text-muted-foreground">{mission.description}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Сложность</span>
                        <span className="font-bold">{mission.difficulty}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Врагов</span>
                        <span className="font-bold text-destructive">{mission.enemies}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Награда</span>
                        <span className="font-bold text-primary">{mission.reward} ₽</span>
                      </div>
                    </div>

                    <Button 
                      className="w-full" 
                      onClick={() => onStartMission(mission.id)}
                      disabled={isLocked}
                    >
                      {isCompleted ? 'Переиграть' : 'Начать миссию'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'menu' && currentMission) {
    setGameState('playing');
  }

  if (gameState === 'victory' && currentMission) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-primary">
          <CardHeader>
            <CardTitle className="text-center text-2xl pixel-font text-primary">
              🏆 ПОБЕДА!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div>
              <p className="text-xl font-bold mb-2">{currentMission.name}</p>
              <p className="text-muted-foreground">Миссия завершена успешно!</p>
            </div>
            
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm text-muted-foreground mb-1">Награда</p>
              <p className="text-3xl font-bold text-primary">+{currentMission.reward} ₽</p>
            </div>

            {currentMission.id === 6 && (
              <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20">
                <p className="text-2xl font-bold mb-2">🎖️ Ветеран войны</p>
                <p className="text-sm text-muted-foreground">Все миссии пройдены!</p>
              </div>
            )}

            <Button className="w-full" onClick={onBack}>
              Вернуться в меню
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameState === 'defeat') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-destructive">
          <CardHeader>
            <CardTitle className="text-center text-2xl pixel-font text-destructive">
              💀 ПОРАЖЕНИЕ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <p className="text-muted-foreground">Вы были уничтожены врагом</p>
            
            <div className="space-y-2">
              <Button className="w-full" onClick={() => setGameState('playing')}>
                Попробовать снова
              </Button>
              <Button className="w-full" variant="outline" onClick={onBack}>
                Вернуться в меню
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" onClick={onBack} size="sm">
            <Icon name="ArrowLeft" className="mr-2" size={16} />
            Выход
          </Button>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Здоровье</p>
            <Progress value={playerHealth} className="h-3" />
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Врагов</p>
            <p className="text-xl font-bold">{enemies.length}</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <Card className="flex-1">
            <CardContent className="p-4">
              <canvas 
                ref={canvasRef} 
                width={800} 
                height={600} 
                className="w-full border border-border rounded"
              />
            </CardContent>
          </Card>

          <Card className="lg:w-64">
            <CardHeader>
              <CardTitle className="pixel-font text-lg">Управление</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Движение</p>
                <div className="grid grid-cols-3 gap-2">
                  <div></div>
                  <Button onClick={() => handleMove(0, -30)} className="h-12">
                    <Icon name="ArrowUp" />
                  </Button>
                  <div></div>
                  <Button onClick={() => handleMove(-30, 0)} className="h-12">
                    <Icon name="ArrowLeft" />
                  </Button>
                  <Button onClick={() => handleMove(0, 30)} className="h-12">
                    <Icon name="ArrowDown" />
                  </Button>
                  <Button onClick={() => handleMove(30, 0)} className="h-12">
                    <Icon name="ArrowRight" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Button onClick={handleShoot} className="w-full" variant="secondary">
                  <Icon name="Target" className="mr-2" />
                  Выстрел
                </Button>
                <Button 
                  onClick={handleBomb} 
                  className="w-full" 
                  variant="destructive"
                  disabled={bombCooldown > 0}
                >
                  <Icon name="Bomb" className="mr-2" />
                  Авиабомба {bombCooldown > 0 && `(${Math.ceil(bombCooldown / 1000)}с)`}
                </Button>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-2">💡 Подсказка</p>
                <p className="text-xs">• 1 клик - выстрел</p>
                <p className="text-xs">• 2 клика - авиабомба</p>
                <p className="text-xs">• Уничтожайте врагов!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
