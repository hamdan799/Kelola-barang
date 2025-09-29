export interface TransactionItem {
  id: string
  productId?: string
  productName: string
  quantity: number
  unitPrice: number
  unitCost?: number
  total: number
}

export interface Transaction {
  id: string
  transactionNumber: string // Unique transaction ID
  type: 'pemasukan' | 'pengeluaran'
  items: TransactionItem[] // Support multi-product
  nominal: number
  totalCost?: number
  profit?: number
  catatan: string
  kategori?: string
  tanggal: Date
  customerName?: string
  customerPhone?: string
  paymentStatus: 'lunas' | 'hutang' | 'sebagian'
  paidAmount?: number
  createdAt: Date
  updatedAt?: Date
  createdBy?: string // For multi-user support
}

export interface Debt {
  id: string
  customerName: string
  customerPhone?: string
  totalDebt: number
  dueDate?: Date
  transactions: DebtTransaction[]
  createdAt: Date
  updatedAt: Date
}

export interface DebtTransaction {
  id: string
  debtId: string
  type: 'memberi' | 'menerima'
  amount: number
  catatan: string
  tanggal: Date
  createdAt: Date
}

export interface Category {
  id: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface FinancialSummary {
  totalRevenue: number
  totalExpenses: number
  totalProfit: number
  totalDebt: number
  period: string
}