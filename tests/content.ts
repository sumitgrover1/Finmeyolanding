/**
 * What the page is allowed to say, and how its parts have to line up.
 *
 * Three properties, all of which have broken something before:
 *
 *   1. No interest rate is written into the copy. Every rate on the page comes
 *      from the main site's catalogue, and a number typed into a paragraph is
 *      a number nobody updates when the repo rate moves. For a DSA that is a
 *      complaint, not a typo.
 *   2. The form's loan list and the explorer's "apply" buttons agree. They are
 *      derived from one object; if that ever stops being true, the button
 *      silently selects nothing.
 *   3. Every sub-product files under a real product, and the loan against
 *      property — which the main system has no product for — lands somewhere
 *      deliberate rather than wherever a fallback happened to put it.
 */
import { SHIPPED_LOANS, headingRuns, loanOptions, mergeContent, productOfLoan } from '../src/lib/content';

let failures = 0;
function check(what: string, got: unknown, want: unknown) {
  if (JSON.stringify(got) !== JSON.stringify(want)) {
    failures += 1;
    console.error(`FAIL ${what}\n  got  ${JSON.stringify(got)}\n  want ${JSON.stringify(want)}`);
  }
}
function assert(what: string, ok: boolean, detail = '') {
  if (!ok) {
    failures += 1;
    console.error(`FAIL ${what}${detail ? `\n  ${detail}` : ''}`);
  }
}

const content = SHIPPED_LOANS;

// --- 1. no rate is typed into the copy ---

/**
 * Everything a reader sees, flattened.
 *
 * Built by walking the object rather than listing fields, so a section added
 * later is covered without anybody remembering to add it here.
 */
function allText(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) for (const item of value) allText(item, out);
  else if (value && typeof value === 'object') for (const item of Object.values(value)) allText(item, out);
  return out;
}

const texts = allText(content);
// "8.5%", "13% p.a.", "7.35–8.25%". Not "50 percent of market value", which is
// a loan-to-value limit set by the lender's policy, not a price.
const RATE = /\d+(?:\.\d+)?\s*(?:[–-]\s*\d+(?:\.\d+)?\s*)?%\s*(?:p\.?a\.?|per annum)/i;
const priced = texts.filter((text) => RATE.test(text));
assert(
  'no interest rate is written into the copy',
  priced.length === 0,
  priced.map((text) => `  “${text.slice(0, 120)}”`).join('\n'),
);

// A rate without "p.a." next to it is the easier mistake to make, so the
// fact tables are checked more strictly: they are where a rate would go.
const inFacts = content.explorer.products
  .flatMap((product) => product.facts)
  .filter((fact) => /%/.test(fact.value) && !/of value|of market value/i.test(fact.value));
assert(
  'no fact table cell carries a rate',
  inFacts.length === 0,
  inFacts.map((fact) => `  ${fact.label}: ${fact.value}`).join('\n'),
);

// --- 2. the form and the explorer agree ---

const options = loanOptions(content).flatMap((group) => group.options);
for (const product of content.explorer.products) {
  assert(`the form offers "${product.tab}"`, options.includes(product.tab));
  for (const sub of product.subs) {
    assert(`the form offers "${sub.loanLabel}"`, options.includes(sub.loanLabel));
  }
}

const duplicates = options.filter((option, index) => options.indexOf(option) !== index);
// A duplicate label means two different sub-products select the same option
// and the desk cannot tell which one the visitor chose.
check('no loan label appears twice', [...new Set(duplicates)], []);

// --- 3. everything files under a real product ---

for (const option of options) {
  const product = productOfLoan(content, option);
  assert(
    `"${option}" files under a real product`,
    ['home-loan', 'personal-loan', 'business-loan'].includes(product),
    `got ${product}`,
  );
}

check('a business sub-product files as a business loan', productOfLoan(content, 'Working capital loan'), 'business-loan');
check('a personal sub-product files as a personal loan', productOfLoan(content, 'Personal loan balance transfer'), 'personal-loan');
check('a home sub-product files as a home loan', productOfLoan(content, 'Home loan balance transfer'), 'home-loan');
// Deliberate, and documented in productOfLoan: the main system prices three
// products and a LAP is not one of them.
check('a LAP files as a home loan', productOfLoan(content, 'Loan against commercial property'), 'home-loan');
// An unrecognised label must not throw or land nowhere.
check('an unknown label still files somewhere', productOfLoan(content, 'Something else entirely'), 'home-loan');

// --- headings ---

check('a heading with no marker is one plain run', headingRuns('Plain heading'), [
  { text: 'Plain heading', gold: false },
]);
check('a marked heading splits into runs', headingRuns('Get the *best offer* today'), [
  { text: 'Get the ', gold: false },
  { text: 'best offer', gold: true },
  { text: ' today', gold: false },
]);
// A missing closing asterisk should cost a colour, not swallow the sentence.
check('an unclosed marker leaves the tail plain', headingRuns('Get the *best offer today'), [
  { text: 'Get the ', gold: false },
  { text: 'best offer today', gold: false },
]);

// --- the areas the page claims to cover ---

const sectors = content.areas.groups.find((group) => group.sectors)?.sectors;
assert('the sector range is the one the copy promises', sectors?.from === 1 && sectors?.to === 115, JSON.stringify(sectors));
assert(
  'the lede names the same range the grid renders',
  content.areas.lede.includes(`Sector ${sectors?.from}`) && content.areas.lede.includes(`Sector ${sectors?.to}`),
);

// --- 4. what the main site sends can never blank the page ---

check('nothing received is the shipped page', mergeContent(undefined), SHIPPED_LOANS);
check('a non-object is the shipped page', mergeContent('oops'), SHIPPED_LOANS);
check('an array is the shipped page', mergeContent([1, 2]), SHIPPED_LOANS);
check('the shipped page passes through unchanged', mergeContent(JSON.parse(JSON.stringify(SHIPPED_LOANS))), SHIPPED_LOANS);

const received = JSON.parse(JSON.stringify(SHIPPED_LOANS));
received.hero.heading = 'Edited in the console';
received.faq = 'broken';
received.areas = { heading: 'x', groups: [] };
received.explorer = { products: [] };
received.form = null;
const merged = mergeContent(received);
check('an edited section is taken', merged.hero.heading, 'Edited in the console');
check('a broken FAQ falls back', merged.faq, SHIPPED_LOANS.faq);
check('an empty area list falls back', merged.areas, SHIPPED_LOANS.areas);
check('an explorer with no loans falls back', merged.explorer, SHIPPED_LOANS.explorer);
check('a missing form falls back', merged.form, SHIPPED_LOANS.form);
check('the sections that were fine are kept', merged.footer, SHIPPED_LOANS.footer);

if (failures > 0) {
  console.error(`\n${failures} check(s) failed.`);
  process.exit(1);
}
console.log('Content OK: no rate is typed into the page, every loan files under a real product, and the form matches the explorer.');
