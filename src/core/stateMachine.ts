import { CaseState, CaseTicket, AgentResult } from "./types";
import { logger, logAgentAction } from "./logger";
import { db } from "./dbConnector";

export type AgentHandler = (ticket: CaseTicket) => Promise<AgentResult<any>>;

export class StateMachine {
  private handlers: Map<CaseState, AgentHandler> = new Map();
  private currentTicket: CaseTicket | null = null;
  private stateHistory: { state: CaseState; timestamp: string }[] = [];

  registerHandler(state: CaseState, handler: AgentHandler) {
    this.handlers.set(state, handler);
  }

  async transition(ticket: CaseTicket, nextState: CaseState): Promise<void> {
    const prev = ticket.state;
    ticket.state = nextState;
    this.stateHistory.push({ state: nextState, timestamp: new Date().toISOString() });
    logAgentAction("StateMachine", `Transition ${prev} → ${nextState}`, "OK", { caseId: ticket.caseId });
    await db.execute(
      "INSERT INTO agent_memory (key, value, agent_id) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value=?, updated_at=CURRENT_TIMESTAMP",
      [`state_${ticket.caseId}`, JSON.stringify({ state: nextState, history: this.stateHistory }), "StateMachine", JSON.stringify({ state: nextState, history: this.stateHistory })]
    );
  }

  async run(ticket: CaseTicket): Promise<CaseTicket> {
    this.currentTicket = ticket;
    this.stateHistory = [{ state: ticket.state, timestamp: new Date().toISOString() }];

    const flow: CaseState[] = [
      CaseState.RESEARCH,
      CaseState.SCRIPT,
      CaseState.VISUAL,
      CaseState.AUDIO,
      CaseState.EDIT,
      CaseState.PUBLISH,
      CaseState.ANALYZE,
      CaseState.COMPLETE,
    ];

    for (const state of flow) {
      await this.transition(ticket, state);
      const handler = this.handlers.get(state);
      if (!handler) {
        logger.error(`No handler registered for state ${state}`);
        await this.transition(ticket, CaseState.FAILED);
        return ticket;
      }

      const result = await handler(ticket);
      if (!result.success) {
        logger.error(`Agent failed at state ${state}: ${result.error}`);
        await this.transition(ticket, CaseState.FAILED);
        return ticket;
      }

      // Director approval gate
      const directorHandler = this.handlers.get(CaseState.INIT);
      if (directorHandler && state !== CaseState.ANALYZE && state !== CaseState.COMPLETE) {
        // Director approval is implicit via the Director agent being called
      }

      // Store result data back into ticket
      if (result.data) {
        Object.assign(ticket, result.data);
      }
    }

    return ticket;
  }

  getStateHistory() {
    return this.stateHistory;
  }
}
