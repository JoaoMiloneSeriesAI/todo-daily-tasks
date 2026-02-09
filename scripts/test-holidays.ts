/**
 * Standalone Holiday API Test Script
 * 
 * Run with: npx tsx scripts/test-holidays.ts
 * 
 * Tests the OpenHolidaysAPI directly, outside of Electron,
 * to diagnose why holidays may not be loading.
 */

const BASE_URL = 'https://openholidaysapi.org';

interface TestCase {
  country: string;
  year: number;
  lang?: string;
}

const testCases: TestCase[] = [
  // With language
  { country: 'BR', year: 2026, lang: 'EN' },
  { country: 'BR', year: 2025, lang: 'EN' },
  { country: 'US', year: 2026, lang: 'EN' },
  { country: 'US', year: 2025, lang: 'EN' },
  { country: 'DE', year: 2026, lang: 'EN' },
  { country: 'DE', year: 2025, lang: 'EN' },
  // Without language (to see if languageIsoCode filters results)
  { country: 'BR', year: 2026 },
  { country: 'BR', year: 2025 },
  { country: 'US', year: 2026 },
];

async function testHolidays(tc: TestCase): Promise<void> {
  const params = new URLSearchParams({
    countryIsoCode: tc.country,
    validFrom: `${tc.year}-01-01`,
    validTo: `${tc.year}-12-31`,
  });
  if (tc.lang) {
    params.set('languageIsoCode', tc.lang);
  }

  const url = `${BASE_URL}/PublicHolidays?${params.toString()}`;
  const label = `${tc.country} ${tc.year}${tc.lang ? ` lang=${tc.lang}` : ' (no lang)'}`;

  try {
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });

    const status = response.status;
    const contentType = response.headers.get('content-type');
    const text = await response.text();

    let count = -1;
    let firstItem = '';
    try {
      const json = JSON.parse(text);
      if (Array.isArray(json)) {
        count = json.length;
        if (json.length > 0) {
          firstItem = `  First: ${json[0].startDate} - ${json[0].name?.[0]?.text || 'unnamed'}`;
        }
      } else {
        firstItem = `  Non-array response: ${text.substring(0, 200)}`;
      }
    } catch {
      firstItem = `  Parse error. Raw: ${text.substring(0, 200)}`;
    }

    const statusIcon = count > 0 ? 'OK' : count === 0 ? 'EMPTY' : 'ERR';
    console.log(`[${statusIcon}] ${label} -> HTTP ${status} | ${count} holidays | type: ${contentType}`);
    if (firstItem) console.log(firstItem);
  } catch (error: any) {
    console.log(`[FAIL] ${label} -> ${error.message}`);
  }
}

async function main() {
  console.log('===========================================');
  console.log('  Holiday API Diagnostic Test');
  console.log(`  Base URL: ${BASE_URL}`);
  console.log(`  Date: ${new Date().toISOString()}`);
  console.log('===========================================\n');

  for (const tc of testCases) {
    await testHolidays(tc);
    console.log('');
  }

  console.log('===========================================');
  console.log('  Test complete.');
  console.log('  If all results show EMPTY for a country,');
  console.log('  that country may not have data for that year.');
  console.log('===========================================');
}

main().catch(console.error);
