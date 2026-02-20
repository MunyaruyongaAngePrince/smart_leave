import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User, Role, LeaveRequest, EncashmentRequest, AppNotification, Department } from './types';
import { MOCK_USERS, MOCK_LEAVES, MOCK_DEPARTMENTS } from './constants';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminDashboard from './pages/AdminDashboard';
import LeaveManage from './pages/LeaveManage';
import Employees from './pages/Employees';
import Departments from './pages/Departments';
import ApplyLeave from './pages/ApplyLeave';
import LeaveHistory from './pages/LeaveHistory';
import Profile from './pages/Profile';
import Holidays from './pages/Holidays';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('smart_leave_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('smart_leave_users');
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });

  const [departments, setDepartments] = useState<Department[]>(() => {
    const saved = localStorage.getItem('smart_leave_departments');
    return saved ? JSON.parse(saved) : MOCK_DEPARTMENTS;
  });

  const [leaves, setLeaves] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem('smart_leave_requests');
    return saved ? JSON.parse(saved) : MOCK_LEAVES;
  });

  const [encashments, setEncashments] = useState<EncashmentRequest[]>(() => {
    const saved = localStorage.getItem('smart_leave_encashments');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('smart_leave_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('smart_leave_requests', JSON.stringify(leaves));
  }, [leaves]);

  useEffect(() => {
    localStorage.setItem('smart_leave_encashments', JSON.stringify(encashments));
  }, [encashments]);

  useEffect(() => {
    localStorage.setItem('smart_leave_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('smart_leave_departments', JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    localStorage.setItem('smart_leave_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('smart_leave_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('smart_leave_user');
    }
  }, [currentUser]);

  // Initial Dark Mode Check
  useEffect(() => {
    if (localStorage.getItem('theme') === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleLogin = (user: User) => setCurrentUser(user);
  const handleLogout = () => setCurrentUser(null);
  
  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const addNotification = (notif: Omit<AppNotification, 'id' | 'time' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: Math.random().toString(36).substr(2, 9),
      time: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markAllRead = () => {
    if (!currentUser) return;
    setNotifications(prev => prev.map(n => n.userId === currentUser.id ? { ...n, read: true } : n));
  };

  const isAdminOrHR = currentUser?.role === Role.ADMIN || currentUser?.role === Role.HR_MANAGER;

  return (
    <HashRouter>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300 overflow-hidden">
        {currentUser && <Sidebar user={currentUser} onLogout={handleLogout} />}
        
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${currentUser ? 'ml-0 md:ml-64' : ''}`}>
          {currentUser && (
            <Topbar 
              user={currentUser} 
              notifications={notifications.filter(n => n.userId === currentUser.id)} 
              onMarkAllRead={markAllRead}
            />
          )}
          
          <main className="flex-1 overflow-y-auto focus:outline-none dark:bg-gray-900/50">
            <Routes>
              <Route 
                path="/" 
                element={currentUser ? (isAdminOrHR ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />) : <Navigate to="/login" />} 
              />
              
              <Route 
                path="/login" 
                element={!currentUser ? <Login onLogin={handleLogin} users={users} /> : <Navigate to="/" />} 
              />
              
              <Route 
                path="/register" 
                element={!currentUser ? <Register setUsers={setUsers} /> : <Navigate to="/" />} 
              />

              <Route 
                path="/dashboard" 
                element={currentUser && !isAdminOrHR ? <EmployeeDashboard user={currentUser} leaves={leaves} /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/apply" 
                element={currentUser && !isAdminOrHR ? (
                  <ApplyLeave 
                    user={currentUser} 
                    leaves={leaves} 
                    setLeaves={setLeaves} 
                    encashments={encashments} 
                    setEncashments={setEncashments} 
                    onAddNotification={addNotification}
                    users={users}
                  />
                ) : <Navigate to="/login" />} 
              />
              <Route 
                path="/history" 
                element={currentUser && !isAdminOrHR ? <LeaveHistory user={currentUser} leaves={leaves} encashments={encashments} /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/holidays" 
                element={currentUser ? <Holidays /> : <Navigate to="/login" />} 
              />

              <Route 
                path="/profile" 
                element={currentUser ? <Profile user={currentUser} onUpdateUser={handleUpdateUser} /> : <Navigate to="/login" />} 
              />

              <Route 
                path="/admin" 
                element={currentUser && isAdminOrHR ? <AdminDashboard leaves={leaves} encashments={encashments} users={users} departments={departments} /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/leave-manage" 
                element={currentUser && (currentUser.role === Role.HR_MANAGER || currentUser.role === Role.ADMIN) ? (
                  <LeaveManage 
                    leaves={leaves} 
                    setLeaves={setLeaves} 
                    encashments={encashments} 
                    setEncashments={setEncashments} 
                    onAddNotification={addNotification}
                  />
                ) : <Navigate to="/login" />} 
              />
              <Route 
                path="/employees" 
                element={currentUser && isAdminOrHR ? <Employees users={users} setUsers={setUsers} /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/departments" 
                element={currentUser && isAdminOrHR ? (
                  <Departments 
                    users={users} 
                    departments={departments}
                    setDepartments={setDepartments}
                    leaves={leaves} 
                    setLeaves={setLeaves} 
                    onAddNotification={addNotification} 
                  />
                ) : <Navigate to="/login" />} 
              />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </div>
    </HashRouter>
  );
};

export default App;