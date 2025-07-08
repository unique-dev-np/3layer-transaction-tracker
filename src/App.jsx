
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import Friends from './components/Friends/Friends';
import Transactions from './components/Transactions/Transactions';
import Utilities from './components/Utilities/Utilities';
import StoreManagement from './components/StoreManagement/StoreManagement';
import { DataProvider } from './contexts/DataContext';

function App() {
  return (
    <DataProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/utilities" element={<Utilities />} />
            <Route path="/store-management" element={<StoreManagement />} />
          </Routes>
        </Layout>
      </Router>
    </DataProvider>
  );
}

export default App;
