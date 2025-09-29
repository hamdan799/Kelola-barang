import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, Package, Calendar, Target } from 'lucide-react'
import type { Receipt } from '../types/inventory'

interface FinancialReportProps {
  receipts: Receipt[]
}

export function FinancialReport({ receipts }: FinancialReportProps) {
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

  // Calculate financial metrics
  const totalRevenue = filteredReceipts.reduce((sum, receipt) => sum + receipt.total, 0)
  const totalExpenses = 2500000 // Mock expenses - in real app this would come from database
  const totalProfit = totalRevenue - totalExpenses
  const totalTransactions = filteredReceipts.length

  // Mock data for charts
  const revenueOverTime = [
    { period: '1 Jan', revenue: 12000000, profit: 8000000 },
    { period: '8 Jan', revenue: 15000000, profit: 10000000 },
    { period: '15 Jan', revenue: 18000000, profit: 12000000 },
    { period: '22 Jan', revenue: 22000000, profit: 14000000 },
    { period: '29 Jan', revenue: 25000000, profit: 16000000 },
    { period: '5 Feb', revenue: 28000000, profit: 18000000 },
    { period: '12 Feb', revenue: 32000000, profit: 21000000 },
  ]

  const categoryAnalysis = [
    { kategori: 'Elektronik', revenue: 85000000, percentage: 68, color: '#3b82f6' },
    { kategori: 'Rumah Tangga', revenue: 25000000, percentage: 20, color: '#10b981' },
    { kategori: 'Fashion', revenue: 10000000, percentage: 8, color: '#f59e0b' },
    { kategori: 'Lainnya', revenue: 5000000, percentage: 4, color: '#ef4444' },
  ]

  const monthlyData = [
    { bulan: 'Jan', revenue: 45000000, expenses: 30000000, profit: 15000000 },
    { bulan: 'Feb', revenue: 52000000, expenses: 32000000, profit: 20000000 },
    { bulan: 'Mar', revenue: 48000000, expenses: 28000000, profit: 20000000 },
    { bulan: 'Apr', revenue: 61000000, expenses: 35000000, profit: 26000000 },
    { bulan: 'Mei', revenue: 55000000, expenses: 33000000, profit: 22000000 },
    { bulan: 'Jun', revenue: 67000000, expenses: 38000000, profit: 29000000 },
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
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Laporan Keuangan</h1>
        <p className="text-gray-600 mt-1">Analisis mendalam performa keuangan bisnis Anda</p>
      </div>

      {/* Period Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatRupiah(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">+20.1% dari periode sebelumnya</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatRupiah(totalProfit)}</div>
            <p className="text-xs text-muted-foreground">Margin: {totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatRupiah(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">-5.4% dari periode sebelumnya</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{totalTransactions}</div>
            <p className="text-xs text-muted-foreground">+12% dari periode sebelumnya</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Trend Revenue & Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                <Tooltip 
                  formatter={(value: number) => [formatRupiah(value), '']}
                  labelFormatter={(label) => `Periode: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  name="Revenue"
                />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  name="Profit"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Analisis per Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryAnalysis}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="revenue"
                >
                  {categoryAnalysis.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatRupiah(value)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {categoryAnalysis.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.kategori}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium">{formatRupiah(item.revenue)}</span>
                    <span className="text-xs text-gray-500 ml-2">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Perbandingan Bulanan</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bulan" />
              <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
              <Tooltip 
                formatter={(value: number) => [formatRupiah(value), '']}
                labelFormatter={(label) => `Bulan: ${label}`}
              />
              <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
              <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
              <Bar dataKey="profit" fill="#10b981" name="Profit" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Financial Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Target Keuangan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Target Revenue Bulanan</span>
                <span className="text-sm text-gray-600">85%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>{formatRupiah(totalRevenue)}</span>
                <span>{formatRupiah(60000000)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Target Profit Margin</span>
                <span className="text-sm text-gray-600">90%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '90%' }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>{totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}%</span>
                <span>35%</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Kontrol Pengeluaran</span>
                <span className="text-sm text-gray-600">75%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>{formatRupiah(totalExpenses)}</span>
                <span>{formatRupiah(20000000)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}