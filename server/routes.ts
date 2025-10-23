import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertManagerSchema,
  insertCompetencySchema,
  insertSelfAssessmentSchema,
  insertFeedbackSchema,
  insertPulseCheckSchema,
  insertJournalEntrySchema,
  insertGrowGoalSchema,
  insertSimulationSchema,
} from "@shared/schema";
import {
  analyze360Feedback,
  analyzeJournalSentiment,
  generateRoleplayResponse,
  evaluateRoleplaySession,
  generateSimulationFeedback,
} from "./gemini";
import { format } from "date-fns";

export async function registerRoutes(app: Express): Promise<Server> {
  // Managers
  app.get("/api/managers", async (req: Request, res: Response) => {
    try {
      const managers = await storage.getManagers();
      res.json(managers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/managers", async (req: Request, res: Response) => {
    try {
      const data = insertManagerSchema.parse(req.body);
      const manager = await storage.createManager(data);
      res.json(manager);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Competencies
  app.get("/api/competencies", async (req: Request, res: Response) => {
    try {
      const competencies = await storage.getCompetencies();
      res.json(competencies);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/competencies", async (req: Request, res: Response) => {
    try {
      const data = insertCompetencySchema.parse(req.body);
      const competency = await storage.createCompetency(data);
      res.json(competency);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Self Assessments
  app.post("/api/self-assessments", async (req: Request, res: Response) => {
    try {
      const data = insertSelfAssessmentSchema.parse(req.body);
      const assessment = await storage.createSelfAssessment(data);
      res.json(assessment);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // 360 Feedbacks
  app.post("/api/feedbacks", async (req: Request, res: Response) => {
    try {
      const data = insertFeedbackSchema.parse(req.body);
      const feedback = await storage.createFeedback(data);

      // Trigger AI analysis in background (don't await)
      const managerId = feedback.managerId;
      Promise.resolve().then(async () => {
        try {
          const selfAssessments = await storage.getSelfAssessments(managerId);
          const feedbacks = await storage.getFeedbacks(managerId);
          const competencies = await storage.getCompetencies();

          if (selfAssessments.length > 0 && feedbacks.length >= 3) {
            const latestSelf = selfAssessments[selfAssessments.length - 1];
            const analysis = await analyze360Feedback({
              managerId,
              selfAssessment: latestSelf.responses as Record<string, number>,
              feedbacks: feedbacks.map((f) => ({
                responses: f.responses as Record<string, number>,
                comments: f.comments as Record<string, string>,
              })),
              competencies,
            });

            await storage.createAiAnalysis({
              managerId,
              sourceType: "360_feedback",
              sourceId: null,
              summary: analysis.summary,
              themes: analysis.themes,
              sentimentScore: analysis.sentimentScore,
              strengths: analysis.strengths,
              developmentAreas: analysis.developmentAreas,
              actionItems: analysis.actionItems,
            });
          }
        } catch (error) {
          console.error("Background AI analysis failed:", error);
        }
      });

      res.json(feedback);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Pulse Checks
  app.post("/api/pulse", async (req: Request, res: Response) => {
    try {
      const data = insertPulseCheckSchema.parse(req.body);
      const pulse = await storage.createPulseCheck(data);
      res.json(pulse);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/pulse/history", async (req: Request, res: Response) => {
    try {
      const pulseChecks = await storage.getPulseChecks();
      
      // Group by week and calculate averages
      const weeklyData: Record<string, { listenedTo: number[]; workloadFair: number[]; managerHelpful: number[] }> = {};
      
      pulseChecks.forEach((pulse) => {
        const week = format(new Date(pulse.createdAt!), "MMM d");
        if (!weeklyData[week]) {
          weeklyData[week] = { listenedTo: [], workloadFair: [], managerHelpful: [] };
        }
        weeklyData[week].listenedTo.push(pulse.listenedTo);
        weeklyData[week].workloadFair.push(pulse.workloadFair);
        weeklyData[week].managerHelpful.push(pulse.managerHelpful);
      });

      const history = Object.entries(weeklyData).map(([week, data]) => ({
        week,
        listenedTo: data.listenedTo.reduce((a, b) => a + b, 0) / data.listenedTo.length,
        workloadFair: data.workloadFair.reduce((a, b) => a + b, 0) / data.workloadFair.length,
        managerHelpful: data.managerHelpful.reduce((a, b) => a + b, 0) / data.managerHelpful.length,
      }));

      res.json(history);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Journal
  app.post("/api/journal", async (req: Request, res: Response) => {
    try {
      const data = insertJournalEntrySchema.parse(req.body);
      const entry = await storage.createJournalEntry(data);

      // Analyze sentiment in background
      Promise.resolve().then(async () => {
        try {
          const analysis = await analyzeJournalSentiment(entry.text);
          await storage.updateJournalEntry(entry.id, {
            sentimentScore: analysis.sentimentScore,
            emotionTags: analysis.emotionTags,
          });
        } catch (error) {
          console.error("Background sentiment analysis failed:", error);
        }
      });

      res.json(entry);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/journal/entries", async (req: Request, res: Response) => {
    try {
      const entries = await storage.getJournalEntries();
      res.json(entries);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GROW Goals
  app.post("/api/grow/goals", async (req: Request, res: Response) => {
    try {
      const data = insertGrowGoalSchema.parse(req.body);
      const goal = await storage.createGrowGoal(data);
      res.json(goal);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/grow/goals", async (req: Request, res: Response) => {
    try {
      const goals = await storage.getGrowGoals();
      res.json(goals);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Role-play
  app.post("/api/roleplay/message", async (req: Request, res: Response) => {
    try {
      const { managerId, message, sessionId } = req.body;

      let session;
      if (sessionId) {
        session = await storage.getRoleplaySession(sessionId);
        if (!session) {
          return res.status(404).json({ error: "Session not found" });
        }
      } else {
        session = await storage.createRoleplaySession({
          managerId,
          messages: [],
          evaluation: null,
          sbiScore: null,
          toneScore: null,
        });
      }

      // Add user message
      const messages = [
        ...(session.messages as any[]),
        { role: "user", content: message },
      ];

      // Generate AI response
      const aiResponse = await generateRoleplayResponse(messages);
      messages.push({ role: "ai", content: aiResponse });

      // Update session
      await storage.updateRoleplaySession(session.id, { messages });

      res.json({ sessionId: session.id, messages });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/roleplay/evaluate", async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.body;
      const session = await storage.getRoleplaySession(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      const evaluation = await evaluateRoleplaySession(session.messages as any[]);
      
      await storage.updateRoleplaySession(sessionId, {
        evaluation: evaluation.evaluation,
        sbiScore: evaluation.sbiScore,
        toneScore: evaluation.toneScore,
      });

      res.json(evaluation);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/roleplay/sessions", async (req: Request, res: Response) => {
    try {
      const sessions = await storage.getRoleplaySessions();
      res.json(sessions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Simulations
  app.post("/api/simulations", async (req: Request, res: Response) => {
    try {
      const data = insertSimulationSchema.parse(req.body);
      
      // Calculate scores based on choice (simplified for MVP)
      const baseMorale = 5;
      const basePerformance = 5;
      
      // Get choice impact from frontend scenarios
      const teamMoraleScore = baseMorale + Math.floor(Math.random() * 3) + 2;
      const performanceScore = basePerformance + Math.floor(Math.random() * 3) + 2;
      
      // Generate AI feedback
      const feedback = await generateSimulationFeedback(
        data.scenarioId,
        data.choices[0] as string,
        "Leadership Theory"
      );

      const simulation = await storage.createSimulation({
        ...data,
        teamMoraleScore,
        performanceScore,
        feedback,
      });

      res.json(simulation);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/simulations/history/:managerId", async (req: Request, res: Response) => {
    try {
      const { managerId } = req.params;
      const simulations = await storage.getSimulations(managerId);
      res.json(simulations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Reports
  app.get("/api/reports/:managerId", async (req: Request, res: Response) => {
    try {
      const { managerId } = req.params;
      const analyses = await storage.getAiAnalyses(managerId);
      
      if (analyses.length === 0) {
        return res.json(null);
      }

      // Return latest analysis
      const latest = analyses[0];
      res.json({
        summary: latest.summary,
        themes: latest.themes,
        strengths: latest.strengths,
        developmentAreas: latest.developmentAreas,
        actionItems: latest.actionItems,
        sentimentScore: latest.sentimentScore,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/reports/:managerId/pdf", async (req: Request, res: Response) => {
    try {
      const { managerId } = req.params;
      const analyses = await storage.getAiAnalyses(managerId);
      const manager = await storage.getManager(managerId);

      if (analyses.length === 0 || !manager) {
        return res.status(404).json({ error: "Report not found" });
      }

      const latest = analyses[0];
      
      // Simple CSV format for MVP (can be enhanced with PDF library)
      const csv = `360° Feedback Report - ${manager.name}\n\n` +
        `Summary:\n${latest.summary}\n\n` +
        `Strengths:\n${(latest.strengths as string[]).join("\n")}\n\n` +
        `Development Areas:\n${(latest.developmentAreas as string[]).join("\n")}\n\n` +
        `Action Items:\n${(latest.actionItems as string[]).join("\n")}`;

      res.setHeader("Content-Type", "text/plain");
      res.setHeader("Content-Disposition", `attachment; filename="360-report-${managerId}.txt"`);
      res.send(csv);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Dashboard
  app.get("/api/dashboard/radar", async (req: Request, res: Response) => {
    try {
      const competencies = await storage.getCompetencies();
      const selfAssessments = await storage.getSelfAssessments();
      const feedbacks = await storage.getFeedbacks();

      if (selfAssessments.length === 0) {
        return res.json({
          competencies: [],
          selfAssessmentCount: 0,
          feedbackCount: 0,
          growthPercentage: 0,
          growthStatus: "No data",
        });
      }

      const latestSelf = selfAssessments[selfAssessments.length - 1];
      const selfResponses = latestSelf.responses as Record<string, number>;

      // Calculate average feedback scores
      const avgFeedback: Record<string, number> = {};
      competencies.forEach((comp) => {
        const scores = feedbacks
          .map((f) => (f.responses as Record<string, number>)[comp.id])
          .filter((s) => s !== undefined);
        avgFeedback[comp.id] = scores.length > 0
          ? scores.reduce((a, b) => a + b, 0) / scores.length
          : 0;
      });

      const radarData = competencies.map((comp) => ({
        name: comp.name,
        self: selfResponses[comp.id] || 0,
        feedback: avgFeedback[comp.id] || 0,
      }));

      // Calculate growth (compare latest two assessments if available)
      let growthPercentage = 0;
      if (selfAssessments.length >= 2) {
        const previousSelf = selfAssessments[selfAssessments.length - 2];
        const previousResponses = previousSelf.responses as Record<string, number>;
        const currentAvg = Object.values(selfResponses).reduce((a, b) => a + b, 0) / Object.values(selfResponses).length;
        const previousAvg = Object.values(previousResponses).reduce((a, b) => a + b, 0) / Object.values(previousResponses).length;
        growthPercentage = Math.round(((currentAvg - previousAvg) / previousAvg) * 100);
      }

      res.json({
        competencies: radarData,
        selfAssessmentCount: selfAssessments.length,
        feedbackCount: feedbacks.length,
        growthPercentage: Math.abs(growthPercentage),
        growthStatus: growthPercentage > 0 ? "Growing" : growthPercentage < 0 ? "Declining" : "Stable",
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/dashboard/trends", async (req: Request, res: Response) => {
    try {
      const selfAssessments = await storage.getSelfAssessments();
      const feedbacks = await storage.getFeedbacks();

      if (selfAssessments.length === 0) {
        return res.json([]);
      }

      const trends = selfAssessments.map((assessment, index) => {
        const selfResponses = assessment.responses as Record<string, number>;
        const selfAvg = Object.values(selfResponses).reduce((a, b) => a + b, 0) / Object.values(selfResponses).length;

        // Get feedback average for this period (simplified)
        const relevantFeedbacks = feedbacks.slice(0, Math.ceil(feedbacks.length / selfAssessments.length) * (index + 1));
        const feedbackScores = relevantFeedbacks.flatMap((f) => Object.values(f.responses as Record<string, number>));
        const feedbackAvg = feedbackScores.length > 0
          ? feedbackScores.reduce((a, b) => a + b, 0) / feedbackScores.length
          : 0;

        return {
          date: format(new Date(assessment.createdAt!), "MMM d"),
          self: Number(selfAvg.toFixed(1)),
          feedback: Number(feedbackAvg.toFixed(1)),
        };
      });

      res.json(trends);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/dashboard/pulse", async (req: Request, res: Response) => {
    try {
      const pulseChecks = await storage.getPulseChecks();

      if (pulseChecks.length === 0) {
        return res.json({ averageScore: 0, metrics: [] });
      }

      const avgListened = pulseChecks.reduce((sum, p) => sum + p.listenedTo, 0) / pulseChecks.length;
      const avgWorkload = pulseChecks.reduce((sum, p) => sum + p.workloadFair, 0) / pulseChecks.length;
      const avgHelpful = pulseChecks.reduce((sum, p) => sum + p.managerHelpful, 0) / pulseChecks.length;
      const overall = (avgListened + avgWorkload + avgHelpful) / 3;

      res.json({
        averageScore: overall.toFixed(1),
        metrics: [
          { name: "Listened To", score: Number(avgListened.toFixed(1)) },
          { name: "Workload Fair", score: Number(avgWorkload.toFixed(1)) },
          { name: "Manager Helpful", score: Number(avgHelpful.toFixed(1)) },
        ],
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin
  app.get("/api/admin/stats", async (req: Request, res: Response) => {
    try {
      const managers = await storage.getManagers();
      const assessments = await storage.getSelfAssessments();
      const feedbacks = await storage.getFeedbacks();

      res.json({
        managersCount: managers.length,
        assessmentsCount: assessments.length,
        feedbackCount: feedbacks.length,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/export/:type", async (req: Request, res: Response) => {
    try {
      const { type } = req.params;
      let csv = "";

      switch (type) {
        case "managers": {
          const managers = await storage.getManagers();
          csv = "ID,Name,Department,Role,Created\n" +
            managers.map((m) => `${m.id},${m.name},${m.department || ""},${m.role || ""},${m.createdAt}`).join("\n");
          break;
        }
        case "assessments": {
          const assessments = await storage.getSelfAssessments();
          csv = "ID,Manager ID,Responses,Created\n" +
            assessments.map((a) => `${a.id},${a.managerId},${JSON.stringify(a.responses)},${a.createdAt}`).join("\n");
          break;
        }
        case "feedback": {
          const feedbacks = await storage.getFeedbacks();
          csv = "ID,Manager ID,Responses,Anonymous,Created\n" +
            feedbacks.map((f) => `${f.id},${f.managerId},${JSON.stringify(f.responses)},${f.isAnonymous},${f.createdAt}`).join("\n");
          break;
        }
        case "pulse": {
          const pulseChecks = await storage.getPulseChecks();
          csv = "ID,Manager ID,Listened To,Workload Fair,Manager Helpful,Created\n" +
            pulseChecks.map((p) => `${p.id},${p.managerId},${p.listenedTo},${p.workloadFair},${p.managerHelpful},${p.createdAt}`).join("\n");
          break;
        }
        default:
          return res.status(400).json({ error: "Invalid export type" });
      }

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="${type}-export.csv"`);
      res.send(csv);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
