import { initDatabase } from "./core/dbInit";
import { StateMachine } from "./core/stateMachine";
import { CaseState, CaseTicket } from "./core/types";
import { DirectorAgent } from "./agents/director";
import { ResearcherAgent } from "./agents/researcher";
import { ScriptwriterAgent } from "./agents/scriptwriter";
import { VisualProducerAgent } from "./agents/visualProducer";
import { AudioProducerAgent } from "./agents/audioProducer";
import { EditorAgent } from "./agents/editor";
import { PublisherAgent } from "./agents/publisher";
import { logger } from "./core/logger";

export interface PipelineRequest {
  caseId?: string;
  title?: string;
  theme?: string;
}

export interface PipelineResponse {
  success: boolean;
  caseId?: string;
  finalState?: string;
  postId?: string;
  reelUrl?: string;
  error?: string;
}

async function runPipeline(ticket: CaseTicket): Promise<CaseTicket> {
  const sm = new StateMachine();
  const director = new DirectorAgent();
  const researcher = new ResearcherAgent();
  const scriptwriter = new ScriptwriterAgent();
  const visualProducer = new VisualProducerAgent();
  const audioProducer = new AudioProducerAgent();
  const editor = new EditorAgent();
  const publisher = new PublisherAgent();

  sm.registerHandler(CaseState.RESEARCH, async (t) => researcher.run(t));
  sm.registerHandler(CaseState.SCRIPT, async (t) => scriptwriter.run(t));
  sm.registerHandler(CaseState.VISUAL, async (t) => visualProducer.run(t));
  sm.registerHandler(CaseState.AUDIO, async (t) => audioProducer.run(t));
  sm.registerHandler(CaseState.EDIT, async (t) => editor.run(t));
  sm.registerHandler(CaseState.PUBLISH, async (t) => publisher.run(t));
  sm.registerHandler(CaseState.ANALYZE, async (t) => {
    logger.info(`Analytics: Post ${t.postId} published. Gathering metrics...`);
    return { success: true, data: {}, agentId: "Analyst" };
  });

  logger.info(`Starting pipeline for ${ticket.caseId}: ${ticket.title}`);
  const result = await sm.run(ticket);

  logger.info("Pipeline complete", { caseId: result.caseId, finalState: result.state });
  return result;
}

async function main() {
  logger.info("🚀 THE UNCLAIMED AI Agent System — Starting");

  await initDatabase();

  const ticket: CaseTicket = {
    caseId: "CASE001",
    title: "THE PHOTOGRAPH OF TOMORROW",
    theme: "Photographic Evidence from the Future",
    state: CaseState.INIT,
  };

  const result = await runPipeline(ticket);

  console.log("\n✅ Pipeline finished. Final state:", result.state);
  console.log("Post ID:", result.postId || "N/A");
  console.log("Reel URL:", result.reelUrl || "N/A");
}

main().catch((err) => {
  logger.error("Fatal error", { error: err.message, stack: err.stack });
  process.exit(1);
});

export { runPipeline };