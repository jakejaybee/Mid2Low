import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRoundSchema, insertResourceSchema, insertPracticePlanSchema } from "@shared/schema";
import { generatePracticePlan } from "./openai";
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
      res.json(rounds.map(round => ({
        ...round,
        date: round.date.toISOString().split('T')[0],
      })));
    } catch (error) {
      res.status(500).json({ message: "Failed to get rounds" });
    }
  });

  // Submit round
  app.post("/api/rounds", async (req, res) => {
    try {
      const userId = 1; // Hardcoded for demo
      const roundData = req.body;

      // Validate the round data
      const validatedData = insertRoundSchema.parse({
        ...roundData,
        userId,
        date: new Date(roundData.date),
        totalScore: parseInt(roundData.totalScore),
        courseRating: roundData.courseRating ? parseFloat(roundData.courseRating) : null,
        slopeRating: roundData.slopeRating ? parseInt(roundData.slopeRating) : null,
        fairwaysHit: roundData.fairwaysHit ? parseInt(roundData.fairwaysHit) : null,
        greensInRegulation: roundData.greensInRegulation ? parseInt(roundData.greensInRegulation) : null,
        totalPutts: roundData.totalPutts ? parseInt(roundData.totalPutts) : null,
        penalties: roundData.penalties ? parseInt(roundData.penalties) : null,
        screenshotUrl: null,
      });

      const round = await storage.createRound(validatedData);
      res.json({
        ...round,
        date: round.date.toISOString().split('T')[0],
      });
    } catch (error: any) {
      console.error("Round submission error:", error);
      res.status(400).json({ message: error.message || "Failed to submit round" });
    }
  });

  // Get resources
  app.get("/api/resources", async (req, res) => {
    try {
      const userId = 1; // Hardcoded for demo
      const resources = await storage.getResources(userId);
      res.json(resources);
    } catch (error) {
      res.status(500).json({ message: "Failed to get resources" });
    }
  });

  // Create resource
  app.post("/api/resources", async (req, res) => {
    try {
      const userId = 1; // Hardcoded for demo
      const validatedData = insertResourceSchema.parse({
        ...req.body,
        userId,
      });

      const resource = await storage.createResource(validatedData);
      res.json(resource);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create resource" });
    }
  });

  // Update resource
  app.patch("/api/resources/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const resource = await storage.updateResource(id, req.body);
      res.json(resource);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update resource" });
    }
  });

  // Delete resource
  app.delete("/api/resources/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteResource(id);
      res.json({ message: "Resource deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to delete resource" });
    }
  });

  // Get practice plans
  app.get("/api/practice-plans", async (req, res) => {
    try {
      const userId = 1; // Hardcoded for demo
      const plans = await storage.getPracticePlans(userId);
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to get practice plans" });
    }
  });

  // Get active practice plan
  app.get("/api/practice-plans/active", async (req, res) => {
    try {
      const userId = 1; // Hardcoded for demo
      const plan = await storage.getActivePracticePlan(userId);
      res.json(plan || null);
    } catch (error) {
      res.status(500).json({ message: "Failed to get active practice plan" });
    }
  });

  // Generate practice plan
  app.post("/api/practice-plans/generate", async (req, res) => {
    try {
      const userId = 1; // Hardcoded for demo
      const { daysPerWeek, hoursPerSession, preferredTime, availableResources, practiceGoal } = req.body;

      // Get user's recent performance data
      const rounds = await storage.getRecentRounds(userId, 10);
      const user = await storage.getUser(userId);

      // Generate AI-powered practice plan
      const aiPlan = await generatePracticePlan({
        handicap: user?.handicap ? parseFloat(user.handicap) : 15,
        recentRounds: rounds,
        daysPerWeek,
        hoursPerSession,
        preferredTime,
        availableResources,
        practiceGoal,
      });

      // Deactivate existing plans
      const existingPlans = await storage.getPracticePlans(userId);
      for (const plan of existingPlans) {
        if (plan.active) {
          await storage.updatePracticePlan(plan.id, { active: false });
        }
      }

      // Create new practice plan
      const validatedData = insertPracticePlanSchema.parse({
        userId,
        name: `Practice Plan - ${new Date().toLocaleDateString()}`,
        daysPerWeek,
        hoursPerSession,
        preferredTime,
        availableResources,
        focusAreas: aiPlan.focusAreas,
        weeklySchedule: aiPlan.weeklySchedule,
        aiRecommendations: aiPlan.recommendations,
        active: true,
      });

      const practicePlan = await storage.createPracticePlan(validatedData);
      res.json(practicePlan);
    } catch (error: any) {
      console.error("Practice plan generation error:", error);
      res.status(500).json({ message: error.message || "Failed to generate practice plan" });
    }
  });

  // GHIN Integration Routes
  
  // Get GHIN authorization URL
  app.get("/api/ghin/auth-url", (req, res) => {
    try {
      // Check if GHIN API is properly configured
      if (!process.env.GHIN_CLIENT_ID || !process.env.GHIN_CLIENT_SECRET) {
        return res.status(400).json({ 
          message: "GHIN API integration requires configuration. Please provide your GHIN API credentials to enable automatic score syncing.",
          requiresSetup: true
        });
      }

      const redirectUri = `${req.protocol}://${req.get('host')}/api/ghin/callback`;
      const ghinClient = new GhinApiClient();
      const authUrl = ghinClient.getAuthorizationUrl(redirectUri, "golf_app_state");
      
      res.json({ authUrl });
    } catch (error) {
      console.error("GHIN auth URL error:", error);
      res.status(500).json({ 
        message: "Failed to generate GHIN authorization URL",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Handle GHIN OAuth callback
  app.get("/api/ghin/callback", async (req, res) => {
    try {
      const { code, state } = req.query;
      
      if (!code) {
        return res.status(400).json({ message: "Authorization code missing" });
      }

      const userId = 1; // Hardcoded for demo
      const redirectUri = `${req.protocol}://${req.get('host')}/api/ghin/callback`;
      const ghinClient = new GhinApiClient();
      
      // Exchange code for tokens
      const tokens = await ghinClient.exchangeCodeForTokens(code as string, redirectUri);
      
      // Get player profile
      const profile = await ghinClient.getPlayerProfile();
      
      // Update user with GHIN connection
      await storage.updateUserGhinConnection(userId, {
        ghinNumber: profile.ghin_number,
        ghinConnected: true,
        ghinAccessToken: tokens.access_token,
        ghinRefreshToken: tokens.refresh_token,
        lastGhinSync: new Date(),
      });

      // Update handicap if available
      if (profile.handicap_index !== null) {
        await storage.updateUserHandicap(userId, profile.handicap_index);
      }

      // Redirect to success page
      res.redirect('/?ghin=connected');
    } catch (error) {
      console.error("GHIN callback error:", error);
      res.redirect('/?ghin=error');
    }
  });

  // Sync GHIN data
  app.post("/api/ghin/sync", async (req, res) => {
    try {
      const userId = 1; // Hardcoded for demo
      const user = await storage.getUser(userId);
      
      if (!user?.ghinConnected || !user.ghinAccessToken) {
        return res.status(400).json({ message: "GHIN account not connected" });
      }

      const ghinClient = new GhinApiClient(user.ghinAccessToken, user.ghinRefreshToken);
      
      // Get latest scores
      const scores = await ghinClient.syncLatestScores(user.lastGhinSync ?? undefined);
      
      // Convert and save rounds
      const newRounds = [];
      for (const score of scores) {
        const roundData = GhinApiClient.convertGhinScoreToRound(score, userId);
        const round = await storage.createRound(roundData);
        newRounds.push(round);
      }

      // Update sync timestamp
      await storage.updateUserGhinConnection(userId, {
        lastGhinSync: new Date(),
      });

      // Get updated handicap
      const currentHandicap = await ghinClient.getCurrentHandicap();
      if (currentHandicap !== null) {
        await storage.updateUserHandicap(userId, currentHandicap);
      }

      res.json({ 
        message: "GHIN data synced successfully",
        newRounds: newRounds.length,
        handicap: currentHandicap
      });
    } catch (error) {
      console.error("GHIN sync error:", error);
      res.status(500).json({ message: "Failed to sync GHIN data" });
    }
  });

  // Disconnect GHIN account
  app.post("/api/ghin/disconnect", async (req, res) => {
    try {
      const userId = 1; // Hardcoded for demo
      
      await storage.updateUserGhinConnection(userId, {
        ghinConnected: false,
        ghinAccessToken: undefined,
        ghinRefreshToken: undefined,
        lastGhinSync: undefined,
      });

      res.json({ message: "GHIN account disconnected successfully" });
    } catch (error) {
      console.error("GHIN disconnect error:", error);
      res.status(500).json({ message: "Failed to disconnect GHIN account" });
    }
  });



  const httpServer = createServer(app);
  return httpServer;
}
