import { CaseTicket, AgentResult } from "../core/types";
import { logAgentAction } from "../core/logger";

export class EditorAgent {
  id = "Editor";

  async run(ticket: CaseTicket): Promise<AgentResult<{ reelUrl: string }>> {
    logAgentAction(this.id, "Editing Start", "OK", { caseId: ticket.caseId });
    const reelUrl = `output/${ticket.caseId}_reel.mp4`;
    logAgentAction(this.id, "Editing Complete", "OK", { caseId: ticket.caseId, reelUrl });
    return { success: true, data: { reelUrl }, agentId: this.id };
  }
}
