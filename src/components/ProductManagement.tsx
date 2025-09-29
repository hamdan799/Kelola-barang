import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Plus, Search, Edit2, Trash2, Minus, PlusIcon } from 'lucide-react'

interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
}

const mockProducts: Product[] = [
  { id: '1', name: 'Smartphone Samsung Galaxy', category: 'Electronics', price: 5000000, stock: 25 },
  { id: '2', name: 'Laptop Asus VivoBook', category: 'Electronics', price: 8500000, stock: 15 },
  { id: '3', name: 'Headphone Sony WH-1000XM4', category: 'Electronics', price: 4500000, stock: 30 },
  { id: '4', name: 'Coffee Maker Philips', category: 'Home Appliances', price: 1200000, stock: 12 },
  { id: '5', name: 'Air Fryer Xiaomi', category: 'Home Appliances', price: 800000, stock: 8 },
]

const categories = ['Electronics', 'Home Appliances', 'Fashion', 'Books', 'Sports', 'Beauty']

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    category: '',
    price: 0,
    stock: 0
  })

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddProduct = () => {
    if (newProduct.name && newProduct.category && newProduct.price && newProduct.stock !== undefined) {
      const product: Product = {
        ...newProduct,
        id: Date.now().toString(),
        price: newProduct.price || 0,
        stock: newProduct.stock || 0,
      } as Product

      setProducts([...products, product])
      setNewProduct({ name: '', category: '', price: 0, stock: 0 })
      setIsAddDialogOpen(false)
    }
  }

  const handleEditProduct = () => {
    if (editingProduct && editingProduct.name && editingProduct.category) {
      setProducts(products.map(p => 
        p.id === editingProduct.id ? editingProduct : p
      ))
      setEditingProduct(null)
    }
  }

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(product => product.id !== id))
  }

  const handleStockChange = (id: string, change: number) => {
    setProducts(products.map(product => 
      product.id === id 
        ? { ...product, stock: Math.max(0, product.stock + change) }
        : product
    ))
  }

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStockStatus = (stock: number) => {
    if (stock > 20) return { color: 'bg-green-100 text-green-800', label: 'In Stock' }
    if (stock > 5) return { color: 'bg-yellow-100 text-yellow-800', label: 'Low Stock' }
    return { color: 'bg-red-100 text-red-800', label: 'Out of Stock' }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Product Management</h1>
          <p className="text-gray-600 mt-1">Manage your product inventory and stock levels</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Fill in the product details to add it to your inventory.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="product-name">Product Name</Label>
                <Input
                  id="product-name"
                  value={newProduct.name || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="Enter product name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newProduct.category || ''}
                  onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
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
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  value={newProduct.price || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, price: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input
                  id="stock"
                  type="number"
                  value={newProduct.stock || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddProduct} className="bg-blue-600 hover:bg-blue-700">
                Save Product
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
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-4 text-sm text-gray-600">
          <span>Total Products: <span className="font-medium text-gray-900">{products.length}</span></span>
          <span>Low Stock: <span className="font-medium text-yellow-600">{products.filter(p => p.stock <= 5 && p.stock > 0).length}</span></span>
          <span>Out of Stock: <span className="font-medium text-red-600">{products.filter(p => p.stock === 0).length}</span></span>
        </div>
      </div>

      {/* Product Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Stock Actions</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock)
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                          {product.category}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{formatRupiah(product.price)}</TableCell>
                      <TableCell>
                        <span className="font-medium text-lg">{product.stock}</span>
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
                            disabled={product.stock <= 0}
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
                                <DialogTitle>Edit Product</DialogTitle>
                                <DialogDescription>
                                  Update the product information.
                                </DialogDescription>
                              </DialogHeader>
                              {editingProduct && (
                                <div className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-name">Product Name</Label>
                                    <Input
                                      id="edit-name"
                                      value={editingProduct.name}
                                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-category">Category</Label>
                                    <Select
                                      value={editingProduct.category}
                                      onValueChange={(value) => setEditingProduct({ ...editingProduct, category: value })}
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
                                    <Label htmlFor="edit-price">Price</Label>
                                    <Input
                                      id="edit-price"
                                      type="number"
                                      value={editingProduct.price}
                                      onChange={(e) => setEditingProduct({ ...editingProduct, price: parseInt(e.target.value) || 0 })}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-stock">Stock Quantity</Label>
                                    <Input
                                      id="edit-stock"
                                      type="number"
                                      value={editingProduct.stock}
                                      onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })}
                                    />
                                  </div>
                                </div>
                              )}
                              <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setEditingProduct(null)}>
                                  Cancel
                                </Button>
                                <Button onClick={handleEditProduct} className="bg-blue-600 hover:bg-blue-700">
                                  Save Changes
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
            <p className="text-gray-500">No products found matching your search.</p>
          </div>
        </div>
      )}
    </div>
  )
}