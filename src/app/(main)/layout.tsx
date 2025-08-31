import MainLayout from '@/components/layout/main-layout';
import { AppProvider } from '@/contexts/app-context';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <MainLayout>{children}</MainLayout>
    </AppProvider>
  );
}
