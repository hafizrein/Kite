"use server";

import { getProjectAllocationSuggestions, type ProjectAllocationOutput } from "@/ai/flows/project-optimization-assistant";
import { z } from "zod";

const FormSchema = z.object({
  projectDescription: z.string().min(10, {
    message: "Project description must be at least 10 characters.",
  }),
  memberSkills: z.string().min(1, { message: "Please enter at least one skill." }),
  memberAvailability: z.string().min(1, { message: "Please enter availability." }),
});

export type FormState = {
  message: string;
  data?: ProjectAllocationOutput;
  errors?: {
    projectDescription?: string[];
    memberSkills?: string[];
    memberAvailability?: string[];
  };
};

export async function optimizeProject(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = FormSchema.safeParse({
    projectDescription: formData.get("projectDescription"),
    memberSkills: formData.get("memberSkills"),
    memberAvailability: formData.get("memberAvailability"),
  });

  if (!validatedFields.success) {
    return {
      message: "Validation failed. Please check your inputs.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  try {
    const result = await getProjectAllocationSuggestions({
        projectDescription: validatedFields.data.projectDescription,
        memberSkills: validatedFields.data.memberSkills.split(',').map(s => s.trim()),
        memberAvailability: validatedFields.data.memberAvailability.split(',').map(s => s.trim()),
    });
    
    return {
      message: "Successfully generated suggestions.",
      data: result,
    };
  } catch (error) {
    console.error(error);
    return {
      message: "An unexpected error occurred. Please try again.",
    };
  }
}
