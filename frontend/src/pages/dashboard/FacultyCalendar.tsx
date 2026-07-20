import { useState } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, MapPin, Video } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function FacultyCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 6)); // July 2026

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Mock events for specific days
  const events: Record<number, any[]> = {
    15: [
      { id: 1, title: 'CS301 Lecture', time: '10:00 AM', type: 'lecture', location: 'Online' },
      { id: 2, title: 'Office Hours', time: '02:00 PM', type: 'office', location: 'Room 304' }
    ],
    18: [
      { id: 3, title: 'Faculty Meeting', time: '11:00 AM', type: 'meeting', location: 'Conference Room B' }
    ],
    22: [
      { id: 4, title: 'CS402 Project Presentations', time: '09:00 AM', type: 'exam', location: 'Auditorium' }
    ]
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Calendar</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your schedule, office hours, and events.</p>
        </div>
        <Button variant="gradient" className="shrink-0 group">
          <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
          Add Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h2>
              <div className="flex items-center gap-2">
                <button onClick={prevMonth} className="p-2 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                  <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button onClick={nextMonth} className="p-2 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                  <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-white/10 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="bg-white dark:bg-[#1a1a1a] py-3 text-center text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  {day}
                </div>
              ))}
              
              {blanks.map((blank) => (
                <div key={`blank-${blank}`} className="bg-white dark:bg-[#1a1a1a] min-h-[120px] p-2 opacity-50" />
              ))}
              
              {days.map((day) => (
                <div key={day} className="bg-white dark:bg-[#1a1a1a] min-h-[120px] p-2 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors relative group border-t border-gray-100 dark:border-white/5">
                  <span className={`inline-flex items-center justify-center w-7 h-7 text-sm font-medium rounded-full mb-1 ${
                    day === new Date().getDate() && currentMonth.getMonth() === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear()
                      ? 'bg-brand-primary text-gray-900' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {day}
                  </span>
                  
                  <div className="space-y-1 mt-1">
                    {events[day]?.map((event) => (
                      <div key={event.id} className={`px-2 py-1 text-xs rounded truncate ${
                        event.type === 'lecture' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300' :
                        event.type === 'office' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300' :
                        event.type === 'meeting' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300' :
                        'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300'
                      }`} title={event.title}>
                        {event.time} - {event.title}
                      </div>
                    ))}
                  </div>

                  <button className="absolute top-2 right-2 p-1 rounded bg-brand-primary/10 text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Upcoming Events</h3>
            <div className="space-y-4">
              {[
                { title: 'CS301 Lecture', date: 'Jul 15', time: '10:00 AM', icon: <Video className="w-4 h-4" />, color: 'text-blue-500', bg: 'bg-blue-500/20' },
                { title: 'Office Hours', date: 'Jul 15', time: '02:00 PM', icon: <MapPin className="w-4 h-4" />, color: 'text-green-500', bg: 'bg-green-500/20' },
                { title: 'Faculty Meeting', date: 'Jul 18', time: '11:00 AM', icon: <CalendarIcon className="w-4 h-4" />, color: 'text-purple-500', bg: 'bg-purple-500/20' },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className={`w-10 h-10 rounded-xl ${item.bg} ${item.color} flex flex-col items-center justify-center shrink-0`}>
                    <span className="text-xs font-bold leading-tight">{item.date.split(' ')[0]}</span>
                    <span className="text-sm font-bold leading-tight">{item.date.split(' ')[1]}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">{item.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-6 text-sm">View All Events</Button>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Event Types</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div> Lectures
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-3 h-3 rounded-full bg-green-500"></div> Office Hours
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div> Meetings
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-3 h-3 rounded-full bg-red-500"></div> Exams/Deadlines
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
