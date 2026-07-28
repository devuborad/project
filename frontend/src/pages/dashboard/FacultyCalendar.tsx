import { useState, useEffect } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { ChevronLeft, ChevronRight, Clock, MapPin, X, Calendar as CalendarIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function FacultyCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date()); 
  const [lectures, setLectures] = useState<any[]>([]);
  const [selectedDateEvents, setSelectedDateEvents] = useState<{day: number, events: any[]} | null>(null);

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('campus_user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('campus_token');
        if (!user) return;

        const endpoint = user.role === 'faculty' 
          ? 'http://localhost:5000/api/faculty/lectures' 
          : 'http://localhost:5000/api/students/calendar';

        const response = await fetch(endpoint, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setLectures(data);
        }
      } catch (error) {
        console.error('Error fetching calendar events:', error);
      }
    };
    if (user) {
      fetchEvents();
    }
  }, [user]);

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
        id: lecture.id || Math.random(),
        title: lecture.title,
        time: lecture.time,
        course: lecture.course,
        type: lecture.type || 'lecture', 
        link: lecture.meeting_link,
        description: lecture.description,
        location: lecture.location
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
                  <div 
                    key={day} 
                    onClick={() => {
                      if (eventsByDay[day]?.length > 0) {
                        setSelectedDateEvents({ day, events: eventsByDay[day] });
                      }
                    }}
                    className={`bg-white dark:bg-[#1a1a1a] min-h-[120px] p-2 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors relative group border-t border-gray-100 dark:border-white/5 ${eventsByDay[day]?.length > 0 ? 'cursor-pointer' : ''}`}
                  >
                    <span className={`inline-flex items-center justify-center w-7 h-7 text-sm font-medium rounded-full mb-1 ${
                      isToday
                        ? 'bg-brand-primary text-gray-900' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {day}
                    </span>
                    
                    <div className="space-y-1 mt-1">
                      {eventsByDay[day]?.map((event) => {
                        let badgeClass = 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300';
                        if (event.type === 'assignment') badgeClass = 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300';
                        if (event.type === 'event') badgeClass = 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300';
                        if (event.type === 'hackathon') badgeClass = 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300';
                        if (event.type === 'attendance') badgeClass = 'bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300';
                        
                        return (
                          <div key={event.id} className={`px-2 py-1 text-xs rounded truncate ${badgeClass}`} title={`${event.course}: ${event.title}`}>
                            {event.time && `${event.time} - `}{event.title}
                          </div>
                        );
                      })}
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
                  <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0 ${
                    item.type === 'assignment'
                      ? 'bg-purple-500/20 text-purple-500'
                      : 'bg-blue-500/20 text-blue-500'
                  }`}>
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
                <p className="text-sm text-gray-500">No upcoming events scheduled.</p>
              )}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Legend</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div> Lecture
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div> Assignment
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-3 h-3 rounded-full bg-green-500"></div> Event
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div> Hackathon
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-3 h-3 rounded-full bg-teal-500"></div> Attendance
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Daily Detail Modal */}
      <AnimatePresence>
        {selectedDateEvents && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setSelectedDateEvents(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-brand-dark border border-gray-200 dark:border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[80vh]"
            >
              <div className="p-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-white/[0.02]">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-brand-primary" />
                  Events for {monthNames[currentMonth.getMonth()]} {selectedDateEvents.day}, {currentMonth.getFullYear()}
                </h3>
                <button onClick={() => setSelectedDateEvents(null)} className="text-gray-500 hover:text-red-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                {selectedDateEvents.events.map((event, i) => (
                  <div key={i} className="p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] flex flex-col gap-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary shrink-0 mb-1 inline-block">
                          {event.type}
                        </span>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{event.title}</h4>
                      </div>
                      {event.time && <span className="text-sm text-gray-500 font-medium">{event.time}</span>}
                    </div>
                    
                    {event.course && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Context:</span> {event.course}
                      </p>
                    )}
                    
                    {event.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{event.description}</p>
                    )}
                    
                    {event.location && (
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <MapPin className="w-4 h-4" /> {event.location}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
