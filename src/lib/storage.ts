export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  balance: number;
  donateBalance: number;
  status: string;
  isAdmin: boolean;
  missionsCompleted: number;
  isOnline: boolean;
  friends: string[];
  friendRequests: string[];
  sentRequests: string[];
}

export interface Mission {
  id: number;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  completed: boolean;
}

export interface ShopItem {
  id: string;
  name: string;
  type: 'weapon' | 'tank' | 'vehicle';
  price: number;
  donatePrice?: number;
  damage?: number;
  description: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: number;
}

export interface GameLobby {
  id: string;
  hostId: string;
  hostName: string;
  players: string[];
  maxPlayers: number;
  isActive: boolean;
}

const STORAGE_KEYS = {
  USERS: 'wz_users',
  CURRENT_USER: 'wz_current_user',
  CHAT: 'wz_chat',
  LOBBIES: 'wz_lobbies',
  INVENTORY: 'wz_inventory',
};

export const StorageService = {
  getUsers(): User[] {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },

  saveUsers(users: User[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  getCurrentUser(): User | null {
    const userId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!userId) return null;
    const users = this.getUsers();
    return users.find(u => u.id === userId) || null;
  },

  setCurrentUser(userId: string | null): void {
    if (userId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, userId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  register(email: string, password: string, name: string): User | null {
    const users = this.getUsers();
    if (users.find(u => u.email === email)) {
      return null;
    }

    const newUser: User = {
      id: Math.floor(Math.random() * 1000000).toString(),
      name,
      email,
      password,
      balance: 1000,
      donateBalance: 0,
      status: 'Новобранец',
      isAdmin: false,
      missionsCompleted: 0,
      isOnline: true,
      friends: [],
      friendRequests: [],
      sentRequests: [],
    };

    users.push(newUser);
    this.saveUsers(users);
    this.setCurrentUser(newUser.id);
    return newUser;
  },

  login(email: string, password: string): User | null {
    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      user.isOnline = true;
      this.saveUsers(users);
      this.setCurrentUser(user.id);
      return user;
    }
    return null;
  },

  logout(): void {
    const user = this.getCurrentUser();
    if (user) {
      const users = this.getUsers();
      const updatedUser = users.find(u => u.id === user.id);
      if (updatedUser) {
        updatedUser.isOnline = false;
        this.saveUsers(users);
      }
    }
    this.setCurrentUser(null);
  },

  updateUser(updatedUser: User): void {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      this.saveUsers(users);
    }
  },

  getChatMessages(): ChatMessage[] {
    const data = localStorage.getItem(STORAGE_KEYS.CHAT);
    return data ? JSON.parse(data) : [];
  },

  addChatMessage(message: ChatMessage): void {
    const messages = this.getChatMessages();
    messages.push(message);
    localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(messages));
  },

  getLobbies(): GameLobby[] {
    const data = localStorage.getItem(STORAGE_KEYS.LOBBIES);
    return data ? JSON.parse(data) : [];
  },

  saveLobbies(lobbies: GameLobby[]): void {
    localStorage.setItem(STORAGE_KEYS.LOBBIES, JSON.stringify(lobbies));
  },

  initAdminUser(): void {
    const users = this.getUsers();
    const adminExists = users.find(u => u.email === 'plutka');
    
    if (!adminExists) {
      const admin: User = {
        id: 'dev',
        name: 'Admin',
        email: 'plutka',
        password: 'user',
        balance: 999999,
        donateBalance: 999999,
        status: 'Administrator 👑',
        isAdmin: true,
        missionsCompleted: 6,
        isOnline: false,
        friends: [],
        friendRequests: [],
        sentRequests: [],
      };
      users.push(admin);
      this.saveUsers(users);
    }
  },
};

StorageService.initAdminUser();
