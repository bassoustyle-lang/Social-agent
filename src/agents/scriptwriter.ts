import { CaseTicket, AgentResult } from "../core/types";
import { logAgentAction } from "../core/logger";

export class ScriptwriterAgent {
  id = "Scriptwriter";

  async run(ticket: CaseTicket): Promise<AgentResult<{ script: string; caption: string }>> {
    logAgentAction(this.id, "Scriptwriting Start", "OK", { caseId: ticket.caseId });
    const script = `CASE ${ticket.caseId}: ${ticket.title}\n\nVisual Hook: [Evidence image]\nText Hook: ${ticket.title}\nSpoken Hook: This should not exist.\n\nBody: ${ticket.researchSummary || "Research pending."}\n\nEnding: Who took the photograph?`;
    const caption = `Who took the photograph?\n\nSome evidence should never exist.\n\n${ticket.title}`;
    logAgentAction(this.id, "Script Complete", "OK", { caseId: ticket.caseId });
    return { success: true, data: { script, caption }, agentId: this.id };
  }
}
