import { randomUUID } from "crypto";
import type {
  Manager,
  InsertManager,
  Competency,
  InsertCompetency,
  SelfAssessment,
  InsertSelfAssessment,
  Feedback,
  InsertFeedback,
  PulseCheck,
  InsertPulseCheck,
  JournalEntry,
  InsertJournalEntry,
  GrowGoal,
  InsertGrowGoal,
  AiAnalysis,
  InsertAiAnalysis,
  Simulation,
  InsertSimulation,
  RoleplaySession,
  InsertRoleplaySession,
} from "@shared/schema";

export interface IStorage {
  // Managers
  getManagers(): Promise<Manager[]>;
  getManager(id: string): Promise<Manager | undefined>;
  createManager(manager: InsertManager): Promise<Manager>;

  // Competencies
  getCompetencies(): Promise<Competency[]>;
  getCompetency(id: string): Promise<Competency | undefined>;
  createCompetency(competency: InsertCompetency): Promise<Competency>;

  // Self Assessments
  getSelfAssessments(managerId?: string): Promise<SelfAssessment[]>;
  createSelfAssessment(assessment: InsertSelfAssessment): Promise<SelfAssessment>;

  // Feedbacks
  getFeedbacks(managerId?: string): Promise<Feedback[]>;
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;

  // Pulse Checks
  getPulseChecks(managerId?: string): Promise<PulseCheck[]>;
  createPulseCheck(pulse: InsertPulseCheck): Promise<PulseCheck>;

  // Journal Entries
  getJournalEntries(managerId?: string): Promise<JournalEntry[]>;
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  updateJournalEntry(id: string, update: Partial<JournalEntry>): Promise<JournalEntry | undefined>;

  // GROW Goals
  getGrowGoals(managerId?: string): Promise<GrowGoal[]>;
  createGrowGoal(goal: InsertGrowGoal): Promise<GrowGoal>;

  // AI Analyses
  getAiAnalyses(managerId: string): Promise<AiAnalysis[]>;
  createAiAnalysis(analysis: InsertAiAnalysis): Promise<AiAnalysis>;

  // Simulations
  getSimulations(managerId?: string): Promise<Simulation[]>;
  createSimulation(simulation: InsertSimulation): Promise<Simulation>;

  // Roleplay Sessions
  getRoleplaySessions(managerId?: string): Promise<RoleplaySession[]>;
  getRoleplaySession(id: string): Promise<RoleplaySession | undefined>;
  createRoleplaySession(session: InsertRoleplaySession): Promise<RoleplaySession>;
  updateRoleplaySession(id: string, update: Partial<RoleplaySession>): Promise<RoleplaySession | undefined>;
}

export class MemStorage implements IStorage {
  private managers: Map<string, Manager>;
  private competencies: Map<string, Competency>;
  private selfAssessments: Map<string, SelfAssessment>;
  private feedbacks: Map<string, Feedback>;
  private pulseChecks: Map<string, PulseCheck>;
  private journalEntries: Map<string, JournalEntry>;
  private growGoals: Map<string, GrowGoal>;
  private aiAnalyses: Map<string, AiAnalysis>;
  private simulations: Map<string, Simulation>;
  private roleplaySessions: Map<string, RoleplaySession>;

  constructor() {
    this.managers = new Map();
    this.competencies = new Map();
    this.selfAssessments = new Map();
    this.feedbacks = new Map();
    this.pulseChecks = new Map();
    this.journalEntries = new Map();
    this.growGoals = new Map();
    this.aiAnalyses = new Map();
    this.simulations = new Map();
    this.roleplaySessions = new Map();

    // Seed default data
    this.seedDefaultCompetencies();
    this.seedDefaultManagers();
  }

  private seedDefaultManagers() {
    const defaultManagers = [
      { name: "Darcy Gallagher", department: "Engineering", role: "Engineering Manager" },
      { name: "Sarah Chen", department: "Product", role: "Product Manager" },
      { name: "Michael Rodriguez", department: "Sales", role: "Sales Director" },
    ];

    defaultManagers.forEach((mgr) => {
      const id = randomUUID();
      this.managers.set(id, { id, ...mgr, createdAt: new Date() });
    });
  }

  private seedDefaultCompetencies() {
    const defaultCompetencies = [
      { name: "Emotional Intelligence", description: "Ability to understand and manage emotions in yourself and others", order: 1 },
      { name: "Empathy", description: "Understanding and sharing feelings of team members", order: 2 },
      { name: "Coaching & Development", description: "Supporting team member growth and skill development", order: 3 },
      { name: "Communication", description: "Clear, timely, and effective information sharing", order: 4 },
      { name: "Empowerment & Delegation", description: "Trusting and enabling team members to make decisions", order: 5 },
      { name: "Commitment to Team", description: "Dedication to team success and wellbeing", order: 6 },
      { name: "Problem Solving", description: "Analytical thinking and creative solution finding", order: 7 },
    ];

    defaultCompetencies.forEach((comp) => {
      const id = randomUUID();
      this.competencies.set(id, { id, ...comp, createdAt: new Date() });
    });
  }

  // Managers
  async getManagers(): Promise<Manager[]> {
    return Array.from(this.managers.values());
  }

  async getManager(id: string): Promise<Manager | undefined> {
    return this.managers.get(id);
  }

  async createManager(insertManager: InsertManager): Promise<Manager> {
    const id = randomUUID();
    const manager: Manager = { ...insertManager, id, createdAt: new Date() };
    this.managers.set(id, manager);
    return manager;
  }

  // Competencies
  async getCompetencies(): Promise<Competency[]> {
    return Array.from(this.competencies.values()).sort((a, b) => a.order - b.order);
  }

  async getCompetency(id: string): Promise<Competency | undefined> {
    return this.competencies.get(id);
  }

  async createCompetency(insertCompetency: InsertCompetency): Promise<Competency> {
    const id = randomUUID();
    const competency: Competency = { ...insertCompetency, id, createdAt: new Date() };
    this.competencies.set(id, competency);
    return competency;
  }

  // Self Assessments
  async getSelfAssessments(managerId?: string): Promise<SelfAssessment[]> {
    const assessments = Array.from(this.selfAssessments.values());
    return managerId
      ? assessments.filter((a) => a.managerId === managerId)
      : assessments;
  }

  async createSelfAssessment(insertAssessment: InsertSelfAssessment): Promise<SelfAssessment> {
    const id = randomUUID();
    const assessment: SelfAssessment = { ...insertAssessment, id, createdAt: new Date() };
    this.selfAssessments.set(id, assessment);
    return assessment;
  }

  // Feedbacks
  async getFeedbacks(managerId?: string): Promise<Feedback[]> {
    const feedbacks = Array.from(this.feedbacks.values());
    return managerId
      ? feedbacks.filter((f) => f.managerId === managerId)
      : feedbacks;
  }

  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const id = randomUUID();
    const feedback: Feedback = { ...insertFeedback, id, createdAt: new Date() };
    this.feedbacks.set(id, feedback);
    return feedback;
  }

  // Pulse Checks
  async getPulseChecks(managerId?: string): Promise<PulseCheck[]> {
    const pulseChecks = Array.from(this.pulseChecks.values());
    return managerId
      ? pulseChecks.filter((p) => p.managerId === managerId)
      : pulseChecks;
  }

  async createPulseCheck(insertPulse: InsertPulseCheck): Promise<PulseCheck> {
    const id = randomUUID();
    const pulse: PulseCheck = { ...insertPulse, id, createdAt: new Date() };
    this.pulseChecks.set(id, pulse);
    return pulse;
  }

  // Journal Entries
  async getJournalEntries(managerId?: string): Promise<JournalEntry[]> {
    const entries = Array.from(this.journalEntries.values());
    const filtered = managerId
      ? entries.filter((e) => e.managerId === managerId)
      : entries;
    return filtered.sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async createJournalEntry(insertEntry: InsertJournalEntry): Promise<JournalEntry> {
    const id = randomUUID();
    const entry: JournalEntry = {
      ...insertEntry,
      id,
      sentimentScore: null,
      emotionTags: null,
      createdAt: new Date(),
    };
    this.journalEntries.set(id, entry);
    return entry;
  }

  async updateJournalEntry(id: string, update: Partial<JournalEntry>): Promise<JournalEntry | undefined> {
    const entry = this.journalEntries.get(id);
    if (!entry) return undefined;
    const updated = { ...entry, ...update };
    this.journalEntries.set(id, updated);
    return updated;
  }

  // GROW Goals
  async getGrowGoals(managerId?: string): Promise<GrowGoal[]> {
    const goals = Array.from(this.growGoals.values());
    return managerId
      ? goals.filter((g) => g.managerId === managerId)
      : goals;
  }

  async createGrowGoal(insertGoal: InsertGrowGoal): Promise<GrowGoal> {
    const id = randomUUID();
    const goal: GrowGoal = {
      ...insertGoal,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.growGoals.set(id, goal);
    return goal;
  }

  // AI Analyses
  async getAiAnalyses(managerId: string): Promise<AiAnalysis[]> {
    return Array.from(this.aiAnalyses.values())
      .filter((a) => a.managerId === managerId)
      .sort((a, b) => 
        new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
      );
  }

  async createAiAnalysis(insertAnalysis: InsertAiAnalysis): Promise<AiAnalysis> {
    const id = randomUUID();
    const analysis: AiAnalysis = { ...insertAnalysis, id, createdAt: new Date() };
    this.aiAnalyses.set(id, analysis);
    return analysis;
  }

  // Simulations
  async getSimulations(managerId?: string): Promise<Simulation[]> {
    const simulations = Array.from(this.simulations.values());
    const filtered = managerId
      ? simulations.filter((s) => s.managerId === managerId)
      : simulations;
    return filtered.sort((a, b) => 
      new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
    );
  }

  async createSimulation(insertSimulation: InsertSimulation): Promise<Simulation> {
    const id = randomUUID();
    const simulation: Simulation = { ...insertSimulation, id, completedAt: new Date() };
    this.simulations.set(id, simulation);
    return simulation;
  }

  // Roleplay Sessions
  async getRoleplaySessions(managerId?: string): Promise<RoleplaySession[]> {
    const sessions = Array.from(this.roleplaySessions.values());
    return managerId
      ? sessions.filter((s) => s.managerId === managerId)
      : sessions;
  }

  async getRoleplaySession(id: string): Promise<RoleplaySession | undefined> {
    return this.roleplaySessions.get(id);
  }

  async createRoleplaySession(insertSession: InsertRoleplaySession): Promise<RoleplaySession> {
    const id = randomUUID();
    const session: RoleplaySession = {
      ...insertSession,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.roleplaySessions.set(id, session);
    return session;
  }

  async updateRoleplaySession(id: string, update: Partial<RoleplaySession>): Promise<RoleplaySession | undefined> {
    const session = this.roleplaySessions.get(id);
    if (!session) return undefined;
    const updated = { ...session, ...update, updatedAt: new Date() };
    this.roleplaySessions.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
