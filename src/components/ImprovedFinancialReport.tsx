import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, Download, Filter, Calendar } from 'lucide-react'
import type { Receipt } from '../types/inventory'
import type { Transaction } from '../types/financial'

interface ImprovedFinancialReportProps {
  receipts: Receipt[]
  transactions: Transaction[]
}

export function ImprovedFinancialReport({ receipts, transactions }: ImprovedFinancialReportProps) {
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

  // Calculate financial metrics
  const totalPenjualan = filteredReceipts.reduce((sum, receipt) => sum + receipt.total, 0) +
                        filteredTransactions.filter(t => t.type === 'pemasukan').reduce((sum, t) => sum + t.nominal, 0)
  
  const totalPengeluaran = filteredTransactions.filter(t => t.type === 'pengeluaran').reduce((sum, t) => sum + t.nominal, 0)
  const totalProfit = totalPenjualan - totalPengeluaran

  // Prepare chart data
  const getChartData = () => {
    const dataMap = new Map()
    
    // Process receipts
    filteredReceipts.forEach(receipt => {
      const date = new Date(receipt.tanggal).toLocaleDateString('id-ID')
      if (!dataMap.has(date)) {
        dataMap.set(date, { date, penjualan: 0, pengeluaran: 0 })
      }
      dataMap.get(date).penjualan += receipt.total
    })

    // Process transactions
    filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.tanggal).toLocaleDateString('id-ID')
      if (!dataMap.has(date)) {
        dataMap.set(date, { date, penjualan: 0, pengeluaran: 0 })
      }
      
      if (transaction.type === 'pemasukan') {
        dataMap.get(date).penjualan += transaction.nominal
      } else {
        dataMap.get(date).pengeluaran += transaction.nominal
      }
    })

    return Array.from(dataMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  // Category analysis
  const getCategoryAnalysis = () => {
    const categoryMap = new Map()
    
    filteredTransactions
      .filter(t => t.type === 'pemasukan' && t.kategori)
      .forEach(transaction => {
        const category = transaction.kategori!
        if (!categoryMap.has(category)) {
          categoryMap.set(category, { category, value: 0, count: 0 })
        }
        categoryMap.get(category).value += transaction.nominal
        categoryMap.get(category).count += 1
      })

    return Array.from(categoryMap.values())
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }

  const chartData = getChartData()
  const categoryData = getCategoryAnalysis()

  const COLORS = ['#4F96FF', '#34D399', '#FBBF24', '#F87171', '#A78BFA']

  const periods = [
    { id: 'hari-ini', label: 'Hari ini' },
    { id: 'minggu-ini', label: 'Minggu ini' },
    { id: 'bulan-ini', label: 'Bulan ini' },
    { id: 'tahun-ini', label: 'Tahun ini' },
    { id: 'semua', label: 'Semua' },
  ]

  const handleExport = () => {
    // Simple export functionality
    const data = {
      periode: selectedPeriod,
      totalPenjualan,
      totalPengeluaran,
      totalProfit,
      tanggalExport: new Date().toLocaleDateString('id-ID'),
      chartData,
      categoryData
    }
    
    const dataStr = JSON.stringify(data, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `laporan-keuangan-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Keuangan</h1>
          <p className="text-muted-foreground mt-1">Laporan keuangan dan analisis bisnis</p>
        </div>
        <Button 
          onClick={handleExport}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md px-6 py-2 transition-all duration-200 hover:shadow-lg"
        >
          <Download className="w-4 h-4 mr-2" />
          Export/Print
        </Button>
      </div>

      {/* Period Filter */}
      <Card className="shadow-md border border-border bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Filter className="w-5 h-5" />
            Filter Periode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod} className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-muted/50">
              {periods.map((period) => (
                <TabsTrigger 
                  key={period.id} 
                  value={period.id}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                >
                  {period.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-md border border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Penjualan</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatRupiah(totalPenjualan)}</div>
            <p className="text-xs text-muted-foreground">
              {filteredReceipts.length + filteredTransactions.filter(t => t.type === 'pemasukan').length} transaksi
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md border border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Pengeluaran</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatRupiah(totalPengeluaran)}</div>
            <p className="text-xs text-muted-foreground">
              {filteredTransactions.filter(t => t.type === 'pengeluaran').length} transaksi
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md border border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatRupiah(totalProfit)}</div>
            <p className="text-xs text-muted-foreground">
              Margin: {totalPenjualan > 0 ? ((totalProfit / totalPenjualan) * 100).toFixed(1) : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue & Expenses Chart */}
        <Card className="shadow-md border border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Penjualan vs Pengeluaran</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [formatRupiah(value), '']}
                />
                <Bar dataKey="penjualan" fill="#34D399" name="Penjualan" />
                <Bar dataKey="pengeluaran" fill="#F87171" name="Pengeluaran" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Line Chart */}
        <Card className="shadow-md border border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Tren Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [formatRupiah(value), 'Profit']}
                />
                <Line 
                  type="monotone" 
                  dataKey={(data) => data.penjualan - data.pengeluaran} 
                  stroke="#4F96FF" 
                  strokeWidth={3}
                  dot={{ fill: '#4F96FF', strokeWidth: 2, r: 4 }}
                  name="Profit"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Category Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Pie Chart */}
        <Card className="shadow-md border border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Kontribusi Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [formatRupiah(value), 'Penjualan']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category List */}
        <Card className="shadow-md border border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Top Kategori Penjualan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryData.map((category, index) => (
                <div key={category.category} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <div>
                      <p className="font-medium text-card-foreground">{category.category}</p>
                      <p className="text-sm text-muted-foreground">{category.count} transaksi</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">{formatRupiah(category.value)}</p>
                    <p className="text-xs text-muted-foreground">
                      {totalPenjualan > 0 ? ((category.value / totalPenjualan) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                </div>
              ))}
              {categoryData.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Belum ada data kategori untuk periode ini.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Summary */}
      <Card className="shadow-md border border-border bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Ringkasan Laporan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Periode</p>
              <Badge variant="outline" className="mt-1">{periods.find(p => p.id === selectedPeriod)?.label}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Transaksi</p>
              <p className="text-lg font-medium text-card-foreground">
                {filteredReceipts.length + filteredTransactions.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rata-rata Harian</p>
              <p className="text-lg font-medium text-card-foreground">
                {chartData.length > 0 ? formatRupiah(totalPenjualan / chartData.length) : formatRupiah(0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tanggal Export</p>
              <p className="text-lg font-medium text-card-foreground">
                {new Date().toLocaleDateString('id-ID')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}