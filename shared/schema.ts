import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Competencies configuration
export const competencies = pgTable("competencies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCompetencySchema = createInsertSchema(competencies).omit({
  id: true,
  createdAt: true,
});

export type InsertCompetency = z.infer<typeof insertCompetencySchema>;
export type Competency = typeof competencies.$inferSelect;

// Managers
export const managers = pgTable("managers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  department: text("department"),
  role: text("role"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertManagerSchema = createInsertSchema(managers).omit({
  id: true,
  createdAt: true,
});

export type InsertManager = z.infer<typeof insertManagerSchema>;
export type Manager = typeof managers.$inferSelect;

// Self Assessments
export const selfAssessments = pgTable("self_assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  managerId: varchar("manager_id").notNull(),
  responses: jsonb("responses").notNull(), // { competencyId: score }
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSelfAssessmentSchema = createInsertSchema(selfAssessments).omit({
  id: true,
  createdAt: true,
}).extend({
  responses: z.record(z.number().min(1).max(10)),
});

export type InsertSelfAssessment = z.infer<typeof insertSelfAssessmentSchema>;
export type SelfAssessment = typeof selfAssessments.$inferSelect;

// 360 Feedback
export const feedbacks = pgTable("feedbacks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  managerId: varchar("manager_id").notNull(),
  responses: jsonb("responses").notNull(), // { competencyId: score }
  comments: jsonb("comments").notNull(), // { competencyId: comment }
  isAnonymous: integer("is_anonymous").notNull().default(1), // 1 = true, 0 = false
  submitterName: text("submitter_name"), // Only if not anonymous
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFeedbackSchema = createInsertSchema(feedbacks).omit({
  id: true,
  createdAt: true,
}).extend({
  responses: z.record(z.number().min(1).max(10)),
  comments: z.record(z.string().min(1).max(500)),
  isAnonymous: z.number().min(0).max(1),
});

export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedbacks.$inferSelect;

// Pulse Checks
export const pulseChecks = pgTable("pulse_checks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  managerId: varchar("manager_id").notNull(),
  listenedTo: integer("listened_to").notNull(), // 1-10 scale
  workloadFair: integer("workload_fair").notNull(),
  managerHelpful: integer("manager_helpful").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPulseCheckSchema = createInsertSchema(pulseChecks).omit({
  id: true,
  createdAt: true,
}).extend({
  listenedTo: z.number().min(1).max(10),
  workloadFair: z.number().min(1).max(10),
  managerHelpful: z.number().min(1).max(10),
});

export type InsertPulseCheck = z.infer<typeof insertPulseCheckSchema>;
export type PulseCheck = typeof pulseChecks.$inferSelect;

// Journal Entries
export const journalEntries = pgTable("journal_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  managerId: varchar("manager_id").notNull(),
  text: text("text").notNull(),
  sentimentScore: real("sentiment_score"), // -1 to 1
  emotionTags: jsonb("emotion_tags"), // array of strings
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({
  id: true,
  createdAt: true,
  sentimentScore: true,
  emotionTags: true,
});

export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;

// GROW Goals
export const growGoals = pgTable("grow_goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  managerId: varchar("manager_id").notNull(),
  directReport: text("direct_report").notNull(),
  goal: text("goal").notNull(),
  reality: text("reality").notNull(),
  options: text("options").notNull(),
  will: text("will").notNull(),
  progressNotes: jsonb("progress_notes"), // array of {note: string, date: string}
  status: text("status").notNull().default("active"), // active, completed, paused
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertGrowGoalSchema = createInsertSchema(growGoals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertGrowGoal = z.infer<typeof insertGrowGoalSchema>;
export type GrowGoal = typeof growGoals.$inferSelect;

// AI Analyses
export const aiAnalyses = pgTable("ai_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  managerId: varchar("manager_id").notNull(),
  sourceType: text("source_type").notNull(), // "360_feedback", "journal", "pulse"
  sourceId: varchar("source_id"),
  summary: text("summary").notNull(),
  themes: jsonb("themes"), // array of strings
  sentimentScore: real("sentiment_score"),
  strengths: jsonb("strengths"), // array of strings
  developmentAreas: jsonb("development_areas"), // array of strings
  actionItems: jsonb("action_items"), // array of strings
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAiAnalysisSchema = createInsertSchema(aiAnalyses).omit({
  id: true,
  createdAt: true,
});

export type InsertAiAnalysis = z.infer<typeof insertAiAnalysisSchema>;
export type AiAnalysis = typeof aiAnalyses.$inferSelect;

// Leadership Simulations
export const simulations = pgTable("simulations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  managerId: varchar("manager_id").notNull(),
  scenarioId: text("scenario_id").notNull(),
  choices: jsonb("choices").notNull(), // array of choice IDs
  teamMoraleScore: integer("team_morale_score"),
  performanceScore: integer("performance_score"),
  feedback: text("feedback"),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const insertSimulationSchema = createInsertSchema(simulations).omit({
  id: true,
  completedAt: true,
});

export type InsertSimulation = z.infer<typeof insertSimulationSchema>;
export type Simulation = typeof simulations.$inferSelect;

// Role-play Sessions
export const roleplaySessions = pgTable("roleplay_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  managerId: varchar("manager_id").notNull(),
  messages: jsonb("messages").notNull(), // array of {role: "user"|"ai", content: string}
  evaluation: text("evaluation"), // AI evaluation of the session
  sbiScore: integer("sbi_score"), // 1-10
  toneScore: integer("tone_score"), // 1-10
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertRoleplaySessionSchema = createInsertSchema(roleplaySessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertRoleplaySession = z.infer<typeof insertRoleplaySessionSchema>;
export type RoleplaySession = typeof roleplaySessions.$inferSelect;
