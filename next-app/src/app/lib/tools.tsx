import fs from "fs";
import path from "path";
import { config } from "@/config";

export async function getConfig() {
  // Implementation of the getConfig function
  const outlineUrl = config.OUTLINE.URL;
  const outlineApikey = config.OUTLINE.API_KEY;
  const outlineCollectionid = config.OUTLINE.COLLECTION_ID;
  const githubRepo = config.GITHUB.URL;
  const githubUser = config.GITHUB.USER;
  const githubToken = config.GITHUB.KEY;
  return {
    outlineUrl,
    outlineApikey,
    outlineCollectionid,
    githubRepo,
    githubUser,
    githubToken,
  };
}

export async function logEntry(type: string, message: string): Promise<string> {
  const timestamp = timeStamp();
  let line: string;

  switch (type) {
    case "init":
      line = `--- GITLine: Sync Outline to GitHub ---`;
      break;
    case "success":
      line = `${timestamp} - SUCCESS: ${message}`;
      break;
    case "warn":
      line = `${timestamp} - WARN: ${message}`;
      break;
    case "error":
      line = `${timestamp} - ERROR: ${message}`;
      break;
    case "info":
      line = `${timestamp} - INFO: ${message}`;
      break;
    default:
      line = `${timestamp} - INFO: ${message}`;
      break;
  }

  console.log(line);
  writeLogfile(line);
  return line;
}

function timeStamp(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function writeLogfile(content: string): void {
  const filePath = path.join(process.cwd(), "app.log");
  fs.writeFileSync(filePath, content, { encoding: "utf8" });
  return;
}
