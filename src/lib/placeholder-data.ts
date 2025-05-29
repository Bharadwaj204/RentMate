import type { Household, Member, Chore, Expense, Balance, SettlementSuggestion, CalendarEvent } from './types';
import { addDays, addMonths, startOfWeek, subDays } from 'date-fns';

const today = new Date();

export const MOCK_MEMBERS: Member[] = [
  { id: 'user1', name: 'Alice Wonderland', email: 'alice@example.com', role: 'Owner', avatarUrl: 'https://placehold.co/100x100.png?text=AW' },
  { id: 'user2', name: 'Bob The Builder', email: 'bob@example.com', role: 'Member', avatarUrl: 'https://placehold.co/100x100.png?text=BB' },
  { id: 'user3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'Member', avatarUrl: 'https://placehold.co/100x100.png?text=CB' },
];

export const MOCK_HOUSEHOLD: Household = {
  id: 'household1',
  name: 'The Harmony House',
  inviteCode: 'HARMONY123',
  members: MOCK_MEMBERS,
  ownerId: 'user1',
};

export const MOCK_CHORES: Chore[] = [
  { 
    id: 'chore1', name: 'Wash Dishes', frequency: 'Daily', assignedTo: 'user1', 
    dueDate: addDays(today, 1), completed: false, createdAt: subDays(today, 1), householdId: 'household1',
    description: 'Clean all dishes from the sink and dishwasher.'
  },
  { 
    id: 'chore2', name: 'Take Out Trash', frequency: 'Weekly', assignedTo: 'user2', 
    dueDate: startOfWeek(addDays(today, 3), { weekStartsOn: 1 }), completed: false, createdAt: subDays(today, 5), householdId: 'household1',
    description: 'Empty all trash cans and take bins to the curb on collection day.'
  },
  { 
    id: 'chore3', name: 'Vacuum Living Room', frequency: 'Weekly', assignedTo: 'user3', 
    dueDate: startOfWeek(addDays(today, 5), { weekStartsOn: 1 }), completed: false, createdAt: subDays(today, 3), householdId: 'household1' 
  },
  { 
    id: 'chore4', name: 'Clean Bathroom', frequency: 'Monthly', assignedTo: 'user1', 
    dueDate: addMonths(today, 1), completed: true, completedBy: 'user1', completedAt: subDays(today, 2), createdAt: subDays(today, 30), householdId: 'household1'
  },
];

export const MOCK_EXPENSES: Expense[] = [
  {
    id: 'expense1', description: 'Groceries Q1', amount: 150.75, date: subDays(today, 10),
    payerId: 'user1', householdId: 'household1',
    participants: [
      { memberId: 'user1', share: 50.25 },
      { memberId: 'user2', share: 50.25 },
      { memberId: 'user3', share: 50.25 },
    ],
    isEqualSplit: true, createdAt: subDays(today, 10), category: 'Food'
  },
  {
    id: 'expense2', description: 'Internet Bill', amount: 60.00, date: subDays(today, 5),
    payerId: 'user2', householdId: 'household1',
    participants: [
      { memberId: 'user1', share: 20.00 },
      { memberId: 'user2', share: 20.00 },
      { memberId: 'user3', share: 20.00 },
    ],
    isEqualSplit: true, createdAt: subDays(today, 5), category: 'Utilities'
  },
  {
    id: 'expense3', description: 'Movie Night Tickets', amount: 45.00, date: subDays(today, 2),
    payerId: 'user3', householdId: 'household1',
    participants: [ // Custom split
      { memberId: 'user1', share: 15.00 },
      { memberId: 'user3', share: 30.00 }, // Bob didn't go
    ],
    isEqualSplit: false, createdAt: subDays(today, 2), category: 'Entertainment'
  },
];

export const MOCK_BALANCES: Balance[] = [
  { memberId: 'user1', memberName: 'Alice Wonderland', amount: 20.50 }, // Alice is owed $20.50
  { memberId: 'user2', memberName: 'Bob The Builder', amount: -30.25 }, // Bob owes $30.25
  { memberId: 'user3', memberName: 'Charlie Brown', amount: 9.75 },  // Charlie is owed $9.75
];

export const MOCK_SETTLEMENT_SUGGESTIONS: SettlementSuggestion[] = [
  { fromMemberId: 'user2', fromMemberName: 'Bob The Builder', toMemberId: 'user1', toMemberName: 'Alice Wonderland', amount: 20.50 },
  { fromMemberId: 'user2', fromMemberName: 'Bob The Builder', toMemberId: 'user3', toMemberName: 'Charlie Brown', amount: 9.75 },
];


export const MOCK_CALENDAR_EVENTS: CalendarEvent[] = [
  ...MOCK_CHORES.map(chore => ({
    id: `chore-${chore.id}`,
    title: chore.name,
    date: chore.dueDate || chore.createdAt,
    type: 'chore' as 'chore',
    details: chore,
  })),
  ...MOCK_EXPENSES.map(expense => ({
    id: `expense-${expense.id}`,
    title: `${expense.description} (Paid by ${MOCK_MEMBERS.find(m => m.id === expense.payerId)?.name.split(' ')[0]})`,
    date: expense.date,
    type: 'expense_due' as 'expense_due', // or 'payment_made'
    details: expense,
  })),
  // Example of a payment settlement
  {
    id: 'settlement-1',
    title: 'Bob paid Alice $20.50',
    date: addDays(today, 2),
    type: 'payment'
  }
];

export const getCurrentUser = (): Member => MOCK_MEMBERS[0]; // Alice is Owner
// export const getCurrentUser = (): Member => MOCK_MEMBERS[1]; // Bob is Member
