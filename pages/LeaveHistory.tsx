
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Printer, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Calendar, 
  FileText, 
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { User, LeaveRequest, LeaveStatus, EncashmentRequest } from '../types';

interface LeaveHistoryProps {
  user: User;
  leaves: LeaveRequest[];
  encashments: EncashmentRequest[];
}

const LeaveHistory: React.FC<LeaveHistoryProps> = ({ user, leaves, encashments }) => {
  const [activeTab, setActiveTab] = useState<'leaves' | 'encashments'>('leaves');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const userLeaves = leaves.filter(l => l.userId === user.id);
  const userEncashments = encashments.filter(e => e.userId === user.id);

  const filteredData = useMemo(() => {
    if (activeTab === 'leaves') {
      return userLeaves.filter(leave => 
        leave.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      return userEncashments.filter(enc => 
        enc.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enc.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  }, [userLeaves, userEncashments, searchTerm, activeTab]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return isNaN(diffDays) ? 0 : diffDays;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-20 animate-in fade-in duration-300">
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Request History</h1>
          <p className="text-gray-500 dark:text-gray-400">Track all your leave applications and encashment requests</p>
        </div>
        <div className="flex items-center space-x-3 no-print">
          <button 
            onClick={handlePrint}
            className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
          >
            <Printer className="mr-2 text-indigo-500 dark:text-indigo-400" size={18} />
            Print Report
          </button>
          <button className="px-4 py-2.5 bg-indigo-600 rounded-xl text-sm font-bold text-white flex items-center hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none">
            <Download className="mr-2" size={18} />
            Export PDF
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-8 w-full md:w-fit no-print">
        <button
          onClick={() => { setActiveTab('leaves'); setCurrentPage(1); }}
          className={`flex items-center px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${
            activeTab === 'leaves' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <FileText className="mr-2" size={16} />
          Leave Applications
        </button>
        <button
          onClick={() => { setActiveTab('encashments'); setCurrentPage(1); }}
          className={`flex items-center px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${
            activeTab === 'encashments' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <DollarSign className="mr-2" size={16} />
          Encashment History
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6 flex flex-col md:flex-row items-center gap-4 no-print">
        <div className="relative flex-1 w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder={`Search ${activeTab === 'leaves' ? 'applications' : 'encashments'}...`}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm dark:text-white"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            {activeTab === 'leaves' ? (
              <>
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Applied Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Leave Category</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Period</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Duration</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {paginatedData.map((leave: any) => (
                    <tr key={leave.id} className="hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{leave.appliedDate}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{leave.category}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic truncate max-w-xs">"{leave.reason}"</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 font-medium">
                          <Calendar size={14} className="mr-1.5 text-indigo-400 dark:text-indigo-500" />
                          {leave.startDate} → {leave.endDate}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                          {calculateDuration(leave.startDate, leave.endDate)} Days
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide inline-flex items-center ${
                          leave.status === LeaveStatus.APPROVED ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' :
                          leave.status === LeaveStatus.REJECTED ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400' :
                          'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full mr-2 ${
                            leave.status === LeaveStatus.APPROVED ? 'bg-emerald-500' :
                            leave.status === LeaveStatus.REJECTED ? 'bg-red-500' :
                            'bg-amber-500'
                          }`}></div>
                          {leave.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </>
            ) : (
              <>
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Applied Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Request Details</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Days Sold</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Est. Payout</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {paginatedData.map((enc: any) => (
                    <tr key={enc.id} className="hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{enc.appliedDate}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Leave Encashment</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic truncate max-w-xs">"{enc.reason}"</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-lg">
                          {enc.daysToSell} Days
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          RWF {(enc.daysToSell * 25000).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide inline-flex items-center ${
                          enc.status === LeaveStatus.APPROVED ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' :
                          enc.status === LeaveStatus.REJECTED ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400' :
                          'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full mr-2 ${
                            enc.status === LeaveStatus.APPROVED ? 'bg-emerald-500' :
                            enc.status === LeaveStatus.REJECTED ? 'bg-red-500' :
                            'bg-amber-500'
                          }`}></div>
                          {enc.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}
            {paginatedData.length === 0 && (
              <tbody>
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-300 dark:text-gray-600 mb-4">
                        <AlertCircle size={32} />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 font-medium">No {activeTab === 'leaves' ? 'leave' : 'encashment'} records found.</p>
                      <p className="text-gray-400 dark:text-gray-500 text-xs mt-1 italic">Try adjusting your search or switching tabs.</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-white dark:bg-gray-800 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between no-print">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
            </span>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button 
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      currentPage === i + 1 ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Print Footer */}
      <div className="hidden print:block mt-12 pt-8 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-400 italic">This report was generated by {user.fullName} on {new Date().toLocaleString()}</p>
        <p className="text-[10px] text-gray-300 uppercase tracking-widest mt-2">SmartLeave - Organizational Transparency Report</p>
      </div>
    </div>
  );
};

export default LeaveHistory;
