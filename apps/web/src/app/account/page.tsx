import PageWrapper from '@/components/layout/page-wrapper';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import Link from 'next/link';
import { AccountForm } from '@/components/forms/account-form';
import { getServerUser } from '@/lib/api/server-api';
import { redirect } from 'next/navigation';

export default async function AccountPage() {
  const user = await getServerUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <PageWrapper>
      <div className={'px-6 py-2 text-sm opacity-70'}>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild={true}>
                <Link href={'/'}>Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Account</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className={'mx-auto w-full max-w-md px-6 py-6'}>
        <h1 className={'font-oswald text-3xl font-bold pb-2'}>Account Settings</h1>
        <h2>Manage your account settings and set e-mail preferences.</h2>
        <div className={'pt-6'}>
          <AccountForm user={user} />
        </div>
      </div>
    </PageWrapper>
  );
}
