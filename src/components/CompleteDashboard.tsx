import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { TrendingUp, TrendingDown, Package, Plus, Star, Filter, ArrowUpRight } from 'lucide-react'
import type { StockLog, Receipt } from '../types/inventory'
import type { Transaction } from '../types/financial'

interface CompleteDashboardProps {
  stockLogs: StockLog[]
  receipts: Receipt[]
  transactions: Transaction[]
  onNavigateToFinancial: () => void
  onNavigateToTransaction: () => void
}

export function CompleteDashboard({ 
  stockLogs, 
  receipts, 
  transactions,
  onNavigateToFinancial,
  onNavigateToTransaction
}: CompleteDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('bulan-ini')

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
      case 'hari-ini':
        return itemDate.toDateString() === now.toDateString()
      case 'minggu-ini':
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
        return itemDate >= weekStart
      case 'bulan-ini':
        return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear()
      case 'tahun-ini':
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
  
  const totalExpenses = filteredTransactions.filter(t => t.type === 'pengeluaran').reduce((sum, t) => sum + t.nominal, 0)
  const totalProfit = totalRevenue - totalExpenses

  // Calculate stock movement (excluding deleted products)
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
    { nama: 'Headphone Sony WH-1000XM4', kategori: 'Elektronik', jumlahTerjual: 30, revenue: 135000000 },
    { nama: 'Coffee Maker Philips', kategori: 'Rumah Tangga', jumlahTerjual: 12, revenue: 14400000 },
    { nama: 'Air Fryer Xiaomi', kategori: 'Rumah Tangga', jumlahTerjual: 8, revenue: 6400000 },
  ]

  const periods = [
    { id: 'hari-ini', label: 'Hari ini' },
    { id: 'minggu-ini', label: 'Minggu ini' },
    { id: 'bulan-ini', label: 'Bulan ini' },
    { id: 'tahun-ini', label: 'Tahun ini' },
    { id: 'semua', label: 'Semua' },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Ringkasan keuangan dan performa bisnis</p>
        </div>
        <Button onClick={onNavigateToTransaction} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Transaksi
        </Button>
      </div>

      {/* Quick Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter Periode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              {periods.map((period) => (
                <TabsTrigger key={period.id} value={period.id}>
                  {period.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Financial Summary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Card */}
        <Card className="cursor-pointer transition-all hover:shadow-lg border-2 hover:border-primary/20" onClick={onNavigateToFinancial}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Penjualan (Revenue)</CardTitle>
              <ArrowUpRight className="w-5 h-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg">
              <p className="text-4xl font-bold text-green-600 dark:text-green-400">{formatRupiah(totalRevenue)}</p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm text-green-600 dark:text-green-400">+12.5% dari periode sebelumnya</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expenses Card */}
        <Card className="cursor-pointer transition-all hover:shadow-lg border-2 hover:border-primary/20" onClick={onNavigateToFinancial}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Pengeluaran (Expenses)</CardTitle>
              <ArrowUpRight className="w-5 h-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center p-6 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 rounded-lg">
              <p className="text-4xl font-bold text-red-600 dark:text-red-400">{formatRupiah(totalExpenses)}</p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-sm text-red-600 dark:text-red-400">-5.4% dari periode sebelumnya</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profit Section */}
      <Card className="cursor-pointer transition-all hover:shadow-lg border-2 hover:border-primary/20" onClick={onNavigateToFinancial}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Keuntungan (Profit)</CardTitle>
            <ArrowUpRight className="w-5 h-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg">
            <p className="text-5xl font-bold text-blue-600 dark:text-blue-400">{formatRupiah(totalProfit)}</p>
            <div className="flex items-center justify-center gap-1 mt-3">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-lg text-blue-600 dark:text-blue-400">
                Margin: {totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Summary Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Ringkasan Stok</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Barang Masuk</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">+{totalStockIn}</div>
                <p className="text-xs text-muted-foreground">
                  {filteredStockLogs.filter(log => log.type === 'masuk').length} transaksi
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Barang Keluar</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">-{totalStockOut}</div>
                <p className="text-xs text-muted-foreground">
                  {filteredStockLogs.filter(log => log.type === 'keluar' && !log.reference.includes('Hapus Produk')).length} transaksi
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Best Sellers Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Produk Terlaris
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bestSellers.slice(0, 5).map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{product.nama}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {product.kategori}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {product.jumlahTerjual} terjual
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">
                      {formatRupiah(product.revenue)}
                    </p>
                    <p className="text-xs text-muted-foreground">revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...filteredStockLogs, ...filteredTransactions.map(t => ({
              id: t.id,
              productName: t.catatan,
              type: t.type as 'masuk' | 'keluar',
              jumlah: t.nominal,
              reference: t.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran',
              tanggal: t.tanggal
            }))].slice(0, 8).map((log, index) => (
              <div key={`${log.id}-${index}`} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {(log.type === 'masuk' || log.type === 'pemasukan') ? (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  ) : (
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                  <div>
                    <p className="font-medium">{log.productName}</p>
                    <p className="text-sm text-muted-foreground">{log.reference}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${(log.type === 'masuk' || log.type === 'pemasukan') ? 'text-green-600' : 'text-red-600'}`}>
                    {(log.type === 'masuk' || log.type === 'pemasukan') ? '+' : '-'}{typeof log.jumlah === 'number' ? formatRupiah(log.jumlah) : log.jumlah}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(log.tanggal).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {filteredStockLogs.length === 0 && filteredTransactions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Belum ada aktivitas untuk periode ini.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}