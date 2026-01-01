import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Send, Bot, MessageSquare, ChevronDown, Minimize2 } from 'lucide-react';
import { mockOrders, mockInventory } from '../services/mockApi';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

export const AgentChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Cześć Alex! 👋 Jestem Twoim asystentem Gemini. Analizuję Twoją sprzedaż i magazyn w czasie rzeczywistym. Jak mogę Ci pomóc?',
      sender: 'agent',
      timestamp: new Date()
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const generateResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();

    // Scenario A: Earnings / Sales
    if (lowerQuery.includes('zarobiłem') || lowerQuery.includes('przychód') || lowerQuery.includes('sprzedaż') || lowerQuery.includes('raport')) {
      const total = mockOrders.reduce((sum, order) => sum + order.total, 0);
      const count = mockOrders.length;
      return `📊 **Raport Sprzedaży**:\nNa podstawie ostatnich ${count} zamówień:\n- Łączny przychód: **${total.toFixed(2)} zł**\n- Średnia wartość koszyka: ${(total/count).toFixed(2)} zł\n\nTrend jest wzrostowy! 🚀`;
    }

    // Scenario B: Stock / Inventory
    if (lowerQuery.includes('stan') || lowerQuery.includes('magazyn') || lowerQuery.includes('produkt') || lowerQuery.includes('sztuk')) {
      // Search for specific product if mentioned
      const foundItem = mockInventory.find(item => lowerQuery.includes(item.name.toLowerCase()) || lowerQuery.includes(item.sku.toLowerCase()));
      
      if (foundItem) {
        return `📦 **${foundItem.name}** (${foundItem.sku}):\n- Stan fizyczny: **${foundItem.realStock} szt.**\n- Bufor bezpieczeństwa: ${foundItem.virtualBuffer} szt.\n- Dostępne na Allegro: ${Math.max(0, foundItem.realStock - foundItem.virtualBuffer)} szt.`;
      }
      
      // General stock report
      const lowStock = mockInventory.filter(i => i.realStock < 5);
      return `W magazynie monitoruję obecnie **${mockInventory.length} SKU**.\n\n⚠️ **Uwaga**: ${lowStock.length} produkty mają niski stan magazynowy (<5 szt.), m.in. ${lowStock.map(i => i.name).join(', ')}. Sugeruję domówienie towaru.`;
    }

    // Scenario C: Errors / System / Help
    if (lowerQuery.includes('błąd') || lowerQuery.includes('nie działa') || lowerQuery.includes('problem') || lowerQuery.includes('awaria')) {
      return `🔧 **Diagnostyka Systemu**:\n✅ Połączenie z API Allegro: Stabilne (12ms)\n✅ Serwer Wydruku: Online\n⚠️ **Auto-Negocjator**: Wykryto 1 eskalowaną dyskusję, która wymaga Twojej interwencji w module Dyskusji.`;
    }
    
    // Scenario D: Orders specific
    if (lowerQuery.includes('zamówieni') || lowerQuery.includes('paczek') || lowerQuery.includes('paczki')) {
       const newOrders = mockOrders.filter(o => o.status === 'new').length;
       const processing = mockOrders.filter(o => o.status === 'processing').length;
       return `Obecnie masz:\n- **${newOrders}** nowych zamówień do zatwierdzenia.\n- **${processing}** zamówień w trakcie pakowania.\n\nKurier DPD przyjedzie ok. 14:30.`;
    }

    // Scenario E: Margin (Calculated based on mock/generic data since ProfitCalc is local state)
    if (lowerQuery.includes('marż') || lowerQuery.includes('zysk')) {
       return `Twoja średnia marża na wszystkich produktach wynosi ok. **18.5%**. Pamiętaj, że dla produktu 'Smartfon Galaxy X' marża spadła poniżej 10% z powodu agresywnej strategii repricingu.`;
    }

    return "Rozumiem kontekst Twojego biznesu, ale potrzebuję bardziej precyzyjnego pytania. Spróbuj zapytać o: 'dzisiejszy przychód', 'stany magazynowe' lub 'status systemu'.";
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI Processing Delay
    setTimeout(() => {
      const responseText = generateResponse(userMsg.text);
      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'agent',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, agentMsg]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };
  
  const handleQuickAction = (action: string) => {
      // Set input but allow user to edit or press send
      // Or send immediately:
      const userMsg: Message = {
        id: Date.now().toString(),
        text: action,
        sender: 'user',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMsg]);
      setIsTyping(true);
      setTimeout(() => {
        const responseText = generateResponse(action);
        const agentMsg: Message = {
            id: (Date.now() + 1).toString(),
            text: responseText,
            sender: 'agent',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, agentMsg]);
        setIsTyping(false);
      }, 1500);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(14,165,233,0.3)] hover:scale-110 transition-transform z-[60] group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 group-hover:opacity-100 transition-opacity"></div>
          <Sparkles className="text-white w-8 h-8 relative z-10" />
          <span className="absolute top-3 right-4 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 z-20"></span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[360px] md:w-[400px] h-[600px] max-h-[80vh] flex flex-col bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl z-[60] overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          
          {/* Header */}
          <div className="h-16 bg-slate-950/50 p-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg border border-white/10">
                <Bot className="text-white w-6 h-6" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm tracking-wide">GEMINI AGENT <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1 py-0.5 rounded ml-1">PRO</span></h3>
                <div className="flex items-center gap-1.5">
                   <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                   <span className="text-[10px] text-slate-400">Połączono z bazą danych</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-2 hover:bg-white/5 rounded-lg transition-colors">
               <Minimize2 size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gradient-to-b from-slate-900/50 to-slate-950/50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                {msg.sender === 'agent' && (
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mr-2 shrink-0 mt-1 shadow-sm">
                        <Sparkles size={14} className="text-purple-400" />
                    </div>
                )}
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg backdrop-blur-sm ${
                  msg.sender === 'user' 
                    ? 'bg-blue-600/90 text-white rounded-tr-sm border border-blue-500/50' 
                    : 'bg-slate-800/90 text-slate-200 border border-slate-700 rounded-tl-sm'
                }`}>
                  <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
                  <div className={`text-[10px] mt-1.5 text-right opacity-70 ${msg.sender === 'user' ? 'text-blue-100' : 'text-slate-500'}`}>
                    {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start items-center gap-1.5 text-slate-500 text-xs ml-11 p-2">
                 <span className="w-2 h-2 bg-slate-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                 <span className="w-2 h-2 bg-slate-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                 <span className="w-2 h-2 bg-slate-600 rounded-full animate-bounce"></span>
                 <span className="ml-2 italic text-slate-600">Gemini pisze...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar border-t border-slate-800/50 bg-slate-900/50">
             {['Raport dobowy', 'Sprawdź stany', 'Wykryj błędy'].map(action => (
                 <button 
                    key={action}
                    onClick={() => handleQuickAction(action)}
                    className="whitespace-nowrap px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-purple-500/50 rounded-full text-[11px] font-medium text-slate-300 hover:text-white transition-all shadow-sm"
                 >
                    {action}
                 </button>
             ))}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-slate-950 border-t border-slate-800">
            <div className="relative flex items-center gap-2">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Zapytaj o sprzedaż..." 
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 placeholder:text-slate-600 transition-all shadow-inner"
              />
              <button 
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="p-3.5 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl text-white shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};