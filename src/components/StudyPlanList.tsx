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

// ─── 1. DEFINE WHAT A TASK LOOKS LIKE ───────────────────────────────
// This fixes the "Property id does not exist on type never" error
interface Task {
  id: string;
  text: string;
  userId: string;
  createdAt?: any;
}

export default function StudyPlanList() {
  const [items, setItems] = useState<Task[]>([]); // Added <Task[]> here
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);

  // ─── 2. LISTEN TO YOUR DATABASE (Real-time) ────────────────────────
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "tasks"), 
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
      
      // Sort by newest first
      setItems(taskData.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ─── 3. ADD A NEW TASK TO CLOUD ───────────────────────────────────
  async function handleAddTask() {
    if (!newTask.trim()) return;
    const user = auth.currentUser;
    if (!user) return;

    try {
      await addDoc(collection(db, "tasks"), {
        text: newTask,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
      setNewTask(""); // Clear input after adding
    } catch (error) {
      console.error("Error adding task:", error);
    }
  }

  if (loading) return <p className="text-slate-500 text-xs">Loading plans...</p>;

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
              className="rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm flex justify-between items-center group"
            >
              <span className="text-slate-200">{item.text}</span>
              {/* Optional: You can add a delete button here later */}
            </div>
          ))
        )}
      </div>
    </div>
  );
}