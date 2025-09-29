import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { ScrollArea } from './ui/scroll-area'
import { Plus, Search, Package, Edit, Trash2, Minus, TrendingUp, ShoppingCart } from 'lucide-react'
import type { StockLog, Receipt, Product } from '../types/inventory'

interface ImprovedProductManagementProps {
  onStockLogAdded: (log: StockLog) => void
  onReceiptGenerated: (receipt: Receipt) => void
}

interface ProductFormData {
  name: string
  category: string
  stock: number
  hargaPokok: number
  hargaJual: number
}

export function ImprovedProductManagement({ onStockLogAdded, onReceiptGenerated }: ImprovedProductManagementProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  const [newProduct, setNewProduct] = useState<ProductFormData>({
    name: '',
    category: '',
    stock: 0,
    hargaPokok: 0,
    hargaJual: 0
  })

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleAddProduct = () => {
    if (newProduct.name && newProduct.category && newProduct.hargaJual > 0) {
      const product: Product = {
        id: Date.now().toString(),
        name: newProduct.name,
        category: newProduct.category,
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
        category: '',
        stock: 0,
        hargaPokok: 0,
        hargaJual: 0
      })
      setIsAddDialogOpen(false)
    }
  }

  const handleEditProduct = () => {
    if (editingProduct && newProduct.name && newProduct.category && newProduct.hargaJual > 0) {
      const stockDifference = newProduct.stock - editingProduct.stock
      
      const updatedProduct: Product = {
        ...editingProduct,
        name: newProduct.name,
        category: newProduct.category,
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
      category: product.category,
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

  const totalProducts = products.length
  const totalValue = products.reduce((sum, product) => sum + (product.stock * product.price), 0)
  const lowStockProducts = products.filter(p => p.stock < 10).length

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Barang (Inventory)</h1>
          <p className="text-muted-foreground mt-1">Kelola stok dan informasi produk</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md px-6 py-2 transition-all duration-200 hover:shadow-lg">
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
                  className="bg-input-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Input
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  placeholder="Kategori produk"
                  className="bg-input-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label>Stok Awal</Label>
                <Input
                  type="number"
                  value={newProduct.stock || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  className="bg-input-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label>Harga Pokok</Label>
                <Input
                  type="number"
                  value={newProduct.hargaPokok || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, hargaPokok: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  className="bg-input-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label>Harga Jual</Label>
                <Input
                  type="number"
                  value={newProduct.hargaJual || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, hargaJual: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  className="bg-input-background border-border"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-border">
                Batal
              </Button>
              <Button 
                onClick={handleAddProduct} 
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={!newProduct.name || !newProduct.category || !newProduct.hargaJual}
              >
                Simpan Barang
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-md border border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Produk</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              item dalam inventory
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md border border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Nilai Stok</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatRupiah(totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              nilai inventory
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md border border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Stok Rendah</CardTitle>
            <ShoppingCart className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lowStockProducts}</div>
            <p className="text-xs text-muted-foreground">
              produk perlu restok
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari produk..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-input-background border-border"
        />
      </div>

      {/* Products Table */}
      <Card className="shadow-md border border-border bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">Daftar Produk</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow className="border-border">
                    <TableHead className="text-card-foreground">Nama</TableHead>
                    <TableHead className="text-card-foreground">Kategori</TableHead>
                    <TableHead className="text-card-foreground">Stok</TableHead>
                    <TableHead className="text-card-foreground">Harga Pokok</TableHead>
                    <TableHead className="text-card-foreground">Harga Jual</TableHead>
                    <TableHead className="text-card-foreground">Nilai Stok</TableHead>
                    <TableHead className="text-card-foreground">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id} className="border-border hover:bg-muted/30">
                      <TableCell className="font-medium text-card-foreground">{product.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-primary/20">{product.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${product.stock < 10 ? 'text-red-600' : 'text-card-foreground'}`}>
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
                      <TableCell className="text-card-foreground">{formatRupiah(product.cost || 0)}</TableCell>
                      <TableCell className="font-medium text-card-foreground">{formatRupiah(product.price)}</TableCell>
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
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
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
                className="bg-input-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Input
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                placeholder="Kategori produk"
                className="bg-input-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Stok</Label>
              <Input
                type="number"
                value={newProduct.stock || ''}
                onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })}
                placeholder="0"
                className="bg-input-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Harga Pokok</Label>
              <Input
                type="number"
                value={newProduct.hargaPokok || ''}
                onChange={(e) => setNewProduct({ ...newProduct, hargaPokok: parseInt(e.target.value) || 0 })}
                placeholder="0"
                className="bg-input-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Harga Jual</Label>
              <Input
                type="number"
                value={newProduct.hargaJual || ''}
                onChange={(e) => setNewProduct({ ...newProduct, hargaJual: parseInt(e.target.value) || 0 })}
                placeholder="0"
                className="bg-input-background border-border"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-border">
              Batal
            </Button>
            <Button 
              onClick={handleEditProduct} 
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={!newProduct.name || !newProduct.category || !newProduct.hargaJual}
            >
              Update Barang
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-muted/30 rounded-xl p-8 border border-border">
            <p className="text-muted-foreground">
              {products.length === 0 ? 'Belum ada produk di inventory.' : 'Tidak ada produk yang sesuai dengan pencarian.'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}