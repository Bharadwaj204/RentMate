import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-primary/20 via-background to-background">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
          <Home className="w-8 h-8" />
          <span>HomeHarmony</span>
        </Link>
        <nav className="flex gap-2">
          <Button asChild variant="ghost">
            <Link href="/login">
              <LogIn className="mr-2 h-4 w-4" /> Login
            </Link>
          </Button>
          <Button asChild>
            <Link href="/signup">
             <UserPlus className="mr-2 h-4 w-4" /> Sign Up
            </Link>
          </Button>
        </nav>
      </header>

      <main className="flex-grow container mx-auto px-4 py-12 flex flex-col md:flex-row items-center justify-center gap-12">
        <div className="md:w-1/2 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Organize Your Shared Home, Effortlessly.
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            HomeHarmony helps roommates manage chores, track shared expenses, and stay on top of household tasks with a unified calendar. Say goodbye to bickering and confusion!
          </p>
          <div className="flex gap-4 justify-center md:justify-start">
            <Button size="lg" asChild>
              <Link href="/signup">Get Started for Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Login to Your Household</Link>
            </Button>
          </div>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <Image 
            src="https://placehold.co/500x400.png" 
            alt="Happy roommates organizing their home" 
            width={500} 
            height={400}
            data-ai-hint="teamwork home organization"
            className="rounded-xl shadow-2xl"
          />
        </div>
      </main>

      <section className="py-16 bg-background/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-10">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><LogIn className="text-primary"/> Household Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Create or join households, manage members, and assign roles.</CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><UserPlus className="text-primary"/> Chore & Expense Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Schedule rotating chores, log shared expenses, and see who owes what.</CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Home className="text-primary"/> Unified Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>View all chores and expense deadlines in one convenient place.</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <footer className="py-8 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} HomeHarmony. Live in peace.</p>
      </footer>
    </div>
  );
}
