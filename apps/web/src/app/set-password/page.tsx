import { SetPasswordForm } from "@/components/forms/set-password-form";
import PageWrapper from "@/components/layout/page-wrapper";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { getServerUser } from "@/lib/api/server-api";
import { redirect } from "next/navigation";

export default async function SetPasswordPage() {
  const user = await getServerUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <PageWrapper>
      <div className={"px-6 py-2 text-sm opacity-70"}>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild={true}>
                <Link href={"/"}>Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Set Password</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className={"mx-auto w-full max-w-md px-6 py-6"}>
        <h1 className={"font-oswald text-3xl font-bold pb-2"}>Set Your Password</h1>
        <h2>Create your new password</h2>
        <div className={"pt-6"}>
          <SetPasswordForm />
        </div>
      </div>
    </PageWrapper>
  );
}
