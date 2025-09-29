import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Textarea } from './ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Plus, Search, Calendar, User, Phone, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import type { Transaction, Category } from '../types/financial'

const mockCategories: Category[] = [
  { id: '1', name: 'Smartphone Samsung Galaxy', defaultPrice: 5000000, defaultCost: 4200000 },
  { id: '2', name: 'Laptop Asus VivoBook', defaultPrice: 8500000, defaultCost: 7000000 },
  { id: '3', name: 'Headphone Sony', defaultPrice: 4500000, defaultCost: 3800000 },
  { id: '4', name: 'Coffee Maker', defaultPrice: 1200000, defaultCost: 900000 },
  { id: '5', name: 'Air Fryer', defaultPrice: 800000, defaultCost: 600000 },
]

interface TransactionPageProps {
  transactions: Transaction[]
  onTransactionAdded: (transaction: Transaction) => void
}

export function TransactionPage({ transactions, onTransactionAdded }: TransactionPageProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
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
      setIsAddDialogOpen(false)
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Transaksi</h1>
          <p className="text-muted-foreground mt-1">Kelola semua transaksi pemasukan dan pengeluaran</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Transaksi
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah Transaksi Baru</DialogTitle>
              <DialogDescription>
                Isi detail transaksi pemasukan atau pengeluaran.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Jenis Transaksi</Label>
                <Select
                  value={newTransaction.type}
                  onValueChange={(value: 'pemasukan' | 'pengeluaran') => 
                    setNewTransaction({ ...newTransaction, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pemasukan">Pemasukan (Income)</SelectItem>
                    <SelectItem value="pengeluaran">Pengeluaran (Expense)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Kategori (Opsional)</Label>
                <Select
                  value={newTransaction.kategori ? mockCategories.find(c => c.name === newTransaction.kategori)?.id || 'manual' : 'manual'}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger>
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

              <div className="space-y-2">
                <Label>Nominal</Label>
                <Input
                  type="number"
                  value={newTransaction.nominal || ''}
                  onChange={(e) => setNewTransaction({ ...newTransaction, nominal: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>

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

              <div className="space-y-2">
                <Label>Catatan</Label>
                <Textarea
                  value={newTransaction.catatan || ''}
                  onChange={(e) => setNewTransaction({ ...newTransaction, catatan: e.target.value })}
                  placeholder="Deskripsi transaksi"
                />
              </div>

              <div className="space-y-2">
                <Label>Tanggal</Label>
                <Input
                  type="date"
                  value={newTransaction.tanggal ? new Date(newTransaction.tanggal).toISOString().split('T')[0] : ''}
                  onChange={(e) => setNewTransaction({ ...newTransaction, tanggal: new Date(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label>Nama Customer (Opsional)</Label>
                <Input
                  value={newTransaction.customerName || ''}
                  onChange={(e) => setNewTransaction({ ...newTransaction, customerName: e.target.value })}
                  placeholder="Nama customer"
                />
              </div>

              <div className="space-y-2">
                <Label>No. Telepon (Opsional)</Label>
                <Input
                  value={newTransaction.customerPhone || ''}
                  onChange={(e) => setNewTransaction({ ...newTransaction, customerPhone: e.target.value })}
                  placeholder="Nomor telepon"
                />
              </div>

              <div className="space-y-2">
                <Label>Status Pembayaran</Label>
                <Select
                  value={newTransaction.paymentStatus}
                  onValueChange={(value: 'lunas' | 'hutang') => 
                    setNewTransaction({ ...newTransaction, paymentStatus: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lunas">Lunas</SelectItem>
                    <SelectItem value="hutang">Hutang</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newTransaction.type === 'pemasukan' && newTransaction.nominal && newTransaction.hargaPokok && (
                <div className="p-3 bg-accent rounded-lg">
                  <p className="text-sm font-medium">
                    Keuntungan: {formatRupiah((newTransaction.nominal || 0) - (newTransaction.hargaPokok || 0))}
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleAddTransaction} className="bg-primary hover:bg-primary/90">
                Simpan Transaksi
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pemasukan</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatRupiah(totalPemasukan)}</div>
            <p className="text-xs text-muted-foreground">
              {transactions.filter(t => t.type === 'pemasukan').length} transaksi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatRupiah(totalPengeluaran)}</div>
            <p className="text-xs text-muted-foreground">
              {transactions.filter(t => t.type === 'pengeluaran').length} transaksi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hutang</CardTitle>
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
            className="pl-10"
          />
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
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
                        variant={transaction.type === 'pemasukan' ? 'default' : 'destructive'}
                        className={transaction.type === 'pemasukan' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                      >
                        {transaction.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{transaction.catatan}</TableCell>
                    <TableCell>
                      {transaction.kategori && (
                        <Badge variant="outline">{transaction.kategori}</Badge>
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
                        variant={transaction.paymentStatus === 'lunas' ? 'default' : 'secondary'}
                        className={transaction.paymentStatus === 'lunas' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}
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
          <div className="bg-accent rounded-lg p-8">
            <p className="text-muted-foreground">Tidak ada transaksi yang ditemukan.</p>
          </div>
        </div>
      )}
    </div>
  )
}