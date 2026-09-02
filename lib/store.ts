export type DevelopmentLevel = "BEGINNING" | "DEVELOPING" | "CONSISTENT" | "INDEPENDENT" | "CAN_TEACH";

export type Pillar = "LEARN" | "LIVE" | "LEAD" | "EARN" | "SERVE";

export type SafetyLevel = "AGE_APPROPRIATE" | "ADULT_GUIDANCE" | "SUPERVISION_REQUIRED";

export type GoalStatus = "NOT_STARTED" | "IN_PROGRESS" | "CONSISTENT" | "ACHIEVED" | "CONTINUE";

export interface Parent {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  phone?: string;
  location?: string;
  planningStyle?: string;
  emailVerified: boolean;
  verificationToken?: string;
  verificationExpires?: string;
  role: "parent" | "admin";
  createdAt: string;
}

export interface Child {
  id: string;
  parentId: string;
  name: string;
  age: number;
  schoolLevel: string;
  gender?: string;
  interests: string[];
  strengths: string[];
  areasForSupport: string[];
  archived: boolean;
  createdAt: string;
}

export interface Assessment {
  id: string;
  childId: string;
  pillar: Pillar | string;
  area: string;
  level: DevelopmentLevel;
  observations: string;
  supportNeeded: string;
  date: string;
}

export interface Goal {
  id: string;
  childId: string;
  pillar: Pillar | string;
  area: string;
  goalText: string;
  behaviour: string;
  currentLevel: DevelopmentLevel;
  targetLevel: DevelopmentLevel;
  evidence: string;
  targetDate: string;
  status: GoalStatus;
  nextStep: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  pillar: Pillar | string;
  area: string;
  safetyLevel: SafetyLevel;
  estimatedCost?: string;
  timeEstimate?: string;
  ageRange: string;
  lowCostAlternative?: string;
}

export interface PlanEntry {
  id: string;
  planId: string;
  activityId?: string;
  title: string;
  description: string;
  date: string;
  completed: boolean;
}

export interface Plan {
  id: string;
  childId: string;
  type: "weekly" | "monthly";
  startDate: string;
  endDate: string;
  entries: PlanEntry[];
  createdAt: string;
}

export interface Evidence {
  id: string;
  childId: string;
  goalId?: string;
  pillar: Pillar | string;
  area: string;
  type: "text" | "image" | "video" | "document" | "observation" | "mentor_note";
  description: string;
  date: string;
  reflection: string;
  createdAt: string;
}

export interface Reflection {
  id: string;
  childId: string;
  type: "childVoice" | "parentReview";
  answers: Record<string, string>;
  date: string;
  createdAt: string;
}

export interface Report {
  id: string;
  childId: string;
  period: string;
  summary: string;
  goalsCompleted: string[];
  goalsDeveloping: string[];
  evidenceHighlights: string[];
  childVoiceExcerpts: string[];
  parentReviewKeyPoints: string[];
  nextSteps: string[];
  generatedAt: string;
}

export interface Achievement {
  id: string;
  childId: string;
  badge: string;
  date: string;
}

export interface Session {
  parentId: string;
  email: string;
  name: string;
  token: string;
  expiresAt: string;
}

function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function generateToken(): string {
  return generateId() + generateId();
}

const STORE_KEYS = {
  parents: "tcd_parents",
  sessions: "sessions",
  children: "tcd_children",
  assessments: "tcd_assessments",
  goals: "tcd_goals",
  plans: "tcd_plans",
  evidence: "tcd_evidence",
  reflections: "tcd_reflections",
  reports: "tcd_reports",
  achievements: "tcd_achievements",
  verificationTokens: "tcd_verification_tokens",
  onboarding: "tcd_onboarding",
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function createParent(email: string, name: string, passwordHash: string): Parent {
  const parent: Parent = {
    id: generateId(),
    email,
    name,
    passwordHash,
    emailVerified: true,
    role: "parent",
    createdAt: new Date().toISOString(),
  };
  const parents = read<Parent[]>(STORE_KEYS.parents, []);
  parents.push(parent);
  write(STORE_KEYS.parents, parents);
  return parent;
}

export function getParentByEmail(email: string): Parent | undefined {
  const parents = read<Parent[]>(STORE_KEYS.parents, []);
  return parents.find((p) => p.email.toLowerCase() === email.toLowerCase());
}

export function updateParent(id: string, updates: Partial<Parent>) {
  const parents = read<Parent[]>(STORE_KEYS.parents, []);
  const idx = parents.findIndex((p) => p.id === id);
  if (idx >= 0) {
    parents[idx] = { ...parents[idx], ...updates };
    write(STORE_KEYS.parents, parents);
  }
}

export function setParentRole(email: string, role: "parent" | "admin") {
  const parents = read<Parent[]>(STORE_KEYS.parents, []);
  const idx = parents.findIndex((p) => p.email.toLowerCase() === email.toLowerCase());
  if (idx >= 0) {
    parents[idx] = { ...parents[idx], role };
    write(STORE_KEYS.parents, parents);
  }
}

export function verifyEmail(token: string): Parent | null {
  const parents = read<Parent[]>(STORE_KEYS.parents, []);
  const parent = parents.find((p) => p.verificationToken === token);
  if (!parent) return null;
  if (parent.emailVerified) return null;
  if (new Date(parent.verificationExpires || "") < new Date()) return null;
  updateParent(parent.id, { emailVerified: true, verificationToken: undefined, verificationExpires: undefined });
  return parents.find((p) => p.id === parent.id) || null;
}

export function resendVerification(email: string): string | null {
  const parent = getParentByEmail(email);
  if (!parent) return null;
  if (parent.emailVerified) return null;
  const token = generateToken();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  updateParent(parent.id, { verificationToken: token, verificationExpires: expires });
  const tokens = read<Record<string, string>>(STORE_KEYS.verificationTokens, {});
  tokens[parent.id] = token;
  write(STORE_KEYS.verificationTokens, tokens);
  return token;
}

export function createSession(parentId: string, email: string, name: string): Session {
  const session: Session = {
    parentId,
    email,
    name,
    token: generateToken(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
  const sessions = read<Session[]>(STORE_KEYS.sessions, []);
  sessions.push(session);
  write(STORE_KEYS.sessions, sessions);
  if (typeof document !== "undefined") {
    document.cookie = `session=${session.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
  }
  return session;
}

export function getSession(): Session | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/session=([^;]+)/);
  const token = match?.[1];
  if (!token) return null;
  const sessions = read<Session[]>(STORE_KEYS.sessions, []);
  const session = sessions.find((s) => s.token === token);
  if (!session) return null;
  if (new Date(session.expiresAt) < new Date()) {
    deleteSession(token);
    return null;
  }
  return session;
}

export function deleteSession(token: string) {
  let sessions = read<Session[]>(STORE_KEYS.sessions, []);
  sessions = sessions.filter((s) => s.token !== token);
  write(STORE_KEYS.sessions, sessions);
  if (typeof document !== "undefined") {
    document.cookie = "session=; path=/; max-age=0; SameSite=Lax";
  }
}

export function signOut() {
  const session = getSession();
  if (session) {
    deleteSession(session.token);
  }
}

export function getChildren(parentId: string): Child[] {
  const children = read<Child[]>(STORE_KEYS.children, []);
  return children.filter((c) => c.parentId === parentId && !c.archived);
}

export function getChild(id: string): Child | undefined {
  const children = read<Child[]>(STORE_KEYS.children, []);
  return children.find((c) => c.id === id);
}

export function assertChildOwnership(parentId: string, childId: string): boolean {
  const child = getChild(childId);
  if (!child) return false;
  return child.parentId === parentId;
}

export function createChild(data: Omit<Child, "id" | "createdAt" | "archived">): Child {
  const child: Child = {
    ...data,
    id: generateId(),
    archived: false,
    createdAt: new Date().toISOString(),
  };
  const children = read<Child[]>(STORE_KEYS.children, []);
  children.push(child);
  write(STORE_KEYS.children, children);
  return child;
}

export function updateChild(id: string, updates: Partial<Child>) {
  const children = read<Child[]>(STORE_KEYS.children, []);
  const idx = children.findIndex((c) => c.id === id);
  if (idx >= 0) {
    children[idx] = { ...children[idx], ...updates };
    write(STORE_KEYS.children, children);
  }
}

export function archiveChild(id: string) {
  updateChild(id, { archived: true });
}

export function getAssessments(childId: string): Assessment[] {
  const items = read<Assessment[]>(STORE_KEYS.assessments, []);
  return items.filter((a) => a.childId === childId);
}

export function createAssessment(data: Omit<Assessment, "id" | "date">): Assessment {
  const item: Assessment = { ...data, id: generateId(), date: new Date().toISOString() };
  const items = read<Assessment[]>(STORE_KEYS.assessments, []);
  items.push(item);
  write(STORE_KEYS.assessments, items);
  return item;
}

export function updateAssessment(id: string, updates: Partial<Assessment>) {
  const items = read<Assessment[]>(STORE_KEYS.assessments, []);
  const idx = items.findIndex((a) => a.id === id);
  if (idx >= 0) {
    items[idx] = { ...items[idx], ...updates };
    write(STORE_KEYS.assessments, items);
  }
}

export function getGoals(childId: string): Goal[] {
  const items = read<Goal[]>(STORE_KEYS.goals, []);
  return items.filter((g) => g.childId === childId);
}

export function createGoal(data: Omit<Goal, "id" | "createdAt" | "updatedAt">): Goal {
  const now = new Date().toISOString();
  const goal: Goal = { ...data, id: generateId(), createdAt: now, updatedAt: now };
  const items = read<Goal[]>(STORE_KEYS.goals, []);
  items.push(goal);
  write(STORE_KEYS.goals, items);
  return goal;
}

export function updateGoal(id: string, updates: Partial<Goal>) {
  const items = read<Goal[]>(STORE_KEYS.goals, []);
  const idx = items.findIndex((g) => g.id === id);
  if (idx >= 0) {
    items[idx] = { ...items[idx], ...updates, updatedAt: new Date().toISOString() };
    write(STORE_KEYS.goals, items);
  }
}

export function deleteGoal(id: string) {
  let items = read<Goal[]>(STORE_KEYS.goals, []);
  items = items.filter((g) => g.id !== id);
  write(STORE_KEYS.goals, items);
}

export function getPlans(childId: string): Plan[] {
  const items = read<Plan[]>(STORE_KEYS.plans, []);
  return items.filter((p) => p.childId === childId);
}

export function createPlan(data: Omit<Plan, "id" | "createdAt">): Plan {
  const plan: Plan = { ...data, id: generateId(), createdAt: new Date().toISOString() };
  const items = read<Plan[]>(STORE_KEYS.plans, []);
  items.push(plan);
  write(STORE_KEYS.plans, items);
  return plan;
}

export function updatePlan(id: string, updates: Partial<Plan>) {
  const items = read<Plan[]>(STORE_KEYS.plans, []);
  const idx = items.findIndex((p) => p.id === id);
  if (idx >= 0) {
    items[idx] = { ...items[idx], ...updates };
    write(STORE_KEYS.plans, items);
  }
}

export function getEvidence(childId: string): Evidence[] {
  const items = read<Evidence[]>(STORE_KEYS.evidence, []);
  return items.filter((e) => e.childId === childId);
}

export function createEvidence(data: Omit<Evidence, "id" | "createdAt">): Evidence {
  const item: Evidence = { ...data, id: generateId(), createdAt: new Date().toISOString() };
  const items = read<Evidence[]>(STORE_KEYS.evidence, []);
  items.push(item);
  write(STORE_KEYS.evidence, items);
  return item;
}

export function deleteEvidence(id: string) {
  let items = read<Evidence[]>(STORE_KEYS.evidence, []);
  items = items.filter((e) => e.id !== id);
  write(STORE_KEYS.evidence, items);
}

export function getReflections(childId: string): Reflection[] {
  const items = read<Reflection[]>(STORE_KEYS.reflections, []);
  return items.filter((r) => r.childId === childId);
}

export function createReflection(data: Omit<Reflection, "id" | "createdAt">): Reflection {
  const item: Reflection = { ...data, id: generateId(), createdAt: new Date().toISOString() };
  const items = read<Reflection[]>(STORE_KEYS.reflections, []);
  items.push(item);
  write(STORE_KEYS.reflections, items);
  return item;
}

export function getReports(childId: string): Report[] {
  const items = read<Report[]>(STORE_KEYS.reports, []);
  return items.filter((r) => r.childId === childId);
}

export function createReport(data: Omit<Report, "id" | "generatedAt">): Report {
  const item: Report = { ...data, id: generateId(), generatedAt: new Date().toISOString() };
  const items = read<Report[]>(STORE_KEYS.reports, []);
  items.push(item);
  write(STORE_KEYS.reports, items);
  return item;
}

export function getAchievements(childId: string): Achievement[] {
  const items = read<Achievement[]>(STORE_KEYS.achievements, []);
  return items.filter((a) => a.childId === childId);
}

export function createAchievement(data: Omit<Achievement, "id" | "date">): Achievement {
  const item: Achievement = { ...data, id: generateId(), date: new Date().toISOString() };
  const items = read<Achievement[]>(STORE_KEYS.achievements, []);
  items.push(item);
  write(STORE_KEYS.achievements, items);
  return item;
}

export const ACTIVITY_LIBRARY: Activity[] = [
  { id: "act-1", title: "Price comparison at the market", description: "Compare prices of 5 items at the local market and record the cheapest options.", pillar: "LIVE", area: "Financial Literacy", safetyLevel: "AGE_APPROPRIATE", estimatedCost: "₦500–₦2,000", timeEstimate: "45 mins", ageRange: "8-18", lowCostAlternative: "Use price lists from newspapers or market traders." },
  { id: "act-2", title: "Prepare a simple family meal", description: "With supervision, prepare a simple meal for the family. Plan, cook and serve.", pillar: "LIVE", area: "Cooking", safetyLevel: "SUPERVISION_REQUIRED", estimatedCost: "₦1,000–₦5,000", timeEstimate: "60 mins", ageRange: "8-18", lowCostAlternative: "Use inexpensive staples like rice, beans, or garri." },
  { id: "act-3", title: "Read a storybook and retell it", description: "Read a storybook, then retell the story in your own words to a family member.", pillar: "LEARN", area: "Reading", safetyLevel: "AGE_APPROPRIATE", estimatedCost: "Free", timeEstimate: "30 mins", ageRange: "5-18", lowCostAlternative: "Use library books or public domain African storybooks." },
  { id: "act-4", title: "Research a question together", description: "Pick a question, find two sources, compare the answers and write three key facts.", pillar: "LEARN", area: "Research", safetyLevel: "AGE_APPROPRIATE", estimatedCost: "Free", timeEstimate: "45 mins", ageRange: "8-18", lowCostAlternative: "Use library reference books or ask a knowledgeable adult." },
  { id: "act-5", title: "Lead a family clean-up", description: "Plan and lead a 20-minute household or neighbourhood clean-up. Assign roles and review results.", pillar: "LEAD", area: "Leadership", safetyLevel: "ADULT_GUIDANCE", estimatedCost: "Free", timeEstimate: "30 mins", ageRange: "8-18", lowCostAlternative: "Use existing cleaning tools at home." },
  { id: "act-6", title: "Create a small enterprise idea", description: "Identify one small problem, sketch a simple product or service, estimate cost and price.", pillar: "EARN", area: "Entrepreneurship", safetyLevel: "AGE_APPROPRIATE", estimatedCost: "₦500–₦3,000", timeEstimate: "45 mins", ageRange: "11-18", lowCostAlternative: "Use recycled materials like cardboard, paper, or seeds." },
  { id: "act-7", title: "Help a younger learner", description: "Spend 30 minutes helping a younger sibling or neighbour with a school task.", pillar: "SERVE", area: "Community", safetyLevel: "AGE_APPROPRIATE", estimatedCost: "Free", timeEstimate: "30 mins", ageRange: "8-18", lowCostAlternative: "Help with homework, reading, or a craft." },
  { id: "act-8", title: "Digital safety check", description: "Review privacy settings, identify phishing signs, and explain safe sharing to a family member.", pillar: "DIGITAL_BUILDER", area: "Online Safety", safetyLevel: "ADULT_GUIDANCE", estimatedCost: "Free", timeEstimate: "30 mins", ageRange: "8-18", lowCostAlternative: "Discuss using a shared family device." },
  { id: "act-9", title: "Draw or write a story", description: "Create an original story, drawing, or short script inspired by family or community life.", pillar: "CREATIVE_EXPLORER", area: "Creative", safetyLevel: "AGE_APPROPRIATE", estimatedCost: "₦200–₦1,000", timeEstimate: "45 mins", ageRange: "5-18", lowCostAlternative: "Use plain paper and pencils or crayons." },
  { id: "act-10", title: "Interview a working adult", description: "Interview an adult about their job: responsibilities, skills, challenges, and advice.", pillar: "FUTURE_READY", area: "Career Exploration", safetyLevel: "AGE_APPROPRIATE", estimatedCost: "Free", timeEstimate: "30 mins", ageRange: "11-18", lowCostAlternative: "Interview a family member or family business owner." },
  { id: "act-11", title: "30-minute active play", description: "Play football, dance, skip, or do a home workout. Record how you felt afterwards.", pillar: "HEALTH_WELLBEING", area: "Physical Activity", safetyLevel: "AGE_APPROPRIATE", estimatedCost: "Free", timeEstimate: "30 mins", ageRange: "5-18", lowCostAlternative: "Use outdoor space, a ball, or bodyweight exercises." },
  { id: "act-12", title: "Practice gratitude", description: "Write down three things you are grateful for and explain why. Share one with the family.", pillar: "CHARACTER_VALUES", area: "Gratitude", safetyLevel: "AGE_APPROPRIATE", estimatedCost: "Free", timeEstimate: "15 mins", ageRange: "5-18", lowCostAlternative: "Use any paper or notebook." },
  { id: "act-13", title: "Plan a family conversation", description: "Prepare three questions about family history or traditions and record the answers.", pillar: "FAMILY_GROWTH", area: "Family History", safetyLevel: "AGE_APPROPRIATE", estimatedCost: "Free", timeEstimate: "30 mins", ageRange: "5-18", lowCostAlternative: "Use a phone voice memo or write notes." },
  { id: "act-14", title: "Visit a local place of interest", description: "Visit a museum, farm, library, or historical site. Prepare three questions before and write three conclusions after.", pillar: "EXPLORATION", area: "Exploration", safetyLevel: "ADULT_GUIDANCE", estimatedCost: "₦200–₦2,000", timeEstimate: "90 mins", ageRange: "5-18", lowCostAlternative: "Use a community centre, market, or nearby nature area." },
  { id: "act-15", title: "Revise past examination questions", description: "Complete a timed past question set, mark it, and list the errors by type.", pillar: "EXAM_PREPARATION", area: "Exam Practice", safetyLevel: "AGE_APPROPRIATE", estimatedCost: "₦500–₦2,000", timeEstimate: "60 mins", ageRange: "11-18", lowCostAlternative: "Use free online past questions or printed papers." },
];

export const PILLARS: { value: Pillar | string; label: string; color: string }[] = [
  { value: "LEARN", label: "Learn", color: "bg-blue-100 text-blue-800" },
  { value: "LIVE", label: "Live", color: "bg-emerald-100 text-emerald-800" },
  { value: "LEAD", label: "Lead", color: "bg-purple-100 text-purple-800" },
  { value: "EARN", label: "Earn", color: "bg-amber-100 text-amber-800" },
  { value: "SERVE", label: "Serve", color: "bg-rose-100 text-rose-800" },
  { value: "DIGITAL_BUILDER", label: "Digital Builder", color: "bg-cyan-100 text-cyan-800" },
  { value: "LIFE_SKILLS", label: "Life Skills", color: "bg-teal-100 text-teal-800" },
  { value: "YOUNG_ENTREPRENEUR", label: "Young Entrepreneur", color: "bg-orange-100 text-orange-800" },
  { value: "CREATIVE_EXPLORER", label: "Creative Explorer", color: "bg-pink-100 text-pink-800" },
  { value: "FUTURE_READY", label: "Future Ready", color: "bg-indigo-100 text-indigo-800" },
  { value: "HEALTH_WELLBEING", label: "Health & Wellbeing", color: "bg-green-100 text-green-800" },
  { value: "CHARACTER_VALUES", label: "Character & Values", color: "bg-yellow-100 text-yellow-800" },
  { value: "FAMILY_GROWTH", label: "Family Growth", color: "bg-lime-100 text-lime-800" },
  { value: "EXPLORATION", label: "Exploration", color: "bg-sky-100 text-sky-800" },
  { value: "EXAM_PREPARATION", label: "Exam Preparation", color: "bg-slate-100 text-slate-800" },
  { value: "CHILD_DEVELOPMENT_TRACKER", label: "Development Tracker", color: "bg-violet-100 text-violet-800" },
  { value: "HOLIDAY_GROWTH", label: "Holiday Growth", color: "bg-fuchsia-100 text-fuchsia-800" },
  { value: "SCHOOL_TERM_DEVELOPMENT", label: "School Term", color: "bg-stone-100 text-stone-800" },
];

export const DEVELOPMENT_LEVELS: { value: DevelopmentLevel; label: string; description: string }[] = [
  { value: "BEGINNING", label: "Beginning", description: "Needs substantial guidance" },
  { value: "DEVELOPING", label: "Developing", description: "Can complete parts with help" },
  { value: "CONSISTENT", label: "Consistent", description: "Usually performs reliably" },
  { value: "INDEPENDENT", label: "Independent", description: "Performs with minimal prompting" },
  { value: "CAN_TEACH", label: "Can Teach Others", description: "Can demonstrate and explain" },
];

export const GOAL_STATUSES: { value: GoalStatus; label: string; color: string }[] = [
  { value: "NOT_STARTED", label: "Not Started", color: "bg-gray-100 text-gray-800" },
  { value: "IN_PROGRESS", label: "In Progress", color: "bg-blue-100 text-blue-800" },
  { value: "CONSISTENT", label: "Consistent", color: "bg-emerald-100 text-emerald-800" },
  { value: "ACHIEVED", label: "Achieved", color: "bg-green-100 text-green-800" },
  { value: "CONTINUE", label: "Continue", color: "bg-amber-100 text-amber-800" },
];

export const SAFETY_LEVELS: { value: SafetyLevel; label: string; description: string }[] = [
  { value: "AGE_APPROPRIATE", label: "Age-Appropriate Independent Task", description: "Safe for independent completion at this age" },
  { value: "ADULT_GUIDANCE", label: "Adult Guidance Required", description: "An adult should be present and available" },
  { value: "SUPERVISION_REQUIRED", label: "Supervision Required", description: "Direct adult supervision is essential" },
];

export const WORKFLOW_STEPS = ["ASSESS", "PLAN", "ACT", "TRACK", "REVIEW", "IMPROVE", "CONTINUE"] as const;

export function getPillarLabel(pillar: string): string {
  const found = PILLARS.find((p) => p.value === pillar);
  return found?.label || pillar;
}

export function getLevelLabel(level: DevelopmentLevel): string {
  const found = DEVELOPMENT_LEVELS.find((l) => l.value === level);
  return found?.label || level;
}

export function getStatusLabel(status: GoalStatus): string {
  const found = GOAL_STATUSES.find((s) => s.value === status);
  return found?.label || status;
}

export interface OnboardingState {
  step: "welcome" | "child" | "profile" | "plan" | "complete";
  parentId: string;
  childId?: string;
  childData?: Partial<Child>;
  profileData?: {
    strengths: string[];
    areasToDevelop: string[];
    interests: string[];
    responsibilities: string[];
    existingSkills: string[];
    parentPriorities: string[];
  };
  planData?: {
    type: "weekly" | "monthly";
    startDate?: string;
    endDate?: string;
  };
  startedAt: string;
  updatedAt: string;
}

export function getOnboardingState(parentId?: string): OnboardingState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORE_KEYS.onboarding);
    if (!raw) return null;
    const state = JSON.parse(raw) as OnboardingState;
    if (parentId && state.parentId !== parentId) return null;
    return state;
  } catch {
    return null;
  }
}

export function saveOnboardingState(state: OnboardingState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORE_KEYS.onboarding, JSON.stringify(state));
}

export function clearOnboardingState() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORE_KEYS.onboarding);
}

