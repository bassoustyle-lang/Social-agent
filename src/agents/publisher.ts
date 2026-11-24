import { CaseTicket, AgentResult } from "../core/types";
import { logAgentAction } from "../core/logger";
import axios from "axios";
import fs from "fs";

export class PublisherAgent {
  id = "Publisher";
  private pageAccessToken: string;
  private pageId: string;

  constructor() {
    this.pageAccessToken = process.env.FB_PAGE_ACCESS_TOKEN || "";
    this.pageId = process.env.FB_PAGE_ID || "";
  }

  async uploadReel(ticket: CaseTicket): Promise<AgentResult<{ postId: string }>> {
    logAgentAction(this.id, "Publishing Start", "OK", { caseId: ticket.caseId });

    const reelPath = ticket.reelUrl || `output/${ticket.caseId}_reel.mp4`;

    // Check if video file exists
    if (!fs.existsSync(reelPath)) {
      const msg = `Video file not found: ${reelPath}. Skipping actual upload. Set FB_PAGE_ID and provide a real video file to publish.`;
      logAgentAction(this.id, "Publishing Skipped", "WARN", { caseId: ticket.caseId, reason: msg });
      // Simulate a post ID for pipeline continuity
      const simulatedId = `sim_${ticket.caseId}_${Date.now()}`;
      logAgentAction(this.id, "Publishing Simulated", "OK", { caseId: ticket.caseId, simulatedPostId: simulatedId });
      return { success: true, data: { postId: simulatedId }, agentId: this.id };
    }

    try {
      // Facebook Reels API: 3-phase upload
      // Phase 1: Start
      const startResp = await axios.post(
        `https://graph.facebook.com/v21.0/${this.pageId}/video_reels`,
        null,
        {
          params: {
            upload_phase: "start",
            access_token: this.pageAccessToken,
          },
        }
      );
      const videoId = startResp.data.video_id;
      logAgentAction(this.id, "Upload Start", "OK", { caseId: ticket.caseId, videoId });

      // Phase 2: Transfer video bytes
      const videoBuffer = fs.readFileSync(reelPath);
      await axios.post(
        `https://graph.facebook.com/v21.0/${this.pageId}/video_reels`,
        videoBuffer,
        {
          params: {
            upload_phase: "transfer",
            video_id: videoId,
            access_token: this.pageAccessToken,
          },
          headers: { "Content-Type": "application/octet-stream" },
          timeout: 120000,
        }
      );
      logAgentAction(this.id, "Upload Transfer", "OK", { caseId: ticket.caseId, videoId });

      // Phase 3: Finish
      const finishResp = await axios.post(
        `https://graph.facebook.com/v21.0/${this.pageId}/video_reels`,
        null,
        {
          params: {
            upload_phase: "finish",
            video_id: videoId,
            description: ticket.postCaption || ticket.script || "",
            access_token: this.pageAccessToken,
            published: true,
          },
        }
      );

      const postId = finishResp.data.id || videoId;
      logAgentAction(this.id, "Publishing Complete", "OK", { caseId: ticket.caseId, postId });
      return { success: true, data: { postId }, agentId: this.id };
    } catch (error: any) {
      const errMsg = error.response?.data?.error?.message || error.message;
      logAgentAction(this.id, "Publishing Failed", "ERROR", { caseId: ticket.caseId, error: errMsg });
      return { success: false, error: errMsg, agentId: this.id };
    }
  }

  async run(ticket: CaseTicket): Promise<AgentResult<{ postId: string }>> {
    return this.uploadReel(ticket);
  }
}
