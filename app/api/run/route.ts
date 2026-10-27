import { NextResponse } from "next/server";

const compilerMap: Record<string, string> = {
  Python: "python-3.14",
  Java: "openjdk-25",
  "C++": "g++-15",
};

export async function POST(request: Request) {
  try {
    const { code, language, input = "" } = await request.json();

    if (typeof code !== "string" || code.length > 100000) {
      return NextResponse.json(
        { error: "Invalid code or code is too long." },
        { status: 400 }
      );
    }

    const compiler = compilerMap[language];
    const apiKey = process.env.ONLINECOMPILER_API_KEY;

    if (!compiler) {
      return NextResponse.json(
        { error: "Unsupported language." },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is missing. Check your .env.local file." },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://api.onlinecompiler.io/api/run-code-sync/",
      {
        method: "POST",
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          compiler,
          code,
          input,
          time_limit: 5,
        }),
        signal: AbortSignal.timeout(35000),
      }
    );

    const result = await response.json();

console.log("Code sent:", code);
console.log("Input sent:", input);
console.log("Compiler response:", JSON.stringify(result));

    if (!response.ok) {
      return NextResponse.json(
        { error: result.error || "Code execution failed." },
        { status: response.status }
      );
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Could not execute code. Please try again." },
      { status: 500 }
    );
  }
}