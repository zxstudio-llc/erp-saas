import React, { useState } from "react"
import { Head, router, usePage } from "@inertiajs/react"
import AppLayout from "@/layouts/app-layout"
import { DataTable } from "@/components/data-table/data-table"
import { Button } from "@/components/ui/button"
import { Plus, AlertTriangle, Users, User, Trash2, Trash2Icon } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
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
import { Customer, customerColumns } from "@/components/data-table/customer-columns"
import { CustomerForm } from "./customer-form"
import customersRoutes from "@/routes/tenant/customers"
import { toast } from "sonner"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { TableSkeleton } from "@/components/app/table-skeleton"

interface Props {
    customers: {
        data: Customer[]
    }
    filters: any
}

export default function CustomersIndex({ customers, filters }: Props) {
    const t = useTenant.required()
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [isAlertOpen, setIsAlertOpen] = useState(false)
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)

    const [processingId, setProcessingId] = useState<number | null>(null)
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
    const [isTrashed, setIsTrashed] = useState(filters.trashed === "true")
    const { component } = usePage();
    const [isLoading, setIsLoading] = useState(false);

    const handleEdit = (customer: Customer) => {
        setSelectedCustomer(customer)
        setIsSheetOpen(true)
    }

    const handleCreate = () => {
        setSelectedCustomer(null)
        setIsSheetOpen(true)
    }

    const handleDeleteClick = (customer: Customer) => {
        setSelectedCustomer(customer)
        setIsDeleteAlertOpen(true)
    }

    const handleToggleClick = (customer: Customer) => {
        setSelectedCustomer(customer)
        setIsAlertOpen(true)
    }

    const handleRestore = (customer: Customer) => {
        const url = customersRoutes.restore({
            tenant: t.slug,
            id: customer.id
        }).url

        router.post(url, {}, {
            onSuccess: () => {
                toast.success("Cliente restaurado", {
                    description: `${customer.business_name} ha vuelto a la lista activa.`
                })
            }
        })
    }

    const confirmToggle = () => {
        if (!selectedCustomer) return
        setProcessingId(selectedCustomer.id)

        const url = customersRoutes.toggle({
            tenant: t.slug,
            customer: selectedCustomer.id
        }).url

        router.post(url, {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Estado actualizado", {
                    description: `El cliente ${selectedCustomer.business_name} ha cambiado su estado.`
                })
            },
            onError: () => {
                toast.error("Error al actualizar", {
                    description: "No se pudo cambiar el estado del cliente."
                })
            },
            onFinish: () => {
                setProcessingId(null)
                setIsAlertOpen(false)
                setSelectedCustomer(null)
            }
        })
    }

    const confirmDelete = () => {
        if (!selectedCustomer) return;

        const deleteUrl = customersRoutes.destroy({
            tenant: t.slug,
            customer: selectedCustomer.id
        }).url;

        router.delete(deleteUrl, {
            onSuccess: () => {
                setIsDeleteAlertOpen(false);
                const restoredId = selectedCustomer.id;
                const customerName = selectedCustomer.business_name;

                toast.success("Cliente enviado a la papelera", {
                    description: `${customerName} ha sido eliminado.`,
                    action: {
                        label: "Restaurar",
                        onClick: () => {
                            router.post(customersRoutes.restore({
                                tenant: t.slug,
                                id: restoredId
                            }).url, {}, {
                                onSuccess: () => {
                                    toast.success("Cliente restaurado", {
                                        description: `${customerName} vuelve a estar en tu lista.`
                                    });
                                },
                                onError: () => {
                                    toast.error("Error", {
                                        description: "No se pudo restaurar el cliente."
                                    });
                                }
                            });
                        }
                    },
                });

                setSelectedCustomer(null);
            },
            onError: (errors) => {
                const message = Object.values(errors)[0] as string || "No se pudo eliminar.";
                toast.error("Error", { description: message });
            }
        });
    };

    const handleTabChange = (value: string) => {
        const showTrashed = value === "trashed";
        setIsTrashed(showTrashed);
        
        setIsLoading(true);

        router.get(customersRoutes.index(t.slug).url, 
            { trashed: showTrashed }, 
            { 
                preserveState: true, 
                replace: true,
                onFinish: () => setIsLoading(false)
            }
        );
    };

    return (
        <AppLayout>
            <Head title="Clientes" />
            <div className="p-4 md:p-8 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black flex items-center gap-2">
                            <Users className="w-6 h-6 text-primary" /> Cartera de Clientes
                        </h1>
                        <p className="text-muted-foreground text-sm font-medium">
                            {isTrashed ? "Clientes en la papelera." : "Gestiona los datos de facturación de tus clientes."}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {!isTrashed && (
                            <Button onClick={handleCreate} className="gap-2 ">
                                <Plus className="w-4 h-4" /> Nuevo Cliente
                            </Button>
                        )}
                        <Tabs defaultValue={isTrashed ? "trashed" : "active"} onValueChange={handleTabChange} className="h-9">
                            <TabsList>
                                <TabsTrigger value="active">Activos</TabsTrigger>
                                <TabsTrigger value="trashed" className="gap-2">
                                    <Trash2 className="w-4 h-4" /> Papelera
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>

                <div className="min-h-[400px]">
                {isLoading ? (
                    <>
                        <div className="flex items-center justify-between mb-2">
                            <Skeleton className="h-9 w-[300px]" />
                         </div>
                         <div className="rounded-md border ">
                            <TableSkeleton />
                        </div>
                    </>
                    
                ) : (
                    <div className={processingId ? "pointer-events-none opacity-80" : ""}>
                        <DataTable
                            columns={customerColumns(
                                handleEdit, 
                                handleDeleteClick, 
                                handleToggleClick, 
                                handleRestore, 
                                processingId, 
                                isTrashed
                            )}
                            data={customers.data}
                            filterColumn="business_name"
                            placeholder="Buscar cliente..."
                        />
                    </div>
                )}
            </div>
            </div>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="sm:max-w-md overflow-y-auto border-l">
                    <SheetHeader className="mb-6 border-b pb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <User className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <SheetTitle className="text-xl font-bold">
                                    {selectedCustomer ? `Editar Cliente` : "Nuevo Cliente"}
                                </SheetTitle>
                                <SheetDescription className="text-xs">
                                    Actualiza la información de contacto y fiscal.
                                </SheetDescription>
                            </div>
                        </div>
                    </SheetHeader>
                    <div className="px-4">
                        <CustomerForm
                            tenantSlug={t.slug}
                            initialData={selectedCustomer}
                            onSuccess={() => setIsSheetOpen(false)}
                        />
                    </div>
                </SheetContent>
            </Sheet>

            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent className="rounded-2xl w-auto flex flex-col items-center!">
                    <AlertDialogHeader className="flex flex-col items-center! justify-center">
                        <AlertDialogMedia className="bg-alert/10 text-alert dark:bg-alert/20 dark:text-alert">
                            <AlertTriangle />
                        </AlertDialogMedia>
                        <AlertDialogTitle>¿Cambiar estado?</AlertDialogTitle>
                        <AlertDialogDescription className="text-center">
                            El cliente <strong>{selectedCustomer?.business_name}</strong> se marcará como {selectedCustomer?.active ? 'inactivo' : 'activo'}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setSelectedCustomer(null)}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmToggle} variant="destructive">Confirmar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                <AlertDialogContent className="rounded-2xl w-auto flex flex-col items-center!">
                    <AlertDialogHeader className="flex flex-col items-center! justify-center">
                        <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                            <Trash2Icon />
                        </AlertDialogMedia>
                        <AlertDialogTitle>¿Eliminar cliente permanentemente?</AlertDialogTitle>
                        <AlertDialogDescription className="text-center">
                            Esta acción no se puede deshacer.
                            {selectedCustomer && (
                                <>
                                    <span> Se eliminará a <strong>{selectedCustomer.business_name}</strong>.</span>
                                    {(selectedCustomer.invoices_count ?? 0) > 0 && (
                                        <p className="mt-2 p-2 bg-destructive/10 text-destructive text-[11px] font-bold rounded">
                                            ATENCIÓN: Tiene {selectedCustomer.invoices_count} facturas asociadas.
                                        </p>
                                    )}
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel variant="outline" onClick={() => setSelectedCustomer(null)}>
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            variant="destructive"
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    )
}