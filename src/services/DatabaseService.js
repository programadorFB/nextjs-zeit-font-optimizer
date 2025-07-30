// Database Service for PostgreSQL connection
// Note: In a real React Native app, you would use a backend API
// This is a mock service that simulates database operations

const API_BASE_URL = 'http://your-backend-url.com/api'; // Replace with your actual backend URL

class DatabaseService {
  static async makeRequest(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return { success: true, data };
    } catch (error) {
      console.error('Database request error:', error);
      return { success: false, error: error.message };
    }
  }

  // Authentication methods
  static async login(email, password) {
    return await this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  static async register(email, password, name) {
    return await this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  static async updateProfile(userId, userData) {
    return await this.makeRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Transaction methods
  static async getTransactions(userId) {
    return await this.makeRequest(`/transactions/${userId}`);
  }

  static async addTransaction(transactionData) {
    return await this.makeRequest('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  // Objective methods
  static async getObjectives(userId) {
    return await this.makeRequest(`/objectives/${userId}`);
  }

  static async addObjective(objectiveData) {
    return await this.makeRequest('/objectives', {
      method: 'POST',
      body: JSON.stringify(objectiveData),
    });
  }

  static async updateObjective(objectiveId, objectiveData) {
    return await this.makeRequest(`/objectives/${objectiveId}`, {
      method: 'PUT',
      body: JSON.stringify(objectiveData),
    });
  }

  static async deleteObjective(objectiveId) {
    return await this.makeRequest(`/objectives/${objectiveId}`, {
      method: 'DELETE',
    });
  }
}

// Mock data for development (remove this in production)
const mockDatabase = {
  users: [
    {
      id: 1,
      email: 'user@example.com',
      password: 'password123', // In real app, this would be hashed
      name: 'John Doe',
      profile_photo: null,
    }
  ],
  transactions: [
    {
      id: 1,
      user_id: 1,
      type: 'deposit',
      amount: 1000,
      description: 'Initial deposit',
      category: 'Income',
      date: new Date().toISOString(),
    },
    {
      id: 2,
      user_id: 1,
      type: 'withdraw',
      amount: 200,
      description: 'Groceries',
      category: 'Food',
      date: new Date().toISOString(),
    }
  ],
  objectives: [
    {
      id: 1,
      user_id: 1,
      title: 'Emergency Fund',
      target_amount: 5000,
      current_amount: 800,
      deadline: '2024-12-31',
      created_at: new Date().toISOString(),
    }
  ]
};

// Mock implementation (replace with real API calls in production)
const isDevelopment = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV === 'development';

if (isDevelopment) {
  DatabaseService.makeRequest = async (endpoint, options = {}) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const [, resource, param] = endpoint.split('/');

    switch (resource) {
      case 'auth':
        if (param === 'login') {
          const { email, password } = JSON.parse(options.body);
          const user = mockDatabase.users.find(u => u.email === email && u.password === password);
          if (user) {
            const { password: _, ...userWithoutPassword } = user;
            return {
              success: true,
              data: {
                user: userWithoutPassword,
                token: 'mock-jwt-token'
              }
            };
          }
          return { success: false, error: 'Invalid credentials' };
        }
        if (param === 'register') {
          const { email, password, name } = JSON.parse(options.body);
          const existingUser = mockDatabase.users.find(u => u.email === email);
          if (existingUser) {
            return { success: false, error: 'User already exists' };
          }
          const newUser = {
            id: mockDatabase.users.length + 1,
            email,
            password,
            name,
            profile_photo: null,
          };
          mockDatabase.users.push(newUser);
          return { success: true, data: { message: 'User registered successfully' } };
        }
        break;

      case 'transactions':
        if (options.method === 'POST') {
          const transactionData = JSON.parse(options.body);
          const newTransaction = {
            id: mockDatabase.transactions.length + 1,
            ...transactionData,
          };
          mockDatabase.transactions.push(newTransaction);
          return { success: true, data: newTransaction };
        }
        // GET transactions by user ID
        const userId = parseInt(param);
        const userTransactions = mockDatabase.transactions.filter(t => t.user_id === userId);
        return { success: true, data: userTransactions };

      case 'objectives':
        if (options.method === 'POST') {
          const objectiveData = JSON.parse(options.body);
          const newObjective = {
            id: mockDatabase.objectives.length + 1,
            ...objectiveData,
            current_amount: 0,
          };
          mockDatabase.objectives.push(newObjective);
          return { success: true, data: newObjective };
        }
        if (options.method === 'PUT') {
          const objectiveId = parseInt(param);
          const updateData = JSON.parse(options.body);
          const objectiveIndex = mockDatabase.objectives.findIndex(o => o.id === objectiveId);
          if (objectiveIndex !== -1) {
            mockDatabase.objectives[objectiveIndex] = {
              ...mockDatabase.objectives[objectiveIndex],
              ...updateData,
            };
            return { success: true, data: mockDatabase.objectives[objectiveIndex] };
          }
          return { success: false, error: 'Objective not found' };
        }
        if (options.method === 'DELETE') {
          const objectiveId = parseInt(param);
          const objectiveIndex = mockDatabase.objectives.findIndex(o => o.id === objectiveId);
          if (objectiveIndex !== -1) {
            mockDatabase.objectives.splice(objectiveIndex, 1);
            return { success: true, data: { message: 'Objective deleted' } };
          }
          return { success: false, error: 'Objective not found' };
        }
        // GET objectives by user ID
        const userIdForObjectives = parseInt(param);
        const userObjectives = mockDatabase.objectives.filter(o => o.user_id === userIdForObjectives);
        return { success: true, data: userObjectives };

      case 'users':
        if (options.method === 'PUT') {
          const userId = parseInt(param);
          const updateData = JSON.parse(options.body);
          const userIndex = mockDatabase.users.findIndex(u => u.id === userId);
          if (userIndex !== -1) {
            mockDatabase.users[userIndex] = {
              ...mockDatabase.users[userIndex],
              ...updateData,
            };
            const { password: _, ...userWithoutPassword } = mockDatabase.users[userIndex];
            return { success: true, data: userWithoutPassword };
          }
          return { success: false, error: 'User not found' };
        }
        break;

      default:
        return { success: false, error: 'Endpoint not found' };
    }
  };
}

export { DatabaseService };