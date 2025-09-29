import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Textarea } from './ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { ScrollArea } from './ui/scroll-area'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog'
import { Separator } from './ui/separator'
import { Switch } from './ui/switch'
import { Progress } from './ui/progress'
import { Plus, Search, ArrowLeft, TrendingUp, TrendingDown, DollarSign, Edit, Trash2, Printer, Calculator as CalculatorIcon, Package, ShoppingCart, CreditCard, Banknote, Smartphone, X, Check, Save, FileText, Split, Layers } from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { Calculator } from './Calculator'
import type { Transaction, TransactionItem, Category } from '../types/financial'
import type { Product } from '../types/inventory'

interface TransactionBundle {
  id: string
  name: string
  description: string
  items: {
    productId: string
    quantity: number
  }[]
  totalPrice: number
  isActive: boolean
}

interface PaymentMethod {
  type: 'cash' | 'transfer' | 'card' | 'ewallet' | 'other'
  amount: number
  reference?: string
  account?: string
}

interface UltimateTransactionPageProps {
  transactions: Transaction[]
  categories: Category[]
  products: Product[]
  bundles?: TransactionBundle[]
  onTransactionAdded: (transaction: Transaction) => void
  onTransactionUpdated: (transaction: Transaction) => void
  onTransactionDeleted: (transactionId: string) => void
  onProductsUpdated?: (products: Product[]) => void
}

export function UltimateTransactionPage({ 
  transactions, 
  categories = [], 
  products = [],
  bundles = [],
  onTransactionAdded,
  onTransactionUpdated,
  onTransactionDeleted,
  onProductsUpdated
}: UltimateTransactionPageProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'pemasukan' | 'pengeluaran'>('all')
  const [selectedDateRange, setSelectedDateRange] = useState({ start: '', end: '' })
  const [showCalculator, setShowCalculator] = useState(false)
  const [isBundleMode, setIsBundleMode] = useState(false)
  const [selectedBundle, setSelectedBundle] = useState<TransactionBundle | null>(null)

  // Enhanced transaction form state
  const [transactionForm, setTransactionForm] = useState({
    type: 'pemasukan' as 'pemasukan' | 'pengeluaran',
    items: [] as TransactionItem[],
    customerName: '',
    customerPhone: '',
    paymentMethods: [{ type: 'cash', amount: 0 }] as PaymentMethod[],
    notes: '',
    discount: { type: 'none' as 'none' | 'percentage' | 'amount', value: 0 },
    tax: { rate: 0, amount: 0 },
    deliveryFee: 0,
    isDebt: false,
    dueDate: '',
    referenceNumber: ''
  })

  const [currentItem, setCurrentItem] = useState({
    productId: '',
    quantity: 1,
    unitPrice: 0,
    unitCost: 0,
    discount: { type: 'none' as 'none' | 'percentage' | 'amount', value: 0 },
    notes: ''
  })

  const [saveProgress, setSaveProgress] = useState({ isSaving: false, progress: 0, step: '' })

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '-'
    
    try {
      const dateObj = date instanceof Date ? date : new Date(date)
      if (isNaN(dateObj.getTime())) return '-'
      
      return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(dateObj)
    } catch (error) {
      return '-'
    }
  }

  // Load draft from localStorage
  useEffect(() => {
    const draft = localStorage.getItem('transaction_draft')
    if (draft && !editingTransaction) {
      try {
        const draftData = JSON.parse(draft)
        setTransactionForm(draftData)
        toast.info('Draft transaksi dimuat', {
          description: 'Melanjutkan transaksi yang tersimpan'
        })
      } catch (error) {
        console.error('Failed to load draft:', error)
      }
    }
  }, [editingTransaction])

  // Auto-save draft
  useEffect(() => {
    if (transactionForm.items.length > 0 || transactionForm.customerName || transactionForm.notes) {
      const timer = setTimeout(() => {
        localStorage.setItem('transaction_draft', JSON.stringify(transactionForm))
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [transactionForm])

  const addItemToTransaction = () => {
    if (!currentItem.productId || currentItem.quantity <= 0) {
      toast.error('Pilih produk dan masukkan jumlah yang valid!')
      return
    }

    const product = products.find(p => p.id === currentItem.productId)
    if (!product) {
      toast.error('Produk tidak ditemukan!')
      return
    }

    // Check stock availability
    if (product.stock < currentItem.quantity) {
      toast.error(`Stok tidak mencukupi! Tersedia: ${product.stock}`)
      return
    }

    const itemPrice = currentItem.unitPrice || product.price || 0
    const itemCost = currentItem.unitCost || product.cost || itemPrice * 0.7

    // Calculate discount
    let discountAmount = 0
    if (currentItem.discount.type === 'percentage') {
      discountAmount = (itemPrice * currentItem.quantity * currentItem.discount.value) / 100
    } else if (currentItem.discount.type === 'amount') {
      discountAmount = currentItem.discount.value
    }

    const finalPrice = (itemPrice * currentItem.quantity) - discountAmount

    const newItem: TransactionItem = {
      id: Date.now().toString(),
      productId: product.id,
      productName: product.name,
      categoryId: product.categoryId,
      quantity: currentItem.quantity,
      unitPrice: itemPrice,
      unitCost: itemCost,
      totalPrice: finalPrice,
      totalCost: itemCost * currentItem.quantity,
      discount: currentItem.discount,
      notes: currentItem.notes
    }

    setTransactionForm(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }))

    // Reset current item
    setCurrentItem({
      productId: '',
      quantity: 1,
      unitPrice: 0,
      unitCost: 0,
      discount: { type: 'none', value: 0 },
      notes: ''
    })

    toast.success('Item ditambahkan ke transaksi!')
  }

  const removeItemFromTransaction = (itemId: string) => {
    setTransactionForm(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }))
    toast.success('Item dihapus dari transaksi!')
  }

  const addBundle = (bundle: TransactionBundle) => {
    const bundleItems: TransactionItem[] = []
    let allStockAvailable = true

    // Check stock for all bundle items
    for (const bundleItem of bundle.items) {
      const product = products.find(p => p.id === bundleItem.productId)
      if (!product || product.stock < bundleItem.quantity) {
        allStockAvailable = false
        toast.error(`Stok ${product?.name || 'produk'} tidak mencukupi untuk bundle!`)
        break
      }
    }

    if (!allStockAvailable) return

    // Add all bundle items
    for (const bundleItem of bundle.items) {
      const product = products.find(p => p.id === bundleItem.productId)!
      
      const item: TransactionItem = {
        id: `${Date.now()}_${bundleItem.productId}`,
        productId: product.id,
        productName: product.name,
        categoryId: product.categoryId,
        quantity: bundleItem.quantity,
        unitPrice: product.price || 0,
        unitCost: product.cost || (product.price || 0) * 0.7,
        totalPrice: (product.price || 0) * bundleItem.quantity,
        totalCost: (product.cost || (product.price || 0) * 0.7) * bundleItem.quantity,
        discount: { type: 'none', value: 0 },
        notes: `Bundle: ${bundle.name}`,
        bundleId: bundle.id
      }

      bundleItems.push(item)
    }

    setTransactionForm(prev => ({
      ...prev,
      items: [...prev.items, ...bundleItems]
    }))

    toast.success(`Bundle "${bundle.name}" ditambahkan!`)
  }

  const calculateTransactionTotals = () => {
    const subtotal = transactionForm.items.reduce((sum, item) => sum + item.totalPrice, 0)
    const totalCost = transactionForm.items.reduce((sum, item) => sum + item.totalCost, 0)
    
    // Calculate discount
    let discountAmount = 0
    if (transactionForm.discount.type === 'percentage') {
      discountAmount = (subtotal * transactionForm.discount.value) / 100
    } else if (transactionForm.discount.type === 'amount') {
      discountAmount = transactionForm.discount.value
    }

    const afterDiscount = subtotal - discountAmount
    const taxAmount = (afterDiscount * transactionForm.tax.rate) / 100
    const total = afterDiscount + taxAmount + transactionForm.deliveryFee

    const totalPayment = transactionForm.paymentMethods.reduce((sum, method) => sum + method.amount, 0)
    const change = totalPayment - total

    return {
      subtotal,
      totalCost,
      discountAmount,
      taxAmount,
      total,
      totalPayment,
      change,
      profit: total - totalCost
    }
  }

  const validateTransaction = () => {
    if (transactionForm.items.length === 0) {
      toast.error('Tambahkan minimal satu item!')
      return false
    }

    const totals = calculateTransactionTotals()
    
    if (!transactionForm.isDebt && totals.totalPayment < totals.total) {
      toast.error('Pembayaran kurang dari total!')
      return false
    }

    // Check stock availability again before saving
    for (const item of transactionForm.items) {
      const product = products.find(p => p.id === item.productId)
      if (!product || product.stock < item.quantity) {
        toast.error(`Stok ${item.productName} tidak mencukupi!`)
        return false
      }
    }

    return true
  }

  const saveTransaction = async () => {
    if (!validateTransaction()) return

    setSaveProgress({ isSaving: true, progress: 10, step: 'Validating data...' })

    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      setSaveProgress({ isSaving: true, progress: 30, step: 'Processing items...' })

      const totals = calculateTransactionTotals()
      
      const transaction: Transaction = {
        id: editingTransaction?.id || Date.now().toString(),
        transactionNumber: editingTransaction?.transactionNumber || `TRX-${Date.now()}`,
        type: transactionForm.type,
        items: transactionForm.items,
        nominal: totals.total,
        totalCost: totals.totalCost,
        profit: totals.profit,
        discount: transactionForm.discount,
        tax: { rate: transactionForm.tax.rate, amount: totals.taxAmount },
        deliveryFee: transactionForm.deliveryFee,
        paymentMethods: transactionForm.paymentMethods,
        customerName: transactionForm.customerName,
        customerPhone: transactionForm.customerPhone,
        paymentStatus: transactionForm.isDebt ? 'hutang' : 'lunas',
        dueDate: transactionForm.dueDate ? new Date(transactionForm.dueDate) : undefined,
        catatan: transactionForm.notes,
        tanggal: new Date(),
        createdAt: editingTransaction?.createdAt || new Date(),
        updatedAt: editingTransaction ? new Date() : undefined,
        createdBy: 'Current User',
        referenceNumber: transactionForm.referenceNumber
      }

      setSaveProgress({ isSaving: true, progress: 60, step: 'Updating stock...' })
      await new Promise(resolve => setTimeout(resolve, 300))

      // Update product stock
      if (transactionForm.type === 'pemasukan' && onProductsUpdated) {
        const updatedProducts = products.map(product => {
          const transactionItem = transactionForm.items.find(item => item.productId === product.id)
          if (transactionItem) {
            return {
              ...product,
              stock: Math.max(0, product.stock - transactionItem.quantity),
              updatedAt: new Date()
            }
          }
          return product
        })
        onProductsUpdated(updatedProducts)
      }

      setSaveProgress({ isSaving: true, progress: 80, step: 'Saving transaction...' })
      await new Promise(resolve => setTimeout(resolve, 300))

      if (editingTransaction) {
        onTransactionUpdated(transaction)
        toast.success('Transaksi berhasil diperbarui!', {
          description: `${transaction.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'} sebesar ${formatRupiah(transaction.nominal)}`
        })
      } else {
        onTransactionAdded(transaction)
        toast.success('Transaksi berhasil disimpan!', {
          description: `${transaction.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'} sebesar ${formatRupiah(transaction.nominal)}`
        })
      }

      setSaveProgress({ isSaving: true, progress: 100, step: 'Complete!' })
      
      // Clear draft and reset form
      localStorage.removeItem('transaction_draft')
      resetForm()
      setEditingTransaction(null)
      setIsFormOpen(false)
      
      setTimeout(() => {
        setSaveProgress({ isSaving: false, progress: 0, step: '' })
      }, 1000)

    } catch (error) {
      console.error('Error saving transaction:', error)
      toast.error('Gagal menyimpan transaksi!', {
        description: 'Terjadi kesalahan saat menyimpan data.'
      })
      setSaveProgress({ isSaving: false, progress: 0, step: '' })
    }
  }

  const resetForm = () => {
    setTransactionForm({
      type: 'pemasukan',
      items: [],
      customerName: '',
      customerPhone: '',
      paymentMethods: [{ type: 'cash', amount: 0 }],
      notes: '',
      discount: { type: 'none', value: 0 },
      tax: { rate: 0, amount: 0 },
      deliveryFee: 0,
      isDebt: false,
      dueDate: '',
      referenceNumber: ''
    })
    setCurrentItem({
      productId: '',
      quantity: 1,
      unitPrice: 0,
      unitCost: 0,
      discount: { type: 'none', value: 0 },
      notes: ''
    })
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setTransactionForm({
      type: transaction.type,
      items: transaction.items || [],
      customerName: transaction.customerName || '',
      customerPhone: transaction.customerPhone || '',
      paymentMethods: transaction.paymentMethods || [{ type: 'cash', amount: transaction.nominal }],
      notes: transaction.catatan || '',
      discount: transaction.discount || { type: 'none', value: 0 },
      tax: transaction.tax || { rate: 0, amount: 0 },
      deliveryFee: transaction.deliveryFee || 0,
      isDebt: transaction.paymentStatus === 'hutang',
      dueDate: transaction.dueDate ? new Date(transaction.dueDate).toISOString().split('T')[0] : '',
      referenceNumber: transaction.referenceNumber || ''
    })
    setIsFormOpen(true)
  }

  const handleDeleteTransaction = (transactionId: string) => {
    try {
      onTransactionDeleted(transactionId)
      toast.success('Transaksi berhasil dihapus!')
    } catch (error) {
      console.error('Error deleting transaction:', error)
      toast.error('Gagal menghapus transaksi!')
    }
  }

  const addPaymentMethod = () => {
    setTransactionForm(prev => ({
      ...prev,
      paymentMethods: [...prev.paymentMethods, { type: 'cash', amount: 0 }]
    }))
  }

  const updatePaymentMethod = (index: number, field: keyof PaymentMethod, value: any) => {
    setTransactionForm(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map((method, i) => 
        i === index ? { ...method, [field]: value } : method
      )
    }))
  }

  const removePaymentMethod = (index: number) => {
    if (transactionForm.paymentMethods.length > 1) {
      setTransactionForm(prev => ({
        ...prev,
        paymentMethods: prev.paymentMethods.filter((_, i) => i !== index)
      }))
    }
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = searchTerm === '' || 
      transaction.catatan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.transactionNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === 'all' || transaction.type === filterType
    
    let matchesDate = true
    if (selectedDateRange.start && selectedDateRange.end) {
      const transactionDate = new Date(transaction.tanggal)
      const startDate = new Date(selectedDateRange.start)
      const endDate = new Date(selectedDateRange.end)
      matchesDate = transactionDate >= startDate && transactionDate <= endDate
    }
    
    return matchesSearch && matchesType && matchesDate
  })

  const totals = calculateTransactionTotals()

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Transaksi</h1>
          <p className="text-muted-foreground mt-1">Kelola transaksi pemasukan dan pengeluaran</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCalculator(true)} variant="outline" size="sm">
            <CalculatorIcon className="w-4 h-4 mr-2" />
            Kalkulator
          </Button>
          <Button onClick={() => { resetForm(); setIsFormOpen(true) }}>
            <Plus className="w-4 h-4 mr-2" />
            Transaksi Baru
          </Button>
        </div>
      </div>

      {/* Save Progress */}
      {saveProgress.isSaving && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{saveProgress.step}</span>
                <span>{saveProgress.progress}%</span>
              </div>
              <Progress value={saveProgress.progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Pencarian</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Cari transaksi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label>Jenis</Label>
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="pemasukan">Pemasukan</SelectItem>
                  <SelectItem value="pengeluaran">Pengeluaran</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Dari Tanggal</Label>
              <Input
                type="date"
                value={selectedDateRange.start}
                onChange={(e) => setSelectedDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>

            <div>
              <Label>Sampai Tanggal</Label>
              <Input
                type="date"
                value={selectedDateRange.end}
                onChange={(e) => setSelectedDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Transaksi ({filteredTransactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Transaksi</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Tidak ada transaksi ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        {transaction.transactionNumber}
                      </TableCell>
                      <TableCell>{formatDate(transaction.tanggal)}</TableCell>
                      <TableCell>
                        <Badge variant={transaction.type === 'pemasukan' ? 'default' : 'secondary'}>
                          {transaction.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}
                        </Badge>
                      </TableCell>
                      <TableCell>{transaction.customerName || '-'}</TableCell>
                      <TableCell className={`font-medium ${
                        transaction.type === 'pemasukan' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatRupiah(transaction.nominal)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={transaction.paymentStatus === 'lunas' ? 'default' : 'destructive'}>
                          {transaction.paymentStatus === 'lunas' ? 'Lunas' : 'Hutang'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            onClick={() => handleEditTransaction(transaction)}
                            size="sm"
                            variant="outline"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Transaksi?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tindakan ini tidak dapat dibatalkan. Transaksi akan dihapus permanen.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteTransaction(transaction.id)}
                                  className="bg-destructive text-destructive-foreground"
                                >
                                  Hapus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Transaction Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle>
              {editingTransaction ? 'Edit Transaksi' : 'Transaksi Baru'}
            </DialogTitle>
            <DialogDescription>
              {editingTransaction 
                ? 'Ubah detail transaksi yang dipilih'
                : 'Buat transaksi pemasukan atau pengeluaran baru'
              }
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="payment">Payment</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Jenis Transaksi</Label>
                  <Select 
                    value={transactionForm.type} 
                    onValueChange={(value: 'pemasukan' | 'pengeluaran') => 
                      setTransactionForm(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pemasukan">Pemasukan</SelectItem>
                      <SelectItem value="pengeluaran">Pengeluaran</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Nomor Referensi</Label>
                  <Input
                    placeholder="Optional reference number"
                    value={transactionForm.referenceNumber}
                    onChange={(e) => setTransactionForm(prev => ({ ...prev, referenceNumber: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Nama Pelanggan</Label>
                  <Input
                    placeholder="Nama pelanggan (opsional)"
                    value={transactionForm.customerName}
                    onChange={(e) => setTransactionForm(prev => ({ ...prev, customerName: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Telepon</Label>
                  <Input
                    placeholder="Nomor telepon (opsional)"
                    value={transactionForm.customerPhone}
                    onChange={(e) => setTransactionForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label>Catatan</Label>
                <Textarea
                  placeholder="Catatan transaksi (opsional)"
                  value={transactionForm.notes}
                  onChange={(e) => setTransactionForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={transactionForm.isDebt}
                  onCheckedChange={(checked) => setTransactionForm(prev => ({ ...prev, isDebt: checked }))}
                />
                <Label>Transaksi Hutang</Label>
              </div>

              {transactionForm.isDebt && (
                <div>
                  <Label>Jatuh Tempo</Label>
                  <Input
                    type="date"
                    value={transactionForm.dueDate}
                    onChange={(e) => setTransactionForm(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="items" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Items Transaksi</h3>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={isBundleMode ? 'default' : 'outline'}
                    onClick={() => setIsBundleMode(!isBundleMode)}
                    size="sm"
                  >
                    <Layers className="w-4 h-4 mr-2" />
                    Bundle Mode
                  </Button>
                </div>
              </div>

              {isBundleMode && bundles.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Available Bundles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {bundles.filter(b => b.isActive).map((bundle) => (
                        <Button
                          key={bundle.id}
                          variant="outline"
                          className="h-auto p-3 text-left justify-start"
                          onClick={() => addBundle(bundle)}
                        >
                          <div>
                            <div className="font-medium">{bundle.name}</div>
                            <div className="text-sm text-muted-foreground">{bundle.description}</div>
                            <div className="text-sm font-medium text-primary">{formatRupiah(bundle.totalPrice)}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Add Item Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tambah Item</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Produk</Label>
                      <Select 
                        value={currentItem.productId} 
                        onValueChange={(value) => {
                          const product = products.find(p => p.id === value)
                          setCurrentItem(prev => ({
                            ...prev,
                            productId: value,
                            unitPrice: product?.price || 0,
                            unitCost: product?.cost || (product?.price || 0) * 0.7
                          }))
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih produk" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} (Stok: {product.stock})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={currentItem.quantity}
                        onChange={(e) => setCurrentItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                      />
                    </div>

                    <div>
                      <Label>Harga Satuan</Label>
                      <Input
                        type="number"
                        value={currentItem.unitPrice}
                        onChange={(e) => setCurrentItem(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>

                    <div>
                      <Label>Modal Satuan</Label>
                      <Input
                        type="number"
                        value={currentItem.unitCost}
                        onChange={(e) => setCurrentItem(prev => ({ ...prev, unitCost: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Diskon</Label>
                      <Select 
                        value={currentItem.discount.type} 
                        onValueChange={(value: 'none' | 'percentage' | 'amount') => 
                          setCurrentItem(prev => ({ ...prev, discount: { ...prev.discount, type: value } }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Tidak ada</SelectItem>
                          <SelectItem value="percentage">Persentase</SelectItem>
                          <SelectItem value="amount">Nominal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {currentItem.discount.type !== 'none' && (
                      <div>
                        <Label>Nilai Diskon</Label>
                        <Input
                          type="number"
                          value={currentItem.discount.value}
                          onChange={(e) => setCurrentItem(prev => ({ 
                            ...prev, 
                            discount: { ...prev.discount, value: parseFloat(e.target.value) || 0 } 
                          }))}
                        />
                      </div>
                    )}

                    <div>
                      <Label>Catatan Item</Label>
                      <Input
                        placeholder="Catatan untuk item ini"
                        value={currentItem.notes}
                        onChange={(e) => setCurrentItem(prev => ({ ...prev, notes: e.target.value }))}
                      />
                    </div>
                  </div>

                  <Button type="button" onClick={addItemToTransaction} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah ke Transaksi
                  </Button>
                </CardContent>
              </Card>

              {/* Items List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Daftar Items ({transactionForm.items.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {transactionForm.items.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Belum ada item ditambahkan
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {transactionForm.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">{item.productName}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.quantity}x {formatRupiah(item.unitPrice)} = {formatRupiah(item.totalPrice)}
                            </div>
                            {item.notes && (
                              <div className="text-xs text-muted-foreground">{item.notes}</div>
                            )}
                          </div>
                          <Button
                            onClick={() => removeItemFromTransaction(item.id)}
                            size="sm"
                            variant="outline"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payment" className="space-y-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Metode Pembayaran</h3>
                  <Button onClick={addPaymentMethod} size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Metode
                  </Button>
                </div>

                {transactionForm.paymentMethods.map((method, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <Label>Metode</Label>
                          <Select 
                            value={method.type} 
                            onValueChange={(value: any) => updatePaymentMethod(index, 'type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cash">Cash</SelectItem>
                              <SelectItem value="transfer">Transfer</SelectItem>
                              <SelectItem value="card">Kartu</SelectItem>
                              <SelectItem value="ewallet">E-Wallet</SelectItem>
                              <SelectItem value="other">Lainnya</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Jumlah</Label>
                          <Input
                            type="number"
                            value={method.amount}
                            onChange={(e) => updatePaymentMethod(index, 'amount', parseFloat(e.target.value) || 0)}
                          />
                        </div>

                        {(method.type === 'transfer' || method.type === 'card') && (
                          <div>
                            <Label>Referensi</Label>
                            <Input
                              placeholder="No. referensi"
                              value={method.reference || ''}
                              onChange={(e) => updatePaymentMethod(index, 'reference', e.target.value)}
                            />
                          </div>
                        )}

                        <div className="flex items-end">
                          {transactionForm.paymentMethods.length > 1 && (
                            <Button
                              onClick={() => removePaymentMethod(index)}
                              size="sm"
                              variant="outline"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Transaction Adjustments */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Penyesuaian</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Diskon Global</Label>
                        <Select 
                          value={transactionForm.discount.type} 
                          onValueChange={(value: 'none' | 'percentage' | 'amount') => 
                            setTransactionForm(prev => ({ 
                              ...prev, 
                              discount: { ...prev.discount, type: value } 
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Tidak ada</SelectItem>
                            <SelectItem value="percentage">Persentase</SelectItem>
                            <SelectItem value="amount">Nominal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {transactionForm.discount.type !== 'none' && (
                        <div>
                          <Label>Nilai Diskon</Label>
                          <Input
                            type="number"
                            value={transactionForm.discount.value}
                            onChange={(e) => setTransactionForm(prev => ({ 
                              ...prev, 
                              discount: { ...prev.discount, value: parseFloat(e.target.value) || 0 } 
                            }))}
                          />
                        </div>
                      )}

                      <div>
                        <Label>Pajak (%)</Label>
                        <Input
                          type="number"
                          value={transactionForm.tax.rate}
                          onChange={(e) => setTransactionForm(prev => ({ 
                            ...prev, 
                            tax: { ...prev.tax, rate: parseFloat(e.target.value) || 0 } 
                          }))}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Biaya Pengiriman</Label>
                      <Input
                        type="number"
                        value={transactionForm.deliveryFee}
                        onChange={(e) => setTransactionForm(prev => ({ ...prev, deliveryFee: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="summary" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Ringkasan Transaksi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatRupiah(totals.subtotal)}</span>
                    </div>
                    
                    {totals.discountAmount > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Diskon:</span>
                        <span>-{formatRupiah(totals.discountAmount)}</span>
                      </div>
                    )}
                    
                    {totals.taxAmount > 0 && (
                      <div className="flex justify-between">
                        <span>Pajak:</span>
                        <span>{formatRupiah(totals.taxAmount)}</span>
                      </div>
                    )}
                    
                    {transactionForm.deliveryFee > 0 && (
                      <div className="flex justify-between">
                        <span>Biaya Pengiriman:</span>
                        <span>{formatRupiah(transactionForm.deliveryFee)}</span>
                      </div>
                    )}
                    
                    <Separator />
                    
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>{formatRupiah(totals.total)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Dibayar:</span>
                      <span>{formatRupiah(totals.totalPayment)}</span>
                    </div>
                    
                    {totals.change !== 0 && (
                      <div className={`flex justify-between font-medium ${
                        totals.change > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <span>{totals.change > 0 ? 'Kembalian:' : 'Kurang Bayar:'}</span>
                        <span>{formatRupiah(Math.abs(totals.change))}</span>
                      </div>
                    )}

                    <Separator />
                    
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Total Modal:</span>
                      <span>{formatRupiah(totals.totalCost)}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm font-medium text-green-600">
                      <span>Keuntungan:</span>
                      <span>{formatRupiah(totals.profit)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsFormOpen(false)} className="flex-1">
                      Batal
                    </Button>
                    <Button 
                      onClick={saveTransaction} 
                      disabled={saveProgress.isSaving}
                      className="flex-1"
                    >
                      {saveProgress.isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {editingTransaction ? 'Update' : 'Simpan'} Transaksi
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Calculator Dialog */}
      <Dialog open={showCalculator} onOpenChange={setShowCalculator}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Kalkulator</DialogTitle>
          </DialogHeader>
          <Calculator />
        </DialogContent>
      </Dialog>
    </div>
  )
}