import AppShell from "@/ThemeClient.tsx/AppShell"
import Button from "@/ThemeClient.tsx/Button"
import Input from "@/ThemeClient.tsx/Input"
import PageHeader from "@/ThemeClient.tsx/PageHeader"
import SectionCard from "@/ThemeClient.tsx/SectionCard"
import Select from "@/ThemeClient.tsx/Select"

const outputs = [
  "Mind Maps",
  "Summaries",
  "Paraphrasing",
  "Flashcards",
  "MCQs",
  "Q&A",
  "Explanations",
  "Translations",
  "PDF → Notes",
  "Image → Notes",
  "Audio → Notes",
  "Topic Revision Sheets"
]

export default function NoteX() {
  return (
    <AppShell>
      <PageHeader title="NoteX AI Bot" subtitle="AI notes, flashcards, summaries, and more." />
      <SectionCard title="Inputs" description="Text, voice typing, audio, image OCR, URL (web).">
        <div className="grid gap-3 md:grid-cols-2">
          <Input placeholder="Paste text" />
          <Input placeholder="Paste URL (web only)" />
          <Input placeholder="Upload audio (mock)" />
          <Input placeholder="Upload image (mock)" />
          <Button>Start Voice Typing</Button>
          <Button variant="secondary">Upload PDF</Button>
        </div>
      </SectionCard>
      <SectionCard title="Output Format" description="Choose how NoteX should respond.">
        <div className="grid gap-3 md:grid-cols-2">
          <Select>
            {outputs.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </Select>
          <Button>Generate</Button>
        </div>
      </SectionCard>
      <SectionCard title="Session Access" description="NoteX is available in the sidebar and sessions.">
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary">Launch in Sidebar</Button>
          <Button variant="secondary">Launch in Active Session</Button>
        </div>
      </SectionCard>
    </AppShell>
  )
}
