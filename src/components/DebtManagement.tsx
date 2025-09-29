import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { Textarea } from './ui/textarea'
import { ArrowLeft, DollarSign, Calendar, Plus, Minus, CheckCircle, User } from 'lucide-react'
import type { Debt, DebtTransaction } from '../types/financial'

interface DebtManagementProps {
  debts: Debt[]
  onDebtUpdated: (debt: Debt) => void
  onDebtTransactionAdded: (debtId: string, transaction: DebtTransaction) => void
}

export function DebtManagement({ debts, onDebtUpdated, onDebtTransactionAdded }: DebtManagementProps) {
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
          tanggal: new Date(),
          createdAt: new Date()
        }],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      onDebtUpdated(debt)
      setNewDebtor({ name: '', phone: '', initialDebt: 0, dueDate: '' })
      setIsAddDebtorDialogOpen(false)
    }
  }

  const handleAddTransaction = () => {
    if (selectedDebt && newTransaction.amount > 0 && newTransaction.catatan) {
      const transaction: DebtTransaction = {
        id: Date.now().toString(),
        debtId: selectedDebt.id,
        type: transactionType,
        amount: newTransaction.amount,
        catatan: newTransaction.catatan,
        tanggal: new Date(),
        createdAt: new Date()
      }

      onDebtTransactionAdded(selectedDebt.id, transaction)
      setNewTransaction({ amount: 0, catatan: '' })
      setIsTransactionDialogOpen(false)
    }
  }

  const handlePayOffDebt = () => {
    if (selectedDebt && selectedDebt.totalDebt > 0) {
      const transaction: DebtTransaction = {
        id: Date.now().toString(),
        debtId: selectedDebt.id,
        type: 'menerima',
        amount: selectedDebt.totalDebt,
        catatan: 'Pelunasan hutang',
        tanggal: new Date(),
        createdAt: new Date()
      }

      onDebtTransactionAdded(selectedDebt.id, transaction)
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
    }
  }

  if (selectedDebt) {
    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setSelectedDebt(null)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Detail Hutang - {selectedDebt.customerName}</h1>
            <p className="text-muted-foreground mt-1">Kelola hutang piutang customer</p>
          </div>
        </div>

        {/* Debt Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-red-600" />
                Total Hutang
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600 mb-4">
                {formatRupiah(selectedDebt.totalDebt)}
              </div>
              <Button 
                onClick={handlePayOffDebt}
                disabled={selectedDebt.totalDebt <= 0}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Lunaskan
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-yellow-600" />
                Tanggal Jatuh Tempo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="date"
                value={selectedDebt.dueDate ? new Date(selectedDebt.dueDate).toISOString().split('T')[0] : ''}
                onChange={(e) => handleDueDateUpdate(e.target.value)}
                className="mb-4"
              />
              {selectedDebt.dueDate && (
                <p className="text-sm text-muted-foreground">
                  Jatuh tempo: {new Date(selectedDebt.dueDate).toLocaleDateString('id-ID')}
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Catatan</TableHead>
                    <TableHead>Memberi / Menerima</TableHead>
                    <TableHead>Jumlah</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedDebt.transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="text-sm">
                        {new Date(transaction.tanggal).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell className="font-medium">{transaction.catatan}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={transaction.type === 'memberi' ? 'destructive' : 'default'}
                          className={transaction.type === 'memberi' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}
                        >
                          {transaction.type === 'memberi' ? 'Memberi' : 'Menerima'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={transaction.type === 'memberi' ? 'text-red-600' : 'text-green-600'}>
                          {transaction.type === 'memberi' ? '+' : '-'}{formatRupiah(transaction.amount)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Dialog open={isTransactionDialogOpen && transactionType === 'memberi'} onOpenChange={(open) => {
            setIsTransactionDialogOpen(open)
            if (open) setTransactionType('memberi')
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50">
                <Plus className="w-4 h-4 mr-2" />
                Memberi (Tambah Hutang)
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Hutang</DialogTitle>
                <DialogDescription>
                  Tambah jumlah hutang untuk {selectedDebt.customerName}
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
                <Button onClick={handleAddTransaction} className="bg-red-600 hover:bg-red-700">
                  Simpan
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isTransactionDialogOpen && transactionType === 'menerima'} onOpenChange={(open) => {
            setIsTransactionDialogOpen(open)
            if (open) setTransactionType('menerima')
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full border-green-200 text-green-600 hover:bg-green-50">
                <Minus className="w-4 h-4 mr-2" />
                Menerima (Bayar Hutang)
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Terima Pembayaran</DialogTitle>
                <DialogDescription>
                  Terima pembayaran hutang dari {selectedDebt.customerName}
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
                    max={selectedDebt.totalDebt}
                  />
                  <p className="text-xs text-muted-foreground">
                    Maksimal: {formatRupiah(selectedDebt.totalDebt)}
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
                <Button onClick={handleAddTransaction} className="bg-green-600 hover:bg-green-700">
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Hutang Piutang</h1>
          <p className="text-muted-foreground mt-1">Kelola hutang piutang customer</p>
        </div>

        <Dialog open={isAddDebtorDialogOpen} onOpenChange={setIsAddDebtorDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
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
              <Button onClick={handleAddDebtor} className="bg-primary hover:bg-primary/90">
                Simpan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Total Debt Summary */}
      <Card className="border-2 border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <DollarSign className="w-6 h-6" />
            Total Semua Hutang
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-red-600">
            {formatRupiah(totalAllDebt)}
          </div>
          <p className="text-muted-foreground mt-2">
            Dari {debts.length} debitor
          </p>
        </CardContent>
      </Card>

      {/* Debtor List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Debitor</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Kontak</TableHead>
                  <TableHead>Total Hutang</TableHead>
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
                        {debt.customerPhone && (
                          <span className="text-sm text-muted-foreground">{debt.customerPhone}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${isPaidOff ? 'text-green-600' : 'text-red-600'}`}>
                          {formatRupiah(debt.totalDebt)}
                        </span>
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
                          variant={isPaidOff ? 'default' : isOverdue ? 'destructive' : 'secondary'}
                          className={
                            isPaidOff ? 'bg-green-100 text-green-800' : 
                            isOverdue ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'
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
                        >
                          Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {debts.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-accent rounded-lg p-8">
            <p className="text-muted-foreground">Belum ada data hutang piutang.</p>
          </div>
        </div>
      )}
    </div>
  )
}