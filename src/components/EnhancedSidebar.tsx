import { 
  BarChart3, 
  Package, 
  ClipboardList, 
  Settings,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  UserCheck,
  DollarSign,
  Sun,
  Moon,
  Search,
  Keyboard
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { Switch } from './ui/switch'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Button } from './ui/button'
import { toast } from 'sonner@2.0.3'

interface EnhancedSidebarProps {
  activeMenu: string
  setActiveMenu: (menu: string) => void
  storeName?: string
  storeLogo?: string
  onGlobalSearch?: (query: string) => void
}

export function EnhancedSidebar({ activeMenu, setActiveMenu, storeName, storeLogo, onGlobalSearch }: EnhancedSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [currentStoreName, setCurrentStoreName] = useState('Sistem Kelola Barang')
  const [currentStoreLogo, setCurrentStoreLogo] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [notificationCount, setNotificationCount] = useState(0)

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')
    setIsDarkMode(isDark)
    
    // Load store settings from localStorage
    try {
      const savedStoreSettings = localStorage.getItem('inventory_storeSettings')
      if (savedStoreSettings) {
        const settings = JSON.parse(savedStoreSettings)
        setCurrentStoreName(settings.name || 'Sistem Kelola Barang')
        setCurrentStoreLogo(settings.logo || '')
      }
    } catch (error) {
      console.error('Failed to load store settings:', error)
    }

    // Check for low stock items
    try {
      const products = JSON.parse(localStorage.getItem('inventory_products') || '[]')
      const notificationSettings = JSON.parse(localStorage.getItem('inventory_notificationSettings') || '{}')
      const threshold = notificationSettings.lowStockThreshold || 10
      
      const lowStockCount = products.filter((product: any) => 
        product.stock <= threshold && notificationSettings.lowStockAlert
      ).length
      
      setNotificationCount(lowStockCount)
    } catch (error) {
      console.error('Failed to check notifications:', error)
    }

    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault()
            setShowSearch(true)
            break
          case '1':
            e.preventDefault()
            setActiveMenu('dashboard')
            break
          case '2':
            e.preventDefault()
            setActiveMenu('barang')
            break
          case '3':
            e.preventDefault()
            setActiveMenu('transaksi')
            break
          case '4':
            e.preventDefault()
            setActiveMenu('hutang-piutang')
            break
        }
      }
      
      if (e.key === 'F1') {
        e.preventDefault()
        setActiveMenu('barang')
        toast.success('Navigasi ke Manajemen Barang')
      } else if (e.key === 'F2') {
        e.preventDefault()
        setActiveMenu('transaksi')
        toast.success('Navigasi ke Transaksi')
      } else if (e.key === 'F3') {
        e.preventDefault()
        setActiveMenu('hutang-piutang')
        toast.success('Navigasi ke Hutang Piutang')
      } else if (e.key === 'F4') {
        e.preventDefault()
        setActiveMenu('laporan')
        toast.success('Navigasi ke Laporan')
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [setActiveMenu])

  // Update store name and logo from props (instant sync)
  useEffect(() => {
    if (storeName) {
      setCurrentStoreName(storeName)
    }
  }, [storeName])

  useEffect(() => {
    if (storeLogo !== undefined) {
      setCurrentStoreLogo(storeLogo)
    }
  }, [storeLogo])

  const toggleDarkMode = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    if (newMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    // Save to system settings
    try {
      const systemSettings = JSON.parse(localStorage.getItem('inventory_systemSettings') || '{}')
      systemSettings.darkMode = newMode
      localStorage.setItem('inventory_systemSettings', JSON.stringify(systemSettings))
    } catch (error) {
      console.error('Failed to save dark mode setting:', error)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (onGlobalSearch) {
      onGlobalSearch(query)
    }
  }

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: BarChart3,
      shortcut: 'Ctrl+1',
      badge: null
    },
    { 
      id: 'barang', 
      label: 'Barang', 
      icon: Package,
      shortcut: 'F1',
      badge: notificationCount > 0 ? notificationCount : null
    },
    { 
      id: 'transaksi', 
      label: 'Transaksi', 
      icon: CreditCard,
      shortcut: 'F2',
      badge: null
    },
    { 
      id: 'hutang-piutang', 
      label: 'Hutang Piutang', 
      icon: UserCheck,
      shortcut: 'F3',
      badge: null
    },
    { 
      id: 'laporan', 
      label: 'Laporan', 
      icon: ClipboardList,
      shortcut: 'F4',
      badge: null
    },
    { 
      id: 'keuangan', 
      label: 'Keuangan', 
      icon: DollarSign,
      shortcut: null,
      badge: null
    },
    { 
      id: 'pengaturan', 
      label: 'Pengaturan', 
      icon: Settings,
      shortcut: null,
      badge: null
    },
  ]

  return (
    <div className={`
      ${isCollapsed ? 'w-16' : 'w-64'} 
      bg-sidebar border-r border-sidebar-border 
      transition-all duration-300 ease-in-out 
      flex flex-col h-full relative
      custom-scrollbar
    `}>
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {currentStoreLogo ? (
              <img 
                src={currentStoreLogo} 
                alt="Logo" 
                className="w-8 h-8 rounded-lg object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-sidebar-primary-foreground" />
              </div>
            )}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <span className="font-medium text-sidebar-foreground transition-opacity duration-200 block truncate">
                {currentStoreName}
              </span>
              <span className="text-xs text-sidebar-foreground/60">
                Sistem Inventori
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Global Search */}
      {!isCollapsed && (
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari produk, transaksi... (Ctrl+K)"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/60"
            />
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-2 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                transition-all duration-200 group relative
                ${activeMenu === item.id 
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm' 
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }
              `}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className={`
                w-5 h-5 transition-transform duration-200
                ${activeMenu === item.id ? 'scale-110' : 'group-hover:scale-105'}
              `} />
              
              {!isCollapsed && (
                <>
                  <span className="font-medium truncate flex-1 text-left">
                    {item.label}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <Badge 
                        variant="secondary" 
                        className="h-5 px-1.5 text-xs bg-destructive text-destructive-foreground"
                      >
                        {item.badge}
                      </Badge>
                    )}
                    
                    {item.shortcut && (
                      <span className="text-xs text-sidebar-foreground/60 hidden lg:inline">
                        {item.shortcut}
                      </span>
                    )}
                  </div>
                </>
              )}

              {isCollapsed && item.badge && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center">
                  <span className="text-xs text-destructive-foreground font-medium">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Keyboard shortcuts info */}
      {!isCollapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-sidebar-foreground/60">
              <Keyboard className="w-3 h-3" />
              <span>Pintasan Keyboard</span>
            </div>
            <div className="text-xs text-sidebar-foreground/60 space-y-1">
              <div>Ctrl+K: Pencarian</div>
              <div>F1-F4: Navigasi cepat</div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="p-4 border-t border-sidebar-border space-y-3">
        {/* Theme Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-sidebar-foreground" />
            <Switch 
              checked={isDarkMode}
              onCheckedChange={toggleDarkMode}
            />
            <Moon className="w-4 h-4 text-sidebar-foreground" />
          </div>
          {!isCollapsed && (
            <span className="text-sm text-sidebar-foreground">
              {isDarkMode ? 'Gelap' : 'Terang'}
            </span>
          )}
        </div>

        {/* Collapse Toggle */}
        <Button
          onClick={() => setIsCollapsed(!isCollapsed)}
          variant="ghost"
          size="sm"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="ml-2">Sembunyikan</span>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}