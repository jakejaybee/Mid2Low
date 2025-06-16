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
    this.currentUserId = 1;
    this.currentRoundId = 1;

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

    // Add sample rounds
    const sampleRounds: Round[] = [
      {
        id: 1,
        userId: 1,
        date: new Date('2024-01-15'),
        courseName: "Westfield Country Club",
        totalScore: 85,
        courseRating: "71.2",
        slopeRating: 125,
        differential: "12.6",
        fairwaysHit: 8,
        greensInRegulation: 10,
        totalPutts: 32,
        penalties: 2,
        screenshotUrl: null,
        processed: false,
        createdAt: new Date(),
      },
      {
        id: 2,
        userId: 1,
        date: new Date('2024-01-22'),
        courseName: "Pine Valley Golf Course",
        totalScore: 82,
        courseRating: "69.8",
        slopeRating: 118,
        differential: "11.7",
        fairwaysHit: 9,
        greensInRegulation: 12,
        totalPutts: 30,
        penalties: 1,
        screenshotUrl: null,
        processed: false,
        createdAt: new Date(),
      },
      {
        id: 3,
        userId: 1,
        date: new Date('2024-01-29'),
        courseName: "Oak Ridge Golf Club",
        totalScore: 88,
        courseRating: "72.5",
        slopeRating: 132,
        differential: "13.3",
        fairwaysHit: 6,
        greensInRegulation: 8,
        totalPutts: 35,
        penalties: 3,
        screenshotUrl: null,
        processed: false,
        createdAt: new Date(),
      }
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
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      id, 
      ...insertUser,
      handicap: insertUser.handicap || null,
      ghinNumber: insertUser.ghinNumber || null,
      ghinConnected: insertUser.ghinConnected || false,
      ghinAccessToken: insertUser.ghinAccessToken || null,
      ghinRefreshToken: insertUser.ghinRefreshToken || null,
      lastGhinSync: insertUser.lastGhinSync || null,
      createdAt: new Date()
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
    const updatedUser = { ...user, ...ghinData };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getRounds(userId: number): Promise<Round[]> {
    const userRounds = Array.from(this.rounds.values())
      .filter(round => round.userId === userId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    return userRounds;
  }

  async getRound(id: number): Promise<Round | undefined> {
    return this.rounds.get(id);
  }

  async createRound(insertRound: InsertRound): Promise<Round> {
    const id = this.currentRoundId++;
    const round: Round = {
      id,
      ...insertRound,
      differential: this.calculateDifferential(insertRound),
      processed: false,
      createdAt: new Date(),
      courseRating: insertRound.courseRating || null,
      slopeRating: insertRound.slopeRating || null,
      fairwaysHit: insertRound.fairwaysHit || null,
      greensInRegulation: insertRound.greensInRegulation || null,
      totalPutts: insertRound.totalPutts || null,
      penalties: insertRound.penalties || null,
      screenshotUrl: insertRound.screenshotUrl || null,
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