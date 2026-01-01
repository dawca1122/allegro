import React, { useState } from 'react';
import { Camera, Wand2, UploadCloud, Layers, CheckCircle2, ScanLine, X, Loader2 } from 'lucide-react';
import { DraftItem } from '../types';

const MOCK_AI_PRODUCTS = [
  {
    title: "Smartfon Samsung Galaxy S23 5G 8/128GB Czarny",
    ean: "8806094725012",
    category: "Elektronika > Telefony i Smartfony",
    price: 3499.00
  },
  {
    title: "Wiertarka Udarowa Bosch Professional GSB 13 RE",
    ean: "3165140371902",
    category: "Dom i Ogród > Narzędzia",
    price: 289.00
  },
  {
    title: "LEGO Technic 42151 Bugatti Bolide",
    ean: "5702017424750",
    category: "Dziecko > Zabawki > Klocki",
    price: 199.99
  }
];

export const SmartLister = () => {
  const [allegroQty, setAllegroQty] = useState<string>('1');
  const [stockQty, setStockQty] = useState<string>('5');
  const [isProcessing, setIsProcessing] = useState(false);
  const [drafts, setDrafts] = useState<DraftItem[]>([]);

  const handleScan = () => {
    setIsProcessing(true);
    
    // Simulate AI Latency
    setTimeout(() => {
      const randomProduct = MOCK_AI_PRODUCTS[Math.floor(Math.random() * MOCK_AI_PRODUCTS.length)];
      
      const newDraft: DraftItem = {
        id: Math.random().toString(36).substr(2, 9),
        aiTitle: randomProduct.title,
        category: randomProduct.category,
        ean: randomProduct.ean,
        allegroQty: parseInt(allegroQty) || 1,
        stockQty: parseInt(stockQty) || 1,
        status: 'draft',
        qualityScore: 100,
        price: randomProduct.price
      };

      setDrafts(prev => [newDraft, ...prev]);
      setIsProcessing(false);
      // Optional: Reset inputs or keep them for mass scanning
    }, 1500);
  };

  const publishDraft = (id: string) => {
    setDrafts(prev => prev.map(item => 
      item.id === id ? { ...item, status: 'published' } : item
    ));
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 animate-in fade-in duration-300">
      
      {/* LEFT: Scanner / Input Zone */}
      <div className="lg:w-1/3 flex flex-col gap-6">
        <div>
           <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ScanLine className="text-primary" />
            AI Quick Lister
          </h2>
          <p className="text-slate-400">Skanuj opakowania, wystawiaj w 3 sekundy.</p>
        </div>

        {/* Camera / Input Area */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6 shadow-xl">
          <div className="relative aspect-video bg-slate-950 rounded-xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center group hover:border-primary/50 transition-colors cursor-pointer overflow-hidden">
             {isProcessing ? (
               <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center z-10">
                 <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                 <p className="text-primary font-mono animate-pulse">Analiza obrazu AI...</p>
                 <p className="text-xs text-slate-500 mt-2">Rozpoznawanie EAN i modelu</p>
               </div>
             ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 group-hover:bg-slate-800/80">
                    <Camera className="w-8 h-8 text-slate-400 group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-slate-300 font-medium">Kliknij, aby zrobić zdjęcie</p>
                  <p className="text-xs text-slate-500 mt-1">lub wgraj plik z dysku</p>
                </>
             )}
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1.5 block">Ilość na Allegro</label>
               <input 
                 type="number" 
                 value={allegroQty}
                 onChange={(e) => setAllegroQty(e.target.value)}
                 className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none font-mono text-lg text-center"
               />
             </div>
             <div>
               <label className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1.5 block">Stan Magazynowy</label>
               <input 
                 type="number" 
                 value={stockQty}
                 onChange={(e) => setStockQty(e.target.value)}
                 className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none font-mono text-lg text-center"
               />
             </div>
          </div>

          <button 
            onClick={handleScan}
            disabled={isProcessing}
            className="w-full bg-primary hover:bg-sky-400 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(14,165,233,0.3)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
          >
            <Wand2 size={24} />
            {isProcessing ? 'Przetwarzanie...' : 'Skanuj i Przetwórz AI'}
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
             <div className="text-slate-400 text-xs uppercase font-semibold">Sesja</div>
             <div className="text-2xl font-bold text-white mt-1">{drafts.length}</div>
             <div className="text-emerald-400 text-xs">Produktów</div>
           </div>
           <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
             <div className="text-slate-400 text-xs uppercase font-semibold">Wartość</div>
             <div className="text-2xl font-bold text-white mt-1">
               {drafts.reduce((acc, curr) => acc + (curr.price * curr.allegroQty), 0).toFixed(0)} zł
             </div>
             <div className="text-slate-500 text-xs">Estymacja</div>
           </div>
        </div>
      </div>

      {/* RIGHT: Queue / Drafts */}
      <div className="lg:w-2/3 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Layers className="text-slate-400" />
            Kolejka Wystawiania
            <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">{drafts.filter(d => d.status === 'draft').length}</span>
          </h3>
          <button className="text-xs text-slate-500 hover:text-white transition-colors">Wyczyść listę</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-900/50">
          {drafts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
              <ScanLine size={64} className="mb-4 text-slate-700" />
              <p>Brak zeskanowanych produktów</p>
            </div>
          ) : (
            drafts.map((item) => (
              <div key={item.id} className={`bg-slate-800 rounded-xl p-4 border transition-all ${item.status === 'published' ? 'border-emerald-500/50 opacity-50' : 'border-slate-700 hover:border-primary/50'}`}>
                <div className="flex justify-between gap-4">
                  
                  {/* Item Content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-900 text-slate-400 text-[10px] font-mono px-1.5 py-0.5 rounded border border-slate-700">EAN: {item.ean}</span>
                      {item.status === 'published' && (
                        <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">Wystawiono</span>
                      )}
                    </div>
                    
                    <h4 className="font-bold text-white text-lg leading-tight">{item.aiTitle}</h4>
                    <p className="text-sm text-slate-400">{item.category}</p>
                    
                    {/* AI Magic Indicator */}
                    <div className="flex items-center gap-4 mt-2">
                       <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-1 rounded text-emerald-400 text-xs font-medium border border-emerald-500/20">
                         <Wand2 size={12} />
                         Parametry: 100% (AI)
                       </div>
                       <div className="text-slate-500 text-xs font-mono">
                         Ilość: <span className="text-white font-bold">{item.allegroQty}</span> (Mag: {item.stockQty})
                       </div>
                       <div className="text-slate-500 text-xs font-mono">
                         Cena: <span className="text-white font-bold">{item.price.toFixed(2)} zł</span>
                       </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col justify-between items-end gap-2">
                     <button className="text-slate-500 hover:text-white transition-colors">
                       <X size={20} />
                     </button>
                     {item.status === 'draft' && (
                       <button 
                        onClick={() => publishDraft(item.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg shadow-emerald-900/20 flex items-center gap-2 whitespace-nowrap transition-colors"
                       >
                         <UploadCloud size={16} />
                         Wystaw
                       </button>
                     )}
                     {item.status === 'published' && (
                       <div className="text-emerald-500 flex items-center gap-1">
                         <CheckCircle2 size={24} />
                       </div>
                     )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};