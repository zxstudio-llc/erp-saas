"use client"

import { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ListOrdered } from "lucide-react"

export function DataTablePagination<TData>({ table }: { table: Table<TData> }) {
    const total = table.getPrePaginationRowModel().rows.length
    const pageCount = table.getPageCount()
    const currentPage = table.getState().pagination.pageIndex + 1

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Texto Explícito */}
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <ListOrdered className="w-4 h-4 text-primary/60" />
                <span>
                    {total === 0 
                        ? "No hay registros para mostrar" 
                        : `Hay ${total} ${total === 1 ? 'registro cargado' : 'registros cargados'} en total`}
                </span>
            </div>

            <div className="flex items-center gap-6">
                <span className="text-xs font-semibold text-muted-foreground tracking-tighter">
                    Página {currentPage} de {pageCount}
                </span>
                
                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}