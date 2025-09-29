import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, Package } from 'lucide-react'

const chartData = [
  { name: '07 Jun', Penjualan: 400000, Pembelian: 200000, Pengeluaran: 100000, Profit: 100000 },
  { name: '08 Jun', Penjualan: 600000, Pembelian: 300000, Pengeluaran: 150000, Profit: 150000 },
  { name: '09 Jun', Penjualan: 800000, Pembelian: 400000, Pengeluaran: 200000, Profit: 200000 },
  { name: '10 Jun', Penjualan: 1000000, Pembelian: 500000, Pengeluaran: 250000, Profit: 250000 },
  { name: '11 Jun', Penjualan: 1200000, Pembelian: 600000, Pengeluaran: 300000, Profit: 300000 },
  { name: '12 Jun', Penjualan: 1400000, Pembelian: 700000, Pengeluaran: 350000, Profit: 350000 },
  { name: '13 Jun', Penjualan: 1600000, Pembelian: 800000, Pengeluaran: 400000, Profit: 400000 },
  { name: '14 Jun', Penjualan: 1800000, Pembelian: 900000, Pengeluaran: 450000, Profit: 450000 },
]

export function Dashboard() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Keuangan</h1>
        <div className="flex items-center gap-4">
          <select className="border border-gray-300 rounded-lg px-3 py-1">
            <option>7 Hari Terakhir</option>
            <option>30 Hari Terakhir</option>
            <option>3 Bulan Terakhir</option>
          </select>
          <select className="border border-gray-300 rounded-lg px-3 py-1">
            <option>Harian</option>
            <option>Mingguan</option>
            <option>Bulanan</option>
          </select>
          <select className="border border-gray-300 rounded-lg px-3 py-1">
            <option>Staff</option>
            <option>Admin</option>
            <option>Manager</option>
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            Download
          </button>
        </div>
      </div>

      {/* Chart */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Legend />
                <Bar dataKey="Penjualan" fill="#3b82f6" />
                <Bar dataKey="Pembelian" fill="#8b5cf6" />
                <Bar dataKey="Pengeluaran" fill="#f59e0b" />
                <Bar dataKey="Profit" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Penjualan</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">Rp9.880.600</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pembelian</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">Rp455.985</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">Rp600.000</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">Rp1.115.746</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Nilai Aset Terkini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">Rp5.912.335</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}