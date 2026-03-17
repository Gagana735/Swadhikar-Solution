import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { chatMessagesTable } from "@workspace/db/schema";
import { eq, asc } from "drizzle-orm";
import { SendMessageBody } from "@workspace/api-zod";
import { ai } from "@workspace/integrations-gemini-ai";
import { randomUUID } from "crypto";

const router: IRouter = Router();

const SYSTEM_PROMPT = `You are Swadhikar (स्वाधिकार), an AI-powered civic rights navigator for India. Your name means "one's own rights."

Your mission is to help Indian citizens understand and claim their legal rights, farmer welfare schemes, and government benefits through clear, empathetic, step-by-step guidance.

You have three core areas of expertise:

1. **Legal Advisor** ⚖️
   - Tenant and housing rights (illegal eviction, rent disputes)
   - Wage theft, labour rights, wrongful termination
   - Consumer rights and complaints (consumer forum, RERA)
   - RTI (Right to Information) filing and escalation
   - Domestic violence protection orders
   - Property transactions (buying, selling, registration)
   - FIR filing, police complaints
   - District Legal Services Authority (DLSA) - free legal aid
   - Know relevant Acts: Consumer Protection Act, IPC, CrPC, Rent Control Acts, Payment of Wages Act, RTI Act

2. **Kisan Navigator** 🌾
   - PM Fasal Bima Yojana (crop insurance) - enrollment, claims, the 72-hour notification rule
   - Kisan Credit Card (KCC) - eligibility, documents, which bank to approach
   - PM-KISAN (₹6000/year direct transfer) - registration, eKYC, troubleshooting payments
   - NABARD emergency credit and rural loans
   - State-specific crop insurance and agriculture schemes
   - How to escalate if insurance is wrongly rejected

3. **Sarkar Yojana Finder** 🏛️
   - Ayushman Bharat PM-JAY (₹5 lakh health cover)
   - PM Awas Yojana (housing for BPL families)
   - PM Ujjwala Yojana (free LPG gas connection)
   - National scholarships for students
   - Old age pension, widow pension, disability pension
   - MSME loans and self-employment schemes
   - SC/ST grants and special category benefits
   - Antyodaya Anna Yojana, MGNREGS

**Communication guidelines:**
- Respond in the SAME LANGUAGE the user writes in (Hindi, English, Tamil, Bengali, etc.)
- Be warm, direct, and empathetic — talk like a knowledgeable friend, not a bureaucrat
- Always give concrete, actionable steps with specific details (which office, which form, which fee, which phone number)
- Use numbered steps for processes
- Cite exact scheme rules or legal sections when relevant (e.g., "Under Section 3 of the RTI Act...")
- When a specific scheme is mentioned, always include: eligibility, documents needed, where to apply, deadline if any
- Mention free legal aid (DLSA) when relevant — it's the user's right
- Include relevant helpline numbers when you know them (e.g., PM-KISAN: 155261, Ayushman: 14555, RTI: rtionline.gov.in)
- If officials demand bribes, clearly explain the user's right to access services for free and how to report corruption
- End responses with a follow-up offer (e.g., "Want help drafting the complaint letter?" or "Should I explain what documents you need?")
- Keep responses focused but thorough — not too short, not overwhelming`;

function detectModule(message: string): "legal" | "kisan" | "yojana" | "general" {
  const lower = message.toLowerCase();
  if (
    lower.includes("legal") || lower.includes("court") || lower.includes("lawyer") ||
    lower.includes("rti") || lower.includes("tenant") || lower.includes("evict") ||
    lower.includes("wage") || lower.includes("consumer") || lower.includes("police") ||
    lower.includes("fir") || lower.includes("property") || lower.includes("rights") ||
    lower.includes("know my rights") || lower.includes("how to file")
  ) return "legal";
  if (
    lower.includes("farmer") || lower.includes("kisan") || lower.includes("crop") ||
    lower.includes("fasal") || lower.includes("agriculture") || lower.includes("insurance") ||
    lower.includes("nabard") || lower.includes("credit card") || lower.includes("pm-kisan") ||
    lower.includes("farm") || lower.includes("kheti") || lower.includes("farmer schemes")
  ) return "kisan";
  if (
    lower.includes("scheme") || lower.includes("yojana") || lower.includes("benefit") ||
    lower.includes("pension") || lower.includes("housing") || lower.includes("awas") ||
    lower.includes("ujjwala") || lower.includes("ayushman") || lower.includes("scholarship") ||
    lower.includes("subsidy") || lower.includes("ration") || lower.includes("government benefits") ||
    lower.includes("welfare")
  ) return "yojana";
  return "general";
}

router.post("/chat/stream", async (req, res) => {
  const parsed = SendMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { message, language = "en", sessionId } = parsed.data;
  const sid = sessionId || randomUUID();
  const module = detectModule(message);

  // Save user message to DB
  await db.insert(chatMessagesTable).values({
    sessionId: sid,
    role: "user",
    message,
    module,
    language,
  });

  // Load conversation history for context (last 20 messages)
  const history = await db
    .select()
    .from(chatMessagesTable)
    .where(eq(chatMessagesTable.sessionId, sid))
    .orderBy(asc(chatMessagesTable.createdAt))
    .limit(20);

  // Build Gemini messages from history (excluding the just-inserted user message)
  const previousMessages = history.slice(0, -1);
  const geminiMessages = previousMessages.map((m) => ({
    role: m.role === "assistant" ? "model" as const : "user" as const,
    parts: [{ text: m.message }],
  }));

  // Add language instruction to the current user message
  const languageHint = language !== "en"
    ? `[The user prefers to communicate in language code: ${language}. Please respond in that language if possible.]\n\n`
    : "";
  const currentMessage = `${languageHint}${message}`;

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders();

  let fullResponse = "";
  const messageId = randomUUID();
  const now = new Date();

  try {
    const stream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
      contents: [
        ...geminiMessages,
        { role: "user", parts: [{ text: currentMessage }] },
      ],
      config: { maxOutputTokens: 8192 },
    });

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        fullResponse += text;
        res.write(`data: ${JSON.stringify({ content: text, id: messageId })}\n\n`);
      }
    }

    // Save assistant message to DB
    await db.insert(chatMessagesTable).values({
      sessionId: sid,
      role: "assistant",
      message: fullResponse,
      module,
      language,
    });

    // Send completion event
    res.write(`data: ${JSON.stringify({
      done: true,
      id: messageId,
      module,
      timestamp: now.toISOString(),
    })}\n\n`);
    res.end();
  } catch (err) {
    console.error("Gemini streaming error:", err);
    const errorMsg = "I'm having trouble connecting to my knowledge base right now. Please try again in a moment.";
    res.write(`data: ${JSON.stringify({ content: errorMsg, id: messageId })}\n\n`);
    res.write(`data: ${JSON.stringify({ done: true, id: messageId, module: "general", timestamp: now.toISOString() })}\n\n`);
    res.end();
  }
});

router.get("/chat/history", async (req, res) => {
  const sessionId = req.query.sessionId as string | undefined;
  if (!sessionId) {
    res.status(400).json({ error: "sessionId query param required" });
    return;
  }

  const rows = await db
    .select()
    .from(chatMessagesTable)
    .where(eq(chatMessagesTable.sessionId, sessionId))
    .orderBy(asc(chatMessagesTable.createdAt));

  const messages = rows.map((r) => ({
    id: String(r.id),
    role: r.role as "user" | "assistant",
    message: r.message,
    timestamp: r.createdAt.toISOString(),
    module: r.module as "legal" | "kisan" | "yojana" | "general",
  }));

  res.json({ messages });
});

export default router;
