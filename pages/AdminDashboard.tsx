
import React from 'react';
import { 
  Users, 
  Layers, 
  FileText, 
  Clock,
  TrendingUp,
  AlertCircle,
  Calendar,
  Activity
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { LeaveRequest, EncashmentRequest, LeaveStatus, User, Department } from '../types';

interface AdminDashboardProps {
  leaves: LeaveRequest[];
  encashments: EncashmentRequest[];
  users: User[];
  departments: Department[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ leaves, encashments, users, departments }) => {
  const pendingLeaves = leaves.filter(l => l.status === LeaveStatus.PENDING).length;
  const pendingEncashments = encashments.filter(e => e.status === LeaveStatus.PENDING).length;
  
  const now = new Date();
  const currentMonthName = now.toLocaleString('default', { month: 'long' });

  // Dynamic stats based on actual system state
  const stats = {
    totalEmployees: users.length,
    totalDepts: departments.length,
    monthlyLeaves: leaves.filter(l => {
      const d = new Date(l.appliedDate);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length,
    activeLeaves: leaves.filter(l => l.status === LeaveStatus.APPROVED).length
  };

  // 1. Create a map of userId to department name for quick lookup
  const userDeptMap = users.reduce((acc: Record<string, string>, user) => {
    acc[user.id] = user.department;
    return acc;
  }, {});

  // 2. Count leave requests by department
  const leaveDeptCounts = leaves.reduce((acc: Record<string, number>, leave) => {
    const deptName = userDeptMap[leave.userId] || 'Unknown';
    acc[deptName] = (acc[deptName] || 0) + 1;
    return acc;
  }, {});

  // 3. Format data for the chart, ensuring all departments are represented
  const deptData = departments.map(dept => ({
    name: dept.name.length > 8 ? dept.name.substring(0, 7) + '..' : dept.name,
    fullName: dept.name,
    count: leaveDeptCounts[dept.name] || 0
  })).sort((a, b) => b.count - a.count);

  const COLORS = ['#1e3a8a', '#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Management Center</h1>
          <p className="text-gray-500 dark:text-gray-400">Global organizational overview and leave utilization tracking</p>
        </div>
        <div className="hidden md:flex bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-2xl border border-indigo-100 dark:border-indigo-800 items-center">
          <Activity size={16} className="text-indigo-600 mr-2 animate-pulse" />
          <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase">Live Operations</span>
        </div>
      </header>

      {/* Action Alerts */}
      {(pendingLeaves > 0 || pendingEncashments > 0) && (
        <div className="bg-indigo-600 dark:bg-indigo-700 rounded-3xl p-6 text-white flex flex-col md:flex-row items-center justify-between shadow-xl shadow-indigo-100 dark:shadow-none transition-all">
          <div className="flex items-center mb-4 md:mb-0 text-center md:text-left">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold">Pending Items Require Attention</h3>
              <p className="text-indigo-100 text-sm">There are {pendingLeaves + pendingEncashments} new requests waiting for processing.</p>
            </div>
          </div>
          <button 
            onClick={() => window.location.hash = '#/leave-manage'}
            className="px-6 py-3 bg-white text-indigo-600 dark:text-indigo-800 font-bold rounded-xl hover:bg-indigo-50 transition-all text-sm active:scale-95"
          >
            Review Requests
          </button>
        </div>
      )}

      {/* Admin Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
            <Users size={22} />
          </div>
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Total Employees</p>
          <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">{stats.totalEmployees}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
            <Layers size={22} />
          </div>
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Departments</p>
          <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">{stats.totalDepts}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col hover:shadow-md transition-all group relative">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
            <FileText size={22} />
          </div>
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Monthly Leaves</p>
          <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">{stats.monthlyLeaves}</p>
          <span className="absolute top-6 right-6 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-[9px] font-black uppercase rounded">
            {currentMonthName}
          </span>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
            <Calendar size={22} />
          </div>
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Active Personnel</p>
          <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">{stats.activeLeaves}</p>
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center">
            <TrendingUp className="mr-2 text-indigo-600 dark:text-indigo-400" size={20} />
            Leave Requests by Department
          </h3>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">Departmental Utilization</span>
        </div>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} allowDecimals={false} />
              <Tooltip 
                cursor={{fill: '#374151'}}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)',
                  backgroundColor: '#1f2937',
                  color: '#f3f4f6'
                }}
                itemStyle={{ color: '#818cf8' }}
                labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                formatter={(value: number) => [`${value} Requests`, 'Total Leaves']}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {deptData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
