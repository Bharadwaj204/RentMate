// Expense Split Optimizer Flow

'use server';

/**
 * @fileOverview An AI agent that suggests fair expense splits based on usage patterns and individual circumstances.
 *
 * - optimizeExpenseSplit - A function that handles the expense split optimization process.
 * - OptimizeExpenseSplitInput - The input type for the optimizeExpenseSplit function.
 * - OptimizeExpenseSplitOutput - The return type for the optimizeExpenseSplit function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeExpenseSplitInputSchema = z.object({
  expenseAmount: z.number().describe('The total amount of the expense.'),
  description: z.string().describe('A description of the expense.'),
  payer: z.string().describe('The user who paid the expense.'),
  participants: z.array(z.string()).describe('The users who participated in the expense.'),
  usagePatterns: z
    .record(z.string(), z.number())
    .describe(
      'A record of usage patterns for each participant, where the key is the user and the value is their usage (e.g., utility consumption).' // Use `record` type here
    )
    .optional(),
  individualCircumstances: z
    .record(z.string(), z.string())
    .describe(
      'A record of individual circumstances for each participant, where the key is the user and the value is their relevant circumstances (e.g., income level).' // Use `record` type here
    )
    .optional(),
});
export type OptimizeExpenseSplitInput = z.infer<typeof OptimizeExpenseSplitInputSchema>;

const OptimizeExpenseSplitOutputSchema = z.record(z.string(), z.number()).describe(
  'A record of suggested expense splits for each participant, where the key is the user and the value is the amount they should pay.' // Use `record` type here
);
export type OptimizeExpenseSplitOutput = z.infer<typeof OptimizeExpenseSplitOutputSchema>;

export async function optimizeExpenseSplit(input: OptimizeExpenseSplitInput): Promise<OptimizeExpenseSplitOutput> {
  return optimizeExpenseSplitFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeExpenseSplitPrompt',
  input: {schema: OptimizeExpenseSplitInputSchema},
  output: {schema: OptimizeExpenseSplitOutputSchema},
  prompt: `You are an expert in fair expense splitting among roommates.

Given the following information about a shared expense, suggest a fair split of the expense amount among the participants, taking into account any usage patterns or individual circumstances.

Expense Amount: {{{expenseAmount}}}
Description: {{{description}}}
Payer: {{{payer}}}
Participants: {{#each participants}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
{{#if usagePatterns}}
Usage Patterns:
{{#each usagePatterns}}
  {{{key}}}: {{{value}}}
{{/each}}
{{/if}}
{{#if individualCircumstances}}
Individual Circumstances:
{{#each individualCircumstances}}
  {{{key}}}: {{{value}}}
{{/each}}
{{/if}}

Provide the split as a record where the key is the participant and the value is the amount they should pay.
Ensure that the total adds up to the expense amount.`,
});

const optimizeExpenseSplitFlow = ai.defineFlow(
  {
    name: 'optimizeExpenseSplitFlow',
    inputSchema: OptimizeExpenseSplitInputSchema,
    outputSchema: OptimizeExpenseSplitOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
