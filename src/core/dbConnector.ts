import { createClient, Client } from "@libsql/client";
import * as dotenv from "dotenv";
dotenv.config();

export class DBConnector {
  private client: Client;

  constructor() {
    const url = process.env.TURSO_URL || "libsql://social-agent-aboukhalil.aws-eu-central-1.turso.io";
    const token = process.env.TURSO_TOKEN || "";
    this.client = createClient({ url, authToken: token });
  }

  async execute(sql: string, args: any[] = []) {
    return this.client.execute({ sql, args });
  }

  async getClient() {
    return this.client;
  }
}

export const db = new DBConnector();
