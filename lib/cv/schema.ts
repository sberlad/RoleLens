/**
 * CV profile schema and types.
 * Used for both parsed profiles and tailored CV outputs.
 */

import { z } from "zod";

export const experienceSchema = z.object({
  title: z.string(),
  company: z.string(),
  location: z.string().default(""),
  dates: z.string().default(""),
  bullets: z.array(z.string()).default([]),
});

export const projectSchema = z.object({
  name: z.string(),
  link: z.string().nullable().default(null),
  description: z.string().default(""),
  bullets: z.array(z.string()).default([]),
});

export const skillsSchema = z.object({
  systems: z.array(z.string()).default([]),
  ai: z.array(z.string()).default([]),
  technical: z.array(z.string()).default([]),
});

export const educationSchema = z.object({
  degree: z.string(),
  institution: z.string(),
  location: z.string().default(""),
  dates: z.string().default(""),
});

export const languageSchema = z.object({
  language: z.string(),
  proficiency: z.string().default(""),
});

export const cvProfileSchema = z.object({
  name: z.string(),
  location: z.string().default(""),
  workAuthorization: z.array(z.string()).default([]),
  summary: z.string().default(""),
  experience: z.array(experienceSchema).default([]),
  projects: z.array(projectSchema).default([]),
  skills: skillsSchema.default({ systems: [], ai: [], technical: [] }),
  education: z.array(educationSchema).default([]),
  languages: z.array(languageSchema).default([]),
});

export const tailoredCVSchema = cvProfileSchema;

export type Experience = z.infer<typeof experienceSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Skills = z.infer<typeof skillsSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Language = z.infer<typeof languageSchema>;
export type CVProfile = z.infer<typeof cvProfileSchema>;
export type TailoredCV = z.infer<typeof tailoredCVSchema>;
