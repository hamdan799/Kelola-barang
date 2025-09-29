import { useState, useEffect } from 'react'
import { EnhancedSidebar } from './components/EnhancedSidebar'
import { FinalDashboard } from './components/FinalDashboard'
import { RevisedProductManagement } from './components/RevisedProductManagement'
import { StockReports } from './components/StockReports'
import { UltimateFinancialReport } from './components/UltimateFinancialReport'
import { UltimateTransactionPage } from './components/UltimateTransactionPage'
import { UltimateDebtManagement } from './components/UltimateDebtManagement'
import { EnhancedSettings } from './components/EnhancedSettings'
import { Toaster } from './components/ui/sonner'
import { toast } from 'sonner@2.0.3'
import type { StockLog, Receipt, Category, Product } from './types/inventory'
import type { Transaction, Debt, DebtTransaction } from './types/financial'

export default function App() {
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [stockLogs, setStockLogs] = useState<StockLog[]>([])
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [debts, setDebts] = useState<Debt[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [draftTransaction, setDraftTransaction] = useState<Partial<Transaction> | null>(null)
  const [storeName, setStoreName] = useState<string>('')
  const [storeLogo, setStoreLogo] = useState<string>('')
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('')

  // Auto-save data to localStorage
  useEffect(() => {
    const saveData = () => {
      try {
        localStorage.setItem('inventory_stockLogs', JSON.stringify(stockLogs))
        localStorage.setItem('inventory_receipts', JSON.stringify(receipts))
        localStorage.setItem('inventory_transactions', JSON.stringify(transactions))
        localStorage.setItem('inventory_debts', JSON.stringify(debts))
        localStorage.setItem('inventory_categories', JSON.stringify(categories))
        localStorage.setItem('inventory_products', JSON.stringify(products))
      } catch (error) {
        console.error('Failed to save data:', error)
      }
    }

    const debounceTimer = setTimeout(saveData, 1000)
    return () => clearTimeout(debounceTimer)
  }, [stockLogs, receipts, transactions, debts, categories, products])

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedStockLogs = localStorage.getItem('inventory_stockLogs')
      const savedReceipts = localStorage.getItem('inventory_receipts')
      const savedTransactions = localStorage.getItem('inventory_transactions')
      const savedDebts = localStorage.getItem('inventory_debts')
      const savedCategories = localStorage.getItem('inventory_categories')
      const savedProducts = localStorage.getItem('inventory_products')
      const savedDraft = localStorage.getItem('inventory_draftTransaction')

      if (savedStockLogs) setStockLogs(JSON.parse(savedStockLogs))
      if (savedReceipts) setReceipts(JSON.parse(savedReceipts))
      if (savedTransactions) setTransactions(JSON.parse(savedTransactions))
      if (savedDebts) setDebts(JSON.parse(savedDebts))
      if (savedCategories) setCategories(JSON.parse(savedCategories))
      if (savedProducts) setProducts(JSON.parse(savedProducts))
      if (savedDraft) setDraftTransaction(JSON.parse(savedDraft))
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }, [])

  const handleStockLogAdded = (log: StockLog) => {
    setStockLogs(prev => [log, ...prev])
  }

  const handleReceiptGenerated = (receipt: Receipt) => {
    setReceipts(prev => [receipt, ...prev])
  }

  const handleTransactionAdded = (transaction: Transaction) => {
    try {
      setTransactions(prev => [transaction, ...prev])
      
      // Handle stock reduction for products in the transaction
      if (transaction.type === 'pemasukan') {
        // Check if there's a product involved and reduce stock
        const transactionProductName = transaction.catatan?.toLowerCase()
        const matchingProduct = products.find(p => 
          transactionProductName?.includes(p.name.toLowerCase())
        )
        
        if (matchingProduct && matchingProduct.stock > 0) {
          setProducts(prev => prev.map(p => 
            p.id === matchingProduct.id 
              ? { ...p, stock: Math.max(0, p.stock - 1), updatedAt: new Date() }
              : p
          ))
          
          // Create stock log for the transaction
          const stockLog: StockLog = {
            id: Date.now().toString(),
            productId: matchingProduct.id,
            productName: matchingProduct.name,
            jumlah: 1,
            type: 'keluar',
            reference: `Transaksi: ${transaction.catatan}`,
            tanggal: transaction.tanggal,
            createdAt: new Date()
          }
          setStockLogs(prev => [stockLog, ...prev])
        }
      }
      
      // If it's a debt transaction, also handle debt tracking
      if (transaction.paymentStatus === 'hutang' && transaction.customerName) {
        const existingDebt = debts.find(d => d.customerName === transaction.customerName)
        
        if (existingDebt) {
          // Update existing debt
          const updatedDebt = {
            ...existingDebt,
            totalDebt: existingDebt.totalDebt + transaction.nominal,
            updatedAt: new Date()
          }
          
          const debtTransaction: DebtTransaction = {
            id: Date.now().toString(),
            debtId: existingDebt.id,
            type: 'memberi' as const,
            amount: transaction.nominal,
            catatan: transaction.catatan,
            tanggal: transaction.tanggal,
            createdAt: new Date()
          }
          
          updatedDebt.transactions.push(debtTransaction)
          setDebts(prev => prev.map(d => d.id === existingDebt.id ? updatedDebt : d))
        } else {
          // Create new debt
          const newDebt: Debt = {
            id: Date.now().toString(),
            customerName: transaction.customerName,
            customerPhone: transaction.customerPhone,
            totalDebt: transaction.nominal,
            transactions: [{
              id: Date.now().toString(),
              debtId: Date.now().toString(),
              type: 'memberi',
              amount: transaction.nominal,
              catatan: transaction.catatan,
              tanggal: transaction.tanggal,
              createdAt: new Date()
            }],
            createdAt: new Date(),
            updatedAt: new Date()
          }
          setDebts(prev => [newDebt, ...prev])
        }
      }
      
      // Clear draft transaction
      setDraftTransaction(null)
      localStorage.removeItem('inventory_draftTransaction')
      
      // Show success toast
      toast.success('Transaksi berhasil disimpan!', {
        description: `${transaction.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'} sebesar ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(transaction.nominal)}`
      })
      
    } catch (error) {
      console.error('Error adding transaction:', error)
      toast.error('Gagal menyimpan transaksi!', {
        description: 'Terjadi kesalahan saat menyimpan data.'
      })
    }
  }

  const handleDebtUpdated = (debt: Debt) => {
    setDebts(prev => {
      const existing = prev.find(d => d.id === debt.id)
      if (existing) {
        return prev.map(d => d.id === debt.id ? debt : d)
      } else {
        return [debt, ...prev]
      }
    })
  }

  const handleDebtTransactionAdded = (debtId: string, transaction: DebtTransaction) => {
    setDebts(prev => prev.map(debt => {
      if (debt.id === debtId) {
        const updatedDebt = {
          ...debt,
          totalDebt: transaction.type === 'memberi' 
            ? debt.totalDebt + transaction.amount
            : Math.max(0, debt.totalDebt - transaction.amount),
          transactions: [transaction, ...debt.transactions],
          updatedAt: new Date()
        }
        return updatedDebt
      }
      return debt
    }))
  }

  const handleCategoriesUpdated = (updatedCategories: Category[]) => {
    setCategories(updatedCategories)
    toast.success('Kategori berhasil diperbarui!')
  }

  const handleProductsUpdated = (updatedProducts: Product[]) => {
    setProducts(updatedProducts)
    toast.success('Produk berhasil diperbarui!')
  }

  const handleDraftTransactionSave = (draft: Partial<Transaction>) => {
    setDraftTransaction(draft)
    localStorage.setItem('inventory_draftTransaction', JSON.stringify(draft))
  }

  const handleTransactionUpdated = (transaction: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === transaction.id ? transaction : t))
    // Note: toast is handled in the component calling this function
  }

  const handleTransactionDeleted = (transactionId: string) => {
    setTransactions(prev => prev.filter(t => t.id !== transactionId))
    // Note: toast is handled in the component calling this function
  }

  const handleDebtDeleted = (debtId: string) => {
    setDebts(prev => prev.filter(d => d.id !== debtId))
  }

  const handleNavigateToFinancial = () => {
    setActiveMenu('keuangan')
  }

  const handleNavigateToTransaction = () => {
    setActiveMenu('transaksi')
  }

  const handleStoreNameChange = (name: string) => {
    setStoreName(name)
  }

  const handleLogoChange = (logo: string) => {
    setStoreLogo(logo)
  }

  const handleGlobalSearch = (query: string) => {
    setGlobalSearchQuery(query)
    // Implement global search logic here
    if (query.trim()) {
      // Search across products, transactions, customers, etc.
      const searchResults = {
        products: products.filter(p => 
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.description?.toLowerCase().includes(query.toLowerCase())
        ),
        transactions: transactions.filter(t => 
          t.catatan?.toLowerCase().includes(query.toLowerCase()) ||
          t.customerName?.toLowerCase().includes(query.toLowerCase()) ||
          t.transactionNumber?.toLowerCase().includes(query.toLowerCase())
        ),
        customers: debts.filter(d => 
          d.customerName.toLowerCase().includes(query.toLowerCase())
        )
      }
      
      if (searchResults.products.length > 0 || searchResults.transactions.length > 0) {
        toast.info(`Ditemukan ${searchResults.products.length} produk, ${searchResults.transactions.length} transaksi`)
      }
    }
  }

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return (
          <FinalDashboard 
            stockLogs={stockLogs}
            receipts={receipts}
            transactions={transactions}
            categories={categories}
            products={products}
            onNavigateToFinancial={handleNavigateToFinancial}
            onNavigateToTransaction={handleNavigateToTransaction}
            onTransactionAdded={handleTransactionAdded}
            draftTransaction={draftTransaction}
            onDraftTransactionSave={handleDraftTransactionSave}
          />
        )
      case 'barang':
        return (
          <RevisedProductManagement 
            onStockLogAdded={handleStockLogAdded}
            onReceiptGenerated={handleReceiptGenerated}
            onCategoriesUpdated={handleCategoriesUpdated}
            onProductsUpdated={handleProductsUpdated}
            categories={categories}
            products={products}
          />
        )
      case 'laporan':
        return <StockReports stockLogs={stockLogs} receipts={receipts} />
      case 'transaksi':
        return (
          <UltimateTransactionPage 
            transactions={transactions}
            categories={categories}
            products={products}
            onTransactionAdded={handleTransactionAdded}
            onTransactionUpdated={handleTransactionUpdated}
            onTransactionDeleted={handleTransactionDeleted}
            onProductsUpdated={handleProductsUpdated}
          />
        )
      case 'hutang-piutang':
        return (
          <UltimateDebtManagement 
            debts={debts}
            onDebtUpdated={handleDebtUpdated}
            onDebtTransactionAdded={handleDebtTransactionAdded}
            onDebtDeleted={handleDebtDeleted}
          />
        )
      case 'keuangan':
        return <UltimateFinancialReport receipts={receipts} transactions={transactions} />
      case 'pengaturan':
        return (
          <EnhancedSettings 
            onStoreNameChange={handleStoreNameChange}
            onLogoChange={handleLogoChange}
          />
        )
      default:
        return (
          <FinalDashboard 
            stockLogs={stockLogs}
            receipts={receipts}
            transactions={transactions}
            categories={categories}
            products={products}
            onNavigateToFinancial={handleNavigateToFinancial}
            onNavigateToTransaction={handleNavigateToTransaction}
            onTransactionAdded={handleTransactionAdded}
            draftTransaction={draftTransaction}
            onDraftTransactionSave={handleDraftTransactionSave}
          />
        )
    }
  }

  return (
    <div className="flex h-screen bg-background custom-scrollbar">
      <EnhancedSidebar 
        activeMenu={activeMenu} 
        setActiveMenu={setActiveMenu}
        storeName={storeName}
        storeLogo={storeLogo}
        onGlobalSearch={handleGlobalSearch}
      />
      <div className="flex-1 overflow-auto custom-scrollbar">
        {renderContent()}
      </div>
      <Toaster position="top-right" />
    </div>
  )
}