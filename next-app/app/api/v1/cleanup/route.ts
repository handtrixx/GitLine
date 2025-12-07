import type { NextRequest } from "next/server";
import { getConfig } from "@/app/lib/tools";
import {
    outlineCleanExport
} from "@/app/lib/outline";


export async function GET(req: NextRequest) {
    const auth = req.headers.get("Authorization");
    const config = await getConfig();
    const fileId = req.nextUrl.searchParams.get("fileId");
    const cleanup = await outlineCleanExport(fileId,config.outlineUrl,config.outlineApikey,);
    return new Response(JSON.stringify(cleanup), { status: 200 });
}



