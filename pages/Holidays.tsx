
import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, Gift, ChevronLeft, ChevronRight, Info, Search, History, Clock } from 'lucide-react';
import { HOLIDAYS } from '../constants';

const Holidays: React.FC = () => {
  const today = new Date();
  const [currentViewDate, setCurrentViewDate] = useState(new Date());

  const viewMonth = currentViewDate.getMonth();
  const viewYear = currentViewDate.getFullYear();

  // Calendar Logic for Current View Month
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const startDay = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun, 1=Mon...
  
  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const day = i - startDay + 1;
    return day > 0 && day <= daysInMonth ? day : null;
  });

  const monthHolidays = HOLIDAYS.filter(h => {
    const d = new Date(h.date);
    return d.getMonth() === viewMonth && d.getFullYear() === viewYear;
  });

  const categorizedHolidays = useMemo(() => {
    const upcoming = HOLIDAYS.filter(h => new Date(h.date).getTime() >= new Date().setHours(0,0,0,0))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const past = HOLIDAYS.filter(h => new Date(h.date).getTime() < new Date().setHours(0,0,0,0))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { upcoming, past };
  }, []);

  const changeMonth = (offset: number) => {
    setCurrentViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const isSoon = (dateStr: string) => {
    const holidayDate = new Date(dateStr);
    const diffTime = holidayDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 14;
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rwanda Holiday Calendar</h1>
          <p className="text-gray-500 dark:text-gray-400">Tracking public holidays and observance days for {viewYear}</p>
        </div>
        <div className="flex items-center space-x-3">
           <div className="bg-indigo-600 px-4 py-2 rounded-xl text-white shadow-lg shadow-indigo-100 dark:shadow-none flex items-center">
             <Clock size={16} className="mr-2" />
             <span className="text-sm font-bold">{today.toLocaleDateString('en-RW', { day: 'numeric', month: 'long' })}</span>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar View */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-50 dark:border-gray-700 flex items-center justify-between bg-gray-50/30 dark:bg-gray-900/30">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                <CalendarIcon className="mr-2 text-indigo-600 dark:text-indigo-400" size={20} />
                {currentViewDate.toLocaleDateString('en-RW', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex space-x-2">
                <button 
                  onClick={() => changeMonth(-1)}
                  className="p-2 hover:bg-white dark:hover:bg-gray-700 bg-gray-100 dark:bg-gray-900 rounded-lg text-gray-400 hover:text-indigo-600 transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => setCurrentViewDate(new Date())}
                  className="px-3 py-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-[10px] font-black uppercase rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-all dark:text-gray-100"
                >
                  Today
                </button>
                <button 
                  onClick={() => changeMonth(1)}
                  className="p-2 hover:bg-white dark:hover:bg-gray-700 bg-gray-100 dark:bg-gray-900 rounded-lg text-gray-400 hover:text-indigo-600 transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest py-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, i) => {
                  if (day === null) return <div key={i} className="invisible"></div>;
                  
                  const dateObj = new Date(viewYear, viewMonth, day);
                  const isHoliday = monthHolidays.some(h => new Date(h.date).getDate() === day);
                  const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
                  const isWeekend = (i % 7 === 0 || i % 7 === 6);
                  const isPast = dateObj.getTime() < new Date().setHours(0,0,0,0);

                  return (
                    <div 
                      key={i} 
                      className={`aspect-square rounded-2xl flex items-center justify-center text-sm font-bold transition-all relative group
                        ${isToday ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 dark:shadow-none' : 'hover:bg-indigo-50 dark:hover:bg-indigo-900 text-gray-700 dark:text-gray-200 cursor-pointer'}
                        ${isHoliday && !isToday ? 'bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 ring-2 ring-pink-100 dark:ring-pink-900/50' : ''}
                        ${isWeekend && !isToday && !isHoliday ? 'text-gray-300 dark:text-gray-600' : ''}
                        ${isPast && !isToday ? 'opacity-40 grayscale-[0.5]' : ''}
                      `}
                    >
                      {day}
                      {isHoliday && (
                        <span className={`absolute bottom-2 w-1 h-1 rounded-full ${isToday ? 'bg-white' : 'bg-pink-500'}`}></span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex items-center justify-center space-x-6">
               <div className="flex items-center text-[10px] font-black text-gray-400 uppercase">
                 <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 mr-2"></div> Today
               </div>
               <div className="flex items-center text-[10px] font-black text-gray-400 uppercase">
                 <div className="w-2.5 h-2.5 rounded-full bg-pink-500 mr-2"></div> Public Holiday
               </div>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/50 rounded-3xl p-6 flex items-start">
            <Info className="text-amber-500 dark:text-amber-400 mr-4 mt-0.5 shrink-0" size={24} />
            <div>
              <h4 className="text-sm font-black text-amber-800 dark:text-amber-300 uppercase tracking-tight">Organization Policy</h4>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-2 leading-relaxed font-medium">
                Public holidays are non-working days. If a holiday falls on a weekend, the Government may gazette the following Monday. Leave balances are not deducted.
              </p>
            </div>
          </div>
        </div>

        {/* Holiday Lists Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-50 dark:border-gray-700 bg-indigo-50/50 dark:bg-indigo-900/30 flex items-center justify-between">
              <h2 className="text-sm font-black text-indigo-900 dark:text-indigo-200 flex items-center uppercase tracking-wider">
                <Gift className="mr-2 text-indigo-600 dark:text-indigo-400" size={18} />
                Upcoming
              </h2>
            </div>
            <div className="p-2 space-y-1 max-h-[400px] overflow-y-auto">
              {categorizedHolidays.upcoming.map((holiday) => {
                const date = new Date(holiday.date);
                const soon = isSoon(holiday.date);
                return (
                  <div key={holiday.id} className={`flex items-center p-3 rounded-2xl transition-all ${soon ? 'bg-indigo-50 dark:bg-indigo-900/30 ring-1 ring-indigo-100 dark:ring-indigo-800' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                    <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 mr-4 ${soon ? 'bg-indigo-600 text-white animate-pulse' : 'bg-pink-50 dark:bg-pink-900/30 text-pink-500 dark:text-pink-400'}`}>
                      <span className="text-[9px] font-black uppercase">{date.toLocaleDateString('en-US', { month: 'short' })}</span>
                      <span className="text-lg font-bold leading-none">{date.getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{holiday.name}</p>
                      <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mt-0.5">{date.toLocaleDateString('en-US', { weekday: 'long' })}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Holidays;
