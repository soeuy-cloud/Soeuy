export type CurrencyCode = 'USD' | 'KHR' | 'EUR' | 'GBP' | 'SGD' | 'THB' | 'CNY' | 'JPY' | 'VND';

export type AccountType = 
  | 'Bank'
  | 'Accounts Receivable'
  | 'Other Current Asset'
  | 'Fixed Asset'
  | 'Accumulated Depreciation'
  | 'Accounts Payable'
  | 'Credit Card'
  | 'Other Current Liability'
  | 'Long Term Liability'
  | 'Equity'
  | 'Income'
  | 'Cost of Goods Sold'
  | 'Expense'
  | 'Other Income'
  | 'Other Expense'
  | 'Deferred Expense'
  | 'Other Asset'
  | 'Non Posting';

export interface Account {
  id: string;
  number: string;
  name: string;
  thaiName?: string;
  type: AccountType;
  category: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  balance: number;
  currency: CurrencyCode;
  description?: string;
  isSummary?: boolean;
  parentId?: string;
  isTaxRelated?: boolean;
}

export type TransactionType = 
  | 'Invoice'
  | 'Bill'
  | 'Payment_Received'
  | 'Bill_Payment'
  | 'Journal_Entry'
  | 'Credit_Memo'
  | 'Debit_Memo';

export type TransactionStatus = 
  | 'Draft'
  | 'Pending_Approval'
  | 'Approved'
  | 'Partially_Paid'
  | 'Paid'
  | 'Overdue'
  | 'Void';

export interface TransactionLineItem {
  id: string;
  accountId: string;
  accountNumber?: string;
  accountName?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxCodeId?: string;
  taxRate?: number;
  taxAmount?: number;
  department?: string;
  location?: string;
}

export interface JournalLine {
  id: string;
  accountId: string;
  accountNumber: string;
  accountName: string;
  debit: number;
  credit: number;
  memo: string;
  department?: string;
  location?: string;
}

export interface LinkedDocument {
  id: string;
  type: 'Invoice' | 'Bill' | 'Purchase_Order' | 'Sales_Order' | 'Payment' | 'Credit_Memo' | 'Quotation' | 'Tax_Invoice';
  number: string;
  date: string;
  amount: number;
  currency?: CurrencyCode;
  description?: string;
  status?: string;
}

export interface Transaction {
  id: string;
  transactionNumber: string;
  type: TransactionType;
  date: string;
  dueDate?: string;
  postingPeriod: string;
  entityId: string;
  entityName: string;
  entityType: 'Customer' | 'Vendor' | 'Employee' | 'Other';
  status: TransactionStatus;
  currency: CurrencyCode;
  exchangeRate: number;
  subtotal: number;
  taxTotal: number;
  whtTotal?: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  memo?: string;
  items: TransactionLineItem[];
  journalLines?: JournalLine[];
  taxInvoiceNumber?: string;
  taxInvoiceDate?: string;
  whtCertNumber?: string;
  whtRate?: number;
  originalInvoiceId?: string;
  originalInvoiceNumber?: string;
  originalInvoiceDate?: string;
  originalInvoiceAmount?: number;
  originalInvoiceCurrency?: CurrencyCode;
  originalInvoiceMemo?: string;
  linkedDocuments?: LinkedDocument[];
  department: string;
  subsidiary: string; // e.g. Small Business HQ, Small Business Regional
  createdAt: string;
}

export type TaxCategory = 
  | 'VAT' 
  | 'Income_Tax' 
  | 'Withholding_Tax' 
  | 'Accommodation_Tax' 
  | 'Annual_Tax' 
  | 'Salary_Tax' 
  | 'Other';

export type TaxType = 
  | 'VAT_Output' 
  | 'VAT_Input' 
  | 'Income_Tax' 
  | 'Income_Prepayment' 
  | 'Minimum_Tax' 
  | 'Withholding_Tax' 
  | 'WHT_PND3' 
  | 'WHT_PND53' 
  | 'Accommodation_Tax' 
  | 'Public_Lighting_Tax' 
  | 'Annual_Tax' 
  | 'Patent_Tax' 
  | 'Salary_Tax' 
  | 'Fringe_Benefit_Tax' 
  | 'Exempt' 
  | 'Zero_Rated' 
  | 'Sales_Tax' 
  | 'Service_Tax';

export interface TaxCode {
  id: string;
  code: string;
  name: string;
  thaiName?: string;
  rate: number;
  type: TaxType;
  category?: TaxCategory;
  description: string;
  country?: string;
  isActive?: boolean;
}

export interface CountryTaxJurisdiction {
  id: string;
  countryName: string;
  countryCode: string;
  flag: string;
  taxAuthority: string;
  taxSystemName: string;
  standardVatRate: number; // e.g. 0.10 for 10%
  defaultWhtServiceRate: number; // e.g. 0.14 for 14%
  defaultWhtRentRate?: number;
  taxIdFormat: string;
  currency: CurrencyCode;
  notes: string;
}

export interface ThaiWHTEntry {
  id: string;
  certNumber: string;
  date: string;
  formType: 'PND3' | 'PND53'; // PND3 for individuals, PND53 for juristic persons
  payerName: string;
  payerTaxId: string;
  payerAddress: string;
  payeeName: string;
  payeeTaxId: string;
  payeeAddress: string;
  incomeType: 'Advertising' | 'Services' | 'Rent' | 'Transportation' | 'Professional' | 'Royalty';
  incomeDescription: string;
  baseAmount: number;
  whtRate: number;
  whtAmount: number;
  taxInvoiceRef?: string;
  paymentRef?: string;
  status: 'Draft' | 'Submitted' | 'Paid';
}

export interface FixedAsset {
  id: string;
  assetCode: string;
  name: string;
  category: 'Vehicles' | 'IT Equipment' | 'Office Furniture' | 'Buildings' | 'Machinery' | 'Software';
  purchaseDate: string;
  cost: number;
  salvageValue: number;
  usefulLifeYears: number;
  depreciationMethod: 'Straight-Line' | 'Declining Balance';
  accumulatedDepreciation: number;
  netBookValue: number;
  status: 'Active' | 'Under Maintenance' | 'Disposed' | 'Fully Depreciated';
  location: string;
  department: string;
  serialNumber?: string;
}

export interface Customer {
  id: string;
  code: string;
  companyName: string;
  thaiCompanyName?: string;
  contactPerson: string;
  email: string;
  phone: string;
  taxId: string;
  branchNumber: string; // '00000' for Head Office
  address: string;
  country: string;
  currency: CurrencyCode;
  creditLimit: number;
  paymentTerms: string;
  balance: number;
  type: 'B2B Travel Agent' | 'Corporate' | 'FIT Tourist' | 'MICE';
}

export interface Vendor {
  id: string;
  code: string;
  companyName: string;
  thaiCompanyName?: string;
  contactPerson: string;
  email: string;
  phone: string;
  taxId: string;
  branchNumber: string;
  address: string;
  country: string;
  currency: CurrencyCode;
  paymentTerms: string;
  balance: number;
  category: 'Hotel Supplier' | 'Transport' | 'Airline' | 'Tour Guide' | 'IT & Office' | 'Legal & Audit';
}

export interface ActivityTask {
  id: string;
  title: string;
  assignedTo: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed';
  category: 'Tax Filing' | 'Audit' | 'Invoice Approval' | 'Bank Reconciliation' | 'Asset Check';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  recordType: string;
  recordId: string;
  details: string;
}

export interface OperatingEntity {
  id: string;
  name: string;
  code: string;
  type: 'Headquarters' | 'Branch Office' | 'Digital Services' | 'Subsidiary' | 'Regional Unit';
  description: string;
  currency: CurrencyCode;
  taxId?: string;
  status: 'Primary' | 'Connected' | 'Inactive';
}

export interface CompanyProfile {
  name: string;
  shortName: string;
  systemEdition?: string;
  systemSubtitle?: string;
  logoInitial?: string;
  taxId: string;
  branchNumber: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  fiscalYearEnd: string;
  baseCurrency: CurrencyCode;
  industry: string;
  registrationNumber: string;
}

export type UserRole = 
  | 'System Administrator'
  | 'Chief Accountant' 
  | 'Financial Director (CFO)' 
  | 'AR Specialist' 
  | 'AP & Tax Specialist' 
  | 'Senior Auditor'
  | 'Bookkeeper / Staff Accountant';

export type PermissionKey =
  | 'admin_manage_users'
  | 'gl_journal_posting'
  | 'ar_invoicing'
  | 'ap_bills'
  | 'tax_compliance'
  | 'financial_reports'
  | 'fixed_assets'
  | 'setup_entities'
  | 'audit_trail';

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  password?: string;
  initials: string;
  email: string;
  role: UserRole;
  isAdmin: boolean;
  department: string;
  avatarColor: string;
  status: 'Online' | 'Away' | 'Busy';
  permissions: string[];
  accessKeys: PermissionKey[];
}

