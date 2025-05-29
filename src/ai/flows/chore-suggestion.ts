'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting chore schedules based on user preferences and availability.
 *
 * - suggestChoreSchedule - A function that triggers the chore schedule suggestion process.
 * - ChoreSuggestionInput - The input type for the suggestChoreSchedule function.
 * - ChoreSuggestionOutput - The return type for the suggestChoreSchedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChoreSuggestionInputSchema = z.object({
  roommatePreferences: z
    .array(z.object({
      roommateId: z.string().describe('Unique identifier for the roommate.'),
      preferredChores: z.array(z.string()).describe('List of chores preferred by the roommate.'),
      availableDays: z.array(z.string()).describe('Days of the week the roommate is available (e.g., Monday, Tuesday).'),
    }))
    .describe('An array of roommate preferences and availability.'),
  unassignedChores: z.array(z.string()).describe('List of chores that need to be assigned.'),
});

export type ChoreSuggestionInput = z.infer<typeof ChoreSuggestionInputSchema>;

const ChoreSuggestionOutputSchema = z.object({
  suggestedSchedule: z.record(z.string(), z.string()).describe('Suggested chore schedule, mapping chore to roommate ID.'),
  reasoning: z.string().describe('Explanation of why the schedule was suggested.'),
});

export type ChoreSuggestionOutput = z.infer<typeof ChoreSuggestionOutputSchema>;

export async function suggestChoreSchedule(input: ChoreSuggestionInput): Promise<ChoreSuggestionOutput> {
  return choreSuggestionFlow(input);
}

const choreSuggestionPrompt = ai.definePrompt({
  name: 'choreSuggestionPrompt',
  input: {schema: ChoreSuggestionInputSchema},
  output: {schema: ChoreSuggestionOutputSchema},
  prompt: `You are a helpful assistant that suggests an optimal chore schedule for roommates, taking into account their preferences and availability.

  Here are the roommates and their preferences/availability:
  {{#each roommatePreferences}}
  Roommate ID: {{{roommateId}}}
  Preferred Chores: {{#each preferredChores}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Available Days: {{#each availableDays}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  {{/each}}

  Chores to be assigned: {{#each unassignedChores}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

  Suggest a chore schedule that minimizes conflicts and ensures fair distribution of tasks. The suggestedSchedule field should be a JSON object mapping each chore to a roommateId.
  Also, explain the reasoning behind the schedule in the reasoning field.
  Ensure the schedule only includes chores from the unassignedChores list, and only assigns chores to available roommates.
  `,
});

const choreSuggestionFlow = ai.defineFlow(
  {
    name: 'choreSuggestionFlow',
    inputSchema: ChoreSuggestionInputSchema,
    outputSchema: ChoreSuggestionOutputSchema,
  },
  async input => {
    const {output} = await choreSuggestionPrompt(input);
    return output!;
  }
);
