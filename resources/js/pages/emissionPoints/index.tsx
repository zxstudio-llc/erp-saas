"use client"

import React, { useState } from "react"
import { Head, router } from "@inertiajs/react"
import AppLayout from "@/layouts/app-layout"
import { DataTable } from "@/components/data-table/data-table"
import { Button } from "@/components/ui/button"
import { Plus, LayoutGrid, AlertTriangle, Terminal, Hash, MonitorSmartphone } from "lucide-react"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle
} from "@/components/ui/sheet"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import useTenant from "@/hooks/use-tenant"
import tenant from "@/routes/tenant"
import { toast } from "sonner"
import { EmissionPointForm } from "./emission-point-form"
import { EmissionPoint, emissionPointColumns } from "@/components/data-table/emission-point-columns"

interface Props {
    emissionPoints: {
        data: EmissionPoint[]
    }
}

export default function EmissionPointsIndex({ emissionPoints }: Props) {
    const t = useTenant.required()
    const [processingId, setProcessingId] = useState<number | null>(null)
    const [isAlertOpen, setIsAlertOpen] = useState(false)
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [selectedPoint, setSelectedPoint] = useState<EmissionPoint | null>(null)

    const handleEdit = (ep: EmissionPoint) => {
        setSelectedPoint(ep)
        setIsSheetOpen(true)
    }

    const handleCreate = () => {
        setSelectedPoint(null)
        setIsSheetOpen(true)
    }

    const handleToggleClick = (ep: EmissionPoint) => {
        setSelectedPoint(ep)
        setIsAlertOpen(true)
    }

    const confirmToggle = () => {
        if (!selectedPoint) return

        setProcessingId(selectedPoint.id)
        const newStatus = !selectedPoint.active ? 'activado' : 'desactivado'

        router.post(tenant.emissionPoints.toggle({
            tenant: t.slug,
            emissionPoint: selectedPoint.id
        }).url, {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Estado del terminal actualizado`, {
                    description: `El punto ${selectedPoint.code} ahora está ${newStatus}.`,
                })
            },
            onFinish: () => {
                setProcessingId(null)
                setIsAlertOpen(false)
                setSelectedPoint(null)
            }
        })
    }

    return (
        <AppLayout>
            <Head title="Puntos de Emisión" />

            <div className="p-4 md:p-8 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black flex items-center gap-2">
                            <MonitorSmartphone className="w-6 h-6 text-primary" /> Puntos de Emisión
                        </h1>
                        <p className="text-muted-foreground">Terminales autorizados para facturación electrónica y entrega inmediata.</p>
                    </div>

                    <Button onClick={handleCreate} className="gap-2 shadow-lg hover:shadow-primary/20 transition-all">
                        <Plus className="w-4 h-4" /> Nuevo Punto de Emisión
                    </Button>
                </div>

                <div className={`transition-opacity duration-300 ${processingId ? "opacity-60 pointer-events-none" : ""}`}>
                    <DataTable
                        columns={emissionPointColumns(handleEdit, handleToggleClick, (ep) => console.log('Delete', ep), processingId)}
                        data={emissionPoints.data}
                        filterColumn="name"
                        placeholder="Buscar punto de emisión..."
                    />
                </div>
            </div>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="sm:max-w-md overflow-y-auto border-l shadow-2xl p-0">
                    <SheetHeader className="mb-6 border-b pb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <MonitorSmartphone className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <SheetTitle className="text-xl font-bold">
                                    {selectedPoint ? `Editar Punto ${selectedPoint.code}` : "Nuevo Terminal"}
                                </SheetTitle>
                                <SheetDescription className="text-xs">
                                    Configure los parámetros de emisión SRI.
                                </SheetDescription>
                            </div>
                        </div>
                    </SheetHeader>
                    <div className="px-4">
                        <EmissionPointForm
                            tenantSlug={t.slug}
                            initialData={selectedPoint}
                            onSuccess={() => setIsSheetOpen(false)}
                        />
                    </div>
                </SheetContent>
            </Sheet>

            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent className="rounded-2xl w-auto flex flex-col items-center!">
                    <AlertDialogHeader className="flex flex-col items-center! justify-center">
                        <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center mb-4">
                            <AlertTriangle className="w-6 h-6 text-amber-500" />
                        </div>

                        <AlertDialogTitle>
                            ¿Cambiar estado?
                        </AlertDialogTitle>

                        <AlertDialogDescription className="text-center">
                            El punto de emisión <strong>{selectedPoint?.code}</strong> se marcará como {selectedPoint?.active ? 'inactivo' : 'activo'}. Esto afectará la facturación en tiempo real.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter className="flex flex-row gap-3 mt-6 sm:justify-center">
                        <AlertDialogCancel
                            onClick={() => setSelectedPoint(null)}
                        >
                            Cancelar
                        </AlertDialogCancel>

                        <AlertDialogAction
                            onClick={confirmToggle}
                            variant="destructive"
                        >
                            Confirmar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    )
}