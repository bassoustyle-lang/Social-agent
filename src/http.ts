import { runPipeline, PipelineRequest, PipelineResponse } from "./index";
import { CaseState } from "./core/types";
import { logger } from "./core/logger";

export default async function handler(
  req: { method: string; body?: PipelineRequest; query?: PipelineRequest; headers?: Record<string, string> },
  res: {
    status: (code: number) => { json: (data: PipelineResponse) => void; end: () => void };
    json: (data: PipelineResponse) => void;
    setHeader: (name: string, value: string) => void;
  }
) {
  logger.info("HTTP request received", { method: req.method, path: req.headers?.host });

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed. Use POST." });
  }

  const body = req.body || req.query || {};
  const caseId = body.caseId || `CASE-${Date.now()}`;
  const title = body.title || "Untitled Case";
  const theme = body.theme || "Unspecified theme";

  try {
    const ticket = {
      caseId,
      title,
      theme,
      state: CaseState.INIT,
    };

    const result = await runPipeline(ticket);

    return res.json({
      success: true,
      caseId: result.caseId,
      finalState: result.state,
      postId: result.postId,
      reelUrl: result.reelUrl,
    });
  } catch (err: any) {
    logger.error("Pipeline execution failed", { error: err.message, stack: err.stack });
    return res.status(500).json({ success: false, error: err.message });
  }
}