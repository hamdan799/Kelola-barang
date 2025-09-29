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
  Moon
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { Switch } from './ui/switch'

interface SidebarProps {
  activeMenu: string
  setActiveMenu: (menu: string) => void
}

export function Sidebar({ activeMenu, setActiveMenu }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [storeName, setStoreName] = useState('Sistem Kelola Barang')

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')
    setIsDarkMode(isDark)
    
    // Load store name from settings
    try {
      const savedStoreSettings = localStorage.getItem('inventory_storeSettings')
      if (savedStoreSettings) {
        const settings = JSON.parse(savedStoreSettings)
        setStoreName(settings.name || 'Sistem Kelola Barang')
      }
    } catch (error) {
      console.error('Failed to load store name:', error)
    }
  }, [])

  const toggleDarkMode = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    if (newMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'barang', label: 'Barang', icon: Package },
    { id: 'laporan', label: 'Laporan', icon: ClipboardList },
    { id: 'transaksi', label: 'Transaksi', icon: CreditCard },
    { id: 'hutang-piutang', label: 'Hutang Piutang', icon: UserCheck },
    { id: 'keuangan', label: 'Keuangan', icon: DollarSign },
    { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
  ]

  return (
    <div className={`bg-sidebar min-h-screen border-r border-sidebar-border shadow-lg transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-20' : 'w-60'
    }`}>
      <div className="flex flex-col h-full">
        {/* Header with Logo */}
        <div className={`p-4 ${isCollapsed ? 'px-2' : 'px-6'}`}>
          <div className={`flex items-center mb-6 ${isCollapsed ? 'justify-center' : 'gap-2'}`}>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm">T</span>
            </div>
            {!isCollapsed && (
              <span className="font-medium text-sidebar-foreground transition-opacity duration-200">
                {storeName}
              </span>
            )}
          </div>

          {/* Dark Mode Switch */}
          {!isCollapsed && (
            <div className="mb-6 p-3 bg-sidebar-accent rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isDarkMode ? (
                    <Moon className="w-4 h-4 text-sidebar-foreground/70" />
                  ) : (
                    <Sun className="w-4 h-4 text-sidebar-foreground/70" />
                  )}
                  <span className="text-sm text-sidebar-foreground/70">
                    {isDarkMode ? 'Dark' : 'Light'} Mode
                  </span>
                </div>
                <Switch 
                  checked={isDarkMode} 
                  onCheckedChange={toggleDarkMode}
                />
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="mb-6 flex justify-center">
              <button
                onClick={toggleDarkMode}
                className="p-2 hover:bg-sidebar-accent rounded-lg transition-colors"
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? (
                  <Moon className="w-4 h-4 text-sidebar-foreground/70" />
                ) : (
                  <Sun className="w-4 h-4 text-sidebar-foreground/70" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className={`flex-1 space-y-1 ${isCollapsed ? 'px-2' : 'px-4'}`}>
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center rounded-lg transition-all duration-200 ${
                  isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2'
                } ${
                  activeMenu === item.id
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-lg'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="transition-opacity duration-200">
                    {item.label}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Toggle Button */}
        <div className={`p-4 border-t border-sidebar-border ${isCollapsed ? 'px-2' : 'px-4'}`}>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`w-full flex items-center text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-all duration-200 ${
              isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2'
            }`}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="transition-opacity duration-200">Collapse</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}