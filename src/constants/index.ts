// Contains constant data for using in website

export const SITE_URL = "https://jashan-ai-sys.github.io/";

export const HERO = {
  headline: "AI agents that pick up the phone",
  headlineAccent: "and know what to say.",
  summary:
    "I build voice agents, chatbots and automation for businesses, test them before they meet a customer, and can run them on your own servers.",
} as const;

export const NAV_LINKS = [
  { id: "work", title: "Work" },
  { id: "services", title: "Services" },
  { id: "process", title: "Process" },
  { id: "contact", title: "Contact" },
] as const;

// Places a client can reach me or see more of my work
export const PROFILE_LINKS = [
  { title: "GitHub", href: "https://github.com/Jashan-ai-sys" },
] as const;

export const MARQUEE = [
  "Voice agents",
  "Chatbots",
  "RAG",
  "LLM evaluation",
  "Guardrail testing",
  "Self-hosted models",
  "Python",
  "Node.js",
  "Playwright",
  "Docker",
  "AWS",
] as const;

// Projects (company names are withheld for confidentiality)
export const PROJECTS = [
  {
    name: "Sales voice agent",
    kind: "Voice AI",
    tags: ["Python", "Speech + LLM", "AWS"],
    description:
      "A fintech sales team needed to qualify large lead lists by phone without growing its calling team. I built a production voice agent that listens, reasons and speaks in real time, with each campaign's script kept as an editable step-by-step flow.",
  },
  {
    name: "Delivery follow-up calls",
    kind: "Voice AI",
    tags: ["Voice workflow", "RAG", "Evaluation"],
    description:
      "Every failed delivery at a courier company needed a call to the customer. I built a voice workflow that calls from a campaign sheet and answers from the company's knowledge base, with a test set that checks its answers first.",
  },
  {
    name: "Portal report automation",
    kind: "Automation",
    tags: ["Node.js", "Playwright", "Telegram bot"],
    description:
      "A lending team downloaded reports by hand from a partner portal with no API and a two-hour logout. I built a service that keeps a browser session alive, exports reports on request and lets the team log in again through a Telegram bot.",
  },
  {
    name: "Ticket follow-up automation",
    kind: "Automation",
    tags: ["Python", "Helpdesk API", "Docker"],
    description:
      "Support agents had to remember to chase outside parties who had not replied. I built a scheduled service that finds waiting tickets, counts working days and drafts each reminder on the original thread for an agent to review and send.",
  },
] as const;

// Public projects with source code on GitHub
export const OPEN_PROJECTS: readonly {
  name: string;
  tags: readonly string[];
  description: string;
  code: string;
  demo?: string;
}[] = [
  {
    name: "Payment recovery voice agent",
    tags: ["Voice AI", "Hindi", "Twilio", "Cloud Run"],
    description:
      "Built for the Razorpay AI Buildathon. It spots subscription payments at risk, decides when to call, and phones the customer in Hindi to recover the payment, sending a payment link during the call. On a production call the agent replied about 1.1 seconds after the customer stopped speaking.",
    code: "https://github.com/Jashan-ai-sys/dunning-agent",
  },
  {
    name: "Multi-agent customer support",
    tags: ["Multi-agent", "MCP", "Gemini"],
    description:
      "Built for the Ksolves Agentic AI Hackathon 2026. A team of AI agents resolves support tickets on its own: one scores the risk, one plans, one checks the plan against company policy, one carries it out, and every step is written to an audit log.",
    code: "https://github.com/Jashan-ai-sys/ShopWave-MultiAgent-Customer-Support-System",
  },
  {
    name: "Sales call intelligence",
    tags: ["Whisper", "Llama", "RAG", "FastAPI"],
    description:
      "Turns sales-call recordings into transcripts, detects intent, sentiment and objections, picks out the turning points in each call, and shows a summary, a score and coaching notes on a dashboard.",
    code: "https://github.com/Jashan-ai-sys/AI-Sales-Call-Intelligence-System",
  },
  {
    name: "AI savings coach",
    tags: ["Next.js", "LLM chat", "Fintech"],
    description:
      "Built for a fintech hackathon. It reads a user's transactions, works out how much is safe to save, recommends a fixed deposit to match, and explains the recommendation in a chat.",
    code: "https://github.com/Jashan-ai-sys/YieldWise",
    demo: "https://yield-wise-66gr.vercel.app/",
  },
];

export const SERVICES = [
  {
    title: "Voice agents",
    items: [
      "Inbound and outbound calls",
      "Lead qualification",
      "Reminders and follow-ups",
      "Customer support lines",
    ],
  },
  {
    title: "Chatbots",
    items: [
      "Website and messaging bots",
      "Answers from your own documents",
      "Lead capture around the clock",
      "Hand-off to your team",
    ],
  },
  {
    title: "Evaluation",
    items: [
      "Stays on topic and on script",
      "Refuses what it should",
      "No leaked data or invented answers",
      "Prompt-injection and jailbreak tests",
    ],
  },
  {
    title: "Automation and hosting",
    items: [
      "Portal and browser automation",
      "Reports, data entry, CRM updates",
      "Open-source models on your servers",
      "Docker and AWS deployment",
    ],
  },
] as const;

export const PROCESS = [
  {
    stage: "Discovery",
    title: "Understand your process",
    description:
      "You describe the calls, chats or manual work you want handled. I tell you plainly what can be automated and what can't, then send an approach, a timeline and a fixed price.",
  },
  {
    stage: "Build",
    title: "A working version, quickly",
    description:
      "You get a first working agent or automation to try on real cases. Conversation scripts are kept separate from the engine, so they can change without a rebuild.",
  },
  {
    stage: "Evaluation",
    title: "Test before it meets a customer",
    description:
      "I check that the bot stays on topic, refuses what it should and resists prompt injection. You get a written report of what failed and how it was fixed.",
  },
  {
    stage: "Handover",
    title: "Yours to run",
    description:
      "You receive clean code and clear documentation, your team can run the system without me, and I tune it against real usage once it is live.",
  },
] as const;
