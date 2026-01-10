'use client'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link";
import {ComponentProps, useState} from "react";
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod";
import {useAuth} from "@/lib/context/auth-context";
import {useForm} from "react-hook-form";
import {ApiError} from "@/lib/api/exception/errors";
import Api from "@/lib/api/Api";
import UserModel from "@/lib/model/UserModel";
import { toast } from 'sonner';

const schema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .min(1, 'Password is required'),
  confirmPassword: z.string().min(1, 'Confirm Password is required')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords must match",
  path: ["confirmPassword"],
});

type Inputs = z.infer<typeof schema>

export function RegistrationForm({
  className,
  ...props
}: ComponentProps<"div">) {

  const [isBusy, setIsBusy] = useState(false);
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Inputs>({resolver: zodResolver(schema)})

  const onSubmit = async (data: Inputs) => {
    setIsBusy(true);
    try {
      const response = await Api.user.createUser({
        email: data.email.toLowerCase(),
        password: data.password,
      });

      const user = UserModel.createFromApiUser(response.data.item);
      await login(data, user);

      setIsBusy(false);
    } catch (e: unknown) {
      if (e instanceof ApiError && e.statusCode === 409) {
        setError('email', {
          type: 'custom',
          message: 'A user with this email already exists',
        });
      } else {
        toast.error('Something went wrong! Try again later!');
      }
      setIsBusy(false);
    }
  }


  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="hi@rawstack.io"
                {...register("email")}
              />
              {errors.email && <span className="text-sm text-destructive">{errors.email.message}</span>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="*********" {...register("password")} />
              {errors.password && <span className="text-sm text-destructive">{errors.password.message}</span>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input id="confirm-password" type="password" placeholder="*********" {...register("confirmPassword")} />
              {errors.confirmPassword && <span className="text-sm text-destructive">{errors.confirmPassword.message}</span>}
            </div>
            <div className="grid gap-2 mt-2">
              <Button type="submit" className="w-full" disabled={isBusy}>
                Register
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
