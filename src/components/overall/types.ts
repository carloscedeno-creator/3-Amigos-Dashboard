export interface OverallViewProps {
  /**
   * Optional override functions to supply metrics; useful for testing.
   */
  fetchDeliveryScores?: () => Promise<number[]> | number[]
  fetchQualityScores?: () => Promise<number[]> | number[]
  fetchTeamHealthScores?: () => Promise<number[]> | number[]
  fetchVelocityScores?: () => Promise<number[]> | number[]
}

export interface SprintSummary {
  id: string
  name: string
  squad: string
  spGoal: number
  spDone: number
  startDate: string
  endDate: string
}

export interface ActiveSprintsSummaryProps {
  sprints?: SprintSummary[]
  initialSquad?: string
}

export interface TimelineItem {
  id: string
  name: string
  squad: string
  startDate: string
  endDate: string
  type: "initiative" | "sprint"
}

export interface UnifiedTimelineProps {
  items?: TimelineItem[]
}
