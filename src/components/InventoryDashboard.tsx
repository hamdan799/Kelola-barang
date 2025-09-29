import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Package, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'

const mockStockData = [
  { nama: 'Elektronik', stok: 65, stokMasuk: 45, stokKeluar: 20 },
  { nama: 'Rumah Tangga', stok: 28, stokMasuk: 30, stokKeluar: 15 },
  { nama: 'Fashion', stok: 42, stokMasuk: 25, stokKeluar: 18 },
  { nama: 'Kecantikan', stok: 35, stokMasuk: 20, stokKeluar: 12 },
  { nama: 'Olahraga', stok: 18, stokMasuk: 15, stokKeluar: 8 },
]

const pieData = [
  { name: 'Stok Aman', value: 65, color: '#10b981' },
  { name: 'Stok Menipis', value: 25, color: '#f59e0b' },
  { name: 'Stok Habis', value: 10, color: '#ef4444' },
]

export function InventoryDashboard() {
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Dashboard Inventori</h1>
        <p className="text-gray-600 mt-1">Ringkasan inventori dan pergerakan stok</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Barang</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245</div>
            <p className="text-xs text-muted-foreground">+12% dari bulan lalu</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stok Masuk</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+184</div>
            <p className="text-xs text-muted-foreground">Bulan ini</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stok Keluar</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-156</div>
            <p className="text-xs text-muted-foreground">Bulan ini</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nilai Inventori</CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatRupiah(245000000)}</div>
            <p className="text-xs text-muted-foreground">Total nilai stok</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Stok per Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockStockData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nama" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="stok" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Stock Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Status Stok</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {pieData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Movement Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Pergerakan Stok per Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={mockStockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nama" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="stokMasuk" fill="#10b981" name="Stok Masuk" />
              <Bar dataKey="stokKeluar" fill="#ef4444" name="Stok Keluar" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Low Stock Alert */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Peringatan Stok Menipis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
              <div>
                <p className="font-medium text-amber-900">Air Fryer Xiaomi</p>
                <p className="text-sm text-amber-700">Kategori: Rumah Tangga</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-amber-900">Stok: 3</p>
                <p className="text-sm text-amber-700">Min: 5</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div>
                <p className="font-medium text-red-900">Headphone Bluetooth</p>
                <p className="text-sm text-red-700">Kategori: Elektronik</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-red-900">Stok: 0</p>
                <p className="text-sm text-red-700">Habis</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}