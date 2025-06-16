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

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").notNull(),
  activityType: text("activity_type").notNull(), // 'off-course', 'on-course', 'practice-area'
  subType: text("sub_type"), // 'golf-strength-training', 'playing-9-holes-walking', 'chipping-putting', etc.
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  duration: integer("duration_minutes"), // calculated or manual entry
  comment: text("comment"),
  metadata: jsonb("metadata"), // flexible data for different activity types
  createdAt: timestamp("created_at").defaultNow(),
});



export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;
