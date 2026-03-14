import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { aiProvider } from '@/lib/ai/provider';
import { generateLawContext, prompts } from '@/lib/ai/prompts';
import { mockPatients } from '@/lib/mockData';
import { useClinicalStore } from '@/hooks/useStore';

interface Message {
  id: string;
  role: 'user' | 'ai' | 'system';
  text: string;
  timestamp: Date;
}

export const LAWPanel: React.FC = () => {
  const { selectedPatientId, setIsAiThinking } = useClinicalStore();
  const [messages, setMessages] = useState<Message[]>([
    { id: 'initial-0', role: 'system', text: "Top 5 highest risk:", timestamp: new Date() },
    { id: 'initial-1', role: 'system', text: "R.T. Bed 4 — Stroke + sepsis (lactate 4.2, INR 3.1, CT unread 35m)", timestamp: new Date() },
    { id: 'initial-2', role: 'system', text: "J.S. Bed 12 — ACS rule-out, delta trop pending", timestamp: new Date() },
    { id: 'initial-3', role: 'system', text: "M.K. Bed 7 — Ectopic rule-out, positive UPT, no US result yet", timestamp: new Date() },
    { id: 'initial-4', role: 'system', text: "WR — Triage incomplete for 2 patients", timestamp: new Date() },
    { id: 'initial-5', role: 'system', text: "A.B. Bed 15 — Low risk but verify anticoag status before repair", timestamp: new Date() },
    { id: 'initial-6', role: 'system', text: "", timestamp: new Date() },
    { id: 'initial-7', role: 'system', text: "Ready for input...", timestamp: new Date() }
  ]);
  
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const triggerAI = async (input: string, contextPatient?: any) => {
    if (isStreaming) return;
    
    setIsAiThinking(true);
    setIsStreaming(true);
    
    const aiMessageId = Date.now().toString();
    setMessages(prev => [...prev, { id: aiMessageId, role: 'ai', text: '> Processing...', timestamp: new Date() }]);
    
    try {
      const patient = contextPatient || mockPatients[0];
      const context = generateLawContext(patient);
      const systemPrompt = prompts.patientAssist(context);

      const stream = aiProvider.streamText(input, systemPrompt);
      
      let fullText = '';
      for await (const chunk of stream) {
        fullText += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          const index = newMessages.findIndex(m => m.id === aiMessageId);
          if (index !== -1) {
            newMessages[index] = { ...newMessages[index], text: fullText };
          }
          return newMessages;
        });
      }
    } catch (error) {
      console.error('AI Stream Error:', error);
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: 'ai',
        text: 'ERROR: AI Provider timeout. Check API configuration.',
        timestamp: new Date()
      }]);
    } finally {
      setIsStreaming(false);
      setIsAiThinking(false);
    }
  };

  useEffect(() => {
    if (selectedPatientId) {
      const patient = mockPatients.find(p => p.id === selectedPatientId);
      if (patient) {
        setMessages(prev => [...prev, {
          id: `usr-${Date.now()}`,
          role: 'user',
          text: `Evaluate Bed ${patient.bed_label || patient.initials}`,
          timestamp: new Date()
        }]);
        triggerAI(`Evaluate risk and next steps for patient in ${patient.bed_label || 'current bed'}. Current complaint: ${patient.chief_complaint}.`, patient);
      }
    }
  }, [selectedPatientId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputText && !isStreaming) {
      const command = inputText;
      setInputText('');
      setMessages(prev => [...prev, {
        id: `usr-${Date.now()}`,
        role: 'user',
        text: command,
        timestamp: new Date()
      }]);
      triggerAI(command);
    }
  };

  return (
    <div className="h-64 bg-[#020617] border-t border-cliniq-surface flex flex-col relative font-mono">
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

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-1 text-cliniq-ai-green text-[13px] leading-relaxed selection:bg-cliniq-cyan selection:text-white"
      >
        {messages.map((msg) => (
          <div key={msg.id} className={cn(
            "whitespace-pre-wrap",
            msg.role === 'user' && "text-cliniq-cyan font-bold",
            msg.role === 'ai' && msg.text.startsWith('ERROR') && "text-cliniq-red"
          )}>
            {msg.role === 'user' ? `*What\\ ${msg.text}` : msg.text}
          </div>
        ))}
        {isStreaming && <span className="inline-block w-2 h-4 bg-cliniq-ai-green animate-pulse align-middle ml-1" />}
      </div>

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
