import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import StudyPlanList from "@/components/StudyPlanList";

export default function StudyPlansPage() {
  return (
    <AppShell>
      <PageHeader
        title="Study Plans"
        subtitle="Manage your tasks and sync across all devices."
      />
      <StudyPlanList />
    </AppShell>
  );
}