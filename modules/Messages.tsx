import React, { useState } from 'react';
import { ToggleLeft, ToggleRight, Save, Clock, AlertCircle, MessageCircle, Search, MoreVertical, CheckCircle2 } from 'lucide-react';
import { MessageSetting } from '../types';
import { mockMessages } from '../services/mockApi';

const Messages: React.FC = () => {
  const [settings, setSettings] = useState<MessageSetting>({
    id: '1',
    autoResponderEnabled: true,
    workHoursStart: '09:00',
    workHoursEnd: '17:00',
    delayMinutes: 2,
    excludedKeywords: ['reklamacja', 'zwrot', 'damaged'],
  });

  const [keywordInput, setKeywordInput] = useState('');

  const handleToggle = () => {
    setSettings(prev => ({ ...prev, autoResponderEnabled: !prev.autoResponderEnabled }));
  };

  const addKeyword = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && keywordInput) {
      if (!settings.excludedKeywords.includes(keywordInput)) {
        setSettings(prev => ({
          ...prev,
          excludedKeywords: [...prev.excludedKeywords, keywordInput]
        }));
      }
      setKeywordInput('');
    }
  };

  const removeKeyword = (kw: string) => {
    setSettings(prev => ({
      ...prev,
      excludedKeywords: prev.excludedKeywords.filter(k => k !== kw)
    }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300 h-[calc(100vh-8rem)]">
      
      {/* Inbox / Chat List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageCircle size={20} className="text-emerald-500" />
              Skrzynka
            </h2>
            <button className="text-slate-400 hover:text-white">
              <MoreVertical size={18} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Szukaj wiadomości..." 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
          {mockMessages.map((msg) => (
            <div key={msg.id} className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-slate-800/80 ${msg.unread ? 'bg-slate-800/40 border-slate-700' : 'bg-transparent border-transparent'}`}>
              <div className="flex justify-between items-start mb-1">
                <span className={`font-medium text-sm ${msg.unread ? 'text-white' : 'text-slate-400'}`}>{msg.user}</span>
                <span className="text-xs text-slate-500">{msg.time}</span>
              </div>
              <p className={`text-sm line-clamp-2 ${msg.unread ? 'text-slate-300' : 'text-slate-500'}`}>{msg.preview}</p>
              {msg.unread && (
                 <div className="flex items-center gap-2 mt-2">
                   <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                   <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide">Nowa wiadomość</span>
                 </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="lg:col-span-2 space-y-6 overflow-y-auto custom-scrollbar pr-2">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <h2 className="text-2xl font-bold text-white">Autoresponder AI</h2>
              <p className="text-slate-400 mt-1">Konfiguracja automatycznych odpowiedzi poza godzinami pracy.</p>
            </div>
            <div className="flex flex-col items-end">
               <button onClick={handleToggle} className="text-emerald-500 hover:text-emerald-400 transition-colors mb-2">
                {settings.autoResponderEnabled ? (
                  <ToggleRight className="w-14 h-14" />
                ) : (
                  <ToggleLeft className="w-14 h-14 text-slate-600" />
                )}
              </button>
              <span className={`text-xs font-medium uppercase tracking-wider ${settings.autoResponderEnabled ? 'text-emerald-500' : 'text-slate-500'}`}>
                {settings.autoResponderEnabled ? 'Aktywny' : 'Wyłączony'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 relative z-10">
            <div className="space-y-4">
              <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Godziny Pracy</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                  <input 
                    type="time" 
                    value={settings.workHoursStart}
                    onChange={(e) => setSettings({...settings, workHoursStart: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                </div>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-500" />
                  <input 
                    type="time" 
                    value={settings.workHoursEnd}
                    onChange={(e) => setSettings({...settings, workHoursEnd: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
              <p className="text-xs text-slate-500">Autoresponder działa <span className="text-rose-400 font-medium">tylko</span> poza wyznaczonymi godzinami.</p>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Opóźnienie odpowiedzi</label>
              <div className="bg-slate-950 rounded-lg p-4 border border-slate-800">
                <input 
                  type="range" 
                  min="0" 
                  max="60" 
                  value={settings.delayMinutes}
                  onChange={(e) => setSettings({...settings, delayMinutes: parseInt(e.target.value)})}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-slate-500">Natychmiast</span>
                  <span className="text-sm font-bold text-emerald-400">{settings.delayMinutes} min</span>
                  <span className="text-xs text-slate-500">60 min</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 relative z-10">
             <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Słowa Wykluczające</label>
                <span className="text-xs text-slate-500">Wiadomości zawierające te słowa zostaną pominięte</span>
             </div>
             
             <div className="relative">
               <input 
                type="text" 
                placeholder="Wpisz słowo kluczowe i naciśnij Enter (np. reklamacja)..." 
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={addKeyword}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors placeholder:text-slate-600"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <span className="px-2 py-1 bg-slate-800 rounded text-[10px] text-slate-400 border border-slate-700">ENTER</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 min-h-[40px]">
              {settings.excludedKeywords.map(kw => (
                <span key={kw} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 group hover:border-rose-500/40 transition-colors">
                  {kw}
                  <button onClick={() => removeKeyword(kw)} className="text-rose-400/50 hover:text-rose-400 transition-colors">
                    &times;
                  </button>
                </span>
              ))}
              {settings.excludedKeywords.length === 0 && (
                <span className="text-sm text-slate-600 italic px-2">Brak zdefiniowanych wykluczeń.</span>
              )}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-center relative z-10">
             <div className="flex items-center gap-2 text-xs text-slate-500">
               <CheckCircle2 size={14} className="text-emerald-500" />
               Ostatnia synchronizacja: Teraz
             </div>
             <button className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20 font-medium group">
              <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Zapisz Ustawienia
            </button>
          </div>
        </div>

        {/* Status Info */}
        <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
             <h4 className="text-sm font-semibold text-blue-400">Informacja o działaniu</h4>
             <p className="text-xs text-slate-400 leading-relaxed">
               System automatycznie odpowie na wiadomości otrzymane poza godzinami {settings.workHoursStart} - {settings.workHoursEnd}, 
               chyba że wiadomość zawiera jedno ze słów wykluczających. Odpowiedź zostanie wysłana po {settings.delayMinutes} minutach 
               od otrzymania wiadomości, aby symulować naturalną reakcję człowieka.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;