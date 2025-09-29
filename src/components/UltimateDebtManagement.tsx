import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { Textarea } from './ui/textarea'
import { ScrollArea } from './ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Progress } from './ui/progress'
import { ArrowLeft, DollarSign, Calendar, Plus, CheckCircle, User, UserPlus, CreditCard, Download, MessageCircle, Phone, Trash2, FileText, Archive, RefreshCw, TrendingUp, TrendingDown, AlertTriangle, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import type { Debt, DebtTransaction } from '../types/financial'

interface UltimateDebtManagementProps {
  debts: Debt[]
  onDebtUpdated: (debt: Debt) => void
  onDebtTransactionAdded: (debtId: string, transaction: DebtTransaction) => void
  onDebtDeleted: (debtId: string) => void
  onDebtArchived?: (debtId: string) => void
}

interface DebtFilter {
  status: 'all' | 'active' | 'paid' | 'overdue' | 'negative'
  search: string
  sortBy: 'name' | 'amount' | 'date' | 'dueDate'
  sortOrder: 'asc' | 'desc'
}

interface ExportProgress {
  isExporting: boolean
  progress: number
  currentStep: string
}

export function UltimateDebtManagement({ 
  debts, 
  onDebtUpdated, 
  onDebtTransactionAdded, 
  onDebtDeleted,
  onDebtArchived 
}: UltimateDebtManagementProps) {
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null)
  const [isAddDebtorDialogOpen, setIsAddDebtorDialogOpen] = useState(false)
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false)
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false)
  const [transactionType, setTransactionType] = useState<'memberi' | 'menerima'>('memberi')
  const [showArchived, setShowArchived] = useState(false)
  
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

  const [refundAmount, setRefundAmount] = useState(0)

  const [filter, setFilter] = useState<DebtFilter>({
    status: 'all',
    search: '',
    sortBy: 'date',
    sortOrder: 'desc'
  })

  const [exportProgress, setExportProgress] = useState<ExportProgress>({
    isExporting: false,
    progress: 0,
    currentStep: ''
  })

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

  // Filter and sort debts
  const filteredDebts = debts
    .filter(debt => {
      // Search filter
      if (filter.search && !debt.customerName.toLowerCase().includes(filter.search.toLowerCase())) {
        return false
      }

      // Status filter
      switch (filter.status) {
        case 'active':
          return debt.totalDebt > 0
        case 'paid':
          return debt.totalDebt === 0
        case 'negative':
          return debt.totalDebt < 0 // Store owes customer
        case 'overdue':
          return debt.dueDate && new Date(debt.dueDate) < new Date() && debt.totalDebt > 0
        default:
          return true
      }
    })
    .sort((a, b) => {
      const multiplier = filter.sortOrder === 'asc' ? 1 : -1
      
      switch (filter.sortBy) {
        case 'name':
          return a.customerName.localeCompare(b.customerName) * multiplier
        case 'amount':
          return (a.totalDebt - b.totalDebt) * multiplier
        case 'date':
          return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * multiplier
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1 * multiplier
          if (!b.dueDate) return -1 * multiplier
          return (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) * multiplier
        default:
          return 0
      }
    })

  const totalCustomerDebt = debts.reduce((sum, debt) => sum + Math.max(0, debt.totalDebt), 0)
  const totalStoreDebt = debts.reduce((sum, debt) => sum + Math.abs(Math.min(0, debt.totalDebt)), 0)
  const overdueDebts = debts.filter(debt => 
    debt.dueDate && new Date(debt.dueDate) < new Date() && debt.totalDebt > 0
  ).length

  const handleAddDebtor = () => {
    if (newDebtor.name && newDebtor.initialDebt !== 0) {
      try {
        const debt: Debt = {
          id: Date.now().toString(),
          customerName: newDebtor.name,
          customerPhone: newDebtor.phone,
          totalDebt: newDebtor.initialDebt,
          dueDate: newDebtor.dueDate ? new Date(newDebtor.dueDate) : undefined,
          transactions: [{
            id: Date.now().toString(),
            debtId: Date.now().toString(),
            type: newDebtor.initialDebt > 0 ? 'memberi' : 'menerima',
            amount: Math.abs(newDebtor.initialDebt),
            catatan: newDebtor.initialDebt > 0 ? 'Hutang awal' : 'Kredit awal (pelanggan overpaid)',
            tanggal: new Date(),
            createdAt: new Date()
          }],
          createdAt: new Date(),
          updatedAt: new Date()
        }

        onDebtUpdated(debt)
        setNewDebtor({ name: '', phone: '', initialDebt: 0, dueDate: '' })
        setIsAddDebtorDialogOpen(false)
        
        toast.success('Debitor baru berhasil ditambahkan!', {
          description: `${debt.customerName} dengan ${debt.totalDebt >= 0 ? 'hutang' : 'kredit'} ${formatRupiah(Math.abs(debt.totalDebt))}`
        })
        
      } catch (error) {
        console.error('Error adding debtor:', error)
        toast.error('Gagal menambahkan debtor!')
      }
    } else {
      toast.error('Mohon lengkapi nama dan jumlah!')
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
          tanggal: new Date(),
          createdAt: new Date()
        }

        onDebtTransactionAdded(selectedDebt.id, transaction)
        setNewTransaction({ amount: 0, catatan: '' })
        setIsTransactionDialogOpen(false)
        
        const actionText = transactionType === 'memberi' ? 'Hutang ditambahkan!' : 'Pembayaran berhasil!'
        const descriptionText = transactionType === 'memberi' 
          ? `Menambah hutang sebesar ${formatRupiah(newTransaction.amount)}`
          : `Mengurangi hutang sebesar ${formatRupiah(newTransaction.amount)}`
        
        toast.success(actionText, { description: descriptionText })
        
      } catch (error) {
        console.error('Error adding debt transaction:', error)
        toast.error('Gagal memproses transaksi hutang!')
      }
    } else {
      toast.error('Mohon lengkapi jumlah dan catatan!')
    }
  }

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

  const handleRefundCredit = () => {
    if (selectedDebt && selectedDebt.totalDebt < 0 && refundAmount > 0) {
      const maxRefund = Math.abs(selectedDebt.totalDebt)
      const actualRefund = Math.min(refundAmount, maxRefund)
      
      try {
        const transaction: DebtTransaction = {
          id: Date.now().toString(),
          debtId: selectedDebt.id,
          type: 'memberi',
          amount: actualRefund,
          catatan: 'Refund kredit pelanggan',
          tanggal: new Date(),
          createdAt: new Date()
        }

        onDebtTransactionAdded(selectedDebt.id, transaction)
        setRefundAmount(0)
        setIsRefundDialogOpen(false)
        
        toast.success('Refund berhasil diproses!', {
          description: `Refund sebesar ${formatRupiah(actualRefund)} kepada ${selectedDebt.customerName}`
        })
        
      } catch (error) {
        console.error('Error processing refund:', error)
        toast.error('Gagal memproses refund!')
      }
    }
  }

  const handleDeleteDebt = (debtId: string, isArchive: boolean = false) => {
    try {
      if (isArchive && onDebtArchived) {
        onDebtArchived(debtId)
        toast.success('Hutang berhasil diarsipkan!')
      } else {
        onDebtDeleted(debtId)
        toast.success('Hutang berhasil dihapus!')
      }
      setSelectedDebt(null)
    } catch (error) {
      console.error('Error deleting debt:', error)
      toast.error('Gagal menghapus hutang!')
    }
  }

  const generateWAReminder = (debt: Debt) => {
    const message = encodeURIComponent(
      `Halo ${debt.customerName},\n\n` +
      `Kami ingin mengingatkan bahwa Anda memiliki hutang sebesar ${formatRupiah(debt.totalDebt)}.\n` +
      `${debt.dueDate ? `Jatuh tempo: ${formatDate(debt.dueDate)}\n` : ''}` +
      `\nMohon untuk segera melakukan pembayaran.\n\n` +
      `Terima kasih!\n` +
      `${JSON.parse(localStorage.getItem('inventory_storeSettings') || '{}').name || 'Toko Anda'}`
    )
    
    const waUrl = `https://wa.me/${debt.customerPhone?.replace(/[^\d]/g, '')}?text=${message}`
    window.open(waUrl, '_blank')
    
    toast.success('Link WhatsApp dibuka!', {
      description: 'Kirim pesan pengingat kepada pelanggan'
    })
  }

  const exportToPDF = async () => {
    setExportProgress({ isExporting: true, progress: 20, currentStep: 'Mempersiapkan data...' })
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setExportProgress({ isExporting: true, progress: 50, currentStep: 'Membuat PDF...' })
      
      // Create PDF content
      const pdfContent = filteredDebts.map(debt => ({
        nama: debt.customerName,
        telepon: debt.customerPhone || '-',
        hutang: formatRupiah(debt.totalDebt),
        jatuhTempo: debt.dueDate ? formatDate(debt.dueDate) : '-',
        status: debt.totalDebt > 0 ? 'Hutang' : debt.totalDebt < 0 ? 'Kredit' : 'Lunas'
      }))
      
      await new Promise(resolve => setTimeout(resolve, 500))
      setExportProgress({ isExporting: true, progress: 80, currentStep: 'Finalisasi...' })
      
      // Convert to CSV for now (PDF generation would require additional library)
      const csvContent = [
        ['Nama', 'Telepon', 'Hutang/Kredit', 'Jatuh Tempo', 'Status'],
        ...pdfContent.map(row => [row.nama, row.telepon, row.hutang, row.jatuhTempo, row.status])
      ].map(row => row.join(',')).join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `hutang-piutang-${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      URL.revokeObjectURL(url)
      
      setExportProgress({ isExporting: true, progress: 100, currentStep: 'Selesai!' })
      
      setTimeout(() => {
        setExportProgress({ isExporting: false, progress: 0, currentStep: '' })
        toast.success('Data hutang berhasil diekspor!')
      }, 1000)
      
    } catch (error) {
      console.error('Export failed:', error)
      setExportProgress({ isExporting: false, progress: 0, currentStep: '' })
      toast.error('Gagal mengekspor data!')
    }
  }

  const exportToExcel = async () => {
    try {
      const excelData = filteredDebts.map(debt => ({
        'Nama Pelanggan': debt.customerName,
        'Telepon': debt.customerPhone || '',
        'Hutang/Kredit': debt.totalDebt,
        'Hutang Formatted': formatRupiah(debt.totalDebt),
        'Jatuh Tempo': debt.dueDate ? new Date(debt.dueDate).toLocaleDateString('id-ID') : '',
        'Status': debt.totalDebt > 0 ? 'Hutang' : debt.totalDebt < 0 ? 'Kredit' : 'Lunas',
        'Dibuat': new Date(debt.createdAt).toLocaleDateString('id-ID'),
        'Terakhir Update': new Date(debt.updatedAt).toLocaleDateString('id-ID'),
        'Total Transaksi': debt.transactions.length
      }))
      
      // Convert to CSV format (Excel-compatible)
      const headers = Object.keys(excelData[0] || {})
      const csvContent = [
        headers.join(','),
        ...excelData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
      ].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `hutang-piutang-detail-${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      URL.revokeObjectURL(url)
      
      toast.success('Data Excel berhasil diekspor!')
    } catch (error) {
      console.error('Excel export failed:', error)
      toast.error('Gagal mengekspor data Excel!')
    }
  }

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Manajemen Hutang Piutang</h1>
          <p className="text-muted-foreground mt-1">Kelola hutang pelanggan dan kredit toko</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToPDF} variant="outline" size="sm" disabled={exportProgress.isExporting}>
            <FileText className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button onClick={exportToExcel} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Export Progress */}
      {exportProgress.isExporting && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{exportProgress.currentStep}</span>
                <span>{exportProgress.progress}%</span>
              </div>
              <Progress value={exportProgress.progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Hutang Pelanggan</p>
                <p className="text-2xl font-bold text-red-600">{formatRupiah(totalCustomerDebt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Hutang Saya (Kredit)</p>
                <p className="text-2xl font-bold text-green-600">{formatRupiah(totalStoreDebt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Jatuh Tempo</p>
                <p className="text-2xl font-bold text-orange-600">{overdueDebts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <User className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Debitor</p>
                <p className="text-2xl font-bold text-blue-600">{debts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Pencarian</Label>
              <Input
                placeholder="Cari nama pelanggan..."
                value={filter.search}
                onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
            
            <div>
              <Label>Status</Label>
              <Select 
                value={filter.status} 
                onValueChange={(value: any) => setFilter(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="active">Ada Hutang</SelectItem>
                  <SelectItem value="negative">Hutang Saya</SelectItem>
                  <SelectItem value="paid">Lunas</SelectItem>
                  <SelectItem value="overdue">Jatuh Tempo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Urutkan</Label>
              <Select 
                value={filter.sortBy} 
                onValueChange={(value: any) => setFilter(prev => ({ ...prev, sortBy: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nama</SelectItem>
                  <SelectItem value="amount">Jumlah</SelectItem>
                  <SelectItem value="date">Tanggal</SelectItem>
                  <SelectItem value="dueDate">Jatuh Tempo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Dialog open={isAddDebtorDialogOpen} onOpenChange={setIsAddDebtorDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Tambah Debitor
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tambah Debitor Baru</DialogTitle>
                    <DialogDescription>
                      Masukkan informasi debitor baru. Gunakan nilai negatif jika toko yang berhutang.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="debtor-name">Nama Lengkap *</Label>
                      <Input
                        id="debtor-name"
                        value={newDebtor.name}
                        onChange={(e) => setNewDebtor(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Nama pelanggan"
                      />
                    </div>

                    <div>
                      <Label htmlFor="debtor-phone">Nomor Telepon</Label>
                      <Input
                        id="debtor-phone"
                        value={newDebtor.phone}
                        onChange={(e) => setNewDebtor(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="08123456789"
                      />
                    </div>

                    <div>
                      <Label htmlFor="initial-debt">Jumlah Awal *</Label>
                      <Input
                        id="initial-debt"
                        type="number"
                        value={newDebtor.initialDebt}
                        onChange={(e) => setNewDebtor(prev => ({ ...prev, initialDebt: parseFloat(e.target.value) || 0 }))}
                        placeholder="Positif = hutang pelanggan, Negatif = hutang toko"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Positif: Pelanggan berhutang ke toko<br />
                        Negatif: Toko berhutang ke pelanggan (overpayment)
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="due-date">Jatuh Tempo (Opsional)</Label>
                      <Input
                        id="due-date"
                        type="date"
                        value={newDebtor.dueDate}
                        onChange={(e) => setNewDebtor(prev => ({ ...prev, dueDate: e.target.value }))}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddDebtorDialogOpen(false)}>
                        Batal
                      </Button>
                      <Button onClick={handleAddDebtor}>
                        Tambah Debitor
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Debt List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Hutang Piutang ({filteredDebts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {filteredDebts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Tidak ada data hutang ditemukan
                    </div>
                  ) : (
                    filteredDebts.map((debt) => (
                      <div
                        key={debt.id}
                        onClick={() => setSelectedDebt(debt)}
                        className={`
                          p-4 border rounded-lg cursor-pointer transition-all
                          ${selectedDebt?.id === debt.id 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50 hover:bg-accent/50'
                          }
                        `}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{debt.customerName}</h3>
                              {debt.totalDebt > 0 && (
                                <Badge variant="destructive">Hutang</Badge>
                              )}
                              {debt.totalDebt < 0 && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800">Hutang Saya</Badge>
                              )}
                              {debt.totalDebt === 0 && (
                                <Badge variant="outline">Lunas</Badge>
                              )}
                              {debt.dueDate && new Date(debt.dueDate) < new Date() && debt.totalDebt > 0 && (
                                <Badge variant="destructive">Jatuh Tempo</Badge>
                              )}
                            </div>
                            
                            <p className="text-sm text-muted-foreground">
                              {debt.customerPhone || 'Tidak ada telepon'}
                            </p>
                            
                            {debt.dueDate && (
                              <p className="text-xs text-muted-foreground">
                                Jatuh tempo: {formatDate(debt.dueDate)}
                              </p>
                            )}
                          </div>

                          <div className="text-right">
                            <div className={`text-lg font-bold ${
                              debt.totalDebt > 0 ? 'text-red-600' : 
                              debt.totalDebt < 0 ? 'text-green-600' : 
                              'text-muted-foreground'
                            }`}>
                              {debt.totalDebt > 0 ? '+' : debt.totalDebt < 0 ? '-' : ''}
                              {formatRupiah(Math.abs(debt.totalDebt))}
                            </div>
                            
                            {debt.totalDebt !== 0 && debt.customerPhone && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  generateWAReminder(debt)
                                }}
                                className="mt-1"
                              >
                                <MessageCircle className="w-3 h-3 mr-1" />
                                WA
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Detail Panel */}
        <div>
          {selectedDebt ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{selectedDebt.customerName}</span>
                  <div className="flex gap-1">
                    {selectedDebt.customerPhone && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => generateWAReminder(selectedDebt)}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    )}
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Archive className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Arsipkan atau Hapus?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Pilih tindakan untuk debitor ini:
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteDebt(selectedDebt.id, true)}
                            className="bg-orange-600 hover:bg-orange-700"
                          >
                            Arsipkan
                          </AlertDialogAction>
                          <AlertDialogAction 
                            onClick={() => handleDeleteDebt(selectedDebt.id, false)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Hapus Permanen
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Debt Info */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Saldo:</span>
                    <span className={`font-bold ${
                      selectedDebt.totalDebt > 0 ? 'text-red-600' : 
                      selectedDebt.totalDebt < 0 ? 'text-green-600' : 
                      'text-muted-foreground'
                    }`}>
                      {selectedDebt.totalDebt > 0 ? 'Hutang ' : selectedDebt.totalDebt < 0 ? 'Kredit ' : 'Lunas '}
                      {formatRupiah(Math.abs(selectedDebt.totalDebt))}
                    </span>
                  </div>
                  
                  {selectedDebt.customerPhone && (
                    <div className="flex justify-between">
                      <span>Telepon:</span>
                      <span>{selectedDebt.customerPhone}</span>
                    </div>
                  )}
                  
                  {selectedDebt.dueDate && (
                    <div className="flex justify-between">
                      <span>Jatuh Tempo:</span>
                      <span className={new Date(selectedDebt.dueDate) < new Date() ? 'text-red-600' : ''}>
                        {formatDate(selectedDebt.dueDate)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  {selectedDebt.totalDebt > 0 && (
                    <Button
                      onClick={handlePayOffDebt}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Lunaskan Sekarang
                    </Button>
                  )}

                  {selectedDebt.totalDebt < 0 && (
                    <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Refund Kredit
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Refund Kredit Pelanggan</DialogTitle>
                          <DialogDescription>
                            Pelanggan memiliki kredit sebesar {formatRupiah(Math.abs(selectedDebt.totalDebt))}.
                            Masukkan jumlah yang akan direfund.
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="refund-amount">Jumlah Refund</Label>
                            <Input
                              id="refund-amount"
                              type="number"
                              value={refundAmount}
                              onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
                              placeholder="Jumlah refund"
                              max={Math.abs(selectedDebt.totalDebt)}
                            />
                            <p className="text-xs text-muted-foreground">
                              Maksimal: {formatRupiah(Math.abs(selectedDebt.totalDebt))}
                            </p>
                          </div>

                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsRefundDialogOpen(false)}>
                              Batal
                            </Button>
                            <Button onClick={handleRefundCredit}>
                              Proses Refund
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    {/* Add Debt Button */}
                    <Dialog open={isTransactionDialogOpen && transactionType === 'memberi'} onOpenChange={(open) => {
                      setIsTransactionDialogOpen(open)
                      if (open) setTransactionType('memberi')
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="text-red-600 border-red-200">
                          <Plus className="w-4 h-4 mr-1" />
                          Tambah Hutang
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Tambah Hutang</DialogTitle>
                          <DialogDescription>
                            Tambah hutang baru untuk {selectedDebt.customerName}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="debt-amount">Jumlah Hutang</Label>
                            <Input
                              id="debt-amount"
                              type="number"
                              value={newTransaction.amount}
                              onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                              placeholder="Jumlah hutang"
                            />
                          </div>

                          <div>
                            <Label htmlFor="debt-note">Catatan</Label>
                            <Textarea
                              id="debt-note"
                              value={newTransaction.catatan}
                              onChange={(e) => setNewTransaction(prev => ({ ...prev, catatan: e.target.value }))}
                              placeholder="Keterangan hutang"
                              rows={3}
                            />
                          </div>

                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsTransactionDialogOpen(false)}>
                              Batal
                            </Button>
                            <Button onClick={handleAddTransaction}>
                              Tambah Hutang
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Payment Button */}
                    <Dialog open={isTransactionDialogOpen && transactionType === 'menerima'} onOpenChange={(open) => {
                      setIsTransactionDialogOpen(open)
                      if (open) setTransactionType('menerima')
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="text-green-600 border-green-200">
                          <CreditCard className="w-4 h-4 mr-1" />
                          Terima Bayar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Terima Pembayaran</DialogTitle>
                          <DialogDescription>
                            Catat pembayaran dari {selectedDebt.customerName}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="payment-amount">Jumlah Pembayaran</Label>
                            <Input
                              id="payment-amount"
                              type="number"
                              value={newTransaction.amount}
                              onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                              placeholder="Jumlah yang dibayar"
                            />
                          </div>

                          <div>
                            <Label htmlFor="payment-note">Catatan</Label>
                            <Textarea
                              id="payment-note"
                              value={newTransaction.catatan}
                              onChange={(e) => setNewTransaction(prev => ({ ...prev, catatan: e.target.value }))}
                              placeholder="Keterangan pembayaran"
                              rows={3}
                            />
                          </div>

                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsTransactionDialogOpen(false)}>
                              Batal
                            </Button>
                            <Button onClick={handleAddTransaction}>
                              Catat Pembayaran
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Transaction History */}
                <div className="space-y-2">
                  <h4 className="font-medium">Riwayat Transaksi</h4>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {selectedDebt.transactions.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Belum ada transaksi
                        </p>
                      ) : (
                        selectedDebt.transactions.slice().reverse().map((transaction) => (
                          <div key={transaction.id} className="border rounded p-2">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="text-sm font-medium">
                                  {transaction.catatan}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(transaction.tanggal)}
                                </p>
                              </div>
                              <div className="text-right">
                                <Badge 
                                  variant={transaction.type === 'memberi' ? 'destructive' : 'secondary'}
                                  className={transaction.type === 'menerima' ? 'bg-green-100 text-green-800' : ''}
                                >
                                  {transaction.type === 'memberi' ? 'Hutang' : 'Bayar'}
                                </Badge>
                                <p className={`text-sm font-medium ${
                                  transaction.type === 'memberi' ? 'text-red-600' : 'text-green-600'
                                }`}>
                                  {transaction.type === 'memberi' ? '+' : '-'}{formatRupiah(transaction.amount)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Pilih debitor untuk melihat detail</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}