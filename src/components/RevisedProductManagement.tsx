import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { ScrollArea } from './ui/scroll-area'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog'
import { Plus, Search, Package, Edit, Trash2, Minus, TrendingUp, ShoppingCart, FolderPlus, Folder, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import type { StockLog, Receipt, Product, Category } from '../types/inventory'

interface RevisedProductManagementProps {
  onStockLogAdded: (log: StockLog) => void
  onReceiptGenerated: (receipt: Receipt) => void
  onCategoriesUpdated: (categories: Category[]) => void
  onProductsUpdated: (products: Product[]) => void
  categories: Category[]
  products: Product[]
}

interface ProductFormData {
  name: string
  categoryId: string
  stock: number
  hargaJual: number
  hargaPokok: number
  minStock: number
  barcode: string
}

interface CategoryFormData {
  name: string
  description: string
}

export function RevisedProductManagement({ 
  onStockLogAdded, 
  onReceiptGenerated, 
  onCategoriesUpdated,
  onProductsUpdated,
  categories = [],
  products = []
}: RevisedProductManagementProps) {
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false)
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('products')
  
  const [newProduct, setNewProduct] = useState<ProductFormData>({
    name: '',
    categoryId: '',
    stock: 0,
    hargaJual: 0,
    hargaPokok: 0,
    minStock: 10,
    barcode: ''
  })

  const [newCategory, setNewCategory] = useState<CategoryFormData>({
    name: '',
    description: ''
  })

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleAddCategory = () => {
    if (newCategory.name) {
      try {
        const category: Category = {
          id: Date.now().toString(),
          name: newCategory.name,
          description: newCategory.description,
          createdAt: new Date(),
          updatedAt: new Date()
        }

        const updatedCategories = [...categories, category]
        onCategoriesUpdated(updatedCategories)

        // Reset form
        setNewCategory({
          name: '',
          description: ''
        })
        setIsAddCategoryDialogOpen(false)
        
        toast.success('Kategori berhasil ditambahkan!', {
          description: `Kategori "${category.name}" telah dibuat`
        })
        
        // Force refresh to show updated list
        setTimeout(() => {
          window.location.hash = Math.random().toString()
        }, 100)
        
      } catch (error) {
        console.error('Error adding category:', error)
        toast.error('Gagal menambahkan kategori!')
      }
    } else {
      toast.error('Mohon masukkan nama kategori!')
    }
  }

  const handleDeleteCategory = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    if (window.confirm('Hapus kategori ini? Produk yang menggunakan kategori ini akan kehilangan kategorinya.')) {
      try {
        const updatedCategories = categories.filter(c => c.id !== categoryId)
        onCategoriesUpdated(updatedCategories)
        
        // Update products that use this category
        const updatedProducts = products.map(p => 
          p.categoryId === categoryId 
            ? { ...p, categoryId: '', category: '', updatedAt: new Date() }
            : p
        )
        onProductsUpdated(updatedProducts)
        
        toast.success('Kategori berhasil dihapus!', {
          description: `Kategori "${category?.name}" telah dihapus`
        })
        
      } catch (error) {
        console.error('Error deleting category:', error)
        toast.error('Gagal menghapus kategori!')
      }
    }
  }

  const handleAddProduct = () => {
    if (newProduct.name && newProduct.hargaJual > 0) {
      try {
        const category = categories.find(c => c.id === newProduct.categoryId)
        
        const product: Product = {
          id: Date.now().toString(),
          name: newProduct.name,
          category: category?.name || '',
          categoryId: newProduct.categoryId,
          stock: newProduct.stock,
          price: newProduct.hargaJual,
          cost: newProduct.hargaPokok,
          minStock: newProduct.minStock,
          barcode: newProduct.barcode,
          createdAt: new Date(),
          updatedAt: new Date()
        }

        const updatedProducts = [...products, product]
        onProductsUpdated(updatedProducts)

        // Log stock addition if initial stock > 0
        if (newProduct.stock > 0) {
          const stockLog: StockLog = {
            id: Date.now().toString(),
            productId: product.id,
            productName: product.name,
            type: 'masuk',
            jumlah: newProduct.stock,
            tanggal: new Date(),
            reference: 'Tambah Produk Baru',
            createdAt: new Date()
          }
          onStockLogAdded(stockLog)
        }

        // Reset form
        setNewProduct({
          name: '',
          categoryId: '',
          stock: 0,
          hargaJual: 0,
          hargaPokok: 0,
          minStock: 10,
          barcode: ''
        })
        setIsAddProductDialogOpen(false)
        
        toast.success('Produk berhasil ditambahkan!', {
          description: `${product.name} telah ditambahkan ke inventory`
        })
        
        // Force refresh to show updated list
        setTimeout(() => {
          // This forces a re-render to ensure list is updated
          window.location.hash = Math.random().toString()
        }, 100)
        
      } catch (error) {
        console.error('Error adding product:', error)
        toast.error('Gagal menambahkan produk!')
      }
    } else {
      toast.error('Mohon lengkapi nama produk dan harga jual!')
    }
  }

  const handleEditProduct = () => {
    if (editingProduct && newProduct.name && newProduct.hargaJual > 0) {
      const stockDifference = newProduct.stock - editingProduct.stock
      const category = categories.find(c => c.id === newProduct.categoryId)
      
      const updatedProduct: Product = {
        ...editingProduct,
        name: newProduct.name,
        category: category?.name || '',
        categoryId: newProduct.categoryId,
        stock: newProduct.stock,
        price: newProduct.hargaJual,
        cost: newProduct.hargaPokok,
        minStock: newProduct.minStock,
        barcode: newProduct.barcode,
        updatedAt: new Date()
      }

      const updatedProducts = products.map(p => p.id === editingProduct.id ? updatedProduct : p)
      onProductsUpdated(updatedProducts)

      // Log stock changes
      if (stockDifference !== 0) {
        const stockLog: StockLog = {
          id: Date.now().toString(),
          productId: updatedProduct.id,
          productName: updatedProduct.name,
          type: stockDifference > 0 ? 'masuk' : 'keluar',
          jumlah: Math.abs(stockDifference),
          tanggal: new Date(),
          reference: stockDifference > 0 ? 'Penambahan Stok Manual' : 'Pengurangan Stok Manual',
          createdAt: new Date()
        }
        onStockLogAdded(stockLog)
      }

      setEditingProduct(null)
      setIsEditDialogOpen(false)
    }
  }

  const handleDeleteProduct = (product: Product) => {
    if (window.confirm(`Hapus produk "${product.name}"? Data ini tidak dapat dikembalikan.`)) {
      const updatedProducts = products.filter(p => p.id !== product.id)
      onProductsUpdated(updatedProducts)
      // Note: Deleting product does NOT create stock log as per requirements
    }
  }

  const handleStockAdjustment = (product: Product, adjustment: number) => {
    const newStock = Math.max(0, product.stock + adjustment)
    const updatedProduct = { ...product, stock: newStock, updatedAt: new Date() }
    
    const updatedProducts = products.map(p => p.id === product.id ? updatedProduct : p)
    onProductsUpdated(updatedProducts)

    // Log stock change
    if (adjustment !== 0) {
      const stockLog: StockLog = {
        id: Date.now().toString(),
        productId: product.id,
        productName: product.name,
        type: adjustment > 0 ? 'masuk' : 'keluar',
        jumlah: Math.abs(adjustment),
        tanggal: new Date(),
        reference: adjustment > 0 ? 'Penambahan Stok Manual' : 'Pengurangan Stok Manual',
        createdAt: new Date()
      }
      onStockLogAdded(stockLog)
    }
  }

  const openEditDialog = (product: Product) => {
    setEditingProduct(product)
    setNewProduct({
      name: product.name,
      categoryId: product.categoryId || '',
      stock: product.stock,
      hargaJual: product.price,
      hargaPokok: product.cost || 0,
      minStock: product.minStock || 10,
      barcode: product.barcode || ''
    })
    setIsEditDialogOpen(true)
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalProducts = products.length
  const totalValue = products.reduce((sum, product) => sum + (product.stock * product.price), 0)
  const lowStockProducts = products.filter(p => p.stock < (p.minStock || 10)).length

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Barang (Inventory)</h1>
          <p className="text-muted-foreground mt-1">Kelola stok, produk, dan kategori</p>
        </div>

        <div className="flex gap-3">
          <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="px-4 py-2">
                <FolderPlus className="w-4 h-4 mr-2" />
                Tambah Kategori
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Tambah Kategori Baru</DialogTitle>
                <DialogDescription>
                  Buat kategori untuk mengelompokkan produk. Harga akan diatur saat membuat produk.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nama Kategori</Label>
                  <Input
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="Contoh: LCD, Handphone, Aksesoris"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Deskripsi (Opsional)</Label>
                  <Input
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    placeholder="Deskripsi kategori"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsAddCategoryDialogOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleAddCategory} disabled={!newCategory.name}>
                  Simpan Kategori
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddProductDialogOpen} onOpenChange={setIsAddProductDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Barang
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Tambah Barang Baru</DialogTitle>
                <DialogDescription>
                  Isi informasi produk yang akan ditambahkan ke inventory.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nama Barang</Label>
                  <Input
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="Nama produk"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <select
                    value={newProduct.categoryId}
                    onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })}
                    className="w-full rounded-md border border-border bg-input-background px-3 py-2 text-sm"
                  >
                    <option value="">Pilih kategori</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Stok Awal</Label>
                    <Input
                      type="number"
                      value={newProduct.stock || ''}
                      onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Minimal Stok</Label>
                    <Input
                      type="number"
                      value={newProduct.minStock || ''}
                      onChange={(e) => setNewProduct({ ...newProduct, minStock: parseInt(e.target.value) || 10 })}
                      placeholder="10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Harga Pokok/Modal</Label>
                  <Input
                    type="number"
                    value={newProduct.hargaPokok || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, hargaPokok: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Harga Jual</Label>
                  <Input
                    type="number"
                    value={newProduct.hargaJual || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, hargaJual: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Barcode (Opsional)</Label>
                  <Input
                    value={newProduct.barcode}
                    onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                    placeholder="Barcode produk"
                  />
                </div>

                {newProduct.hargaJual > 0 && newProduct.hargaPokok > 0 && (
                  <div className="p-3 bg-accent rounded-lg">
                    <p className="text-sm font-medium">
                      Keuntungan per unit: {formatRupiah(newProduct.hargaJual - newProduct.hargaPokok)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Margin: {((newProduct.hargaJual - newProduct.hargaPokok) / newProduct.hargaJual * 100).toFixed(1)}%
                    </p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsAddProductDialogOpen(false)}>
                  Batal
                </Button>
                <Button 
                  onClick={handleAddProduct} 
                  disabled={!newProduct.name || !newProduct.hargaJual}
                >
                  Simpan Barang
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-600" />
              Total Produk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Total Nilai Stok
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatRupiah(totalValue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              Stok Rendah
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lowStockProducts}</div>
            <p className="text-xs text-muted-foreground">
              Di bawah minimal stok
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts > 0 && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Peringatan Stok Rendah
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {products.filter(p => p.stock < (p.minStock || 10)).slice(0, 5).map(product => (
                <div key={product.id} className="flex items-center justify-between p-2 bg-white dark:bg-red-900/20 rounded border border-red-200">
                  <div>
                    <p className="font-medium text-red-700">{product.name}</p>
                    <p className="text-sm text-red-600">
                      Stok: {product.stock} (Min: {product.minStock || 10})
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(product)}
                    className="text-red-600 border-red-200"
                  >
                    Tambah Stok
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs for Products and Categories */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="products">Produk</TabsTrigger>
          <TabsTrigger value="categories">Kategori</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari produk atau barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Products Table */}
          <Card>
            <CardHeader>
              <CardTitle>Daftar Produk</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader className="sticky top-0 bg-card z-10">
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Stok</TableHead>
                      <TableHead>Harga Pokok</TableHead>
                      <TableHead>Harga Jual</TableHead>
                      <TableHead>Nilai Stok</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow 
                        key={product.id}
                        className={product.stock < (product.minStock || 10) ? 'bg-red-50 dark:bg-red-950/10' : ''}
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            {product.barcode && (
                              <p className="text-xs text-muted-foreground font-mono">{product.barcode}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {product.category && (
                            <Badge variant="outline">{product.category}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${product.stock < (product.minStock || 10) ? 'text-red-600' : ''}`}>
                              {product.stock}
                            </span>
                            {product.stock < (product.minStock || 10) && (
                              <AlertTriangle className="w-3 h-3 text-red-500" />
                            )}
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStockAdjustment(product, -1)}
                                disabled={product.stock <= 0}
                                className="h-6 w-6 p-0"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStockAdjustment(product, 1)}
                                className="h-6 w-6 p-0"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{formatRupiah(product.cost || 0)}</TableCell>
                        <TableCell className="font-medium">{formatRupiah(product.price)}</TableCell>
                        <TableCell className="font-medium text-green-600">
                          {formatRupiah(product.stock * product.price)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDialog(product)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0 border-red-200 text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Hapus Produk</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Apakah Anda yakin ingin menghapus produk "{product.name}"? 
                                    Data ini tidak dapat dikembalikan.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteProduct(product)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Hapus
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          {/* Categories Table */}
          <Card>
            <CardHeader>
              <CardTitle>Daftar Kategori</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader className="sticky top-0 bg-card z-10">
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead>Jumlah Produk</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCategories.map((category) => {
                      const productCount = products.filter(p => p.categoryId === category.id).length
                      return (
                        <TableRow key={category.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Folder className="w-4 h-4 text-blue-600" />
                              <span className="font-medium">{category.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{category.description || '-'}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{productCount} produk</Badge>
                          </TableCell>
                          <TableCell>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0 border-red-200 text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Hapus Kategori</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Apakah Anda yakin ingin menghapus kategori "{category.name}"? 
                                    {productCount > 0 && ` ${productCount} produk akan kehilangan kategorinya.`}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteCategory(category.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Hapus
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Barang</DialogTitle>
            <DialogDescription>
              Update informasi produk di inventory.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama Barang</Label>
              <Input
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                placeholder="Nama produk"
              />
            </div>

            <div className="space-y-2">
              <Label>Kategori</Label>
              <select
                value={newProduct.categoryId}
                onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })}
                className="w-full rounded-md border border-border bg-input-background px-3 py-2 text-sm"
              >
                <option value="">Pilih kategori</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Stok</Label>
                <Input
                  type="number"
                  value={newProduct.stock || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Minimal Stok</Label>
                <Input
                  type="number"
                  value={newProduct.minStock || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, minStock: parseInt(e.target.value) || 10 })}
                  placeholder="10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Harga Pokok/Modal</Label>
              <Input
                type="number"
                value={newProduct.hargaPokok || ''}
                onChange={(e) => setNewProduct({ ...newProduct, hargaPokok: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label>Harga Jual</Label>
              <Input
                type="number"
                value={newProduct.hargaJual || ''}
                onChange={(e) => setNewProduct({ ...newProduct, hargaJual: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label>Barcode</Label>
              <Input
                value={newProduct.barcode}
                onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                placeholder="Barcode produk"
              />
            </div>

            {newProduct.hargaJual > 0 && newProduct.hargaPokok > 0 && (
              <div className="p-3 bg-accent rounded-lg">
                <p className="text-sm font-medium">
                  Keuntungan per unit: {formatRupiah(newProduct.hargaJual - newProduct.hargaPokok)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Margin: {((newProduct.hargaJual - newProduct.hargaPokok) / newProduct.hargaJual * 100).toFixed(1)}%
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Batal
            </Button>
            <Button 
              onClick={handleEditProduct} 
              disabled={!newProduct.name || !newProduct.hargaJual}
            >
              Update Barang
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}