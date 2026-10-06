import { handleBokerRequest } from "@/lib/bokerGateway";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ operation: string }> };

export async function GET(request: Request, context: RouteContext) {
  return handleBokerRequest(request, (await context.params).operation);
}

export async function POST(request: Request, context: RouteContext) {
  return handleBokerRequest(request, (await context.params).operation);
}
