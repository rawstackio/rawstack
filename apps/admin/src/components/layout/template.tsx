import * as React from 'react';
import { AppSidebar } from '@/components/layout/app-sidebar.tsx';
import { SidebarInset, SidebarInsetContent, SidebarProvider } from '@/components/ui/sidebar.tsx';
import { SiteHeader } from '@/components/layout/site-header.tsx';
import { DashboardDrawer } from '@/components/layout/drawer.tsx';

interface Props {
  title?: string;
  children: React.ReactNode;
}

const Template = ({ children, title }: Props) => {
  return (
    <SidebarProvider>
      {/* Dashboard provider...  */}
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={title} />
        <div className="flex flex-1 flex-col">
          <SidebarInsetContent>{children}</SidebarInsetContent>
        </div>
      </SidebarInset>
      <DashboardDrawer />
    </SidebarProvider>
  );
};

export default Template;
