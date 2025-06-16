import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertActivitySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get current user (hardcoded to user ID 1 for this demo)
  app.get("/api/user", async (req, res) => {
    try {
      const user = await storage.getUser(1);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Get user stats based on activities
  app.get("/api/stats", async (req, res) => {
    try {
      const userId = 1; // Hardcoded for demo
      const activities = await storage.getActivities(userId);
      const recentActivities = await storage.getRecentActivities(userId, 5);
      
      // Calculate activity-based stats
      const thisWeekActivities = activities.filter(activity => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return activity.date >= weekAgo;
      }).length;
      
      const totalHours = activities.reduce((sum, activity) => sum + (activity.duration || 0), 0) / 60;
      
      const activityBreakdown = {
        'on-course': activities.filter(a => a.activityType === 'on-course').length,
        'practice-area': activities.filter(a => a.activityType === 'practice-area').length,
        'off-course': activities.filter(a => a.activityType === 'off-course').length,
      };

      const stats = {
        totalActivities: activities.length,
        thisWeekActivities,
        totalHours: Math.round(totalHours * 10) / 10,
        currentHandicap: "12.4",
        activityBreakdown,
        recentActivities: recentActivities.map(activity => ({
          ...activity,
          date: activity.date.toISOString().split('T')[0],
        })),
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to get stats" });
    }
  });

  // Get performance analysis based on activities
  app.get("/api/performance", async (req, res) => {
    try {
      const userId = 1; // Hardcoded for demo
      const activities = await storage.getRecentActivities(userId, 10);
      
      if (activities.length === 0) {
        return res.json({
          activityFrequency: { percentage: 0, rating: "No Data", color: "gray" },
          practiceBalance: { percentage: 0, rating: "No Data", color: "gray" },
          consistency: { percentage: 0, rating: "No Data", color: "gray" },
          recommendation: "Start logging activities to get performance analysis.",
        });
      }

      const onCourseActivities = activities.filter(a => a.activityType === 'on-course');
      const practiceActivities = activities.filter(a => a.activityType === 'practice-area');
      const offCourseActivities = activities.filter(a => a.activityType === 'off-course');
      
      // Calculate performance metrics
      const weeklyFrequency = activities.length / 2; // assuming 2 weeks of data
      const practiceRatio = (practiceActivities.length + offCourseActivities.length) / activities.length * 100;
      
      // Calculate consistency (activities spread across different days)
      const uniqueDays = new Set(activities.map(a => a.date.toDateString())).size;
      const consistencyScore = Math.min(100, (uniqueDays / 7) * 100); // out of 7 days

      const performance = {
        activityFrequency: {
          percentage: Math.min(100, weeklyFrequency * 25), // 4 activities per week = 100%
          rating: weeklyFrequency >= 4 ? "Excellent" : weeklyFrequency >= 2 ? "Good" : "Needs Work",
          color: weeklyFrequency >= 4 ? "success" : weeklyFrequency >= 2 ? "warning" : "error",
          detail: `${weeklyFrequency.toFixed(1)} activities per week`,
        },
        practiceBalance: {
          percentage: practiceRatio,
          rating: practiceRatio >= 60 ? "Well Balanced" : practiceRatio >= 40 ? "Good Mix" : "More Practice Needed",
          color: practiceRatio >= 60 ? "success" : practiceRatio >= 40 ? "warning" : "error",
          detail: `${Math.round(practiceRatio)}% practice activities`,
        },
        consistency: {
          percentage: consistencyScore,
          rating: consistencyScore >= 70 ? "Very Consistent" : consistencyScore >= 50 ? "Consistent" : "Sporadic",
          color: consistencyScore >= 70 ? "success" : consistencyScore >= 50 ? "warning" : "error",
          detail: `Active ${uniqueDays} days recently`,
        },
        recommendation: practiceRatio < 50 
          ? "Add more practice sessions to balance your on-course play."
          : weeklyFrequency < 2
          ? "Try to increase activity frequency to 3-4 times per week."
          : "Great activity pattern! Keep up the consistent routine.",
      };

      res.json(performance);
    } catch (error) {
      res.status(500).json({ message: "Failed to get performance analysis" });
    }
  });

  // Get activities
  app.get("/api/activities", async (req, res) => {
    try {
      const userId = 1; // Hardcoded for demo
      const activities = await storage.getActivities(userId);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to get activities" });
    }
  });

  // Create activity
  app.post("/api/activities", async (req, res) => {
    try {
      const userId = 1; // Hardcoded for demo
      const validatedData = insertActivitySchema.parse({
        ...req.body,
        userId,
      });

      const activity = await storage.createActivity(validatedData);
      res.json(activity);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create activity" });
    }
  });

  const server = createServer(app);
  return server;
}