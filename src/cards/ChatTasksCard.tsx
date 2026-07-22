import { useState, useEffect } from 'react';
import { MessageSquare, Plus, ExternalLink, Check, Trash2 } from 'lucide-react';
import CardShell from '../components/CardShell';
import ExpandedOverlay from '../components/ExpandedOverlay';
import pb from '../lib/pocketbase';
import type { ChatTask, AISource } from '../types';

const AI_SOURCES: AISource[] = ['Claude', 'ChatGPT', 'Manus', 'Gemini', 'Kimi', 'Qwen', 'Z', 'Perplexity'];

const sourceStyle: Record<AISource, { bg: string; text: string }> = {
  Claude:     { bg: 'bg-orange-400/15 border border-orange-400/30',  text: 'text-orange-400'  },
  ChatGPT:    { bg: 'bg-teal-400/15 border border-teal-400/30',      text: 'text-teal-400'    },
  Manus:      { bg: 'bg-violet-400/15 border border-violet-400/30',  text: 'text-violet-400'  },
  Gemini:     { bg: 'bg-sky-400/15 border border-sky-400/30',        text: 'text-sky-400'     },
  Kimi:       { bg: 'bg-pink-400/15 border border-pink-400/30',      text: 'text-pink-400'    },
  Qwen:       { bg: 'bg-lime-400/15 border border-lime-400/30',      text: 'text-lime-400'    },
  Z:          { bg: 'bg-rose-400/15 border border-rose-400/30',      text: 'text-rose-400'    },
  Perplexity: { bg: 'bg-cyan-400/15 border border-cyan-400/30',      text: 'text-cyan-400'    },
};

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function ChatTasksCard() {
  const [open, setOpen] = useState(false);
  const [tasks, setTasks] = useState<ChatTask[]>([]);
  const [source, setSource] = useState<AISource>('Claude');
  const [taskText, setTaskText] = useState('');
  const [chatUrl, setChatUrl] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openCount = tasks.filter((t) => !t.done).length;

  const fetchTasks = async () => {
    try {
      const records = await pb.collection('chat_tasks').getList<ChatTask>(1, 100, { sort: '-created' });
      setTasks(records.items);
    } catch (err) {
      console.error('[ChatTasksCard] fetchTasks failed:', err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async () => {
    const text = taskText.trim();
    if (!text) return;
    setAdding(true);
    setError(null);
    const optimistic: ChatTask = {
      id: `local-${Date.now()}`,
      task: text,
      source,
      chat_url: chatUrl.trim() || undefined,
      done: false,
      created: new Date().toISOString(),
    };
    setTasks((prev) => [optimistic, ...prev]);
    setTaskText('');
    setChatUrl('');
    try {
      const record = await pb.collection('chat_tasks').create<ChatTask>({
        task: text,
        source,
        chat_url: chatUrl.trim() || null,
        done: false,
      });
      setTasks((prev) => prev.map((t) => (t.id === optimistic.id ? record : t)));
    } catch (err) {
      console.error('[ChatTasksCard] create failed:', err);
      setError(`Save failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setAdding(false);
    }
  };

  const deleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (!id.startsWith('local-')) {
      try {
        await pb.collection('chat_tasks').delete(id);
      } catch (err) {
        console.error('[ChatTasksCard] delete failed:', err);
      }
    }
  };

  const toggleDone = async (task: ChatTask) => {
    const updated = { ...task, done: !task.done };
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    if (!task.id.startsWith('local-')) {
      try {
        await pb.collection('chat_tasks').update(task.id, { done: !task.done });
      } catch (err) {
        console.error('[ChatTasksCard] toggleDone failed:', err);
        setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
      }
    }
  };

  const openTasks = tasks.filter((t) => !t.done);
  const doneTasks = tasks.filter((t) => t.done);

  return (
    <>
      <CardShell
        title="Chat Tasks"
        icon={<MessageSquare size={16} />}
        status={openCount > 0 ? 'attention' : 'idle'}
        statusLabel={openCount > 0 ? `${openCount} open` : 'All done'}
        preview={openCount > 0 ? `${openCount} open tasks · ${tasks[0]?.task ?? ''}` : 'No open tasks'}
        onClick={() => setOpen(true)}
      />
      {open && (
        <ExpandedOverlay
          title="Chat Tasks"
          icon={<MessageSquare size={18} />}
          status={openCount > 0 ? 'attention' : 'idle'}
          statusLabel={`${openCount} open · ${doneTasks.length} done`}
          onClose={() => setOpen(false)}
        >
          <div className="space-y-5">
            {/* Add form */}
            <div className="space-y-2 bg-zinc-800 rounded-xl p-4">
              <div className="flex gap-2">
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value as AISource)}
                  className="bg-zinc-700 border border-zinc-600 rounded-lg px-2.5 py-2 font-mono text-xs text-zinc-300 focus:outline-none focus:border-zinc-500"
                >
                  {AI_SOURCES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={taskText}
                  onChange={(e) => setTaskText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') addTask(); }}
                  placeholder="Task description…"
                  className="flex-1 bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 font-body text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatUrl}
                  onChange={(e) => setChatUrl(e.target.value)}
                  placeholder="Chat link (optional)"
                  className="flex-1 bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 font-mono text-xs text-zinc-400 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                />
                <button
                  onClick={addTask}
                  disabled={adding || !taskText.trim()}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 rounded-lg font-body text-sm text-zinc-900 font-medium transition-colors"
                >
                  <Plus size={14} />
                  Add
                </button>
              </div>
              {error && <div className="font-mono text-xs text-amber-400 break-all">{error}</div>}
            </div>

            {/* Open tasks */}
            {openTasks.length > 0 && (
              <div>
                <div className="font-mono text-xs text-zinc-500 uppercase tracking-widest mb-2">Open</div>
                <div className="space-y-2">
                  {openTasks.map((task) => (
                    <TaskRow key={task.id} task={task} onToggle={toggleDone} />
                  ))}
                </div>
              </div>
            )}

            {/* Done tasks */}
            {doneTasks.length > 0 && (
              <div>
                <div className="font-mono text-xs text-zinc-500 uppercase tracking-widest mb-2">Done</div>
                <div className="space-y-2">
                  {doneTasks.map((task) => (
                    <TaskRow key={task.id} task={task} onToggle={toggleDone} onDelete={deleteTask} done />
                  ))}
                </div>
              </div>
            )}

            {tasks.length === 0 && (
              <div className="text-center py-6 font-mono text-sm text-zinc-600">No tasks yet.</div>
            )}
          </div>
        </ExpandedOverlay>
      )}
    </>
  );
}

function TaskRow({
  task, onToggle, onDelete, done = false,
}: { task: ChatTask; onToggle: (t: ChatTask) => void; onDelete?: (id: string) => void; done?: boolean }) {
  const s = sourceStyle[task.source] ?? { bg: 'bg-zinc-700', text: 'text-zinc-400' };
  return (
    <div className={`flex items-start gap-3 bg-zinc-800 rounded-lg px-3 py-3 group ${done ? 'opacity-50' : ''}`}>
      <button
        onClick={() => onToggle(task)}
        className={`mt-0.5 w-4 h-4 rounded flex-shrink-0 border transition-colors flex items-center justify-center ${
          done ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-600 hover:border-emerald-400'
        }`}
      >
        {done && <Check size={10} className="text-zinc-900" />}
      </button>
      <div className="flex-1 min-w-0">
        <div className={`font-body text-sm ${done ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
          {task.task}
        </div>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className={`font-mono text-xs px-1.5 py-0.5 rounded ${s.bg} ${s.text}`}>{task.source}</span>
          <span className="font-mono text-xs text-zinc-600">{formatTime(task.created)}</span>
          {task.chat_url && (
            <a
              href={task.chat_url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 font-mono text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <ExternalLink size={10} />
              Open chat
            </a>
          )}
        </div>
      </div>
      {onDelete && (
        <button
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all flex-shrink-0 mt-0.5"
        >
          <Trash2 size={13} />
        </button>
      )}
    </div>
  );
}
