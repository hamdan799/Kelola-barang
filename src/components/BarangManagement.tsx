import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Label } from './ui/label'
import { Plus, Search, Edit2, Trash2 } from 'lucide-react'

interface Barang {
  id: string
  kode: string
  nama: string
  kategori: string
  stok: number
  hargaBeli: number
  hargaJual: number
  supplier: string
}

const mockBarang: Barang[] = [
  { id: '1', kode: 'SPR001', nama: 'Busi Honda', kategori: 'Sparepart', stok: 50, hargaBeli: 25000, hargaJual: 35000, supplier: 'PT Honda' },
  { id: '2', kode: 'SPR002', nama: 'Filter Oli Yamaha', kategori: 'Sparepart', stok: 30, hargaBeli: 45000, hargaJual: 65000, supplier: 'PT Yamaha' },
  { id: '3', kode: 'SPR003', nama: 'Ban Motor', kategori: 'Aksesoris', stok: 20, hargaBeli: 150000, hargaJual: 200000, supplier: 'PT Bridgestone' },
  { id: '4', kode: 'SPR004', nama: 'Rantai Motor', kategori: 'Sparepart', stok: 15, hargaBeli: 75000, hargaJual: 110000, supplier: 'PT DID' },
]

export function BarangManagement() {
  const [barang, setBarang] = useState<Barang[]>(mockBarang)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newBarang, setNewBarang] = useState<Partial<Barang>>({
    kode: '',
    nama: '',
    kategori: '',
    stok: 0,
    hargaBeli: 0,
    hargaJual: 0,
    supplier: ''
  })

  const filteredBarang = barang.filter(item =>
    item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.kode.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddBarang = () => {
    if (newBarang.nama && newBarang.kode) {
      const barangBaru: Barang = {
        ...newBarang,
        id: Date.now().toString(),
        stok: newBarang.stok || 0,
        hargaBeli: newBarang.hargaBeli || 0,
        hargaJual: newBarang.hargaJual || 0,
      } as Barang

      setBarang([...barang, barangBaru])
      setNewBarang({
        kode: '',
        nama: '',
        kategori: '',
        stok: 0,
        hargaBeli: 0,
        hargaJual: 0,
        supplier: ''
      })
      setIsAddDialogOpen(false)
    }
  }

  const handleDeleteBarang = (id: string) => {
    setBarang(barang.filter(item => item.id !== id))
  }

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Manajemen Barang</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Barang
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Barang Baru</DialogTitle>
              <DialogDescription>
                Isi form berikut untuk menambahkan barang baru ke dalam sistem inventori.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="kode" className="text-right">Kode</Label>
                <Input
                  id="kode"
                  value={newBarang.kode || ''}
                  onChange={(e) => setNewBarang({ ...newBarang, kode: e.target.value })}
                  className="col-span-3"
                  placeholder="SPR001"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nama" className="text-right">Nama</Label>
                <Input
                  id="nama"
                  value={newBarang.nama || ''}
                  onChange={(e) => setNewBarang({ ...newBarang, nama: e.target.value })}
                  className="col-span-3"
                  placeholder="Nama barang"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="kategori" className="text-right">Kategori</Label>
                <Input
                  id="kategori"
                  value={newBarang.kategori || ''}
                  onChange={(e) => setNewBarang({ ...newBarang, kategori: e.target.value })}
                  className="col-span-3"
                  placeholder="Sparepart"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stok" className="text-right">Stok</Label>
                <Input
                  id="stok"
                  type="number"
                  value={newBarang.stok || 0}
                  onChange={(e) => setNewBarang({ ...newBarang, stok: parseInt(e.target.value) || 0 })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="hargaBeli" className="text-right">Harga Beli</Label>
                <Input
                  id="hargaBeli"
                  type="number"
                  value={newBarang.hargaBeli || 0}
                  onChange={(e) => setNewBarang({ ...newBarang, hargaBeli: parseInt(e.target.value) || 0 })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="hargaJual" className="text-right">Harga Jual</Label>
                <Input
                  id="hargaJual"
                  type="number"
                  value={newBarang.hargaJual || 0}
                  onChange={(e) => setNewBarang({ ...newBarang, hargaJual: parseInt(e.target.value) || 0 })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="supplier" className="text-right">Supplier</Label>
                <Input
                  id="supplier"
                  value={newBarang.supplier || ''}
                  onChange={(e) => setNewBarang({ ...newBarang, supplier: e.target.value })}
                  className="col-span-3"
                  placeholder="PT Supplier"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleAddBarang}>
                Simpan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari barang..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Nama Barang</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Stok</TableHead>
                <TableHead>Harga Beli</TableHead>
                <TableHead>Harga Jual</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBarang.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono">{item.kode}</TableCell>
                  <TableCell>{item.nama}</TableCell>
                  <TableCell>{item.kategori}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.stok > 20 ? 'bg-green-100 text-green-800' : 
                      item.stok > 10 ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {item.stok}
                    </span>
                  </TableCell>
                  <TableCell>{formatRupiah(item.hargaBeli)}</TableCell>
                  <TableCell>{formatRupiah(item.hargaJual)}</TableCell>
                  <TableCell>{item.supplier}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteBarang(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}