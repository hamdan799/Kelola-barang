import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { X, Delete } from 'lucide-react'

interface CalculatorProps {
  initialValue?: number
  onValueChange: (value: number) => void
  onClose: () => void
  isOpen: boolean
}

export function Calculator({ initialValue = 0, onValueChange, onClose, isOpen }: CalculatorProps) {
  const [display, setDisplay] = useState(initialValue.toString())
  const [operator, setOperator] = useState<string | null>(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)
  const [previousValue, setPreviousValue] = useState<number | null>(null)

  if (!isOpen) return null

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num)
      setWaitingForOperand(false)
    } else {
      setDisplay(display === '0' ? num : display + num)
    }
  }

  const inputOperator = (nextOperator: string) => {
    const inputValue = parseFloat(display)

    if (previousValue === null) {
      setPreviousValue(inputValue)
    } else if (operator) {
      const currentValue = previousValue || 0
      const newValue = performCalculation[operator](currentValue, inputValue)

      setDisplay(String(newValue))
      setPreviousValue(newValue)
    }

    setWaitingForOperand(true)
    setOperator(nextOperator)
  }

  const performCalculation = {
    '+': (firstOperand: number, secondOperand: number) => firstOperand + secondOperand,
    '-': (firstOperand: number, secondOperand: number) => firstOperand - secondOperand,
    '*': (firstOperand: number, secondOperand: number) => firstOperand * secondOperand,
    '/': (firstOperand: number, secondOperand: number) => firstOperand / secondOperand,
    '=': (firstOperand: number, secondOperand: number) => secondOperand
  }

  const calculate = () => {
    const inputValue = parseFloat(display)

    if (previousValue !== null && operator) {
      const newValue = performCalculation[operator](previousValue, inputValue)
      setDisplay(String(newValue))
      setPreviousValue(null)
      setOperator(null)
      setWaitingForOperand(true)
    }
  }

  const clear = () => {
    setDisplay('0')
    setPreviousValue(null)
    setOperator(null)
    setWaitingForOperand(false)
  }

  const deleteLast = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1))
    } else {
      setDisplay('0')
    }
  }

  const finish = () => {
    const finalValue = parseFloat(display)
    onValueChange(finalValue)
    onClose()
  }

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <Card className="w-80 shadow-2xl">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Kalkulator</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Display */}
          <div className="bg-muted p-4 rounded-lg border">
            <div className="text-right">
              <div className="text-2xl font-mono font-bold">{display}</div>
              <div className="text-sm text-muted-foreground">
                {formatRupiah(parseFloat(display) || 0)}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {/* Row 1 */}
            <Button variant="outline" onClick={clear} className="h-12">
              C
            </Button>
            <Button variant="outline" onClick={deleteLast} className="h-12">
              <Delete className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => inputOperator('/')} className="h-12">
              ÷
            </Button>
            <Button variant="outline" onClick={() => inputOperator('*')} className="h-12">
              ×
            </Button>

            {/* Row 2 */}
            <Button variant="outline" onClick={() => inputNumber('7')} className="h-12">
              7
            </Button>
            <Button variant="outline" onClick={() => inputNumber('8')} className="h-12">
              8
            </Button>
            <Button variant="outline" onClick={() => inputNumber('9')} className="h-12">
              9
            </Button>
            <Button variant="outline" onClick={() => inputOperator('-')} className="h-12">
              -
            </Button>

            {/* Row 3 */}
            <Button variant="outline" onClick={() => inputNumber('4')} className="h-12">
              4
            </Button>
            <Button variant="outline" onClick={() => inputNumber('5')} className="h-12">
              5
            </Button>
            <Button variant="outline" onClick={() => inputNumber('6')} className="h-12">
              6
            </Button>
            <Button variant="outline" onClick={() => inputOperator('+')} className="h-12">
              +
            </Button>

            {/* Row 4 */}
            <Button variant="outline" onClick={() => inputNumber('1')} className="h-12">
              1
            </Button>
            <Button variant="outline" onClick={() => inputNumber('2')} className="h-12">
              2
            </Button>
            <Button variant="outline" onClick={() => inputNumber('3')} className="h-12">
              3
            </Button>
            <Button variant="outline" onClick={calculate} className="h-12 row-span-2">
              =
            </Button>

            {/* Row 5 */}
            <Button variant="outline" onClick={() => inputNumber('0')} className="h-12 col-span-2">
              0
            </Button>
            <Button variant="outline" onClick={() => inputNumber('.')} className="h-12">
              .
            </Button>
          </div>

          {/* Finish Button */}
          <Button 
            onClick={finish}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Selesai
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}