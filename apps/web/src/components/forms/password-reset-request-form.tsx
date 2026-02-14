'use client'

import { z } from "zod";
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreatePasswordResetRequest } from "@/hooks/password/use-create-password-reset-request";

const schema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
})

type Inputs = z.infer<typeof schema>

export function PasswordResetRequestForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { createPasswordResetRequest, isBusy } = useCreatePasswordResetRequest({
    onSuccess: (email: string) => toast.success(`A password reset link has been sent to ${email}`),
    onError: () => toast.error('Something went wrong! Try again later!'),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<Inputs>({ resolver: zodResolver(schema) });

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    createPasswordResetRequest(data);
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                  {...register("email")}
                id="email"
                type="email"
                placeholder="hi@rawstack.io"
              />
              {errors.email && <span className="text-sm text-destructive">{errors.email.message}</span>}
            </div>
            <div className="grid gap-2 mt-2">
              <Button type="submit" className="w-full" disabled={isBusy || !isValid}>
                Reset Password
              </Button>
            </div>
          </div>
        </div>
      </form>
      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link href={"/login"} className="underline underline-offset-4">
          Login
        </Link>
      </div>
    </div>
  )
}
