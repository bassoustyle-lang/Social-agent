export enum CaseState {
  INIT = "INIT",
  RESEARCH = "RESEARCH",
  SCRIPT = "SCRIPT",
  VISUAL = "VISUAL",
  AUDIO = "AUDIO",
  EDIT = "EDIT",
  PUBLISH = "PUBLISH",
  ANALYZE = "ANALYZE",
  COMPLETE = "COMPLETE",
  BACKOFF = "BACKOFF",
  FAILED = "FAILED",
}

export interface CaseTicket {
  caseId: string;
  title: string;
  theme: string;
  state: CaseState;
  researchSummary?: string;
  script?: string;
  assets?: string[];
  audioFiles?: string[];
  reelUrl?: string;
  postCaption?: string;
  postId?: string;
}

export interface AgentResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  agentId: string;
}
