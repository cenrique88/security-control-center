import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.INTERNAL_API_URL ?? "http://localhost:3001";

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

async function proxyRequest(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const targetUrl = new URL(`/api/${path.join("/")}${request.nextUrl.search}`, API_URL);
  const headers = new Headers();

  for (const [key, value] of request.headers.entries()) {
    if (["authorization", "content-type"].includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  }

  let response: Response;

  try {
    response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: ["GET", "HEAD"].includes(request.method) ? undefined : await request.text(),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { message: "No se pudo contactar el backend del CRM. Verifica que la API este encendida." },
      { status: 502 },
    );
  }

  return new NextResponse(response.body, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "application/json",
    },
  });
}
