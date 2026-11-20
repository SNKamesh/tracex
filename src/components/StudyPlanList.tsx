"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, BellOff, Clock, Flag, GripVertical, Plus, Trash2 } from "lucide-react";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { auth, db } from "@/lib/firebase";
import {
  addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query,
  serverTimestamp, updateDoc, writeBatch
} from "firebase/firestore";

interface Task {
  id: string;
  text: string;
  priority?: "low" | "medium" | "high";
  reminderTime?: string;
  reminderAt?: number | null;
  displayTime?: string;
  completed?: boolean;
  order?: number;
}

type PermissionState = NotificationPermission | "unsupported" | "checking";

function nextReminderTimestamp(time: string): number | null {
  const parts = time.split(":").map(Number);
  if (parts.length !== 2 || parts.some((value) => !Number.isFinite(value))) return null;
  const [hours, minutes] = parts;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

  const reminder = new Date();
  reminder.setHours(hours, minutes, 0, 0);
  // A time selected in the past is treated as tomorrow, not silently missed.
  if (reminder.getTime() <= Date.now() + 15_000) reminder.setDate(reminder.getDate() + 1);
  return reminder.getTime();
}

function formatClockTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date);
}

function SortableTask({
  task,
  remove,
  toggle,
}: {
  task: Task;
  remove: (id: string) => void;
  toggle: (task: Task) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
      className="flex items-center justify-between gap-3 rounded-xl p-3 sm:p-4"
    >
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={"Reorder " + task.text}
          className="shrink-0 rounded-md p-1.5 opacity-60 hover:opacity-100"
          style={{ color: "var(--muted)", touchAction: "none" }}
        >
          <GripVertical size={17} />
        </button>
        <input
          type="checkbox"
          checked={Boolean(task.completed)}
          onChange={() => toggle(task)}
          aria-label={"Mark " + task.text + (task.completed ? " incomplete" : " complete")}
          className="h-4 w-4 shrink-0 accent-[var(--primary)]"
        />
        <div className="min-w-0">
          <p className={task.completed ? "break-words text-sm line-through opacity-50" : "break-words text-sm font-semibold"}>
            {task.text}
          </p>
          <small className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]" style={{ color: "var(--muted)" }}>
            <span className="inline-flex items-center gap-1"><Flag size={11} />{task.priority || "medium"} priority</span>
            <span aria-hidden="true">·</span>
            <span>{task.displayTime || "No reminder"}</span>
          </small>
        </div>
      </div>
      <button
        type="button"
        onClick={() => remove(task.id)}
        aria-label={"Delete " + task.text}
        className="shrink-0 rounded-lg p-2 transition-colors hover:bg-[var(--surface-hover)]"
        style={{ color: "var(--muted)" }}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

export default function StudyPlanList() {
  const [uid, setUid] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [items, setItems] = useState<Task[]>([]);
  const [task, setTask] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [clockOpen, setClockOpen] = useState(false);
  const [clockTime, setClockTime] = useState("18:00");
  const [savedTime, setSavedTime] = useState("");
  const [displayTime, setDisplayTime] = useState("");
  const [notificationPermission, setNotificationPermission] = useState<PermissionState>("checking");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    return auth.onAuthStateChanged((user) => {
      setUid(user?.uid ?? null);
      setAuthReady(true);
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setNotificationPermission("unsupported");
      return;
    }
    setNotificationPermission(Notification.permission);
  }, []);

  useEffect(() => {
    if (!uid) {
      setItems([]);
      return;
    }
    return onSnapshot(
      query(collection(db, "users", uid, "studyPlans"), orderBy("order")),
      (snapshot) => {
        const nextItems = snapshot.docs.map((document) => {
          const data = document.data() as Omit<Task, "id">;
          const legacyReminderAt = !data.reminderAt && data.reminderTime
            ? nextReminderTimestamp(data.reminderTime)
            : null;
          return {
            id: document.id,
            ...data,
            reminderAt: typeof data.reminderAt === "number" ? data.reminderAt : legacyReminderAt,
          } as Task;
        });
        setItems(nextItems);
        setError("");
      },
      (syncError) => {
        console.error("Study plan sync failed", syncError);
        setError("Your study plan could not sync. Check your connection and Firestore access.");
      }
    );
  }, [uid]);

  useEffect(() => {
    if (!uid) {
      notifiedRef.current = new Set();
      return;
    }
    try {
      const stored = JSON.parse(localStorage.getItem("tracex:reminders-sent:" + uid) || "[]");
      notifiedRef.current = new Set(Array.isArray(stored) ? stored.filter((value: unknown) => typeof value === "string") : []);
    } catch {
      notifiedRef.current = new Set();
    }
  }, [uid]);

  useEffect(() => {
    if (!uid) return;

    const checkReminders = () => {
      const now = Date.now();
      items.forEach((item) => {
        const dueAt = item.reminderAt;
        if (item.completed || typeof dueAt !== "number" || dueAt > now || now - dueAt > 12 * 60 * 60 * 1000) return;

        const reminderKey = item.id + ":" + dueAt;
        if (notifiedRef.current.has(reminderKey)) return;

        notifiedRef.current.add(reminderKey);
        try {
          const recent = Array.from(notifiedRef.current).slice(-100);
          localStorage.setItem("tracex:reminders-sent:" + uid, JSON.stringify(recent));
        } catch {
          // The in-memory guard still prevents repeated alerts for this open tab.
        }

        if ("Notification" in window && Notification.permission === "granted") {
          const notification = new Notification("TraceX study reminder", {
            body: item.text + " is scheduled now.",
            tag: "tracex-study-" + item.id,
          });
          notification.onclick = () => {
            window.focus();
            notification.close();
          };
          setNotice("Reminder sent for: " + item.text);
        } else {
          setNotice("A reminder is due, but browser notifications are not allowed. Enable them below or in your browser's site settings.");
        }

        const alarm = new Audio("/alarm.mp3");
        void alarm.play().catch(() => undefined);
      });
    };

    checkReminders();
    const interval = window.setInterval(checkReminders, 10_000);
    document.addEventListener("visibilitychange", checkReminders);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", checkReminders);
    };
  }, [items, uid]);

  async function enableNotifications() {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setNotificationPermission("unsupported");
      setNotice("This browser does not support desktop notifications.");
      return;
    }
    if (Notification.permission === "denied") {
      setNotificationPermission("denied");
      setNotice("Notifications are blocked for TraceX. Change this site's permission using your browser's address-bar/site settings.");
      return;
    }
    try {
      const permission = Notification.permission === "default"
        ? await Notification.requestPermission()
        : Notification.permission;
      setNotificationPermission(permission);
      setNotice(permission === "granted"
        ? "Notifications enabled. Keep a TraceX tab open for scheduled reminders."
        : "Notification permission was not granted.");
    } catch {
      setNotice("Could not request notification permission. Check your browser's site settings.");
    }
  }

  async function addTask() {
    if (saving) return;
    if (!authReady) {
      setError("Connecting to your account. Please try again in a moment.");
      return;
    }
    if (!uid) {
      setError("Please sign in again before adding a study task.");
      return;
    }
    const trimmedTask = task.trim();
    if (!trimmedTask) {
      setError("Enter a task name before adding it.");
      return;
    }

    // requestPermission runs directly from the Add Task interaction, not automatically on page load.
    let permission: PermissionState = notificationPermission;
    if (savedTime && typeof window !== "undefined" && "Notification" in window) {
      permission = Notification.permission;
      if (permission === "default") {
        try {
          permission = await Notification.requestPermission();
        } catch {
          permission = "denied";
        }
        setNotificationPermission(permission);
      }
    }

    const reminderAt = savedTime ? nextReminderTimestamp(savedTime) : null;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await addDoc(collection(db, "users", uid, "studyPlans"), {
        text: trimmedTask,
        priority,
        reminderTime: savedTime || "",
        reminderAt,
        displayTime: displayTime || "",
        completed: false,
        order: Date.now(),
        createdAt: serverTimestamp(),
      });

      setTask("");
      setSavedTime("");
      setDisplayTime("");
      setError("");
      if (reminderAt && permission !== "granted") {
        setNotice("Task saved, but notifications are not enabled. Use Enable notifications or your browser's site settings.");
      } else {
        setNotice(reminderAt ? "Task and reminder saved." : "Task added to your study plan.");
      }
    } catch (writeError) {
      console.error("Could not add study task", writeError);
      setError("Could not save this task. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  async function toggle(taskToToggle: Task) {
    if (!uid) return;
    try {
      await updateDoc(doc(db, "users", uid, "studyPlans", taskToToggle.id), {
        completed: !taskToToggle.completed,
      });
    } catch (writeError) {
      console.error("Could not update study task", writeError);
      setError("Could not update this task. Please try again.");
    }
  }

  async function remove(id: string) {
    if (!uid) return;
    try {
      await deleteDoc(doc(db, "users", uid, "studyPlans", id));
      setNotice("Task removed.");
    } catch (writeError) {
      console.error("Could not remove study task", writeError);
      setError("Could not remove this task. Please try again.");
    }
  }

  async function dragEnd(event: DragEndEvent) {
    if (!event.over || event.active.id === event.over.id) return;
    const oldIndex = items.findIndex((item) => item.id === event.active.id);
    const newIndex = items.findIndex((item) => item.id === event.over?.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const moved = arrayMove(items, oldIndex, newIndex);
    setItems(moved);
    if (!uid) return;

    try {
      const batch = writeBatch(db);
      moved.forEach((item, index) => {
        batch.update(doc(db, "users", uid, "studyPlans", item.id), { order: index });
      });
      await batch.commit();
    } catch (writeError) {
      console.error("Could not reorder study tasks", writeError);
      setError("Your task order could not be saved. It will return to the last synced order.");
    }
  }

  function saveClock() {
    setSavedTime(clockTime);
    setDisplayTime(formatClockTime(clockTime));
    setClockOpen(false);
    setNotice("Reminder set for " + formatClockTime(clockTime) + ". If that time has passed today, it will be scheduled for tomorrow.");
  }

  function clearClock() {
    setSavedTime("");
    setDisplayTime("");
    setClockOpen(false);
  }

  const permissionMessage = notificationPermission === "granted"
    ? "Browser notifications are allowed."
    : notificationPermission === "denied"
      ? "Notifications are blocked in browser settings."
      : notificationPermission === "unsupported"
        ? "This browser does not support notifications."
        : "Enable browser notifications to receive study reminders.";

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={(event) => { event.preventDefault(); void addTask(); }}>
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={task}
            onChange={(event) => { setTask(event.target.value); if (error) setError(""); }}
            placeholder="Create focus mission..."
            aria-label="Study task name"
            className="h-12 min-w-[220px] flex-[1_1_320px] rounded-xl border px-4 text-sm outline-none"
            style={{ background: "var(--surface-solid)", color: "var(--text)", borderColor: "var(--border)" }}
          />
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value as "low" | "medium" | "high")}
            aria-label="Task priority"
            className="h-12 min-w-[150px] flex-[0_1_175px] rounded-xl border px-4 text-sm"
            style={{ background: "var(--surface-solid)", color: "var(--text)", borderColor: "var(--border)" }}
          >
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
          <button
            type="button"
            onClick={() => setClockOpen(true)}
            className="inline-flex h-12 min-w-[136px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl border px-4 text-sm font-semibold transition-colors hover:bg-[var(--surface-hover)]"
            style={{ background: "var(--surface)", color: "var(--text)", borderColor: "var(--border)" }}
          >
            <Clock size={17} />
            {displayTime || "Set reminder"}
          </button>
          <button
            type="submit"
            disabled={saving || !authReady || !uid}
            className="inline-flex h-12 min-w-[110px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 text-sm font-semibold text-white transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: "var(--primary)" }}
          >
            {saving ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />Saving</> : <><Plus size={16} />Add task</>}
          </button>
        </div>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2.5" style={{ borderColor: "var(--border)", background: "var(--background-soft)" }}>
        <p className="flex min-w-0 items-center gap-2 text-[11px]" style={{ color: "var(--muted)" }}>
          {notificationPermission === "granted" ? <Bell size={14} /> : <BellOff size={14} />}
          <span>{permissionMessage} Keep TraceX open in a tab for scheduled reminders.</span>
        </p>
        {notificationPermission !== "granted" && (
          <button type="button" onClick={() => void enableNotifications()} className="shrink-0 text-[11px] font-semibold hover:underline" style={{ color: "var(--primary)" }}>
            Enable notifications
          </button>
        )}
      </div>

      {error && <p role="alert" className="text-xs font-medium" style={{ color: "var(--danger)" }}>{error}</p>}
      {notice && <p role="status" aria-live="polite" className="text-xs" style={{ color: "var(--success)" }}>{notice}</p>}
      {!authReady && <p className="text-xs" style={{ color: "var(--muted)" }}>Connecting to your study plan…</p>}

      {clockOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setClockOpen(false); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="study-reminder-title" className="w-full max-w-sm rounded-2xl border p-5 shadow-2xl sm:p-6" style={{ background: "var(--surface-solid)", borderColor: "var(--border)", color: "var(--text)" }}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 id="study-reminder-title" className="text-base font-semibold">Set a reminder</h2>
                <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>Choose when TraceX should remind you about this task.</p>
              </div>
              <button type="button" onClick={() => setClockOpen(false)} aria-label="Close reminder dialog" className="rounded-lg p-2 hover:bg-[var(--surface-hover)]">×</button>
            </div>
            <label className="mb-2 block text-xs font-semibold" htmlFor="study-reminder-time">Reminder time</label>
            <input
              id="study-reminder-time"
              type="time"
              value={clockTime}
              onChange={(event) => setClockTime(event.target.value)}
              className="h-12 w-full rounded-xl border px-3 text-base"
              style={{ background: "var(--surface)", color: "var(--text)", borderColor: "var(--border)" }}
            />
            <p className="mt-2 text-[11px]" style={{ color: "var(--muted)" }}>A time that has already passed today will be scheduled for tomorrow.</p>
            <div className="mt-5 flex flex-wrap justify-between gap-2">
              <button type="button" onClick={clearClock} className="rounded-lg px-3 py-2 text-xs font-semibold hover:bg-[var(--surface-hover)]" style={{ color: "var(--muted)" }}>Clear reminder</button>
              <div className="flex gap-2">
                <button type="button" onClick={() => setClockOpen(false)} className="rounded-lg border px-4 py-2 text-xs font-semibold" style={{ borderColor: "var(--border)" }}>Cancel</button>
                <button type="button" onClick={saveClock} className="rounded-lg px-4 py-2 text-xs font-semibold text-white" style={{ background: "var(--primary)" }}>Save reminder</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <DndContext collisionDetection={closestCenter} onDragEnd={dragEnd}>
        <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <SortableTask key={item.id} task={item} remove={remove} toggle={toggle} />
            ))}
            {authReady && uid && items.length === 0 && (
              <div className="rounded-xl border px-4 py-8 text-center" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                <p className="text-sm font-semibold">No tasks yet</p>
                <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>Add a task above to start building your study plan.</p>
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
