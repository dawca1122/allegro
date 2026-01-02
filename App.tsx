import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import Dashboard from './components/Dashboard';
import { Orders } from './modules/Orders';
import Messages from './modules/Messages';
import ProfitCalculator from './modules/ProfitCalculator';
import { Disputes } from './modules/Disputes';
import { InventoryGuard } from './modules/InventoryGuard';
import { Repricer } from './modules/Repricer';
import { SeoTool } from './modules/SeoTool';
import { SmartLister } from './modules/SmartLister';
import { PrintStation } from './modules/PrintStation';
import { SeoOptimizer } from './modules/SeoOptimizer';
import { AgentChat } from './modules/AgentChat';
import { Bell, User } from 'lucide-react';

/* 
  NOTE: This is the Client-Side Implementation of the Allegro Master Tool.
  To port to Next.js App Router:
  1. Move 'modules/*' to 'app/(dashboard)/*' pages.
  2. Move 'components/*' to 'components/*'.
  3. Replace client-side state routing with Next.js <Link> and useRouter.
  4. Integrate Prisma code from types.ts/schema.prisma into server actions.
*/

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [userName, setUserName] = useState<string | null>(null);

  React.useEffect(() => {
    fetch('/api/status')
      .then((r) => r.json())
      .then((j) => {
        if (j && j.user) setUserName(j.user);
      })
      .catch(() => {});
  }, []);

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard': return <Dashboard />;
      case 'orders': return <Orders />;
      case 'smart-lister': return <SmartLister />;
      case 'print-station': return <PrintStation />;
      case 'messages': return <Messages />;
      case 'seo-autopilot': return <SeoOptimizer />;
      case 'disputes': return <Disputes />;
      case 'inventory': return <InventoryGuard />;
      case 'repricer': return <Repricer />;
      case 'seo': return <SeoTool />;
      case 'profit': return <ProfitCalculator />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-slate-200 font-sans selection:bg-primary/30 relative">
      <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-border bg-surface/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
             <h2 className="text-lg font-semibold text-white capitalize">{activeModule.replace('-', ' ')}</h2>
             <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-primary border border-primary/30 uppercase tracking-wider">
               Pro Plan
             </span>
          </div>

          <div className="flex items-center gap-6">
            <button type="button" className="relative p-2 text-slate-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full ring-2 ring-surface"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-border">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-white">{userName ?? ''}</div>
                  <div className="text-xs text-slate-500">Allegro Elite Seller</div>
              </div>
              <div className="w-9 h-9 bg-slate-700 rounded-full flex items-center justify-center border border-slate-600 text-slate-300">
                <User className="w-5 h-5" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-8 custom-scrollbar relative">
          <div className="max-w-7xl mx-auto h-full">
            {renderModule()}
          </div>
          
          {/* Background Decorative Elements */}
          <div className="fixed top-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="fixed bottom-20 left-64 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none -z-10" />
        </div>
      </main>

      {/* GLOBAL AGENT CHAT OVERLAY */}
      <AgentChat />
    </div>
  );
};

export default App;