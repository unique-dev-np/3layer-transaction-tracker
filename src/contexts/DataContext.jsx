
import React, { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

const getInitialData = (key, defaultValue) => {
  const storedValue = localStorage.getItem(key);
  return storedValue ? JSON.parse(storedValue) : defaultValue;
};

export const DataProvider = ({ children }) => {
  const [stores, setStores] = useState(() => getInitialData('stores', [{ id: 'default', name: 'Default Store' }]));
  const [friends, setFriends] = useState(() => getInitialData('friends', []));
  const [transactions, setTransactions] = useState(() => getInitialData('transactions', []));

  // Persist data to localStorage whenever it changes
  useEffect(() => { localStorage.setItem('stores', JSON.stringify(stores)); }, [stores]);
  useEffect(() => { localStorage.setItem('friends', JSON.stringify(friends)); }, [friends]);
  useEffect(() => { localStorage.setItem('transactions', JSON.stringify(transactions)); }, [transactions]);

  // --- Store Management ---
  const addStore = (name) => {
    const newStore = { id: uuidv4(), name };
    setStores(prevStores => [...prevStores, newStore]);
  };

  const renameStore = (id, newName) => {
    setStores(prevStores => 
      prevStores.map(store => (store.id === id ? { ...store, name: newName } : store))
    );
    // Update store name in existing transactions
    setTransactions(prevTxns => 
      prevTxns.map(txn => {
        if (txn.storeId === id) {
          return { ...txn, from: txn.from === stores.find(s => s.id === id)?.name ? newName : txn.from, to: txn.to === stores.find(s => s.id === id)?.name ? newName : txn.to };
        }
        return txn;
      })
    );
  };

  const removeStore = (id) => {
    if (window.confirm("Are you sure you want to remove this store? All associated transactions will be removed.")) {
      setStores(prevStores => {
        if (prevStores.length === 1) {
          alert("You cannot delete the last store.");
          return prevStores;
        }
        return prevStores.filter(store => store.id !== id);
      });
      // Remove transactions associated with the deleted store
      setTransactions(prevTxns => prevTxns.filter(txn => txn.storeId !== id));
    }
  };

  // --- Friend Management ---
  const addFriend = (name) => {
    const newFriend = { id: uuidv4(), name };
    setFriends(prevFriends => [...prevFriends, newFriend]);
  };

  const removeFriend = (id) => {
    if (window.confirm("Are you sure you want to remove this friend? All associated transactions will remain but will show as '[Deleted Friend]'.")) {
      setFriends(prevFriends => prevFriends.filter(friend => friend.id !== id));
      // Optionally, update transactions where this friend is involved
      setTransactions(prevTxns => 
        prevTxns.map(txn => {
          if (txn.fromId === id) return { ...txn, from: '[Deleted Friend]' };
          if (txn.toId === id) return { ...txn, to: '[Deleted Friend]' };
          return txn;
        })
      );
    }
  };

  // --- Transaction Management ---
  const addTransaction = (txn, storeId = null) => {
    const newTransaction = { ...txn, id: uuidv4(), storeId };
    setTransactions(prevTxns => [...prevTxns, newTransaction]);
  };

  const deleteTransaction = (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      setTransactions(prevTxns => prevTxns.filter(txn => txn.id !== id));
    }
  };

  const exportData = () => {
    const data = {
      stores,
      friends,
      transactions,
    };
    return JSON.stringify(data, null, 2); // Pretty print JSON
  };

  const importData = (jsonData) => {
    try {
      const data = JSON.parse(jsonData);
      if (data.stores && Array.isArray(data.stores)) {
        setStores(data.stores);
      }
      if (data.friends && Array.isArray(data.friends)) {
        setFriends(data.friends);
      }
      if (data.transactions && Array.isArray(data.transactions)) {
        setTransactions(data.transactions);
      }
      alert("Data imported successfully!");
    } catch (error) {
      alert("Failed to import data. Please ensure the data is valid JSON.");
      console.error("Import data error:", error);
    }
  };

  const value = {
    stores,
    friends,
    transactions,
    addStore,
    renameStore,
    removeStore,
    addFriend,
    removeFriend,
    addTransaction,
    deleteTransaction,
    exportData,
    importData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
