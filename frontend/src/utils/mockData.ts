import {  type Goal } from '../types/goal.type';

export const initialGoals: Goal[] = [
  {
    id: "1",
    title: "Master React Native",
    description: "Build 3 complete mobile applications and publish one to the App Store to become proficient in cross-platform development.",
    deadline: "2026-06-30",
    status: "Active",
    category: "Learning",
    milestones: [
      { id: "m1", title: "Complete fundamentals course & understand native components", isCompleted: true },
      { id: "m2", title: "Build weather app with location services", isCompleted: true },
      { id: "m3", title: "Build task manager app with local storage", isCompleted: false },
      { id: "m4", title: "Design production-ready App Store screenshots", isCompleted: false },
      { id: "m5", title: "Publish to App Store via TestFlight", isCompleted: false },
    ]
  },
  {
    id: "2",
    title: "Migrate DB to PostgreSQL",
    description: "Safely migrate the production database from MySQL to PostgreSQL with zero downtime.",
    deadline: "2026-04-15",
    status: "Active",
    category: "Infrastructure",
    milestones: [
      { id: "m1", title: "Setup staging DB environment", isCompleted: true },
      { id: "m2", title: "Write initial migration scripts", isCompleted: true },
      { id: "m3", title: "Test migration with 10k dummy records", isCompleted: false },
      { id: "m4", title: "Execute production migration during maintenance window", isCompleted: false },
    ]
  },
  {
    id: "3",
    title: "System Design Interview Prep",
    description: "Read \"Designing Data-Intensive Applications\" and practice mock interviews.",
    deadline: "2026-03-10",
    status: "Done",
    category: "Career",
    milestones: [
      { id: "m1", title: "Read Parts 1 & 2 (Foundations & Distributed Data)", isCompleted: true },
      { id: "m2", title: "Read Part 3 (Derived Data)", isCompleted: true },
      { id: "m3", title: "Complete 10 Pramp mock interviews", isCompleted: true },
      { id: "m4", title: "Pass real system design loop", isCompleted: true },
    ]
  }
];