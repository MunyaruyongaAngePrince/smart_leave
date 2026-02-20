import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  FileSpreadsheet,
  Printer,
  FileText
} from 'lucide-react';
import { LeaveRequest, EncashmentRequest, LeaveStatus, LeaveCategory, AppNotification } from '../types';

interface LeaveManageProps {
  leaves: LeaveRequest[];
  setLeaves: React.Dispatch<React.SetStateAction<LeaveRequest[]>>;
  encashments: EncashmentRequest[];
  setEncashments: React.Dispatch<React.SetStateAction<EncashmentRequest[]>>;
  onAddNotification: (notif: Omit<AppNotification, 'id' | 'time' | 'read'>) => void;
}

const LeaveManage: React.FC<LeaveManageProps> = ({ leaves, setLeaves, encashments, setEncashments, onAddNotification }) => {
  const [activeTab, setActiveTab] = useState<'leaves' | 'encashments'>('leaves');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  
  // Advanced Filter State
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  
  const itemsPerPage = 8;

  const filteredLeaves = useMemo(() => {
    return leaves.filter(l => {
      const matchesSearch = l.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            l.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || l.status === statusFilter;
      const matchesCategory = categoryFilter === 'All' || l.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [leaves, searchTerm, statusFilter, categoryFilter]);

  const filteredEncashments = useMemo(() => {
    return encashments.filter(e => {
      const matchesSearch = e.fullName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || e.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [encashments, searchTerm, statusFilter]);

  const currentData = activeTab === 'leaves' ? filteredLeaves : filteredEncashments;
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  const paginatedData = currentData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab, statusFilter, categoryFilter]);

  const handleLeaveStatus = (id: string, status: LeaveStatus) => {
    const leave = leaves.find(l => l.id === id);
    if (leave) {
      setLeaves(prev => prev.map(l => l.id === id ? { ...l, status } : l));
      onAddNotification({ 
        userId: leave.userId, 
        title: `Leave ${status}`, 
        desc: `Your ${leave.category} request has been ${status.toLowerCase()}.`, 
        type: status === LeaveStatus.APPROVED ? 'success' : 'error' 
      });
    }
  };

  const handleEncashmentStatus = (id: string, status: LeaveStatus) => {
    const enc = encashments.find(e => e.id === id);
    if (enc) {
      setEncashments(prev => prev.map(e => e.id === id ? { ...e, status } : e));
      onAddNotification({ 
        userId: enc.userId, 
        title: `Encashment ${status}`, 
        desc: `Your request to sell ${enc.daysToSell} days has been ${status.toLowerCase()}.`, 
        type: status === LeaveStatus.APPROVED ? 'success' : 'error' 
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const resetFilters = () => {
    setStatusFilter('All');
    setCategoryFilter('All');
    setSearchTerm('');
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leave Management</h1>
          <p className="text-gray-500 dark:text-gray-400">Review and process employee time-off applications</p>
        </div>
        <div className="flex items-center space-x-2 print:hidden">
          <button 
            onClick={handlePrint}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none active:scale-95"
          >
            <Printer className="mr-2" size={18} />
            Print to PDF
          </button>
        </div>
      </header>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Main Controls Row */}
        <div className="p-6 border-b border-gray-50 dark:border-gray-700 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gray-50/30 dark:bg-gray-900/20 print:hidden">
          <div className="flex p-1 bg-gray-100 dark:bg-gray-900 rounded-xl w-full lg:w-auto">
            <button 
              onClick={() => setActiveTab('leaves')} 
              className={`flex-1 lg:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'leaves' ? 'bg-white dark:bg-gray-800 text-indigo-600 shadow-sm' : 'text-gray-500'}`}
            >
              Leaves
            </button>
            <button 
              onClick={() => setActiveTab('encashments')} 
              className={`flex-1 lg:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'encashments' ? 'bg-white dark:bg-gray-800 text-indigo-600 shadow-sm' : 'text-gray-500'}`}
            >
              Encashments
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search requests..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <button 
              onClick={() => setIsFilterVisible(!isFilterVisible)}
              className={`flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-bold border transition-all w-full md:w-auto ${isFilterVisible ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50'}`}
            >
              <Filter className="mr-2" size={18} />
              Filters
              {(statusFilter !== 'All' || categoryFilter !== 'All') && (
                <span className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>
          </div>
        </div>

        {/* Expandable Filter Panel */}
        {isFilterVisible && (
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 animate-in slide-in-from-top-4 duration-300 print:hidden">
            <div className="flex flex-wrap items-end gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest">Status</label>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-48 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="All">All Statuses</option>
                  <option value={LeaveStatus.PENDING}>Pending</option>
                  <option value={LeaveStatus.APPROVED}>Approved</option>
                  <option value={LeaveStatus.REJECTED}>Rejected</option>
                </select>
              </div>

              {activeTab === 'leaves' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest">Type</label>
                  <select 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="block w-48 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="All">All Categories</option>
                    {Object.values(LeaveCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              )}

              <button 
                onClick={resetFilters}
                className="mb-0.5 px-4 py-2 text-[10px] font-black uppercase text-gray-400 hover:text-red-500 transition-colors flex items-center"
              >
                <X size={14} className="mr-1" />
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Print Only Header */}
        <div className="hidden print:block p-8 text-center border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Leave Management Report</h2>
          <p className="text-sm text-gray-500 mt-1">Generated on {new Date().toLocaleString()} • Departmental Record</p>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Employee</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Detail</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Applied</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-right print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {paginatedData.map((item: any) => (
                <tr key={item.id} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 flex items-center justify-center text-xs font-black print:hidden">
                        {item.fullName.charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{item.fullName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {activeTab === 'leaves' ? item.category : 'Encashment'}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {activeTab === 'leaves' ? `${item.startDate} to ${item.endDate}` : `${item.daysToSell} Days`}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400">{item.appliedDate}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase border ${
                      item.status === LeaveStatus.APPROVED ? 'border-emerald-200 text-emerald-600 bg-emerald-50' : 
                      item.status === LeaveStatus.REJECTED ? 'border-red-200 text-red-600 bg-red-50' : 
                      'border-amber-200 text-amber-600 bg-amber-50'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right print:hidden">
                    {item.status === LeaveStatus.PENDING && (
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => activeTab === 'leaves' ? handleLeaveStatus(item.id, LeaveStatus.APPROVED) : handleEncashmentStatus(item.id, LeaveStatus.APPROVED)} 
                          className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button 
                          onClick={() => activeTab === 'leaves' ? handleLeaveStatus(item.id, LeaveStatus.REJECTED) : handleEncashmentStatus(item.id, LeaveStatus.REJECTED)} 
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center opacity-40">
                      <FileText size={48} className="text-gray-400 mb-4" />
                      <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">No Applications Found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between print:hidden">
            <span className="text-xs font-bold text-gray-400">Page {currentPage} of {totalPages}</span>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                disabled={currentPage === 1} 
                className="p-2 bg-white dark:bg-gray-800 rounded-lg disabled:opacity-30 border border-gray-200 shadow-sm"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                disabled={currentPage === totalPages} 
                className="p-2 bg-white dark:bg-gray-800 rounded-lg disabled:opacity-30 border border-gray-200 shadow-sm"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveManage;