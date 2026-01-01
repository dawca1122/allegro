import React, { useState, useEffect } from 'react';
import { Printer, FileText, ToggleLeft, ToggleRight, CheckCircle2, Zap, Wifi, Terminal } from 'lucide-react';

interface PrintJob {
  id: string;
  docType: 'LABEL' | 'INVOICE';
  name: string;
  status: 'QUEUED' | 'PRINTING' | 'SENT' | 'ERROR';
  timestamp: string;
  printer: string;
}

export const PrintStation = () => {
  const [labelPrinter, setLabelPrinter] = useState('Zebra ZD420 (USB)');
  const [docPrinter, setDocPrinter] = useState('HP LaserJet Pro M404 (Network)');
  const [autoLabel, setAutoLabel] = useState(true);
  const [autoInvoice, setAutoInvoice] = useState(false);
  const [queue, setQueue] = useState<PrintJob[]>([
    { id: 'job-103', docType: 'LABEL', name: 'Order #1002 - DPD', status: 'SENT', timestamp: '14:30:05', printer: 'Zebra ZD420' },
    { id: 'job-102', docType: 'INVOICE', name: 'FV 2023/10/55', status: 'SENT', timestamp: '14:29:15', printer: 'HP LaserJet' },
    { id: 'job-101', docType: 'LABEL', name: 'Order #1001 - InPost', status: 'SENT', timestamp: '14:28:00', printer: 'Zebra ZD420' },
  ]);

  const handleTestPrint = (type: 'LABEL' | 'INVOICE') => {
    const printerName = type === 'LABEL' ? labelPrinter.split('(')[0].trim() : docPrinter.split('(')[0].trim();
    const newJob: PrintJob = {
      id: `test-${Date.now()}`,
      docType: type,
      name: `TEST STRONY (${printerName})`,
      status: 'QUEUED',
      timestamp: new Date().toLocaleTimeString(),
      printer: printerName
    };

    setQueue(prev => [newJob, ...prev]);

    // Simulate Processing
    setTimeout(() => {
      setQueue(prev => prev.map(j => j.id === newJob.id ? { ...j, status: 'PRINTING' } : j));
      
      setTimeout(() => {
        setQueue(prev => prev.map(j => j.id === newJob.id ? { ...j, status: 'SENT' } : j));
        // Simple Toast simulation
        // In a real app, use a Toast context
        console.log(`🖨️ Wydrukowano test na ${printerName}`);
      }, 1500);
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Printer className="text-primary" />
            Stacja Druku
          </h2>
          <p className="text-slate-400">Zarządzanie hardwarem i automatyzacją dokumentów.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
          <Wifi size={16} />
          <span className="font-medium">Print Server: Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        
        {/* LEFT: Configuration */}
        <div className="space-y-6">
          
          {/* Label Printer Config */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-50">
               <Printer size={64} className="text-slate-800 transform rotate-12" />
            </div>
            
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 relative z-10">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Drukarka Etykiet (ZPL/EPL)
            </h3>
            
            <div className="space-y-4 relative z-10">
               <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Urządzenie</label>
                  <select 
                    value={labelPrinter}
                    onChange={(e) => setLabelPrinter(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                  >
                    <option>Zebra ZD420 (USB)</option>
                    <option>Dymo LabelWriter 4XL (WiFi)</option>
                    <option>Brother QL-820NWB (LAN)</option>
                  </select>
               </div>
               
               <div className="flex justify-between items-center pt-2">
                  <div className="text-xs text-slate-400">Status: <span className="text-emerald-400 font-medium">Gotowa do pracy</span></div>
                  <button 
                    onClick={() => handleTestPrint('LABEL')}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 text-sm transition-colors"
                  >
                    Test Etykiety
                  </button>
               </div>
            </div>
          </div>

          {/* Doc Printer Config */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-50">
               <FileText size={64} className="text-slate-800 transform -rotate-12" />
            </div>

            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 relative z-10">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Drukarka Dokumentów (A4)
            </h3>
            
            <div className="space-y-4 relative z-10">
               <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Urządzenie</label>
                  <select 
                    value={docPrinter}
                    onChange={(e) => setDocPrinter(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                  >
                    <option>HP LaserJet Pro M404 (Network)</option>
                    <option>Kyocera ECOSYS P2040 (Network)</option>
                    <option>Samsung Xpress M2026 (USB)</option>
                  </select>
               </div>

               <div className="flex justify-between items-center pt-2">
                  <div className="text-xs text-slate-400">Status: <span className="text-emerald-400 font-medium">Uśpiona (Wake-on-LAN)</span></div>
                  <button 
                     onClick={() => handleTestPrint('INVOICE')}
                     className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 text-sm transition-colors"
                  >
                    Test A4
                  </button>
               </div>
            </div>
          </div>

          {/* Automation Rules */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Zap className="text-yellow-400 fill-yellow-400" />
              Automatyzacja Zadań
            </h3>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-white">Auto-Druk Etykiet</div>
                  <div className="text-xs text-slate-500">Gdy status zmieni się na "W realizacji"</div>
                </div>
                <button onClick={() => setAutoLabel(!autoLabel)} className={`transition-colors ${autoLabel ? 'text-emerald-500' : 'text-slate-600'}`}>
                  {autoLabel ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
                </button>
              </div>

              <div className="flex justify-between items-center border-t border-slate-800 pt-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-white">Auto-Druk Faktur</div>
                  <div className="text-xs text-slate-500">Gdy zamówienie zostanie opłacone</div>
                </div>
                <button onClick={() => setAutoInvoice(!autoInvoice)} className={`transition-colors ${autoInvoice ? 'text-emerald-500' : 'text-slate-600'}`}>
                  {autoInvoice ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Console / Queue */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl flex flex-col font-mono overflow-hidden shadow-2xl">
          <div className="bg-slate-900 p-4 border-b border-slate-800 flex justify-between items-center">
             <div className="flex items-center gap-2 text-slate-300">
               <Terminal size={18} />
               <span className="text-sm font-bold">Print Queue Monitor</span>
             </div>
             <div className="flex gap-2">
               <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
               <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
               <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50"></div>
             </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-2 text-sm">
            {queue.length === 0 && (
              <div className="text-slate-600 italic text-center mt-10">// Kolejka wydruku jest pusta...</div>
            )}
            {queue.map((job) => (
              <div key={job.id} className="flex gap-3 group animate-in slide-in-from-left-2 duration-300">
                <span className="text-slate-600">[{job.timestamp}]</span>
                <div className="flex-1">
                  <span className={job.docType === 'LABEL' ? 'text-blue-400' : 'text-purple-400'}>{job.docType}</span>
                  <span className="text-slate-500"> {'>'} </span>
                  <span className="text-slate-300">{job.name}</span>
                  <span className="text-slate-600 text-xs ml-2">({job.printer})</span>
                </div>
                <span className={`font-bold ${
                  job.status === 'SENT' ? 'text-emerald-500' : 
                  job.status === 'PRINTING' ? 'text-yellow-500 animate-pulse' : 
                  'text-slate-500'
                }`}>
                  {job.status}
                </span>
              </div>
            ))}
            <div className="text-emerald-500/50 pt-2 animate-pulse">_</div>
          </div>
        </div>

      </div>
    </div>
  );
};