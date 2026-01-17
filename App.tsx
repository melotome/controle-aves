
import React, { useState, useEffect } from 'react';
import { User, EggRecord } from './types';
import { DataService } from './services/dataService';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { RecordForm } from './components/RecordForm';
import { HistoryTable } from './components/HistoryTable';
import { AIAdvisor } from './components/AIAdvisor';
import { UserManagement } from './components/UserManagement';
import { IntegrationSettings } from './components/IntegrationSettings';
import { Login } from './components/Login';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [records, setRecords] = useState<EggRecord[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Initial data load
    const user = DataService.getCurrentUser();
    if (user) setCurrentUser(user);
    
    setRecords(DataService.getRecords());
    setIsInitializing(false);
  }, []);

  const refreshRecords = () => {
    setRecords(DataService.getRecords());
  };

  const handleLoginSuccess = (user: User) => {
    DataService.setCurrentUser(user);
    setCurrentUser(user);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    DataService.setCurrentUser(null);
    setCurrentUser(null);
  };

  const handleDeleteRecord = (id: string) => {
    DataService.deleteRecord(id);
    refreshRecords();
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard records={records} />;
      case 'records':
        return <RecordForm user={currentUser} onSuccess={() => {
          refreshRecords();
          setCurrentPage('dashboard');
        }} />;
      case 'history':
        return <HistoryTable records={records} onDelete={handleDeleteRecord} />;
      case 'ai-advisor':
        return <AIAdvisor records={records} />;
      case 'users':
        return <UserManagement />;
      case 'integration':
        return <IntegrationSettings />;
      default:
        return <Dashboard records={records} />;
    }
  };

  return (
    <Layout 
      user={currentUser} 
      onLogout={handleLogout} 
      currentPage={currentPage} 
      setCurrentPage={setCurrentPage}
    >
      {renderPage()}
    </Layout>
  );
};

export default App;
