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
  map: 'beach' | 'city' | 'warzone';
}

const missions: Mission[] = [
  { id: 1, name: 'Первая кровь', description: 'Ваше первое задание - зачистить вражескую базу', difficulty: 'Легко', enemies: 5, reward: 500, map: 'beach' },
  { id: 2, name: 'Операция "Буря"', description: 'Штурм укрепленной позиции противника', difficulty: 'Легко', enemies: 8, reward: 800, map: 'beach' },
  { id: 3, name: 'Защита конвоя', description: 'Защитите союзный конвой от атаки', difficulty: 'Средне', enemies: 12, reward: 1200, map: 'city' },
  { id: 4, name: 'Ночной рейд', description: 'Скрытая операция в темноте', difficulty: 'Средне', enemies: 15, reward: 1500, map: 'city' },
  { id: 5, name: 'Битва за город', description: 'Масштабное сражение в руинах города', difficulty: 'Сложно', enemies: 20, reward: 2500, map: 'warzone' },
  { id: 6, name: 'Последний бой', description: 'Финальная операция - остановите врага', difficulty: 'Очень сложно', enemies: 30, reward: 5000, map: 'warzone' },
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
  const [lastClickTime, setLastClickTime] = useState(0);
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

    const mapColors = {
      beach: { bg: '#F4E4C1', ground: '#C19A6B', sky: '#87CEEB' },
      city: { bg: '#808080', ground: '#505050', sky: '#B0C4DE' },
      warzone: { bg: '#2C2416', ground: '#1A1410', sky: '#4A4A4A' },
    };
    
    const colors = currentMission ? mapColors[currentMission.map] : mapColors.beach;
    
    ctx.fillStyle = colors.sky;
    ctx.fillRect(0, 0, 800, 300);
    
    ctx.fillStyle = colors.ground;
    ctx.fillRect(0, 300, 800, 300);
    
    if (currentMission?.map === 'city') {
      ctx.fillStyle = '#696969';
      for (let i = 0; i < 5; i++) {
        const x = i * 180 + 50;
        ctx.fillRect(x, 150, 80, 150);
        ctx.fillStyle = '#FFD700';
        for (let j = 0; j < 3; j++) {
          for (let k = 0; k < 2; k++) {
            ctx.fillRect(x + 15 + k * 35, 170 + j * 40, 15, 20);
          }
        }
        ctx.fillStyle = '#696969';
      }
    } else if (currentMission?.map === 'warzone') {
      ctx.fillStyle = '#696969';
      for (let i = 0; i < 5; i++) {
        const x = i * 180 + 50;
        ctx.fillRect(x, 150, 80, 150);
      }
      ctx.fillStyle = '#FF6347';
      for (let i = 0; i < 8; i++) {
        const ex = Math.random() * 800;
        const ey = Math.random() * 200;
        ctx.beginPath();
        ctx.arc(ex, ey, 20, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#2F4F4F';
      ctx.globalAlpha = 0.6;
      ctx.fillRect(0, 0, 800, 600);
      ctx.globalAlpha = 1;
    } else if (currentMission?.map === 'beach') {
      ctx.fillStyle = '#228B22';
      for (let i = 0; i < 6; i++) {
        const x = i * 150 + 30;
        ctx.fillRect(x + 15, 250, 10, 40);
        ctx.fillStyle = '#32CD32';
        ctx.beginPath();
        ctx.arc(x + 20, 240, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#228B22';
      }
    }

    ctx.fillStyle = '#8B5CF6';
    ctx.fillRect(playerX - 15, playerY - 15, 30, 30);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(playerX - 8, playerY - 5, 6, 10);

    enemies.forEach(enemy => {
      ctx.fillStyle = '#F97316';
      ctx.fillRect(enemy.x - 15, enemy.y - 15, 30, 30);
      ctx.fillStyle = '#000000';
      ctx.fillRect(enemy.x - 8, enemy.y - 5, 6, 10);
      
      ctx.fillStyle = '#0EA5E9';
      ctx.fillRect(enemy.x - 15, enemy.y - 25, 30 * (enemy.health / enemy.maxHealth), 5);
    });

    bullets.forEach(bullet => {
      ctx.fillStyle = '#FFFF00';
      ctx.fillRect(bullet.x - 3, bullet.y - 3, 6, 6);
    });
  }, [playerX, playerY, enemies, bullets, gameState, currentMission]);

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

        <div className="flex flex-col gap-4">
          <Card className="w-full">
            <CardContent className="p-2 md:p-4">
              <canvas 
                ref={canvasRef} 
                width={800} 
                height={600} 
                className="w-full border border-border rounded cursor-crosshair"
                onClick={(e) => {
                  const canvas = canvasRef.current;
                  if (!canvas) return;
                  
                  const rect = canvas.getBoundingClientRect();
                  const scaleX = 800 / rect.width;
                  const scaleY = 600 / rect.height;
                  const clickX = (e.clientX - rect.left) * scaleX;
                  const clickY = (e.clientY - rect.top) * scaleY;
                  
                  const now = Date.now();
                  const timeSinceLastClick = now - lastClickTime;
                  
                  if (timeSinceLastClick < 300) {
                    handleBomb();
                  } else {
                    const angle = Math.atan2(clickY - playerY, clickX - playerX);
                    const newBullet: Bullet = {
                      id: now,
                      x: playerX,
                      y: playerY - 20,
                      vx: Math.cos(angle) * 12,
                      vy: Math.sin(angle) * 12,
                    };
                    setBullets(prev => [...prev, newBullet]);
                  }
                  
                  setLastClickTime(now);
                }}
              />
            </CardContent>
          </Card>

          <Card className="w-full">
            <CardHeader>
              <CardTitle className="pixel-font text-lg">Управление</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="col-span-2 md:col-span-1">
                  <p className="text-sm text-muted-foreground mb-2">Движение</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div></div>
                    <Button onClick={() => handleMove(0, -30)} className="h-12 w-full">
                      <Icon name="ArrowUp" />
                    </Button>
                    <div></div>
                    <Button onClick={() => handleMove(-30, 0)} className="h-12 w-full">
                      <Icon name="ArrowLeft" />
                    </Button>
                    <Button onClick={() => handleMove(0, 30)} className="h-12 w-full">
                      <Icon name="ArrowDown" />
                    </Button>
                    <Button onClick={() => handleMove(30, 0)} className="h-12 w-full">
                      <Icon name="ArrowRight" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground mb-2">Действия</p>
                  <Button onClick={handleShoot} className="w-full h-12" variant="secondary">
                    <Icon name="Target" className="mr-2" />
                    Выстрел
                  </Button>
                  <Button 
                    onClick={handleBomb} 
                    className="w-full h-12" 
                    variant="destructive"
                    disabled={bombCooldown > 0}
                  >
                    <Icon name="Bomb" className="mr-2" />
                    Бомба {bombCooldown > 0 && `${Math.ceil(bombCooldown / 1000)}с`}
                  </Button>
                </div>

                <div className="col-span-2 p-4 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground mb-2">💡 Подсказка</p>
                  <p className="text-xs">• Нажми на экран для выстрела</p>
                  <p className="text-xs">• Двойной клик - авиабомба (КД 5с)</p>
                  <p className="text-xs">• Управление стрелками</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}