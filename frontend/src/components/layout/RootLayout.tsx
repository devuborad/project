import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { AICopilot } from '../ui/AICopilot';

export function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col relative selection:bg-brand-primary selection:text-gray-900 dark:text-white">
      {/* Global Animated Backgrounds */}
      <div className="bg-aurora" />
      <div className="bg-noise" />
      <div className="bg-grid opacity-20" />
      
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow pt-[100px] flex flex-col">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
      
      {/* AI Copilot */}
      <AICopilot />
    </div>
  );
}
