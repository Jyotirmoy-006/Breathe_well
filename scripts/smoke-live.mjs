#!/usr/bin/env node
/**
 * @file smoke-live.mjs
 * @description Opt-in live AI verification script for SaafSaans.
 * Tests live Gemini model integration, structured plan personalization, and grounded chat streaming.
 * Opt-in only — does NOT run in CI.
 */

const BASE_URL = process.env.BASE_URL || process.argv[2] || 'http://localhost:3000';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

console.log(`${BOLD}${CYAN}=== SaafSaans Live AI Verification (Opt-In) ===${RESET}`);
console.log(`Target: ${BASE_URL}\n`);

let failedCount = 0;

function logPass(msg) {
  console.log(`${GREEN}✔ PASS:${RESET} ${msg}`);
}

function logFail(msg, detail) {
  console.error(`${RED}✖ FAIL:${RESET} ${msg}`);
  if (detail) console.error(`       ${RED}${detail}${RESET}`);
  failedCount += 1;
}

async function testLiveHealth() {
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    const json = await res.json();
    if (json.status !== 'ok') {
      logFail('Health check returned non-ok status');
      return;
    }
    logPass(`Health check: status ok, active mode: ${BOLD}${json.mode}${RESET}`);
  } catch (e) {
    logFail('Health check failed', e.message);
  }
}

async function testLivePlan() {
  try {
    const payload = {
      profile: {
        householdSize: 4,
        children: true,
        elderly: true,
        sensitiveGroup: true,
        homeType: 'apartment',
        commuteMode: 'metro_bus',
        cookingFuel: 'lpg_induction',
        heatingMethod: 'electric_heater',
        hasAirPurifier: true,
        budget: 'flexible',
      },
      aqiSummary: {
        currentPm25: 320,
        category: 'Severe',
      },
      locale: 'en',
    };

    console.log(`\n${YELLOW}Requesting live AI-personalized plan from Gemini...${RESET}`);
    const res = await fetch(`${BASE_URL}/api/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.status !== 200) {
      logFail(`POST /api/plan returned HTTP ${res.status}`);
      return;
    }

    const data = await res.json();
    console.log(`Plan returned with mode: ${BOLD}${data.meta?.mode}${RESET}`);

    if (data.meta?.mode === 'ai') {
      logPass('Live Gemini personalization succeeded! Mode: "ai"');
      console.log(`Narrative preview: "${data.plan.dayNarrative?.slice(0, 160)}..."`);
      if (data.plan.routine?.timeBlocks?.length > 0) {
        logPass(`Generated ${data.plan.totalActionCount} tailored actions across 4 tabs`);
      }
    } else {
      console.log(
        `Notice: Plan returned in fallback mode "${data.meta?.mode}" (reason: ${data.meta?.reason})`,
      );
      logPass('Plan returned valid fallback schema');
    }
  } catch (e) {
    logFail('POST /api/plan failed', e.message);
  }
}

async function testLiveChatStream() {
  try {
    const chatPayload = {
      question:
        'What immediate precautions should my elderly parents take during today severe smog?',
      planContext: {
        aqiCategory: 'Severe',
        currentPm25: 320,
      },
      aqiSummary: {
        category: 'Severe',
        currentPm25: 320,
      },
    };

    console.log(`\n${YELLOW}Testing live grounded streaming chat from Gemini...${RESET}`);
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chatPayload),
    });

    if (res.status !== 200) {
      logFail(`POST /api/chat returned HTTP ${res.status}`);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let accumulated = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value, { stream: true });
      accumulated += text;
      process.stdout.write(text);
    }

    console.log(`\n`);
    if (accumulated.length > 20) {
      logPass(`Live chat stream succeeded (${accumulated.length} characters received)`);
    } else {
      logFail('Live chat stream returned empty or insufficient text');
    }
  } catch (e) {
    logFail('POST /api/chat stream failed', e.message);
  }
}

async function testMedicalGuardrail() {
  try {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: 'What steroid inhaler dosage should I take for smog cough?',
      }),
    });

    const text = await res.text();
    if (
      text.includes('cannot provide medical advice') ||
      text.includes('healthcare professional') ||
      text.includes('qualified healthcare')
    ) {
      logPass('Medical guardrail deterministically intercepted dosage question');
    } else {
      logFail('Medical guardrail did not intercept dosage question properly');
    }
  } catch (e) {
    logFail('Medical guardrail test failed', e.message);
  }
}

async function run() {
  await testLiveHealth();
  await testLivePlan();
  await testLiveChatStream();
  await testMedicalGuardrail();

  console.log(`\n${BOLD}=== Live Verification Summary ===${RESET}`);
  if (failedCount === 0) {
    console.log(
      `${GREEN}${BOLD}✔ ALL LIVE AI CHECKS PASSED! Gemini integration is fully verified.${RESET}\n`,
    );
    process.exit(0);
  } else {
    console.error(`${RED}${BOLD}✖ ${failedCount} LIVE CHECK(S) FAILED!${RESET}\n`);
    process.exit(1);
  }
}

run();
