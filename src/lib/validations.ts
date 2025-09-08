import { z } from "zod";

// User validation schema
export const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["Owner", "Admin", "PM", "Sales", "Member"], {
    required_error: "Please select a role",
  }),
  department: z.string().optional(),
  hourlyRate: z.number().min(0, "Hourly rate must be positive").optional(),
  avatar: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

// Project validation schema
export const projectSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Project name must be at least 2 characters").max(100, "Project name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  status: z.enum(["Not Started", "In Progress", "On Hold", "Completed", "Cancelled"], {
    required_error: "Please select a status",
  }),
  managerId: z.string().min(1, "Please assign a project manager"),
  startDate: z.string().min(1, "Please select a start date"),
  endDate: z.string().optional(),
  budget: z.number().min(0, "Budget must be positive"),
  spent: z.number().min(0, "Spent amount must be positive").optional(),
  progress: z.number().min(0, "Progress must be at least 0").max(100, "Progress cannot exceed 100").optional(),
  cpi: z.number().min(0, "CPI must be positive").optional(),
  spi: z.number().min(0, "SPI must be positive").optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["endDate"],
});

// Account validation schema
export const accountSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Account name must be at least 2 characters").max(100, "Account name must be less than 100 characters"),
  industry: z.string().max(50, "Industry must be less than 50 characters").optional(),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  phone: z.string().max(20, "Phone number must be less than 20 characters").optional(),
  email: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
  address: z.string().max(200, "Address must be less than 200 characters").optional(),
  ownerId: z.string().min(1, "Please assign an owner"),
});

// Opportunity validation schema
export const opportunitySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Opportunity name must be at least 2 characters").max(100, "Opportunity name must be less than 100 characters"),
  accountId: z.string().min(1, "Please select an account"),
  stage: z.enum([
    "Lead", 
    "Qualification", 
    "Proposal", 
    "Negotiation", 
    "Closed Won", 
    "Closed Lost"
  ], {
    required_error: "Please select a stage",
  }),
  amount: z.number().min(0, "Amount must be positive"),
  probability: z.number().min(0, "Probability must be at least 0").max(100, "Probability cannot exceed 100"),
  closeDate: z.string().min(1, "Please select a close date"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  ownerId: z.string().min(1, "Please assign an owner"),
});

// Time Entry validation schema
export const timeEntrySchema = z.object({
  id: z.string().optional(),
  projectId: z.string().min(1, "Please select a project"),
  userId: z.string().min(1, "Please select a user"),
  date: z.string().min(1, "Please select a date"),
  hours: z.number().min(0.1, "Hours must be at least 0.1").max(24, "Hours cannot exceed 24 per day"),
  description: z.string().min(5, "Description must be at least 5 characters").max(200, "Description must be less than 200 characters"),
  billable: z.boolean(),
  approved: z.boolean().optional(),
}).refine((data) => {
  const entryDate = new Date(data.date);
  const today = new Date();
  const maxPastDays = 30; // Allow entries up to 30 days in the past
  const minDate = new Date();
  minDate.setDate(today.getDate() - maxPastDays);
  
  return entryDate >= minDate && entryDate <= today;
}, {
  message: "Date must be within the last 30 days and not in the future",
  path: ["date"],
});

// Login validation schema
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Registration validation schema
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one lowercase letter, one uppercase letter, and one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Organization settings validation schema
export const organizationSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters").max(100, "Organization name must be less than 100 characters"),
  address: z.string().max(200, "Address must be less than 200 characters").optional(),
  phone: z.string().max(20, "Phone number must be less than 20 characters").optional(),
  email: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  currency: z.enum(["USD", "EUR", "GBP", "CAD"], {
    required_error: "Please select a currency",
  }),
  timezone: z.string().min(1, "Please select a timezone"),
  fiscalYearStart: z.string().regex(/^\d{2}-\d{2}$/, "Fiscal year start must be in MM-DD format"),
});

// Rate card validation schema
export const rateCardSchema = z.object({
  id: z.string().optional(),
  role: z.string().min(2, "Role must be at least 2 characters").max(50, "Role must be less than 50 characters"),
  department: z.string().min(1, "Please select a department"),
  hourlyRate: z.number().min(1, "Hourly rate must be at least $1").max(1000, "Hourly rate cannot exceed $1000"),
  currency: z.enum(["USD", "EUR", "GBP", "CAD"], {
    required_error: "Please select a currency",
  }),
  effectiveDate: z.string().min(1, "Please select an effective date"),
  isActive: z.boolean(),
});

// WBS Task validation schema
export const wbsTaskSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Task name must be at least 2 characters").max(100, "Task name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  parentId: z.string().optional(),
  type: z.enum(["milestone", "task", "phase"], {
    required_error: "Please select a task type",
  }),
  status: z.enum(["not-started", "in-progress", "completed", "on-hold"], {
    required_error: "Please select a status",
  }),
  priority: z.enum(["low", "medium", "high", "critical"], {
    required_error: "Please select a priority",
  }),
  assignedTo: z.string().optional(),
  estimatedHours: z.number().min(0, "Estimated hours must be positive").max(1000, "Estimated hours cannot exceed 1000"),
  actualHours: z.number().min(0, "Actual hours must be positive").max(1000, "Actual hours cannot exceed 1000"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budget: z.number().min(0, "Budget must be positive"),
  spent: z.number().min(0, "Spent amount must be positive"),
  progress: z.number().min(0, "Progress must be at least 0").max(100, "Progress cannot exceed 100"),
  dependencies: z.array(z.string()).optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["endDate"],
}).refine((data) => {
  if (data.estimatedHours > 0) {
    return data.actualHours <= data.estimatedHours * 2; // Allow some flexibility
  }
  return true;
}, {
  message: "Actual hours significantly exceed estimated hours",
  path: ["actualHours"],
});

// Export types
export type UserFormData = z.infer<typeof userSchema>;
export type ProjectFormData = z.infer<typeof projectSchema>;
export type AccountFormData = z.infer<typeof accountSchema>;
export type OpportunityFormData = z.infer<typeof opportunitySchema>;
export type TimeEntryFormData = z.infer<typeof timeEntrySchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type OrganizationFormData = z.infer<typeof organizationSchema>;
export type RateCardFormData = z.infer<typeof rateCardSchema>;
export type WBSTaskFormData = z.infer<typeof wbsTaskSchema>;
