import AppShell from "@/components/AppShell"
import Button from "@/components/Button"
import Input from "@/components/Input"
import PageHeader from "@/components/PageHeader"
import SectionCard from "@/components/SectionCard"
import Toggle from "@/components/Toggle"

export default function Blocker() {
  return (
    <AppShell>
      <PageHeader
        title="Blocker System"
        subtitle="Website, app, and session blocking with Beast and MicroStrict."
      />
      <SectionCard title="Windows / Mac Extension" description="Website blocker with detection.">
        <div className="grid gap-3 md:grid-cols-2">
          <Input placeholder="Add website to block" />
          <Button>Add Website</Button>
          <Toggle checked={true} onChange={() => {}} label="Timer Blocking" />
          <Toggle checked={false} onChange={() => {}} label="Beast Mode Lock" />
          <Toggle checked={false} onChange={() => {}} label="MicroStrict Lock (Supreme)" />
          <Toggle checked={true} onChange={() => {}} label="Incognito Detection" />
          <Toggle checked={true} onChange={() => {}} label="Tab-switch Detection" />
          <Toggle checked={true} onChange={() => {}} label="Uninstall Prevention" />
        </div>
      </SectionCard>
      <SectionCard title="Android App Blocker" description="Block selected apps with overlay.">
        <div className="grid gap-3 md:grid-cols-2">
          <Input placeholder="Search apps" />
          <Button>Update Block List</Button>
          <Toggle checked={true} onChange={() => {}} label="Timer" />
          <Toggle checked={true} onChange={() => {}} label="Overlay Force Close" />
          <Toggle checked={false} onChange={() => {}} label="Beast Mode" />
        </div>
      </SectionCard>
      <SectionCard title="iOS ScreenTime" description="Block categories and Safari URLs.">
        <div className="grid gap-3 md:grid-cols-2">
          <Input placeholder="Block category" />
          <Button>Apply ScreenTime Rules</Button>
          <Toggle checked={true} onChange={() => {}} label="Safari URL Blocking" />
          <Toggle checked={true} onChange={() => {}} label="Timer" />
        </div>
      </SectionCard>
      <SectionCard title="In-Session Blocking" description="Solo editable, group locked.">
        <div className="grid gap-3 md:grid-cols-2">
          <Toggle checked={true} onChange={() => {}} label="Solo: Editable" />
          <Toggle checked={true} onChange={() => {}} label="Group: Active (Not Editable)" />
        </div>
      </SectionCard>
    </AppShell>
  )
}
