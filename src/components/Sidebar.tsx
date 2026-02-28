export default function Sidebar() {
  return (
    <aside className="w-60 bg-slate-900 border-r border-slate-700 p-6">
      <nav className="flex flex-col gap-4">
        <a href="/">Home</a>
        <a href="/dashboard">Dashboard</a>
        <a href="/study">Study Sessions</a>
        <a href="/plans">Study Plans</a>
        <a href="/friends">Friends</a>
        <a href="/converter">File Converter</a>
        <a href="/notex">NoteX Bot</a>
        <a href="/activity">Activity</a>
        <a href="/settings">Settings</a>
        <a href="/trash">Trash</a>
      </nav>
    </aside>
  );
}