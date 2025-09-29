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
import { Plus, Search, Calendar, User, Phone, DollarSign, TrendingUp, TrendingDown, CreditCard } from 'lucide-react'
import type { Transaction, Category } from '../types/financial'

const mockCategories: Category[] = [
  { id: '1', name: 'Smartphone Samsung Galaxy', defaultPrice: 5000000, defaultCost: 4200000 },
  { id: '2', name: 'Laptop Asus VivoBook', defaultPrice: 8500000, defaultCost: 7000000 },
  { id: '3', name: 'Headphone Sony', defaultPrice: 4500000, defaultCost: 3800000 },
  { id: '4', name: 'Coffee Maker', defaultPrice: 1200000, defaultCost: 900000 },
  { id: '5', name: 'Air Fryer', defaultPrice: 800000, defaultCost: 600000 },
]

interface ImprovedTransactionPageProps {
  transactions: Transaction[]
  onTransactionAdded: (transaction: Transaction) => void
}

export function ImprovedTransactionPage({ transactions, onTransactionAdded }: ImprovedTransactionPageProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTab, setSelectedTab] = useState('semua')
  
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

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleCategoryChange = (categoryId: string) => {
    const category = mockCategories.find(c => c.id === categoryId)
    if (category && categoryId !== 'manual') {
      setNewTransaction({
        ...newTransaction,
        kategori: category.name,
        nominal: category.defaultPrice || 0,
        hargaPokok: category.defaultCost || 0
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

  const handleAddTransaction = () => {
    if (newTransaction.nominal && newTransaction.catatan) {
      const transaction: Transaction = {
        id: Date.now().toString(),
        type: newTransaction.type as 'pemasukan' | 'pengeluaran',
        nominal: newTransaction.nominal,
        hargaPokok: newTransaction.hargaPokok,
        catatan: newTransaction.catatan,
        kategori: newTransaction.kategori,
        tanggal: newTransaction.tanggal || new Date(),
        customerName: newTransaction.customerName,
        customerPhone: newTransaction.customerPhone,
        paymentStatus: newTransaction.paymentStatus as 'lunas' | 'hutang',
        createdAt: new Date()
      }

      onTransactionAdded(transaction)
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
      setIsFormOpen(false)
    }
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.catatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (transaction.customerName && transaction.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
    
    if (selectedTab === 'semua') return matchesSearch
    if (selectedTab === 'pemasukan') return matchesSearch && transaction.type === 'pemasukan'
    if (selectedTab === 'pengeluaran') return matchesSearch && transaction.type === 'pengeluaran'
    if (selectedTab === 'hutang') return matchesSearch && transaction.paymentStatus === 'hutang'
    return matchesSearch
  })

  const totalPemasukan = transactions.filter(t => t.type === 'pemasukan').reduce((sum, t) => sum + t.nominal, 0)
  const totalPengeluaran = transactions.filter(t => t.type === 'pengeluaran').reduce((sum, t) => sum + t.nominal, 0)
  const totalHutang = transactions.filter(t => t.paymentStatus === 'hutang').reduce((sum, t) => sum + t.nominal, 0)

  if (isFormOpen) {
    return (
      <div className="p-6 space-y-6 bg-background min-h-screen">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => setIsFormOpen(false)}
            className="shadow-lg"
          >
            ← Kembali
          </Button>
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Tambah Transaksi</h1>
            <p className="text-muted-foreground mt-1">Buat transaksi pemasukan atau pengeluaran baru</p>
          </div>
        </div>

        {/* Scrollable Form */}
        <Card className="shadow-xl border-0 bg-card max-w-2xl mx-auto">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl text-card-foreground flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Detail Transaksi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-300px)] pr-4">
              <div className="space-y-6">
                {/* Status Toggle */}
                <div className="space-y-2">
                  <Label className="text-card-foreground">Status Pembayaran</Label>
                  <div className="flex rounded-lg overflow-hidden border-2 border-border">
                    <button
                      type="button"
                      onClick={() => setNewTransaction({ ...newTransaction, paymentStatus: 'hutang' })}
                      className={`flex-1 py-3 px-4 font-medium transition-all ${
                        newTransaction.paymentStatus === 'hutang'
                          ? 'bg-red-500 text-white shadow-lg'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      Hutang
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewTransaction({ ...newTransaction, paymentStatus: 'lunas' })}
                      className={`flex-1 py-3 px-4 font-medium transition-all ${
                        newTransaction.paymentStatus === 'lunas'
                          ? 'bg-green-500 text-white shadow-lg'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      Lunas
                    </button>
                  </div>
                </div>

                {/* Transaction Type */}
                <div className="space-y-2">
                  <Label className="text-card-foreground">Jenis Transaksi</Label>
                  <Select
                    value={newTransaction.type}
                    onValueChange={(value: 'pemasukan' | 'pengeluaran') => 
                      setNewTransaction({ ...newTransaction, type: value })
                    }
                  >
                    <SelectTrigger className="bg-input-background border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pemasukan">Pemasukan (Income)</SelectItem>
                      <SelectItem value="pengeluaran">Pengeluaran (Expense)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label className="text-card-foreground">Kategori (Opsional)</Label>
                  <Select
                    value={newTransaction.kategori ? mockCategories.find(c => c.name === newTransaction.kategori)?.id || 'manual' : 'manual'}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger className="bg-input-background border-border">
                      <SelectValue placeholder="Pilih kategori atau manual" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual Entry</SelectItem>
                      {mockCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name} - {formatRupiah(category.defaultPrice || 0)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Nominal */}
                <div className="space-y-2">
                  <Label className="text-card-foreground">Nominal</Label>
                  <Input
                    type="number"
                    value={newTransaction.nominal || ''}
                    onChange={(e) => setNewTransaction({ ...newTransaction, nominal: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    className="bg-input-background border-border"
                  />
                </div>

                {/* Harga Pokok */}
                {newTransaction.type === 'pemasukan' && (
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Harga Pokok/Modal (Opsional)</Label>
                    <Input
                      type="number"
                      value={newTransaction.hargaPokok || ''}
                      onChange={(e) => setNewTransaction({ ...newTransaction, hargaPokok: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                      className="bg-input-background border-border"
                    />
                  </div>
                )}

                {/* Catatan */}
                <div className="space-y-2">
                  <Label className="text-card-foreground">Catatan</Label>
                  <Textarea
                    value={newTransaction.catatan || ''}
                    onChange={(e) => setNewTransaction({ ...newTransaction, catatan: e.target.value })}
                    placeholder="Deskripsi transaksi"
                    className="bg-input-background border-border"
                    rows={3}
                  />
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <Label className="text-card-foreground">Tanggal</Label>
                  <Input
                    type="date"
                    value={newTransaction.tanggal ? new Date(newTransaction.tanggal).toISOString().split('T')[0] : ''}
                    onChange={(e) => setNewTransaction({ ...newTransaction, tanggal: new Date(e.target.value) })}
                    className="bg-input-background border-border"
                  />
                </div>

                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Nama Customer (Opsional)</Label>
                    <Input
                      value={newTransaction.customerName || ''}
                      onChange={(e) => setNewTransaction({ ...newTransaction, customerName: e.target.value })}
                      placeholder="Nama customer"
                      className="bg-input-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-card-foreground">No. Telepon (Opsional)</Label>
                    <Input
                      value={newTransaction.customerPhone || ''}
                      onChange={(e) => setNewTransaction({ ...newTransaction, customerPhone: e.target.value })}
                      placeholder="Nomor telepon"
                      className="bg-input-background border-border"
                    />
                  </div>
                </div>

                {/* Profit Preview */}
                {newTransaction.type === 'pemasukan' && newTransaction.nominal && newTransaction.hargaPokok && (
                  <div className="p-4 bg-accent rounded-xl border border-border">
                    <p className="font-semibold text-accent-foreground">
                      Keuntungan: {formatRupiah((newTransaction.nominal || 0) - (newTransaction.hargaPokok || 0))}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border">
              <Button variant="outline" onClick={() => setIsFormOpen(false)}>
                Batal
              </Button>
              <Button 
                onClick={handleAddTransaction} 
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={!newTransaction.nominal || !newTransaction.catatan}
              >
                Simpan Transaksi
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
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Transaksi
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-lg border-0 bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Pemasukan</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatRupiah(totalPemasukan)}</div>
            <p className="text-xs text-muted-foreground">
              {transactions.filter(t => t.type === 'pemasukan').length} transaksi
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Pengeluaran</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatRupiah(totalPengeluaran)}</div>
            <p className="text-xs text-muted-foreground">
              {transactions.filter(t => t.type === 'pengeluaran').length} transaksi
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Hutang</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatRupiah(totalHutang)}</div>
            <p className="text-xs text-muted-foreground">
              {transactions.filter(t => t.paymentStatus === 'hutang').length} transaksi
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari transaksi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-input-background border-border"
          />
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="bg-muted">
            <TabsTrigger value="semua">Semua</TabsTrigger>
            <TabsTrigger value="pemasukan">Pemasukan</TabsTrigger>
            <TabsTrigger value="pengeluaran">Pengeluaran</TabsTrigger>
            <TabsTrigger value="hutang">Hutang</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Transaction Table */}
      <Card className="shadow-lg border-0 bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">Daftar Transaksi</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-card-foreground">Tanggal</TableHead>
                  <TableHead className="text-card-foreground">Jenis</TableHead>
                  <TableHead className="text-card-foreground">Catatan</TableHead>
                  <TableHead className="text-card-foreground">Kategori</TableHead>
                  <TableHead className="text-card-foreground">Customer</TableHead>
                  <TableHead className="text-card-foreground">Nominal</TableHead>
                  <TableHead className="text-card-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="border-border hover:bg-muted/30">
                    <TableCell className="text-sm text-card-foreground">
                      {new Date(transaction.tanggal).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={transaction.type === 'pemasukan' ? 'border-green-200 text-green-800 bg-green-50' : 'border-red-200 text-red-800 bg-red-50'}
                      >
                        {transaction.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-card-foreground">{transaction.catatan}</TableCell>
                    <TableCell>
                      {transaction.kategori && (
                        <Badge variant="outline" className="border-primary/20">{transaction.kategori}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {transaction.customerName && (
                        <div>
                          <p className="font-medium text-card-foreground">{transaction.customerName}</p>
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
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={transaction.paymentStatus === 'lunas' ? 'border-blue-200 text-blue-800 bg-blue-50' : 'border-yellow-200 text-yellow-800 bg-yellow-50'}
                      >
                        {transaction.paymentStatus === 'lunas' ? 'Lunas' : 'Hutang'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {filteredTransactions.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-muted/50 rounded-xl p-8">
            <p className="text-muted-foreground">Tidak ada transaksi yang ditemukan.</p>
          </div>
        </div>
      )}
    </div>
  )
}