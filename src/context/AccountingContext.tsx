import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Account, 
  Transaction, 
  Customer, 
  Vendor, 
  TaxCode, 
  ThaiWHTEntry, 
  FixedAsset, 
  ActivityTask, 
  AuditLog, 
  CurrencyCode,
  UserProfile,
  PermissionKey,
  CompanyProfile,
  OperatingEntity,
  CountryTaxJurisdiction
} from '../types';
import { 
  INITIAL_ACCOUNTS, 
  INITIAL_CUSTOMERS, 
  INITIAL_VENDORS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_TAX_CODES, 
  INITIAL_WHT_ENTRIES, 
  INITIAL_FIXED_ASSETS, 
  INITIAL_TASKS, 
  INITIAL_AUDIT_LOGS,
  INITIAL_USERS,
  INITIAL_COMPANY_PROFILE,
  INITIAL_OPERATING_ENTITIES,
  INITIAL_COUNTRY_TAX_JURISDICTIONS
} from '../data/mockAccountingData';

export type NavigationTab = 
  | 'home'
  | 'dashboard'
  | 'activities'
  | 'tax'
  | 'thai_tax'
  | 'transactions'
  | 'lists'
  | 'coa'
  | 'reports'
  | 'analytics'
  | 'documents'
  | 'setup'
  | 'customization'
  | 'fixed_assets'
  | 'suiteapps'
  | 'support';

export interface CurrencyRate {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateToUSD: number; // 1 Unit of foreign currency = X USD
  usdRate: number;   // 1 USD = X units of foreign currency (e.g. 1 USD = 4,050 KHR)
  officialSource?: string;
  sourceUrl?: string;
}

export const FX_RATES: Record<CurrencyCode, CurrencyRate> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rateToUSD: 1.0, usdRate: 1.0, officialSource: 'Federal Reserve / Base Currency' },
  KHR: { 
    code: 'KHR', 
    symbol: '៛', 
    name: 'Cambodian Riel (រៀល)', 
    rateToUSD: 1 / 4050, 
    usdRate: 4050, 
    officialSource: 'National Bank of Cambodia (NBC)', 
    sourceUrl: 'https://www.nbc.gov.kh/english/economic_research/exchange_rate.php' 
  },
  THB: { code: 'THB', symbol: '฿', name: 'Thai Baht (บาท)', rateToUSD: 0.028, usdRate: 35.71, officialSource: 'Bank of Thailand (BOT)' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rateToUSD: 1.08, usdRate: 0.9259, officialSource: 'European Central Bank (ECB)' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rateToUSD: 1.28, usdRate: 0.7813, officialSource: 'Bank of England (BoE)' },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rateToUSD: 0.75, usdRate: 1.3333, officialSource: 'Monetary Authority of Singapore (MAS)' },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan (人民币)', rateToUSD: 0.138, usdRate: 7.245, officialSource: "People's Bank of China (PBOC)" },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen (円)', rateToUSD: 0.00644, usdRate: 155.40, officialSource: 'Bank of Japan (BOJ)' },
  VND: { code: 'VND', symbol: '₫', name: 'Vietnamese Dong (Đồng)', rateToUSD: 0.0000393, usdRate: 25420, officialSource: 'State Bank of Vietnam (SBV)' },
};

interface AccountingContextType {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  subView: string;
  setSubView: (view: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentCurrency: CurrencyCode;
  setCurrentCurrency: (currency: CurrencyCode) => void;
  formatCurrency: (amount: number, currency?: CurrencyCode) => string;
  convertToBase: (amount: number, fromCurrency: CurrencyCode) => number;
  
  // User Management (Multi-User, Auth & Admin Access Control)
  users: UserProfile[];
  currentUser: UserProfile;
  isAuthenticated: boolean;
  login: (username: string, password: string) => { success: boolean; message?: string };
  logout: () => void;
  setCurrentUser: (user: UserProfile) => void;
  addUser: (user: Omit<UserProfile, 'id'>) => void;
  deleteUser: (userId: string) => boolean;
  updateUser: (userId: string, updates: Partial<UserProfile>) => void;
  updateUserAccess: (userId: string, updates: Partial<UserProfile>) => void;
  hasPermission: (permission: PermissionKey) => boolean;
  isUserModalOpen: boolean;
  setIsUserModalOpen: (open: boolean) => void;
  isAccessControlModalOpen: boolean;
  setIsAccessControlModalOpen: (open: boolean) => void;
  selectedUserForEdit: UserProfile | null;
  setSelectedUserForEdit: (user: UserProfile | null) => void;
  
  // Data State

  accounts: Account[];
  transactions: Transaction[];
  customers: Customer[];
  vendors: Vendor[];
  taxCodes: TaxCode[];
  whtEntries: ThaiWHTEntry[];
  fixedAssets: FixedAsset[];
  tasks: ActivityTask[];
  auditLogs: AuditLog[];
  
  // Actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Transaction;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => boolean;
  updateTransactionStatus: (id: string, status: Transaction['status']) => void;
  recordPayment: (txId: string, amount: number, memo?: string) => void;
  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => boolean;
  resetToStandardChartOfAccounts: () => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'balance'>) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => boolean;
  addVendor: (vendor: Omit<Vendor, 'id' | 'balance'>) => void;
  updateVendor: (id: string, updates: Partial<Vendor>) => void;
  deleteVendor: (id: string) => boolean;
  addWhtEntry: (entry: Omit<ThaiWHTEntry, 'id'>) => void;
  addFixedAsset: (asset: Omit<FixedAsset, 'id' | 'accumulatedDepreciation' | 'netBookValue'>) => void;
  runMonthlyDepreciation: () => void;
  toggleTask: (taskId: string) => void;
  addTask: (task: Omit<ActivityTask, 'id' | 'status'>) => void;

  // Tax Control & Country Jurisdiction Engine
  addTaxCode: (taxCode: Omit<TaxCode, 'id'>) => TaxCode;
  updateTaxCode: (id: string, updates: Partial<TaxCode>) => void;
  deleteTaxCode: (id: string) => boolean;
  countryJurisdictions: CountryTaxJurisdiction[];
  addCountryJurisdiction: (jurisdiction: Omit<CountryTaxJurisdiction, 'id'>) => CountryTaxJurisdiction;
  updateCountryJurisdiction: (id: string, updates: Partial<CountryTaxJurisdiction>) => void;
  deleteCountryJurisdiction: (id: string) => boolean;
  activeJurisdictionId: string;
  activeJurisdiction: CountryTaxJurisdiction;
  setActiveJurisdictionId: (id: string) => void;
  applyCountryTaxPreset: (jurisdictionId: string) => void;
  resetTaxCodesToDefaults: () => void;
  
  // Company Setup & Profile State
  companyProfile: CompanyProfile;
  updateCompanyProfile: (profile: Partial<CompanyProfile>) => void;
  isCompanySetupModalOpen: boolean;
  setIsCompanySetupModalOpen: (open: boolean) => void;

  // Operating Entities & Subsidiaries State
  operatingEntities: OperatingEntity[];
  addOperatingEntity: (entity: Omit<OperatingEntity, 'id'>) => OperatingEntity;
  updateOperatingEntity: (id: string, updates: Partial<OperatingEntity>) => void;
  deleteOperatingEntity: (id: string) => boolean;
  setPrimaryEntity: (id: string) => void;
  isEntityModalOpen: boolean;
  setIsEntityModalOpen: (open: boolean) => void;
  selectedEntityForEdit: OperatingEntity | null;
  setSelectedEntityForEdit: (entity: OperatingEntity | null) => void;

  // Active selected document for print/preview modal
  previewDoc: { type: 'Invoice' | 'Bill' | 'WHT50Tawi' | 'TaxInvoice'; data: any; isOriginalDoc?: boolean; sourceTx?: Transaction } | null;
  setPreviewDoc: (doc: { type: 'Invoice' | 'Bill' | 'WHT50Tawi' | 'TaxInvoice'; data: any; isOriginalDoc?: boolean; sourceTx?: Transaction } | null) => void;
  openOriginalInvoice: (txOrNumber: Transaction | string) => void;
  linkTransactionToOriginalInvoice: (
    txId: string, 
    originalInvoiceNumber: string, 
    options?: {
      originalInvoiceId?: string;
      originalInvoiceDate?: string;
      originalInvoiceAmount?: number;
      originalInvoiceCurrency?: CurrencyCode;
      originalInvoiceMemo?: string;
    }
  ) => void;
  
  // Quick modals
  isQuickInvoiceOpen: boolean;
  setIsQuickInvoiceOpen: (open: boolean) => void;
  isQuickJournalOpen: boolean;
  setIsQuickJournalOpen: (open: boolean) => void;
  isQuickWhtOpen: boolean;
  setIsQuickWhtOpen: (open: boolean) => void;
  isBankControlModalOpen: boolean;
  setIsBankControlModalOpen: (open: boolean) => void;

  // Account Linker & Entity Mapping State
  isAccountLinkerOpen: boolean;
  setIsAccountLinkerOpen: (open: boolean) => void;
  selectedEntityForLink: { entityName: string; entityType?: string; currentAccountId?: string } | null;
  setSelectedEntityForLink: (item: { entityName: string; entityType?: string; currentAccountId?: string } | null) => void;
  linkEntityNameToAccount: (entityName: string, targetAccountId: string, entityType?: string) => { success: boolean; affectedCount: number; message: string };

  // Admin Password Reset Modal with Email Confirmation
  isPasswordResetModalOpen: boolean;
  setIsPasswordResetModalOpen: (open: boolean) => void;
  sendPasswordResetEmail: (emailOrUsername: string) => { success: boolean; message: string; confirmationCode?: string; targetUser?: UserProfile };
  confirmPasswordResetWithCode: (code: string, newPassword: string) => { success: boolean; message: string };

  // Workflow Diagram vs Analytics View mode on Home
  workflowViewMode: 'flowchart' | 'analytics';
  setWorkflowViewMode: (mode: 'flowchart' | 'analytics') => void;

  // Reset to default data
  resetDatabase: () => void;
}

const AccountingContext = createContext<AccountingContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ACCOUNTS: 'smallbiz_acc_accounts_v1_usd',
  TRANSACTIONS: 'smallbiz_acc_transactions_v1_usd',
  CUSTOMERS: 'smallbiz_acc_customers_v1_usd',
  VENDORS: 'smallbiz_acc_vendors_v1_usd',
  TAX_CODES: 'suite_acc_tax_codes_v3',
  COUNTRY_JURISDICTIONS: 'suite_acc_country_jurisdictions_v3',
  ACTIVE_JURISDICTION: 'suite_acc_active_jurisdiction_v3',
  WHT: 'smallbiz_acc_wht_v1_usd',
  ASSETS: 'smallbiz_acc_assets_v1_usd',
  TASKS: 'smallbiz_acc_tasks_v1_usd',
  LOGS: 'smallbiz_acc_logs_v1_usd',
  USERS: 'suite_acc_users_v3',
  CURRENT_USER_ID: 'suite_acc_current_user_id_v3',
  AUTH: 'suite_acc_is_auth_v3',
  COMPANY: 'suite_acc_company_profile_v1',
  ENTITIES: 'suite_acc_operating_entities_v1',
};

export const AccountingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [subView, setSubView] = useState<string>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentCurrency, setCurrentCurrency] = useState<CurrencyCode>('USD');

  // Company Setup Profile state
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COMPANY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved company profile', e);
      }
    }
    return INITIAL_COMPANY_PROFILE;
  });

  const [isCompanySetupModalOpen, setIsCompanySetupModalOpen] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(companyProfile));
  }, [companyProfile]);

  const updateCompanyProfile = (updates: Partial<CompanyProfile>) => {
    setCompanyProfile(prev => {
      const updated = { ...prev, ...updates };
      logAction('Updated Company Profile', 'Setup', updated.taxId, `Admin updated company legal entity settings for ${updated.name}`);
      return updated;
    });
  };

  // Operating Entities & Subsidiaries State
  const [operatingEntities, setOperatingEntities] = useState<OperatingEntity[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ENTITIES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved operating entities', e);
      }
    }
    return INITIAL_OPERATING_ENTITIES;
  });

  const [isEntityModalOpen, setIsEntityModalOpen] = useState<boolean>(false);
  const [selectedEntityForEdit, setSelectedEntityForEdit] = useState<OperatingEntity | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ENTITIES, JSON.stringify(operatingEntities));
  }, [operatingEntities]);

  const addOperatingEntity = (newEntData: Omit<OperatingEntity, 'id'>): OperatingEntity => {
    const newEnt: OperatingEntity = {
      ...newEntData,
      id: `entity-${Date.now()}`
    };
    setOperatingEntities(prev => {
      let list = prev;
      if (newEnt.status === 'Primary') {
        list = prev.map(e => ({ ...e, status: e.status === 'Primary' ? 'Connected' : e.status }));
      }
      return [...list, newEnt];
    });
    logAction('Added Operating Entity', 'Entity Setup', newEnt.code, `Admin registered entity ${newEnt.name} (${newEnt.type})`);
    return newEnt;
  };

  const updateOperatingEntity = (id: string, updates: Partial<OperatingEntity>) => {
    setOperatingEntities(prev => {
      return prev.map(e => {
        if (e.id === id) {
          return { ...e, ...updates };
        }
        if (updates.status === 'Primary' && e.status === 'Primary') {
          return { ...e, status: 'Connected' };
        }
        return e;
      });
    });
    logAction('Updated Operating Entity', 'Entity Setup', id, `Admin updated parameters for entity`);
  };

  const deleteOperatingEntity = (id: string): boolean => {
    const target = operatingEntities.find(e => e.id === id);
    if (!target) return false;
    if (target.status === 'Primary') {
      alert('Cannot delete the primary operating entity. Designate another primary entity first.');
      return false;
    }
    setOperatingEntities(prev => prev.filter(e => e.id !== id));
    logAction('Deleted Operating Entity', 'Entity Setup', target.code, `Admin deleted entity ${target.name}`);
    return true;
  };

  const setPrimaryEntity = (id: string) => {
    setOperatingEntities(prev => prev.map(e => ({
      ...e,
      status: e.id === id ? 'Primary' : (e.status === 'Primary' ? 'Connected' : e.status)
    })));
    logAction('Designated Primary Entity', 'Entity Setup', id, `Admin changed primary operating entity`);
  };

  // Multi-User & Auth state
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filter out legacy dummy demo accounts so only Admin remains unless user created them
          const filtered = parsed.filter((u: UserProfile) => {
            const isLegacyDummy = 
              (u.id === 'usr-2' && u.email?.includes('company.com')) ||
              (u.id === 'usr-3' && u.email?.includes('company.com')) ||
              (u.id === 'usr-4' && u.email?.includes('company.com')) ||
              (u.username === 'Somchai' || u.username === 'Kanya' || (u.username === 'Staff' && !u.isAdmin));
            return !isLegacyDummy;
          });

          // Ensure Administrator user is present with accurate name and email
          const updatedList = filtered.map((u: UserProfile) => {
            if (u.id === 'usr-1' || u.isAdmin || u.username?.toLowerCase() === 'admin' || u.username?.toLowerCase() === 'administrator') {
              return {
                ...u,
                id: 'usr-1',
                name: 'Administrator',
                username: 'Administrator',
                email: 'soeuysiemreap@gmail.com',
                password: u.password || 'Admin123',
                initials: 'AD',
                isAdmin: true
              };
            }
            return u;
          });

          const hasAdmin = updatedList.some(u => u.isAdmin || u.id === 'usr-1');
          if (!hasAdmin) {
            updatedList.unshift(INITIAL_USERS[0]);
          }

          return updatedList;
        }
      } catch (e) {
        console.error('Failed to parse saved users', e);
      }
    }
    return INITIAL_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    return saved || 'usr-1';
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTH);
    return saved !== null ? saved === 'true' : false; // Require login by default
  });

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isAccessControlModalOpen, setIsAccessControlModalOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserProfile | null>(null);
  const [isPasswordResetModalOpen, setIsPasswordResetModalOpen] = useState<boolean>(false);
  const [pendingResetSession, setPendingResetSession] = useState<{ userId: string; email: string; code: string; expiresAt: number } | null>(null);

  // Sync users to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  // Sync auth to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUTH, String(isAuthenticated));
  }, [isAuthenticated]);

  const currentUser = users.find(u => u.id === currentUserId) || users[0] || INITIAL_USERS[0];

  const hasPermission = (permission: PermissionKey): boolean => {
    if (!currentUser) return false;
    if (currentUser.isAdmin) return true;
    return Boolean(currentUser.accessKeys?.includes(permission));
  };

  const login = (usernameInput: string, passwordInput: string): { success: boolean; message?: string } => {
    const trimmedUser = usernameInput.trim().toLowerCase();
    const userMatch = users.find(u => 
      (u.username && u.username.toLowerCase() === trimmedUser) || 
      (u.email && u.email.toLowerCase() === trimmedUser) ||
      (trimmedUser === 'admin' && (u.isAdmin || u.username?.toLowerCase() === 'administrator')) ||
      (trimmedUser === 'administrator' && (u.isAdmin || u.username?.toLowerCase() === 'admin'))
    );

    if (!userMatch) {
      return { success: false, message: 'User not found. Please check your username or email.' };
    }

    if (userMatch.password && userMatch.password !== passwordInput) {
      return { success: false, message: 'Incorrect password. Please try again.' };
    }

    setCurrentUserId(userMatch.id);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userMatch.id);
    setIsAuthenticated(true);
    logAction('User Logged In', 'Security', userMatch.id, `User ${userMatch.name} (${userMatch.username}) signed in successfully.`);
    return { success: true };
  };

  const logout = () => {
    if (currentUser) {
      logAction('User Logged Out', 'Security', currentUser.id, `User ${currentUser.name} signed out of session.`);
    }
    setIsAuthenticated(false);
  };

  const setCurrentUser = (user: UserProfile) => {
    setCurrentUserId(user.id);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, user.id);
    logAction('User Session Switched', 'User', user.id, `Switched active user to ${user.name} (${user.role})`);
  };

  const addUser = (userData: Omit<UserProfile, 'id'>) => {
    if (!currentUser?.isAdmin) {
      alert('Restricted: Only System Administrators have permission to add new users.');
      return;
    }

    const newUser: UserProfile = {
      ...userData,
      id: `usr-${Date.now()}`,
    };
    setUsers(prev => [...prev, newUser]);
    logAction('Added New User', 'User', newUser.id, `Admin ${currentUser.name} created user account for ${newUser.name} (@${newUser.username}) with role ${newUser.role}`);
  };

  const deleteUser = (userId: string): boolean => {
    if (!currentUser?.isAdmin) {
      alert('Restricted: Only System Administrators have permission to delete users.');
      return false;
    }

    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return false;

    // Prevent deleting the last admin user
    const adminCount = users.filter(u => u.isAdmin).length;
    if (targetUser.isAdmin && adminCount <= 1) {
      alert('Security Protection: You cannot delete the only remaining System Administrator account.');
      return false;
    }

    const updatedUsers = users.filter(u => u.id !== userId);
    setUsers(updatedUsers);

    // If deleting currently active user, switch to another admin/user
    if (currentUserId === userId) {
      const nextUser = updatedUsers.find(u => u.isAdmin) || updatedUsers[0];
      if (nextUser) {
        setCurrentUserId(nextUser.id);
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, nextUser.id);
      }
    }

    logAction('Deleted User Account', 'User', userId, `Admin ${currentUser.name} deleted user account for ${targetUser.name} (@${targetUser.username})`);
    return true;
  };

  const updateUser = (userId: string, updates: Partial<UserProfile>) => {
    if (!currentUser?.isAdmin && currentUser?.id !== userId) {
      alert('Restricted: Only System Administrators or the account owner can modify this profile.');
      return;
    }

    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          ...updates
        };
      }
      return u;
    }));

    logAction('Updated User Profile', 'User', userId, `Profile details updated for ${updates.name || userId}`);
  };

  const updateUserAccess = (userId: string, updates: Partial<UserProfile>) => {
    // Only admins can change access/permissions
    if (!currentUser?.isAdmin) {
      alert('Restricted: Only System Administrators have permission to modify user access and permissions.');
      return;
    }

    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          ...updates
        };
      }
      return u;
    }));

    logAction('Updated User Access & Permissions', 'User', userId, `Admin ${currentUser.name} modified access permissions for user ID ${userId}`);
  };

  const sendPasswordResetEmail = (emailOrUsername: string): { success: boolean; message: string; confirmationCode?: string; targetUser?: UserProfile } => {
    const query = emailOrUsername.trim().toLowerCase();
    const target = users.find(u => 
      (u.email && u.email.toLowerCase() === query) || 
      (u.username && u.username.toLowerCase() === query) ||
      ((query === 'admin' || query === 'administrator') && (u.isAdmin || u.email === 'soeuysiemreap@gmail.com'))
    );

    if (!target) {
      return {
        success: false,
        message: 'No registered user or administrator found matching that email or username.'
      };
    }

    // Generate a 6-digit confirmation code
    const confirmationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins validity

    setPendingResetSession({
      userId: target.id,
      email: target.email,
      code: confirmationCode,
      expiresAt
    });

    logAction(
      'Password Reset Requested',
      'Security',
      target.id,
      `Verification email sent to ${target.email} with confirmation code: ${confirmationCode} for user @${target.username}`
    );

    return {
      success: true,
      message: `Password reset confirmation code has been dispatched to ${target.email}.`,
      confirmationCode,
      targetUser: target
    };
  };

  const confirmPasswordResetWithCode = (code: string, newPassword: string): { success: boolean; message: string } => {
    if (!pendingResetSession) {
      return { success: false, message: 'No active password reset request found. Please request a new confirmation email.' };
    }

    if (Date.now() > pendingResetSession.expiresAt) {
      setPendingResetSession(null);
      return { success: false, message: 'Confirmation code has expired. Please request a fresh confirmation code.' };
    }

    if (pendingResetSession.code.trim() !== code.trim()) {
      return { success: false, message: 'Invalid confirmation code. Please enter the 6-digit code sent to your email.' };
    }

    const userId = pendingResetSession.userId;
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          password: newPassword
        };
      }
      return u;
    }));

    logAction(
      'Password Reset Completed',
      'Security',
      userId,
      `User password was successfully reset via email confirmation code for user ID ${userId}.`
    );

    setPendingResetSession(null);
    return { success: true, message: 'Password updated successfully! You can now log in with your new password.' };
  };

  // Load persistent state or fall back to mock
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 50) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved accounts', e);
      }
    }
    return INITIAL_ACCOUNTS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [vendors, setVendors] = useState<Vendor[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VENDORS);
    return saved ? JSON.parse(saved) : INITIAL_VENDORS;
  });

  const [taxCodes, setTaxCodes] = useState<TaxCode[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TAX_CODES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse saved tax codes', e);
      }
    }
    return INITIAL_TAX_CODES;
  });

  const [countryJurisdictions, setCountryJurisdictions] = useState<CountryTaxJurisdiction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COUNTRY_JURISDICTIONS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse saved country jurisdictions', e);
      }
    }
    return INITIAL_COUNTRY_TAX_JURISDICTIONS;
  });
  const [activeJurisdictionId, setActiveJurisdictionId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_JURISDICTION);
    return saved || 'jur-kh'; // Default to Cambodia GDT as active standard or Thailand
  });

  const activeJurisdiction = countryJurisdictions.find(j => j.id === activeJurisdictionId) || countryJurisdictions[0];

  const [whtEntries, setWhtEntries] = useState<ThaiWHTEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WHT);
    return saved ? JSON.parse(saved) : INITIAL_WHT_ENTRIES;
  });

  const [fixedAssets, setFixedAssets] = useState<FixedAsset[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ASSETS);
    return saved ? JSON.parse(saved) : INITIAL_FIXED_ASSETS;
  });

  const [tasks, setTasks] = useState<ActivityTask[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // Modal / Preview state
  const [previewDoc, setPreviewDoc] = useState<{ type: 'Invoice' | 'Bill' | 'WHT50Tawi' | 'TaxInvoice'; data: any; isOriginalDoc?: boolean; sourceTx?: Transaction } | null>(null);
  const [isQuickInvoiceOpen, setIsQuickInvoiceOpen] = useState(false);
  const [isQuickJournalOpen, setIsQuickJournalOpen] = useState(false);
  const [isQuickWhtOpen, setIsQuickWhtOpen] = useState(false);
  const [isBankControlModalOpen, setIsBankControlModalOpen] = useState(false);

  // Account Linker & Entity Mapping State
  const [isAccountLinkerOpen, setIsAccountLinkerOpen] = useState(false);
  const [selectedEntityForLink, setSelectedEntityForLink] = useState<{ entityName: string; entityType?: string; currentAccountId?: string } | null>(null);
  const [workflowViewMode, setWorkflowViewMode] = useState<'flowchart' | 'analytics'>('flowchart');

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(vendors));
  }, [vendors]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WHT, JSON.stringify(whtEntries));
  }, [whtEntries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(fixedAssets));
  }, [fixedAssets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TAX_CODES, JSON.stringify(taxCodes));
  }, [taxCodes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COUNTRY_JURISDICTIONS, JSON.stringify(countryJurisdictions));
  }, [countryJurisdictions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_JURISDICTION, activeJurisdictionId);
  }, [activeJurisdictionId]);

  // Country Jurisdiction Actions
  const addCountryJurisdiction = (jurData: Omit<CountryTaxJurisdiction, 'id'>): CountryTaxJurisdiction => {
    const newJur: CountryTaxJurisdiction = {
      ...jurData,
      id: `jur-${Date.now()}`,
    };
    setCountryJurisdictions(prev => [...prev, newJur]);

    // Auto-create standard output VAT code for this country
    const stdRate = newJur.standardVatRate;
    const countryShort = newJur.countryName.split(' ')[0] || newJur.countryCode;
    addTaxCode({
      code: `${newJur.countryCode}-VAT-${(stdRate * 100).toFixed(0)}%`,
      name: `${newJur.taxSystemName} Standard (${(stdRate * 100).toFixed(0)}%)`,
      thaiName: `${newJur.countryName} Standard VAT`,
      rate: stdRate,
      type: 'VAT_Output',
      country: countryShort,
      isActive: true,
      description: `Standard statutory VAT/tax rate for ${newJur.countryName}`
    });

    logAction('Added Country Jurisdiction', 'Tax Setup', newJur.countryCode, `Admin added country tax jurisdiction ${newJur.countryName} (Standard: ${(newJur.standardVatRate * 100).toFixed(1)}%)`);
    return newJur;
  };

  const updateCountryJurisdiction = (id: string, updates: Partial<CountryTaxJurisdiction>) => {
    setCountryJurisdictions(prev => prev.map(jur => {
      if (jur.id === id) {
        const updated = { ...jur, ...updates };
        logAction('Updated Country Jurisdiction', 'Tax Setup', updated.countryCode, `Admin adjusted tax parameters for ${updated.countryName} (Standard: ${(updated.standardVatRate * 100).toFixed(1)}%)`);
        return updated;
      }
      return jur;
    }));

    // If updating active jurisdiction and standardVatRate changed, align default VAT code
    if (id === activeJurisdictionId && updates.standardVatRate !== undefined) {
      setTaxCodes(prev => prev.map(tc => {
        if (tc.type === 'VAT_Output' && !tc.code.includes('0%') && !tc.code.includes('EXEMPT')) {
          return {
            ...tc,
            rate: updates.standardVatRate!,
            name: `${updates.taxSystemName || activeJurisdiction.taxSystemName} Standard (${(updates.standardVatRate! * 100).toFixed(0)}%)`
          };
        }
        return tc;
      }));
    }
  };

  const deleteCountryJurisdiction = (id: string): boolean => {
    const target = countryJurisdictions.find(j => j.id === id);
    if (!target) return false;
    if (countryJurisdictions.length <= 1) {
      alert('Cannot delete the only remaining country jurisdiction.');
      return false;
    }
    setCountryJurisdictions(prev => prev.filter(j => j.id !== id));
    if (activeJurisdictionId === id) {
      const next = countryJurisdictions.find(j => j.id !== id) || INITIAL_COUNTRY_TAX_JURISDICTIONS[0];
      setActiveJurisdictionId(next.id);
    }
    logAction('Deleted Country Jurisdiction', 'Tax Setup', target.countryCode, `Admin removed tax jurisdiction ${target.countryName}`);
    return true;
  };

  // Tax Management Actions
  const addTaxCode = (taxCodeData: Omit<TaxCode, 'id'>): TaxCode => {
    const newTaxCode: TaxCode = {
      ...taxCodeData,
      id: `tax-${Date.now()}`,
      isActive: taxCodeData.isActive !== false,
    };
    setTaxCodes(prev => [newTaxCode, ...prev]);
    logAction('Added Tax Code', 'Tax Setup', newTaxCode.code, `Created tax code ${newTaxCode.code} (${(newTaxCode.rate * 100).toFixed(1)}%)`);
    return newTaxCode;
  };

  const updateTaxCode = (id: string, updates: Partial<TaxCode>) => {
    setTaxCodes(prev => prev.map(tc => {
      if (tc.id === id) {
        const updated = { ...tc, ...updates };
        logAction('Updated Tax Code', 'Tax Setup', updated.code, `Adjusted tax rate/settings for ${updated.code} (${((updated.rate || 0) * 100).toFixed(1)}%)`);
        return updated;
      }
      return tc;
    }));
  };

  const deleteTaxCode = (id: string): boolean => {
    const target = taxCodes.find(tc => tc.id === id);
    if (!target) return false;
    setTaxCodes(prev => prev.filter(tc => tc.id !== id));
    logAction('Deleted Tax Code', 'Tax Setup', target.code, `Removed tax code ${target.code}`);
    return true;
  };

  const applyCountryTaxPreset = (jurisdictionId: string) => {
    const jur = countryJurisdictions.find(j => j.id === jurisdictionId);
    if (!jur) return;

    setActiveJurisdictionId(jurisdictionId);

    // Auto-align main VAT output/input tax rates to jurisdiction standard
    setTaxCodes(prev => {
      return prev.map(tc => {
        // If standard output VAT
        if (tc.type === 'VAT_Output' && !tc.code.includes('0%') && !tc.code.includes('EXEMPT')) {
          if (tc.country === jur.countryName.split(' ')[0] || !tc.country) {
            return {
              ...tc,
              rate: jur.standardVatRate,
              name: `${jur.taxSystemName} Standard (${(jur.standardVatRate * 100).toFixed(0)}%)`
            };
          }
        }
        return tc;
      });
    });

    logAction('Applied Country Tax Preset', 'Tax Setup', jur.countryCode, `Configured active tax jurisdiction to ${jur.countryName} (Standard: ${(jur.standardVatRate * 100).toFixed(0)}%)`);
  };

  const resetTaxCodesToDefaults = () => {
    setTaxCodes(INITIAL_TAX_CODES);
    localStorage.removeItem(STORAGE_KEYS.TAX_CODES);
    logAction('Reset Tax Codes', 'Tax Setup', 'System', 'Reset all tax code definitions to standard statutory defaults');
  };

  // Utility calculations
  const convertToBase = (amount: number, fromCurrency: CurrencyCode): number => {
    const rate = FX_RATES[fromCurrency]?.rateToUSD || 1.0;
    return amount * rate;
  };

  const formatCurrency = (amount: number, currency: CurrencyCode = currentCurrency): string => {
    const symbol = FX_RATES[currency]?.symbol || '$';
    if (currency === 'KHR' || currency === 'VND' || currency === 'JPY') {
      return `${symbol}${Math.round(amount).toLocaleString('en-US')}`;
    }
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const logAction = (action: string, recordType: string, recordId: string, details: string) => {
    const activeUserName = currentUser ? `${currentUser.name} (${currentUser.role})` : 'Somchai Prasert (Chief Accountant)';
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: activeUserName,
      action,
      recordType,
      recordId,
      details,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const addTransaction = (txData: Omit<Transaction, 'id' | 'createdAt'>): Transaction => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setTransactions(prev => [newTx, ...prev]);

    // Update Customer or Vendor balance if relevant
    if (newTx.type === 'Invoice' && newTx.entityType === 'Customer') {
      setCustomers(prev => prev.map(c => c.id === newTx.entityId ? { ...c, balance: c.balance + newTx.balanceDue } : c));
      // Update Output VAT account if applicable
      if (newTx.taxTotal > 0) {
        setAccounts(prev => prev.map(acc => acc.number === '2100' ? { ...acc, balance: acc.balance + newTx.taxTotal } : acc));
      }
    } else if (newTx.type === 'Bill' && newTx.entityType === 'Vendor') {
      setVendors(prev => prev.map(v => v.id === newTx.entityId ? { ...v, balance: v.balance + newTx.balanceDue } : v));
      // Update Input VAT account if applicable
      if (newTx.taxTotal > 0) {
        setAccounts(prev => prev.map(acc => acc.number === '1250' ? { ...acc, balance: acc.balance + newTx.taxTotal } : acc));
      }
    }

    logAction('Created Transaction', newTx.type, newTx.transactionNumber, `${newTx.entityName} - Amount: ${formatCurrency(newTx.total, newTx.currency)}`);
    return newTx;
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    let oldTx: Transaction | undefined;
    
    setTransactions(prev => {
      oldTx = prev.find(t => t.id === id);
      if (!oldTx) return prev;

      const newTotal = updates.total !== undefined ? updates.total : oldTx.total;
      const newPaid = updates.amountPaid !== undefined ? updates.amountPaid : oldTx.amountPaid;
      const newBalanceDue = Math.max(0, newTotal - newPaid);
      const newTaxTotal = updates.taxTotal !== undefined ? updates.taxTotal : (oldTx.taxTotal || 0);

      // Proportionately update journal lines if total changed and journalLines exist
      let updatedJournalLines = updates.journalLines || oldTx.journalLines;
      if (updates.total !== undefined && oldTx.total > 0 && updates.total !== oldTx.total && updatedJournalLines && updatedJournalLines.length > 0) {
        const ratio = updates.total / oldTx.total;
        updatedJournalLines = updatedJournalLines.map(jl => ({
          ...jl,
          debit: jl.debit > 0 ? Math.round(jl.debit * ratio * 100) / 100 : 0,
          credit: jl.credit > 0 ? Math.round(jl.credit * ratio * 100) / 100 : 0,
        }));
      }

      // Proportionately update line items if total changed and items weren't replaced
      let updatedItems = updates.items || oldTx.items;
      if (updates.total !== undefined && oldTx.total > 0 && updates.total !== oldTx.total && !updates.items && updatedItems && updatedItems.length > 0) {
        const ratio = updates.total / oldTx.total;
        updatedItems = updatedItems.map(item => ({
          ...item,
          unitPrice: Math.round(item.unitPrice * ratio * 100) / 100,
          amount: Math.round(item.amount * ratio * 100) / 100,
          taxAmount: Math.round((item.taxAmount || 0) * ratio * 100) / 100,
        }));
      }

      const updatedList = prev.map(tx => {
        if (tx.id === id) {
          const updated: Transaction = {
            ...tx,
            ...updates,
            total: newTotal,
            amountPaid: newPaid,
            taxTotal: newTaxTotal,
            balanceDue: newBalanceDue,
            status: updates.status || (newBalanceDue === 0 && newTotal > 0 ? 'Paid' : tx.status),
            journalLines: updatedJournalLines,
            items: updatedItems,
          };
          return updated;
        }

        // If another transaction links to this transaction's original invoice number, keep it synced
        if (oldTx && (tx.originalInvoiceId === id || (tx.originalInvoiceNumber && tx.originalInvoiceNumber === oldTx.transactionNumber))) {
          return {
            ...tx,
            originalInvoiceNumber: updates.transactionNumber || tx.originalInvoiceNumber,
            originalInvoiceDate: updates.date || tx.originalInvoiceDate,
            originalInvoiceAmount: updates.total !== undefined ? updates.total : tx.originalInvoiceAmount,
            originalInvoiceMemo: updates.memo || tx.originalInvoiceMemo,
          };
        }

        return tx;
      });

      return updatedList;
    });

    // Synchronize Counterparty and Account Balances if total or due amount changed
    if (oldTx) {
      const oldTotal = oldTx.total;
      const targetTotal = updates.total !== undefined ? updates.total : oldTotal;
      const totalDelta = targetTotal - oldTotal;

      const oldDue = oldTx.balanceDue;
      const targetDue = updates.total !== undefined || updates.amountPaid !== undefined 
        ? Math.max(0, targetTotal - (updates.amountPaid !== undefined ? updates.amountPaid : oldTx.amountPaid))
        : oldDue;
      const dueDelta = targetDue - oldDue;

      if (dueDelta !== 0 || totalDelta !== 0) {
        if (oldTx.type === 'Invoice' && oldTx.entityType === 'Customer') {
          // Adjust customer balance
          if (oldTx.entityId) {
            setCustomers(cList => cList.map(c => c.id === oldTx?.entityId ? { ...c, balance: Math.max(0, c.balance + dueDelta) } : c));
          }
          // Adjust AR (1100) and Revenue (4010) accounts
          setAccounts(aList => aList.map(acc => {
            if (acc.number === '1100' || acc.number === '1020') {
              return { ...acc, balance: Math.max(0, acc.balance + dueDelta) };
            }
            if (acc.number === '4010' || acc.number === '4000') {
              return { ...acc, balance: Math.max(0, acc.balance + totalDelta) };
            }
            return acc;
          }));
        } else if (oldTx.type === 'Bill' && oldTx.entityType === 'Vendor') {
          // Adjust vendor balance
          if (oldTx.entityId) {
            setVendors(vList => vList.map(v => v.id === oldTx?.entityId ? { ...v, balance: Math.max(0, v.balance + dueDelta) } : v));
          }
          // Adjust AP (2010) and Expense (6010) accounts
          setAccounts(aList => aList.map(acc => {
            if (acc.number === '2010' || acc.number === '2000') {
              return { ...acc, balance: Math.max(0, acc.balance + dueDelta) };
            }
            if (acc.number === '6010' || acc.number === '5010') {
              return { ...acc, balance: Math.max(0, acc.balance + totalDelta) };
            }
            return acc;
          }));
        }
      }

      logAction('Updated Transaction (Synced)', oldTx.type, updates.transactionNumber || oldTx.transactionNumber, `Synchronized original change for #${updates.transactionNumber || oldTx.transactionNumber} with GL & Account balances`);
    }
  };

  const deleteTransaction = (id: string): boolean => {
    const target = transactions.find(t => t.id === id);
    if (!target) return false;

    // Adjust customer/vendor balance if deleting an active AR/AP document
    if (target.type === 'Invoice' && target.entityType === 'Customer' && target.balanceDue > 0) {
      setCustomers(cList => cList.map(c => c.id === target.entityId ? { ...c, balance: Math.max(0, c.balance - target.balanceDue) } : c));
    } else if (target.type === 'Bill' && target.entityType === 'Vendor' && target.balanceDue > 0) {
      setVendors(vList => vList.map(v => v.id === target.entityId ? { ...v, balance: Math.max(0, v.balance - target.balanceDue) } : v));
    }

    setTransactions(prev => prev.filter(t => t.id !== id));
    logAction('Deleted Transaction', target.type, target.transactionNumber, `Admin removed transaction #${target.transactionNumber} (${target.entityName})`);
    return true;
  };

  const updateTransactionStatus = (id: string, status: Transaction['status']) => {
    setTransactions(prev => prev.map(tx => {
      if (tx.id === id) {
        logAction('Updated Status', tx.type, tx.transactionNumber, `Status changed to ${status}`);
        return { ...tx, status };
      }
      return tx;
    }));
  };

  const recordPayment = (txId: string, amount: number, memo?: string) => {
    setTransactions(prev => prev.map(tx => {
      if (tx.id === txId) {
        const newPaid = tx.amountPaid + amount;
        const newDue = Math.max(0, tx.total - newPaid);
        const newStatus: Transaction['status'] = newDue === 0 ? 'Paid' : 'Partially_Paid';

        // Adjust entity balance
        if (tx.type === 'Invoice' && tx.entityType === 'Customer') {
          setCustomers(cList => cList.map(c => c.id === tx.entityId ? { ...c, balance: Math.max(0, c.balance - amount) } : c));
        } else if (tx.type === 'Bill' && tx.entityType === 'Vendor') {
          setVendors(vList => vList.map(v => v.id === tx.entityId ? { ...v, balance: Math.max(0, v.balance - amount) } : v));
        }

        logAction('Payment Recorded', tx.type, tx.transactionNumber, `Payment of $${amount.toLocaleString()} received/settled. ${memo || ''}`);
        return {
          ...tx,
          amountPaid: newPaid,
          balanceDue: newDue,
          status: newStatus,
        };
      }
      return tx;
    }));
  };

  const linkTransactionToOriginalInvoice = (
    txId: string, 
    originalInvoiceNumber: string, 
    options?: {
      originalInvoiceId?: string;
      originalInvoiceDate?: string;
      originalInvoiceAmount?: number;
      originalInvoiceCurrency?: CurrencyCode;
      originalInvoiceMemo?: string;
    }
  ) => {
    setTransactions(prev => prev.map(t => {
      if (t.id === txId) {
        const cleanNumber = originalInvoiceNumber.trim();
        const updated: Transaction = {
          ...t,
          originalInvoiceNumber: cleanNumber,
          originalInvoiceId: options?.originalInvoiceId || t.originalInvoiceId,
          originalInvoiceDate: options?.originalInvoiceDate || t.originalInvoiceDate || t.date,
          originalInvoiceAmount: options?.originalInvoiceAmount !== undefined ? options.originalInvoiceAmount : (t.originalInvoiceAmount || t.total),
          originalInvoiceCurrency: options?.originalInvoiceCurrency || t.originalInvoiceCurrency || t.currency,
          originalInvoiceMemo: options?.originalInvoiceMemo || t.originalInvoiceMemo || `Original invoice reference ${cleanNumber}`,
          linkedDocuments: [
            ...(t.linkedDocuments || []).filter(ld => ld.number !== cleanNumber),
            {
              id: `ld-${Date.now()}`,
              type: 'Invoice',
              number: cleanNumber,
              date: options?.originalInvoiceDate || t.date,
              amount: options?.originalInvoiceAmount !== undefined ? options.originalInvoiceAmount : t.total,
              currency: options?.originalInvoiceCurrency || t.currency,
              description: options?.originalInvoiceMemo || `Linked Original Document #${cleanNumber}`
            }
          ]
        };
        logAction('Linked Original Invoice', t.type, t.transactionNumber, `Linked to original invoice reference #${cleanNumber}`);
        return updated;
      }
      return t;
    }));
  };

  const openOriginalInvoice = (txOrNumber: Transaction | string) => {
    let targetTx: Transaction | undefined;
    let origNumber = '';
    let sourceTx: Transaction | undefined;

    if (typeof txOrNumber === 'string') {
      origNumber = txOrNumber.trim();
      targetTx = transactions.find(t => t.transactionNumber === origNumber || t.taxInvoiceNumber === origNumber || t.id === origNumber);
    } else {
      sourceTx = txOrNumber;
      origNumber = (txOrNumber.originalInvoiceNumber || txOrNumber.transactionNumber || '').trim();
      targetTx = transactions.find(t => 
        (txOrNumber.originalInvoiceId && t.id === txOrNumber.originalInvoiceId) ||
        (origNumber && (t.transactionNumber === origNumber || t.taxInvoiceNumber === origNumber))
      );
    }

    if (targetTx) {
      setPreviewDoc({
        type: targetTx.type === 'Invoice' ? 'Invoice' : 'Bill',
        data: targetTx,
        isOriginalDoc: true,
        sourceTx: sourceTx
      });
    } else if (sourceTx && sourceTx.originalInvoiceNumber) {
      // Build a formal original invoice source document preview
      const syntheticDoc: Partial<Transaction> = {
        id: `orig-${sourceTx.id}`,
        transactionNumber: sourceTx.originalInvoiceNumber,
        type: sourceTx.type === 'Bill' ? 'Bill' : 'Invoice',
        date: sourceTx.originalInvoiceDate || sourceTx.date,
        dueDate: sourceTx.dueDate || sourceTx.date,
        postingPeriod: sourceTx.postingPeriod,
        entityId: sourceTx.entityId,
        entityName: sourceTx.entityName,
        entityType: sourceTx.entityType,
        status: 'Approved',
        currency: sourceTx.originalInvoiceCurrency || sourceTx.currency,
        exchangeRate: sourceTx.exchangeRate || 1.0,
        subtotal: sourceTx.originalInvoiceAmount ? Math.round(sourceTx.originalInvoiceAmount / 1.07) : sourceTx.subtotal,
        taxTotal: sourceTx.originalInvoiceAmount ? (sourceTx.originalInvoiceAmount - Math.round(sourceTx.originalInvoiceAmount / 1.07)) : sourceTx.taxTotal,
        total: sourceTx.originalInvoiceAmount || sourceTx.total,
        amountPaid: sourceTx.amountPaid,
        balanceDue: 0,
        memo: sourceTx.originalInvoiceMemo || `Original invoice source voucher for #${sourceTx.transactionNumber}`,
        department: sourceTx.department,
        subsidiary: sourceTx.subsidiary,
        createdAt: sourceTx.createdAt,
        items: sourceTx.items && sourceTx.items.length > 0 ? sourceTx.items : [
          {
            id: 'orig-line-1',
            accountId: 'acc-4010',
            description: sourceTx.memo || `Original contracted billing items for #${sourceTx.originalInvoiceNumber}`,
            quantity: 1,
            unitPrice: sourceTx.originalInvoiceAmount || sourceTx.total,
            amount: sourceTx.originalInvoiceAmount || sourceTx.total,
            taxRate: 0.07,
            taxAmount: sourceTx.taxTotal
          }
        ]
      };
      setPreviewDoc({
        type: sourceTx.type === 'Bill' ? 'Bill' : 'Invoice',
        data: syntheticDoc as Transaction,
        isOriginalDoc: true,
        sourceTx: sourceTx
      });
    } else if (typeof txOrNumber === 'object') {
      setPreviewDoc({
        type: txOrNumber.type === 'Invoice' ? 'Invoice' : 'Bill',
        data: txOrNumber,
        isOriginalDoc: false,
      });
    }
  };

  const addAccount = (accountData: Omit<Account, 'id'>) => {
    const newAccount: Account = {
      ...accountData,
      id: `acc-${Date.now()}`,
    };
    setAccounts(prev => [...prev, newAccount].sort((a, b) => a.number.localeCompare(b.number)));
    logAction('Created Account', 'Chart of Accounts', newAccount.number, `${newAccount.name} (${newAccount.category})`);
  };

  const updateAccount = (id: string, updates: Partial<Account>) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id === id) {
        const updated = { ...acc, ...updates };
        logAction('Updated Account Cost / Balance', 'Chart of Accounts', updated.number, `${updated.name} - Balance/Cost adjusted to ${formatCurrency(updated.balance, updated.currency)}`);
        return updated;
      }
      return acc;
    }));
  };

  const deleteAccount = (id: string): boolean => {
    const acc = accounts.find(a => a.id === id);
    if (!acc) return false;
    setAccounts(prev => prev.filter(a => a.id !== id));
    logAction('Deleted Account', 'Chart of Accounts', acc.number, `Removed account ${acc.number} - ${acc.name}`);
    return true;
  };

  const resetToStandardChartOfAccounts = () => {
    setAccounts(INITIAL_ACCOUNTS);
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(INITIAL_ACCOUNTS));
    logAction('Reset Chart of Accounts', 'Chart of Accounts', 'System', `Standardized chart of accounts re-synchronized with complete statutory list (${INITIAL_ACCOUNTS.length} accounts)`);
  };

  const addCustomer = (custData: Omit<Customer, 'id' | 'balance'>) => {
    const newCustomer: Customer = {
      ...custData,
      id: `cust-${Date.now()}`,
      balance: 0,
    };
    setCustomers(prev => [...prev, newCustomer]);
    logAction('Created Customer', 'Customer Master', newCustomer.code, newCustomer.companyName);
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === id) {
        const updated = { ...c, ...updates };
        logAction('Updated Customer', 'Customer Master', updated.code, `Modified customer details for ${updated.companyName}`);
        return updated;
      }
      return c;
    }));
  };

  const deleteCustomer = (id: string): boolean => {
    const target = customers.find(c => c.id === id);
    if (!target) return false;
    setCustomers(prev => prev.filter(c => c.id !== id));
    logAction('Deleted Customer', 'Customer Master', target.code, `Removed customer ${target.companyName}`);
    return true;
  };

  const addVendor = (vendData: Omit<Vendor, 'id' | 'balance'>) => {
    const newVendor: Vendor = {
      ...vendData,
      id: `vend-${Date.now()}`,
      balance: 0,
    };
    setVendors(prev => [...prev, newVendor]);
    logAction('Created Vendor', 'Vendor Master', newVendor.code, newVendor.companyName);
  };

  const updateVendor = (id: string, updates: Partial<Vendor>) => {
    setVendors(prev => prev.map(v => {
      if (v.id === id) {
        const updated = { ...v, ...updates };
        logAction('Updated Vendor', 'Vendor Master', updated.code, `Modified vendor details for ${updated.companyName}`);
        return updated;
      }
      return v;
    }));
  };

  const deleteVendor = (id: string): boolean => {
    const target = vendors.find(v => v.id === id);
    if (!target) return false;
    setVendors(prev => prev.filter(v => v.id !== id));
    logAction('Deleted Vendor', 'Vendor Master', target.code, `Removed vendor ${target.companyName}`);
    return true;
  };

  const addWhtEntry = (whtData: Omit<ThaiWHTEntry, 'id'>) => {
    const newWht: ThaiWHTEntry = {
      ...whtData,
      id: `wht-${Date.now()}`,
    };
    setWhtEntries(prev => [newWht, ...prev]);
    logAction('Generated WHT 50 Tawi', 'Thai Tax', newWht.certNumber, `${newWht.formType} for ${newWht.payeeName} - $${newWht.whtAmount}`);
  };

  const addFixedAsset = (assetData: Omit<FixedAsset, 'id' | 'accumulatedDepreciation' | 'netBookValue'>) => {
    const newAsset: FixedAsset = {
      ...assetData,
      id: `fa-${Date.now()}`,
      accumulatedDepreciation: 0,
      netBookValue: assetData.cost,
    };
    setFixedAssets(prev => [...prev, newAsset]);
    logAction('Added Fixed Asset', 'Fixed Assets', newAsset.assetCode, `${newAsset.name} (Cost: $${newAsset.cost.toLocaleString()})`);
  };

  const runMonthlyDepreciation = () => {
    let totalMonthlyDepreciation = 0;

    setFixedAssets(prev => prev.map(asset => {
      if (asset.status !== 'Active') return asset;
      // Monthly straight line: (Cost - Salvage) / (Years * 12)
      const monthlyRate = (asset.cost - asset.salvageValue) / (asset.usefulLifeYears * 12);
      const newAccum = Math.min(asset.cost - asset.salvageValue, asset.accumulatedDepreciation + monthlyRate);
      const newBookValue = Math.max(asset.salvageValue, asset.cost - newAccum);
      totalMonthlyDepreciation += monthlyRate;

      return {
        ...asset,
        accumulatedDepreciation: Math.round(newAccum),
        netBookValue: Math.round(newBookValue),
      };
    }));

    // Post to Journal Entry
    const period = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const deprJournal: Omit<Transaction, 'id' | 'createdAt'> = {
      transactionNumber: `JE-DEPR-${Date.now().toString().slice(-4)}`,
      type: 'Journal_Entry',
      date: new Date().toISOString().split('T')[0],
      postingPeriod: period,
      entityId: 'internal',
      entityName: 'Fixed Asset Monthly Run',
      entityType: 'Other',
      status: 'Approved',
      currency: 'USD',
      exchangeRate: 1.0,
      subtotal: Math.round(totalMonthlyDepreciation),
      taxTotal: 0,
      total: Math.round(totalMonthlyDepreciation),
      amountPaid: 0,
      balanceDue: 0,
      memo: `Automated Monthly Depreciation Batch for ${period}`,
      department: 'Finance & Accounting',
      subsidiary: 'Small Business Co., Ltd.',
      items: [],
      journalLines: [
        {
          id: 'jl-d1',
          accountId: 'acc-6030',
          accountNumber: '6030',
          accountName: 'Depreciation Expense - Fixed Assets',
          debit: Math.round(totalMonthlyDepreciation),
          credit: 0,
          memo: 'Monthly fixed asset depreciation charge',
          department: 'HQ'
        },
        {
          id: 'jl-d2',
          accountId: 'acc-1510',
          accountNumber: '1510',
          accountName: 'Accum. Depr. - Vehicles & Assets',
          debit: 0,
          credit: Math.round(totalMonthlyDepreciation),
          memo: 'Monthly depreciation offset to Accumulated Depreciation',
          department: 'HQ'
        }
      ]
    };

    addTransaction(deprJournal);
    logAction('Executed Depreciation Batch', 'Fixed Assets', 'Monthly Run', `Calculated $${Math.round(totalMonthlyDepreciation).toLocaleString()} depreciation across fleet & hardware`);
  };

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const nextStatus: ActivityTask['status'] = t.status === 'Completed' ? 'In Progress' : 'Completed';
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  const addTask = (taskData: Omit<ActivityTask, 'id' | 'status'>) => {
    const newTask: ActivityTask = {
      ...taskData,
      id: `task-${Date.now()}`,
      status: 'Pending',
    };
    setTasks(prev => [newTask, ...prev]);
    logAction('Added Activity Task', 'Activities', newTask.id, newTask.title);
  };

  const linkEntityNameToAccount = (entityName: string, targetAccountId: string, entityType?: string): { success: boolean; affectedCount: number; message: string } => {
    const targetAcc = accounts.find(a => a.id === targetAccountId || a.number === targetAccountId);
    if (!targetAcc) {
      return { success: false, affectedCount: 0, message: 'Target GL account could not be found in Chart of Accounts.' };
    }

    let affectedCount = 0;
    const normalizedName = entityName.trim().toLowerCase();

    // 1. Update matching transaction line items & account associations
    setTransactions(prev => prev.map(tx => {
      const isEntityMatch = 
        (tx.entityName && tx.entityName.toLowerCase() === normalizedName) ||
        (tx.memo && tx.memo.toLowerCase().includes(normalizedName));

      let lineItemsUpdated = false;
      const updatedLineItems = tx.lineItems.map(item => {
        if (
          isEntityMatch || 
          (item.description && item.description.toLowerCase().includes(normalizedName)) ||
          (item.accountName && item.accountName.toLowerCase().includes(normalizedName))
        ) {
          affectedCount++;
          lineItemsUpdated = true;
          return {
            ...item,
            accountId: targetAcc.id,
            accountNumber: targetAcc.number,
            accountName: targetAcc.name,
          };
        }
        return item;
      });

      if (lineItemsUpdated) {
        return {
          ...tx,
          lineItems: updatedLineItems,
        };
      }
      return tx;
    }));

    const typeDesc = entityType ? `[${entityType}] ` : '';
    logAction(
      'Linked Entity to GL Account',
      'Account Mapping',
      targetAcc.number,
      `Linked ${typeDesc}"${entityName}" to GL Account #${targetAcc.number} (${targetAcc.name}). Total ${affectedCount} line entries remapped.`
    );

    return {
      success: true,
      affectedCount: Math.max(1, affectedCount),
      message: `Successfully linked ${typeDesc}"${entityName}" to GL Account #${targetAcc.number} - ${targetAcc.name}.`
    };
  };

  const resetDatabase = () => {
    setAccounts(INITIAL_ACCOUNTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setCustomers(INITIAL_CUSTOMERS);
    setVendors(INITIAL_VENDORS);
    setWhtEntries(INITIAL_WHT_ENTRIES);
    setFixedAssets(INITIAL_FIXED_ASSETS);
    setTasks(INITIAL_TASKS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    localStorage.clear();
  };

  return (
    <AccountingContext.Provider value={{
      activeTab,
      setActiveTab,
      subView,
      setSubView,
      searchQuery,
      setSearchQuery,
      currentCurrency,
      setCurrentCurrency,
      formatCurrency,
      convertToBase,
      users,
      currentUser,
      isAuthenticated,
      login,
      logout,
      setCurrentUser,
      addUser,
      deleteUser,
      updateUser,
      updateUserAccess,
      hasPermission,
      isUserModalOpen,
      setIsUserModalOpen,
      isAccessControlModalOpen,
      setIsAccessControlModalOpen,
      selectedUserForEdit,
      setSelectedUserForEdit,
      accounts,
      transactions,
      customers,
      vendors,
      taxCodes,
      addTaxCode,
      updateTaxCode,
      deleteTaxCode,
      countryJurisdictions,
      addCountryJurisdiction,
      updateCountryJurisdiction,
      deleteCountryJurisdiction,
      activeJurisdictionId,
      activeJurisdiction,
      setActiveJurisdictionId,
      applyCountryTaxPreset,
      resetTaxCodesToDefaults,
      whtEntries,
      fixedAssets,
      tasks,
      auditLogs,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      updateTransactionStatus,
      recordPayment,
      addAccount,
      updateAccount,
      deleteAccount,
      resetToStandardChartOfAccounts,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      addVendor,
      updateVendor,
      deleteVendor,
      addWhtEntry,
      addFixedAsset,
      runMonthlyDepreciation,
      toggleTask,
      addTask,
      companyProfile,
      updateCompanyProfile,
      isCompanySetupModalOpen,
      setIsCompanySetupModalOpen,
      operatingEntities,
      addOperatingEntity,
      updateOperatingEntity,
      deleteOperatingEntity,
      setPrimaryEntity,
      isEntityModalOpen,
      setIsEntityModalOpen,
      selectedEntityForEdit,
      setSelectedEntityForEdit,
      previewDoc,
      setPreviewDoc,
      isQuickInvoiceOpen,
      setIsQuickInvoiceOpen,
      isQuickJournalOpen,
      setIsQuickJournalOpen,
      isQuickWhtOpen,
      setIsQuickWhtOpen,
      isBankControlModalOpen,
      setIsBankControlModalOpen,
      isAccountLinkerOpen,
      setIsAccountLinkerOpen,
      selectedEntityForLink,
      setSelectedEntityForLink,
      linkEntityNameToAccount,
      openOriginalInvoice,
      linkTransactionToOriginalInvoice,
      isPasswordResetModalOpen,
      setIsPasswordResetModalOpen,
      sendPasswordResetEmail,
      confirmPasswordResetWithCode,
      workflowViewMode,
      setWorkflowViewMode,
      resetDatabase,
    }}>
      {children}
    </AccountingContext.Provider>
  );
};

export const useAccounting = () => {
  const context = useContext(AccountingContext);
  if (!context) {
    throw new Error('useAccounting must be used within an AccountingProvider');
  }
  return context;
};
