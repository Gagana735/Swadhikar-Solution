import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { chatMessagesTable } from "@workspace/db/schema";
import { eq, asc } from "drizzle-orm";
import { SendMessageBody, SendMessageResponse, GetChatHistoryResponse } from "@workspace/api-zod";
import { randomUUID } from "crypto";

const router: IRouter = Router();

function detectModule(message: string): "legal" | "kisan" | "yojana" | "general" {
  const lower = message.toLowerCase();
  if (
    lower.includes("legal") || lower.includes("court") || lower.includes("lawyer") ||
    lower.includes("rights") || lower.includes("rti") || lower.includes("tenant") ||
    lower.includes("evict") || lower.includes("wage") || lower.includes("consumer") ||
    lower.includes("police") || lower.includes("fir") || lower.includes("property") ||
    lower.includes("know my rights") || lower.includes("how to file")
  ) {
    return "legal";
  }
  if (
    lower.includes("farmer") || lower.includes("kisan") || lower.includes("crop") ||
    lower.includes("fasal") || lower.includes("agriculture") || lower.includes("insurance") ||
    lower.includes("nabard") || lower.includes("credit card") || lower.includes("pm-kisan") ||
    lower.includes("farm") || lower.includes("kheti") || lower.includes("farmer schemes")
  ) {
    return "kisan";
  }
  if (
    lower.includes("scheme") || lower.includes("yojana") || lower.includes("benefit") ||
    lower.includes("pension") || lower.includes("housing") || lower.includes("awas") ||
    lower.includes("ujjwala") || lower.includes("ayushman") || lower.includes("scholarship") ||
    lower.includes("subsidy") || lower.includes("ration") || lower.includes("government benefits") ||
    lower.includes("welfare")
  ) {
    return "yojana";
  }
  return "general";
}

function generateResponse(message: string, module: "legal" | "kisan" | "yojana" | "general", language: string): string {
  const lower = message.toLowerCase();

  if (module === "legal") {
    if (lower.includes("rti") || lower.includes("how to file")) {
      return `**Filing an RTI (Right to Information) Application** ⚖️

Here's your step-by-step guide:

1. **Write your application** — Address it to the Public Information Officer (PIO) of the relevant government department. State your question clearly in simple language.

2. **Application fee** — ₹10 for Central Government departments (pay via postal order, DD, or online). Many states have similar fees.

3. **Submit your application** — Post it or hand-deliver to the PIO. You can also file online at **rtionline.gov.in** for Central Government departments.

4. **Response timeline** — The PIO must respond within **30 days**. If life/liberty is concerned, within 48 hours.

5. **If no response** — File a First Appeal with the First Appellate Authority within 30 days. If still ignored, escalate to the **Central/State Information Commission**.

📋 **Documents needed:** Just the application and ₹10 fee. No ID proof required.

💡 **Tip:** Keep a copy of everything you submit. Note the date of submission.

Would you like help drafting your RTI application?`;
    }
    if (lower.includes("tenant") || lower.includes("evict") || lower.includes("rent")) {
      return `**Tenant Rights in India** ⚖️

If you are facing illegal eviction or rent disputes, here's what you can do:

**Your rights as a tenant:**
- A landlord CANNOT evict you without proper notice (usually 15–30 days written notice, depending on your rental agreement and state laws)
- Eviction must go through the proper legal process — forced removal is illegal
- You have the right to basic amenities like water and electricity

**Immediate steps:**
1. **Document everything** — take photos/videos, keep all rent receipts
2. **Send a written reply** to any eviction notice
3. **Approach the Rent Controller** in your city — this is a special court for tenant disputes
4. **File a complaint with the police** if the landlord uses force or cuts utilities

**Which forum to approach:**
- Rent disputes → **Rent Control Court** (available in most cities)
- Illegal entry by landlord → **Local Police Station** (file an FIR)
- Consumer issues → **District Consumer Forum**

📍 **Find your nearest District Legal Services Authority (DLSA)** for free legal aid — available in every district.

What specific situation are you facing? I can give more targeted guidance.`;
    }
    if (lower.includes("wage") || lower.includes("salary")) {
      return `**Wage Theft & Unpaid Salary — Know Your Rights** ⚖️

If your employer is withholding wages, here's your action plan:

**Legal protections you have:**
- **Payment of Wages Act, 1936** — wages must be paid by the 7th or 10th of the following month
- **Minimum Wages Act** — your employer must pay at least the state minimum wage
- **Industrial Disputes Act** — wrongful termination without paying dues is illegal

**Steps to take:**
1. **Send a written complaint** to your employer via registered post (keep a copy)
2. **File a complaint** with the **Labour Commissioner** in your district — it's free and they have authority to order payment
3. **Approach the Labour Court** if the Commissioner cannot resolve it
4. **File an RTI** to check if your employer has registered with the appropriate labour authority

**Documents to gather:**
- Salary slips (if any), bank statements showing past payments
- Employment letter or any written agreement
- Attendance records

📍 Contact your District **Labour Commissioner's Office** — free to file a complaint.

Need help drafting a complaint letter?`;
    }
    return `**Legal Advisor — Swadhikar** ⚖️

I can help you with a wide range of legal matters. Here are some areas I can guide you through:

🏠 **Tenant & Housing Rights** — Illegal eviction, rent disputes, property matters
💰 **Wage & Labour Rights** — Unpaid salary, wrongful termination, minimum wage
📋 **RTI (Right to Information)** — How to file, escalate, and use RTI effectively
👨‍👩‍👧 **Consumer Rights** — Fraud, defective products, service complaints
⚠️ **Domestic Violence** — Protection orders, legal remedies
🏗️ **Property Transactions** — Buying, selling, registration guidance

**Free Legal Aid is your right** — Every district has a **District Legal Services Authority (DLSA)** that provides free legal help to eligible citizens.

Tell me more about your specific situation, and I'll walk you through the exact steps you need to take.`;
  }

  if (module === "kisan") {
    if (lower.includes("fasal bima") || lower.includes("crop insurance") || lower.includes("insurance")) {
      return `**PM Fasal Bima Yojana — Crop Insurance Guide** 🌾

Here's everything you need to know:

**Eligibility:**
- All farmers growing notified crops (check your state's notified crop list)
- Both loanee and non-loanee farmers can apply
- Sharecroppers and tenant farmers are also eligible

**Key deadlines:**
- **Kharif crops:** July 31 (varies by state)
- **Rabi crops:** December 31 (varies by state)

**⚠️ CRITICAL: The 72-Hour Rule**
If your crop suffers damage, you MUST notify within **72 hours** of the damage event. This is the most common reason claims get rejected.

**How to notify crop damage:**
1. Call the toll-free helpline: **14447**
2. Use the **Crop Insurance App** (available on Play Store/App Store)
3. Inform your bank branch (if you have a crop loan)
4. Contact the local agriculture department

**Documents needed for claim:**
- Aadhaar card
- Land records (Khasra/Khatauni)
- Bank account details
- Crop sowing certificate (from Patwari)
- Photograph of damaged crop

**What to do if claim is rejected:**
1. Ask for a written reason for rejection
2. File a grievance at **agri-insurance.gov.in**
3. Approach the District Agriculture Officer
4. File an RTI for claim processing records

Would you like guidance on any specific step?`;
    }
    if (lower.includes("kisan credit") || lower.includes("kcc")) {
      return `**Kisan Credit Card (KCC) — Complete Guide** 🌾

**What is KCC?**
A revolving credit facility for farmers to meet cultivation and allied expenses. Interest rate is typically **4% per annum** (heavily subsidized).

**Eligibility:**
- Individual/joint farmers owning or leasing agricultural land
- Sharecroppers, oral lessees, tenant farmers
- Self-help groups (SHGs) and joint liability groups (JLGs)

**Documents required:**
- Aadhaar card (mandatory)
- PAN card or Form 60
- Land ownership documents (Khasra/Jamabandi)
- Passport-sized photographs
- Any existing loan documents

**Which bank to approach:**
- Any Nationalized bank, Regional Rural Bank (RRB), or Cooperative bank
- Your local **NABARD**-linked bank branch is best
- **PM-KISAN registered farmers** get priority processing

**Steps to apply:**
1. Visit your nearest bank branch
2. Fill **KCC application form** (free, available at bank)
3. Submit documents + 2 passport photos
4. Bank will do a field verification
5. Card issued within **14 days** of application

**Credit limit:** Typically covers crop cultivation cost + 10% for post-harvest expenses + 20% for maintenance

Need help with any specific step or facing a rejection? Tell me more.`;
    }
    if (lower.includes("pm-kisan") || lower.includes("pm kisan")) {
      return `**PM-KISAN Scheme — ₹6,000/year Direct Transfer** 🌾

**What you get:** ₹2,000 every 4 months (3 installments/year) directly in your bank account.

**Eligibility:**
- Small and marginal farmers with cultivable land up to 2 hectares
- Must have Aadhaar-linked bank account

**NOT eligible if:**
- You/family member is a government employee drawing ₹10,000+/month pension
- You paid income tax in the last assessment year
- You hold a constitutional post

**How to register:**
1. Visit **pmkisan.gov.in** or your nearest **Common Service Centre (CSC)**
2. Register with: Aadhaar, bank account number, mobile number, land records
3. **eKYC is mandatory** — do it online or at CSC

**Check your payment status:**
- Visit pmkisan.gov.in → "Beneficiary Status"
- Enter Aadhaar/Account number/Mobile

**If payment is stuck:**
- Check if eKYC is complete
- Verify Aadhaar-bank linkage (do at bank branch)
- Contact PM-KISAN helpline: **155261** or **011-23381092**

Want help with registration or troubleshooting a payment issue?`;
    }
    return `**Kisan Navigator — Swadhikar** 🌾

I can guide you through all farmer schemes and benefits. Here's what I can help with:

💰 **PM-KISAN** — ₹6,000/year direct cash transfer to your bank
🌱 **PM Fasal Bima Yojana** — Crop insurance for loss due to weather/pests
🏦 **Kisan Credit Card (KCC)** — Low-interest credit at just 4% per annum
🚜 **NABARD Schemes** — Emergency credit and rural development loans
🌾 **State schemes** — Tell me your state for specific schemes

**Tell me:**
1. Which state are you in?
2. What crop do you grow?
3. How much land do you have?
4. Do you have a bank account?

With these details, I can show you exactly which schemes you qualify for and exactly what to do.`;
  }

  if (module === "yojana") {
    if (lower.includes("ayushman") || lower.includes("health")) {
      return `**Ayushman Bharat — PM-JAY (Health Cover up to ₹5 Lakh/year)** 🏛️

**What you get:** Free hospital treatment up to **₹5,00,000 per year** for a family — covering surgery, ICU, medicines, and more at 25,000+ empanelled hospitals.

**Who qualifies:**
- Families listed in **SECC 2011** (Socio-Economic Caste Census) database
- **RSBY** (Rashtriya Swasthya Bima Yojana) beneficiaries
- In many states, coverage has been expanded — check your state's list

**How to check if you're eligible:**
- Visit **pmjay.gov.in** → click "Am I Eligible?"
- Enter your mobile number and OTP
- Or call helpline: **14555**

**Getting your Ayushman Card (Golden Card):**
1. Visit any **Common Service Centre (CSC)** or empanelled hospital
2. Bring Aadhaar card
3. The card is generated free of cost

**At the hospital:**
- Show your Ayushman Card at the counter
- No cash payment needed for covered treatments
- If hospital asks for money illegally, call **14555** immediately

**Why many people miss this:**
- They don't know they're in the SECC database
- They think it only covers government hospitals (it covers private hospitals too!)

Want help checking your eligibility?`;
    }
    if (lower.includes("awas") || lower.includes("housing") || lower.includes("house")) {
      return `**PM Awas Yojana — Free/Subsidized Housing** 🏛️

India's flagship housing scheme has two parts:

**PM Awas Yojana — Gramin (Rural)**
- For rural households without pucca (permanent) housing
- Benefit: ₹1.20 lakh (plains) or ₹1.30 lakh (hilly/difficult areas)
- Includes: ₹12,000 for toilets (Swachh Bharat Mission)

**PM Awas Yojana — Urban (PMAY-U)**
- For urban slum dwellers and EWS/LIG families
- Benefit: Up to ₹2.67 lakh interest subsidy on home loan
- Credit Linked Subsidy Scheme (CLSS) for first-time homebuyers

**Eligibility (Gramin):**
- Name in Awaiting List (from SECC 2011 data)
- No pucca house in name or family member's name
- Priority: SC/ST, minorities, ex-servicemen, disabled persons

**How to check your name:**
- Visit **pmayg.nic.in** → "Stakeholders" → "IAY/PMAYG Beneficiary"
- Or visit your Gram Panchayat office

**To apply (Gramin):**
- Approach your **Gram Panchayat Pradhan** or Block Development Officer
- Application is free — never pay any agent or official

**Why people miss this:**
- They don't know their name is already in the system
- Local officials demand bribes — you have the RIGHT to apply for free

Want to know more about a specific aspect?`;
    }
    if (lower.includes("ujjwala") || lower.includes("gas") || lower.includes("lpg")) {
      return `**PM Ujjwala Yojana — Free LPG Gas Connection** 🏛️

**What you get:** Free LPG gas connection + first refill subsidy

**Eligibility:**
- Women from BPL (Below Poverty Line) households
- Women from SC/ST/SECC/PM Awas Yojana/Antyodaya Anna Yojana families
- Tea/ex-tea garden families, forest dwellers, island residents

**Documents needed:**
- Aadhaar card (mandatory)
- BPL Ration card (pink/yellow)
- Bank passbook (must be linked to Aadhaar)
- Passport-sized photograph

**How to apply:**
1. Visit the nearest **LPG Distributor** (check on OMC websites)
2. Fill the **KYC form** (free, available at distributor)
3. Submit documents
4. Connection approved within 3 working days

**Check your status:**
- Visit **mylpg.in** or call **1906**

**If distributor demands money:**
- A connection under Ujjwala is FREE
- Report to the oil company's toll-free helpline
- File a complaint at **pgportal.gov.in**

Want help finding the nearest distributor or checking your eligibility?`;
    }
    return `**Sarkar Yojana Finder — Swadhikar** 🏛️

The Central Government alone runs 300+ welfare schemes. Here's a quick guide to the most impactful ones:

🏥 **Ayushman Bharat** — Free health cover ₹5 lakh/year for eligible families
🏠 **PM Awas Yojana** — Free/subsidized housing for BPL families
🔥 **PM Ujjwala** — Free LPG gas connection for BPL women
📚 **National Scholarships** — For students at all education levels
👴 **Old Age Pension** — ₹200-500/month for seniors (varies by state)
♿ **NSAP Disability Pension** — For persons with disability
💼 **MSME Loans** — Low-interest business loans for small entrepreneurs

**To find ALL schemes you qualify for, tell me:**
1. Your state
2. Your family income (approximate)
3. Your caste category (General/OBC/SC/ST)
4. Gender
5. Age
6. Do you have any disability?

I'll then show you every scheme you're eligible for with exact documents and where to apply.`;
  }

  // General / welcome responses
  if (lower.includes("namaste") || lower.includes("hello") || lower.includes("hi") || lower.includes("helo")) {
    return `Namaste! Welcome to Swadhikar 🙏

I'm here to help you claim what is rightfully yours. Here's how I can help:

⚖️ **Legal Advisor** — Understand your legal rights, navigate courts, file RTIs, get free legal aid

🌾 **Kisan Navigator** — Find all farmer schemes you qualify for, claim crop insurance, apply for KCC

🏛️ **Yojana Finder** — Discover all government welfare schemes you're eligible for — health, housing, gas, scholarships, pensions

Just tell me what you need help with, or tap one of the quick reply buttons below. There is no question too simple. I'm here to walk you through everything step by step.

What would you like help with today?`;
  }

  return `Thank you for reaching out to Swadhikar 🙏

I'm your rights navigator. I can help you with:

⚖️ **Legal matters** — Type "legal rights" or ask about courts, RTI, tenant rights, wage theft
🌾 **Farmer schemes** — Type "farmer schemes" to find all schemes you qualify for
🏛️ **Government benefits** — Type "government benefits" to discover welfare schemes

Or simply describe your situation in your own words — I'll understand and guide you accordingly.

For example:
- "My landlord is trying to evict me illegally"
- "I'm a farmer in Punjab, what insurance do I qualify for?"
- "What housing schemes can I get?"`;
}

router.post("/chat", async (req, res) => {
  const parsed = SendMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { message, language = "en", sessionId } = parsed.data;
  const sid = sessionId || randomUUID();
  const module = detectModule(message);
  const responseText = generateResponse(message, module, language);
  const now = new Date();

  await db.insert(chatMessagesTable).values({
    sessionId: sid,
    role: "user",
    message,
    module,
    language,
  });

  const [assistantRow] = await db
    .insert(chatMessagesTable)
    .values({
      sessionId: sid,
      role: "assistant",
      message: responseText,
      module,
      language,
    })
    .returning();

  const response = SendMessageResponse.parse({
    id: String(assistantRow.id),
    message: responseText,
    timestamp: now.toISOString(),
    module,
  });

  res.json(response);
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

  const response = GetChatHistoryResponse.parse({ messages });
  res.json(response);
});

export default router;
