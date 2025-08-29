'use server';

/**
 * @fileOverview Provides AI-driven recommendations for optimal project resource allocation.
 *
 * - getProjectAllocationSuggestions - A function that returns project allocation suggestions.
 * - ProjectAllocationInput - The input type for the getProjectAllocationSuggestions function.
 * - ProjectAllocationOutput - The return type for the getProjectAllocationSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProjectAllocationInputSchema = z.object({
  projectDescription: z.string().describe('The description of the project.'),
  memberSkills: z.array(z.string()).describe('A list of skills of available team members.'),
  memberAvailability: z.array(z.string()).describe('A list of available working hours for each team member.'),
});
export type ProjectAllocationInput = z.infer<typeof ProjectAllocationInputSchema>;

const ProjectAllocationOutputSchema = z.object({
  allocationSuggestions: z.array(z.string()).describe('A list of AI-driven suggestions for project allocation based on member skills and availability.'),
});
export type ProjectAllocationOutput = z.infer<typeof ProjectAllocationOutputSchema>;

export async function getProjectAllocationSuggestions(input: ProjectAllocationInput): Promise<ProjectAllocationOutput> {
  return projectAllocationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'projectAllocationPrompt',
  input: {schema: ProjectAllocationInputSchema},
  output: {schema: ProjectAllocationOutputSchema},
  prompt: `You are an AI project management assistant that provides suggestions for project resource allocation.

  Based on the project description, team member skills, and availability, provide optimal project allocation suggestions.

  Project Description: {{{projectDescription}}}
  Member Skills: {{#each memberSkills}}{{{this}}}, {{/each}}
  Member Availability: {{#each memberAvailability}}{{{this}}}, {{/each}}

  Return a list of specific allocation suggestions to improve project efficiency and outcomes.
  `,
});

const projectAllocationFlow = ai.defineFlow(
  {
    name: 'projectAllocationFlow',
    inputSchema: ProjectAllocationInputSchema,
    outputSchema: ProjectAllocationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
