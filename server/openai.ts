import OpenAI from "openai";
import fs from "fs";
import type { Round } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

interface PracticePlanRequest {
  handicap: number;
  recentRounds: Round[];
  daysPerWeek: number;
  hoursPerSession: number;
  preferredTime: string;
  availableResources: string[];
  practiceGoal: string;
}

interface PracticePlanResponse {
  focusAreas: string[];
  weeklySchedule: any[];
  recommendations: string;
}

export async function generatePracticePlan(request: PracticePlanRequest): Promise<PracticePlanResponse> {
  try {
    // Analyze recent performance
    const performanceAnalysis = analyzePerformance(request.recentRounds);
    
    const prompt = `Generate a personalized golf practice plan based on the following information:

Player Profile:
- Handicap: ${request.handicap}
- Practice availability: ${request.daysPerWeek} days per week, ${request.hoursPerSession} hours per session
- Preferred time: ${request.preferredTime}
- Practice goal: ${request.practiceGoal}
- Available resources: ${request.availableResources.join(', ')}

Recent Performance Analysis:
${performanceAnalysis}

Please provide a detailed weekly practice schedule with the following structure:
{
  "focusAreas": ["primary_weakness", "secondary_focus", "maintenance_area"],
  "weeklySchedule": [
    {
      "day": "Monday",
      "title": "Session Title",
      "duration": "${request.hoursPerSession} hours",
      "activities": [
        {
          "name": "Activity Name",
          "duration": "X minutes",
          "description": "Detailed description",
          "location": "Required facility/resource",
          "focus": "skill_area"
        }
      ]
    }
  ],
  "recommendations": "Specific advice for improvement and expected results"
}

Focus on the player's biggest weaknesses while maintaining strengths. Provide specific, actionable practice drills.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert golf instructor and practice plan designer. Create detailed, practical practice plans that target specific weaknesses and provide measurable improvement goals."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result;
  } catch (error) {
    console.error("Practice plan generation failed:", error);
    
    // Fallback practice plan
    return {
      focusAreas: ["putting", "short game", "course management"],
      weeklySchedule: [
        {
          day: "Monday",
          title: "Putting Focus",
          duration: `${request.hoursPerSession} hours`,
          activities: [
            {
              name: "Distance Control Putting",
              duration: "45 minutes",
              description: "Practice lag putting from 20, 30, and 40 feet. Focus on getting within 3 feet of the hole.",
              location: "Putting Green",
              focus: "putting"
            },
            {
              name: "Short Putting Precision",
              duration: "30 minutes",
              description: "Make 50 putts from 3 feet, then 25 from 6 feet. Focus on consistent stroke tempo.",
              location: "Putting Green",
              focus: "putting"
            }
          ]
        }
      ],
      recommendations: "Focus on putting fundamentals to improve your scoring. Consistent practice should reduce your handicap by 2-3 strokes over 6-8 weeks."
    };
  }
}

// Screenshot analysis removed - using GHIN API integration instead
export async function analyzeScreenshot(imagePath: string): Promise<any | null> {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this GHIN app screenshot and extract golf round data. Return the data in JSON format with these fields:
{
  "courseName": "course name",
  "totalScore": number,
  "courseRating": number,
  "slopeRating": number,
  "fairwaysHit": number,
  "greensInRegulation": number,
  "totalPutts": number,
  "penalties": number,
  "date": "YYYY-MM-DD"
}

Only return valid data that you can clearly read from the screenshot. If any field is not visible or unclear, omit it from the response.`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    // Clean up the uploaded file
    fs.unlinkSync(imagePath);
    
    return result;
  } catch (error) {
    console.error("Screenshot analysis failed:", error);
    
    // Clean up the uploaded file even if analysis fails
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    
    return null;
  }
}

function analyzePerformance(rounds: Round[]): string {
  if (rounds.length === 0) {
    return "No recent rounds available for analysis.";
  }

  const totalRounds = rounds.length;
  const avgScore = rounds.reduce((sum, r) => sum + r.totalScore, 0) / totalRounds;
  const avgFairways = rounds.reduce((sum, r) => sum + (r.fairwaysHit || 0), 0) / totalRounds;
  const avgGIR = rounds.reduce((sum, r) => sum + (r.greensInRegulation || 0), 0) / totalRounds;
  const avgPutts = rounds.reduce((sum, r) => sum + (r.totalPutts || 0), 0) / totalRounds;

  return `
Recent Performance (${totalRounds} rounds):
- Average Score: ${avgScore.toFixed(1)}
- Average Fairways Hit: ${avgFairways.toFixed(1)}/14 (${((avgFairways/14)*100).toFixed(1)}%)
- Average Greens in Regulation: ${avgGIR.toFixed(1)}/18 (${((avgGIR/18)*100).toFixed(1)}%)
- Average Total Putts: ${avgPutts.toFixed(1)}
- Putts per GIR: ${avgGIR > 0 ? (avgPutts/avgGIR).toFixed(1) : 'N/A'}

Key Areas for Improvement:
${avgFairways < 7 ? "- Driving accuracy needs work (below 50%)" : ""}
${avgGIR < 9 ? "- Iron play and approach shots need attention" : ""}
${(avgPutts/avgGIR) > 2.0 ? "- Putting is the biggest weakness - focus here first" : ""}
${avgPutts < 30 ? "- Putting is a strength, maintain with light practice" : ""}
  `.trim();
}
