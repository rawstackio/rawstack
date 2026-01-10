import { Button } from '@/components/ui/button.tsx';
import { SidebarTrigger } from '@/components/ui/sidebar.tsx';
import { MoonIcon, SunIcon } from 'lucide-react';
import { useApp } from '@/lib/context/app-context.tsx';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../ui/breadcrumb.tsx';
import { Separator } from '@/components/ui/separator.tsx';
import { Link } from 'react-router-dom';

interface Props {
  title?: string;
}

export function SiteHeader({ title }: Props) {
  const { theme, setTheme } = useApp();

  const toggleTheme = () => {
    if (theme === 'Dark') {
      setTheme('Light');
    } else {
      setTheme('Dark');
    }
  };

  return (
    <header className="md:mb-2 bg-sidebar flex h-(--header-height) shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink asChild>
                <Link to="/">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" className="hidden sm:flex" onClick={toggleTheme}>
            {theme === 'Dark' ? <MoonIcon /> : <SunIcon />}
          </Button>
        </div>
      </div>
    </header>
  );
}
