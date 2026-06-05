import { NextResponse } from "next/server";

// Amey Sawant's portfolio background data to inject as AI context
const PORTFOLIO_CONTEXT = `
You are A.S.T.R.A., a futuristic space-themed AI companion and assistant for Amey Sawant's personal portfolio.
Amey Sawant is a Mumbai-based software architect, creative technologist, and digital explorer.
Your tone is intelligent, helpful, polite, and has a subtle sci-fi, cosmic vibe (e.g. referencing space coordinates, telemetry, warp speeds).

Here is the data about Amey Sawant:
- **Identity**: Software architect and creative technologist who fuses mathematics, responsive code structures, and real-time graphics.
- **Location**: Mumbai, India.
- **Skills**:
  - Frontend: React, Next.js, TypeScript, Tailwind CSS, Three.js, React Three Fiber, GLSL Shaders, GSAP, Framer Motion.
  - Backend: Node.js, Express, Python, FastAPI, Rust (Systems APIs), gRPC, Protobuf, SQL/PostgreSQL, MongoDB.
  - DevOps & AI: LangGraph, LangChain, Reasoning AI agents, Docker, Kubernetes, CI/CD, Google Cloud Platform (GCP), AWS.
- **Projects**:
  - ASTRAEUS AI: Autonomous multi-agent orchestration framework using LangGraph, FastAPI, and Next.js.
  - CHRONOS 3D MAPPER: Three.js and React Three Fiber interactive orbit simulation tracking near-Earth telemetry.
  - HELIOS DATA MATRIX: Sub-millisecond distributed telemetry ingestion gateway built with Rust, gRPC, and Redis.
- **Experiences**:
  - Creative Technologist (2024 - Present): Crafting real-time WebGL platforms and autonomous agent swarms.
  - Senior Full-Stack Developer at AI Labs Inc (2022 - 2024): Scaled API clusters, reduced dashboard loading lag by 45%.
  - Software Engineer at Infotech Networks (2020 - 2022): Managed Kubernetes clusters, containerized deployment systems on GCP/AWS.
- **Contact**:
  - Email: amey123sawant@gmail.com
  - Portals: GitHub and LinkedIn profiles are linked on the Contact HUD panel.
- **Resume**: Latest PDF credentials can be downloaded from the Moon (Resume) sector.

Answer briefly and concisely. Recommend user to explore different planets in the 3D Canvas overview.
`;

// Smart offline local fallback response generator
function getLocalFallbackResponse(query: string): string {
  const q = query.toLowerCase();
  
  if (q.includes("help") || q.includes("command")) {
    return "Greetings, traveler. I can provide coordinate logs about Amey's projects, core capabilities, mission logs, credentials, and contact frequencies. Or just ask me who Amey is!";
  }
  if (q.includes("project") || q.includes("work") || q.includes("built")) {
    return "Amey has created several advanced systems, including:\n1. **Astraeus AI** (autonomous multi-agent reasoning swarm)\n2. **Chronos 3D Mapper** (GPU-accelerated orbital simulation)\n3. **Helios Data Matrix** (distributed Rust/gRPC telemetry gateway)\n\nType warp earth or click the Earth planet to explore details!";
  }
  if (q.includes("skill") || q.includes("tech") || q.includes("languages") || q.includes("code")) {
    return "Amey commands three main rings of capabilities:\n- **UI & Interaction**: React, Next.js, Three.js, GLSL Shaders, Framer Motion.\n- **Architecture & Compute**: Python, FastAPI, Node.js, Systems Rust, PostgreSQL.\n- **DevOps & Agents**: LangGraph, Kubernetes, Docker, GCP, AWS.\n\nType warp saturn or click the Saturn planet to open the Skills Ring overlay!";
  }
  if (q.includes("experience") || q.includes("job") || q.includes("career") || q.includes("work")) {
    return "Amey has a rich chronology record:\n- **Creative Technologist** (2024 - Present): Coding 3D graphics & reasoning AI agents.\n- **Senior Full-Stack Developer** at AI Labs (2022 - 2024): Scaled databases & reduced response lag by 45%.\n- **Software Engineer** at Infotech Networks (2020 - 2022): Maintained containerized pipelines on GCP.\n\nType warp mars or click Mars to review the full Mission Logs!";
  }
  if (q.includes("contact") || q.includes("email") || q.includes("message") || q.includes("hire")) {
    return "You can initiate a transmission frequency to Amey at `amey123sawant@gmail.com` or send a packet directly through the Contact planet panel. Links to GitHub and LinkedIn are also active there!";
  }
  if (q.includes("resume") || q.includes("cv") || q.includes("download")) {
    return "Amey's resume protocol is secured in the Moon orbit. You can retrieve and download the PDF directly from the Moon planet overlay!";
  }
  if (q.includes("who is") || q.includes("creator") || q.includes("about") || q.includes("amey")) {
    return "Amey Sawant is a Mumbai-based software architect, creative technologist, and digital explorer. He specializes in bridging the gap between elegant interface design and robust, high-performance backends and autonomous AI agents.";
  }
  if (q.includes("hello") || q.includes("hi") || q.includes("hey") || q.includes("greetings")) {
    return "Greetings, traveler! I am A.S.T.R.A., your AI assistant in this codespace sector. Ask me anything about Amey Sawant's capabilities, projects, or credentials.";
  }

  return "My deep space scanners could not fully decode that query. You can ask me about Amey's technical skills, core projects, job timeline, or how to contact him directly!";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid messages payload." }, { status: 400 });
    }

    const latestMessage = messages[messages.length - 1].content;
    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    // 1. Try Groq (High priority if configured)
    if (groqKey) {
      try {
        const payload = {
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: PORTFOLIO_CONTEXT },
            ...messages.map((m: any) => ({
              role: m.role,
              content: m.content
            }))
          ],
          temperature: 0.7,
          max_tokens: 250
        };

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${groqKey}`
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const data = await response.json();
          const modelText = data.choices?.[0]?.message?.content || "";
          if (modelText) {
            return NextResponse.json({
              content: modelText.trim(),
              source: "groq_api"
            });
          }
        }
        console.warn("Groq API request failed, falling back to Gemini/Offline...");
      } catch (err) {
        console.error("Groq call error:", err);
      }
    }

    // 2. Try Gemini (Secondary priority)
    if (geminiKey) {
      try {
        const contents = messages.map((m: any) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }]
        }));

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              contents,
              systemInstruction: {
                parts: [{ text: PORTFOLIO_CONTEXT }]
              },
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 250
              }
            })
          }
        );

        if (response.ok) {
          const data = await response.json();
          const modelText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          if (modelText) {
            return NextResponse.json({
              content: modelText.trim(),
              source: "gemini_api"
            });
          }
        }
        console.warn("Gemini API request failed, falling back to Offline...");
      } catch (err) {
        console.error("Gemini call error:", err);
      }
    }

    // 3. Absolute Fallback: offline local matching
    const fallbackText = getLocalFallbackResponse(latestMessage);
    return NextResponse.json({
      content: fallbackText,
      source: "offline_fallback"
    });

  } catch (error) {
    console.error("API endpoint level error:", error);
    try {
      const body = await req.json().catch(() => ({}));
      const queryText = body.messages?.[body.messages.length - 1]?.content || "";
      const fallbackText = getLocalFallbackResponse(queryText);
      return NextResponse.json({
        content: fallbackText,
        source: "offline_fallback_on_catch"
      });
    } catch {
      return NextResponse.json({
        content: "System error in A.S.T.R.A. comms array. Telemetry link degraded.",
        source: "error"
      });
    }
  }
}
