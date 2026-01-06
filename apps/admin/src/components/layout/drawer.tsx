import { useIsMobile } from '@/hooks/use-mobile.ts';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useApp } from '@/lib/context/app-context.tsx';
import { AccountForm } from '@/components/form/account-form.tsx';
import { XIcon } from 'lucide-react';
import { useAuth } from '@/lib/context/auth-context.tsx';

export const DashboardDrawer = () => {
  const isMobile = useIsMobile();
  const { drawerAction, setDrawerAction } = useApp();
  const { user } = useAuth();

  const getTitle = () => {
    if (!drawerAction) return '';

    switch (drawerAction.form) {
      case 'account':
        return `${drawerAction.entityId ? 'Edit' : 'Create'}${user.id === drawerAction.entityId ? ' Your' : ''} Account`;
      default:
        return drawerAction.entityId ? 'Edit' : 'Create';
    }
  };

  const closeDrawer = () => {
    setDrawerAction(undefined);
  };

  return (
    <Drawer direction={isMobile ? 'bottom' : 'right'} open={!!drawerAction}>
      <DrawerContent className={'border-l-rgb/10 dark:border-l-[rgba(125,125,125,0.05)]'}>
        <DrawerHeader className="p-0 bg-sidebar px-4 py-2 flex flex-row justify-between items-center">
          <Button variant="ghost" size="sm" onClick={closeDrawer}>
            <XIcon />
          </Button>
        </DrawerHeader>

        <div className="px-4 py-8">
          <DrawerTitle className={'pb-4'}>{getTitle()}</DrawerTitle>
          <AccountForm userId={drawerAction?.entityId ?? undefined} />
        </div>

        {/*
        <DrawerFooter>
          <Button>Submit</Button>
          <DrawerClose asChild>
            <Button variant="outline" onClick={toggleDrawer}>
              Done
            </Button>
          </DrawerClose>
        </DrawerFooter>*/}
      </DrawerContent>
    </Drawer>
  );
};
