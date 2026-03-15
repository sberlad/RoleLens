/**
 * Job and match score schemas and types.
 */

import { z } from "zod";

export const jobSchema = z.object({
  id: z.string(),
  title: z.string(),
  company: z.string(),
  url: z.string().nullable().default(null),
  description: z.string(),
  createdAt: z.string(), // ISO date string
});

export const matchScoreSchema = z.object({
  score: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
  rationale: z.string(),
});

export const jobWithScoreSchema = jobSchema.extend({
  matchScore: matchScoreSchema.nullable().default(null),
});

export type Job = z.infer<typeof jobSchema>;
export type MatchScore = z.infer<typeof matchScoreSchema>;
export type JobWithScore = z.infer<typeof jobWithScoreSchema>;
