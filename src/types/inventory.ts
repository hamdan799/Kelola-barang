export interface Product {
  id: string
  name: string
  category: string
  categoryId?: string
  subCategoryId?: string
  stock: number
  price: number
  cost?: number
  minStock?: number
  barcode?: string
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  description?: string
  subCategories?: SubCategory[]
  createdAt: Date
  updatedAt: Date
}

export interface SubCategory {
  id: string
  name: string
  description?: string
  parentCategoryId: string
  createdAt: Date
  updatedAt: Date
}

export interface StockLog {
  id: string
  productId: string
  productName: string
  jumlah: number
  type: 'masuk' | 'keluar'
  reference: string
  tanggal: Date
  createdAt: Date
}

export interface Receipt {
  id: string
  productId: string
  productName: string
  jumlah: number
  harga: number
  total: number
  tanggal: Date
}