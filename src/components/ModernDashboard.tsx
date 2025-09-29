import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { TrendingUp, TrendingDown, Package, Plus, ArrowUpRight, Filter, Star } from 'lucide-react'
import type { StockLog, Receipt, Product } from '../types/inventory'

interface ModernDashboardProps {
  stockLogs: StockLog[]
  receipts: Receipt[]
  onStockLogAdded: (log: StockLog) => void
  onReceiptGenerated: (receipt: Receipt) => void
  onNavigateToFinancial: () => void
  onNavigateToAddProduct: () => void
}

export function ModernDashboard({ 
  stockLogs, 
  receipts, 
  onStockLogAdded, 
  onReceiptGenerated,
  onNavigateToFinancial,
  onNavigateToAddProduct
}: ModernDashboardProps) {
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
  const filteredStockLogs = stockLogs.filter(log => filterByPeriod(log.tanggal))

  // Calculate financial data
  const totalRevenue = filteredReceipts.reduce((sum, receipt) => sum + receipt.total, 0)
  const totalExpenses = 2500000 // Mock expenses data
  const totalProfit = totalRevenue - totalExpenses

  // Calculate stock movement
  const totalStockIn = filteredStockLogs
    .filter(log => log.type === 'masuk')
    .reduce((sum, log) => sum + log.jumlah, 0)
  
  const totalStockOut = filteredStockLogs
    .filter(log => log.type === 'keluar' && !log.reference.includes('Hapus Produk'))
    .reduce((sum, log) => sum + log.jumlah, 0)

  // Best sellers mock data - in real app this would be calculated from receipts
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
          <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Ringkasan keuangan dan performa inventori</p>
        </div>
        <Button onClick={onNavigateToAddProduct} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Barang
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
      <Card 
        className="cursor-pointer transition-all hover:shadow-lg border-2 hover:border-blue-200" 
        onClick={onNavigateToFinancial}
      >
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Ringkasan Keuangan</CardTitle>
            <ArrowUpRight className="w-5 h-5 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Revenue Display */}
          <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            <h3 className="text-sm text-gray-600 mb-2">Total Uang (Revenue)</h3>
            <p className="text-4xl font-bold text-blue-600">{formatRupiah(totalRevenue)}</p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600">+12.5% dari periode sebelumnya</span>
            </div>
          </div>

          {/* Profit and Expenses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <h4 className="font-medium text-green-900">Keuntungan (Profit)</h4>
              </div>
              <p className="text-2xl font-bold text-green-600">{formatRupiah(totalProfit)}</p>
              <p className="text-sm text-green-700">Margin: {totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}%</p>
            </div>

            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-red-600" />
                <h4 className="font-medium text-red-900">Total Pengeluaran</h4>
              </div>
              <p className="text-2xl font-bold text-red-600">{formatRupiah(totalExpenses)}</p>
              <p className="text-sm text-red-700">Operasional & stok</p>
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
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{product.nama}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {product.kategori}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {product.jumlahTerjual} terjual
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">
                      {formatRupiah(product.revenue)}
                    </p>
                    <p className="text-xs text-gray-500">revenue</p>
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
            {filteredStockLogs.slice(0, 8).map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {log.type === 'masuk' ? (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  ) : (
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                  <div>
                    <p className="font-medium">{log.productName}</p>
                    <p className="text-sm text-gray-600">{log.reference}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${log.type === 'masuk' ? 'text-green-600' : 'text-red-600'}`}>
                    {log.type === 'masuk' ? '+' : '-'}{log.jumlah}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(log.tanggal).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {filteredStockLogs.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Belum ada aktivitas untuk periode ini.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}