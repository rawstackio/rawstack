"use client"

import { useAuth } from "@/lib/context/auth-context";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/logo";

const AuthPageWrapper = ({ children, title, skipRedirect }: { children: React.ReactNode; title?: string; skipRedirect?: boolean }) => {
    const {user} = useAuth();
    const router = useRouter()

    useEffect(() => {
        if (user && !skipRedirect) {
            router.push("/");
        }
    }, [router, user, skipRedirect]);


    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col items-center gap-2">
                        <Logo />
                        {title && <h1 className="text-xl font-bold">{title}</h1>}
                    </div>
                    <div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AuthPageWrapper
