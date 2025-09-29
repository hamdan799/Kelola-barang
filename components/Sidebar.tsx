import { 
  BarChart3, 
  DollarSign, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  TrendingDown, 
  ClipboardList, 
  History, 
  CreditCard, 
  Users 
} from 'lucide-react'

interface SidebarProps {
  activeMenu: string
  setActiveMenu: (menu: string) => void
}

export function Sidebar({ activeMenu, setActiveMenu }: SidebarProps) {
  const menuItems = [
    { id: 'laporan', label: 'Laporan', icon: BarChart3 },
    { id: 'keuangan', label: 'Keuangan', icon: DollarSign },
    { id: 'stok', label: 'Stok', icon: Package },
    { id: 'pembeli', label: 'Pembeli', icon: Users },
    { id: 'barang', label: 'Barang', icon: Package },
    { id: 'stok-masuk', label: 'Stok Masuk', icon: TrendingUp },
    { id: 'stok-keluar', label: 'Stok Keluar', icon: TrendingDown },
    { id: 'stok-audit', label: 'Stok Audit', icon: ClipboardList },
    { id: 'riwayat', label: 'Riwayat', icon: History },
    { id: 'pengeluaran', label: 'Pengeluaran', icon: CreditCard },
    { id: 'kontak', label: 'Kontak', icon: Users },
  ]

  return (
    <div className="bg-white w-64 min-h-screen border-r border-gray-200">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm">T</span>
          </div>
          <span className="font-medium">Toko Sparepart</span>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  activeMenu === item.id
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}