import { useState, useEffect } from 'react';
import { StorageService, User } from '@/lib/storage';
import AuthScreen from '@/components/AuthScreen';
import MainMenu from '@/components/MainMenu';
import ProfileScreen from '@/components/ProfileScreen';
import FriendsScreen from '@/components/FriendsScreen';
import WeaponsScreen from '@/components/WeaponsScreen';
import MultiplayerScreen from '@/components/MultiplayerScreen';
import ShopScreen from '@/components/ShopScreen';
import AdminScreen from '@/components/AdminScreen';
import GameScreen from '@/components/GameScreen';
import ChatScreen from '@/components/ChatScreen';

type Screen = 'auth' | 'menu' | 'profile' | 'friends' | 'weapons' | 'multiplayer' | 'shop' | 'admin' | 'game' | 'chat';

export default function Index() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('auth');
  const [user, setUser] = useState<User | null>(null);
  const [selectedMission, setSelectedMission] = useState<number | null>(null);

  useEffect(() => {
    const currentUser = StorageService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setCurrentScreen('menu');
    }
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentScreen('menu');
  };

  const handleLogout = () => {
    StorageService.logout();
    setUser(null);
    setCurrentScreen('auth');
  };

  const refreshUser = () => {
    const updatedUser = StorageService.getCurrentUser();
    if (updatedUser) {
      setUser(updatedUser);
    }
  };

  const handleStartMission = (missionId: number) => {
    setSelectedMission(missionId);
    setCurrentScreen('game');
  };

  const handleBackToMenu = () => {
    setCurrentScreen('menu');
    setSelectedMission(null);
    refreshUser();
  };

  if (!user || currentScreen === 'auth') {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {currentScreen === 'menu' && (
        <MainMenu
          user={user}
          onNavigate={setCurrentScreen}
          onLogout={handleLogout}
        />
      )}
      {currentScreen === 'profile' && (
        <ProfileScreen user={user} onBack={handleBackToMenu} />
      )}
      {currentScreen === 'friends' && (
        <FriendsScreen user={user} onBack={handleBackToMenu} refreshUser={refreshUser} />
      )}
      {currentScreen === 'weapons' && (
        <WeaponsScreen user={user} onBack={handleBackToMenu} />
      )}
      {currentScreen === 'multiplayer' && (
        <MultiplayerScreen user={user} onBack={handleBackToMenu} />
      )}
      {currentScreen === 'shop' && (
        <ShopScreen user={user} onBack={handleBackToMenu} refreshUser={refreshUser} />
      )}
      {currentScreen === 'admin' && user.isAdmin && (
        <AdminScreen onBack={handleBackToMenu} />
      )}
      {currentScreen === 'game' && (
        <GameScreen 
          user={user} 
          missionId={selectedMission} 
          onBack={handleBackToMenu}
          onStartMission={handleStartMission}
          refreshUser={refreshUser}
        />
      )}
      {currentScreen === 'chat' && (
        <ChatScreen user={user} onBack={handleBackToMenu} />
      )}
    </div>
  );
}
