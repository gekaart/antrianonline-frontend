/**
 * Explicit server-side proxy for /api/petugas/* routes.
 * Replaces the Next.js rewrite for petugas routes because the rewrite
 * was returning HTTP 200 with empty body in the Hostinger environment.
 * This route runs server-side and forwards Authorization + Cookie headers
 * to the backend explicitly.
 */
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

async function proxy(
  req: NextRequest,
  params: { path: string[] }
): Promise<NextResponse> {
  const pathStr = params.path.join("/");
  const backendUrl = `${BACKEND_URL}/api/petugas/${pathStr}`;

  // Forward Authorization and Cookie headers
  const forwardHeaders: Record<string, string> = {};
  const auth = req.headers.get("authorization");
  if (auth) forwardHeaders["authorization"] = auth;
  const cookie = req.headers.get("cookie");
  if (cookie) forwardHeaders["cookie"] = cookie;

  // Forward Content-Type for write methods
  const contentType = req.headers.get("content-type");
  if (contentType) forwardHeaders["content-type"] = contentType;

  let body: string | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = await req.text();
  }

  let backendRes: Response;
  try {
    backendRes = await fetch(backendUrl, {
      method: req.method,
      headers: forwardHeaders,
      ...(body !== undefined ? { body } : {}),
    });
  } catch (err) {
    const e = err as Error;
    return NextResponse.json(
      { error: `Proxy error: ${e.message}` },
      { status: 502 }
    );
  }

  const text = await backendRes.text();

  const res = new NextResponse(text || null, {
    status: backendRes.status,
    headers: { "content-type": "application/json" },
  });

  // Forward Set-Cookie headers from backend to browser
  backendRes.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      res.headers.append("set-cookie", value);
    }
  });

  return res;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(req, await params);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(req, await params);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(req, await params);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(req, await params);
}
