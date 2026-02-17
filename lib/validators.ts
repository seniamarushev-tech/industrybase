import { z } from "zod";

export const onboardingSchema = z.object({
  role: z.enum(["artist", "producer", "customer"]),
  city: z.string().min(2),
  tags: z.array(z.string()).max(10).default([]),
  display_name: z.string().min(2).max(100),
  contact_email: z.string().email().optional().or(z.literal("")),
  contact_phone: z.string().optional(),
  contact_telegram: z.string().optional()
});

export const taskSchema = z
  .object({
    title: z.string().min(3).max(120),
    category: z.string().min(2).max(60),
    city: z.string().min(2),
    event_date: z.string().optional(),
    budget_type: z.enum(["fixed", "range", "collab"]),
    budget_min: z.coerce.number().min(0),
    budget_max: z.coerce.number().min(0).optional(),
    description: z.string().min(10),
    visibility: z.enum(["public", "targeted"]),
    targeted_profile_id: z.string().uuid().optional().or(z.literal(""))
  })
  .refine((d) => d.budget_type === "collab" || d.budget_min > 0, {
    message: "Budget min is required",
    path: ["budget_min"]
  })
  .refine((d) => d.visibility === "public" || Boolean(d.targeted_profile_id), {
    message: "Target profile required for targeted tasks",
    path: ["targeted_profile_id"]
  });

export const offerSchema = z.object({
  task_id: z.string().uuid(),
  message: z.string().min(5).max(500),
  portfolio_url: z.string().url().optional().or(z.literal(""))
});

export const reviewSchema = z.object({
  task_id: z.string().uuid(),
  to_id: z.string().uuid(),
  rating: z.coerce.number().int().min(1).max(5),
  flags: z.array(z.enum(["late", "no_show", "rude", "low_quality"])).default([]),
  comment: z.string().max(500).optional()
});
