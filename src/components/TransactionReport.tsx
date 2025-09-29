import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Avatar, AvatarFallback } from './ui/avatar'

interface Transaction {
  id: string
  tanggal: string
  admin: string
  penjualan: number
  pembelian: number
  pengeluaran: number
  profit: number
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    tanggal: '2024-01-15',
    admin: 'Adrian',
    penjualan: 850000,
    pembelian: 400000,
    pengeluaran: 150000,
    profit: 300000
  },
  {
    id: '2',
    tanggal: '2024-01-14',
    admin: 'Sarah',
    penjualan: 750000,
    pembelian: 350000,
    pengeluaran: 100000,
    profit: 300000
  },
  {
    id: '3',
    tanggal: '2024-01-13',
    admin: 'Budi',
    penjualan: 920000,
    pembelian: 450000,
    pengeluaran: 120000,
    profit: 350000
  },
  {
    id: '4',
    tanggal: '2024-01-12',
    admin: 'Siti',
    penjualan: 680000,
    pembelian: 300000,
    pengeluaran: 80000,
    profit: 300000
  },
  {
    id: '5',
    tanggal: '2024-01-11',
    admin: 'Andi',
    penjualan: 1100000,
    pembelian: 550000,
    pengeluaran: 200000,
    profit: 350000
  }
]

export function TransactionReport() {
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Laporan Transaksi</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Laporan Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Penjualan</TableHead>
                <TableHead>Pembelian</TableHead>
                <TableHead>Pengeluaran</TableHead>
                <TableHead>Profit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{formatDate(transaction.tanggal)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {transaction.admin.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{transaction.admin}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-green-600 font-medium">
                    {formatRupiah(transaction.penjualan)}
                  </TableCell>
                  <TableCell className="text-purple-600 font-medium">
                    {formatRupiah(transaction.pembelian)}
                  </TableCell>
                  <TableCell className="text-orange-600 font-medium">
                    {formatRupiah(transaction.pengeluaran)}
                  </TableCell>
                  <TableCell className="text-green-700 font-medium">
                    {formatRupiah(transaction.profit)}
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