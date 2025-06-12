import { z } from "zod";

// GHIN API configuration
const GHIN_API_BASE_URL = process.env.GHIN_API_BASE_URL || "https://api.ghin.com/api/v1";
const GHIN_CLIENT_ID = process.env.GHIN_CLIENT_ID;
const GHIN_CLIENT_SECRET = process.env.GHIN_CLIENT_SECRET;

// GHIN API response schemas
const GhinPlayerSchema = z.object({
  ghin_number: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  handicap_index: z.number().nullable(),
  club_name: z.string().optional(),
  state: z.string().optional(),
});

const GhinScoreSchema = z.object({
  score_date: z.string(),
  course_name: z.string(),
  gross_score: z.number(),
  adjusted_gross_score: z.number(),
  course_rating: z.number(),
  slope_rating: z.number(),
  playing_conditions_calculation: z.number().optional(),
  differential: z.number(),
  tee_name: z.string().optional(),
});

const GhinAuthResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number(),
  token_type: z.string(),
});

export type GhinPlayer = z.infer<typeof GhinPlayerSchema>;
export type GhinScore = z.infer<typeof GhinScoreSchema>;
export type GhinAuthResponse = z.infer<typeof GhinAuthResponseSchema>;

export class GhinApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(accessToken?: string, refreshToken?: string) {
    this.accessToken = accessToken || null;
    this.refreshToken = refreshToken || null;
  }

  // Step 1: Get authorization URL for OAuth flow
  getAuthorizationUrl(redirectUri: string, state?: string): string {
    if (!GHIN_CLIENT_ID) {
      throw new Error("GHIN_CLIENT_ID not configured");
    }

    const params = new URLSearchParams({
      response_type: "code",
      client_id: GHIN_CLIENT_ID,
      redirect_uri: redirectUri,
      scope: "profile scores",
      ...(state && { state }),
    });

    return `${GHIN_API_BASE_URL}/oauth/authorize?${params}`;
  }

  // Step 2: Exchange authorization code for access token
  async exchangeCodeForTokens(code: string, redirectUri: string): Promise<GhinAuthResponse> {
    if (!GHIN_CLIENT_ID || !GHIN_CLIENT_SECRET) {
      throw new Error("GHIN OAuth credentials not configured");
    }

    const response = await fetch(`${GHIN_API_BASE_URL}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: GHIN_CLIENT_ID,
        client_secret: GHIN_CLIENT_SECRET,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GHIN OAuth token exchange failed: ${error}`);
    }

    const data = await response.json();
    const tokens = GhinAuthResponseSchema.parse(data);
    
    this.accessToken = tokens.access_token;
    this.refreshToken = tokens.refresh_token;
    
    return tokens;
  }

  // Step 3: Refresh access token
  async refreshAccessToken(): Promise<GhinAuthResponse> {
    if (!this.refreshToken || !GHIN_CLIENT_ID || !GHIN_CLIENT_SECRET) {
      throw new Error("Refresh token or OAuth credentials not available");
    }

    const response = await fetch(`${GHIN_API_BASE_URL}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: this.refreshToken,
        client_id: GHIN_CLIENT_ID,
        client_secret: GHIN_CLIENT_SECRET,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GHIN token refresh failed: ${error}`);
    }

    const data = await response.json();
    const tokens = GhinAuthResponseSchema.parse(data);
    
    this.accessToken = tokens.access_token;
    this.refreshToken = tokens.refresh_token;
    
    return tokens;
  }

  // Get player profile information
  async getPlayerProfile(): Promise<GhinPlayer> {
    const response = await this.makeAuthenticatedRequest("/player/profile");
    return GhinPlayerSchema.parse(response);
  }

  // Get player's score history
  async getPlayerScores(startDate?: string, endDate?: string, limit: number = 20): Promise<GhinScore[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      ...(startDate && { start_date: startDate }),
      ...(endDate && { end_date: endDate }),
    });

    const response = await this.makeAuthenticatedRequest(`/player/scores?${params}`);
    
    if (Array.isArray(response)) {
      return response.map(score => GhinScoreSchema.parse(score));
    }
    
    return [];
  }

  // Get current handicap index
  async getCurrentHandicap(): Promise<number | null> {
    const profile = await this.getPlayerProfile();
    return profile.handicap_index;
  }

  // Sync latest scores (get scores from last sync date)
  async syncLatestScores(lastSyncDate?: Date): Promise<GhinScore[]> {
    const startDate = lastSyncDate 
      ? lastSyncDate.toISOString().split('T')[0]
      : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Default to last 90 days

    return this.getPlayerScores(startDate, undefined, 50);
  }

  // Private helper for making authenticated requests
  private async makeAuthenticatedRequest(endpoint: string): Promise<any> {
    if (!this.accessToken) {
      throw new Error("No access token available. Please authenticate first.");
    }

    let response = await fetch(`${GHIN_API_BASE_URL}${endpoint}`, {
      headers: {
        "Authorization": `Bearer ${this.accessToken}`,
        "Accept": "application/json",
      },
    });

    // If token expired, try to refresh
    if (response.status === 401 && this.refreshToken) {
      try {
        await this.refreshAccessToken();
        response = await fetch(`${GHIN_API_BASE_URL}${endpoint}`, {
          headers: {
            "Authorization": `Bearer ${this.accessToken}`,
            "Accept": "application/json",
          },
        });
      } catch (refreshError) {
        throw new Error("Authentication failed. Please reconnect your GHIN account.");
      }
    }

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GHIN API request failed: ${error}`);
    }

    return response.json();
  }

  // Convert GHIN score to our internal round format
  static convertGhinScoreToRound(ghinScore: GhinScore, userId: number) {
    return {
      userId,
      date: new Date(ghinScore.score_date),
      courseName: ghinScore.course_name,
      totalScore: ghinScore.gross_score,
      courseRating: ghinScore.course_rating.toString(),
      slopeRating: ghinScore.slope_rating,
      differential: ghinScore.differential.toString(),
      fairwaysHit: null, // GHIN API doesn't provide detailed stats
      greensInRegulation: null,
      totalPutts: null,
      penalties: null,
      screenshotUrl: null,
    };
  }
}