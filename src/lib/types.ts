export type UserRole = "Owner" | "Member";

export interface Member {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface Household {
  id: string;
  name:string;
  inviteCode: string;
  members: Member[];
  ownerId: string;
}

export type ChoreFrequency = "Daily" | "Weekly" | "Monthly" | "Once";

export interface Chore {
  id: string;
  name: string;
  description?: string;
  frequency: ChoreFrequency;
  assignedTo?: string; // Member ID
  dueDate?: Date;
  completed: boolean;
  completedBy?: string; // Member ID
  completedAt?: Date;
  createdAt: Date;
  householdId: string;
}

export interface ExpenseParticipant {
  memberId: string;
  share: number; // Amount or percentage
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: Date;
  payerId: string; // Member ID
  participants: ExpenseParticipant[]; // Member IDs or detailed participant objects
  isEqualSplit: boolean;
  createdAt: Date;
  householdId: string;
  category?: string;
}

export interface Balance {
  memberId: string;
  memberName: string;
  amount: number; // Positive if owed to them, negative if they owe
}

export interface SettlementSuggestion {
  fromMemberId: string;
  fromMemberName: string;
  toMemberId: string;
  toMemberName: string;
  amount: number;
}

export type CalendarEvent = {
  id: string;
  title: string;
  date: Date;
  type: "chore" | "expense_due" | "payment";
  details?: Chore | Expense;
};

// AI Input/Output types (can be refined based on actual AI flow requirements)
export interface ChoreAISuggestionInput {
  members: { id: string; name: string; availability: string[]; preferences: string[] }[];
  chores: { name: string; frequency: ChoreFrequency }[];
}
export interface ChoreAISuggestionOutput {
  [choreName: string]: string; // choreName: memberName
}

export interface ExpenseAISplitInput {
  amount: number;
  description: string;
  payerName: string;
  participants: string[]; // names
  usagePatterns?: Record<string, number>; // participantName: usage
  individualCircumstances?: Record<string, string>; // participantName: circumstance
}

export interface ExpenseAISplitOutput {
  [participantName: string]: number; // participantName: amountOwed
}
