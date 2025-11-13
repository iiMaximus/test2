'use client';

import { useState, useEffect } from 'react';
import ConfettiExplosion from 'react-confetti-explosion';
import { Check, Plus, RotateCcw, Moon, Sun } from 'lucide-react';

interface Task {
  id: string;
  text: string;
  done: boolean;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState('');
  const [streak, setStreak] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [exploding, setExploding] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('donein3');
    if (saved) {
      const { tasks: savedTasks, streak: savedStreak, date } = JSON.parse(saved);
      const today = new Date().toDateString();
      if (date === today) {
        setTasks(savedTasks);
        setStreak(savedStreak);
      } else {
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        if (date === yesterday && savedTasks.every((t: Task) => t.done)) {
          setStreak(savedStreak + 1);
        }
      }
    }
    const savedDark = localStorage.getItem('darkMode');
    if (savedDark === 'true') setDarkMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('donein3', JSON.stringify({
      tasks,
      streak,
      date: new Date().toDateString()
    }));
  }, [tasks, streak]);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const addTask = () => {
    if (input.trim() && tasks.length < 3) {
      setTasks([...tasks, { id: Date.now().toString(), text: input, done: false }]);
      setInput('');
    }
  };

  const toggleTask = (id: string) => {
    const newTasks = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
    setTasks(newTasks);
    const allDone = newTasks.length === 3 && newTasks.every(t => t.done);
    if (allDone && !exploding) {
      setExploding(true);
      setTimeout(() => setExploding(false), 3000);
    }
  };

  const resetDay = () => {
    if (confirm('Start fresh tomorrow?')) {
      setTasks([]);
      localStorage.removeItem('donein3');
    }
  };

  return (
    <div className={`min-h-screen transition-colors ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-emerald-50 to-teal-50'}`}>
      <div className="max-w-md mx-auto p-6 flex flex-col h-screen">
        <div className="flex justify-between items-center mb-8 pt-8">
          <h1 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">Done in 3</h1>
          <div className="flex gap-2">
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg bg-white/50 dark:bg-gray-800">
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={resetDay} className="p-2 rounded-lg bg-white/50 dark:bg-gray-800">
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="text-center mb-6">
          <p className="text-5xl font-bold text-emerald-600 dark:text-emerald-400">{streak}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">day streak</p>
        </div>

        <div className="flex-1 space-y-4 mb-6">
          {[0, 1, 2].map((i) => {
            const task = tasks[i];
            return (
              <div key={i} className="relative">
                {task ? (
                  <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                        task.done ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {task.done && <Check className="w-4 h-4 text-white" />}
                    </button>
                    <p className={`flex-1 text-lg ${task.done ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>
                      {task.text}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-white/40 dark:bg-gray-800/40 rounded-2xl backdrop-blur-sm border-2 border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-gray-400 dark:text-gray-600 text-center">Task {i + 1}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {tasks.length < 3 && (
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              placeholder="What will you do today?"
              className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400"
            />
            <button
              onClick={addTask}
              className="p-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        )}

        {exploding && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
            <ConfettiExplosion particleCount={100} duration={3000} colors={['#10b981', '#34d399', '#6ee7b7']} />
          </div>
        )}
      </div>
    </div>
  );
}
