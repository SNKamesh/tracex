"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase"; 
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from "firebase/firestore";

interface Task {
  id: string;
  text: string;
  userId: string;
  reminderTime?: string; // Added this!
  createdAt?: any;
}

export default function StudyPlanList() {
  const [items, setItems] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [reminderTime, setReminderTime] = useState(""); // The clock setting
  const [inputError, setInputError] = useState(""); // The gentle warning
  const [loading, setLoading] = useState(true);

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

  async function handleAddTask() {
    // 1. The Gentle Warning Logic
    if (!newTask.trim()) {
      setInputError("Whoops! Looks like your mind went blank for a second. Type a task first! 👻");
      return;
    }
    
    // Clear error if they typed something
    setInputError("");

    const user = auth.currentUser;
    if (!user) return alert("Please sign in to add tasks.");

    try {
      await addDoc(collection(db, "tasks"), {
        text: newTask,
        userId: user.uid,
        reminderTime: reminderTime || null, // Save the time if they picked one
        createdAt: serverTimestamp(),
      });
      setNewTask(""); 
      setReminderTime(""); // Reset clock
    } catch (error) {
      console.error("Error adding task:", error);
    }
  }

  async function handleDelete(id: string) {
    await deleteDoc(doc(db, "tasks", id));
  }

  if (loading) return <p className="text-slate-500 text-xs py-4">Syncing with cloud...</p>;

  return (
    <div className="flex flex-col gap-4">
      
      {/* ADD TASK CONTROLS */}
      <div className="flex flex-col gap-1">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => {
              setNewTask(e.target.value);
              if (inputError) setInputError(""); // Hide error when they start typing
            }}
            placeholder="Add a subject (e.g. Biology)"
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
          />
          
          {/* THE CLOCK SETTING */}
          <input 
            type="time" 
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500"
            title="Set a reminder time"
          />

          <button 
            onClick={handleAddTask}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            Add
          </button>
        </div>
        
        {/* THE GENTLE WARNING MESSAGE */}
        {inputError && (
          <p className="text-red-400 text-xs mt-1 ml-2 animate-pulse">
            {inputError}
          </p>
        )}
      </div>

      {/* THE LIST */}
      <div className="flex flex-col gap-2">
        {items.length === 0 ? (
          <p className="text-slate-500 text-sm italic py-2">No tasks yet. Add one above!</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm flex justify-between items-center group transition-all hover:border-slate-600">
              <div className="flex flex-col">
                <span className="text-slate-200">{item.text}</span>
                {/* Show the time if they set one */}
                {item.reminderTime && (
                  <span className="text-blue-400 text-xs mt-0.5">🔔 Remind at {item.reminderTime}</span>
                )}
              </div>
              <button onClick={() => handleDelete(item.id)} className="text-slate-500 hover:text-red-500 transition-colors px-2">✕</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}