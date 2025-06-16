import { pgTable, text, serial, integer, boolean, decimal, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  handicap: decimal("handicap", { precision: 4, scale: 1 }),
  ghinNumber: text("ghin_number"),
  ghinConnected: boolean("ghin_connected").default(false),
  ghinAccessToken: text("ghin_access_token"),
  ghinRefreshToken: text("ghin_refresh_token"),
  lastGhinSync: timestamp("last_ghin_sync"),
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



export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertRound = z.infer<typeof insertRoundSchema>;
export type Round = typeof rounds.$inferSelect;
