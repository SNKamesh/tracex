"use client";

import { useEffect, useState, useRef } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc,
  orderBy,
  updateDoc,
} from "firebase/firestore";

interface Task {
  id: string;
  text: string;
  reminderTime?: string;
  completed?: boolean;
  createdAt?: any;
}

export default function StudyPlanList() {
  const [uid, setUid] = useState<string | null>(null);
  const [items, setItems] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [inputError, setInputError] = useState("");
  const [loading, setLoading] = useState(true);

  const timeInputRef = useRef<HTMLInputElement>(null);
  const notifiedTasks = useRef<Set<string>>(new Set());

  // ── Request notification permission ───────────────────────
  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // ── Auth listener ──────────────────────────────────────────
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) {
        setUid(user.uid);
      } else {
        setUid(null);
        setItems([]);
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  // ── Real-time Firestore listener (syncs phone + PC) ────────
  useEffect(() => {
    if (!uid) return;

    const q = query(
      collection(db, "users", uid, "studyPlans"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const taskData = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Task[];
      setItems(taskData);
      setLoading(false);
    });

    return () => unsub();
  }, [uid]);

  // ── Alarm / reminder engine ────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;

      items.forEach((task) => {
        if (
          task.reminderTime === currentTime &&
          !notifiedTasks.current.has(task.id)
        ) {
          if (Notification.permission === "granted") {
            new Notification("TraceX", {
              body: `Time to lock in: ${task.text}`,
              icon: "/favicon.ico",
            });
            notifiedTasks.current.add(task.id);
          }
        }
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [items]);

  // ── Add task ───────────────────────────────────────────────
  async function handleAddTask() {
    if (!newTask.trim()) {
      setInputError(
        "Whoops! Your mind went blank for a second. Type a task first! 👻"
      );
      return;
    }
    if (!uid) return;

    try {
      await addDoc(collection(db, "users", uid, "studyPlans"), {
        text: newTask.trim(),
        reminderTime: reminderTime || null,
        completed: false,
        createdAt: serverTimestamp(),
      });
      setNewTask("");
      setReminderTime("");
      setInputError("");
    } catch (error) {
      console.error("Error adding task:", error);
    }
  }

  // ── Toggle complete ────────────────────────────────────────
  async function toggleComplete(id: string, current: boolean) {
    if (!uid) return;
    try {
      await updateDoc(doc(db, "users", uid, "studyPlans", id), {
        completed: !current,
      });
    } catch (error) {
      console.error("Error updating task:", error);
    }
  }

  // ── Delete task ────────────────────────────────────────────
  async function handleDelete(id: string) {
    if (!uid) return;
    try {
      await deleteDoc(doc(db, "users", uid, "studyPlans", id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  }

  // ── UI ─────────────────────────────────────────────────────
  if (loading)
    return (
      <p className="text-slate-500 text-xs py-4 italic">
        Syncing with cloud...
      </p>
    );

  if (!uid)
    return (
      <p className="text-slate-400 text-sm py-4">
        Please sign in to view your study plan.
      </p>
    );

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
                style={{ colorScheme: "dark" }}
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

      {/* TASK LIST */}
      <div className="flex flex-col gap-2">
        {items.length === 0 ? (
          <p className="text-slate-500 text-sm italic py-2">
            No tasks yet. Add one above!
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className={`rounded-xl border px-4 py-3 text-sm flex justify-between items-center group transition-all hover:border-slate-700 ${
                item.completed
                  ? "bg-slate-900/20 border-slate-800/30"
                  : "bg-slate-900/40 border-slate-800/60 hover:bg-slate-900/60"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={item.completed || false}
                  onChange={() => toggleComplete(item.id, item.completed || false)}
                  className="w-4 h-4 accent-blue-500 cursor-pointer mt-0.5"
                />
                <div className="flex flex-col gap-1">
                  <span
                    className={`font-medium ${
                      item.completed
                        ? "line-through text-slate-500"
                        : "text-slate-200"
                    }`}
                  >
                    {item.text}
                  </span>
                  {item.reminderTime && (
                    <div className="flex items-center gap-1 text-blue-400 text-[11px] font-semibold">
                      <span className="text-xs">🔔</span>
                      <span>Remind at {item.reminderTime}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Delete button */}
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

      {/* Completed count */}
      {items.length > 0 && (
        <p className="text-slate-500 text-xs text-right">
          {items.filter((i) => i.completed).length} / {items.length} completed
        </p>
      )}
    </div>
  );
}