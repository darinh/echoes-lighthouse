export interface LoopMilestone {
  readonly loopCount: number
  readonly messageKey: string
}

export const LOOP_MILESTONES: readonly LoopMilestone[] = [
  { loopCount: 3,  messageKey: 'milestone.loop_3'  },
  { loopCount: 5,  messageKey: 'milestone.loop_5'  },
  { loopCount: 7,  messageKey: 'milestone.loop_7'  },
  { loopCount: 10, messageKey: 'milestone.loop_10' },
]
