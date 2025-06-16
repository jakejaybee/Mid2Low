import { users, activities, type User, type InsertUser, type Activity, type InsertActivity } from "@shared/schema";

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

  // Activity operations
  getActivities(userId: number): Promise<Activity[]>;
  getActivity(id: number): Promise<Activity | undefined>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  updateActivity(id: number, updates: Partial<Activity>): Promise<Activity>;
  getRecentActivities(userId: number, limit: number): Promise<Activity[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private activities: Map<number, Activity>;
  private currentUserId: number;
  private currentActivityId: number;

  constructor() {
    this.users = new Map();
    this.activities = new Map();
    this.currentUserId = 1;
    this.currentActivityId = 1;

    // Initialize with sample user and activities
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

    // Add sample activities
    const sampleActivities: Activity[] = [
      {
        id: 1,
        userId: 1,
        date: new Date('2024-12-15'),
        activityType: "on-course",
        subType: "playing-18-holes-walking",
        startTime: new Date('2024-12-15T08:00:00'),
        endTime: new Date('2024-12-15T12:30:00'),
        duration: 270,
        comment: "Beautiful morning round at Pebble Beach. Shot 82, felt great about my putting today.",
        metadata: {
          course: "Pebble Beach Golf Links",
          score: 82,
          fairwaysHit: 10,
          greensInRegulation: 12,
          putts: 29
        },
        createdAt: new Date(),
      },
      {
        id: 2,
        userId: 1,
        date: new Date('2024-12-14'),
        activityType: "practice-area",
        subType: "driving-range",
        startTime: new Date('2024-12-14T17:00:00'),
        endTime: new Date('2024-12-14T18:00:00'),
        duration: 60,
        comment: "Worked on my driver swing. Hit about 80 balls, focusing on tempo.",
        metadata: {
          bucketSize: "large",
          ballsHit: 80,
          focusArea: "driver-swing"
        },
        createdAt: new Date(),
      },
      {
        id: 3,
        userId: 1,
        date: new Date('2024-12-13'),
        activityType: "off-course",
        subType: "golf-strength-training",
        startTime: new Date('2024-12-13T06:30:00'),
        endTime: new Date('2024-12-13T07:30:00'),
        duration: 60,
        comment: "Core and rotational strength workout. Felt really good today.",
        metadata: {
          workoutType: "core-and-rotation",
          intensity: "moderate"
        },
        createdAt: new Date(),
      }
    ];

    sampleActivities.forEach(activity => {
      this.activities.set(activity.id, activity);
    });
    this.currentActivityId = 4;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of Array.from(this.users.values())) {
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

  async getActivities(userId: number): Promise<Activity[]> {
    const userActivities = Array.from(this.activities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    return userActivities;
  }

  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.currentActivityId++;
    const activity: Activity = {
      id,
      ...insertActivity,
      startTime: insertActivity.startTime || null,
      endTime: insertActivity.endTime || null,
      duration: insertActivity.duration || null,
      comment: insertActivity.comment || null,
      metadata: insertActivity.metadata || null,
      subType: insertActivity.subType || null,
      createdAt: new Date(),
    };
    this.activities.set(id, activity);
    return activity;
  }

  async updateActivity(id: number, updates: Partial<Activity>): Promise<Activity> {
    const activity = this.activities.get(id);
    if (!activity) {
      throw new Error("Activity not found");
    }
    const updatedActivity = { ...activity, ...updates };
    this.activities.set(id, updatedActivity);
    return updatedActivity;
  }

  async getRecentActivities(userId: number, limit: number): Promise<Activity[]> {
    const userActivities = await this.getActivities(userId);
    return userActivities.slice(0, limit);
  }
}

export const storage = new MemStorage();