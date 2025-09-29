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
import { Plus, Search, ArrowLeft, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import type { Transaction, Category } from '../types/financial'

interface FinalTransactionPageProps {
  transactions: Transaction[]
  categories: Category[]
  onTransactionAdded: (transaction: Transaction) => void
}

export function FinalTransactionPage({ transactions, categories = [], onTransactionAdded }: FinalTransactionPageProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTab, setSelectedTab] = useState('semua')
  
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    type: 'pemasukan',
    nominal: 0,
    hargaPokok: 0,
    catatan: '',
    kategori: '',
    tanggal: new Date(), // Auto-filled with today's date
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
    const category = categories.find(c => c.id === categoryId)
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
      
      // Reset form with today's date
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
            className="hover:bg-accent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Tambah Transaksi</h1>
            <p className="text-muted-foreground mt-1">Buat transaksi pemasukan atau pengeluaran baru</p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Detail Transaksi</CardTitle>
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

                {/* Nominal */}
                <div className="space-y-2">
                  <Label className="font-medium">Nominal</Label>
                  <Input
                    type="number"
                    value={newTransaction.nominal || ''}
                    onChange={(e) => setNewTransaction({ ...newTransaction, nominal: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    className="text-lg"
                  />
                </div>

                {/* Harga Pokok - Only for Pemasukan */}
                {newTransaction.type === 'pemasukan' && (
                  <div className="space-y-2">
                    <Label className="font-medium">Harga Pokok/Modal (Opsional)</Label>
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
                  <div className="flex w-64 rounded-lg overflow-hidden border border-border">
                    <button
                      type="button"
                      onClick={() => setNewTransaction({ ...newTransaction, paymentStatus: 'hutang' })}
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
                      onClick={() => setNewTransaction({ ...newTransaction, paymentStatus: 'lunas' })}
                      className={`flex-1 py-2 px-4 text-sm font-medium transition-all ${
                        newTransaction.paymentStatus === 'lunas'
                          ? 'bg-green-500 text-white'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      Lunas
                    </button>
                  </div>
                </div>

                {/* Category Dropdown */}
                <div className="space-y-2">
                  <Label className="font-medium">Kategori (Opsional)</Label>
                  <Select
                    value={newTransaction.kategori ? categories.find(c => c.name === newTransaction.kategori)?.id || 'manual' : 'manual'}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori atau manual" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual Entry</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name} {category.defaultPrice ? `- ${formatRupiah(category.defaultPrice)}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date - Auto-filled */}
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

                {/* Profit Preview */}
                {newTransaction.type === 'pemasukan' && newTransaction.nominal && newTransaction.hargaPokok && (
                  <div className="p-4 bg-accent rounded-lg border border-border">
                    <p className="font-semibold text-accent-foreground">
                      Keuntungan: {formatRupiah((newTransaction.nominal || 0) - (newTransaction.hargaPokok || 0))}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Save Button at Bottom */}
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border">
              <Button variant="outline" onClick={() => setIsFormOpen(false)}>
                Batal
              </Button>
              <Button 
                onClick={handleAddTransaction} 
                disabled={!newTransaction.nominal || !newTransaction.catatan}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
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

      {/* Transaction Table - Scrollable */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Transaksi</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Catatan</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Nominal</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
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
                    <TableCell className="font-medium">{transaction.catatan}</TableCell>
                    <TableCell>
                      {transaction.kategori && (
                        <Badge variant="outline" className="border-primary/20">{transaction.kategori}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {transaction.customerName && (
                        <div>
                          <p className="font-medium">{transaction.customerName}</p>
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
                        className={transaction.paymentStatus === 'lunas' 
                          ? 'border-blue-200 text-blue-800 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400' 
                          : 'border-yellow-200 text-yellow-800 bg-yellow-50 dark:bg-yellow-950/20 dark:text-yellow-400'
                        }
                      >
                        {transaction.paymentStatus === 'lunas' ? 'Lunas' : 'Hutang'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

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