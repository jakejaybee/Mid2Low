import { pgTable, text, serial, integer, boolean, decimal, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  handicap: decimal("handicap", { precision: 4, scale: 1 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rounds = pgTable("rounds", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").notNull(),
  courseName: text("course_name").notNull(),
  totalScore: integer("total_score").notNull(),
  courseRating: decimal("course_rating", { precision: 4, scale: 1 }),
  slopeRating: integer("slope_rating"),
  differential: decimal("differential", { precision: 4, scale: 1 }),
  fairwaysHit: integer("fairways_hit"),
  greensInRegulation: integer("greens_in_regulation"),
  totalPutts: integer("total_putts"),
  penalties: integer("penalties"),
  screenshotUrl: text("screenshot_url"),
  processed: boolean("processed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const practiceResources = pgTable("practice_resources", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // 'facility' or 'equipment'
  name: text("name").notNull(),
  description: text("description"),
  location: text("location"),
  hours: text("hours"),
  cost: text("cost"),
  available: boolean("available").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const practicePlans = pgTable("practice_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  daysPerWeek: integer("days_per_week").notNull(),
  hoursPerSession: decimal("hours_per_session", { precision: 3, scale: 1 }).notNull(),
  preferredTime: text("preferred_time").notNull(),
  focusAreas: jsonb("focus_areas"), // Array of focus areas
  availableResources: jsonb("available_resources"), // Array of resource IDs
  weeklySchedule: jsonb("weekly_schedule"), // Structured practice schedule
  aiRecommendations: text("ai_recommendations"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertRoundSchema = createInsertSchema(rounds).omit({
  id: true,
  createdAt: true,
  differential: true,
  processed: true,
});

export const insertResourceSchema = createInsertSchema(practiceResources).omit({
  id: true,
  createdAt: true,
});

export const insertPracticePlanSchema = createInsertSchema(practicePlans).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertRound = z.infer<typeof insertRoundSchema>;
export type Round = typeof rounds.$inferSelect;
export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Resource = typeof practiceResources.$inferSelect;
export type InsertPracticePlan = z.infer<typeof insertPracticePlanSchema>;
export type PracticePlan = typeof practicePlans.$inferSelect;
