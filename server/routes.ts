import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertActivitySchema } from "@shared/schema";
import { GhinApiClient } from "./ghin-api";

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

  // Get user stats
  app.get("/api/stats", async (req, res) => {
    try {
      const userId = 1; // Hardcoded for demo
      const rounds = await storage.getRounds(userId);
      const recentRounds = await storage.getRecentRounds(userId, 5);
      
      const stats = {
        roundsPlayed: rounds.length,
        currentHandicap: "12.4",
        handicapImprovement: -0.8,
        practiceHours: 42,
        goalTarget: "10.0",
        goalProgress: 68,
        recentRounds: recentRounds.map(round => ({
          ...round,
          date: round.date.toISOString().split('T')[0],
        })),
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to get stats" });
    }
  });

  // Get performance analysis
  app.get("/api/performance", async (req, res) => {
    try {
      const userId = 1; // Hardcoded for demo
      const rounds = await storage.getRecentRounds(userId, 10);
      
      if (rounds.length === 0) {
        return res.json({
          drivingAccuracy: { percentage: 0, rating: "No Data", color: "gray" },
          shortGame: { percentage: 0, rating: "No Data", color: "gray" },
          putting: { percentage: 0, rating: "No Data", color: "gray" },
          recommendation: "Submit more rounds to get performance analysis.",
        });
      }

      // Calculate averages
      const totalFairways = rounds.reduce((sum, r) => sum + (r.fairwaysHit || 0), 0);
      const totalGIR = rounds.reduce((sum, r) => sum + (r.greensInRegulation || 0), 0);
      const totalPutts = rounds.reduce((sum, r) => sum + (r.totalPutts || 0), 0);
      const totalRounds = rounds.length;

      const drivingAccuracy = Math.round((totalFairways / (totalRounds * 14)) * 100);
      const girPercentage = Math.round((totalGIR / (totalRounds * 18)) * 100);
      const avgPuttsPerGIR = totalGIR > 0 ? (totalPutts / totalGIR).toFixed(1) : "0.0";

      const performance = {
        drivingAccuracy: {
          percentage: drivingAccuracy,
          rating: drivingAccuracy >= 70 ? "Strong" : drivingAccuracy >= 50 ? "Good" : "Needs Work",
          color: drivingAccuracy >= 70 ? "success" : drivingAccuracy >= 50 ? "warning" : "error",
          detail: `${drivingAccuracy}% fairways hit`,
        },
        shortGame: {
          percentage: girPercentage,
          rating: girPercentage >= 60 ? "Strong" : girPercentage >= 40 ? "Good" : "Needs Work",
          color: girPercentage >= 60 ? "success" : girPercentage >= 40 ? "warning" : "error",
          detail: `${girPercentage}% GIR`,
        },
        putting: {
          percentage: Math.max(0, 100 - (parseFloat(avgPuttsPerGIR) - 1.5) * 50),
          rating: parseFloat(avgPuttsPerGIR) <= 1.7 ? "Strong" : parseFloat(avgPuttsPerGIR) <= 2.0 ? "Good" : "Focus Area",
          color: parseFloat(avgPuttsPerGIR) <= 1.7 ? "success" : parseFloat(avgPuttsPerGIR) <= 2.0 ? "warning" : "error",
          detail: `${avgPuttsPerGIR} putts per GIR`,
        },
        recommendation: parseFloat(avgPuttsPerGIR) > 1.9 
          ? "Focus on putting practice - 30 minutes daily. Your short game improvement could reduce handicap by 2-3 strokes."
          : girPercentage < 50
          ? "Work on approach shots and iron play to improve greens in regulation."
          : "Great consistency! Focus on course management to lower scores.",
      };

      res.json(performance);
    } catch (error) {
      res.status(500).json({ message: "Failed to get performance analysis" });
    }
  });

  // Get rounds
  app.get("/api/rounds", async (req, res) => {
    try {
      const userId = 1; // Hardcoded for demo
      const rounds = await storage.getRounds(userId);
      res.json(rounds);
    } catch (error) {
      res.status(500).json({ message: "Failed to get rounds" });
    }
  });

  // Create round
  app.post("/api/rounds", async (req, res) => {
    try {
      const userId = 1; // Hardcoded for demo
      const validatedData = insertRoundSchema.parse({
        ...req.body,
        userId,
      });

      const round = await storage.createRound(validatedData);
      res.json(round);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create round" });
    }
  });

  const server = createServer(app);
  return server;
}