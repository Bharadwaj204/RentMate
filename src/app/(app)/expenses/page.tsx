"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { MOCK_EXPENSES, MOCK_MEMBERS, getCurrentUser } from "@/lib/placeholder-data";
import type { Expense, ExpenseParticipant, Member, ExpenseAISplitInput, ExpenseAISplitOutput } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { PlusCircle, Trash2, Edit3, Sparkles, History, CreditCard, FileCsv } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { optimizeExpenseSplit } from '@/ai/flows/expense-split-optimizer'; // Assuming AI flow

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const { toast } = useToast();

  // Form state for adding expense
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [payerId, setPayerId] = useState('');
  const [participants, setParticipants] = useState<string[]>([]);
  const [isEqualSplit, setIsEqualSplit] = useState(true);
  const [customSplits, setCustomSplits] = useState<Record<string, number | ''>>({});
  
  // AI Split Optimizer state
  const [aiExpenseInput, setAiExpenseInput] = useState<ExpenseAISplitInput | null>(null);
  const [aiSplitSuggestion, setAiSplitSuggestion] = useState<ExpenseAISplitOutput | null>(null);
  const [isAISplitting, setIsAISplitting] = useState(false);

  useEffect(() => {
    setExpenses(MOCK_EXPENSES);
    setMembers(MOCK_MEMBERS);
    const user = getCurrentUser();
    setCurrentUser(user);
    setPayerId(user.id); // Default payer to current user
    setParticipants(MOCK_MEMBERS.map(m => m.id)); // Default all members as participants
  }, []);

  useEffect(() => {
    if (isEqualSplit && participants.length > 0 && typeof amount === 'number') {
      const perPersonAmount = parseFloat((amount / participants.length).toFixed(2));
      const newCustomSplits: Record<string, number | ''> = {};
      participants.forEach(id => {
        newCustomSplits[id] = perPersonAmount;
      });
      setCustomSplits(newCustomSplits);
    } else if (!isEqualSplit) {
       // Keep manual entries or clear if needed
    }
  }, [isEqualSplit, participants, amount]);

  const handleParticipantChange = (memberId: string) => {
    setParticipants(prev =>
      prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]
    );
  };

  const handleCustomSplitChange = (memberId: string, value: string) => {
    setCustomSplits(prev => ({ ...prev, [memberId]: value === '' ? '' : parseFloat(value) }));
  };

  const handleAddExpense = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (typeof amount !== 'number' || amount <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a valid positive amount.", variant: "destructive" });
      return;
    }
    if (participants.length === 0) {
      toast({ title: "No Participants", description: "Please select at least one participant.", variant: "destructive" });
      return;
    }

    let expenseParticipants: ExpenseParticipant[] = [];
    if (isEqualSplit) {
      const share = parseFloat((amount / participants.length).toFixed(2));
      expenseParticipants = participants.map(id => ({ memberId: id, share }));
    } else {
      const totalCustomSplit = Object.values(customSplits).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0) , 0);
      if (Math.abs(totalCustomSplit - amount) > 0.01 * participants.length) { // Allow for small rounding errors
        toast({ title: "Split Mismatch", description: `Custom splits ($${totalCustomSplit.toFixed(2)}) do not add up to the total amount ($${amount.toFixed(2)}).`, variant: "destructive" });
        return;
      }
      expenseParticipants = Object.entries(customSplits)
        .filter(([memberId]) => participants.includes(memberId) && typeof customSplits[memberId] === 'number' && (customSplits[memberId] as number) > 0)
        .map(([memberId, share]) => ({ memberId, share: share as number }));
    }
    
    if (expenseParticipants.length === 0) {
        toast({ title: "Invalid Split", description: "No valid shares defined for participants.", variant: "destructive" });
        return;
    }

    const newExpense: Expense = {
      id: `expense-${Date.now()}`,
      description,
      amount,
      date: parseISO(date),
      payerId,
      participants: expenseParticipants,
      isEqualSplit,
      createdAt: new Date(),
      householdId: "household1",
    };
    setExpenses(prev => [newExpense, ...prev]);
    toast({ title: "Expense Logged", description: `${description} for $${amount.toFixed(2)} has been logged.` });
    
    // Reset form
    setDescription('');
    setAmount('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setPayerId(currentUser?.id || '');
    setParticipants(members.map(m => m.id));
    setIsEqualSplit(true);
    setCustomSplits({});
  };

  const handleOptimizeSplit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const expAmount = parseFloat(formData.get("aiAmount") as string);
    const expDesc = formData.get("aiDescription") as string;
    const expPayer = members.find(m => m.id === formData.get("aiPayerId") as string)?.name || "Unknown Payer";
    const expParticipants = (formData.getAll("aiParticipants") as string[]).map(id => members.find(m => m.id === id)?.name || "Unknown");
    
    const inputForAI: ExpenseAISplitInput = {
        amount: expAmount,
        description: expDesc,
        payerName: expPayer,
        participants: expParticipants,
        // Optional fields would be collected here
    };
    setAiExpenseInput(inputForAI);
    setIsAISplitting(true);
    setAiSplitSuggestion(null);

    try {
      // In a real app, this would be a server action.
      // For demo, directly calling client-side or mocking.
      // const result = await optimizeExpenseSplit(inputForAI);
      
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      const mockResult: ExpenseAISplitOutput = inputForAI.participants.reduce((acc, name) => {
        acc[name] = parseFloat((inputForAI.amount / inputForAI.participants.length).toFixed(2));
        return acc;
      }, {} as ExpenseAISplitOutput);

      setAiSplitSuggestion(mockResult);
      toast({ title: "AI Split Optimized", description: "Fair expense split has been calculated." });
    } catch (error) {
      console.error("AI Split Error:", error);
      toast({ title: "AI Split Failed", description: "Could not optimize the expense split.", variant: "destructive" });
    } finally {
      setIsAISplitting(false);
    }
  };
  
  const exportToCSV = () => {
    // This is a mock export. In a real app, you'd generate and download a CSV file.
    const csvHeader = "ID,Description,Amount,Date,Payer,Participants,IsEqualSplit,CreatedAt\n";
    const csvRows = expenses.map(exp => 
      [
        exp.id,
        `"${exp.description.replace(/"/g, '""')}"`,
        exp.amount,
        format(exp.date, "yyyy-MM-dd"),
        members.find(m => m.id === exp.payerId)?.name || exp.payerId,
        `"${exp.participants.map(p => `${members.find(m => m.id === p.memberId)?.name || p.memberId}: $${p.share.toFixed(2)}`).join(', ')}"`,
        exp.isEqualSplit,
        format(exp.createdAt, "yyyy-MM-dd HH:mm:ss")
      ].join(',')
    ).join('\n');
    const csvContent = csvHeader + csvRows;
    console.log("CSV Export:\n", csvContent);
    toast({ title: "Export Started (Demo)", description: "Expense data (logged to console for demo)." });
  };


  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Expense Management</h1>
      <Tabs defaultValue="log">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
          <TabsTrigger value="log" className="flex items-center gap-2"><PlusCircle />Log Expense</TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2"><History />Expense History</TabsTrigger>
          <TabsTrigger value="ai-optimizer" className="flex items-center gap-2"><Sparkles />AI Split Optimizer</TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2"><FileCsv />Export Data</TabsTrigger>
        </TabsList>

        <TabsContent value="log">
          <Card>
            <CardHeader>
              <CardTitle>Log New Expense</CardTitle>
              <CardDescription>Record a shared expense for the household.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddExpense} className="space-y-6">
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" value={description} onChange={e => setDescription(e.target.value)} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="amount">Amount ($)</Label>
                    <Input id="amount" type="number" value={amount} onChange={e => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))} placeholder="0.00" step="0.01" required />
                  </div>
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="payerId">Payer</Label>
                    <Select value={payerId} onValueChange={setPayerId} name="payerId">
                      <SelectTrigger id="payerId"><SelectValue placeholder="Select payer" /></SelectTrigger>
                      <SelectContent>
                        {members.map(member => <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label>Participants</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1 p-2 border rounded-md">
                    {members.map(member => (
                      <div key={member.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`participant-${member.id}`}
                          checked={participants.includes(member.id)}
                          onCheckedChange={() => handleParticipantChange(member.id)}
                        />
                        <Label htmlFor={`participant-${member.id}`}>{member.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="isEqualSplit" checked={isEqualSplit} onCheckedChange={(checked) => setIsEqualSplit(Boolean(checked))} />
                  <Label htmlFor="isEqualSplit">Split equally among selected participants</Label>
                </div>

                {!isEqualSplit && participants.length > 0 && (
                  <div className="space-y-2 p-4 border rounded-md bg-muted/30">
                    <Label className="font-semibold">Custom Split (Ensure total matches amount)</Label>
                    {participants.map(memberId => {
                      const member = members.find(m => m.id === memberId);
                      return member ? (
                        <div key={memberId} className="flex items-center gap-2">
                          <Label htmlFor={`custom-split-${memberId}`} className="w-1/3">{member.name}:</Label>
                          <Input
                            id={`custom-split-${memberId}`}
                            type="number"
                            placeholder="0.00"
                            step="0.01"
                            value={customSplits[memberId] ?? ''}
                            onChange={e => handleCustomSplitChange(memberId, e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      ) : null;
                    })}
                     <p className="text-sm text-muted-foreground">Total custom split: ${Object.values(customSplits).reduce((s, v) => s + (Number(v) || 0), 0).toFixed(2)}</p>
                  </div>
                )}

                <Button type="submit" className="w-full md:w-auto">
                  <PlusCircle className="mr-2 h-4 w-4" /> Log Expense
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Expense History</CardTitle>
              <CardDescription>Chronological log of all recorded expenses.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Payer</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No expenses logged yet.</TableCell></TableRow>}
                  {expenses.map(expense => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.description}</TableCell>
                      <TableCell className="text-right">${expense.amount.toFixed(2)}</TableCell>
                      <TableCell>{format(expense.date, "MMM dd, yyyy")}</TableCell>
                      <TableCell>{members.find(m => m.id === expense.payerId)?.name || 'Unknown'}</TableCell>
                      <TableCell className="flex gap-1">
                        <Button variant="outline" size="icon" disabled><Edit3 className="h-4 w-4" /></Button>
                        <Button variant="outline" size="icon" disabled><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="ai-optimizer">
          <Card>
            <CardHeader>
              <CardTitle>AI Expense Split Optimizer</CardTitle>
              <CardDescription>Get AI suggestions for fair expense splits based on various factors.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleOptimizeSplit} className="space-y-6">
                <p className="text-sm text-muted-foreground">Provide expense details for AI optimization. You can add usage patterns or individual circumstances in a full version.</p>
                <div>
                  <Label htmlFor="aiDescription">Expense Description</Label>
                  <Input id="aiDescription" name="aiDescription" defaultValue="Team Dinner" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="aiAmount">Amount ($)</Label>
                        <Input id="aiAmount" name="aiAmount" type="number" placeholder="0.00" step="0.01" defaultValue="100" required />
                    </div>
                    <div>
                        <Label htmlFor="aiPayerId">Payer</Label>
                        <Select name="aiPayerId" defaultValue={currentUser?.id}>
                        <SelectTrigger id="aiPayerId"><SelectValue placeholder="Select payer" /></SelectTrigger>
                        <SelectContent>
                            {members.map(member => <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>)}
                        </SelectContent>
                        </Select>
                    </div>
                </div>
                <div>
                  <Label>Participants for AI Split</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1 p-2 border rounded-md">
                    {members.map(member => (
                      <div key={`ai-${member.id}`} className="flex items-center space-x-2">
                        <Checkbox
                          id={`ai-participant-${member.id}`}
                          name="aiParticipants"
                          value={member.id}
                          defaultChecked={true}
                        />
                        <Label htmlFor={`ai-participant-${member.id}`}>{member.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                 {/* Placeholder for usage patterns and individual circumstances */}
                <Button type="submit" disabled={isAISplitting}>
                  <Sparkles className="mr-2 h-4 w-4" /> {isAISplitting ? "Optimizing..." : "Optimize Split with AI"}
                </Button>
              </form>

              {aiSplitSuggestion && (
                <Card className="mt-6 bg-muted/50">
                  <CardHeader><CardTitle>AI Optimized Split Suggestion</CardTitle></CardHeader>
                  <CardContent>
                    <p className="mb-2 text-sm">For expense: <span className="font-semibold">{aiExpenseInput?.description}</span> amounting to <span className="font-semibold">${aiExpenseInput?.amount.toFixed(2)}</span> paid by <span className="font-semibold">{aiExpenseInput?.payerName}</span>.</p>
                    <Table>
                      <TableHeader><TableRow><TableHead>Participant</TableHead><TableHead className="text-right">Suggested Share</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {Object.entries(aiSplitSuggestion).map(([name, share]) => (
                          <TableRow key={name}><TableCell>{name}</TableCell><TableCell className="text-right">${share.toFixed(2)}</TableCell></TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export">
          <Card>
            <CardHeader>
              <CardTitle>Export Expense Data</CardTitle>
              <CardDescription>Download your expense history as a CSV file.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={exportToCSV}>
                <FileCsv className="mr-2 h-4 w-4" /> Export All Expenses to CSV (Demo)
              </Button>
              <p className="mt-2 text-sm text-muted-foreground">
                In a real application, this would download a CSV file. For this demo, data is logged to the console.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
