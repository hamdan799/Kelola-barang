import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { Textarea } from './ui/textarea'
import { ScrollArea } from './ui/scroll-area'
import { ArrowLeft, DollarSign, Calendar, Plus, CheckCircle, User, UserPlus, CreditCard } from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import type { Debt, DebtTransaction } from '../types/financial'

interface FinalDebtManagementProps {
  debts: Debt[]
  onDebtUpdated: (debt: Debt) => void
  onDebtTransactionAdded: (debtId: string, transaction: DebtTransaction) => void
  onDebtDeleted: (debtId: string) => void
}

export function FinalDebtManagement({ debts, onDebtUpdated, onDebtTransactionAdded, onDebtDeleted }: FinalDebtManagementProps) {
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null)
  const [isAddDebtorDialogOpen, setIsAddDebtorDialogOpen] = useState(false)
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false)
  const [transactionType, setTransactionType] = useState<'memberi' | 'menerima'>('memberi')
  
  const [newDebtor, setNewDebtor] = useState({
    name: '',
    phone: '',
    initialDebt: 0,
    dueDate: ''
  })

  const [newTransaction, setNewTransaction] = useState({
    amount: 0,
    catatan: ''
  })

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const totalAllDebt = debts.reduce((sum, debt) => sum + debt.totalDebt, 0)

  const handleAddDebtor = () => {
    if (newDebtor.name && newDebtor.initialDebt > 0) {
      const debt: Debt = {
        id: Date.now().toString(),
        customerName: newDebtor.name,
        customerPhone: newDebtor.phone,
        totalDebt: newDebtor.initialDebt,
        dueDate: newDebtor.dueDate ? new Date(newDebtor.dueDate) : undefined,
        transactions: [{
          id: Date.now().toString(),
          debtId: Date.now().toString(),
          type: 'memberi',
          amount: newDebtor.initialDebt,
          catatan: 'Hutang awal',
          tanggal: new Date(), // Auto-filled date
          createdAt: new Date()
        }],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      onDebtUpdated(debt)
      setNewDebtor({ name: '', phone: '', initialDebt: 0, dueDate: '' })
      setIsAddDebtorDialogOpen(false)
      
      toast.success('Debitor baru berhasil ditambahkan!', {
        description: `${debt.customerName} dengan hutang ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(debt.totalDebt)}`
      })
      
    } else {
      toast.error('Mohon lengkapi nama dan jumlah hutang awal!')
    }
  }

  const handleAddTransaction = () => {
    if (selectedDebt && newTransaction.amount > 0 && newTransaction.catatan) {
      try {
        const transaction: DebtTransaction = {
          id: Date.now().toString(),
          debtId: selectedDebt.id,
          type: transactionType,
          amount: newTransaction.amount,
          catatan: newTransaction.catatan,
          tanggal: new Date(), // Auto-filled with today's date
          createdAt: new Date()
        }

        onDebtTransactionAdded(selectedDebt.id, transaction)
        setNewTransaction({ amount: 0, catatan: '' })
        setIsTransactionDialogOpen(false)
        
        toast.success(`${transactionType === 'memberi' ? 'Hutang ditambahkan!' : 'Pembayaran berhasil!'}`, {
          description: `${transactionType === 'memberi' ? 'Menambah' : 'Mengurangi'} hutang sebesar ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(newTransaction.amount)}`
        })
        
      } catch (error) {
        console.error('Error adding debt transaction:', error)
        toast.error('Gagal memproses transaksi hutang!')
      }
    } else {
      toast.error('Mohon lengkapi jumlah dan catatan!')
    }
  }

  // FIXED: Properly working "Lunaskan" button
  const handlePayOffDebt = () => {
    if (selectedDebt && selectedDebt.totalDebt > 0) {
      try {
        const transaction: DebtTransaction = {
          id: Date.now().toString(),
          debtId: selectedDebt.id,
          type: 'menerima',
          amount: selectedDebt.totalDebt,
          catatan: 'Pelunasan hutang lengkap',
          tanggal: new Date(),
          createdAt: new Date()
        }

        onDebtTransactionAdded(selectedDebt.id, transaction)
        
        // Update the selected debt immediately to reflect changes
        const updatedDebt = debts.find(d => d.id === selectedDebt.id)
        if (updatedDebt) {
          setSelectedDebt(updatedDebt)
        }
        
        toast.success('Hutang berhasil dilunasi!', {
          description: `Hutang ${selectedDebt.customerName} telah dilunasi sepenuhnya`
        })
        
      } catch (error) {
        console.error('Error paying off debt:', error)
        toast.error('Gagal melunasi hutang!')
      }
    } else {
      toast.error('Tidak ada hutang yang perlu dilunasi!')
    }
  }

  const handleDueDateUpdate = (newDate: string) => {
    if (selectedDebt) {
      const updatedDebt = {
        ...selectedDebt,
        dueDate: newDate ? new Date(newDate) : undefined,
        updatedAt: new Date()
      }
      onDebtUpdated(updatedDebt)
      setSelectedDebt(updatedDebt)
    }
  }

  if (selectedDebt) {
    // Find the current debt data (in case it was updated)
    const currentDebt = debts.find(d => d.id === selectedDebt.id) || selectedDebt
    
    return (
      <div className="p-6 space-y-6 bg-background min-h-screen">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => setSelectedDebt(null)}
            className="hover:bg-accent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Detail Hutang - {currentDebt.customerName}</h1>
            <p className="text-muted-foreground mt-1">Kelola hutang piutang customer</p>
          </div>
        </div>

        {/* Debt Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <DollarSign className="w-5 h-5" />
                Total Hutang
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600 mb-4">
                {formatRupiah(currentDebt.totalDebt)}
              </div>
              <Button 
                onClick={handlePayOffDebt}
                disabled={currentDebt.totalDebt <= 0}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Lunaskan
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-600">
                <Calendar className="w-5 h-5" />
                Tanggal Jatuh Tempo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="date"
                value={currentDebt.dueDate ? new Date(currentDebt.dueDate).toISOString().split('T')[0] : ''}
                onChange={(e) => handleDueDateUpdate(e.target.value)}
                className="mb-4"
              />
              {currentDebt.dueDate && (
                <p className="text-sm text-muted-foreground">
                  Jatuh tempo: {new Date(currentDebt.dueDate).toLocaleDateString('id-ID')}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Transaksi</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Catatan (Kategori)</TableHead>
                    <TableHead>Memberi / Menerima</TableHead>
                    <TableHead>Jumlah</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentDebt.transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="text-sm">
                        {new Date(transaction.tanggal).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell className="font-medium">{transaction.catatan}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={transaction.type === 'memberi' 
                            ? 'border-red-200 text-red-800 bg-red-50 dark:bg-red-950/20 dark:text-red-400' 
                            : 'border-green-200 text-green-800 bg-green-50 dark:bg-green-950/20 dark:text-green-400'
                          }
                        >
                          {transaction.type === 'memberi' ? 'Memberi' : 'Menerima'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={transaction.type === 'memberi' ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                          {transaction.type === 'memberi' ? '+' : '-'}{formatRupiah(transaction.amount)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Memberi Button */}
          <Dialog open={isTransactionDialogOpen && transactionType === 'memberi'} onOpenChange={(open) => {
            setIsTransactionDialogOpen(open)
            if (open) setTransactionType('memberi')
          }}>
            <DialogTrigger asChild>
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Memberi (Tambah Hutang)
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Hutang</DialogTitle>
                <DialogDescription>
                  Tambah jumlah hutang untuk {currentDebt.customerName}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Jumlah</Label>
                  <Input
                    type="number"
                    value={newTransaction.amount || ''}
                    onChange={(e) => setNewTransaction({ ...newTransaction, amount: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Catatan</Label>
                  <Textarea
                    value={newTransaction.catatan}
                    onChange={(e) => setNewTransaction({ ...newTransaction, catatan: e.target.value })}
                    placeholder="Deskripsi transaksi"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsTransactionDialogOpen(false)}>
                  Batal
                </Button>
                <Button 
                  onClick={handleAddTransaction} 
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={!newTransaction.amount || !newTransaction.catatan}
                >
                  Simpan
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Menerima Button */}
          <Dialog open={isTransactionDialogOpen && transactionType === 'menerima'} onOpenChange={(open) => {
            setIsTransactionDialogOpen(open)
            if (open) setTransactionType('menerima')
          }}>
            <DialogTrigger asChild>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                <CreditCard className="w-4 h-4 mr-2" />
                Menerima (Bayar Hutang)
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Terima Pembayaran</DialogTitle>
                <DialogDescription>
                  Terima pembayaran hutang dari {currentDebt.customerName}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Jumlah</Label>
                  <Input
                    type="number"
                    value={newTransaction.amount || ''}
                    onChange={(e) => setNewTransaction({ ...newTransaction, amount: Math.min(parseInt(e.target.value) || 0, currentDebt.totalDebt) })}
                    placeholder="0"
                    max={currentDebt.totalDebt}
                  />
                  <p className="text-xs text-muted-foreground">
                    Maksimal: {formatRupiah(currentDebt.totalDebt)}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Catatan</Label>
                  <Textarea
                    value={newTransaction.catatan}
                    onChange={(e) => setNewTransaction({ ...newTransaction, catatan: e.target.value })}
                    placeholder="Deskripsi pembayaran"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsTransactionDialogOpen(false)}>
                  Batal
                </Button>
                <Button 
                  onClick={handleAddTransaction} 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={!newTransaction.amount || !newTransaction.catatan}
                >
                  Simpan
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Hutang Piutang</h1>
          <p className="text-muted-foreground mt-1">Kelola hutang piutang customer</p>
        </div>

        <Dialog open={isAddDebtorDialogOpen} onOpenChange={setIsAddDebtorDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2">
              <UserPlus className="w-4 h-4 mr-2" />
              Tambah Debitor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Debitor Baru</DialogTitle>
              <DialogDescription>
                Tambah customer dengan hutang awal.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nama Customer</Label>
                <Input
                  value={newDebtor.name}
                  onChange={(e) => setNewDebtor({ ...newDebtor, name: e.target.value })}
                  placeholder="Nama lengkap"
                />
              </div>
              <div className="space-y-2">
                <Label>No. Telepon (Opsional)</Label>
                <Input
                  value={newDebtor.phone}
                  onChange={(e) => setNewDebtor({ ...newDebtor, phone: e.target.value })}
                  placeholder="Nomor telepon"
                />
              </div>
              <div className="space-y-2">
                <Label>Hutang Awal</Label>
                <Input
                  type="number"
                  value={newDebtor.initialDebt || ''}
                  onChange={(e) => setNewDebtor({ ...newDebtor, initialDebt: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Tanggal Jatuh Tempo (Opsional)</Label>
                <Input
                  type="date"
                  value={newDebtor.dueDate}
                  onChange={(e) => setNewDebtor({ ...newDebtor, dueDate: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsAddDebtorDialogOpen(false)}>
                Batal
              </Button>
              <Button 
                onClick={handleAddDebtor}
                disabled={!newDebtor.name || !newDebtor.initialDebt}
              >
                Simpan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Total Debt Summary - Top Right */}
      <div className="flex justify-end">
        <Card className="w-80 border-2 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <DollarSign className="w-6 h-6" />
              Total Semua Hutang
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {formatRupiah(totalAllDebt)}
            </div>
            <p className="text-muted-foreground mt-2">
              Dari {debts.length} debitor
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Debtor List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Debitor</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Total Hutang</TableHead>
                  <TableHead>Kontak</TableHead>
                  <TableHead>Jatuh Tempo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {debts.map((debt) => {
                  const isOverdue = debt.dueDate && new Date(debt.dueDate) < new Date()
                  const isPaidOff = debt.totalDebt <= 0
                  
                  return (
                    <TableRow key={debt.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{debt.customerName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${isPaidOff ? 'text-green-600' : 'text-red-600'}`}>
                          {formatRupiah(debt.totalDebt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {debt.customerPhone && (
                          <span className="text-sm text-muted-foreground">{debt.customerPhone}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {debt.dueDate ? (
                          <span className={`text-sm ${isOverdue ? 'text-red-600' : 'text-muted-foreground'}`}>
                            {new Date(debt.dueDate).toLocaleDateString('id-ID')}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={
                            isPaidOff ? 'border-green-200 text-green-800 bg-green-50 dark:bg-green-950/20 dark:text-green-400' : 
                            isOverdue ? 'border-red-200 text-red-800 bg-red-50 dark:bg-red-950/20 dark:text-red-400' : 
                            'border-yellow-200 text-yellow-800 bg-yellow-50 dark:bg-yellow-950/20 dark:text-yellow-400'
                          }
                        >
                          {isPaidOff ? 'Lunas' : isOverdue ? 'Overdue' : 'Aktif'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedDebt(debt)}
                          className="hover:bg-accent"
                        >
                          Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {debts.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-muted/30 rounded-xl p-8 border border-border">
            <p className="text-muted-foreground">Belum ada data hutang piutang.</p>
          </div>
        </div>
      )}
    </div>
  )
}