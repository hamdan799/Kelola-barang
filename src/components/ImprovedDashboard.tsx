import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { TrendingUp, TrendingDown, Package, Plus, Star, Filter, ArrowUpRight, DollarSign } from 'lucide-react'
import type { StockLog, Receipt } from '../types/inventory'
import type { Transaction } from '../types/financial'

interface ImprovedDashboardProps {
  stockLogs: StockLog[]
  receipts: Receipt[]
  transactions: Transaction[]
  onNavigateToFinancial: () => void
  onNavigateToTransaction: () => void
}

export function ImprovedDashboard({ 
  stockLogs, 
  receipts, 
  transactions,
  onNavigateToFinancial,
  onNavigateToTransaction
}: ImprovedDashboardProps) {
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
    { id: 'minggu-ini', label: 'Minggu' },
    { id: 'bulan-ini', label: 'Bulan' },
    { id: 'tahun-ini', label: 'Tahun' },
    { id: 'semua', label: 'Semua' },
  ]

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Ringkasan keuangan dan performa bisnis</p>
        </div>
        <Button 
          onClick={onNavigateToTransaction} 
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Transaksi
        </Button>
      </div>

      {/* Quick Filters */}
      <Card className="shadow-lg border-0 bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Filter className="w-5 h-5" />
            Filter Periode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod} className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-muted">
              {periods.map((period) => (
                <TabsTrigger 
                  key={period.id} 
                  value={period.id}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {period.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Financial Summary Section - Specific Layout: [Penjualan] [Pengeluaran] */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Penjualan Card */}
        <Card 
          className="cursor-pointer transition-all hover:shadow-xl border-0 bg-card shadow-lg" 
          onClick={onNavigateToFinancial}
        >
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-card-foreground">Penjualan</CardTitle>
              <ArrowUpRight className="w-5 h-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl">
              <p className="text-4xl font-bold text-green-600 dark:text-green-400">{formatRupiah(totalRevenue)}</p>
              <div className="flex items-center justify-center gap-1 mt-3">
                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">+12.5% dari periode sebelumnya</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pengeluaran Card */}
        <Card 
          className="cursor-pointer transition-all hover:shadow-xl border-0 bg-card shadow-lg" 
          onClick={onNavigateToFinancial}
        >
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-card-foreground">Pengeluaran</CardTitle>
              <ArrowUpRight className="w-5 h-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center p-6 bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-950/30 dark:to-rose-950/30 rounded-xl">
              <p className="text-4xl font-bold text-red-600 dark:text-red-400">{formatRupiah(totalExpenses)}</p>
              <div className="flex items-center justify-center gap-1 mt-3">
                <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-sm text-red-600 dark:text-red-400 font-medium">-5.4% dari periode sebelumnya</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profit Section - Full Width Below */}
      <Card 
        className="cursor-pointer transition-all hover:shadow-xl border-0 bg-card shadow-lg" 
        onClick={onNavigateToFinancial}
      >
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl text-card-foreground">Profit (Keuntungan)</CardTitle>
            <ArrowUpRight className="w-6 h-6 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl">
            <p className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-2">{formatRupiah(totalProfit)}</p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <span className="text-xl text-blue-600 dark:text-blue-400 font-semibold">
                Margin: {totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Sellers Section */}
        <Card className="border-0 bg-card shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Star className="w-5 h-5 text-yellow-500" />
              Best Sellers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bestSellers.slice(0, 5).map((product, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted/70 transition-colors">
                  <div className="flex-1">
                    <p className="font-semibold text-card-foreground">{product.nama}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs border-primary/20">
                        {product.kategori}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {product.jumlahTerjual} terjual
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      {formatRupiah(product.revenue)}
                    </p>
                    <p className="text-xs text-muted-foreground">revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stock Summary Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Ringkasan Stok</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-0 bg-card shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Total Barang Masuk</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">+{totalStockIn}</div>
                <p className="text-xs text-muted-foreground">
                  {filteredStockLogs.filter(log => log.type === 'masuk').length} transaksi
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-card shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Total Barang Keluar</CardTitle>
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
      </div>

      {/* Recent Activity */}
      <Card className="border-0 bg-card shadow-lg">
        <CardHeader>
          <CardTitle className="text-card-foreground">Aktivitas Terbaru</CardTitle>
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
              <div key={`${log.id}-${index}`} className="flex items-center justify-between p-4 border border-border rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  {(log.type === 'masuk' || log.type === 'pemasukan') ? (
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  ) : (
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  )}
                  <div>
                    <p className="font-semibold text-card-foreground">{log.productName}</p>
                    <p className="text-sm text-muted-foreground">{log.reference}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${(log.type === 'masuk' || log.type === 'pemasukan') ? 'text-green-600' : 'text-red-600'}`}>
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