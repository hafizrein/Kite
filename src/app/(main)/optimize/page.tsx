"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { optimizeProject, type FormState } from "./actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb, ListChecks, LoaderCircle } from "lucide-react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const initialState: FormState = {
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          Optimizing...
        </>
      ) : (
        <>
          <Lightbulb className="mr-2 h-4 w-4" />
          Get Suggestions
        </>
      )}
    </Button>
  );
}

export default function OptimizePage() {
  const [state, formAction] = useActionState(optimizeProject, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message && state.message !== "Successfully generated suggestions.") {
      toast({
        variant: "destructive",
        title: "Error",
        description: state.message,
      });
    }
  }, [state, toast]);


  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <form action={formAction}>
          <Card>
            <CardHeader>
              <CardTitle>Project Optimization Assistant</CardTitle>
              <CardDescription>
                Provide project details to receive AI-powered allocation
                suggestions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectDescription">Project Description</Label>
                <Textarea
                  id="projectDescription"
                  name="projectDescription"
                  placeholder="e.g., Develop a new e-commerce platform with React and Next.js..."
                  rows={5}
                />
                 {state.errors?.projectDescription && (
                    <p className="text-sm text-destructive">{state.errors.projectDescription[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="memberSkills">Team Member Skills</Label>
                <Input
                  id="memberSkills"
                  name="memberSkills"
                  placeholder="e.g., React, Node.js, UI/UX Design, QA"
                />
                <p className="text-xs text-muted-foreground">Enter skills separated by commas.</p>
                 {state.errors?.memberSkills && (
                    <p className="text-sm text-destructive">{state.errors.memberSkills[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="memberAvailability">Member Availability</Label>
                <Input
                  id="memberAvailability"
                  name="memberAvailability"
                  placeholder="e.g., Alice: 20hrs/wk, Bob: 40hrs/wk"
                />
                 <p className="text-xs text-muted-foreground">Enter availability separated by commas.</p>
                 {state.errors?.memberAvailability && (
                    <p className="text-sm text-destructive">{state.errors.memberAvailability[0]}</p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <SubmitButton />
            </CardFooter>
          </Card>
        </form>
      </div>
      <div className="lg:col-span-3">
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Suggestions</CardTitle>
                <CardDescription>AI-generated recommendations will appear here.</CardDescription>
            </CardHeader>
            <CardContent>
                {state.data?.allocationSuggestions ? (
                    <Alert>
                        <ListChecks className="h-4 w-4" />
                        <AlertTitle>Optimization Suggestions</AlertTitle>
                        <AlertDescription>
                            <ul className="mt-2 list-disc space-y-2 pl-5">
                            {state.data.allocationSuggestions.map((suggestion, index) => (
                                <li key={index}>{suggestion}</li>
                            ))}
                            </ul>
                        </AlertDescription>
                    </Alert>
                ) : (
                     <div className="flex h-[400px] items-center justify-center rounded-lg border-2 border-dashed">
                        <div className="text-center">
                            <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground" />
                            <p className="mt-4 text-muted-foreground">Your suggestions are waiting.</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
