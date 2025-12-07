import type { NextRequest } from "next/server";
import { getConfig } from "@/app/lib/tools";
import {
    outlineExportStart,
    outlineExportStatus,
    outlineDownloadArchive,
    outlineExtractArchive,
} from "@/app/lib/outline";

export async function GET(_req: NextRequest) {
    const config = await getConfig();
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
    return Response.json({fileId: exportFileId});
}