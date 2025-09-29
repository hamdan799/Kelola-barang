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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog'
import { ArrowLeft, DollarSign, Calendar, Plus, CheckCircle, User, UserPlus, CreditCard, Download, MessageCircle, AlertTriangle, Phone } from 'lucide-react'
import type { Debt, DebtTransaction } from '../types/financial'

interface EnhancedDebtManagementProps {
  debts: Debt[]
  onDebtUpdated: (debt: Debt) => void
  onDebtTransactionAdded: (debtId: string, transaction: DebtTransaction) => void
  onDebtDeleted: (debtId: string) => void
}

export function EnhancedDebtManagement({ 
  debts, 
  onDebtUpdated, 
  onDebtTransactionAdded,
  onDebtDeleted
}: EnhancedDebtManagementProps) {
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

  const isOverdue = (dueDate?: Date) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  const getDaysOverdue = (dueDate: Date) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = today.getTime() - due.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

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
        catatan: 'Pelunasan hutang lengkap',
        tanggal: new Date(),
        createdAt: new Date()
      }

      onDebtTransactionAdded(selectedDebt.id, transaction)
      
      const updatedDebt = debts.find(d => d.id === selectedDebt.id)
      if (updatedDebt) {
        setSelectedDebt(updatedDebt)
      }
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

  const handleSendWhatsApp = (debt: Debt) => {
    if (!debt.customerPhone) {
      alert('Nomor telepon customer tidak tersedia')
      return
    }

    const message = `Halo ${debt.customerName}, 

Kami ingin mengingatkan bahwa Anda memiliki tagihan sebesar ${formatRupiah(debt.totalDebt)} yang perlu diselesaikan.

${debt.dueDate ? `Jatuh tempo: ${new Date(debt.dueDate).toLocaleDateString('id-ID')}` : ''}

Mohon segera melakukan pembayaran. Terima kasih.

*TOKO SERBA ADA*`

    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/62${debt.customerPhone.replace(/^0/, '')}?text=${encodedMessage}`
    
    window.open(whatsappUrl, '_blank')
  }

  const handleSendSMS = (debt: Debt) => {
    if (!debt.customerPhone) {
      alert('Nomor telepon customer tidak tersedia')
      return
    }

    const message = `Tagihan ${debt.customerName}: ${formatRupiah(debt.totalDebt)}. ${debt.dueDate ? `Jatuh tempo: ${new Date(debt.dueDate).toLocaleDateString('id-ID')}` : ''} Mohon segera bayar. TOKO SERBA ADA`
    
    const smsUrl = `sms:${debt.customerPhone}?body=${encodeURIComponent(message)}`
    window.location.href = smsUrl
  }

  const exportToPDF = () => {
    // Simple PDF export simulation
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Laporan Hutang Piutang</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .overdue { color: red; font-weight: bold; }
            .header { text-align: center; margin-bottom: 30px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>LAPORAN HUTANG PIUTANG</h1>
            <p>Tanggal: ${new Date().toLocaleDateString('id-ID')}</p>
            <p>Total Hutang: ${formatRupiah(totalAllDebt)}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Nama Customer</th>
                <th>Telepon</th>
                <th>Total Hutang</th>
                <th>Jatuh Tempo</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${debts.map(debt => `
                <tr>
                  <td>${debt.customerName}</td>
                  <td>${debt.customerPhone || '-'}</td>
                  <td>${formatRupiah(debt.totalDebt)}</td>
                  <td>${debt.dueDate ? new Date(debt.dueDate).toLocaleDateString('id-ID') : '-'}</td>
                  <td class="${isOverdue(debt.dueDate) ? 'overdue' : ''}">
                    ${debt.totalDebt <= 0 ? 'Lunas' : isOverdue(debt.dueDate) ? `Terlambat ${getDaysOverdue(debt.dueDate!)} hari` : 'Aktif'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
      printWindow.close()
    }
  }

  const exportToExcel = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Nama Customer,Telepon,Total Hutang,Jatuh Tempo,Status\n"
      + debts.map(debt => 
          `"${debt.customerName}","${debt.customerPhone || ''}","${debt.totalDebt}","${debt.dueDate ? new Date(debt.dueDate).toLocaleDateString('id-ID') : ''}","${debt.totalDebt <= 0 ? 'Lunas' : isOverdue(debt.dueDate) ? 'Overdue' : 'Aktif'}"`
        ).join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `hutang-piutang-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (selectedDebt) {
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
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-semibold text-foreground">Detail Hutang - {currentDebt.customerName}</h1>
              {isOverdue(currentDebt.dueDate) && (
                <Badge className="bg-red-500 text-white animate-pulse">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Terlambat {getDaysOverdue(currentDebt.dueDate!)} hari
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">Kelola hutang piutang customer</p>
          </div>
          
          {/* Contact Actions */}
          {currentDebt.customerPhone && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSendWhatsApp(currentDebt)}
                className="text-green-600 border-green-200 hover:bg-green-50"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSendSMS(currentDebt)}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <Phone className="w-4 h-4 mr-1" />
                SMS
              </Button>
            </div>
          )}
        </div>

        {/* Debt Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className={isOverdue(currentDebt.dueDate) ? 'border-red-200 bg-red-50 dark:bg-red-950/10' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <DollarSign className="w-5 h-5" />
                Total Hutang
                {isOverdue(currentDebt.dueDate) && (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                )}
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
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Jatuh tempo: {new Date(currentDebt.dueDate).toLocaleDateString('id-ID')}
                  </p>
                  {isOverdue(currentDebt.dueDate) && (
                    <p className="text-sm text-red-600 font-medium">
                      ⚠️ Terlambat {getDaysOverdue(currentDebt.dueDate)} hari
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Perubahan Hutang</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Catatan (Kategori)</TableHead>
                    <TableHead>Memberi / Menerima</TableHead>
                    <TableHead>Nominal</TableHead>
                    <TableHead>Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentDebt.transactions
                    .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
                    .map((transaction, index, arr) => {
                      // Calculate running balance
                      let runningBalance = 0
                      for (let i = arr.length - 1; i >= index; i--) {
                        const t = arr[i]
                        if (t.type === 'memberi') {
                          runningBalance += t.amount
                        } else {
                          runningBalance -= t.amount
                        }
                      }
                      
                      return (
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
                          <TableCell>
                            <span className="font-medium">
                              {formatRupiah(Math.max(0, runningBalance))}
                            </span>
                          </TableCell>
                        </TableRow>
                      )
                    })}
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
                <div className="text-sm text-muted-foreground">
                  Tanggal: {new Date().toLocaleDateString('id-ID')} (otomatis)
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
                    onChange={(e) => setNewTransaction({ 
                      ...newTransaction, 
                      amount: Math.min(parseInt(e.target.value) || 0, currentDebt.totalDebt) 
                    })}
                    placeholder="0"
                    max={currentDebt.totalDebt}
                  />
                  <p className="text-xs text-muted-foreground">
                    Maksimal: {formatRupiah(currentDebt.totalDebt)}
                  </p>
                  {newTransaction.amount > 0 && newTransaction.amount < currentDebt.totalDebt && (
                    <p className="text-xs text-yellow-600">
                      Sisa setelah pembayaran: {formatRupiah(currentDebt.totalDebt - newTransaction.amount)}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Catatan</Label>
                  <Textarea
                    value={newTransaction.catatan}
                    onChange={(e) => setNewTransaction({ ...newTransaction, catatan: e.target.value })}
                    placeholder="Deskripsi pembayaran"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  Tanggal: {new Date().toLocaleDateString('id-ID')} (otomatis)
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

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={exportToPDF}
            className="px-4 py-2"
          >
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          
          <Button
            variant="outline"
            onClick={exportToExcel}
            className="px-4 py-2"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>

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
                    placeholder="08xxxxxxxxxx"
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
            <div className="mt-3 text-sm">
              <p className="text-green-600">
                Lunas: {debts.filter(d => d.totalDebt <= 0).length} debitor
              </p>
              <p className="text-red-600">
                Overdue: {debts.filter(d => isOverdue(d.dueDate)).length} debitor
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Notifications */}
      {debts.filter(d => isOverdue(d.dueDate) && d.totalDebt > 0).length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Peringatan Jatuh Tempo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {debts.filter(d => isOverdue(d.dueDate) && d.totalDebt > 0).map(debt => (
                <div key={debt.id} className="flex items-center justify-between p-2 bg-white dark:bg-red-900/20 rounded border border-red-200">
                  <div>
                    <p className="font-medium text-red-700">{debt.customerName}</p>
                    <p className="text-sm text-red-600">
                      Terlambat {getDaysOverdue(debt.dueDate!)} hari - {formatRupiah(debt.totalDebt)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {debt.customerPhone && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSendWhatsApp(debt)}
                          className="text-green-600 border-green-200"
                        >
                          <MessageCircle className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSendSMS(debt)}
                          className="text-blue-600 border-blue-200"
                        >
                          <Phone className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedDebt(debt)}
                    >
                      Detail
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
                  const isDebtOverdue = isOverdue(debt.dueDate)
                  const isPaidOff = debt.totalDebt <= 0
                  
                  return (
                    <TableRow 
                      key={debt.id} 
                      className={isDebtOverdue && !isPaidOff ? 'bg-red-50 dark:bg-red-950/10 border-red-200' : ''}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{debt.customerName}</span>
                          {isDebtOverdue && !isPaidOff && (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          )}
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
                          <div>
                            <span className={`text-sm ${isDebtOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                              {new Date(debt.dueDate).toLocaleDateString('id-ID')}
                            </span>
                            {isDebtOverdue && !isPaidOff && (
                              <p className="text-xs text-red-600">
                                Terlambat {getDaysOverdue(debt.dueDate)} hari
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={
                            isPaidOff ? 'border-green-200 text-green-800 bg-green-50 dark:bg-green-950/20 dark:text-green-400' : 
                            isDebtOverdue ? 'border-red-200 text-red-800 bg-red-50 dark:bg-red-950/20 dark:text-red-400' : 
                            'border-yellow-200 text-yellow-800 bg-yellow-50 dark:bg-yellow-950/20 dark:text-yellow-400'
                          }
                        >
                          {isPaidOff ? 'Lunas' : isDebtOverdue ? 'Overdue' : 'Aktif'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {debt.customerPhone && !isPaidOff && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSendWhatsApp(debt)}
                                className="h-8 w-8 p-0 text-green-600 border-green-200"
                                title="WhatsApp"
                              >
                                <MessageCircle className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSendSMS(debt)}
                                className="h-8 w-8 p-0 text-blue-600 border-blue-200"
                                title="SMS"
                              >
                                <Phone className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedDebt(debt)}
                            className="hover:bg-accent"
                          >
                            Detail
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
                                <AlertDialogTitle>Hapus Debitor</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Apakah Anda yakin ingin menghapus data hutang {debt.customerName}? 
                                  Aksi ini tidak dapat dibatalkan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => onDebtDeleted(debt.id)}
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