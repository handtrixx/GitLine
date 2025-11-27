import fs from "fs";
import path from "path";

export async function getConfig() {
  const outlineUrl = process.env.OUTLINE_URL!;
  const outlineApikey = process.env.OUTLINE_API_KEY!;
  const outlineCollectionid = process.env.OUTLINE_COLLECTION_ID!;
  const githubRepo = process.env.GITHUB_URL!;
  const githubUser = process.env.GITHUB_USER!;
  const githubToken = process.env.GITHUB_KEY!;

  if (!outlineUrl) {
    await logEntry("fatal", "OUTLINE_URL ENV is not defined");
  }
  if (!outlineApikey) {
    await logEntry("fatal", "OUTLINE_API_KEY ENV is not defined");
  }
  if (!outlineCollectionid) {
    await logEntry("fatal", "OUTLINE_COLLECTION_ID ENV is not defined");
  }
  if (!githubRepo) {
    await logEntry("fatal", "GITHUB_URL ENV is not defined");
  }
  if (!githubUser) {
    await logEntry("fatal", "GITHUB_USER ENVis not defined");
  }
  if (!githubToken) {
    await logEntry("fatal", "GITHUB_KEY ENV is not defined");
  }

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
    case "fatal":
      line = `${timestamp} - FATAL: ${message}`;
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
  if (type === "fatal") {
    process.exit(1);
  }
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
