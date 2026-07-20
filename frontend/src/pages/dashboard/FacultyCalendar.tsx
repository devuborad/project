import { useState, useEffect } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, Video, User } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function FacultyCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date()); 
  const [lectures, setLectures] = useState<any[]>([]);

  useEffect(() => {
    const fetchLectures = async () => {
      try {
        const token = localStorage.getItem('campus_token');
        const response = await fetch('http://localhost:5000/api/faculty/lectures', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setLectures(data);
        }
      } catch (error) {
        console.error('Error fetching lectures:', error);
      }
    };
    fetchLectures();
  }, []);

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

  // Process lectures into a map for the calendar
  // key: date number (1-31) of the current month
  const eventsByDay: Record<number, any[]> = {};
  
  // also track upcoming events
  const upcomingEvents = [...lectures]
    .filter(l => new Date(l.date) >= new Date(new Date().setHours(0,0,0,0)))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  lectures.forEach(lecture => {
    const d = new Date(lecture.date);
    if (d.getFullYear() === currentMonth.getFullYear() && d.getMonth() === currentMonth.getMonth()) {
      const day = d.getDate();
      if (!eventsByDay[day]) eventsByDay[day] = [];
      eventsByDay[day].push({
        id: lecture.id,
        title: lecture.title,
        time: lecture.time,
        course: lecture.course,
        type: 'lecture',
        link: lecture.meeting_link
      });
    }
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Calendar</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your schedule, office hours, and events.</p>
        </div>
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
              
              {days.map((day) => {
                const isToday = day === new Date().getDate() && currentMonth.getMonth() === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear();
                
                return (
                  <div key={day} className="bg-white dark:bg-[#1a1a1a] min-h-[120px] p-2 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors relative group border-t border-gray-100 dark:border-white/5">
                    <span className={`inline-flex items-center justify-center w-7 h-7 text-sm font-medium rounded-full mb-1 ${
                      isToday
                        ? 'bg-brand-primary text-gray-900' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {day}
                    </span>
                    
                    <div className="space-y-1 mt-1">
                      {eventsByDay[day]?.map((event) => (
                        <div key={event.id} className="px-2 py-1 text-xs rounded truncate bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300" title={`${event.course}: ${event.title}`}>
                          {event.time} - {event.course}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Upcoming Schedule</h3>
            <div className="space-y-4">
              {upcomingEvents.map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-500 flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs font-bold leading-tight">{new Date(item.date).toLocaleString('default', { month: 'short' }).toUpperCase()}</span>
                    <span className="text-sm font-bold leading-tight">{new Date(item.date).getDate()}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">{item.course}</h4>
                    <p className="text-xs text-gray-500 truncate max-w-[150px]">{item.title}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.time}</span>
                    </div>
                  </div>
                </div>
              ))}
              {upcomingEvents.length === 0 && (
                <p className="text-sm text-gray-500">No upcoming lectures scheduled.</p>
              )}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Event Types</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div> Scheduled Lectures
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
