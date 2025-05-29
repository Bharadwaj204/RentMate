"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Use next/navigation for App Router

export default function LoginPage() {
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Mock login logic
    console.log("Login submitted");
    // For scaffold, redirect to dashboard. In a real app, handle auth.
    router.push("/dashboard"); 
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/20 via-background to-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <Home className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Welcome Back!</CardTitle>
          <CardDescription>Log in to your HomeHarmony account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" required />
            </div>
            <Button type="submit" className="w-full">
              <LogIn className="mr-2 h-4 w-4" /> Login
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Link href="#" className="text-sm text-primary hover:underline text-center">
            Forgot your password?
          </Link>
          <p className="text-sm text-muted-foreground text-center">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
