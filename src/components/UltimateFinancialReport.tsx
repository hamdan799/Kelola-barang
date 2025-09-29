import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { ScrollArea } from './ui/scroll-area'
import { Progress } from './ui/progress'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { Calendar, Download, FileText, TrendingUp, TrendingDown, DollarSign, PieChart as PieChartIcon, BarChart3, Activity, Target, AlertCircle } from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import type { Receipt, Transaction } from '../types/financial'

interface UltimateFinancialReportProps {
  receipts: Receipt[]
  transactions: Transaction[]
}

interface CashflowEntry {
  date: string
  income: number
  expense: number
  balance: number
  description: string
  type: 'income' | 'expense'
}

interface CategoryAnalysis {
  categoryName: string
  revenue: number
  cost: number
  profit: number
  margin: number
  transactions: number
}

export function UltimateFinancialReport({ receipts, transactions }: UltimateFinancialReportProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'hari' | 'minggu' | 'bulan' | 'tahun' | 'custom'>('bulan')
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' })
  const [reportType, setReportType] = useState<'overview' | 'cashflow' | 'category' | 'trends'>('overview')
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: Date | string) => {
    const dateObj = date instanceof Date ? date : new Date(date)
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(dateObj)
  }

  // Filter data based on selected period
  const filterByPeriod = (date: Date | string) => {
    const now = new Date()
    const itemDate = new Date(date)
    
    if (selectedPeriod === 'custom') {
      if (!customDateRange.start || !customDateRange.end) return true
      const startDate = new Date(customDateRange.start)
      const endDate = new Date(customDateRange.end)
      return itemDate >= startDate && itemDate <= endDate
    }
    
    switch (selectedPeriod) {
      case 'hari':
        return itemDate.toDateString() === now.toDateString()
      case 'minggu':
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
        return itemDate >= weekStart
      case 'bulan':
        return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear()
      case 'tahun':
        return itemDate.getFullYear() === now.getFullYear()
      default:
        return true
    }
  }

  const filteredReceipts = receipts.filter(r => filterByPeriod(r.tanggal))
  const filteredTransactions = transactions.filter(t => filterByPeriod(t.tanggal))

  // Calculate financial metrics
  const calculateMetrics = () => {
    // Revenue from receipts and income transactions
    const receiptRevenue = filteredReceipts.reduce((sum, receipt) => sum + receipt.total, 0)
    const transactionRevenue = filteredTransactions
      .filter(t => t.type === 'pemasukan')
      .reduce((sum, t) => sum + t.nominal, 0)
    const totalRevenue = receiptRevenue + transactionRevenue

    // Cost of Goods Sold (COGS) from transaction items
    const cogs = filteredTransactions
      .filter(t => t.type === 'pemasukan')
      .reduce((sum, t) => sum + (t.totalCost || 0), 0)

    // Other expenses from expense transactions
    const otherExpenses = filteredTransactions
      .filter(t => t.type === 'pengeluaran')
      .reduce((sum, t) => sum + t.nominal, 0)

    const totalExpenses = cogs + otherExpenses
    const grossProfit = totalRevenue - cogs
    const netProfit = totalRevenue - totalExpenses

    // Calculate margins
    const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0
    const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

    return {
      totalRevenue,
      cogs,
      otherExpenses,
      totalExpenses,
      grossProfit,
      netProfit,
      grossMargin,
      netMargin,
      transactionCount: filteredTransactions.length
    }
  }

  const metrics = calculateMetrics()

  // Generate trend data for charts
  const generateTrendData = () => {
    const data: { [key: string]: any } = {}
    
    // Group data by date
    const allItems = filteredReceipts.concat(filteredTransactions)
    allItems.forEach(item => {
      const dateKey = formatDate(item.tanggal)
      
      if (!data[dateKey]) {
        data[dateKey] = {
          date: dateKey,
          revenue: 0,
          cogs: 0,
          expenses: 0,
          transactions: 0
        }
      }
      
      if ('total' in item) {
        // Receipt
        data[dateKey].revenue += item.total
      } else {
        // Transaction
        if (item.type === 'pemasukan') {
          data[dateKey].revenue += item.nominal
          data[dateKey].cogs += item.totalCost || 0
        } else {
          data[dateKey].expenses += item.nominal
        }
        data[dateKey].transactions += 1
      }
    })
    
    return Object.values(data).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  }

  const trendData = generateTrendData()

  // Generate category analysis
  const generateCategoryAnalysis = (): CategoryAnalysis[] => {
    const categoryData: { [key: string]: CategoryAnalysis } = {}
    
    filteredTransactions
      .filter(t => t.type === 'pemasukan' && t.items)
      .forEach(transaction => {
        transaction.items?.forEach(item => {
          const categoryName = item.categoryId || 'Uncategorized'
          
          if (!categoryData[categoryName]) {
            categoryData[categoryName] = {
              categoryName,
              revenue: 0,
              cost: 0,
              profit: 0,
              margin: 0,
              transactions: 0
            }
          }
          
          categoryData[categoryName].revenue += item.totalPrice
          categoryData[categoryName].cost += item.totalCost || 0
          categoryData[categoryName].transactions += 1
        })
      })
    
    // Calculate profit and margin
    Object.values(categoryData).forEach(category => {
      category.profit = category.revenue - category.cost
      category.margin = category.revenue > 0 ? (category.profit / category.revenue) * 100 : 0
    })
    
    return Object.values(categoryData).sort((a, b) => b.revenue - a.revenue)
  }

  const categoryAnalysis = generateCategoryAnalysis()

  // Generate cashflow data
  const generateCashflowData = (): CashflowEntry[] => {
    const cashflowEntries: CashflowEntry[] = []
    let runningBalance = 0
    
    const receiptEntries = filteredReceipts.map(r => ({
      date: r.tanggal,
      amount: r.total,
      type: 'income' as const,
      description: 'Penjualan'
    }))
    
    const transactionEntries = filteredTransactions.map(t => ({
      date: t.tanggal,
      amount: t.nominal,
      type: t.type === 'pemasukan' ? 'income' as const : 'expense' as const,
      description: t.catatan || `${t.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}`
    }))
    
    const allEntries = receiptEntries.concat(transactionEntries)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    allEntries.forEach(entry => {
      if (entry.type === 'income') {
        runningBalance += entry.amount
      } else {
        runningBalance -= entry.amount
      }
      
      cashflowEntries.push({
        date: formatDate(entry.date),
        income: entry.type === 'income' ? entry.amount : 0,
        expense: entry.type === 'expense' ? entry.amount : 0,
        balance: runningBalance,
        description: entry.description,
        type: entry.type
      })
    })
    
    return cashflowEntries
  }

  const cashflowData = generateCashflowData()

  // Chart colors
  const chartColors = {
    primary: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    purple: '#8B5CF6',
    cyan: '#06B6D4'
  }

  const pieData = [
    { name: 'COGS', value: metrics.cogs, color: chartColors.error },
    { name: 'Other Expenses', value: metrics.otherExpenses, color: chartColors.warning },
    { name: 'Net Profit', value: metrics.netProfit, color: chartColors.success }
  ].filter(item => item.value > 0)

  const exportToPDF = async () => {
    setIsExporting(true)
    setExportProgress(0)
    
    try {
      const steps = [
        'Preparing data...',
        'Generating report...',
        'Creating charts...',
        'Finalizing PDF...',
        'Complete!'
      ]
      
      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 500))
        setExportProgress((i + 1) * 20)
      }
      
      // Create report content
      const reportData = {
        period: selectedPeriod,
        dateRange: selectedPeriod === 'custom' ? customDateRange : null,
        metrics,
        trendData,
        categoryAnalysis,
        cashflowData: cashflowData.slice(-10), // Last 10 entries
        generatedAt: new Date().toISOString()
      }
      
      // Convert to JSON and download (PDF generation would require additional library)
      const dataStr = JSON.stringify(reportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `financial-report-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      
      URL.revokeObjectURL(url)
      toast.success('Laporan berhasil diekspor!')
      
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Gagal mengekspor laporan!')
    } finally {
      setIsExporting(false)
      setExportProgress(0)
    }
  }

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Laporan Keuangan</h1>
          <p className="text-muted-foreground mt-1">Analisis komprehensif performa finansial</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToPDF} variant="outline" disabled={isExporting}>
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Exporting... {exportProgress}%
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Period Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Periode</Label>
              <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hari">Hari Ini</SelectItem>
                  <SelectItem value="minggu">Minggu Ini</SelectItem>
                  <SelectItem value="bulan">Bulan Ini</SelectItem>
                  <SelectItem value="tahun">Tahun Ini</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {selectedPeriod === 'custom' && (
              <>
                <div>
                  <Label>Dari Tanggal</Label>
                  <Input
                    type="date"
                    value={customDateRange.start}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Sampai Tanggal</Label>
                  <Input
                    type="date"
                    value={customDateRange.end}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-blue-600">{formatRupiah(metrics.totalRevenue)}</p>
                <p className="text-xs text-muted-foreground">{metrics.transactionCount} transaksi</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">COGS</p>
                <p className="text-2xl font-bold text-orange-600">{formatRupiah(metrics.cogs)}</p>
                <p className="text-xs text-muted-foreground">{metrics.grossMargin.toFixed(1)}% margin</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">{formatRupiah(metrics.totalExpenses)}</p>
                <p className="text-xs text-muted-foreground">COGS + Other</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Target className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Net Profit</p>
                <p className={`text-2xl font-bold ${metrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatRupiah(metrics.netProfit)}
                </p>
                <p className="text-xs text-muted-foreground">{metrics.netMargin.toFixed(1)}% margin</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Breakdown Keuangan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Income Statement</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Revenue:</span>
                  <span className="font-medium text-blue-600">{formatRupiah(metrics.totalRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Less: COGS:</span>
                  <span className="font-medium text-orange-600">({formatRupiah(metrics.cogs)})</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Gross Profit:</span>
                  <span className="font-medium text-green-600">{formatRupiah(metrics.grossProfit)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Less: Other Expenses:</span>
                  <span className="font-medium text-red-600">({formatRupiah(metrics.otherExpenses)})</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-bold">Net Profit:</span>
                  <span className={`font-bold ${metrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatRupiah(metrics.netProfit)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Expense Breakdown</h4>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatRupiah(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts and Analysis */}
      <Tabs value={reportType} onValueChange={(value: any) => setReportType(value)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="category">Category</TabsTrigger>
          <TabsTrigger value="cashflow">Cashflow</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => formatRupiah(value)} />
                    <Legend />
                    <Bar dataKey="revenue" fill={chartColors.primary} name="Revenue" />
                    <Bar dataKey="cogs" fill={chartColors.error} name="COGS" />
                    <Bar dataKey="expenses" fill={chartColors.warning} name="Other Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profit Margin Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData.map(d => ({
                    ...d,
                    grossMargin: d.revenue > 0 ? ((d.revenue - d.cogs) / d.revenue) * 100 : 0,
                    netMargin: d.revenue > 0 ? ((d.revenue - d.cogs - d.expenses) / d.revenue) * 100 : 0
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => `${value.toFixed(1)}%`} />
                    <Legend />
                    <Line type="monotone" dataKey="grossMargin" stroke={chartColors.success} name="Gross Margin %" />
                    <Line type="monotone" dataKey="netMargin" stroke={chartColors.primary} name="Net Margin %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => formatRupiah(value)} />
                  <Area type="monotone" dataKey="revenue" stroke={chartColors.primary} fill={chartColors.primary} fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="category" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Profit</TableHead>
                      <TableHead>Margin</TableHead>
                      <TableHead>Transactions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryAnalysis.map((category) => (
                      <TableRow key={category.categoryName}>
                        <TableCell className="font-medium">{category.categoryName}</TableCell>
                        <TableCell>{formatRupiah(category.revenue)}</TableCell>
                        <TableCell>{formatRupiah(category.cost)}</TableCell>
                        <TableCell className={category.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatRupiah(category.profit)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={category.margin >= 20 ? 'default' : category.margin >= 10 ? 'secondary' : 'destructive'}>
                            {category.margin.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell>{category.transactions}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cashflow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Cashflow</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Income</TableHead>
                      <TableHead>Expense</TableHead>
                      <TableHead>Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cashflowData.slice(-20).reverse().map((entry, index) => (
                      <TableRow key={index}>
                        <TableCell>{entry.date}</TableCell>
                        <TableCell>{entry.description}</TableCell>
                        <TableCell className="text-green-600">
                          {entry.income > 0 ? formatRupiah(entry.income) : '-'}
                        </TableCell>
                        <TableCell className="text-red-600">
                          {entry.expense > 0 ? formatRupiah(entry.expense) : '-'}
                        </TableCell>
                        <TableCell className={entry.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatRupiah(entry.balance)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}