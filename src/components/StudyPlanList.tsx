"use client";

import { useEffect, useState, useRef } from "react";
import { db, auth } from "@/lib/firebase"; 
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from "firebase/firestore";

// ─── 1. DEFINE TASK INTERFACE ──────────────────────────────────────
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
  
  // Prevents duplicate notifications in the same minute
  const notifiedTasks = useRef<Set<string>>(new Set());

  // ─── 2. DATABASE LISTENER (AUTH + FIRESTORE) ──────────────────────
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const q = query(
          collection(db, "tasks"), 
          where("userId", "==", user.uid)
        );

        const unsubscribeTasks = onSnapshot(q, (snapshot) => {
          const taskData = snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
          })) as Task[];
          
          // Sort by newest first
          const sorted = taskData.sort((a, b) => {
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA;
          });

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

  // ─── 3. THE ALARM ENGINE (NOTIFICATION WATCHER) ───────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentTimeString = `${currentHours}:${currentMinutes}`;

      items.forEach(task => {
        if (
          task.reminderTime === currentTimeString && 
          !notifiedTasks.current.has(task.id) &&
          Notification.permission === "granted"
        ) {
          new Notification("TraceX Focus Guardian", {
            body: `Time to lock in: ${task.text}`,
          });
          notifiedTasks.current.add(task.id);
        }
      });
    }, 30000); // Checks every 30 seconds

    return () => clearInterval(interval);
  }, [items]);

  // ─── 4. ADD TASK LOGIC ───────────────────────────────────────────
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
            {/* THE "BIG TAPPABLE" CLOCK BUTTON */}
            <div className="relative flex-1 md:w-32 h-[48px] bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center active:bg-slate-800 transition-all cursor-pointer">
              {/* This is the real input, invisible but covering the whole box */}
              <input 
                type="time" 
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-20"
                style={{ colorScheme: 'dark' }}
              />
              {/* This is what the user actually sees */}
              <div className="flex items-center gap-2 pointer-events-none text-slate-400">
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
        
        {/* THE HUMOROUS WARNING */}
        {inputError && (
          <p className="text-red-400 text-xs mt-1 ml-2 animate-pulse">
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
            <div key={item.id} className="rounded-xl bg-slate-900/50 border border-slate-800 px-4 py-3 text-sm flex justify-between items-center group transition-all hover:border-slate-700">
              <div className="flex flex-col">
                <span className="text-slate-200">{item.text}</span>
                {item.reminderTime && (
                  <span className="text-blue-400 text-xs mt-1 flex items-center gap-1">
                    🔔 Remind at {item.reminderTime}
                  </span>
                )}
              </div>
              <button 
                onClick={() => handleDelete(item.id)} 
                className="text-slate-600 hover:text-red-500 transition-colors px-2"
                title="Delete mission"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}