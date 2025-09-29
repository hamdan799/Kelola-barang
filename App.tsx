import { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { Dashboard } from './components/Dashboard'
import { BarangManagement } from './components/BarangManagement'
import { TransactionReport } from './components/TransactionReport'

export default function App() {
  const [activeMenu, setActiveMenu] = useState('keuangan')

  const renderContent = () => {
    switch (activeMenu) {
      case 'keuangan':
        return <Dashboard />
      case 'laporan':
        return <TransactionReport />
      case 'barang':
      case 'stok':
        return <BarangManagement />
      case 'stok-masuk':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">Stok Masuk</h1>
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-gray-500">Fitur Stok Masuk sedang dalam pengembangan...</p>
            </div>
          </div>
        )
      case 'stok-keluar':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">Stok Keluar</h1>
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-gray-500">Fitur Stok Keluar sedang dalam pengembangan...</p>
            </div>
          </div>
        )
      case 'stok-audit':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">Stok Audit</h1>
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-gray-500">Fitur Stok Audit sedang dalam pengembangan...</p>
            </div>
          </div>
        )
      case 'pembeli':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">Data Pembeli</h1>
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-gray-500">Fitur Data Pembeli sedang dalam pengembangan...</p>
            </div>
          </div>
        )
      case 'riwayat':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">Riwayat</h1>
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-gray-500">Fitur Riwayat sedang dalam pengembangan...</p>
            </div>
          </div>
        )
      case 'pengeluaran':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">Pengeluaran</h1>
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-gray-500">Fitur Pengeluaran sedang dalam pengembangan...</p>
            </div>
          </div>
        )
      case 'kontak':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">Kontak</h1>
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-gray-500">Fitur Kontak sedang dalam pengembangan...</p>
            </div>
          </div>
        )
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  )
}