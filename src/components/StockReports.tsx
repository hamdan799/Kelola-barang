import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Search, TrendingUp, TrendingDown } from 'lucide-react'
import type { StockLog, Receipt } from '../types/inventory'

interface StockReportsProps {
  stockLogs: StockLog[]
  receipts: Receipt[]
}

export function StockReports({ stockLogs, receipts }: StockReportsProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredStockLogs = stockLogs.filter(log =>
    log.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.reference.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stokMasuk = filteredStockLogs.filter(log => log.type === 'masuk')
  const stokKeluar = filteredStockLogs.filter(log => log.type === 'keluar')

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '-'
    
    try {
      const dateObj = date instanceof Date ? date : new Date(date)
      if (isNaN(dateObj.getTime())) {
        return '-'
      }
      
      return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(dateObj)
    } catch (error) {
      console.error('Invalid date:', date, error)
      return '-'
    }
  }

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const totalStokMasuk = stokMasuk.reduce((total, log) => total + log.jumlah, 0)
  const totalStokKeluar = stokKeluar.reduce((total, log) => total + log.jumlah, 0)
  const totalPenjualan = receipts.reduce((total, receipt) => total + receipt.total, 0)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Laporan Stok</h1>
          <p className="text-muted-foreground mt-1">Pantau pergerakan stok masuk dan keluar</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stok Masuk</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalStokMasuk}</div>
            <p className="text-xs text-muted-foreground">Unit barang masuk</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stok Keluar</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalStokKeluar}</div>
            <p className="text-xs text-muted-foreground">Unit barang keluar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Penjualan</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatRupiah(totalPenjualan)}</div>
            <p className="text-xs text-muted-foreground">Dari {receipts.length} transaksi</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari log stok..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="masuk" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="masuk" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Stok Masuk ({stokMasuk.length})
          </TabsTrigger>
          <TabsTrigger value="keluar" className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4" />
            Stok Keluar ({stokKeluar.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="masuk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Log Stok Masuk
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Barang</TableHead>
                      <TableHead>Jumlah</TableHead>
                      <TableHead>Tanggal/Waktu</TableHead>
                      <TableHead>Referensi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stokMasuk.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.productName}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                            +{log.jumlah}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(log.tanggal)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800">
                            {log.reference}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {stokMasuk.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Belum ada log stok masuk.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keluar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-600" />
                Log Stok Keluar
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Barang</TableHead>
                      <TableHead>Jumlah</TableHead>
                      <TableHead>Tanggal/Waktu</TableHead>
                      <TableHead>Referensi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stokKeluar.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.productName}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                            -{log.jumlah}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(log.tanggal)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800">
                            {log.reference}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {stokKeluar.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Belum ada log stok keluar.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Receipt History */}
      {receipts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Struk Penjualan</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Struk</TableHead>
                    <TableHead>Nama Barang</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Harga Satuan</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Tanggal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receipts.map((receipt) => (
                    <TableRow key={receipt.id}>
                      <TableCell className="font-mono text-sm">#{receipt.id}</TableCell>
                      <TableCell className="font-medium">{receipt.productName}</TableCell>
                      <TableCell>{receipt.jumlah}</TableCell>
                      <TableCell>{formatRupiah(receipt.harga)}</TableCell>
                      <TableCell className="font-medium">{formatRupiah(receipt.total)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(receipt.tanggal)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}