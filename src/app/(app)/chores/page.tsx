"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { CHORE_FREQUENCIES } from "@/lib/constants";
import { MOCK_CHORES, MOCK_MEMBERS, getCurrentUser } from "@/lib/placeholder-data";
import type { Chore, ChoreFrequency, Member } from "@/lib/types";
import { addDays, format, parseISO } from "date-fns";
import { PlusCircle, Trash2, Edit3, Sparkles, History, ListChecks } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { suggestChoreSchedule, ChoreSuggestionInput, ChoreSuggestionOutput } from '@/ai/flows/chore-suggestion'; // Assuming AI flow can be called from client for now

export default function ChoresPage() {
  const [chores, setChores] = useState<Chore[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const { toast } = useToast();

  // AI Suggestion state
  const [aiChoreInput, setAiChoreInput] = useState<ChoreSuggestionInput>({ roommatePreferences: [], unassignedChores: [] });
  const [aiChoreSuggestion, setAiChoreSuggestion] = useState<ChoreSuggestionOutput | null>(null);
  const [isAISuggesting, setIsAISuggesting] = useState(false);
  
  useEffect(() => {
    setChores(MOCK_CHORES);
    setMembers(MOCK_MEMBERS);
    setCurrentUser(getCurrentUser());
    // Initialize AI input based on current data
    setAiChoreInput({
      roommatePreferences: MOCK_MEMBERS.map(m => ({ roommateId: m.id, preferredChores: [], availableDays: ["Monday", "Wednesday", "Friday"] })),
      unassignedChores: MOCK_CHORES.filter(c => !c.completed && !c.assignedTo).map(c => c.name)
    });
  }, []);

  const handleAddChore = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newChore: Chore = {
      id: `chore-${Date.now()}`,
      name: formData.get("name") as string,
      description: formData.get("description") as string || undefined,
      frequency: formData.get("frequency") as ChoreFrequency,
      assignedTo: formData.get("assignedTo") as string || undefined,
      dueDate: formData.get("dueDate") ? parseISO(formData.get("dueDate") as string) : addDays(new Date(), 7),
      completed: false,
      createdAt: new Date(),
      householdId: "household1", // Assuming a single household for now
    };
    setChores(prev => [newChore, ...prev]);
    toast({ title: "Chore Added", description: `${newChore.name} has been added.` });
    event.currentTarget.reset();
  };

  const toggleChoreCompletion = (choreId: string) => {
    setChores(prevChores =>
      prevChores.map(chore =>
        chore.id === choreId
          ? { ...chore, completed: !chore.completed, completedBy: !chore.completed ? currentUser?.id : undefined, completedAt: !chore.completed ? new Date() : undefined }
          : chore
      )
    );
    const chore = chores.find(c => c.id === choreId);
    if (chore) {
      toast({ title: `Chore ${chore.completed ? 'Unmarked' : 'Completed'}`, description: `${chore.name} status updated.` });
    }
  };

  const handleGetAISuggestions = async () => {
    if(!aiChoreInput.unassignedChores.length){
      toast({title: "No chores to assign", description: "Please add unassigned chores or mark some as incomplete.", variant: "destructive"});
      return;
    }
    setIsAISuggesting(true);
    try {
      // In a real app, this would be a server action calling the AI flow.
      // For now, simulate or directly call if client-side execution is allowed (not typical for Genkit flows).
      // const suggestion = await suggestChoreSchedule(aiChoreInput); 
      
      // Mocking AI response for now
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      const mockSuggestion: ChoreSuggestionOutput = {
        suggestedSchedule: aiChoreInput.unassignedChores.reduce((acc, choreName, index) => {
          acc[choreName] = aiChoreInput.roommatePreferences[index % aiChoreInput.roommatePreferences.length]?.roommateId || "unassigned";
          return acc;
        }, {} as Record<string, string>),
        reasoning: "This is a mock suggestion based on round-robin assignment."
      };
      setAiChoreSuggestion(mockSuggestion);
      toast({ title: "AI Suggestions Ready", description: "Chore schedule suggestions have been generated." });
    } catch (error) {
      console.error("AI Suggestion Error:", error);
      toast({ title: "AI Suggestion Failed", description: "Could not generate chore suggestions.", variant: "destructive" });
    } finally {
      setIsAISuggesting(false);
    }
  };

  const upcomingChores = chores.filter(chore => !chore.completed && chore.dueDate && chore.dueDate >= new Date()).sort((a,b) => (a.dueDate?.getTime() || 0) - (b.dueDate?.getTime() || 0));
  const pastDueChores = chores.filter(chore => !chore.completed && chore.dueDate && chore.dueDate < new Date()).sort((a,b) => (a.dueDate?.getTime() || 0) - (b.dueDate?.getTime() || 0));
  const completedChores = chores.filter(chore => chore.completed).sort((a,b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0));


  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Chore Management</h1>
      <Tabs defaultValue="current">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
          <TabsTrigger value="current" className="flex items-center gap-2"><ListChecks />Current Chores</TabsTrigger>
          <TabsTrigger value="add" className="flex items-center gap-2"><PlusCircle />Add Chore</TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2"><History />Chore History</TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2"><Sparkles />AI Suggestions</TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Chores</CardTitle>
              <CardDescription>Chores that are due soon or assigned.</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingChores.length === 0 && <p className="text-muted-foreground">No upcoming chores. Great job, or time to add some!</p>}
              <div className="space-y-4">
                {upcomingChores.map(chore => (
                  <Card key={chore.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Checkbox
                        id={`chore-${chore.id}`}
                        checked={chore.completed}
                        onCheckedChange={() => toggleChoreCompletion(chore.id)}
                        aria-label={`Mark ${chore.name} as ${chore.completed ? 'incomplete' : 'complete'}`}
                      />
                      <div>
                        <Label htmlFor={`chore-${chore.id}`} className={cn("text-lg", chore.completed && "line-through text-muted-foreground")}>{chore.name}</Label>
                        <p className="text-sm text-muted-foreground">
                          {chore.description ? `${chore.description.substring(0,50)}... ` : ''}
                          Due: {chore.dueDate ? format(chore.dueDate, "MMM dd, yyyy") : "N/A"}
                          {chore.assignedTo && ` | Assigned to: ${members.find(m => m.id === chore.assignedTo)?.name || 'Unknown'}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" disabled><Edit3 className="h-4 w-4"/></Button>
                        <Button variant="outline" size="icon" disabled><Trash2 className="h-4 w-4"/></Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
          {pastDueChores.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-destructive">Past Due Chores</CardTitle>
              </CardHeader>
              <CardContent>
              <div className="space-y-4">
                {pastDueChores.map(chore => (
                  <Card key={chore.id} className="p-4 flex items-center justify-between border-destructive">
                    <div className="flex items-center gap-4">
                      <Checkbox
                        id={`chore-${chore.id}`}
                        checked={chore.completed}
                        onCheckedChange={() => toggleChoreCompletion(chore.id)}
                        aria-label={`Mark ${chore.name} as ${chore.completed ? 'incomplete' : 'complete'}`}
                      />
                      <div>
                        <Label htmlFor={`chore-${chore.id}`} className={cn("text-lg text-destructive", chore.completed && "line-through text-muted-foreground")}>{chore.name}</Label>
                        <p className="text-sm text-muted-foreground">
                          Due: {chore.dueDate ? format(chore.dueDate, "MMM dd, yyyy") : "N/A"}
                          {chore.assignedTo && ` | Assigned to: ${members.find(m => m.id === chore.assignedTo)?.name || 'Unknown'}`}
                        </p>
                      </div>
                    </div>
                     <div className="flex gap-2">
                        <Button variant="outline" size="icon" disabled><Edit3 className="h-4 w-4"/></Button>
                        <Button variant="outline" size="icon" disabled><Trash2 className="h-4 w-4"/></Button>
                    </div>
                  </Card>
                ))}
              </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Add New Chore</CardTitle>
              <CardDescription>Define a new chore for the household.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddChore} className="space-y-6">
                <div>
                  <Label htmlFor="name">Chore Name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea id="description" name="description" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select name="frequency" defaultValue="Weekly">
                      <SelectTrigger id="frequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        {CHORE_FREQUENCIES.map(freq => (
                          <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="assignedTo">Assign To (Optional)</Label>
                    <Select name="assignedTo">
                      <SelectTrigger id="assignedTo">
                        <SelectValue placeholder="Select member" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None (Unassigned)</SelectItem>
                        {members.map(member => (
                          <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date (Optional)</Label>
                    <Input id="dueDate" name="dueDate" type="date" />
                  </div>
                </div>
                <Button type="submit" className="w-full md:w-auto">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Chore
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Chore History</CardTitle>
              <CardDescription>Log of all completed chores.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Chore</TableHead>
                    <TableHead>Completed By</TableHead>
                    <TableHead>Completed At</TableHead>
                    <TableHead>Frequency</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedChores.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No chores completed yet.</TableCell></TableRow>}
                  {completedChores.map(chore => (
                    <TableRow key={chore.id}>
                      <TableCell className="font-medium">{chore.name}</TableCell>
                      <TableCell>{members.find(m => m.id === chore.completedBy)?.name || 'Unknown'}</TableCell>
                      <TableCell>{chore.completedAt ? format(chore.completedAt, "MMM dd, yyyy 'at' p") : "N/A"}</TableCell>
                      <TableCell>{chore.frequency}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle>AI Chore Suggestions</CardTitle>
              <CardDescription>Let AI help optimize your chore schedule based on preferences and availability.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 p-4 border rounded-md">
                <h3 className="font-semibold">Configure Preferences (Simplified)</h3>
                <p className="text-sm text-muted-foreground">
                  For this demo, AI will use mock preferences and available unassigned chores. 
                  In a full app, you would input detailed roommate preferences and availability here.
                  Currently, it will try to assign: {aiChoreInput.unassignedChores.join(', ') || 'None'}.
                </p>
              </div>

              <Button onClick={handleGetAISuggestions} disabled={isAISuggesting || !aiChoreInput.unassignedChores.length}>
                <Sparkles className="mr-2 h-4 w-4" /> {isAISuggesting ? "Generating..." : "Get AI Suggestions"}
              </Button>

              {aiChoreSuggestion && (
                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle>Suggested Schedule</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-2 text-sm font-medium">Reasoning: <span className="font-normal text-muted-foreground">{aiChoreSuggestion.reasoning}</span></p>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Chore</TableHead>
                          <TableHead>Assigned To</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(aiChoreSuggestion.suggestedSchedule).map(([choreName, memberId]) => (
                          <TableRow key={choreName}>
                            <TableCell>{choreName}</TableCell>
                            <TableCell>{members.find(m => m.id === memberId)?.name || memberId}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                     <Button variant="outline" className="mt-4" onClick={() => alert("Applying suggestions is not implemented in this demo.")}>Apply Suggestions (Demo)</Button>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
