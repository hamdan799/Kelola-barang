import { useState } from 'react'
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
import { Plus, Search, ArrowLeft, TrendingUp, TrendingDown, DollarSign, Edit, Trash2, ShoppingCart, Receipt, Printer } from 'lucide-react'
import type { Transaction, TransactionItem, Category } from '../types/financial'
import type { Product } from '../types/inventory'

interface EnhancedTransactionPageProps {
  transactions: Transaction[]
  categories: Category[]
  products: Product[]
  onTransactionAdded: (transaction: Transaction) => void
  onTransactionUpdated: (transaction: Transaction) => void
  onTransactionDeleted: (transactionId: string) => void
}

export function EnhancedTransactionPage({ 
  transactions, 
  categories = [], 
  products = [],
  onTransactionAdded,
  onTransactionUpdated,
  onTransactionDeleted
}: EnhancedTransactionPageProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTab, setSelectedTab] = useState('semua')
  const [showReceipt, setShowReceipt] = useState<Transaction | null>(null)
  
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    type: 'pemasukan',
    items: [],
    nominal: 0,
    totalCost: 0,
    profit: 0,
    catatan: '',
    kategori: '',
    tanggal: new Date(),
    customerName: '',
    customerPhone: '',
    paymentStatus: 'lunas',
    paidAmount: 0
  })

  const [currentItem, setCurrentItem] = useState<Partial<TransactionItem>>({
    productName: '',
    quantity: 1,
    unitPrice: 0,
    unitCost: 0,
    total: 0
  })

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const generateTransactionNumber = () => {
    const now = new Date()
    const year = now.getFullYear().toString().slice(-2)
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const date = now.getDate().toString().padStart(2, '0')
    const time = now.getTime().toString().slice(-4)
    return `TRX${year}${month}${date}${time}`
  }

  const resetForm = () => {
    setNewTransaction({
      type: 'pemasukan',
      items: [],
      nominal: 0,
      totalCost: 0,
      profit: 0,
      catatan: '',
      kategori: '',
      tanggal: new Date(),
      customerName: '',
      customerPhone: '',
      paymentStatus: 'lunas',
      paidAmount: 0
    })
    setCurrentItem({
      productName: '',
      quantity: 1,
      unitPrice: 0,
      unitCost: 0,
      total: 0
    })
  }

  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id === productId)
    if (product) {
      setCurrentItem({
        ...currentItem,
        productId: product.id,
        productName: product.name,
        unitPrice: product.price,
        unitCost: product.cost || 0,
        total: (currentItem.quantity || 1) * product.price
      })
    }
  }

  const handleQuantityChange = (quantity: number) => {
    const newQuantity = Math.max(1, quantity)
    setCurrentItem({
      ...currentItem,
      quantity: newQuantity,
      total: newQuantity * (currentItem.unitPrice || 0)
    })
  }

  const handlePriceChange = (price: number) => {
    setCurrentItem({
      ...currentItem,
      unitPrice: price,
      total: (currentItem.quantity || 1) * price
    })
  }

  const addItemToTransaction = () => {
    if (currentItem.productName && currentItem.quantity && currentItem.unitPrice) {
      const item: TransactionItem = {
        id: Date.now().toString(),
        productId: currentItem.productId,
        productName: currentItem.productName,
        quantity: currentItem.quantity,
        unitPrice: currentItem.unitPrice,
        unitCost: currentItem.unitCost || 0,
        total: currentItem.total || 0
      }

      const updatedItems = [...(newTransaction.items || []), item]
      const totalNominal = updatedItems.reduce((sum, item) => sum + item.total, 0)
      const totalCost = updatedItems.reduce((sum, item) => sum + (item.unitCost * item.quantity), 0)
      const profit = totalNominal - totalCost

      setNewTransaction({
        ...newTransaction,
        items: updatedItems,
        nominal: totalNominal,
        totalCost,
        profit,
        paidAmount: newTransaction.paymentStatus === 'lunas' ? totalNominal : (newTransaction.paidAmount || 0)
      })

      // Reset current item
      setCurrentItem({
        productName: '',
        quantity: 1,
        unitPrice: 0,
        unitCost: 0,
        total: 0
      })
    }
  }

  const removeItemFromTransaction = (itemId: string) => {
    const updatedItems = (newTransaction.items || []).filter(item => item.id !== itemId)
    const totalNominal = updatedItems.reduce((sum, item) => sum + item.total, 0)
    const totalCost = updatedItems.reduce((sum, item) => sum + (item.unitCost * item.quantity), 0)
    const profit = totalNominal - totalCost

    setNewTransaction({
      ...newTransaction,
      items: updatedItems,
      nominal: totalNominal,
      totalCost,
      profit,
      paidAmount: newTransaction.paymentStatus === 'lunas' ? totalNominal : (newTransaction.paidAmount || 0)
    })
  }

  const handleAddTransaction = () => {
    if (newTransaction.items && newTransaction.items.length > 0 && newTransaction.catatan) {
      const transaction: Transaction = {
        id: editingTransaction?.id || Date.now().toString(),
        transactionNumber: editingTransaction?.transactionNumber || generateTransactionNumber(),
        type: newTransaction.type as 'pemasukan' | 'pengeluaran',
        items: newTransaction.items,
        nominal: newTransaction.nominal || 0,
        totalCost: newTransaction.totalCost,
        profit: newTransaction.profit,
        catatan: newTransaction.catatan,
        kategori: newTransaction.kategori,
        tanggal: newTransaction.tanggal || new Date(),
        customerName: newTransaction.customerName,
        customerPhone: newTransaction.customerPhone,
        paymentStatus: newTransaction.paymentStatus as 'lunas' | 'hutang' | 'sebagian',
        paidAmount: newTransaction.paidAmount,
        createdAt: editingTransaction?.createdAt || new Date(),
        updatedAt: editingTransaction ? new Date() : undefined,
        createdBy: 'Current User' // TODO: Get from auth context
      }

      if (editingTransaction) {
        onTransactionUpdated(transaction)
      } else {
        onTransactionAdded(transaction)
      }
      
      resetForm()
      setEditingTransaction(null)
      setIsFormOpen(false)
    }
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setNewTransaction({
      type: transaction.type,
      items: [...transaction.items],
      nominal: transaction.nominal,
      totalCost: transaction.totalCost,
      profit: transaction.profit,
      catatan: transaction.catatan,
      kategori: transaction.kategori,
      tanggal: transaction.tanggal,
      customerName: transaction.customerName,
      customerPhone: transaction.customerPhone,
      paymentStatus: transaction.paymentStatus,
      paidAmount: transaction.paidAmount
    })
    setIsFormOpen(true)
  }

  const handleDeleteTransaction = (transactionId: string) => {
    onTransactionDeleted(transactionId)
  }

  const handlePrintReceipt = (transaction: Transaction) => {
    setShowReceipt(transaction)
  }

  const printReceipt = () => {
    if (showReceipt) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Struk - ${showReceipt.transactionNumber}</title>
            <style>
              body { font-family: monospace; width: 300px; margin: 0 auto; padding: 20px; }
              .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
              .item { display: flex; justify-content: space-between; margin: 5px 0; }
              .total { border-top: 1px dashed #000; padding-top: 10px; margin-top: 10px; font-weight: bold; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>TOKO SERBA ADA</h2>
              <p>Jl. Contoh No. 123<br>Telp: 0812-3456-7890</p>
              <p>Struk: ${showReceipt.transactionNumber}</p>
              <p>${new Date(showReceipt.tanggal).toLocaleString('id-ID')}</p>
            </div>
            
            <div class="items">
              ${showReceipt.items.map(item => `
                <div class="item">
                  <span>${item.productName} x${item.quantity}</span>
                  <span>${formatRupiah(item.total)}</span>
                </div>
              `).join('')}
            </div>
            
            <div class="total">
              <div class="item">
                <span>TOTAL:</span>
                <span>${formatRupiah(showReceipt.nominal)}</span>
              </div>
              ${showReceipt.paymentStatus === 'sebagian' ? `
                <div class="item">
                  <span>Dibayar:</span>
                  <span>${formatRupiah(showReceipt.paidAmount || 0)}</span>
                </div>
                <div class="item">
                  <span>Sisa:</span>
                  <span>${formatRupiah(showReceipt.nominal - (showReceipt.paidAmount || 0))}</span>
                </div>
              ` : ''}
              <div class="item">
                <span>Status:</span>
                <span>${showReceipt.paymentStatus === 'lunas' ? 'LUNAS' : showReceipt.paymentStatus === 'hutang' ? 'HUTANG' : 'SEBAGIAN'}</span>
              </div>
            </div>
            
            <div class="footer">
              <p>Terima kasih atas kunjungan Anda!</p>
              ${showReceipt.customerName ? `<p>Customer: ${showReceipt.customerName}</p>` : ''}
            </div>
          </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
        printWindow.close()
      }
    }
    setShowReceipt(null)
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.catatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.transactionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (transaction.customerName && transaction.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
    
    if (selectedTab === 'semua') return matchesSearch
    if (selectedTab === 'pemasukan') return matchesSearch && transaction.type === 'pemasukan'
    if (selectedTab === 'pengeluaran') return matchesSearch && transaction.type === 'pengeluaran'
    if (selectedTab === 'hutang') return matchesSearch && (transaction.paymentStatus === 'hutang' || transaction.paymentStatus === 'sebagian')
    return matchesSearch
  })

  const totalPemasukan = transactions.filter(t => t.type === 'pemasukan').reduce((sum, t) => sum + t.nominal, 0)
  const totalPengeluaran = transactions.filter(t => t.type === 'pengeluaran').reduce((sum, t) => sum + t.nominal, 0)
  const totalHutang = transactions.filter(t => t.paymentStatus === 'hutang' || t.paymentStatus === 'sebagian').reduce((sum, t) => sum + (t.nominal - (t.paidAmount || 0)), 0)

  if (isFormOpen) {
    return (
      <div className="p-6 space-y-6 bg-background min-h-screen">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => {
              setIsFormOpen(false)
              setEditingTransaction(null)
              resetForm()
            }}
            className="hover:bg-accent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-3xl font-semibold text-foreground">
              {editingTransaction ? 'Edit Transaksi' : 'Tambah Transaksi'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {editingTransaction ? 'Ubah data transaksi yang sudah ada' : 'Buat transaksi pemasukan atau pengeluaran baru'}
            </p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Detail Transaksi</CardTitle>
            {editingTransaction && (
              <p className="text-sm text-muted-foreground">No. Transaksi: {editingTransaction.transactionNumber}</p>
            )}
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-300px)] pr-4">
              <div className="space-y-6">
                {/* Transaction Type Toggle - At Very Top */}
                <div className="space-y-2">
                  <Label className="font-medium">Jenis Transaksi</Label>
                  <div className="flex rounded-lg overflow-hidden border border-border">
                    <button
                      type="button"
                      onClick={() => setNewTransaction({ ...newTransaction, type: 'pemasukan' })}
                      className={`flex-1 py-3 px-4 font-medium transition-all ${
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
                      className={`flex-1 py-3 px-4 font-medium transition-all ${
                        newTransaction.type === 'pengeluaran'
                          ? 'bg-red-500 text-white'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      Pengeluaran
                    </button>
                  </div>
                </div>

                {/* Add Items Section */}
                <Card className="border border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Tambah Item</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Pilih Produk</Label>
                        <Select
                          value={currentItem.productId || 'manual'}
                          onValueChange={(value) => {
                            if (value === 'manual') {
                              setCurrentItem({
                                productName: '',
                                quantity: 1,
                                unitPrice: 0,
                                unitCost: 0,
                                total: 0
                              })
                            } else {
                              handleProductSelect(value)
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih produk atau manual" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manual">Manual Entry</SelectItem>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} - {formatRupiah(product.price)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Nama Produk</Label>
                        <Input
                          value={currentItem.productName || ''}
                          onChange={(e) => setCurrentItem({ ...currentItem, productName: e.target.value })}
                          placeholder="Nama produk"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Jumlah</Label>
                        <Input
                          type="number"
                          value={currentItem.quantity || ''}
                          onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                          placeholder="1"
                          min="1"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Harga Satuan</Label>
                        <Input
                          type="number"
                          value={currentItem.unitPrice || ''}
                          onChange={(e) => handlePriceChange(parseInt(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Total</Label>
                        <Input
                          value={formatRupiah(currentItem.total || 0)}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={addItemToTransaction}
                      disabled={!currentItem.productName || !currentItem.quantity || !currentItem.unitPrice}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Item
                    </Button>
                  </CardContent>
                </Card>

                {/* Items List */}
                {newTransaction.items && newTransaction.items.length > 0 && (
                  <Card className="border border-border">
                    <CardHeader>
                      <CardTitle className="text-lg">Daftar Item</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {newTransaction.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 border border-border rounded">
                            <div>
                              <p className="font-medium">{item.productName}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.quantity} x {formatRupiah(item.unitPrice)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{formatRupiah(item.total)}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeItemFromTransaction(item.id)}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Total Nominal:</span>
                          <span className="text-xl font-bold text-green-600">
                            {formatRupiah(newTransaction.nominal || 0)}
                          </span>
                        </div>
                        {newTransaction.type === 'pemasukan' && (
                          <>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-sm text-muted-foreground">Total Modal:</span>
                              <span className="text-sm">{formatRupiah(newTransaction.totalCost || 0)}</span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-sm text-muted-foreground">Keuntungan:</span>
                              <span className="text-sm font-medium text-blue-600">
                                {formatRupiah(newTransaction.profit || 0)}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Catatan */}
                <div className="space-y-2">
                  <Label className="font-medium">Catatan</Label>
                  <Textarea
                    value={newTransaction.catatan || ''}
                    onChange={(e) => setNewTransaction({ ...newTransaction, catatan: e.target.value })}
                    placeholder="Deskripsi transaksi"
                    rows={3}
                  />
                </div>

                {/* Payment Status Toggle - Smaller, Left-aligned */}
                <div className="space-y-2">
                  <Label className="font-medium">Status Pembayaran</Label>
                  <div className="flex w-80 rounded-lg overflow-hidden border border-border">
                    <button
                      type="button"
                      onClick={() => setNewTransaction({ 
                        ...newTransaction, 
                        paymentStatus: 'hutang',
                        paidAmount: 0
                      })}
                      className={`flex-1 py-2 px-4 text-sm font-medium transition-all ${
                        newTransaction.paymentStatus === 'hutang'
                          ? 'bg-red-500 text-white'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      Hutang
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewTransaction({ 
                        ...newTransaction, 
                        paymentStatus: 'sebagian',
                        paidAmount: 0
                      })}
                      className={`flex-1 py-2 px-4 text-sm font-medium transition-all ${
                        newTransaction.paymentStatus === 'sebagian'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      Sebagian
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewTransaction({ 
                        ...newTransaction, 
                        paymentStatus: 'lunas',
                        paidAmount: newTransaction.nominal
                      })}
                      className={`flex-1 py-2 px-4 text-sm font-medium transition-all ${
                        newTransaction.paymentStatus === 'lunas'
                          ? 'bg-green-500 text-white'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      Lunas
                    </button>
                  </div>

                  {newTransaction.paymentStatus === 'sebagian' && (
                    <div className="mt-3 space-y-2">
                      <Label className="text-sm">Jumlah Dibayar</Label>
                      <Input
                        type="number"
                        value={newTransaction.paidAmount || ''}
                        onChange={(e) => setNewTransaction({ 
                          ...newTransaction, 
                          paidAmount: Math.min(parseInt(e.target.value) || 0, newTransaction.nominal || 0)
                        })}
                        placeholder="0"
                        max={newTransaction.nominal}
                        className="w-64"
                      />
                      <p className="text-xs text-muted-foreground">
                        Sisa: {formatRupiah((newTransaction.nominal || 0) - (newTransaction.paidAmount || 0))}
                      </p>
                    </div>
                  )}
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label className="font-medium">Kategori (Opsional)</Label>
                  <Select
                    value={newTransaction.kategori || 'none'}
                    onValueChange={(value) => setNewTransaction({ ...newTransaction, kategori: value === 'none' ? '' : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Tidak ada kategori</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <Label className="font-medium">Tanggal</Label>
                  <Input
                    type="date"
                    value={newTransaction.tanggal ? new Date(newTransaction.tanggal).toISOString().split('T')[0] : ''}
                    onChange={(e) => setNewTransaction({ ...newTransaction, tanggal: new Date(e.target.value) })}
                  />
                </div>

                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-medium">Nama Customer (Opsional)</Label>
                    <Input
                      value={newTransaction.customerName || ''}
                      onChange={(e) => setNewTransaction({ ...newTransaction, customerName: e.target.value })}
                      placeholder="Nama customer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-medium">No. Telepon (Opsional)</Label>
                    <Input
                      value={newTransaction.customerPhone || ''}
                      onChange={(e) => setNewTransaction({ ...newTransaction, customerPhone: e.target.value })}
                      placeholder="Nomor telepon"
                    />
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* Save Button at Bottom */}
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsFormOpen(false)
                  setEditingTransaction(null)
                  resetForm()
                }}
              >
                Batal
              </Button>
              <Button 
                onClick={handleAddTransaction} 
                disabled={!newTransaction.items || newTransaction.items.length === 0 || !newTransaction.catatan}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {editingTransaction ? 'Update Transaksi' : 'Simpan Transaksi'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Transaksi</h1>
          <p className="text-muted-foreground mt-1">Kelola semua transaksi pemasukan dan pengeluaran</p>
        </div>

        <Button 
          onClick={() => setIsFormOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Transaksi
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Total Pemasukan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatRupiah(totalPemasukan)}</div>
            <p className="text-xs text-muted-foreground">
              {transactions.filter(t => t.type === 'pemasukan').length} transaksi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              Total Pengeluaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatRupiah(totalPengeluaran)}</div>
            <p className="text-xs text-muted-foreground">
              {transactions.filter(t => t.type === 'pengeluaran').length} transaksi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-yellow-600" />
              Total Hutang
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatRupiah(totalHutang)}</div>
            <p className="text-xs text-muted-foreground">
              {transactions.filter(t => t.paymentStatus === 'hutang' || t.paymentStatus === 'sebagian').length} transaksi
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari transaksi atau nomor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="bg-muted/50">
            <TabsTrigger value="semua">Semua</TabsTrigger>
            <TabsTrigger value="pemasukan">Pemasukan</TabsTrigger>
            <TabsTrigger value="pengeluaran">Pengeluaran</TabsTrigger>
            <TabsTrigger value="hutang">Hutang</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Transaction Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Transaksi</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead>No. Transaksi</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Nominal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-mono text-sm">
                      {transaction.transactionNumber}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(transaction.tanggal).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={transaction.type === 'pemasukan' 
                          ? 'border-green-200 text-green-800 bg-green-50 dark:bg-green-950/20 dark:text-green-400' 
                          : 'border-red-200 text-red-800 bg-red-50 dark:bg-red-950/20 dark:text-red-400'
                        }
                      >
                        {transaction.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-32">
                        {transaction.items.slice(0, 2).map(item => (
                          <p key={item.id} className="text-xs text-muted-foreground truncate">
                            {item.productName} x{item.quantity}
                          </p>
                        ))}
                        {transaction.items.length > 2 && (
                          <p className="text-xs text-muted-foreground">+{transaction.items.length - 2} lagi</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {transaction.customerName && (
                        <div>
                          <p className="font-medium text-sm">{transaction.customerName}</p>
                          {transaction.customerPhone && (
                            <p className="text-xs text-muted-foreground">{transaction.customerPhone}</p>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      <span className={transaction.type === 'pemasukan' ? 'text-green-600' : 'text-red-600'}>
                        {transaction.type === 'pemasukan' ? '+' : '-'}{formatRupiah(transaction.nominal)}
                      </span>
                      {transaction.paymentStatus === 'sebagian' && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Dibayar: {formatRupiah(transaction.paidAmount || 0)}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={
                          transaction.paymentStatus === 'lunas'
                            ? 'border-blue-200 text-blue-800 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400'
                            : transaction.paymentStatus === 'sebagian'
                            ? 'border-yellow-200 text-yellow-800 bg-yellow-50 dark:bg-yellow-950/20 dark:text-yellow-400'
                            : 'border-red-200 text-red-800 bg-red-50 dark:bg-red-950/20 dark:text-red-400'
                        }
                      >
                        {transaction.paymentStatus === 'lunas' ? 'Lunas' : 
                         transaction.paymentStatus === 'sebagian' ? 'Sebagian' : 'Hutang'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePrintReceipt(transaction)}
                          className="h-8 w-8 p-0"
                          title="Cetak Struk"
                        >
                          <Printer className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditTransaction(transaction)}
                          className="h-8 w-8 p-0"
                          title="Edit"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 border-red-200 text-red-600 hover:bg-red-50"
                              title="Hapus"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Transaksi</AlertDialogTitle>
                              <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus transaksi {transaction.transactionNumber}? 
                                Aksi ini tidak dapat dibatalkan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteTransaction(transaction.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Receipt Dialog */}
      <Dialog open={!!showReceipt} onOpenChange={() => setShowReceipt(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cetak Struk</DialogTitle>
            <DialogDescription>
              Struk untuk transaksi {showReceipt?.transactionNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center border-b pb-4">
              <h3 className="font-bold">TOKO SERBA ADA</h3>
              <p className="text-sm text-muted-foreground">Jl. Contoh No. 123</p>
              <p className="text-sm text-muted-foreground">Telp: 0812-3456-7890</p>
            </div>
            
            {showReceipt && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>No. Transaksi:</span>
                  <span className="font-mono">{showReceipt.transactionNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tanggal:</span>
                  <span>{new Date(showReceipt.tanggal).toLocaleString('id-ID')}</span>
                </div>
                
                <div className="border-t pt-2">
                  {showReceipt.items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.productName} x{item.quantity}</span>
                      <span>{formatRupiah(item.total)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-2 font-bold">
                  <div className="flex justify-between">
                    <span>TOTAL:</span>
                    <span>{formatRupiah(showReceipt.nominal)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-normal">
                    <span>Status:</span>
                    <span>{showReceipt.paymentStatus === 'lunas' ? 'LUNAS' : 
                           showReceipt.paymentStatus === 'sebagian' ? 'SEBAGIAN' : 'HUTANG'}</span>
                  </div>
                </div>
                
                {showReceipt.customerName && (
                  <div className="border-t pt-2 text-sm">
                    <p>Customer: {showReceipt.customerName}</p>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex justify-between gap-3">
            <Button variant="outline" onClick={() => setShowReceipt(null)}>
              Tutup
            </Button>
            <Button onClick={printReceipt}>
              <Printer className="w-4 h-4 mr-2" />
              Cetak
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {filteredTransactions.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-muted/30 rounded-xl p-8 border border-border">
            <p className="text-muted-foreground">Tidak ada transaksi yang ditemukan.</p>
          </div>
        </div>
      )}
    </div>
  )
}