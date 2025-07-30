import React, { createContext, useContext, useState, useEffect } from 'react';
import { DatabaseService } from '../services/DatabaseService';
import { useAuth } from './AuthContext';

const FinancialContext = createContext();

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};

export const FinancialProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [objectives, setObjectives] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadFinancialData();
    }
  }, [isAuthenticated, user]);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      const [transactionsResponse, objectivesResponse] = await Promise.all([
        DatabaseService.getTransactions(user.id),
        DatabaseService.getObjectives(user.id)
      ]);

      if (transactionsResponse.success) {
        setTransactions(transactionsResponse.data);
        calculateBalance(transactionsResponse.data);
      }

      if (objectivesResponse.success) {
        setObjectives(objectivesResponse.data);
      }
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateBalance = (transactionList) => {
    const total = transactionList.reduce((acc, transaction) => {
      return transaction.type === 'deposit' 
        ? acc + transaction.amount 
        : acc - transaction.amount;
    }, 0);
    setBalance(total);
  };

  const addTransaction = async (transactionData) => {
    try {
      const response = await DatabaseService.addTransaction({
        ...transactionData,
        user_id: user.id,
        date: new Date().toISOString(),
      });

      if (response.success) {
        const newTransaction = response.data;
        const updatedTransactions = [...transactions, newTransaction];
        setTransactions(updatedTransactions);
        calculateBalance(updatedTransactions);
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Add transaction error:', error);
      return { success: false, error: 'Failed to add transaction. Please try again.' };
    }
  };

  const addObjective = async (objectiveData) => {
    try {
      const response = await DatabaseService.addObjective({
        ...objectiveData,
        user_id: user.id,
        created_at: new Date().toISOString(),
      });

      if (response.success) {
        const newObjective = response.data;
        setObjectives([...objectives, newObjective]);
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Add objective error:', error);
      return { success: false, error: 'Failed to add objective. Please try again.' };
    }
  };

  const updateObjective = async (objectiveId, objectiveData) => {
    try {
      const response = await DatabaseService.updateObjective(objectiveId, objectiveData);

      if (response.success) {
        const updatedObjectives = objectives.map(obj => 
          obj.id === objectiveId ? { ...obj, ...objectiveData } : obj
        );
        setObjectives(updatedObjectives);
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Update objective error:', error);
      return { success: false, error: 'Failed to update objective. Please try again.' };
    }
  };

  const deleteObjective = async (objectiveId) => {
    try {
      const response = await DatabaseService.deleteObjective(objectiveId);

      if (response.success) {
        const updatedObjectives = objectives.filter(obj => obj.id !== objectiveId);
        setObjectives(updatedObjectives);
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Delete objective error:', error);
      return { success: false, error: 'Failed to delete objective. Please try again.' };
    }
  };

  const getMonthlyData = () => {
    const monthlyData = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { deposits: 0, withdraws: 0 };
      }
      
      if (transaction.type === 'deposit') {
        monthlyData[monthKey].deposits += transaction.amount;
      } else {
        monthlyData[monthKey].withdraws += transaction.amount;
      }
    });
    
    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      ...data,
      balance: data.deposits - data.withdraws
    }));
  };

  const getCategoryData = () => {
    const categoryData = {};
    
    transactions.forEach(transaction => {
      const category = transaction.category || 'Other';
      
      if (!categoryData[category]) {
        categoryData[category] = { deposits: 0, withdraws: 0 };
      }
      
      if (transaction.type === 'deposit') {
        categoryData[category].deposits += transaction.amount;
      } else {
        categoryData[category].withdraws += transaction.amount;
      }
    });
    
    return Object.entries(categoryData).map(([category, data]) => ({
      category,
      ...data,
      total: Math.abs(data.deposits - data.withdraws)
    }));
  };

  const value = {
    balance,
    transactions,
    objectives,
    loading,
    addTransaction,
    addObjective,
    updateObjective,
    deleteObjective,
    getMonthlyData,
    getCategoryData,
    refreshData: loadFinancialData,
  };

  return (
    <FinancialContext.Provider value={value}>
      {children}
    </FinancialContext.Provider>
  );
};