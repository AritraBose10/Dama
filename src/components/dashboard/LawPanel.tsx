import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { aiProvider } from '@/lib/ai/provider';
import { Badge } from '@/components/ui/badge';

export const LAWPanel: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<string[]>([
    "Top 5 highest risk:",
    "R.T. Bed 4 — Stroke + sepsis (lactate 4.2, INR 3.1, CT unread 35m)",
    "J.S. Bed 12 — ACS rule-out, delta trop pending",
    "M.K. Bed 7 — Ectopic rule-out, positive UPT, no US result yet",
    "WR — Triage incomplete for 2 patients",
    "A.B. Bed 15 — Low risk but verify anticoag status before repair",
    "",
    "Ready for input..."
  ]);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const triggerAI = async (prompt: string, context?: any) => {
    setIsStreaming(true);
    setMessages(prev => [...prev, "", `> Processing command...`]);
    let currentResponse = "";
    
    try {
      await aiProvider.streamText(prompt, (token) => {
        currentResponse += token;
        setMessages(prev => {
          const newMessages = [...prev];
          if (newMessages[newMessages.length - 1].startsWith('>')) {
            newMessages[newMessages.length - 1] = currentResponse;
          } else {
            newMessages.push(currentResponse);
          }
          return newMessages;
        });
      }, context);
    } catch (error) {
      setMessages(prev => [...prev, "!! ERROR: AI Provider unavailable."]);
    } finally {
      setIsStreaming(false);
    }
  };

  useEffect(() => {
    // Initial risk summary trigger
    triggerAI("Top 5 highest risk summary", { patients: "mock_census" });
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputText && !isStreaming) {
      const command = inputText;
      setInputText('');
      setMessages(prev => [...prev, `*What\\ ${command}`]);
      triggerAI(command);
    }
  };

  return (
    <div className="h-64 bg-[#020617] border-t border-cliniq-surface flex flex-col relative font-mono">
      {/* Panel Header/Badge */}
      <div className="flex items-center justify-between px-4 py-1 bg-cliniq-navy/80 border-b border-cliniq-surface/50">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold text-slate-500 tracking-tighter">LAW</span>
          <div className="flex items-center gap-2 px-2 py-0.5 rounded border border-cliniq-cyan/30 bg-cliniq-cyan/5">
            <span className="text-[9px] font-bold text-cliniq-cyan uppercase tracking-wider">Workflow Only · No Auto-Orders</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={cn("w-1.5 h-1.5 rounded-full", isStreaming ? "bg-cliniq-ai-green animate-pulse" : "bg-slate-600")} />
          <span className="text-[9px] font-bold text-cliniq-ai-green uppercase tracking-widest">
            {isStreaming ? 'AI STREAMING' : 'AI READY'}
          </span>
        </div>
      </div>

      {/* Terminal Output */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-1 text-cliniq-ai-green text-[13px] leading-relaxed selection:bg-cliniq-cyan selection:text-white"
      >
        {messages.map((msg, i) => (
          <div key={i} className={cn(
            "whitespace-pre-wrap",
            msg.includes('R.T.') && "text-cliniq-red",
            (msg.includes('J.S.') || msg.includes('M.K.')) && "text-cliniq-amber",
            msg.startsWith('*What') && "text-cliniq-cyan font-bold"
          )}>
            {msg}
          </div>
        ))}
        {isStreaming && <span className="inline-block w-2 h-4 bg-cliniq-ai-green animate-pulse align-middle ml-1" />}
      </div>

      {/* Input Field */}
      <div className="p-3 bg-cliniq-navy border-t border-cliniq-surface flex items-center gap-3">
        <span className="text-cliniq-cyan font-bold">*What\</span>
        <input 
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isStreaming}
          placeholder={isStreaming ? "AI is processing..." : "Type command or query..."}
          className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder:text-slate-600 disabled:opacity-50"
        />
      </div>
    </div>
  );
};
