"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Logo } from "@/components/icons/logo"
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { LoaderCircle } from "lucide-react";
import { loginSchema, type LoginFormData } from "@/lib/validations";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [isFormLoading, setIsFormLoading] = useState(false);
  const { user, signIn, signInWithGoogle, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && user) {
      const redirectPath = new URLSearchParams(window.location.search).get('redirect') || '/dashboard';
      router.push(redirectPath);
    }
  }, [user, authLoading, router]);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsFormLoading(true);
    
    try {
      await signIn(data.email, data.password);
      // No longer need router.push here, useEffect will handle it
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to sign in",
      });
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsFormLoading(true);
    
    try {
      await signInWithGoogle();
      // No longer need router.push here, useEffect will handle it
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to sign in with Google",
      });
    } finally {
      setIsFormLoading(false);
    }
  };

  if (authLoading || (!authLoading && user)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Configuration Error</AlertTitle>
          <AlertDescription>
            Firebase configuration is missing. The application cannot connect to Firebase because the required environment variables are not loaded. Please ensure your `.env` file is correctly set up with `NEXT_PUBLIC_` prefixes.
          </AlertDescription>
        </Alert>
      </div>
    )
  }
  
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="hidden bg-muted lg:flex lg:items-center lg:justify-center p-8">
        <div className="w-full max-w-md text-center">
            <Logo className="mx-auto h-24 w-24 text-primary" />
            <h1 className="mt-6 text-4xl font-headline font-bold text-primary">Kite</h1>
            <p className="mt-4 text-muted-foreground font-body text-lg">
                The all-in-one platform for professional services.
            </p>
        </div>
      </div>
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold font-headline">Login</h1>
            <p className="text-balance text-muted-foreground">
              Enter your email below to login to your account
            </p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="m@example.com"
                        disabled={isFormLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center">
                      <FormLabel>Password</FormLabel>
                      <a
                        href="#"
                        className="ml-auto inline-block text-sm underline"
                      >
                        Forgot your password?
                      </a>
                    </div>
                    <FormControl>
                      <Input 
                        type="password" 
                        disabled={isFormLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isFormLoading}>
                {isFormLoading ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </Form>
          
          <Button 
            type="button" 
            variant="outline" 
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isFormLoading}
          >
            {isFormLoading ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              "Login with Google"
            )}
          </Button>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
