'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Check, Circle, Pill, Activity, ClipboardList, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClinicalTask {
  id: string;
  patient_id: string;
  type: 'medication' | 'procedure' | 'follow_up' | 'monitoring';
  title: string;
  details?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
  assigned_role: string;
  created_at: string;
  completed_at?: string;
  completed_by?: string;
}

interface TaskBoardProps {
  patientId: string;
}

const typeConfig: Record<ClinicalTask['type'], { icon: React.ReactNode; label: string; color: string }> = {
  medication: { icon: <Pill className="w-3 h-3" />, label: 'Medications', color: 'text-blue-400' },
  procedure: { icon: <Activity className="w-3 h-3" />, label: 'Procedures', color: 'text-purple-400' },
  follow_up: { icon: <ClipboardList className="w-3 h-3" />, label: 'Follow-ups', color: 'text-cliniq-amber' },
  monitoring: { icon: <Eye className="w-3 h-3" />, label: 'Monitoring', color: 'text-cliniq-cyan' },
};

export const TaskBoard: React.FC<TaskBoardProps> = ({ patientId }) => {
  const [tasks, setTasks] = useState<ClinicalTask[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch(`/api/tasks?patient_id=${patientId}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const toggleTask = async (task: ClinicalTask) => {
    const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';

    // Optimistic update
    setTasks(prev => prev.map(t =>
      t.id === task.id
        ? { ...t, status: newStatus, completed_at: newStatus === 'COMPLETED' ? new Date().toISOString() : undefined }
        : t
    ));

    try {
      await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: task.id, status: newStatus }),
      });
    } catch {
      // Revert on error
      fetchTasks();
    }
  };

  const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="w-4 h-4 border-2 border-cliniq-cyan/30 border-t-cliniq-cyan rounded-full animate-spin" />
        <span className="ml-2 text-xs text-muted-foreground">Loading tasks...</span>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <p className="text-xs text-muted-foreground/50 italic py-2">No clinical tasks assigned</p>
    );
  }

  // Group tasks by type
  const grouped = tasks.reduce((acc, task) => {
    if (!acc[task.type]) acc[task.type] = [];
    acc[task.type].push(task);
    return acc;
  }, {} as Record<string, ClinicalTask[]>);

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Progress</span>
          <span className={cn(
            "text-[11px] font-bold",
            progress === 100 ? "text-cliniq-ai-green" : "text-cliniq-cyan"
          )}>
            {completedCount}/{totalCount} tasks
          </span>
        </div>
        <div className="w-full bg-cliniq-surface/60 rounded-full h-1.5 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              progress === 100 ? "bg-cliniq-ai-green" : "bg-cliniq-cyan"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Task groups */}
      {(['medication', 'procedure', 'follow_up', 'monitoring'] as const).map(type => {
        const group = grouped[type];
        if (!group?.length) return null;
        const config = typeConfig[type];

        return (
          <div key={type} className="space-y-1.5">
            <div className={cn("flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest", config.color)}>
              {config.icon}
              {config.label}
            </div>
            {group.map(task => (
              <button
                key={task.id}
                onClick={() => toggleTask(task)}
                className={cn(
                  "w-full text-left p-2 rounded-lg border transition-all duration-200 group",
                  task.status === 'COMPLETED'
                    ? "bg-cliniq-ai-green/5 border-cliniq-ai-green/20 opacity-70"
                    : "bg-cliniq-surface/30 border-cliniq-surface/50 hover:bg-cliniq-surface/50 hover:border-cliniq-cyan/30"
                )}
              >
                <div className="flex items-start gap-2">
                  <div className={cn(
                    "mt-0.5 w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border transition-all",
                    task.status === 'COMPLETED'
                      ? "bg-cliniq-ai-green/20 border-cliniq-ai-green/40"
                      : "border-cliniq-surface group-hover:border-cliniq-cyan/50"
                  )}>
                    {task.status === 'COMPLETED' ? (
                      <Check className="w-3 h-3 text-cliniq-ai-green" />
                    ) : (
                      <Circle className="w-2.5 h-2.5 text-muted-foreground/30" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-[11px] font-bold",
                      task.status === 'COMPLETED' ? "line-through text-muted-foreground" : "text-white"
                    )}>
                      {task.title}
                    </p>
                    {task.details && (
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{task.details}</p>
                    )}
                  </div>
                  <span className="text-[9px] font-bold text-muted-foreground/50 uppercase shrink-0">
                    {task.assigned_role}
                  </span>
                </div>
                {task.completed_at && (
                  <p className="text-[9px] text-cliniq-ai-green/60 mt-1 ml-6">
                    Completed {new Date(task.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </button>
            ))}
          </div>
        );
      })}
    </div>
  );
};
