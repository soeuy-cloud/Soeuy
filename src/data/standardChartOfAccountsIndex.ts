import { Account, AccountType, CurrencyCode } from '../types';
import { RAW_CHART_OF_ACCOUNTS } from './standardChartOfAccounts';
import { RAW_CHART_OF_ACCOUNTS_PART2 } from './standardChartOfAccountsPart2';
import { RAW_CHART_OF_ACCOUNTS_PART3 } from './standardChartOfAccountsPart3';
import { RAW_CHART_OF_ACCOUNTS_PART4 } from './standardChartOfAccountsPart4';
import { RAW_CHART_OF_ACCOUNTS_PART5 } from './standardChartOfAccountsPart5';
import { RAW_CHART_OF_ACCOUNTS_PART6 } from './standardChartOfAccountsPart6';
import { RAW_CHART_OF_ACCOUNTS_PART7 } from './standardChartOfAccountsPart7';

export const ALL_RAW_ACCOUNTS = [
  ...RAW_CHART_OF_ACCOUNTS,
  ...RAW_CHART_OF_ACCOUNTS_PART2,
  ...RAW_CHART_OF_ACCOUNTS_PART3,
  ...RAW_CHART_OF_ACCOUNTS_PART4,
  ...RAW_CHART_OF_ACCOUNTS_PART5,
  ...RAW_CHART_OF_ACCOUNTS_PART6,
  ...RAW_CHART_OF_ACCOUNTS_PART7
];

function getCategoryForType(type: AccountType): 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense' {
  switch (type) {
    case 'Bank':
    case 'Accounts Receivable':
    case 'Other Current Asset':
    case 'Fixed Asset':
    case 'Accumulated Depreciation':
    case 'Other Asset':
    case 'Non Posting':
      return 'Asset';
    case 'Accounts Payable':
    case 'Other Current Liability':
    case 'Long Term Liability':
    case 'Credit Card':
      return 'Liability';
    case 'Equity':
      return 'Equity';
    case 'Income':
    case 'Other Income':
      return 'Revenue';
    case 'Cost of Goods Sold':
    case 'Expense':
    case 'Other Expense':
    case 'Deferred Expense':
      return 'Expense';
    default:
      return 'Asset';
  }
}

// Map of initial balances for operational continuity and live demonstration
const SEED_BALANCES: Record<string, number> = {
  'AS70100101': 14500000, // Cash KHR (3,500 USD eq.)
  'AS70100102': 18500,    // Cash USD
  'AS70100104': 4200,     // Cash SR USD
  'AS70105101': 148500,   // CPB PP USD
  'AS70105102': 64000,    // ACE CCPB PP USD
  'AS70105104': 32500,    // CPB SR USD
  'AS80101000': 78400,    // Accounts Receivable
  'AS10151000': 250000,   // Buildings
  'AS10241000': 18500,    // Computer Hardware
  'AS10261000': 45000,    // Vehicles
  'LB70401000': 34200,    // Accounts Payable Third
  'LB10101000': 500000,   // Share Capital
  'PL11001000': 215000,   // Sales Third
  'PL12201000': 124000,   // Direct Costs
  'PL21101000': 38500,    // Monthly salaries
  'PL23301000': 12000     // Rent Third
};

export const STANDARD_CHART_OF_ACCOUNTS: Account[] = ALL_RAW_ACCOUNTS.map((raw, idx) => {
  const code = raw.number || `ACC-${idx + 100}`;
  const isTax = raw.name.toLowerCase().includes('vat') || 
                raw.name.toLowerCase().includes('tax') || 
                raw.name.toLowerCase().includes('gst') ||
                raw.name.toLowerCase().includes('ppn');

  return {
    id: `acc-${code.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    number: code,
    name: raw.name,
    type: raw.type,
    category: getCategoryForType(raw.type),
    balance: SEED_BALANCES[code] || 0,
    currency: raw.currency || (code.includes('KHR') ? 'KHR' : code.includes('EUR') ? 'EUR' : 'USD'),
    description: raw.description || `${raw.name} (${raw.type})`,
    isSummary: raw.summary,
    isTaxRelated: isTax
  };
});
