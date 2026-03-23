import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { aiProvider } from '@/lib/ai/provider';
import { generateLawContext, prompts } from '@/lib/ai/prompts';
import { usePatients } from '@/hooks/usePatients';
import { useClinicalStore } from '@/hooks/useStore';
import { Patient } from '@/types';

interface Message {
  id: string;
  role: 'user' | 'ai' | 'system';
  text: string;
  timestamp: Date;
}

const HELP_TEXT = `Available Commands:
  /summarize [initials]  — Concise 3-line patient summary
  /predict [initials]    — Estimated time to discharge
  /handoff [initials]    — Generate SBAR handoff note
  /alert sepsis          — Filter grid to sepsis-watch patients
  /help                  — Show this help message
  @[initials] [question] — Ask AI about a specific patient`;

function findPatientByInput(patients: Patient[], input: string): Patient | undefined {
  const term = input.trim().toUpperCase();
  return patients.find(p =>
    p.initials.toUpperCase() === term ||
    p.name?.toUpperCase().startsWith(term) ||
    p.initials.toUpperCase().replace('.', '') === term.replace('.', '')
  );
}

export const LAWPanel: React.FC = () => {
  const { selectedPatientId, setIsAiThinking, setActiveTab } = useClinicalStore();
  const { patients } = usePatients();
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (patients.length > 0 && messages.length === 0) {
      const topRisk = [...patients].sort((a, b) => b.risk_score - a.risk_score).slice(0, 3);
      const systemMsgs: Message[] = [
        { id: 'h-1', role: 'system', text: "Top Clinical Risks:", timestamp: new Date() },
        ...topRisk.map((p) => ({
          id: `p-${p.id}`,
          role: 'system' as const,
          text: `${p.name || p.initials} ${p.bed_label || 'WR'} — ${p.chief_complaint} (Risk: ${p.risk_score})`,
          timestamp: new Date()
        })),
        { id: 'sep', role: 'system', text: "", timestamp: new Date() },
        { id: 'help-hint', role: 'system', text: "Type /help for available commands", timestamp: new Date() },
        { id: 'ready', role: 'system', text: "Ready for input...", timestamp: new Date() }
      ];
      setMessages(systemMsgs);
    }
  }, [patients, messages.length]);

  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const addUserMessage = (text: string) => {
    setMessages(prev => [...prev, {
      id: `usr-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date()
    }]);
  };

  const addSystemMessage = (text: string) => {
    setMessages(prev => [...prev, {
      id: `sys-${Date.now()}`,
      role: 'system',
      text,
      timestamp: new Date()
    }]);
  };

  const triggerAI = async (input: string, contextPatient?: Patient, promptTemplate?: (ctx: any) => string) => {
    if (isStreaming) return;

    setIsAiThinking(true);
    setIsStreaming(true);

    const aiMessageId = Date.now().toString();
    setMessages(prev => [...prev, { id: aiMessageId, role: 'ai', text: '> Processing...', timestamp: new Date() }]);

    try {
      const patient = contextPatient || patients.find(p => p.id === selectedPatientId) || patients[0];
      if (!patient) throw new Error('No patient context');
      const context = generateLawContext(patient);
      const systemPrompt = promptTemplate
        ? promptTemplate(context)
        : prompts.PATIENT_ASSIST(context);

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

  const handleCommand = (command: string) => {
    const trimmed = command.trim();

    // /help
    if (trimmed === '/help') {
      addUserMessage('/help');
      addSystemMessage(HELP_TEXT);
      return;
    }

    // /summarize [initials]
    if (trimmed.startsWith('/summarize')) {
      const arg = trimmed.replace('/summarize', '').trim();
      addUserMessage(trimmed);
      if (!arg) {
        addSystemMessage('Usage: /summarize [patient initials]');
        return;
      }
      const patient = findPatientByInput(patients, arg);
      if (!patient) {
        addSystemMessage(`Patient "${arg}" not found. Try using their initials.`);
        return;
      }
      triggerAI(`Summarize patient ${patient.name || patient.initials}`, patient, prompts.SUMMARIZE);
      return;
    }

    // /predict [initials]
    if (trimmed.startsWith('/predict')) {
      const arg = trimmed.replace('/predict', '').trim();
      addUserMessage(trimmed);
      if (!arg) {
        addSystemMessage('Usage: /predict [patient initials]');
        return;
      }
      const patient = findPatientByInput(patients, arg);
      if (!patient) {
        addSystemMessage(`Patient "${arg}" not found.`);
        return;
      }
      triggerAI(`Predict discharge for ${patient.name || patient.initials}`, patient, prompts.PREDICT_DISCHARGE);
      return;
    }

    // /handoff [initials]
    if (trimmed.startsWith('/handoff')) {
      const arg = trimmed.replace('/handoff', '').trim();
      addUserMessage(trimmed);
      if (!arg) {
        addSystemMessage('Usage: /handoff [patient initials]');
        return;
      }
      const patient = findPatientByInput(patients, arg);
      if (!patient) {
        addSystemMessage(`Patient "${arg}" not found.`);
        return;
      }
      triggerAI(`Generate SBAR handoff for ${patient.name || patient.initials}`, patient, prompts.SBAR_GENERATE);
      return;
    }

    // /alert sepsis
    if (trimmed.startsWith('/alert')) {
      const arg = trimmed.replace('/alert', '').trim().toLowerCase();
      addUserMessage(trimmed);
      if (arg === 'sepsis') {
        const sepsisPatients = patients.filter(p => p.sepsis_watch);
        if (sepsisPatients.length === 0) {
          addSystemMessage('No patients currently on sepsis watch.');
        } else {
          addSystemMessage(`${sepsisPatients.length} patient(s) on SEPSIS WATCH:\n${sepsisPatients.map(p => `  ${p.name || p.initials} (${p.bed_label || 'WR'}) — ${p.chief_complaint}`).join('\n')}`);
        }
        return;
      }
      addSystemMessage(`Unknown alert filter: "${arg}". Try: /alert sepsis`);
      return;
    }

    // @[initials] [question]
    if (trimmed.startsWith('@')) {
      const parts = trimmed.substring(1).split(/\s+/);
      const initials = parts[0];
      const question = parts.slice(1).join(' ');
      addUserMessage(trimmed);
      if (!initials) {
        addSystemMessage('Usage: @[patient initials] [your question]');
        return;
      }
      const patient = findPatientByInput(patients, initials);
      if (!patient) {
        addSystemMessage(`Patient "@${initials}" not found.`);
        return;
      }
      if (!question) {
        triggerAI(`Evaluate risk and next steps for patient ${patient.name || patient.initials}`, patient);
      } else {
        triggerAI(question, patient);
      }
      return;
    }

    // Default: free-form query
    addUserMessage(trimmed);
    triggerAI(trimmed);
  };

  useEffect(() => {
    if (selectedPatientId) {
      const patient = patients.find(p => p.id === selectedPatientId);
      if (patient) {
        addUserMessage(`Evaluate Bed ${patient.bed_label || patient.initials}`);
        triggerAI(`Evaluate risk and next steps for patient in ${patient.bed_label || 'current bed'}. Current complaint: ${patient.chief_complaint}.`, patient);
      }
    }
  }, [selectedPatientId, patients]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputText && !isStreaming) {
      const command = inputText;
      setInputText('');
      handleCommand(command);
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
          placeholder={isStreaming ? "AI is processing..." : "Type /help for commands, @initials to query..."}
          className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder:text-slate-600 disabled:opacity-50"
        />
      </div>
    </div>
  );
};
