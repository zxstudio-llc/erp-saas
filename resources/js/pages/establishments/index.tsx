"use client"

import React, { useState } from "react"
import { Head, router } from "@inertiajs/react"
import AppLayout from "@/layouts/app-layout"
import { DataTable } from "@/components/data-table/data-table"
import { Button } from "@/components/ui/button"
import { Plus, Store, AlertTriangle } from "lucide-react"
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
    AlertDialogMedia,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import useTenant from "@/hooks/use-tenant"
import tenant from "@/routes/tenant"
import { Establishment, establishmentColumns } from "@/components/data-table/establishment-columns"
import { EstablishmentForm } from "./establishments-form"
import { toast } from "sonner"

interface Props {
    establishments: {
        data: Establishment[]
    }
}

export default function EstablishmentsIndex({ establishments }: Props) {
    const t = useTenant.required()
    const [isAlertOpen, setIsAlertOpen] = useState(false)
    
    // ID para el estado de carga por fila
    const [processingId, setProcessingId] = useState<number | null>(null)
    
    // Cambiamos el estado para manejar el objeto completo en el Sheet
    const [editingEstablishment, setEditingEstablishment] = useState<Establishment | null>(null)
    const [isSheetOpen, setIsSheetOpen] = useState(false)

    const handleEdit = (est: Establishment) => {
        setEditingEstablishment(est)
        setIsSheetOpen(true)
    }

    const handleCreate = () => {
        setEditingEstablishment(null)
        setIsSheetOpen(true)
    }

    const handleToggleClick = (est: Establishment) => {
        setEditingEstablishment(est)
        setIsAlertOpen(true)
    }

    const confirmToggle = () => {
        if (!editingEstablishment) return
        
        setProcessingId(editingEstablishment.id)
        const newStatus = !editingEstablishment.active ? 'activado' : 'desactivado'
        
        router.post(tenant.establishments.toggle({ 
            tenant: t.slug, 
            establishment: editingEstablishment.id 
        }).url, {}, {
            preserveScroll: true,
            only: ['establishments'], 
            onSuccess: () => {
                toast.success(`Estado actualizado`, {
                    description: `El establecimiento ${editingEstablishment.name} ha sido ${newStatus}.`,
                })
            },
            onError: () => {
                toast.error("Error", {
                    description: "No se pudo cambiar el estado del establecimiento.",
                })
            },
            onFinish: () => {
                setProcessingId(null)
                setIsAlertOpen(false)
                setEditingEstablishment(null)
            }
        })
    }

    return (
        <AppLayout>
            <Head title="Establecimientos" />
            
            <div className="p-4 md:p-8 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black flex items-center gap-2">
                            <Store className="w-6 h-6 text-primary" /> Establecimientos del SRI
                        </h1>
                        <p className="text-muted-foreground">Gestiona tus sucursales y puntos de emisión para entrega inmediata.</p>
                    </div>
                    
                    <Button onClick={handleCreate} className="gap-2 shadow-lg hover:shadow-primary/20 transition-all">
                        <Plus className="w-4 h-4" /> Nuevo Establecimiento
                    </Button>
                </div>

                <div className={processingId ? "pointer-events-none opacity-80" : ""}>
                    <DataTable 
                        columns={establishmentColumns(handleEdit, handleToggleClick, processingId)} 
                        data={establishments.data} 
                        filterColumn="name" 
                        placeholder="Buscar sucursal..."
                    />
                </div>
            </div>

            {/* REEMPLAZO: SHEET LATERAL (Cajón lateral Pro) */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="sm:max-w-md overflow-y-auto border-l shadow-2xl">
                    <SheetHeader className="mb-6 border-b pb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Store className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <SheetTitle className="text-xl font-bold">
                                    {editingEstablishment ? `Editar Sucursal ${editingEstablishment.code}` : "Nueva Sucursal"}
                                </SheetTitle>
                                <SheetDescription className="text-xs">
                                    Completa los campos para configurar este punto de venta.
                                </SheetDescription>
                            </div>
                        </div>
                    </SheetHeader>
                    <div className="px-4">
                        <EstablishmentForm 
                            tenantSlug={t.slug}
                            companyId={establishments.data[0]?.company_id}
                            initialData={editingEstablishment}
                            onSuccess={() => setIsSheetOpen(false)}
                        />
                    </div>
                </SheetContent>
            </Sheet>

            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogContent className="rounded-2xl w-auto flex flex-col items-center!">
                    <AlertDialogHeader className="flex flex-col items-center! justify-center">
                        <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                            <AlertTriangle />
                        </AlertDialogMedia>
                        <AlertDialogTitle>¿Confirmar cambio de estado?</AlertDialogTitle>
                        <AlertDialogDescription className="text-center">
                            Estás a punto de {editingEstablishment?.active ? 'desactivar' : 'activar'} el establecimiento <strong>{editingEstablishment?.name}</strong>. 
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4">
                        <AlertDialogCancel onClick={() => setEditingEstablishment(null)} className="rounded-full">Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={confirmToggle}
                            variant="destructive"
                        >
                            Sí, {editingEstablishment?.active ? 'Desactivar' : 'Activar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    )
}