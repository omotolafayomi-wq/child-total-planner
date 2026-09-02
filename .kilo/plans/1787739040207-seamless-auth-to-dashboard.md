# Dashboard Workflow: ASSESS → PLAN → ACT → TRACK → REVIEW → IMPROVE → CONTINUE

## Goal
1. Connect the dashboard to the development workflow: ASSESS → PLAN → ACT → TRACK → REVIEW → IMPROVE → CONTINUE
2. Show "Start My Child's Developmental Plan" button only after onboarding is complete
3. Add a small floating pop-up button by the side showing what's next to do

## Current State
- Dashboard has a static "Development Cycle" section showing the workflow steps
- `renderNextStepCard()` shows contextual next steps but not in workflow order
- No "Start My Child's Developmental Plan" button
- No floating "what's next" button

## Target State
- Dashboard shows a connected workflow with visual progress indicators
- "Start My Child's Developmental Plan" appears only after onboarding completion
- Floating side button shows next recommended action based on workflow state

## Tasks

### 1. Add workflow progress state to dashboard

Add state to track current workflow step:
```tsx
const [currentWorkflowStep, setCurrentWorkflowStep] = useState<string>("ASSESS");
```

Determine current step based on data:
```tsx
useEffect(() => {
  if (!selectedChild) {
    setCurrentWorkflowStep("ASSESS");
    return;
  }
  const hasAssessment = assessments.some(a => PILLARS.slice(0,5).some(p => p.value === a.pillar));
  const hasPlan = plans.length > 0;
  const hasGoals = activeGoals.length > 0;
  const hasEvidence = evidence.length > 0;
  const hasReflection = reflections.length > 0;

  if (!hasAssessment) {
    setCurrentWorkflowStep("ASSESS");
  } else if (!hasPlan) {
    setCurrentWorkflowStep("PLAN");
  } else if (!hasGoals) {
    setCurrentWorkflowStep("ACT");
  } else if (!hasEvidence) {
    setCurrentWorkflowStep("TRACK");
  } else if (!hasReflection) {
    setCurrentWorkflowStep("REVIEW");
  } else {
    setCurrentWorkflowStep("IMPROVE");
  }
}, [selectedChild, assessments, plans, activeGoals, evidence, reflections]);
```

### 2. Replace static Development Cycle with interactive workflow

Replace the current static workflow display with an interactive horizontal stepper:

```tsx
<div className="card">
  <h2 className="section-title mb-4">Development Cycle</h2>
  <div className="flex items-center justify-between overflow-x-auto pb-2">
    {["ASSESS", "PLAN", "ACT", "TRACK", "REVIEW", "IMPROVE", "CONTINUE"].map((step, idx) => {
      const isActive = currentWorkflowStep === step;
      const isCompleted = WORKFLOW_STEPS.indexOf(currentWorkflowStep) > idx;
      return (
        <div key={step} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
              isCompleted ? "bg-growth-600 border-growth-600 text-white" :
              isActive ? "bg-primary border-primary text-white" :
              "bg-white border-border text-muted-foreground"
            }`}>
              {isCompleted ? "✓" : idx + 1}
            </div>
            <span className={`text-xs mt-1 font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
              {step}
            </span>
          </div>
          {idx < 6 && (
            <div className={`w-8 h-0.5 mx-1 ${isCompleted ? "bg-growth-600" : "bg-border"}`} />
          )}
        </div>
      );
    })}
  </div>
</div>
```

### 3. Add "Start My Child's Developmental Plan" button

Add a prominent button that only appears after onboarding is complete:

```tsx
const onboarding = getStoreOnboardingState();
const isOnboardingComplete = onboarding?.step === "complete";

{isOnboardingComplete && selectedChild && (
  <div className="card border-l-4 border-l-primary bg-primary/5">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h3 className="font-semibold text-primary">Start My Child's Developmental Plan</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Begin with an assessment to understand your child's current capabilities.
        </p>
      </div>
      <Link href="/dashboard/assess" className="btn-primary whitespace-nowrap">
        Start Assessment
      </Link>
    </div>
  </div>
)}
```

Place this after the greeting section and before `renderNextStepCard()`.

### 4. Add floating "What's Next" popup button

Create a floating button component that shows the next recommended action:

```tsx
const [showNextStepPopup, setShowNextStepPopup] = useState(false);

function getNextStepRecommendation() {
  if (!selectedChild) {
    return {
      title: "Add Your Child",
      description: "Start by adding your child's profile",
      link: "/onboarding/child",
      buttonText: "Add Child"
    };
  }
  
  const hasAssessment = assessments.some(a => PILLARS.slice(0,5).some(p => p.value === a.pillar));
  if (!hasAssessment) {
    return {
      title: "Start Assessment",
      description: "Assess your child's current capabilities",
      link: "/dashboard/assess",
      buttonText: "Assess Now"
    };
  }
  
  const hasPlan = plans.length > 0;
  if (!hasPlan) {
    return {
      title: "Create Plan",
      description: "Turn assessment into a development plan",
      link: "/onboarding/plan",
      buttonText: "Create Plan"
    };
  }
  
  const hasGoals = activeGoals.length > 0;
  if (!hasGoals) {
    return {
      title: "Set Goals",
      description: "Set development goals for your child",
      link: "/dashboard/goals",
      buttonText: "Set Goals"
    };
  }
  
  const hasEvidence = evidence.length > 0;
  if (!hasEvidence) {
    return {
      title: "Add Evidence",
      description: "Document your child's progress",
      link: "/dashboard/evidence",
      buttonText: "Add Evidence"
    };
  }
  
  return {
    title: "Keep Going",
    description: "Continue the development cycle",
    link: "/dashboard/activities",
    buttonText: "Explore Activities"
  };
}

const nextStep = getNextStepRecommendation();
```

Add the floating button JSX:
```tsx
<div className="fixed right-4 bottom-20 z-40">
  <button
    onClick={() => setShowNextStepPopup(!showNextStepPopup)}
    className="w-14 h-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
    aria-label="What's next"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 16v-4"/>
      <path d="M12 8h.01"/>
    </svg>
  </button>
  
  {showNextStepPopup && (
    <div className="absolute right-16 bottom-16 w-72 bg-white rounded-lg shadow-xl border border-border p-4">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-sm">{nextStep.title}</h4>
        <button
          onClick={() => setShowNextStepPopup(false)}
          className="text-muted-foreground hover:text-foreground"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <p className="text-xs text-muted-foreground mb-3">{nextStep.description}</p>
      <Link href={nextStep.link} className="btn-primary w-full text-center text-sm">
        {nextStep.buttonText}
      </Link>
    </div>
  )}
</div>
```

### 5. Update renderNextStepCard to align with workflow

Update `renderNextStepCard()` to use workflow-based logic:
- Check current workflow step
- Show appropriate next action based on step
- Link to correct page for each step

## Files to Modify
- `app/dashboard/page.tsx` — Main dashboard updates

## Validation Plan
1. Run `npm run build` — must pass
2. Verify workflow shows correct step based on user data
3. Verify "Start My Child's Developmental Plan" only appears after onboarding
4. Verify floating button shows correct next step recommendation
5. Test all workflow transitions

## Out of Scope
- Detailed workflow page for each step
- Backend changes to support workflow state
- Analytics or progress tracking beyond basic state
