#!/usr/bin/env node
/**
 * @file smoke.mjs
 * @description Production smoke test script verifying critical endpoints, security headers, and plan API.
 * Accepts BASE_URL via environment variable or CLI argument (defaults to http://localhost:3000).
 * Exits with 0 on complete pass, 1 on any failure.
 */

const BASE_URL = process.env.BASE_URL || process.argv[2] || 'http://localhost:3000';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

console.log(`${BOLD}${CYAN}=== SaafSaans Production Smoke Test ===${RESET}`);
console.log(`Target Base URL: ${BASE_URL}\n`);

let failedCount = 0;

function logPass(message) {
  console.log(`${GREEN}✔ PASS:${RESET} ${message}`);
}

function logFail(message, details) {
  console.error(`${RED}✖ FAIL:${RESET} ${message}`);
  if (details) {
    console.error(`       ${RED}${details}${RESET}`);
  }
  failedCount += 1;
}

async function testRootPage() {
  try {
    const res = await fetch(`${BASE_URL}/`);
    if (res.status !== 200) {
      logFail(`GET / returned HTTP ${res.status}`);
      return;
    }
    const html = await res.text();
    if (!html.includes('SaafSaans') && !html.includes('साफ़ साँस')) {
      logFail('GET / response HTML does not contain SaafSaans title');
      return;
    }
    logPass('GET / returned HTTP 200 with SaafSaans title');

    // Verify Security Headers on Root
    const csp = res.headers.get('content-security-policy');
    const nosniff = res.headers.get('x-content-type-options');
    const frameOptions = res.headers.get('x-frame-options');

    if (!nosniff || !nosniff.includes('nosniff')) {
      logFail('Missing X-Content-Type-Options: nosniff header');
    } else {
      logPass('Verified X-Content-Type-Options: nosniff');
    }

    if (!frameOptions || !frameOptions.includes('DENY')) {
      logFail('Missing X-Frame-Options: DENY header');
    } else {
      logPass('Verified X-Frame-Options: DENY');
    }

    if (!csp) {
      logFail('Missing Content-Security-Policy header');
    } else {
      logPass('Verified Content-Security-Policy header');
    }
  } catch (err) {
    logFail('GET / request failed', err.message);
  }
}

async function testHealthEndpoint() {
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    if (res.status !== 200) {
      logFail(`GET /api/health returned HTTP ${res.status}`);
      return;
    }
    const json = await res.json();
    if (json.status !== 'ok' || typeof json.uptime !== 'number') {
      logFail('GET /api/health returned invalid payload schema', JSON.stringify(json));
      return;
    }
    logPass(`GET /api/health returned HTTP 200 (status: ok, mode: ${json.mode})`);
  } catch (err) {
    logFail('GET /api/health request failed', err.message);
  }
}

async function testAirQualityEndpoint() {
  try {
    const res = await fetch(`${BASE_URL}/api/air-quality?lat=28.61&lon=77.21`);
    if (res.status !== 200) {
      logFail(`GET /api/air-quality returned HTTP ${res.status}`);
      return;
    }
    const json = await res.json();
    const pm25 = typeof json.live?.pm25 === 'number' ? json.live.pm25 : json.live?.currentPm25;
    const aqi =
      typeof json.live?.cpcbSubIndex === 'number' ? json.live.cpcbSubIndex : json.live?.aqi;

    if (!json.live || typeof pm25 !== 'number' || !json.windows) {
      logFail('GET /api/air-quality returned invalid air quality schema');
      return;
    }
    logPass(`GET /api/air-quality returned HTTP 200 (PM2.5: ${pm25} µg/m³, AQI: ${aqi})`);
  } catch (err) {
    logFail('GET /api/air-quality request failed', err.message);
  }
}

async function testPlanEndpoint() {
  try {
    const payload = {
      profile: {
        householdSize: 4,
        children: true,
        elderly: false,
        sensitiveGroup: true,
        homeType: 'apartment',
        commuteMode: 'car_ac',
        cookingFuel: 'lpg_induction',
        heatingMethod: 'electric_heater',
        hasAirPurifier: false,
        budget: 'flexible',
      },
      aqiSummary: {
        currentPm25: 280,
      },
      locale: 'en',
    };

    const res = await fetch(`${BASE_URL}/api/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.status !== 200) {
      logFail(`POST /api/plan returned HTTP ${res.status}`);
      return;
    }
    const json = await res.json();
    if (!json.plan || !json.plan.routine || !json.meta) {
      logFail('POST /api/plan returned invalid plan schema');
      return;
    }
    logPass(
      `POST /api/plan returned HTTP 200 (Mode: ${json.meta.mode}, Actions: ${json.plan.totalActionCount})`,
    );
  } catch (err) {
    logFail('POST /api/plan request failed', err.message);
  }
}

async function runAll() {
  await testRootPage();
  await testHealthEndpoint();
  await testAirQualityEndpoint();
  await testPlanEndpoint();

  console.log(`\n${BOLD}=== Smoke Test Summary ===${RESET}`);
  if (failedCount === 0) {
    console.log(
      `${GREEN}${BOLD}✔ ALL SMOKE TESTS PASSED! Production deployment is healthy.${RESET}\n`,
    );
    process.exit(0);
  } else {
    console.error(`${RED}${BOLD}✖ ${failedCount} SMOKE TEST(S) FAILED!${RESET}\n`);
    process.exit(1);
  }
}

runAll();
