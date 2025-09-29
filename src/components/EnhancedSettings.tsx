import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { Separator } from './ui/separator'
import { Textarea } from './ui/textarea'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Settings as SettingsIcon, Store, Bell, Database, Shield, Upload, Download, Trash2, Save, Camera, X, Check, RotateCw } from 'lucide-react'
import { toast } from 'sonner@2.0.3'

interface StoreSettings {
  name: string
  address: string
  phone: string
  email: string
  logo?: string
  description?: string
  currency: string
  taxRate: number
  receiptFooter: string
}

interface NotificationSettings {
  lowStockAlert: boolean
  dailyReport: boolean
  debtReminder: boolean
  newTransaction: boolean
  lowStockThreshold: number
  emailNotifications: boolean
  smsNotifications: boolean
  soundAlerts: boolean
}

interface SystemSettings {
  autoBackup: boolean
  requirePinForDelete: boolean
  activityLog: boolean
  darkMode: boolean
  language: string
  timeZone: string
  backupFrequency: 'daily' | 'weekly' | 'monthly'
  maxTransactionHistory: number
  enableApiAccess: boolean
}

interface PerformanceSettings {
  cacheEnabled: boolean
  preloadData: boolean
  compressionEnabled: boolean
  maxCacheSize: number
  autoOptimize: boolean
}

interface EnhancedSettingsProps {
  onStoreNameChange?: (name: string) => void
  onLogoChange?: (logo: string) => void
}

export function EnhancedSettings({ onStoreNameChange, onLogoChange }: EnhancedSettingsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    name: 'Sistem Kelola Barang',
    address: '',
    phone: '',
    email: '',
    logo: '',
    description: '',
    currency: 'IDR',
    taxRate: 0,
    receiptFooter: 'Terima kasih atas kunjungan Anda!'
  })

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    lowStockAlert: true,
    dailyReport: false,
    debtReminder: true,
    newTransaction: false,
    lowStockThreshold: 10,
    emailNotifications: true,
    smsNotifications: false,
    soundAlerts: true
  })

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    autoBackup: true,
    requirePinForDelete: false,
    activityLog: true,
    darkMode: false,
    language: 'id',
    timeZone: 'Asia/Jakarta',
    backupFrequency: 'daily',
    maxTransactionHistory: 10000,
    enableApiAccess: false
  })

  const [performanceSettings, setPerformanceSettings] = useState<PerformanceSettings>({
    cacheEnabled: true,
    preloadData: true,
    compressionEnabled: true,
    maxCacheSize: 50,
    autoOptimize: true
  })

  const [logoPreview, setLogoPreview] = useState<string>('')
  const [isLogoDialogOpen, setIsLogoDialogOpen] = useState(false)
  const [logoScale, setLogoScale] = useState(1)
  const [logoRotation, setLogoRotation] = useState(0)
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 200, height: 200 })
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null)
  const [exportProgress, setExportProgress] = useState(0)
  const [isExporting, setIsExporting] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedStoreSettings = localStorage.getItem('inventory_storeSettings')
      const savedNotificationSettings = localStorage.getItem('inventory_notificationSettings')
      const savedSystemSettings = localStorage.getItem('inventory_systemSettings')
      const savedPerformanceSettings = localStorage.getItem('inventory_performanceSettings')

      if (savedStoreSettings) {
        const settings = JSON.parse(savedStoreSettings)
        setStoreSettings(settings)
        setLogoPreview(settings.logo || '')
      }
      if (savedNotificationSettings) {
        setNotificationSettings(JSON.parse(savedNotificationSettings))
      }
      if (savedSystemSettings) {
        setSystemSettings(JSON.parse(savedSystemSettings))
      }
      if (savedPerformanceSettings) {
        setPerformanceSettings(JSON.parse(savedPerformanceSettings))
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
      toast.error('Gagal memuat pengaturan!')
    }
  }, [])

  const saveStoreSettings = async () => {
    try {
      localStorage.setItem('inventory_storeSettings', JSON.stringify(storeSettings))
      
      // Immediately update sidebar if name changed
      if (onStoreNameChange) {
        onStoreNameChange(storeSettings.name)
      }
      
      // Update logo if changed
      if (onLogoChange && storeSettings.logo) {
        onLogoChange(storeSettings.logo)
      }
      
      toast.success('Pengaturan toko berhasil disimpan!', {
        description: 'Perubahan akan terlihat langsung di aplikasi'
      })
    } catch (error) {
      console.error('Failed to save store settings:', error)
      toast.error('Gagal menyimpan pengaturan toko!')
    }
  }

  const saveNotificationSettings = async () => {
    try {
      localStorage.setItem('inventory_notificationSettings', JSON.stringify(notificationSettings))
      toast.success('Pengaturan notifikasi berhasil disimpan!')
    } catch (error) {
      console.error('Failed to save notification settings:', error)
      toast.error('Gagal menyimpan pengaturan notifikasi!')
    }
  }

  const saveSystemSettings = async () => {
    try {
      localStorage.setItem('inventory_systemSettings', JSON.stringify(systemSettings))
      
      // Apply dark mode immediately
      if (systemSettings.darkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      
      toast.success('Pengaturan sistem berhasil disimpan!')
    } catch (error) {
      console.error('Failed to save system settings:', error)
      toast.error('Gagal menyimpan pengaturan sistem!')
    }
  }

  const savePerformanceSettings = async () => {
    try {
      localStorage.setItem('inventory_performanceSettings', JSON.stringify(performanceSettings))
      toast.success('Pengaturan performa berhasil disimpan!')
    } catch (error) {
      console.error('Failed to save performance settings:', error)
      toast.error('Gagal menyimpan pengaturan performa!')
    }
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar!')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 2MB!')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        setOriginalImage(img)
        setLogoPreview(e.target?.result as string)
        setIsLogoDialogOpen(true)
        setCropArea({ x: 0, y: 0, width: Math.min(img.width, 200), height: Math.min(img.height, 200) })
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
    
    // Reset file input
    event.target.value = ''
  }

  const processCroppedImage = () => {
    if (!originalImage || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size to crop area
    canvas.width = cropArea.width
    canvas.height = cropArea.height

    // Apply transformations
    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.scale(logoScale, logoScale)
    ctx.rotate((logoRotation * Math.PI) / 180)

    // Draw cropped image
    ctx.drawImage(
      originalImage,
      cropArea.x,
      cropArea.y,
      cropArea.width,
      cropArea.height,
      -cropArea.width / 2,
      -cropArea.height / 2,
      cropArea.width,
      cropArea.height
    )
    ctx.restore()

    // Convert to base64
    const croppedImageUrl = canvas.toDataURL('image/png', 0.9)
    
    setStoreSettings(prev => ({ ...prev, logo: croppedImageUrl }))
    setLogoPreview(croppedImageUrl)
    setIsLogoDialogOpen(false)
    
    toast.success('Logo berhasil diproses!')
  }

  const removeLogo = () => {
    setStoreSettings(prev => ({ ...prev, logo: '' }))
    setLogoPreview('')
    toast.success('Logo berhasil dihapus!')
  }

  const handleExportData = async () => {
    setIsExporting(true)
    setExportProgress(0)

    try {
      // Simulate progressive export
      const steps = [
        { name: 'Mengumpulkan data toko...', progress: 20 },
        { name: 'Mengumpulkan transaksi...', progress: 40 },
        { name: 'Mengumpulkan produk...', progress: 60 },
        { name: 'Mengumpulkan hutang piutang...', progress: 80 },
        { name: 'Finalisasi export...', progress: 100 }
      ]

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 300))
        setExportProgress(step.progress)
      }

      const allData = {
        storeSettings,
        notificationSettings,
        systemSettings,
        performanceSettings,
        transactions: JSON.parse(localStorage.getItem('inventory_transactions') || '[]'),
        products: JSON.parse(localStorage.getItem('inventory_products') || '[]'),
        categories: JSON.parse(localStorage.getItem('inventory_categories') || '[]'),
        debts: JSON.parse(localStorage.getItem('inventory_debts') || '[]'),
        stockLogs: JSON.parse(localStorage.getItem('inventory_stockLogs') || '[]'),
        receipts: JSON.parse(localStorage.getItem('inventory_receipts') || '[]'),
        exportDate: new Date().toISOString(),
        version: '2.0.0'
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
    } finally {
      setIsExporting(false)
      setExportProgress(0)
    }
  }

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string)
        
        // Validate data structure
        if (!importedData.version) {
          toast.error('File backup tidak valid atau versi lama!')
          return
        }
        
        // Restore settings
        if (importedData.storeSettings) {
          setStoreSettings(importedData.storeSettings)
          localStorage.setItem('inventory_storeSettings', JSON.stringify(importedData.storeSettings))
          setLogoPreview(importedData.storeSettings.logo || '')
        }
        if (importedData.notificationSettings) {
          setNotificationSettings(importedData.notificationSettings)
          localStorage.setItem('inventory_notificationSettings', JSON.stringify(importedData.notificationSettings))
        }
        if (importedData.systemSettings) {
          setSystemSettings(importedData.systemSettings)
          localStorage.setItem('inventory_systemSettings', JSON.stringify(importedData.systemSettings))
        }
        if (importedData.performanceSettings) {
          setPerformanceSettings(importedData.performanceSettings)
          localStorage.setItem('inventory_performanceSettings', JSON.stringify(importedData.performanceSettings))
        }
        
        // Restore data
        const dataKeys = ['transactions', 'products', 'categories', 'debts', 'stockLogs', 'receipts']
        dataKeys.forEach(key => {
          if (importedData[key]) {
            localStorage.setItem(`inventory_${key}`, JSON.stringify(importedData[key]))
          }
        })

        toast.success('Data berhasil diimpor!', {
          description: 'Silakan refresh halaman untuk melihat perubahan'
        })
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
      
      toast.success('Semua data berhasil dihapus!', {
        description: 'Silakan refresh halaman untuk mulai fresh'
      })
    } catch (error) {
      console.error('Reset failed:', error)
      toast.error('Gagal menghapus data!')
    }
  }

  const handleResetSettings = () => {
    try {
      // Reset to defaults
      const defaultStore: StoreSettings = {
        name: 'Sistem Kelola Barang',
        address: '',
        phone: '',
        email: '',
        logo: '',
        description: '',
        currency: 'IDR',
        taxRate: 0,
        receiptFooter: 'Terima kasih atas kunjungan Anda!'
      }
      
      setStoreSettings(defaultStore)
      localStorage.setItem('inventory_storeSettings', JSON.stringify(defaultStore))
      setLogoPreview('')
      
      toast.success('Pengaturan berhasil direset!')
    } catch (error) {
      console.error('Reset settings failed:', error)
      toast.error('Gagal mereset pengaturan!')
    }
  }

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Pengaturan</h1>
          <p className="text-muted-foreground mt-1">Kelola pengaturan sistem inventori Anda</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportData} variant="outline" disabled={isExporting}>
            {isExporting ? <RotateCw className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            {isExporting ? 'Mengekspor...' : 'Export Data'}
          </Button>
        </div>
      </div>

      {isExporting && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress Export</span>
                <span>{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Store Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Informasi Toko
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo Section */}
            <div className="space-y-4">
              <Label>Logo Toko</Label>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {logoPreview ? (
                    <div className="relative">
                      <img 
                        src={logoPreview} 
                        alt="Logo toko" 
                        className="w-24 h-24 object-cover rounded-lg border-2 border-border"
                      />
                      <Button
                        onClick={removeLogo}
                        size="sm"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted">
                      <Camera className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    size="sm"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Logo
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, atau SVG. Maksimal 2MB.<br />
                    Rekomendasi: 200x200px persegi.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="store-name">Nama Toko *</Label>
                <Input 
                  id="store-name" 
                  value={storeSettings.name}
                  onChange={(e) => setStoreSettings(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nama toko Anda"
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
                <Label htmlFor="store-currency">Mata Uang</Label>
                <select 
                  id="store-currency" 
                  value={storeSettings.currency}
                  onChange={(e) => setStoreSettings(prev => ({ ...prev, currency: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="IDR">Indonesian Rupiah (IDR)</option>
                  <option value="USD">US Dollar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                </select>
              </div>
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
              <Label htmlFor="store-description">Deskripsi Toko</Label>
              <Textarea 
                id="store-description" 
                value={storeSettings.description || ''}
                onChange={(e) => setStoreSettings(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Deskripsi singkat tentang toko Anda"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receipt-footer">Footer Struk</Label>
              <Input 
                id="receipt-footer" 
                value={storeSettings.receiptFooter}
                onChange={(e) => setStoreSettings(prev => ({ ...prev, receiptFooter: e.target.value }))}
                placeholder="Pesan di bagian bawah struk"
              />
            </div>

            <div className="flex justify-between items-center pt-4">
              <Button onClick={saveStoreSettings} className="px-8">
                <Save className="w-4 h-4 mr-2" />
                Simpan Perubahan
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <RotateCw className="w-4 h-4 mr-2" />
                    Reset Pengaturan
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset Pengaturan Toko?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tindakan ini akan mengembalikan semua pengaturan toko ke nilai default. 
                      Logo dan data toko akan dihapus.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleResetSettings} className="bg-destructive text-destructive-foreground">
                      Ya, Reset
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
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

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifikasi</Label>
                <p className="text-sm text-muted-foreground">Kirim notifikasi via email</p>
              </div>
              <Switch 
                checked={notificationSettings.emailNotifications}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Suara Alert</Label>
                <p className="text-sm text-muted-foreground">Aktifkan suara untuk notifikasi</p>
              </div>
              <Switch 
                checked={notificationSettings.soundAlerts}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, soundAlerts: checked }))}
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
                min="1"
                max="100"
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
                <Label>Mode Gelap</Label>
                <p className="text-sm text-muted-foreground">Aktifkan tema gelap</p>
              </div>
              <Switch 
                checked={systemSettings.darkMode}
                onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, darkMode: checked }))}
              />
            </div>
            
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

            <div className="space-y-2">
              <Label htmlFor="backup-frequency">Frekuensi Backup</Label>
              <select 
                id="backup-frequency" 
                value={systemSettings.backupFrequency}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, backupFrequency: e.target.value as 'daily' | 'weekly' | 'monthly' }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="daily">Harian</option>
                <option value="weekly">Mingguan</option>
                <option value="monthly">Bulanan</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-history">Maksimal Riwayat Transaksi</Label>
              <Input 
                id="max-history" 
                type="number"
                value={systemSettings.maxTransactionHistory}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, maxTransactionHistory: parseInt(e.target.value) || 10000 }))}
                placeholder="10000"
                min="100"
                max="100000"
              />
            </div>
            
            <Button onClick={saveSystemSettings} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Simpan Sistem
            </Button>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Manajemen Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Backup Data</Label>
                <Button onClick={handleExportData} variant="outline" className="w-full" disabled={isExporting}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Semua Data
                </Button>
                <p className="text-xs text-muted-foreground">
                  Download semua data dalam format JSON
                </p>
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
                <p className="text-xs text-muted-foreground">
                  Restore dari file backup JSON
                </p>
              </div>

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
                <p className="text-xs text-muted-foreground">
                  Hapus semua data aplikasi
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-primary">
                  {JSON.parse(localStorage.getItem('inventory_transactions') || '[]').length}
                </div>
                <div className="text-sm text-muted-foreground">Transaksi</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-primary">
                  {JSON.parse(localStorage.getItem('inventory_products') || '[]').length}
                </div>
                <div className="text-sm text-muted-foreground">Produk</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-primary">
                  {JSON.parse(localStorage.getItem('inventory_debts') || '[]').length}
                </div>
                <div className="text-sm text-muted-foreground">Hutang</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-primary">
                  {(new Blob([JSON.stringify(localStorage)]).size / 1024).toFixed(1)} KB
                </div>
                <div className="text-sm text-muted-foreground">Storage</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logo Crop Dialog */}
      <Dialog open={isLogoDialogOpen} onOpenChange={setIsLogoDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Logo</DialogTitle>
            <DialogDescription>
              Sesuaikan posisi, ukuran, dan rotasi logo Anda
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {logoPreview && (
              <div className="flex justify-center">
                <div className="relative border-2 border-dashed border-border rounded-lg p-4">
                  <img 
                    src={logoPreview} 
                    alt="Preview logo" 
                    className="max-w-[200px] max-h-[200px] object-contain"
                    style={{
                      transform: `scale(${logoScale}) rotate(${logoRotation}deg)`
                    }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Ukuran: {(logoScale * 100).toFixed(0)}%</Label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={logoScale}
                  onChange={(e) => setLogoScale(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Rotasi: {logoRotation}°</Label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="5"
                  value={logoRotation}
                  onChange={(e) => setLogoRotation(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsLogoDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={processCroppedImage}>
                <Check className="w-4 h-4 mr-2" />
                Terapkan
              </Button>
            </div>
          </div>

          <canvas ref={canvasRef} className="hidden" />
        </DialogContent>
      </Dialog>
    </div>
  )
}