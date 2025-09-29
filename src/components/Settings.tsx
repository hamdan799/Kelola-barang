import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { Separator } from './ui/separator'
import { Textarea } from './ui/textarea'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog'
import { Settings as SettingsIcon, Store, Bell, Database, Shield, Upload, Download, Trash2, Save } from 'lucide-react'
import { toast } from 'sonner@2.0.3'

interface StoreSettings {
  name: string
  address: string
  phone: string
  email: string
  logo?: string
  description?: string
}

interface NotificationSettings {
  lowStockAlert: boolean
  dailyReport: boolean
  debtReminder: boolean
  newTransaction: boolean
  lowStockThreshold: number
}

interface SystemSettings {
  autoBackup: boolean
  requirePinForDelete: boolean
  activityLog: boolean
  darkMode: boolean
  currency: string
  timeZone: string
}

export function Settings() {
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    name: 'Sistem Kelola Barang',
    address: '',
    phone: '',
    email: '',
    logo: '',
    description: ''
  })

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    lowStockAlert: true,
    dailyReport: false,
    debtReminder: true,
    newTransaction: false,
    lowStockThreshold: 10
  })

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    autoBackup: true,
    requirePinForDelete: false,
    activityLog: true,
    darkMode: false,
    currency: 'IDR',
    timeZone: 'Asia/Jakarta'
  })

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedStoreSettings = localStorage.getItem('inventory_storeSettings')
      const savedNotificationSettings = localStorage.getItem('inventory_notificationSettings')
      const savedSystemSettings = localStorage.getItem('inventory_systemSettings')

      if (savedStoreSettings) {
        setStoreSettings(JSON.parse(savedStoreSettings))
      }
      if (savedNotificationSettings) {
        setNotificationSettings(JSON.parse(savedNotificationSettings))
      }
      if (savedSystemSettings) {
        setSystemSettings(JSON.parse(savedSystemSettings))
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }, [])

  const saveStoreSettings = () => {
    try {
      localStorage.setItem('inventory_storeSettings', JSON.stringify(storeSettings))
      toast.success('Pengaturan toko berhasil disimpan!')
    } catch (error) {
      console.error('Failed to save store settings:', error)
      toast.error('Gagal menyimpan pengaturan toko!')
    }
  }

  const saveNotificationSettings = () => {
    try {
      localStorage.setItem('inventory_notificationSettings', JSON.stringify(notificationSettings))
      toast.success('Pengaturan notifikasi berhasil disimpan!')
    } catch (error) {
      console.error('Failed to save notification settings:', error)
      toast.error('Gagal menyimpan pengaturan notifikasi!')
    }
  }

  const saveSystemSettings = () => {
    try {
      localStorage.setItem('inventory_systemSettings', JSON.stringify(systemSettings))
      toast.success('Pengaturan sistem berhasil disimpan!')
    } catch (error) {
      console.error('Failed to save system settings:', error)
      toast.error('Gagal menyimpan pengaturan sistem!')
    }
  }

  const handleExportData = () => {
    try {
      const allData = {
        storeSettings,
        notificationSettings,
        systemSettings,
        transactions: JSON.parse(localStorage.getItem('inventory_transactions') || '[]'),
        products: JSON.parse(localStorage.getItem('inventory_products') || '[]'),
        categories: JSON.parse(localStorage.getItem('inventory_categories') || '[]'),
        debts: JSON.parse(localStorage.getItem('inventory_debts') || '[]'),
        stockLogs: JSON.parse(localStorage.getItem('inventory_stockLogs') || '[]'),
        receipts: JSON.parse(localStorage.getItem('inventory_receipts') || '[]'),
        exportDate: new Date().toISOString()
      }

      const dataStr = JSON.stringify(allData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `sistem-kelola-barang-backup-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      
      URL.revokeObjectURL(url)
      toast.success('Data berhasil diekspor!')
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Gagal mengekspor data!')
    }
  }

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string)
        
        // Validate and restore data
        if (importedData.storeSettings) {
          setStoreSettings(importedData.storeSettings)
          localStorage.setItem('inventory_storeSettings', JSON.stringify(importedData.storeSettings))
        }
        if (importedData.notificationSettings) {
          setNotificationSettings(importedData.notificationSettings)
          localStorage.setItem('inventory_notificationSettings', JSON.stringify(importedData.notificationSettings))
        }
        if (importedData.systemSettings) {
          setSystemSettings(importedData.systemSettings)
          localStorage.setItem('inventory_systemSettings', JSON.stringify(importedData.systemSettings))
        }
        if (importedData.transactions) {
          localStorage.setItem('inventory_transactions', JSON.stringify(importedData.transactions))
        }
        if (importedData.products) {
          localStorage.setItem('inventory_products', JSON.stringify(importedData.products))
        }
        if (importedData.categories) {
          localStorage.setItem('inventory_categories', JSON.stringify(importedData.categories))
        }
        if (importedData.debts) {
          localStorage.setItem('inventory_debts', JSON.stringify(importedData.debts))
        }
        if (importedData.stockLogs) {
          localStorage.setItem('inventory_stockLogs', JSON.stringify(importedData.stockLogs))
        }
        if (importedData.receipts) {
          localStorage.setItem('inventory_receipts', JSON.stringify(importedData.receipts))
        }

        toast.success('Data berhasil diimpor! Silakan refresh halaman.')
      } catch (error) {
        console.error('Import failed:', error)
        toast.error('Gagal mengimpor data! Pastikan file valid.')
      }
    }
    reader.readAsText(file)
    
    // Reset file input
    event.target.value = ''
  }

  const handleResetData = () => {
    try {
      // Clear all localStorage data
      const keysToRemove = [
        'inventory_transactions',
        'inventory_products', 
        'inventory_categories',
        'inventory_debts',
        'inventory_stockLogs',
        'inventory_receipts',
        'inventory_draftTransaction'
      ]
      
      keysToRemove.forEach(key => localStorage.removeItem(key))
      
      toast.success('Semua data berhasil dihapus! Silakan refresh halaman.')
    } catch (error) {
      console.error('Reset failed:', error)
      toast.error('Gagal menghapus data!')
    }
  }

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Pengaturan</h1>
        <p className="text-muted-foreground mt-1">Kelola pengaturan sistem inventori Anda</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Store Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Informasi Toko
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="store-name">Nama Toko</Label>
              <Input 
                id="store-name" 
                value={storeSettings.name}
                onChange={(e) => setStoreSettings(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nama toko Anda"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-address">Alamat</Label>
              <Textarea 
                id="store-address" 
                value={storeSettings.address}
                onChange={(e) => setStoreSettings(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Alamat lengkap toko"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-phone">Nomor Telepon</Label>
              <Input 
                id="store-phone" 
                value={storeSettings.phone}
                onChange={(e) => setStoreSettings(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Contoh: +62 812 3456 7890"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-email">Email</Label>
              <Input 
                id="store-email" 
                type="email" 
                value={storeSettings.email}
                onChange={(e) => setStoreSettings(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@toko.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-description">Deskripsi Toko</Label>
              <Textarea 
                id="store-description" 
                value={storeSettings.description || ''}
                onChange={(e) => setStoreSettings(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Deskripsi singkat tentang toko Anda"
                rows={3}
              />
            </div>
            <Button onClick={saveStoreSettings} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Simpan Perubahan
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Pengaturan Notifikasi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Alert Stok Habis</Label>
                <p className="text-sm text-muted-foreground">Dapatkan notifikasi ketika stok produk menipis</p>
              </div>
              <Switch 
                checked={notificationSettings.lowStockAlert}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, lowStockAlert: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Laporan Harian</Label>
                <p className="text-sm text-muted-foreground">Dapatkan ringkasan penjualan harian</p>
              </div>
              <Switch 
                checked={notificationSettings.dailyReport}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, dailyReport: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Pengingat Hutang</Label>
                <p className="text-sm text-muted-foreground">Pengingat jatuh tempo hutang pelanggan</p>
              </div>
              <Switch 
                checked={notificationSettings.debtReminder}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, debtReminder: checked }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock-threshold">Batas Minimum Stok</Label>
              <Input 
                id="stock-threshold" 
                type="number"
                value={notificationSettings.lowStockThreshold}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, lowStockThreshold: parseInt(e.target.value) || 10 }))}
                placeholder="10"
              />
            </div>
            
            <Button onClick={saveNotificationSettings} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Simpan Notifikasi
            </Button>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Pengaturan Sistem
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Backup</Label>
                <p className="text-sm text-muted-foreground">Backup otomatis data ke browser</p>
              </div>
              <Switch 
                checked={systemSettings.autoBackup}
                onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, autoBackup: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Pin untuk Hapus</Label>
                <p className="text-sm text-muted-foreground">Memerlukan PIN untuk menghapus data</p>
              </div>
              <Switch 
                checked={systemSettings.requirePinForDelete}
                onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, requirePinForDelete: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Log Aktivitas</Label>
                <p className="text-sm text-muted-foreground">Catat semua aktivitas pengguna</p>
              </div>
              <Switch 
                checked={systemSettings.activityLog}
                onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, activityLog: checked }))}
              />
            </div>
            
            <Button onClick={saveSystemSettings} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Simpan Sistem
            </Button>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Manajemen Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Backup Data</Label>
              <Button onClick={handleExportData} variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Export Semua Data
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label>Restore Data</Label>
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="outline" className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Import Data
                </Button>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label className="text-destructive">Zona Berbahaya</Label>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Reset Semua Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Semua Data?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tindakan ini akan menghapus SEMUA data termasuk transaksi, produk, kategori, dan hutang piutang. 
                      Tindakan ini tidak dapat dibatalkan. Pastikan Anda sudah melakukan backup data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleResetData} className="bg-destructive text-destructive-foreground">
                      Ya, Hapus Semua
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}