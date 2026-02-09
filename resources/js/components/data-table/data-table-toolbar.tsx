"use client"

import * as React from "react"
import { Table } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface Props<TData> {
    table: Table<TData>
    filterColumn?: string 
    placeholder?: string
}

export function DataTableToolbar<TData>({ 
    table, 
    filterColumn = "name",
    placeholder = "Filtrar..." 
}: Props<TData>) {
    
    const column = table.getColumn(filterColumn)
    
    const isFiltered = table.getState().columnFilters.length > 0
    
    const [inputValue, setInputValue] = React.useState((column?.getFilterValue() as string) ?? "")
    
    React.useEffect(() => {
        const tableValue = (column?.getFilterValue() as string) ?? ""
        if (tableValue !== inputValue) {
            setInputValue(tableValue)
        }
    }, [column?.getFilterValue()])

    if (!column) return null

    const handleClear = () => {
        setInputValue("")
        table.resetColumnFilters()
    }

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 flex-1">
                <Input
                    placeholder={placeholder}
                    value={inputValue}
                    onChange={(e) => {
                        const val = e.target.value
                        setInputValue(val)
                        column.setFilterValue(val)
                    }}
                    className="max-w-sm h-9"
                />
                
                {/* 4. Condición mejorada: se muestra si hay texto o si la tabla reporta filtros */}
                {(inputValue !== "" || isFiltered) && (
                    <Button
                        variant="ghost"
                        onClick={handleClear}
                        className="h-9 px-2 lg:px-3 text-muted-foreground hover:text-foreground"
                    >
                        Limpiar
                        <X className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    )
}