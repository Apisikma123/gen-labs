import { StudentDashboard } from '@/components/home/student-dashboard';

export const metadata = {
  title: 'Beranda Laboratorium — GEN LABS',
  description: 'Ruang belajar interaktif GEN LABS: Cari konsep sains, eksplorasi simulasi, dan telaah telemetri.',
};

export default function AppHomePage() {
  return <StudentDashboard />;
}
