import type { NextRequest } from "next/server";
import { getConfig, logEntry } from "@/app/lib/tools";
import {
  outlineExportStart,
  outlineExportStatus,
  outlineDownloadArchive,
  outlineExtractArchive,
  outlineCleanExport,
} from "@/app/lib/outline";
import { githubCommitAndPush } from "@/app/lib/github";

export async function GET(_req: NextRequest) {
  
  let output: string;
  const result = {
    steps: [] as string[],
    success: true,
    error: null as string | null
  };
  output = await logEntry("init", "Starting Outline export process...");
  result.steps.push(output);
  const config = await getConfig();
  output = await logEntry("success", "Configuration loaded");
  result.steps.push(output);
  
  // Push command to start an Export
  const exportResult = await outlineExportStart(
    config.outlineUrl,
    config.outlineApikey,
    config.outlineCollectionid
  );
  if (exportResult.success != true) {
    return Response.json("Error");
  }
  const exportFileId = exportResult.data.fileOperation.id;

  // Check if Export is ready to download
  const exportStatus = await outlineExportStatus(
    config.outlineUrl,
    config.outlineApikey,
    exportFileId,
    3
  );
  if (exportStatus.data.state != "complete") {
    return Response.json("Error");
  }
  // Download zip archive
  const exportFile = await outlineDownloadArchive(
    config.outlineUrl,
    config.outlineApikey,
    exportFileId
  );
  if (!exportFile) {
    return Response.json("Error");
  }
  // Extract the downloaded archive
  const extract = await outlineExtractArchive();
  if (!extract) {
    return Response.json("Error");
  }
  // Push Collection to GIT
  /*
  const git = await githubCommitAndPush(config.githubRepo, config.githubUser, config.githubToken);
  if (!git) {
    console.log("Exported archive could not be extracted.");
    return Response.json("Error");
  }
  console.log(git);
  */
  // Cleanup Temporary Files
  const cleanup = await outlineCleanExport(exportFileId,config.outlineUrl,config.outlineApikey,);
  
  return Response.json(result);
}
