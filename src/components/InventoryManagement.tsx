import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Plus, Search, Edit2, Trash2, Minus, PlusIcon, Printer } from 'lucide-react'
import type { Product, StockLog, Receipt } from '../types/inventory'

const mockProducts: Product[] = [
  { id: '1', nama: 'Smartphone Samsung Galaxy', kategori: 'Elektronik', harga: 5000000, stok: 25, createdAt: new Date() },
  { id: '2', nama: 'Laptop Asus VivoBook', kategori: 'Elektronik', harga: 8500000, stok: 15, createdAt: new Date() },
  { id: '3', nama: 'Headphone Sony WH-1000XM4', kategori: 'Elektronik', harga: 4500000, stok: 30, createdAt: new Date() },
  { id: '4', nama: 'Coffee Maker Philips', kategori: 'Rumah Tangga', harga: 1200000, stok: 12, createdAt: new Date() },
  { id: '5', nama: 'Air Fryer Xiaomi', kategori: 'Rumah Tangga', harga: 800000, stok: 8, createdAt: new Date() },
]

const categories = ['Elektronik', 'Rumah Tangga', 'Fashion', 'Buku', 'Olahraga', 'Kecantikan']

interface InventoryManagementProps {
  onStockLogAdded: (log: StockLog) => void
  onReceiptGenerated: (receipt: Receipt) => void
}

export function InventoryManagement({ onStockLogAdded, onReceiptGenerated }: InventoryManagementProps) {
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [printingProduct, setPrintingProduct] = useState<Product | null>(null)
  const [printQuantity, setPrintQuantity] = useState(1)
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    nama: '',
    kategori: '',
    harga: 0,
    stok: 0
  })

  const filteredProducts = products.filter(product =>
    product.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.kategori.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddProduct = () => {
    if (newProduct.nama && newProduct.kategori && newProduct.harga && newProduct.stok !== undefined) {
      const product: Product = {
        ...newProduct,
        id: Date.now().toString(),
        harga: newProduct.harga || 0,
        stok: newProduct.stok || 0,
        createdAt: new Date(),
      } as Product

      setProducts([...products, product])
      
      // Log stock entry
      const stockLog: StockLog = {
        id: Date.now().toString(),
        productId: product.id,
        productName: product.nama,
        jumlah: product.stok,
        type: 'masuk',
        reference: 'Tambah Barang Baru',
        tanggal: new Date()
      }
      onStockLogAdded(stockLog)

      setNewProduct({ nama: '', kategori: '', harga: 0, stok: 0 })
      setIsAddDialogOpen(false)
    }
  }

  const handleEditProduct = () => {
    if (editingProduct && editingProduct.nama && editingProduct.kategori) {
      const oldProduct = products.find(p => p.id === editingProduct.id)
      setProducts(products.map(p => 
        p.id === editingProduct.id ? editingProduct : p
      ))

      // Log stock changes if stock was modified
      if (oldProduct && oldProduct.stok !== editingProduct.stok) {
        const stockDiff = editingProduct.stok - oldProduct.stok
        const stockLog: StockLog = {
          id: Date.now().toString(),
          productId: editingProduct.id,
          productName: editingProduct.nama,
          jumlah: Math.abs(stockDiff),
          type: stockDiff > 0 ? 'masuk' : 'keluar',
          reference: 'Edit Produk',
          tanggal: new Date()
        }
        onStockLogAdded(stockLog)
      }

      setEditingProduct(null)
    }
  }

  const handleDeleteProduct = (id: string) => {
    const product = products.find(p => p.id === id)
    if (product && product.stok > 0) {
      // Log stock exit when deleting product with remaining stock
      const stockLog: StockLog = {
        id: Date.now().toString(),
        productId: product.id,
        productName: product.nama,
        jumlah: product.stok,
        type: 'keluar',
        reference: 'Hapus Produk',
        tanggal: new Date()
      }
      onStockLogAdded(stockLog)
    }
    setProducts(products.filter(product => product.id !== id))
  }

  const handleStockChange = (id: string, change: number) => {
    const product = products.find(p => p.id === id)
    if (!product) return

    const newStock = Math.max(0, product.stok + change)
    setProducts(products.map(product => 
      product.id === id 
        ? { ...product, stok: newStock }
        : product
    ))

    // Log stock change
    if (change !== 0) {
      const stockLog: StockLog = {
        id: Date.now().toString(),
        productId: id,
        productName: product.nama,
        jumlah: Math.abs(change),
        type: change > 0 ? 'masuk' : 'keluar',
        reference: change > 0 ? 'Tambah Stok Manual' : 'Kurangi Stok Manual',
        tanggal: new Date()
      }
      onStockLogAdded(stockLog)
    }
  }

  const handlePrintReceipt = () => {
    if (printingProduct && printQuantity > 0 && printQuantity <= printingProduct.stok) {
      // Generate receipt
      const receipt: Receipt = {
        id: Date.now().toString(),
        productId: printingProduct.id,
        productName: printingProduct.nama,
        jumlah: printQuantity,
        harga: printingProduct.harga,
        total: printingProduct.harga * printQuantity,
        tanggal: new Date()
      }
      onReceiptGenerated(receipt)

      // Update stock
      setProducts(products.map(product => 
        product.id === printingProduct.id 
          ? { ...product, stok: product.stok - printQuantity }
          : product
      ))

      // Log stock exit
      const stockLog: StockLog = {
        id: Date.now().toString(),
        productId: printingProduct.id,
        productName: printingProduct.nama,
        jumlah: printQuantity,
        type: 'keluar',
        reference: `Cetak Struk #${receipt.id}`,
        tanggal: new Date()
      }
      onStockLogAdded(stockLog)

      setPrintingProduct(null)
      setPrintQuantity(1)
    }
  }

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStockStatus = (stock: number) => {
    if (stock > 20) return { color: 'bg-green-100 text-green-800', label: 'Stok Aman' }
    if (stock > 5) return { color: 'bg-yellow-100 text-yellow-800', label: 'Stok Menipis' }
    return { color: 'bg-red-100 text-red-800', label: 'Stok Habis' }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Manajemen Barang</h1>
          <p className="text-gray-600 mt-1">Kelola inventori dan tingkat stok barang Anda</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Barang
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah Barang Baru</DialogTitle>
              <DialogDescription>
                Isi detail barang untuk menambahkannya ke inventori.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="product-name">Nama Barang</Label>
                <Input
                  id="product-name"
                  value={newProduct.nama || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, nama: e.target.value })}
                  placeholder="Masukkan nama barang"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Kategori</Label>
                <Select
                  value={newProduct.kategori || ''}
                  onValueChange={(value) => setNewProduct({ ...newProduct, kategori: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Harga</Label>
                <Input
                  id="price"
                  type="number"
                  value={newProduct.harga || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, harga: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Jumlah Stok</Label>
                <Input
                  id="stock"
                  type="number"
                  value={newProduct.stok || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, stok: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleAddProduct} className="bg-blue-600 hover:bg-blue-700">
                Simpan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cari barang..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-4 text-sm text-gray-600">
          <span>Total Barang: <span className="font-medium text-gray-900">{products.length}</span></span>
          <span>Stok Menipis: <span className="font-medium text-yellow-600">{products.filter(p => p.stok <= 5 && p.stok > 0).length}</span></span>
          <span>Stok Habis: <span className="font-medium text-red-600">{products.filter(p => p.stok === 0).length}</span></span>
        </div>
      </div>

      {/* Product Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Barang</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Barang</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Stok</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi Stok</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stok)
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.nama}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                          {product.kategori}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{formatRupiah(product.harga)}</TableCell>
                      <TableCell>
                        <span className="font-medium text-lg">{product.stok}</span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${stockStatus.color}`}>
                          {stockStatus.label}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStockChange(product.id, -1)}
                            disabled={product.stok <= 0}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStockChange(product.id, 1)}
                            className="h-8 w-8 p-0"
                          >
                            <PlusIcon className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog open={printingProduct?.id === product.id} onOpenChange={(open) => {
                            if (!open) setPrintingProduct(null)
                            else setPrintingProduct(product)
                          }}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" disabled={product.stok === 0}>
                                <Printer className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>Cetak Struk</DialogTitle>
                                <DialogDescription>
                                  Masukkan jumlah yang akan dijual.
                                </DialogDescription>
                              </DialogHeader>
                              {printingProduct && (
                                <div className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <Label>Barang: {printingProduct.nama}</Label>
                                    <Label>Stok Tersedia: {printingProduct.stok}</Label>
                                    <Label>Harga: {formatRupiah(printingProduct.harga)}</Label>
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="print-quantity">Jumlah</Label>
                                    <Input
                                      id="print-quantity"
                                      type="number"
                                      min="1"
                                      max={printingProduct.stok}
                                      value={printQuantity}
                                      onChange={(e) => setPrintQuantity(parseInt(e.target.value) || 1)}
                                    />
                                  </div>
                                  <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="font-medium">Total: {formatRupiah(printingProduct.harga * printQuantity)}</p>
                                  </div>
                                </div>
                              )}
                              <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setPrintingProduct(null)}>
                                  Batal
                                </Button>
                                <Button onClick={handlePrintReceipt} className="bg-green-600 hover:bg-green-700">
                                  Cetak Struk
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Dialog open={editingProduct?.id === product.id} onOpenChange={(open) => {
                            if (!open) setEditingProduct(null)
                            else setEditingProduct(product)
                          }}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>Edit Barang</DialogTitle>
                                <DialogDescription>
                                  Perbarui informasi barang.
                                </DialogDescription>
                              </DialogHeader>
                              {editingProduct && (
                                <div className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-name">Nama Barang</Label>
                                    <Input
                                      id="edit-name"
                                      value={editingProduct.nama}
                                      onChange={(e) => setEditingProduct({ ...editingProduct, nama: e.target.value })}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-category">Kategori</Label>
                                    <Select
                                      value={editingProduct.kategori}
                                      onValueChange={(value) => setEditingProduct({ ...editingProduct, kategori: value })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {categories.map((category) => (
                                          <SelectItem key={category} value={category}>
                                            {category}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-price">Harga</Label>
                                    <Input
                                      id="edit-price"
                                      type="number"
                                      value={editingProduct.harga}
                                      onChange={(e) => setEditingProduct({ ...editingProduct, harga: parseInt(e.target.value) || 0 })}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-stock">Jumlah Stok</Label>
                                    <Input
                                      id="edit-stock"
                                      type="number"
                                      value={editingProduct.stok}
                                      onChange={(e) => setEditingProduct({ ...editingProduct, stok: parseInt(e.target.value) || 0 })}
                                    />
                                  </div>
                                </div>
                              )}
                              <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setEditingProduct(null)}>
                                  Batal
                                </Button>
                                <Button onClick={handleEditProduct} className="bg-blue-600 hover:bg-blue-700">
                                  Simpan Perubahan
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-lg p-8">
            <p className="text-gray-500">Tidak ada barang yang ditemukan.</p>
          </div>
        </div>
      )}
    </div>
  )
}