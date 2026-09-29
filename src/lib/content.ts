import type { LoanKey } from './rates';

/**
 * The words on the Gurgaon loans landing page.
 *
 * Separated from the components that draw them for the ordinary reason — the
 * copy on a page traffic is bought for gets rewritten far more often than its
 * layout — and for one specific one: it is the shape a console editor will
 * read and write. Nothing here knows about React, so the editor, a test and
 * the page can all hold the same object.
 *
 * Rates are deliberately absent. Every number a lender sets is read from the
 * catalogue at render — read from the main site's /api/rates. What is written down here is only
 * what a person decides: claims, explanations and the order they come in.
 *
 * `*asterisks*` in a heading mark the words the design sets in gold. One
 * marker rather than HTML, because copy that can carry markup is copy that can
 * carry a broken tag.
 */

export interface Fact {
  label: string;
  value: string;
}

export interface SubProduct {
  /** The chip. */
  tab: string;
  heading: string;
  body: string;
  /**
   * What the visitor is applying for, verbatim, when they use this panel's
   * button. Recorded on the lead as typed here: the desk needs to know that
   * somebody asked for a machinery loan, not merely "business loan".
   */
  loanLabel: string;
}

export interface ExplorerProduct {
  key: LoanKey;
  /** The rail. */
  tab: string;
  heading: string;
  intro: string;
  facts: Fact[];
  subs: SubProduct[];
  documents: string[];
}

export interface AreaGroup {
  key: string;
  tab: string;
  /** Plain names. A sector grid is generated, not listed — see `sectors`. */
  areas?: { name: string; alias?: string }[];
  /** Inclusive range of Gurgaon sector numbers, for the group that is a grid. */
  sectors?: { from: number; to: number; note: string };
}

export interface AmountBand {
  label: string;
  /**
   * The rupee figure filed on the lead for this band — its top, not its
   * middle. A desk sizes a file by the most somebody might need, and a lead
   * under-recorded at the bottom of its band gets routed to lenders who cannot
   * write it. The band the visitor actually picked is stored beside it.
   */
  amount: number;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface LoansContent {
  meta: {
    title: string;
    description: string;
    keywords: string[];
    /** Where this page canonically lives, relative to the site root. */
    path: string;
    ogTitle: string;
    ogDescription: string;
    /** Indian state code and place, which local search reads. */
    geoRegion: string;
    geoPlace: string;
  };
  nav: { label: string; href: string }[];
  hero: {
    crumb: string;
    heading: string;
    lede: string;
    ticks: string[];
    pills: { label: string; href: string }[];
  };
  form: {
    step1Title: string;
    step1Sub: string;
    step2Title: string;
    step2Sub: string;
    amounts: AmountBand[];
    employments: string[];
    cities: string[];
    consent: string;
    foot1: string;
    foot2: string;
    doneTitle: string;
    doneBody: string;
  };
  finder: { heading: string; lede: string; fine: string; cta: string };
  explorer: { heading: string; products: ExplorerProduct[]; fine: string };
  how: {
    heading: string;
    steps: { heading: string; body: string }[];
    bankLabel: string;
    usLabel: string;
    bank: string[];
    us: string[];
  };
  about: { heading: string; lede: string; cards: { heading: string; body: string }[] };
  calculators: { heading: string; lede: string };
  lenders: { heading: string; lede: string };
  areas: { heading: string; lede: string; searchPlaceholder: string; groups: AreaGroup[] };
  faq: { heading: string; items: FaqItem[] };
  end: { heading: string; lede: string; primary: string };
  footer: { intro: string; disclaimer: string };
}

/**
 * The page as shipped.
 *
 * This is the floor, not the content: once a row exists it wins, exactly as
 * with the site's other settings. A page that used to be here must not go
 * blank because a seed did not run.
 */
export const SHIPPED_LOANS: LoansContent = {
  meta: {
    title: 'Loans in Gurgaon | Business, Home, LAP & Personal Loan',
    description:
      'Get the best loan offer in Gurgaon for your CIBIL score. Business, home, loan against property and personal loans, compared across every partner bank and NBFC. All sectors, Manesar, Sohna. Zero fee.',
    keywords: [
      'business loan in Gurgaon',
      'MSME business loan in Gurgaon',
      'unsecured business loan in Gurgaon',
      'working capital loan in Gurgaon',
      'home loan in Gurgaon',
      'home loan balance transfer in Gurgaon',
      'loan against property in Gurgaon',
      'loan against property in Delhi NCR',
      'personal loan in Gurgaon',
      'personal loan in Delhi NCR',
    ],
    path: '/loans',
    ogTitle: "Loans in Gurgaon — every bank's offer, matched to your CIBIL",
    ogDescription:
      'Business, home, property and personal loans. One application, every partner lender compared, zero fee to you.',
    geoRegion: 'IN-HR',
    geoPlace: 'Gurugram',
  },

  nav: [
    { label: 'Business loan', href: '#business-loan' },
    { label: 'Home loan', href: '#home-loan' },
    { label: 'Loan against property', href: '#loan-against-property' },
    { label: 'Personal loan', href: '#personal-loan' },
    { label: 'Calculators', href: '#calculators' },
  ],

  hero: {
    crumb: 'Loans in Gurgaon',
    heading: 'Get the *best loan offer* in Gurgaon for your CIBIL score',
    lede: 'Finmeyo is a loan DSA and loan consultant in Gurgaon. Apply once and compare business loan, home loan, loan against property and personal loan offers from every partner bank and NBFC, with one adviser guiding you until the money reaches your account.',
    ticks: ['Free eligibility check', 'No effect on CIBIL score', 'Same-day callback', '₹0 fee to you, ever'],
    pills: [
      { label: 'Business loan', href: '#business-loan' },
      { label: 'Home loan', href: '#home-loan' },
      { label: 'Loan against property', href: '#loan-against-property' },
      { label: 'Personal loan', href: '#personal-loan' },
    ],
  },

  form: {
    step1Title: 'Check your loan eligibility, free',
    step1Sub: 'Step 1 of 2: about your loan',
    step2Title: 'Where should we send your offers?',
    step2Sub: 'Step 2 of 2: your contact details',
    amounts: [
      { label: 'Up to ₹5 lakh', amount: 500_000 },
      { label: '₹5–10 lakh', amount: 1_000_000 },
      { label: '₹10–25 lakh', amount: 2_500_000 },
      { label: '₹25–50 lakh', amount: 5_000_000 },
      { label: '₹50 lakh–1 crore', amount: 10_000_000 },
      { label: 'Above ₹1 crore', amount: 10_000_000 },
    ],
    employments: ['Salaried', 'Self-employed / business', 'Professional (doctor, CA, etc.)'],
    cities: ['Gurgaon', 'Delhi', 'Noida', 'Faridabad', 'Ghaziabad', 'Other'],
    consent:
      'I agree to be contacted by Finmeyo about this enquiry and for my details to be shared with lenders to check what I qualify for.',
    foot1: 'No fee, ever. Checking does not affect your CIBIL score.',
    foot2: 'Your details go only to lenders you agree to.',
    doneTitle: 'Request received',
    doneBody: 'An adviser will call you today to go over which lenders fit your file.',
  },

  finder: {
    heading: 'Loan interest rates in Gurgaon by *CIBIL score*',
    lede: 'Every lender prices a loan in Gurgaon on your credit score. Pick a loan, move the slider, and see the rate range our partner lenders offer at that score. A lower score is not always a no: with a 650 CIBIL score, some NBFCs and most loan against property lenders may still consider you.',
    fine: 'Read from our partner lenders’ current rules, not typed into this page — so it changes when their pricing does. Your final rate on any loan in Gurgaon depends on income, amount, property and the lender’s own appraisal.',
    cta: 'Get my actual offers',
  },

  explorer: {
    heading: 'Business loan, home loan, LAP and personal loan in Gurgaon',
    fine: '*Starting rates are what our partner lenders quote a strong profile today. Final rate, amount and terms are set by the lender.',
    products: [
      {
        key: 'business',
        tab: 'Business loan',
        heading: 'Business loan in Gurgaon for MSMEs and the self-employed',
        intro:
          'As a business loan consultant in Gurgaon, we work with traders in Sadar Bazar, manufacturers in Udyog Vihar and IMT Manesar, shop owners and professionals. Lenders differ on vintage, turnover and GST, so we shortlist the ones likely to approve your business loan in Gurgaon before you apply.',
        facts: [
          { label: 'Amount', value: '₹3 L–₹5 Cr' },
          { label: 'Tenure', value: '1–5 years' },
          { label: 'Security', value: 'Not required*' },
        ],
        subs: [
          {
            tab: 'MSME',
            heading: 'MSME business loan in Gurgaon',
            body: 'For Udyam-registered micro, small and medium enterprises, including units in IMT Manesar. Some lenders offer lower rates and collateral-free limits under CGTMSE to MSMEs with steady GST filings, and machinery loans secured on the equipment itself.',
            loanLabel: 'MSME business loan',
          },
          {
            tab: 'Unsecured',
            heading: 'Unsecured business loan in Gurgaon',
            body: 'No property or guarantor needed. Most lenders want 2 to 3 years of vintage, ITRs and 12 months of banking. For smaller amounts, some NBFCs will consider a business loan on GST returns and bank statements, which helps if you need a business loan without ITR.',
            loanLabel: 'Unsecured business loan',
          },
          {
            tab: 'Working capital',
            heading: 'Working capital loan in Gurgaon',
            body: 'Cash credit, overdraft or a short-term loan for stock, receivables and salaries. With an OD or CC limit, you pay interest only on what you use.',
            loanLabel: 'Working capital loan',
          },
          {
            tab: 'Self-employed',
            heading: 'Business loan for self-employed in Gurgaon',
            body: 'Doctors, CAs, architects, consultants and proprietors. A doctor loan or professional loan is often priced lower because lenders see steady income. Several lenders also read income from GST returns and bank credits when ITR income looks lower than what the business really earns.',
            loanLabel: 'Business loan for self-employed',
          },
        ],
        documents: [
          'PAN and Aadhaar of owners',
          'Business PAN, GST, Udyam',
          '2 to 3 years ITR with financials',
          '12 months current account statement',
        ],
      },
      {
        key: 'home',
        tab: 'Home loan',
        heading: 'Home loan in Gurgaon, from your first flat to building your own house',
        intro:
          'As a home loan agent in Gurgaon, we arrange loans for flats on Dwarka Expressway and in New Gurgaon, builder floors in DLF, and new projects in Sohna. Some banks approve certain projects faster, so we match your project and profile to the lender most likely to sanction your home loan in Gurgaon at the lowest rate.',
        facts: [
          { label: 'Amount', value: 'Up to 90% of value' },
          { label: 'Tenure', value: 'Up to 30 years' },
          { label: 'Tax benefit', value: '80C & 24(b)' },
        ],
        subs: [
          {
            tab: 'First home',
            heading: 'First-time home buyer loan in Gurgaon',
            body: "We check your PMAY eligibility, the lender's loan-to-value limit for your price band, and whether the project is already approved by the bank. Buying a builder floor? A builder floor home loan needs clear title and an approved plan, and we check both before you pay the booking amount.",
            loanLabel: 'First-time home buyer loan',
          },
          {
            tab: 'Self-employed',
            heading: 'Home loan for self-employed in Gurgaon',
            body: 'Banks usually want 3 years of ITRs and business proof. Where declared income is lower, some housing finance companies assess it from banking and GST instead.',
            loanLabel: 'Home loan for self-employed',
          },
          {
            tab: 'Balance transfer',
            heading: 'Home loan balance transfer in Gurgaon',
            body: 'Paying 9% or more on an old home loan? Moving it to a lower rate can cut lakhs in interest, and many lenders add a top-up home loan at the same time. Try the balance transfer calculator below to see your saving.',
            loanLabel: 'Home loan balance transfer',
          },
          {
            tab: 'Construction',
            heading: 'Home construction loan in Gurgaon',
            body: 'Buying land first? A plot loan covers the plot, and a home construction loan funds the building in stages as work progresses. You pay interest only on the amount disbursed so far.',
            loanLabel: 'Home construction loan',
          },
        ],
        documents: [
          'PAN, Aadhaar, photos',
          'Salary slips and Form 16, or ITRs',
          '6 to 12 months bank statement',
          'Builder agreement or property papers',
        ],
      },
      {
        key: 'lap',
        tab: 'Loan against property',
        heading: 'Loan against property in Gurgaon and Delhi NCR',
        intro:
          'The lowest-cost way to raise a large amount if you own a house, flat, shop, office or plot in Gurgaon, Manesar or Pataudi. As a loan against property consultant, we compare rates close to home loan pricing, tenures up to 15 years, and lenders who worry less about a lower CIBIL score when property backs the loan.',
        facts: [
          { label: 'Amount', value: 'Up to 70% of value' },
          { label: 'Tenure', value: 'Up to 15 years' },
          { label: 'Property', value: 'Residential or commercial' },
        ],
        subs: [
          {
            tab: 'Residential',
            heading: 'Loan against residential property in Gurgaon',
            body: 'Against a self-occupied or rented house, flat or builder floor, with the highest loan-to-value and the lowest rates. A loan against property without income proof is rarely possible, but a few NBFCs accept banking and rental income in place of ITRs.',
            loanLabel: 'Loan against residential property',
          },
          {
            tab: 'Commercial',
            heading: 'Loan against commercial property in Gurgaon',
            body: 'Against a shop, office, showroom or warehouse. Loan-to-value is slightly lower, but rental income can be counted to raise your eligibility.',
            loanLabel: 'Loan against commercial property',
          },
          {
            tab: 'For business',
            heading: 'Loan against property for business in Gurgaon',
            body: 'For expansion, machinery, a loan for shop purchase or replacing costly unsecured debt. A LAP often costs about half the rate of an unsecured business loan. Some lenders offer an overdraft against property, so you pay interest only on what you draw.',
            loanLabel: 'Loan against property for business',
          },
          {
            tab: 'Delhi NCR',
            heading: 'Loan against property in Delhi NCR',
            body: 'We arrange loans against property across Gurgaon, Manesar, Delhi, Noida, Greater Noida, Faridabad and Ghaziabad, including freehold, leasehold and DDA or HUDA-allotted properties.',
            // Not plain "Loan against property": that is the product's own
            // label, and two options with one name give the desk no way to
            // tell which panel the visitor applied from.
            loanLabel: 'Loan against property in Delhi NCR',
          },
        ],
        documents: [
          'PAN, Aadhaar',
          'ITR or salary slips',
          'Complete property chain documents',
          'Approved plan, property tax receipt',
        ],
      },
      {
        key: 'personal',
        tab: 'Personal loan',
        heading: 'Personal loan in Gurgaon and Delhi NCR',
        intro:
          'For a wedding, a medical bill, travel or clearing card dues. The rate on a personal loan in Gurgaon depends on your CIBIL score and employer more than on any other loan, so comparing lenders saves you the most here.',
        facts: [
          { label: 'Amount', value: '₹50,000–₹50 L' },
          { label: 'Tenure', value: '1–6 years' },
          { label: 'Security', value: 'None' },
        ],
        subs: [
          {
            tab: 'Salaried',
            heading: 'Personal loan for salaried employees in Gurgaon',
            body: 'Work at an MNC or listed company in Cyber City, Udyog Vihar or on Golf Course Road? Several banks offer lower rates and pre-approved limits based on your employer category.',
            loanLabel: 'Personal loan for salaried',
          },
          {
            tab: 'Self-employed',
            heading: 'Personal loan for self-employed in Gurgaon',
            body: 'Most lenders need 2 years of ITR and stable banking. Looking for a personal loan without salary slip? Some NBFCs assess your income from bank statements instead, and they are usually more flexible than banks.',
            loanLabel: 'Personal loan for self-employed',
          },
          {
            tab: 'Balance transfer',
            heading: 'Personal loan balance transfer in Gurgaon',
            body: 'If your score has improved since you took the loan, a transfer can bring your rate down by several points, with a top-up if you need it.',
            loanLabel: 'Personal loan balance transfer',
          },
          {
            tab: 'Delhi NCR',
            heading: 'Personal loan in Delhi NCR',
            body: 'The same comparison for applicants in Delhi, Noida, Faridabad and Ghaziabad. Digital documentation means you rarely need to visit a branch.',
            loanLabel: 'Personal loan in Delhi NCR',
          },
        ],
        documents: [
          'PAN, Aadhaar',
          '3 months salary slips or 2 years ITR',
          '6 months bank statement',
          'Office ID or business proof',
        ],
      },
    ],
  },

  how: {
    heading: 'How to get a loan in Gurgaon in 3 simple steps',
    steps: [
      {
        heading: 'Tell us once',
        body: 'The loan you want, roughly how much, and your number. Under a minute.',
      },
      {
        heading: 'We match you to lenders',
        body: 'We check your CIBIL, income and profile against every partner bank and NBFC and show who fits.',
      },
      {
        heading: 'One adviser gets it sanctioned',
        body: 'You pick the offer. The same person files it and follows up until disbursal.',
      },
    ],
    bankLabel: 'Going to a bank yourself',
    usLabel: 'Applying through Finmeyo',
    bank: [
      "You get one bank's rate, and only theirs.",
      'Each application leaves a hard enquiry on your CIBIL report.',
      'Declined? You start again at another branch next month.',
      'You chase the branch for updates.',
      'No one tells you if a cheaper product fits better.',
      'You visit the branch again and again.',
    ],
    us: [
      'You see offers from every lender your profile fits.',
      'We check eligibility first and file only with the lender you choose.',
      'Declined by one? Your file goes to the next without rebuilding.',
      'One adviser tracks your file and calls you.',
      'We tell you when a LAP or transfer costs less than what you asked for.',
      'You compare EMIs and the total cost before you commit.',
    ],
  },

  about: {
    heading: 'Why trust Finmeyo as your loan consultant in Gurgaon',
    lede: "Finmeyo Financial Services is a loan DSA (direct selling agent) based in Gurugram. We are not a bank and we don't lend money. We compare banks and NBFCs to find the loan in Gurgaon that fits you, prepare your file, and follow it up until disbursal.",
    cards: [
      {
        heading: 'We know which lender says yes, and why',
        body: 'Every bank and NBFC has its own rules for a business loan in Gurgaon: minimum vintage, turnover, CIBIL score and industries it avoids. As your loan consultant in Gurgaon, we check your profile against these rules first, so you are not declined for something we could have spotted in advance.',
      },
      {
        heading: 'Your file is built once',
        body: "We prepare one complete file for your home loan, personal loan or loan against property. If one lender declines, the same documents go to the next lender, and you don't have to start again or run to another branch.",
      },
      {
        heading: 'The right loan, not just any loan',
        body: 'A term loan, an overdraft, a machinery loan and a loan against property in Gurgaon are different products with different costs. Choosing the right one usually saves you more than chasing a slightly lower interest rate.',
      },
      {
        heading: 'One adviser, not a call centre',
        body: 'The loan agent who takes your call files your application, speaks to the lender, and tells you exactly what they said. From the eligibility check to disbursal, you deal with the same person.',
      },
    ],
  },

  calculators: {
    heading: 'Loan EMI, eligibility and balance transfer calculators',
    lede: 'Work out the EMI on any loan in Gurgaon, how much you can borrow, or what a balance transfer would save you.',
  },

  lenders: {
    heading: 'The banks and NBFCs we compare for you',
    lede: 'Every lender has different rules on CIBIL score, income and property. We know them all, so your application for a loan in Gurgaon goes only to the lenders most likely to approve it. Your details are shared only with the lenders you agree to.',
  },

  areas: {
    heading: 'Loans in every sector of Gurgaon, Manesar, Sohna and Delhi NCR',
    lede: 'We arrange loans in Gurgaon from Sector 1 to Sector 115, Old Gurgaon to New Gurgaon, and out to Manesar, Pataudi (Patodi), Farrukhnagar, MET City and Sohna. That includes business loans in Manesar, home loans in Sohna and loans against property in Pataudi.',
    searchPlaceholder: 'Type your area or sector, e.g. 57',
    groups: [
      {
        key: 'city',
        tab: 'Gurgaon city',
        areas: [
          { name: 'DLF Phase 1–5' }, { name: 'Cyber City' }, { name: 'MG Road' },
          { name: 'Golf Course Road' }, { name: 'Golf Course Extension Road' }, { name: 'Sohna Road' },
          { name: 'Southern Peripheral Road' }, { name: 'Dwarka Expressway' }, { name: 'New Gurgaon' },
          { name: 'Old Gurgaon' }, { name: 'Udyog Vihar' }, { name: 'Sushant Lok' },
          { name: 'South City' }, { name: 'Palam Vihar' }, { name: 'Nirvana Country' },
          { name: 'Ardee City' }, { name: 'Malibu Towne' }, { name: 'Mayfield Garden' },
          { name: 'Sadar Bazar' }, { name: 'Rajiv Nagar' }, { name: 'Jacobpura' },
          { name: 'Shivaji Nagar' }, { name: 'Sikanderpur' }, { name: 'Chakkarpur' },
          { name: 'Nathupur' }, { name: 'Kanhai' }, { name: 'Wazirabad' }, { name: 'Jharsa' },
        ],
      },
      {
        key: 'sectors',
        tab: 'Sectors 1–115',
        sectors: {
          from: 1,
          to: 115,
          note: 'We cover every Gurgaon sector from Sector 1 to Sector 115, including Sectors 14, 15, 29, 31, 43, 45, 46, 49, 50, 56, 57, 65, 67, 70, 82, 83, 84, 85, 86, 89, 90, 92, 95, 102, 104, 106, 109 and 113.',
        },
      },
      {
        key: 'outer',
        tab: 'Manesar, Sohna & outer Gurgaon',
        areas: [
          { name: 'Manesar' }, { name: 'IMT Manesar' }, { name: 'Pataudi', alias: 'patodi' },
          { name: 'Farrukhnagar', alias: 'farukhnagar farukh nagar' },
          { name: 'MET City', alias: 'metcity reliance met city' },
          { name: 'Sohna' }, { name: 'Badshahpur' }, { name: 'Bhondsi' }, { name: 'Bilaspur' },
          { name: 'Kherki Daula' }, { name: 'Garhi Harsaru' }, { name: 'Daulatabad' },
          { name: 'Dhankot' }, { name: 'Kadipur' }, { name: 'Haily Mandi' }, { name: 'Bhora Kalan' },
          { name: 'Sidhrawali' }, { name: 'Panchgaon' }, { name: 'Tikli' }, { name: 'Gwal Pahari' },
        ],
      },
      {
        key: 'ncr',
        tab: 'Delhi NCR',
        areas: [
          { name: 'Delhi' }, { name: 'Dwarka' }, { name: 'Noida' },
          { name: 'Greater Noida' }, { name: 'Faridabad' }, { name: 'Ghaziabad' },
        ],
      },
    ],
  },

  faq: {
    heading: 'Loan FAQs for Gurgaon borrowers',
    items: [
      {
        q: 'Which is the best bank for a business loan in Gurgaon?',
        a: 'There is no single best bank. Each lender sets its own rules on business vintage, turnover, GST and CIBIL score. We check your details against every partner bank and NBFC and show you which ones your file fits.',
      },
      {
        q: 'What CIBIL score do I need for a loan in Gurgaon?',
        a: 'Most banks prefer 750 or more for their best rates. Many lenders consider 700 to 749, and some NBFCs look at 650 to 699 at a higher rate. Below 650, a loan against property is often the more realistic option.',
      },
      {
        q: 'Can I get a home loan in Gurgaon if I am self-employed?',
        a: 'Yes. Most lenders ask for two to three years of ITRs, business proof and 12 months of bank statements. Some assess income from GST returns and banking.',
      },
      {
        q: 'Can I get a loan against commercial property in Delhi NCR?',
        a: 'Yes. Lenders give loans against residential, commercial and industrial property across Gurgaon, Delhi, Noida and Faridabad, typically up to 50 to 70 percent of market value.',
      },
      {
        q: 'Can I get a personal loan with a low CIBIL score in Gurgaon?',
        a: 'Sometimes. With a score of 650 to 699, a few NBFCs may approve a smaller amount at a higher rate. Below 650, an unsecured personal loan is rarely approved, and a loan against property or adding a co-applicant with a better score usually works better. We will tell you honestly which route fits.',
      },
      {
        q: 'Can I get a business loan without ITR in Gurgaon?',
        a: 'For smaller amounts, some NBFCs lend on GST returns and 12 months of bank statements instead of ITRs. For larger amounts, most lenders ask for at least one to two years of ITR.',
      },
      {
        q: 'Does checking my eligibility affect my CIBIL score?',
        a: 'No. We match your details against lender criteria before any application is filed. A hard enquiry happens only when you apply with the lender you choose.',
      },
      {
        q: 'Do you charge any fee?',
        a: 'No. We never charge customers any advance, processing or file-opening fee. We are paid by the lender. Any processing fee is charged by the bank and shown in your sanction letter.',
      },
      {
        q: 'Can I transfer my existing home loan or personal loan to a lower rate?',
        a: 'Yes. With a clean repayment record, many lenders will take over your loan at a lower rate, often with a top-up. We compare the saving against transfer costs first.',
      },
      {
        q: 'Are you a bank?',
        a: 'No. Finmeyo is a loan DSA (direct selling agent). We are not a bank or NBFC and do not lend money. The lender decides approval, rate and terms after its own credit appraisal.',
      },
      {
        q: 'Do you arrange loans in Manesar, Sohna and Pataudi?',
        a: 'Yes. We cover every sector of Gurgaon plus Manesar, IMT Manesar, Sohna, Pataudi, Farrukhnagar and MET City, as well as Delhi, Noida and Faridabad.',
      },
      {
        q: 'Why use a loan agent in Gurgaon instead of going to a bank directly?',
        a: 'A bank can only offer its own products. A loan agent compares several lenders, knows which ones accept your profile, and saves you from repeated rejections that can lower your CIBIL score. The lender pays the agent, so it costs you nothing.',
      },
    ],
  },

  end: {
    heading: 'Get your best loan offer in Gurgaon today',
    lede: 'Business, home, property or personal. Tell us once and a Finmeyo adviser will compare every lender for your loan in Gurgaon.',
    primary: 'Check my eligibility',
  },

  footer: {
    intro:
      'Loan DSA for business loans, home loans, loans against property and personal loans in Gurgaon and Delhi NCR.',
    disclaimer:
      'We are not a bank or an NBFC and we do not lend money. Loan approval, the final interest rate, the sanctioned amount and all terms are decided solely by the lender after its own credit appraisal. Rates and eligibility shown are indicative. We never charge customers any advance, processing or file-opening fee.',
  },
};

/**
 * Splits a heading on its gold markers.
 *
 * Returns alternating plain and emphasised runs, starting plain — so a heading
 * with no markers is one run and renders as itself. An unclosed marker leaves
 * the tail plain rather than swallowing the rest of the line, because a missing
 * asterisk should cost a colour, not a sentence.
 */
export function headingRuns(heading: string): { text: string; gold: boolean }[] {
  const parts = heading.split('*');
  const runs: { text: string; gold: boolean }[] = [];
  const closed = parts.length % 2 === 1;

  parts.forEach((text, index) => {
    if (!text) return;
    const gold = index % 2 === 1 && (closed || index < parts.length - 1);
    runs.push({ text, gold });
  });

  return runs;
}

/**
 * The loan the form offers, grouped the way the page explains them.
 *
 * Derived from the explorer rather than written twice. The explorer's "apply"
 * buttons set this field, so a label that exists in one place and not the
 * other would be a button that silently selects nothing — and the two lists
 * drifting apart is exactly what happens when copy is edited months later.
 */
export function loanOptions(content: LoansContent): { group: string; options: string[] }[] {
  return content.explorer.products.map((product) => ({
    group: product.tab,
    options: [product.tab, ...product.subs.map((sub) => sub.loanLabel)],
  }));
}

/**
 * Which of the three catalogue products a chosen loan is filed under.
 *
 * A loan against property is the awkward one: we arrange it, the page explains
 * it, and it is not a `ProductId` — the catalogue prices three products. It is
 * filed as a home loan, which is the nearest thing the system has (both are
 * mortgages, assessed on a property and handled by the same desk), and the
 * label the visitor actually chose rides along on the lead so nobody has to
 * guess what they meant. Giving it a product of its own is a change to the
 * enum, the rules, the journeys and the commission table, not to this page.
 */
export function productOfLoan(content: LoansContent, loanLabel: string): 'home-loan' | 'personal-loan' | 'business-loan' {
  const product = content.explorer.products.find(
    (entry) => entry.tab === loanLabel || entry.subs.some((sub) => sub.loanLabel === loanLabel),
  );
  switch (product?.key) {
    case 'business':
      return 'business-loan';
    case 'personal':
      return 'personal-loan';
    // 'home', 'lap', and anything unrecognised.
    default:
      return 'home-loan';
  }
}
