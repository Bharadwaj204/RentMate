"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getCurrentUser } from "@/lib/placeholder-data";
import type { Member } from "@/lib/types";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DEFAULT_AVATAR } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { Save, FileCsv, Bell, Palette, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";


export default function SettingsPage() {
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const { toast } = useToast();
  
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    setName(user.name);
    setEmail(user.email);
  }, []);

  const handleProfileUpdate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Mock update logic
    if (currentUser) {
      setCurrentUser({ ...currentUser, name, email });
      toast({ title: "Profile Updated", description: "Your profile information has been saved." });
    }
  };

  const handleExportData = () => {
    // Mock export logic
    console.log("Exporting all data (chores, expenses, household)...");
    toast({ title: "Data Export Initiated (Demo)", description: "Your data export will begin shortly (logged to console)." });
  };

  if (!currentUser) {
    return <div className="container mx-auto py-8">Loading settings...</div>;
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
          <CardDescription>Manage your personal information.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border">
                    <AvatarImage src={currentUser.avatarUrl || DEFAULT_AVATAR + `?text=${name.split(' ').map(n=>n[0]).join('')}`} alt={name} />
                    <AvatarFallback>{name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                </Avatar>
                <Button variant="outline" onClick={() => alert("Avatar upload not implemented.")}>Change Avatar</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>
            <div>
                <Label htmlFor="password">Change Password</Label>
                <Input id="password" type="password" placeholder="New Password" />
                <Input id="confirm-password" type="password" placeholder="Confirm New Password" className="mt-2"/>
            </div>
            <Button type="submit"><Save className="mr-2 h-4 w-4"/>Save Profile</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bell />Notifications</CardTitle>
          <CardDescription>Customize how you receive alerts and updates.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-md">
                <div>
                    <Label htmlFor="chore-reminders">Chore Reminders</Label>
                    <p className="text-xs text-muted-foreground">Get notified for upcoming or overdue chores.</p>
                </div>
                <Switch id="chore-reminders" defaultChecked />
            </div>
             <div className="flex items-center justify-between p-3 border rounded-md">
                <div>
                    <Label htmlFor="expense-updates">Expense Updates</Label>
                    <p className="text-xs text-muted-foreground">Receive alerts for new expenses or settlements.</p>
                </div>
                <Switch id="expense-updates" defaultChecked/>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Palette />Appearance</CardTitle>
          <CardDescription>Customize the look and feel of the application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
             <div className="flex items-center justify-between p-3 border rounded-md">
                <div>
                    <Label>Theme</Label>
                    <p className="text-xs text-muted-foreground">Switch between light, dark, or system theme.</p>
                </div>
                <ThemeToggle />
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileCsv />Data Management</CardTitle>
          <CardDescription>Export your household data.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleExportData}>
            <FileCsv className="mr-2 h-4 w-4" /> Export All Data (CSV - Demo)
          </Button>
           <p className="mt-2 text-sm text-muted-foreground">
            This will export chores, expenses, and household member information.
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldCheck />Account Security</CardTitle>
          <CardDescription>Manage your account security settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <Button variant="outline" onClick={()=>alert("Two-factor authentication setup not implemented.")}>Setup Two-Factor Authentication</Button>
           <Button variant="destructive" onClick={()=>alert("Account deletion not implemented.")}>Delete Account</Button>
           <p className="text-xs text-muted-foreground">Account deletion is permanent and cannot be undone.</p>
        </CardContent>
      </Card>

    </div>
  );
}
