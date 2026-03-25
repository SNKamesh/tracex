"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase"; 
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  deleteDoc,
  doc 
} from "firebase/firestore";

interface Task {
  id: string;
  text: string;
  userId: string;
  createdAt?: any;
}

export default function StudyPlanList() {
  const [items, setItems] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);

  // ─── IMPROVED LISTENER (Auth + Database) ──────────────────────────
  useEffect(() => {
    // 1. Listen for the user session (fixes mobile refresh issue)
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        // 2. Once user is confirmed, listen to their specific tasks
        const q = query(
          collection(db, "tasks"), 
          where("userId", "==", user.uid)
        );

        const unsubscribeTasks = onSnapshot(q, (snapshot) => {
          const taskData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Task[];
          
          // Sort by newest first (handling potential null timestamps)
          const sorted = taskData.sort((a, b) => {
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA;
          });

          setItems(sorted);
          setLoading(false);
        });

        // Cleanup task listener if user logs out
        return () => unsubscribeTasks();
      } else {
        // No user found, stop loading and clear list
        setItems([]);
        setLoading(false);
      }
    });

    // Cleanup auth listener on unmount
    return () => unsubscribeAuth();
  }, []);

  // ─── ADD A NEW TASK ───────────────────────────────────────────────
  async function handleAddTask() {
    if (!newTask.trim()) return;
    
    // Always get the LATEST user status before adding
    const user = auth.currentUser;
    if (!user) {
      alert("Please sign in to add tasks.");
      return;
    }

    try {
      await addDoc(collection(db, "tasks"), {
        text: newTask,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
      setNewTask(""); 
    } catch (error) {
      console.error("Error adding task:", error);
    }
  }

  // ─── DELETE A TASK (Bonus feature to clean up tests) ──────────────
  async function handleDelete(id: string) {
    try {
      await deleteDoc(doc(db, "tasks", id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  }

  if (loading) return <p className="text-slate-500 text-xs py-4">Syncing with cloud...</p>;

  return (
    <div className="flex flex-col gap-4">
      {/* ADD TASK INPUT */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a subject (e.g. Biology)"
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
        />
        <button 
          onClick={handleAddTask}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          Add
        </button>
      </div>

      {/* THE LIST */}
      <div className="flex flex-col gap-2">
        {items.length === 0 ? (
          <p className="text-slate-500 text-sm italic py-2">No tasks yet. Add one above!</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm flex justify-between items-center group transition-all hover:border-slate-600"
            >
              <span className="text-slate-200">{item.text}</span>
              <button 
                onClick={() => handleDelete(item.id)}
                className="text-slate-500 hover:text-red-500 transition-colors px-2"
                title="Delete task"
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