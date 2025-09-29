import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { ScrollArea } from './ui/scroll-area'
import { Plus, Search, Package, Edit, Trash2, Minus, TrendingUp, ShoppingCart, FolderPlus, Folder } from 'lucide-react'
import type { StockLog, Receipt, Product, Category } from '../types/inventory'

interface FinalProductManagementProps {
  onStockLogAdded: (log: StockLog) => void
  onReceiptGenerated: (receipt: Receipt) => void
  onCategoriesUpdated: (categories: Category[]) => void
  categories: Category[]
}

interface ProductFormData {
  name: string
  categoryId: string
  stock: number
  hargaPokok: number
  hargaJual: number
}

interface CategoryFormData {
  name: string
  description: string
  defaultPrice: number
  defaultCost: number
}

export function FinalProductManagement({ 
  onStockLogAdded, 
  onReceiptGenerated, 
  onCategoriesUpdated,
  categories = []
}: FinalProductManagementProps) {
  const [products, setProducts] = useState<Product[]>([])
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
    hargaPokok: 0,
    hargaJual: 0
  })

  const [newCategory, setNewCategory] = useState<CategoryFormData>({
    name: '',
    description: '',
    defaultPrice: 0,
    defaultCost: 0
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
      const category: Category = {
        id: Date.now().toString(),
        name: newCategory.name,
        description: newCategory.description,
        defaultPrice: newCategory.defaultPrice,
        defaultCost: newCategory.defaultCost,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const updatedCategories = [...categories, category]
      onCategoriesUpdated(updatedCategories)

      // Reset form
      setNewCategory({
        name: '',
        description: '',
        defaultPrice: 0,
        defaultCost: 0
      })
      setIsAddCategoryDialogOpen(false)
    }
  }

  const handleDeleteCategory = (categoryId: string) => {
    if (window.confirm('Hapus kategori ini? Produk yang menggunakan kategori ini akan kehilangan kategorinya.')) {
      const updatedCategories = categories.filter(c => c.id !== categoryId)
      onCategoriesUpdated(updatedCategories)
      
      // Update products that use this category
      setProducts(prev => prev.map(p => 
        p.categoryId === categoryId 
          ? { ...p, categoryId: '', updatedAt: new Date() }
          : p
      ))
    }
  }

  const handleAddProduct = () => {
    if (newProduct.name && newProduct.hargaJual > 0) {
      const category = categories.find(c => c.id === newProduct.categoryId)
      
      const product: Product = {
        id: Date.now().toString(),
        name: newProduct.name,
        category: category?.name || '',
        categoryId: newProduct.categoryId,
        stock: newProduct.stock,
        price: newProduct.hargaJual,
        cost: newProduct.hargaPokok,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      setProducts(prev => [product, ...prev])

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
        hargaPokok: 0,
        hargaJual: 0
      })
      setIsAddProductDialogOpen(false)
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
        updatedAt: new Date()
      }

      setProducts(prev => prev.map(p => p.id === editingProduct.id ? updatedProduct : p))

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
    if (window.confirm(`Hapus produk "${product.name}"?`)) {
      setProducts(prev => prev.filter(p => p.id !== product.id))
      // Note: Deleting product does NOT create stock log as per requirements
    }
  }

  const handleStockAdjustment = (product: Product, adjustment: number) => {
    const newStock = Math.max(0, product.stock + adjustment)
    const updatedProduct = { ...product, stock: newStock, updatedAt: new Date() }
    
    setProducts(prev => prev.map(p => p.id === product.id ? updatedProduct : p))

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
      hargaPokok: product.cost || 0,
      hargaJual: product.price
    })
    setIsEditDialogOpen(true)
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalProducts = products.length
  const totalValue = products.reduce((sum, product) => sum + (product.stock * product.price), 0)
  const lowStockProducts = products.filter(p => p.stock < 10).length

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
                  Buat kategori untuk mengelompokkan produk.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nama Kategori</Label>
                  <Input
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="Contoh: Elektronik"
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
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Harga Default</Label>
                    <Input
                      type="number"
                      value={newCategory.defaultPrice || ''}
                      onChange={(e) => setNewCategory({ ...newCategory, defaultPrice: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Modal Default</Label>
                    <Input
                      type="number"
                      value={newCategory.defaultCost || ''}
                      onChange={(e) => setNewCategory({ ...newCategory, defaultCost: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
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
            <DialogContent className="sm:max-w-md">
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
                  <Label>Harga Pokok</Label>
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
              <ShoppingCart className="h-4 w-4 text-red-600" />
              Stok Rendah
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lowStockProducts}</div>
          </CardContent>
        </Card>
      </div>

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
              placeholder="Cari produk..."
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
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>
                          {product.category && (
                            <Badge variant="outline">{product.category}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${product.stock < 10 ? 'text-red-600' : ''}`}>
                              {product.stock}
                            </span>
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
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteProduct(product)}
                              className="h-8 w-8 p-0 border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
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
                      <TableHead>Harga Default</TableHead>
                      <TableHead>Modal Default</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCategories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Folder className="w-4 h-4 text-blue-600" />
                            <span className="font-medium">{category.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{category.description || '-'}</TableCell>
                        <TableCell>{formatRupiah(category.defaultPrice || 0)}</TableCell>
                        <TableCell>{formatRupiah(category.defaultCost || 0)}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteCategory(category.id)}
                            className="h-8 w-8 p-0 border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
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
              <Label>Harga Pokok</Label>
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