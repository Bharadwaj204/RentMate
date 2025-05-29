"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MOCK_HOUSEHOLD, getCurrentUser } from "@/lib/placeholder-data";
import type { Household, Member } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DEFAULT_AVATAR } from '@/lib/constants';
import { Copy, Trash2, UserPlus, CheckCircle, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export default function HouseholdPage() {
  const [household, setHousehold] = useState<Household | null>(null);
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const { toast } = useToast();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newHouseholdName, setNewHouseholdName] = useState("");


  useEffect(() => {
    setHousehold(MOCK_HOUSEHOLD);
    const user = getCurrentUser();
    setCurrentUser(user);
    setNewHouseholdName(MOCK_HOUSEHOLD.name);
  }, []);

  const copyInviteCode = () => {
    if (household?.inviteCode) {
      navigator.clipboard.writeText(household.inviteCode);
      toast({ title: "Invite Code Copied!", description: "The invite code has been copied to your clipboard." });
    }
  };
  
  const handleHouseholdNameChange = () => {
    if (household && newHouseholdName.trim() !== "") {
      setHousehold({ ...household, name: newHouseholdName.trim() });
      setIsEditingName(false);
      toast({ title: "Household Name Updated", description: `Name changed to ${newHouseholdName.trim()}` });
    }
  };

  const removeMember = (memberId: string) => {
    if (currentUser?.role !== 'Owner' || memberId === currentUser?.id) {
        toast({title: "Action Denied", description: "Only owners can remove other members.", variant: "destructive"});
        return;
    }
    // Mock removal
    setHousehold(prev => prev ? ({ ...prev, members: prev.members.filter(m => m.id !== memberId) }) : null);
    toast({ title: "Member Removed", description: `Member has been removed from the household.` });
  };

  if (!household || !currentUser) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Household Management</h1>
        <p>Loading household data...</p>
      </div>
    );
  }

  const isOwner = currentUser.role === 'Owner';

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Household Management</h1>
         {isOwner && (
          <Button variant="outline" onClick={() => alert("Adding new member not implemented in demo.")}>
            <UserPlus className="mr-2 h-4 w-4" /> Invite Member
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                {isEditingName ? (
                   <div className="flex items-center gap-2">
                     <Input 
                       value={newHouseholdName} 
                       onChange={(e) => setNewHouseholdName(e.target.value)}
                       className="text-2xl font-semibold"
                      />
                      <Button size="icon" onClick={handleHouseholdNameChange}><CheckCircle className="h-5 w-5"/></Button>
                   </div>
                ) : (
                  <CardTitle className="text-2xl font-semibold flex items-center gap-2">
                    {household.name}
                    {isOwner && <Button variant="ghost" size="icon" onClick={() => setIsEditingName(true)}><Edit className="h-4 w-4"/></Button>}
                  </CardTitle>
                )}
                <CardDescription>Manage your household members and settings.</CardDescription>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Invite Code</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-mono p-1 bg-muted rounded">{household.inviteCode}</span>
                  <Button variant="outline" size="icon" onClick={copyInviteCode} aria-label="Copy invite code">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <h3 className="text-xl font-semibold mb-4">Members ({household.members.length})</h3>
            <ul className="space-y-4">
              {household.members.map(member => (
                <li key={member.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg shadow-sm">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={member.avatarUrl || DEFAULT_AVATAR + `?text=${member.name.split(' ').map(n=>n[0]).join('')}`} alt={member.name} />
                      <AvatarFallback>{member.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.name} {member.id === currentUser.id && "(You)"}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={member.role === 'Owner' ? 'default' : 'secondary'}>{member.role}</Badge>
                    {isOwner && member.id !== currentUser.id && (
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => removeMember(member.id)} aria-label={`Remove ${member.name}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Household</CardTitle>
              <CardDescription>Start a new household (not implemented in demo).</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <Label htmlFor="new-household-name">Household Name</Label>
                  <Input id="new-household-name" placeholder="e.g., The Fun House" disabled />
                </div>
                <Button className="w-full" disabled>Create Household</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Join Existing Household</CardTitle>
              <CardDescription>Enter an invite code to join (not implemented in demo).</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <Label htmlFor="join-invite-code">Invite Code</Label>
                  <Input id="join-invite-code" placeholder="Enter code" disabled/>
                </div>
                <Button className="w-full" disabled>Join Household</Button>
              </form>
            </CardContent>
          </Card>
           <Card>
              <CardHeader>
                <CardTitle className="text-destructive">Leave Household</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" className="w-full" onClick={() => alert("Leaving household not implemented.")} disabled={isOwner && household.members.length > 1}>
                  Leave Current Household
                </Button>
                {isOwner && household.members.length > 1 && <p className="text-xs text-destructive mt-2">Owners must transfer ownership or be the last member to leave.</p>}
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
