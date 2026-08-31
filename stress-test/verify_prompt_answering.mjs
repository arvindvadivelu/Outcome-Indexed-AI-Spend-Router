// ==============================================================================
// 🧠 DYNAMIC PROMPT ANSWERING & COMPLETIONS TEST SUITE
// Tests that ANY user prompt receives a direct, contextual, high-quality answer
// ==============================================================================

const BASE_URL = "http://localhost:3000";

let passed = 0;
let failed = 0;

function assert(condition, message, detail = "") {
  if (condition) {
    console.log(`✅ [PASS] ${message}${detail ? ` — ${detail}` : ""}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${message}${detail ? ` — ${detail}` : ""}`);
    failed++;
  }
}

async function testPrompt(title, prompt, expectedKeywords) {
  console.log(`\n--- Testing: ${title} ---`);
  const res = await fetch(`${BASE_URL}/api/v1/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: prompt }]
    })
  });
  const data = await res.json();
  assert(res.status === 200, `${title} returned HTTP 200 OK`, `Model: ${data.model}`);
  
  const content = data.choices?.[0]?.message?.content || "";
  assert(content.length > 50, `${title} returned non-empty contextual content (${content.length} chars)`);

  for (const kw of expectedKeywords) {
    assert(content.toLowerCase().includes(kw.toLowerCase()), `${title} output contains expected context: "${kw}"`);
  }
  
  console.log(`Response Snippet:\n${content.slice(0, 180)}...\n`);
}

async function runPromptTestSuite() {
  console.log("================================================================");
  console.log("🧠 STARTING DYNAMIC PROMPT ANSWERING VERIFICATION SUITE");
  console.log("================================================================\n");

  // 1. Coding Prompt
  await testPrompt(
    "Python Coding Prompt",
    "Write a Python script to parse CSV files and compute average column values",
    ["def ", "python", "csv"]
  );

  // 2. Technical Explanation Prompt
  await testPrompt(
    "Conceptual Explanation Prompt",
    "What is quantum computing and how does it work?",
    ["quantum", "principle", "concept"]
  );

  // 3. Mathematical Reasoning Prompt
  await testPrompt(
    "Math & Logic Prompt",
    "Calculate the derivative of f(x) = 3x^2 + 5x - 8",
    ["step", "solution", "derivative"]
  );

  // 4. Conversational Prompt
  await testPrompt(
    "Conversational Prompt",
    "Hello! How can you help me today?",
    ["hello", "assist"]
  );

  console.log("================================================================");
  console.log(`📊 PROMPT TEST SUMMARY: ${passed} / ${passed + failed} TESTS PASSED (${((passed / (passed + failed)) * 100).toFixed(1)}%)`);
  console.log("================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runPromptTestSuite();
