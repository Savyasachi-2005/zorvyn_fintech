export type UserRole = 'viewer' | 'analyst' | 'admin';

// Matches backend UserPublic schema (snake_case from API)
export interface UserFromAPI {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Normalized frontend user
export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export function normalizeUser(raw: UserFromAPI): User {
  return {
    id: raw.id,
    name: raw.full_name,
    email: raw.email,
    role: raw.role,
    isActive: raw.is_active,
    createdAt: raw.created_at,
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  full_name: string;
  email: string;
  password: string;
}

export type RecordType = 'income' | 'expense';

// Matches backend RecordPublic schema
export interface RecordFromAPI {
  id: number;
  amount: number;
  type: RecordType;
  category: string;
  date: string;
  notes: string | null;
  user_id: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

// Normalized frontend record
export interface Record {
  id: number;
  amount: number;
  type: RecordType;
  category: string;
  date: string;
  notes: string | null;
  userId: number;
  userName?: string;
}

export function normalizeRecord(raw: RecordFromAPI): Record {
  return {
    id: raw.id,
    amount: Number(raw.amount),
    type: raw.type,
    category: raw.category,
    date: raw.date,
    notes: raw.notes,
    userId: raw.user_id,
  };
}

// Backend pagination response
export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}

// Backend dashboard summary response
export interface SummaryFromAPI {
  total_income: number;
  total_expense: number;
  balance: number;
}

export interface SummaryData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  recordCount: number;
}

export function normalizeSummary(raw: SummaryFromAPI, recordCount?: number): SummaryData {
  return {
    totalIncome: raw.total_income,
    totalExpense: raw.total_expense,
    balance: raw.balance,
    recordCount: recordCount ?? 0,
  };
}

// Backend trends response: [{month, type, total}]
export interface TrendRowFromAPI {
  month: string;
  type: 'income' | 'expense';
  total: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expense: number;
}

export function normalizeTrends(rows: TrendRowFromAPI[]): MonthlyTrend[] {
  const map = new Map<string, MonthlyTrend>();
  for (const row of rows) {
    const label = row.month;
    if (!map.has(label)) {
      map.set(label, { month: label, income: 0, expense: 0 });
    }
    const entry = map.get(label)!;
    if (row.type === 'income') entry.income = row.total;
    else entry.expense = row.total;
  }
  return Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month));
}

// Backend category response: [{category, total}]
export interface CategoryFromAPI {
  category: string;
  total: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  fill: string;
}

const CATEGORY_COLORS = ['#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#ec4899', '#6366f1'];

export function normalizeCategories(rows: CategoryFromAPI[]): CategoryBreakdown[] {
  const grandTotal = rows.reduce((sum, r) => sum + r.total, 0) || 1;
  return rows.map((r, i) => ({
    category: r.category,
    amount: r.total,
    percentage: Math.round((r.total / grandTotal) * 100),
    fill: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));
}

export interface AnalyticsData {
  monthlyTrends: MonthlyTrend[];
  categoryBreakdown: CategoryBreakdown[];
  summary: SummaryData;
}

export interface RecordFilters {
  category?: string;
  type?: RecordType | '';
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// JWT payload from backend
export interface JWTPayload {
  sub: string;  // user_id as string
  role: UserRole;
  exp: number;
}
