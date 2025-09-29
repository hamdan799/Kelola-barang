import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { TrendingUp, TrendingDown, Package, Plus, Star, DollarSign, ShoppingCart, X, Save } from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import type { StockLog, Receipt, Category, Product } from '../types/inventory'
import type { Transaction } from '../types/financial'

interface FinalDashboardProps {
  stockLogs: StockLog[]
  receipts: Receipt[]
  transactions: Transaction[]
  categories: Category[]
  products: Product[]
  onNavigateToFinancial: () => void
  onNavigateToTransaction: () => void
  onTransactionAdded: (transaction: Transaction) => void
  draftTransaction?: Partial<Transaction> | null
  onDraftTransactionSave?: (draft: Partial<Transaction>) => void
}

export function FinalDashboard({ 
  stockLogs, 
  receipts, 
  transactions,
  categories,
  products,
  onNavigateToFinancial,
  onNavigateToTransaction,
  onTransactionAdded,
  draftTransaction,
  onDraftTransactionSave
}: FinalDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('bulan')
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    type: 'pemasukan',
    nominal: 0,
    hargaPokok: 0,
    catatan: '',
    kategori: '',
    tanggal: new Date(),
    customerName: '',
    customerPhone: '',
    paymentStatus: 'lunas'
  })

  // Load draft transaction when modal opens
  useEffect(() => {
    if (isTransactionModalOpen && draftTransaction) {
      setNewTransaction(draftTransaction)
      // Restore category and product selection if available
      if (draftTransaction.kategori) {
        const category = categories.find(c => c.name === draftTransaction.kategori)
        if (category) {
          setSelectedCategoryId(category.id)
        }
      }
    }
  }, [isTransactionModalOpen, draftTransaction, categories])

  // Auto-save draft when form changes
  useEffect(() => {
    if (isTransactionModalOpen && onDraftTransactionSave) {
      const timer = setTimeout(() => {
        if (newTransaction.nominal || newTransaction.catatan || newTransaction.customerName) {
          onDraftTransactionSave(newTransaction)
        }
      }, 2000) // Auto-save after 2 seconds of no changes

      return () => clearTimeout(timer)
    }
  }, [newTransaction, isTransactionModalOpen, onDraftTransactionSave])

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Filter data based on selected period
  const filterByPeriod = (date: Date) => {
    const now = new Date()
    const itemDate = new Date(date)
    
    switch (selectedPeriod) {
      case 'hari':
        return itemDate.toDateString() === now.toDateString()
      case 'minggu':
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
        return itemDate >= weekStart
      case 'bulan':
        return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear()
      case 'tahun':
        return itemDate.getFullYear() === now.getFullYear()
      case 'semua':
        return true
      default:
        return true
    }
  }

  const filteredReceipts = receipts.filter(r => filterByPeriod(r.tanggal))
  const filteredTransactions = transactions.filter(t => filterByPeriod(t.tanggal))
  const filteredStockLogs = stockLogs.filter(log => filterByPeriod(log.tanggal))

  // Calculate financial data
  const totalRevenue = filteredReceipts.reduce((sum, receipt) => sum + receipt.total, 0) +
                     filteredTransactions.filter(t => t.type === 'pemasukan').reduce((sum, t) => sum + t.nominal, 0)
  
  // Total expenses = regular expenses + cost of goods sold (harga modal)
  const regularExpenses = filteredTransactions.filter(t => t.type === 'pengeluaran').reduce((sum, t) => sum + t.nominal, 0)
  const costOfGoodsSold = filteredTransactions
    .filter(t => t.type === 'pemasukan')
    .reduce((sum, t) => sum + (t.totalCost || 0), 0)
  const totalExpenses = regularExpenses + costOfGoodsSold
  const totalProfit = totalRevenue - totalExpenses

  // Calculate stock movement
  const totalStockIn = filteredStockLogs
    .filter(log => log.type === 'masuk')
    .reduce((sum, log) => sum + log.jumlah, 0)
  
  const totalStockOut = filteredStockLogs
    .filter(log => log.type === 'keluar' && !log.reference.includes('Hapus Produk'))
    .reduce((sum, log) => sum + log.jumlah, 0)

  // Best sellers mock data
  const bestSellers = [
    { nama: 'Smartphone Samsung Galaxy', kategori: 'Elektronik', jumlahTerjual: 25, revenue: 125000000 },
    { nama: 'Laptop Asus VivoBook', kategori: 'Elektronik', jumlahTerjual: 15, revenue: 127500000 },
    { nama: 'Headphone Sony', kategori: 'Elektronik', jumlahTerjual: 30, revenue: 135000000 },
  ]

  const handleCategoryChange = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    setSelectedCategoryId(categoryId)
    setSelectedProductId('') // Reset product selection when category changes
    
    if (category && categoryId !== 'manual') {
      setNewTransaction({
        ...newTransaction,
        kategori: category.name,
        nominal: 0, // Reset nominal when category changes
        hargaPokok: 0 // Reset harga pokok when category changes
      })
    } else {
      setNewTransaction({
        ...newTransaction,
        kategori: '',
        nominal: 0,
        hargaPokok: 0
      })
    }
  }

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId)
    setSelectedProductId(productId)
    
    if (product && productId !== 'manual') {
      setNewTransaction({
        ...newTransaction,
        nominal: product.price || 0,
        hargaPokok: product.cost || product.price * 0.7 || 0, // Use cost or 70% of price as fallback
        catatan: newTransaction.catatan || product.name // Auto-fill catatan with product name if empty
      })
    } else {
      // Reset to previous values if manual is selected
      setNewTransaction({
        ...newTransaction,
        nominal: 0,
        hargaPokok: 0
      })
    }
  }

  // Filter products based on selected category
  const filteredProducts = selectedCategoryId && selectedCategoryId !== 'manual' 
    ? products.filter(p => p.categoryId === selectedCategoryId || p.category === categories.find(c => c.id === selectedCategoryId)?.name)
    : []

  const handleAddTransaction = () => {
    if (newTransaction.nominal && newTransaction.catatan) {
      try {
        const transaction: Transaction = {
          id: Date.now().toString(),
          transactionNumber: `TRX-${Date.now()}`,
          type: newTransaction.type as 'pemasukan' | 'pengeluaran',
          items: [], // Will be populated if needed
          nominal: newTransaction.nominal,
          totalCost: newTransaction.hargaPokok || 0,
          profit: newTransaction.type === 'pemasukan' ? (newTransaction.nominal - (newTransaction.hargaPokok || 0)) : 0,
          catatan: newTransaction.catatan,
          kategori: newTransaction.kategori,
          tanggal: newTransaction.tanggal || new Date(),
          customerName: newTransaction.customerName,
          customerPhone: newTransaction.customerPhone,
          paymentStatus: newTransaction.paymentStatus as 'lunas' | 'hutang' | 'sebagian',
          createdAt: new Date()
        }

        onTransactionAdded(transaction)
        
        toast.success('Transaksi berhasil disimpan!', {
          description: `${transaction.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'} sebesar ${formatRupiah(transaction.nominal)}`
        })
        
        // Auto-refresh to show updated data
        setTimeout(() => {
          window.location.hash = Math.random().toString()
        }, 100)
        
        // Reset form
        setNewTransaction({
          type: 'pemasukan',
          nominal: 0,
          hargaPokok: 0,
          catatan: '',
          kategori: '',
          tanggal: new Date(),
          customerName: '',
          customerPhone: '',
          paymentStatus: 'lunas'
        })
        setSelectedCategoryId('')
        setSelectedProductId('')
        setIsTransactionModalOpen(false)
        
      } catch (error) {
        console.error('Error creating transaction:', error)
        toast.error('Gagal menyimpan transaksi!')
      }
    } else {
      toast.error('Mohon lengkapi nominal dan catatan transaksi!')
    }
  }

  const handleSaveDraft = () => {
    if (onDraftTransactionSave) {
      onDraftTransactionSave(newTransaction)
      toast.success('Draft transaksi disimpan!')
    }
  }

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Ringkasan keuangan dan performa bisnis</p>
        </div>
        
        {/* Transaction Modal */}
        <Dialog open={isTransactionModalOpen} onOpenChange={setIsTransactionModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md px-6 py-2">
              <Plus className="w-4 h-4 mr-2" />
              Transaksi
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tambah Transaksi</DialogTitle>
              <DialogDescription>Buat transaksi pemasukan atau pengeluaran baru</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* Transaction Type Toggle */}
              <div className="space-y-2">
                <Label>Jenis Transaksi</Label>
                <div className="flex rounded-lg overflow-hidden border border-border">
                  <button
                    type="button"
                    onClick={() => setNewTransaction({ ...newTransaction, type: 'pemasukan' })}
                    className={`flex-1 py-2 px-4 text-sm font-medium transition-all ${
                      newTransaction.type === 'pemasukan'
                        ? 'bg-green-500 text-white'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    Pemasukan
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTransaction({ ...newTransaction, type: 'pengeluaran' })}
                    className={`flex-1 py-2 px-4 text-sm font-medium transition-all ${
                      newTransaction.type === 'pengeluaran'
                        ? 'bg-red-500 text-white'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    Pengeluaran
                  </button>
                </div>
              </div>

              {/* Nominal */}
              <div className="space-y-2">
                <Label>Nominal</Label>
                <Input
                  type="number"
                  value={newTransaction.nominal || ''}
                  onChange={(e) => setNewTransaction({ ...newTransaction, nominal: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>

              {/* Harga Pokok */}
              {newTransaction.type === 'pemasukan' && (
                <div className="space-y-2">
                  <Label>Harga Pokok/Modal (Opsional)</Label>
                  <Input
                    type="number"
                    value={newTransaction.hargaPokok || ''}
                    onChange={(e) => setNewTransaction({ ...newTransaction, hargaPokok: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              )}

              {/* Catatan */}
              <div className="space-y-2">
                <Label>Catatan</Label>
                <Textarea
                  value={newTransaction.catatan || ''}
                  onChange={(e) => setNewTransaction({ ...newTransaction, catatan: e.target.value })}
                  placeholder="Deskripsi transaksi"
                  rows={2}
                />
              </div>

              {/* Payment Status Toggle - Smaller */}
              <div className="space-y-2">
                <Label>Status Pembayaran</Label>
                <div className="flex w-48 rounded-lg overflow-hidden border border-border">
                  <button
                    type="button"
                    onClick={() => setNewTransaction({ ...newTransaction, paymentStatus: 'hutang' })}
                    className={`flex-1 py-1.5 px-3 text-sm font-medium transition-all ${
                      newTransaction.paymentStatus === 'hutang'
                        ? 'bg-red-500 text-white'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    Hutang
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTransaction({ ...newTransaction, paymentStatus: 'lunas' })}
                    className={`flex-1 py-1.5 px-3 text-sm font-medium transition-all ${
                      newTransaction.paymentStatus === 'lunas'
                        ? 'bg-green-500 text-white'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    Lunas
                  </button>
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Kategori (Opsional)</Label>
                <Select
                  value={selectedCategoryId || 'manual'}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual Entry</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Product - only show if category is selected and not manual */}
              {selectedCategoryId && selectedCategoryId !== 'manual' && filteredProducts.length > 0 && (
                <div className="space-y-2">
                  <Label>Produk (Opsional)</Label>
                  <Select
                    value={selectedProductId || 'manual'}
                    onValueChange={handleProductChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih produk" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual Entry</SelectItem>
                      {filteredProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - {formatRupiah(product.price)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Date */}
              <div className="space-y-2">
                <Label>Tanggal</Label>
                <Input
                  type="date"
                  value={newTransaction.tanggal ? new Date(newTransaction.tanggal).toISOString().split('T')[0] : ''}
                  onChange={(e) => setNewTransaction({ ...newTransaction, tanggal: new Date(e.target.value) })}
                />
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Nama Customer</Label>
                  <Input
                    value={newTransaction.customerName || ''}
                    onChange={(e) => setNewTransaction({ ...newTransaction, customerName: e.target.value })}
                    placeholder="Nama"
                  />
                </div>
                <div className="space-y-2">
                  <Label>No. Telepon</Label>
                  <Input
                    value={newTransaction.customerPhone || ''}
                    onChange={(e) => setNewTransaction({ ...newTransaction, customerPhone: e.target.value })}
                    placeholder="Telepon"
                  />
                </div>
              </div>
            </div>

            {/* Save Button at Bottom */}
            <div className="flex justify-between pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={handleSaveDraft}
                disabled={!newTransaction.nominal && !newTransaction.catatan}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Simpan Draft
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setIsTransactionModalOpen(false)}>
                  Batal
                </Button>
                <Button 
                  onClick={handleAddTransaction}
                  disabled={!newTransaction.nominal || !newTransaction.catatan}
                >
                  Simpan Transaksi
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Compact Period Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Periode:</span>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-32 h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hari">Hari ini</SelectItem>
            <SelectItem value="minggu">Minggu</SelectItem>
            <SelectItem value="bulan">Bulan</SelectItem>
            <SelectItem value="tahun">Tahun</SelectItem>
            <SelectItem value="semua">Semua</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Financial Summary - Exact Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onNavigateToFinancial}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Penjualan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatRupiah(totalRevenue)}</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onNavigateToFinancial}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              Pengeluaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatRupiah(totalExpenses)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Profit Card - Full Width */}
      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onNavigateToFinancial}>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-blue-600" />
            Profit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600">{formatRupiah(totalProfit)}</div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Sellers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Best Sellers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bestSellers.map((product, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{product.nama}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{product.kategori}</Badge>
                      <span className="text-xs text-muted-foreground">{product.jumlahTerjual} terjual</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600 text-sm">{formatRupiah(product.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stock Summary */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Ringkasan Stok</h2>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Package className="h-4 w-4 text-green-600" />
                  Barang Masuk
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-green-600">+{totalStockIn}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-red-600" />
                  Barang Keluar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-red-600">-{totalStockOut}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}