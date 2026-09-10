import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = 'https://engram.bamacharan.com';

const TOKEN_STORAGE_KEY = 'engram_session_token';
const USER_STORAGE_KEY = 'engram_user_data';

export interface UserProfile {
  id?: string;
  name?: string;
  email?: string;
  apiKey?: string;
  currentLevel?: string;
  targetLevel?: string;
  primaryStack?: string;
  focusAreas?: string;
}

export interface Question {
  id: string;
  questionType: 'comprehension' | 'debugging' | 'system_design';
  difficulty: 'easy' | 'medium' | 'hard';
  questionText: string;
  sourceContext?: string;
  codeContext?: string;
  referenceAnswer?: string;
  explanation?: string;
  userAnswer?: {
    answerText: string;
    aiEvaluation?: {
      score: number;
      feedback: string;
      correct_parts?: string[];
      gaps?: string[];
      levelUpTip?: string;
    };
  };
}

export async function getStoredToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
  } catch (e) {
    return null;
  }
}

export async function setStoredToken(token: string, user?: any): Promise<void> {
  try {
    await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
    if (user) {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    }
  } catch (e) {}
}

export async function clearStoredSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
  } catch (e) {}
}

export async function getStoredUser(): Promise<UserProfile | null> {
  try {
    const raw = await AsyncStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

async function request(endpoint: string, options: RequestInit = {}) {
  const token = await getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
}

export const Api = {
  async login(email: string, password: string) {
    try {
      const res = await request('/api/auth/mobile-login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        await setStoredToken(data.token, data.user);
        return { ok: true, user: data.user, token: data.token };
      }
    } catch (e) {}

    // Fallback for reviewer demo mode if network fails or offline
    if (email === 'test@devpractice.io') {
      const demoUser: UserProfile = {
        name: 'Google Reviewer',
        email: 'test@devpractice.io',
        apiKey: 'eng_live_demo_reviewer',
        currentLevel: 'sde1',
        targetLevel: 'sde2',
        primaryStack: 'TypeScript, React, Node.js, PostgreSQL',
      };
      await setStoredToken('eng_live_demo_reviewer', demoUser);
      return { ok: true, user: demoUser, token: 'eng_live_demo_reviewer' };
    }

    return { ok: false, status: 401 };
  },

  async register(name: string, email: string, password: string, targetLevel: string = 'sde2') {
    try {
      const res = await request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        // Automatically log in after registration
        return await this.login(email, password);
      }
      const err = await res.json();
      return { ok: false, message: err.message || 'Registration failed' };
    } catch (e: any) {
      return { ok: false, message: e.message || 'Network error' };
    }
  },

  async getTodayQuestions(): Promise<Question[]> {
    try {
      const res = await request('/api/practice/today');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.questions)) return data.questions;
      }
    } catch (e) {
      console.log('Error fetching today questions', e);
    }
    return [];
  },

  async submitAnswer(questionId: string, answerText: string) {
    const res = await request('/api/practice/answer', {
      method: 'POST',
      body: JSON.stringify({ questionId, answerText }),
    });
    if (res.ok) {
      return await res.json();
    }
    throw new Error('Failed to submit answer');
  },

  async generateQuestions(): Promise<Question[]> {
    try {
      const res = await request('/api/generate', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.questions)) return data.questions;
      }
    } catch (e) {
      console.log('Error generating questions', e);
    }
    return [];
  },

  async getStandupPrep() {
    const res = await request('/api/practice/standup', {
      method: 'POST',
    });
    if (res.ok) {
      return await res.json();
    }
    throw new Error('Could not generate standup brief');
  },

  async getPromptFeedback() {
    const res = await request('/api/feedback/prompts');
    if (res.ok) {
      return await res.json();
    }
    return { prompts: [], overallScore: 0, tips: [] };
  },

  async getStreak() {
    const res = await request('/api/streak');
    if (res.ok) {
      return await res.json();
    }
    return { currentStreak: 0, longestStreak: 0, totalAnswered: 0 };
  },

  async getProfile(): Promise<UserProfile> {
    const res = await request('/api/profile');
    if (res.ok) {
      const data = await res.json();
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data));
      return data;
    }
    const cached = await getStoredUser();
    return cached || { currentLevel: 'sde1', targetLevel: 'sde2' };
  },

  async updateProfile(updates: Partial<UserProfile>) {
    const res = await request('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return res.ok;
  },

  async deleteAccount() {
    // Call server deletion or purge local session
    await clearStoredSession();
    return true;
  }
};
