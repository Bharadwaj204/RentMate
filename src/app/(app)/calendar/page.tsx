"use client";

import { useState, useEffect } from 'react';
import type { ActiveModifiers } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_CALENDAR_EVENTS } from "@/lib/placeholder-data";
import { MOCK_MEMBERS } from "@/lib/placeholder-data";
import type { CalendarEvent } from "@/lib/types";
import { format, isSameDay } from "date-fns";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ListChecks, CreditCard, Handshake } from 'lucide-react';

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [members, setMembers] = useState(MOCK_MEMBERS); // Add members state
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDayEvents, setSelectedDayEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    setEvents(MOCK_CALENDAR_EVENTS);
  }, []);

  useEffect(() => {
    setDate(new Date());
  }, []);

  useEffect(() => {
    if (date) {
      setSelectedDayEvents(events.filter(event => isSameDay(event.date, date)));
    } else {
      setSelectedDayEvents([]);
    }
  }, [date, events]);

  const getEventIcon = (type: CalendarEvent['type']) => {
    switch(type) {
      case 'chore': return <ListChecks className="h-4 w-4 text-blue-500" />;
      case 'expense_due': return <CreditCard className="h-4 w-4 text-red-500" />;
      case 'payment': return <Handshake className="h-4 w-4 text-green-500" />;
      default: return null;
    }
  }

  const getEventColor = (type: CalendarEvent['type']) => {
    switch(type) {
      case 'chore': return "bg-blue-500";
      case 'expense_due': return "bg-red-500";
      case 'payment': return "bg-green-500";
      default: return "bg-gray-500";
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Unified Calendar</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 shadow-lg">
          <CardContent className="p-0 md:p-2">

            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md w-full"
              modifiers={{
                eventDay: events.map(event => event.date) 
              }}
              modifiersStyles={{
                eventDay: { position: 'relative' }
              }}

            />
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>
              Events for {date ? format(date, "MMMM dd, yyyy") : "Selected Date"}
            </CardTitle>
            <CardDescription>Chores and expense deadlines.</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDayEvents.length > 0 ? (
              <ul className="space-y-3">
                {selectedDayEvents.map(event => (
                  <li key={event.id} className="p-3 bg-muted/50 rounded-md flex items-start gap-3">
                    <span className="mt-1">{getEventIcon(event.type)}</span>
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <Badge variant="outline" className="capitalize mt-1">{event.type.replace('_', ' ')}</Badge>
                      {event.details && 'name' in event.details && (
                         <p className="text-xs text-muted-foreground">Assigned: {members.find(m => m.id === (event.details as any).assignedTo)?.name || 'N/A'}</p>
                      )}
                       {event.details && 'amount' in event.details && (
                         <p className="text-xs text-muted-foreground">Amount: ${(event.details as any).amount.toFixed(2)}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No events for this day.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
