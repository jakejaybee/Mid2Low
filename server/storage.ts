import { users, rounds, type User, type InsertUser, type Round, type InsertRound } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserHandicap(userId: number, handicap: number): Promise<User>;
  updateUserGhinConnection(userId: number, ghinData: {
    ghinNumber?: string;
    ghinConnected?: boolean;
    ghinAccessToken?: string;
    ghinRefreshToken?: string;
    lastGhinSync?: Date;
  }): Promise<User>;

  // Round operations
  getRounds(userId: number): Promise<Round[]>;
  getRound(id: number): Promise<Round | undefined>;
  createRound(round: InsertRound): Promise<Round>;
  updateRound(id: number, updates: Partial<Round>): Promise<Round>;
  getRecentRounds(userId: number, limit: number): Promise<Round[]>;


}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private rounds: Map<number, Round>;
  private currentUserId: number;
  private currentRoundId: number;

  constructor() {
    this.users = new Map();
    this.rounds = new Map();
    this.resources = new Map();
    this.practicePlans = new Map();
    this.currentUserId = 1;
    this.currentRoundId = 1;
    this.currentResourceId = 1;
    this.currentPlanId = 1;

    // Initialize with sample user
    this.initializeData();
  }

  private initializeData() {
    const sampleUser: User = {
      id: 1,
      username: "mike.johnson",
      password: "password123",
      name: "Mike Johnson",
      handicap: "12.4",
      ghinNumber: null,
      ghinConnected: false,
      ghinAccessToken: null,
      ghinRefreshToken: null,
      lastGhinSync: null,
      createdAt: new Date(),
    };
    this.users.set(1, sampleUser);
    this.currentUserId = 2;

    // Add sample resources
    const sampleResources: Resource[] = [
      {
        id: 1,
        userId: 1,
        type: "facility",
        name: "Driving Range",
        description: "Westfield Golf Center",
        location: "5 minutes from home",
        hours: "6:00 AM - 10:00 PM",
        cost: "$15/bucket",
        available: true,
        createdAt: new Date(),
      },
      {
        id: 2,
        userId: 1,
        type: "facility",
        name: "Putting Green",
        description: "Large green with various slopes",
        location: "Westfield Golf Center",
        hours: "6:00 AM - 10:00 PM",
        cost: "Free with range usage",
        available: true,
        createdAt: new Date(),
      },
      {
        id: 3,
        userId: 1,
        type: "equipment",
        name: "Full Club Set",
        description: "Titleist T200 Irons, Ping Driver",
        location: null,
        hours: null,
        cost: null,
        available: true,
        createdAt: new Date(),
      },
      {
        id: 4,
        userId: 1,
        type: "equipment",
        name: "Alignment Sticks",
        description: "Practice aids for setup",
        location: null,
        hours: null,
        cost: null,
        available: true,
        createdAt: new Date(),
      },
    ];

    sampleResources.forEach(resource => {
      this.resources.set(resource.id, resource);
    });
    this.currentResourceId = 5;

    // Add sample rounds
    const sampleRounds: Round[] = [
      {
        id: 1,
        userId: 1,
        date: new Date('2024-12-18'),
        courseName: "Pebble Beach Golf Links",
        totalScore: 84,
        courseRating: "72.1",
        slopeRating: 131,
        differential: "12.8",
        fairwaysHit: 8,
        greensInRegulation: 9,
        totalPutts: 32,
        penalties: 2,
        screenshotUrl: null,
        processed: true,
        createdAt: new Date(),
      },
      {
        id: 2,
        userId: 1,
        date: new Date('2024-12-15'),
        courseName: "Torrey Pines South",
        totalScore: 88,
        courseRating: "74.6",
        slopeRating: 129,
        differential: "14.2",
        fairwaysHit: 6,
        greensInRegulation: 7,
        totalPutts: 35,
        penalties: 3,
        screenshotUrl: null,
        processed: false,
        createdAt: new Date(),
      },
      {
        id: 3,
        userId: 1,
        date: new Date('2024-12-12'),
        courseName: "Spyglass Hill",
        totalScore: 79,
        courseRating: "71.8",
        slopeRating: 143,
        differential: "8.4",
        fairwaysHit: 10,
        greensInRegulation: 12,
        totalPutts: 28,
        penalties: 1,
        screenshotUrl: null,
        processed: true,
        createdAt: new Date(),
      },
    ];

    sampleRounds.forEach(round => {
      this.rounds.set(round.id, round);
    });
    this.currentRoundId = 4;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserHandicap(userId: number, handicap: number): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const updatedUser = { ...user, handicap: handicap.toString() };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserGhinConnection(userId: number, ghinData: {
    ghinNumber?: string;
    ghinConnected?: boolean;
    ghinAccessToken?: string;
    ghinRefreshToken?: string;
    lastGhinSync?: Date;
  }): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const updatedUser = { 
      ...user, 
      ghinNumber: ghinData.ghinNumber ?? user.ghinNumber,
      ghinConnected: ghinData.ghinConnected ?? user.ghinConnected,
      ghinAccessToken: ghinData.ghinAccessToken ?? user.ghinAccessToken,
      ghinRefreshToken: ghinData.ghinRefreshToken ?? user.ghinRefreshToken,
      lastGhinSync: ghinData.lastGhinSync ?? user.lastGhinSync,
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getRounds(userId: number): Promise<Round[]> {
    return Array.from(this.rounds.values())
      .filter(round => round.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getRound(id: number): Promise<Round | undefined> {
    return this.rounds.get(id);
  }

  async createRound(insertRound: InsertRound): Promise<Round> {
    const id = this.currentRoundId++;
    const round: Round = {
      ...insertRound,
      id,
      differential: this.calculateDifferential(insertRound),
      processed: false,
      createdAt: new Date(),
    };
    this.rounds.set(id, round);
    return round;
  }

  async updateRound(id: number, updates: Partial<Round>): Promise<Round> {
    const round = this.rounds.get(id);
    if (!round) {
      throw new Error("Round not found");
    }
    const updatedRound = { ...round, ...updates };
    this.rounds.set(id, updatedRound);
    return updatedRound;
  }

  async getRecentRounds(userId: number, limit: number): Promise<Round[]> {
    const userRounds = await this.getRounds(userId);
    return userRounds.slice(0, limit);
  }

  async getResources(userId: number): Promise<Resource[]> {
    return Array.from(this.resources.values())
      .filter(resource => resource.userId === userId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async createResource(insertResource: InsertResource): Promise<Resource> {
    const id = this.currentResourceId++;
    const resource: Resource = {
      ...insertResource,
      id,
      createdAt: new Date(),
    };
    this.resources.set(id, resource);
    return resource;
  }

  async updateResource(id: number, updates: Partial<Resource>): Promise<Resource> {
    const resource = this.resources.get(id);
    if (!resource) {
      throw new Error("Resource not found");
    }
    const updatedResource = { ...resource, ...updates };
    this.resources.set(id, updatedResource);
    return updatedResource;
  }

  async deleteResource(id: number): Promise<void> {
    this.resources.delete(id);
  }

  async getPracticePlans(userId: number): Promise<PracticePlan[]> {
    return Array.from(this.practicePlans.values())
      .filter(plan => plan.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getActivePracticePlan(userId: number): Promise<PracticePlan | undefined> {
    return Array.from(this.practicePlans.values())
      .find(plan => plan.userId === userId && plan.active);
  }

  async createPracticePlan(insertPlan: InsertPracticePlan): Promise<PracticePlan> {
    const id = this.currentPlanId++;
    const plan: PracticePlan = {
      ...insertPlan,
      id,
      createdAt: new Date(),
    };
    this.practicePlans.set(id, plan);
    return plan;
  }

  async updatePracticePlan(id: number, updates: Partial<PracticePlan>): Promise<PracticePlan> {
    const plan = this.practicePlans.get(id);
    if (!plan) {
      throw new Error("Practice plan not found");
    }
    const updatedPlan = { ...plan, ...updates };
    this.practicePlans.set(id, updatedPlan);
    return updatedPlan;
  }

  private calculateDifferential(round: InsertRound): string {
    if (!round.courseRating || !round.slopeRating) {
      return "0.0";
    }
    const courseRating = parseFloat(round.courseRating.toString());
    const slopeRating = parseInt(round.slopeRating.toString());
    const differential = ((round.totalScore - courseRating) * 113) / slopeRating;
    return differential.toFixed(1);
  }
}

export const storage = new MemStorage();
