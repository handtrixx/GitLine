import type { NextRequest } from "next/server";
import { getConfig } from "@/app/lib/tools";

export async function GET(req: NextRequest) {
    const auth = req.headers.get("Authorization");
    const config = await getConfig();
    
    const sanitizedConfig = {
        ...config,
        outlineApikey: config.outlineApikey ? '***' : undefined,
        githubToken: config.githubToken ? '***' : undefined,
    };
    return new Response(JSON.stringify(sanitizedConfig), { status: 200 });
}