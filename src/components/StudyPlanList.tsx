"use client";

import { useEffect, useState, useRef } from "react";
import { db, auth } from "@/lib/firebase"; 
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from "firebase/firestore";

interface Task {
  id: string;
  text: string;
  userId: string;
  reminderTime?: string;
  createdAt?: any;
}

export default function StudyPlanList() {
  const [items, setItems] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [inputError, setInputError] = useState("");
  const [loading, setLoading] = useState(true);
  
  const timeInputRef = useRef<HTMLInputElement>(null);
  const notifiedTasks = useRef<Set<string>>(new Set());

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const q = query(collection(db, "tasks"), where("userId", "==", user.uid));
        const unsubscribeTasks = onSnapshot(q, (snapshot) => {
          const taskData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Task[];
          const sorted = taskData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
          setItems(sorted);
          setLoading(false);
        });
        return () => unsubscribeTasks();
      } else {
        setItems([]);
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // ─── UPDATED ALARM ENGINE (TraceX Branding) ───
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      items.forEach(task => {
        if (task.reminderTime === currentTime && !notifiedTasks.current.has(task.id)) {
          if (Notification.permission === "granted") {
            // FIXED: Changed TraceChi Focus Guardian to TraceX
            new Notification("TraceX", { 
              body: `Time to lock in: ${task.text}`,
              icon: "/favicon.ico" // Optional: adds your logo to the notification
            });
            notifiedTasks.current.add(task.id);
          }
        }
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [items]);

  async function handleAddTask() {
    if (!newTask.trim()) {
      setInputError("Whoops! Your mind went blank for a second. Type a task first! 👻");
      return;
    }
    const user = auth.currentUser;
    if (!user) return;

    try {
      await addDoc(collection(db, "tasks"), {
        text: newTask,
        userId: user.uid,
        reminderTime: reminderTime || null,
        createdAt: serverTimestamp(),
      });
      setNewTask(""); 
      setReminderTime(""); 
      setInputError("");
    } catch (error) {
      console.error("Error adding task:", error);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteDoc(doc(db, "tasks", id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  }

  if (loading) return <p className="text-slate-500 text-xs py-4 italic">Syncing with cloud...</p>;

  return (
    <div className="flex flex-col gap-4">
      
      {/* ADD TASK CONTROLS */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-col md:flex-row gap-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => {
              setNewTask(e.target.value);
              if (inputError) setInputError(""); 
            }}
            placeholder="Add a subject (e.g. Biology)"
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
            onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
          />
          
          <div className="flex gap-2">
            <div 
              onClick={() => timeInputRef.current?.showPicker()} 
              className="relative flex-1 md:w-36 h-[48px] bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center active:bg-slate-800 transition-all cursor-pointer group hover:border-slate-600"
            >
              <input 
                ref={timeInputRef}
                type="time" 
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-20"
                style={{ colorScheme: 'dark' }}
              />
              <div className="flex items-center gap-2 pointer-events-none text-slate-400 group-hover:text-blue-400 transition-colors">
                <span className="text-lg">🕒</span>
                <span className="text-xs font-medium">
                  {reminderTime || "Set Time"}
                </span>
              </div>
            </div>

            <button 
              onClick={handleAddTask}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 h-[48px] rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95"
            >
              Add
            </button>
          </div>
        </div>
        
        {inputError && (
          <p className="text-red-400 text-[10px] mt-1 ml-2 animate-pulse font-medium">
            {inputError}
          </p>
        )}
      </div>

      {/* THE LIST ITEMS */}
      <div className="flex flex-col gap-2">
        {items.length === 0 ? (
          <p className="text-slate-500 text-sm italic py-2">No tasks yet. Add one above!</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-xl bg-slate-900/40 border border-slate-800/60 px-4 py-3 text-sm flex justify-between items-center group transition-all hover:border-slate-700 hover:bg-slate-900/60">
              <div className="flex flex-col gap-1">
                <span className="text-slate-200 font-medium">{item.text}</span>
                {item.reminderTime && (
                  <div className="flex items-center gap-1 text-blue-400 text-[11px] font-semibold">
                    <span className="text-xs">🔔</span>
                    <span>Remind at {item.reminderTime}</span>
                  </div>
                )}
              </div>
              <button 
                onClick={() => handleDelete(item.id)} 
                className="text-slate-500 hover:text-red-500 transition-all p-2 rounded-lg hover:bg-red-500/10"
                title="Remove task"
              >
                <span className="text-lg leading-none">✕</span>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}