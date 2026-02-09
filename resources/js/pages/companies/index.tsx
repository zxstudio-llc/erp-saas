import React, { useState } from "react"
import { Head } from "@inertiajs/react"
import AppLayout from "@/layouts/app-layout"
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter, CardAction } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, Store, Settings, ShieldCheck, MapPin, ChevronRight, Layers, Plus, ChevronLeft, ChevronRightIcon } from "lucide-react"
import { CompanyForm } from "./company-form"
import useTenant from "@/hooks/use-tenant"
import { EstablishmentForm } from "../establishments/establishments-form"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { BorderBeam } from "@/components/app/border-beam"

interface Props {
    company: any
    stats: any
    next_codes: any
}

export default function CompanySettingsIndex({ company, stats, next_codes }: Props) {
    const t = useTenant.required()
    const [editingEstablishment, setEditingEstablishment] = useState<any>(null)

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 23;

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentEstablishments = company.establishments.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(company.establishments.length / itemsPerPage);

    return (
        <AppLayout>
            <Head title="Configuración de Empresa" />

            <div className="flex h-fit flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Tabs defaultValue="general" className="w-full space-y-6">

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-smrounded-2xl">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary/10 p-3 rounded-xl">
                                <Building2 className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black tracking-tight">{company.business_name}</h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="secondary" className="font-mono text-[10px]">{company.ruc}</Badge>
                                    <Badge className={company.environment === 'prod'
                                        ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/20'
                                        : 'bg-amber-500/15 text-amber-600 border-amber-500/20'}>
                                        <div className={`mr-1.5 h-1.5 w-1.5 rounded-full animate-pulse ${company.environment === 'prod' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                        {company.environment === 'prod' ? 'PRODUCCIÓN' : 'PRUEBAS'}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <TabsList className="grid w-full md:w-[350px] grid-cols-2 h-11 bg-muted/50 p-1">
                            <TabsTrigger value="general" className="gap-2">
                                <Settings className="w-4 h-4" /> Matriz
                            </TabsTrigger>
                            <TabsTrigger value="locations" className="gap-2">
                                <Store className="w-4 h-4" /> Sucursales
                            </TabsTrigger>
                        </TabsList>
                    </div>
                    
                    <TabsContent value="general">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="lg:col-span-2 shadow-sm overflow-hidden">
                                <CardHeader>
                                    <CardTitle className="text-lg">Datos Legales de Matriz</CardTitle>
                                    <CardDescription>Configuración general de facturación electrónica.</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <CompanyForm tenantSlug={t.slug} initialData={company} />
                                </CardContent>
                            </Card>

                            <div className="space-y-6">
                                <Card className="bg-primary/5 border-none shadow-sm">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                                            <ShieldCheck className="w-4 h-4 text-primary" /> Firma Electrónica
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Recuerda que para la <strong>Entrega Inmediata</strong> de comprobantes en producción, tu certificado (.p12) debe estar cargado y vigente.
                                        </p>
                                        <div className="pt-4 border-t flex flex-col gap-2">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-muted-foreground">Estado:</span>
                                                <span className="font-bold text-emerald-600">Configurado</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="locations" className="mt-0 space-y-6">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.15em] flex items-center gap-2">
                                Sucursales ({company.establishments.length})
                            </h3>

                            {totalPages > 1 && (
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="text-[10px] font-bold">Página {currentPage} de {totalPages}</span>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                    >
                                        <ChevronRightIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">

                            {currentPage === 1 && (
                                <Card
                                className="group relative border border-emerald-500/20 hover:border-emerald-500/0 transition-all duration-500 cursor-pointer flex flex-col items-center justify-center aspect-square bg-emerald-500/[0.02] dark:bg-emerald-500/[0.05] overflow-hidden shadow-none hover:shadow-[0_0_30px_-10px_rgba(16,185,129,0.3)]"
                                onClick={() => setEditingEstablishment({ isNew: true })}
                            >
                                {/* Fondo de Grano/Ruido sutil para textura Neón */}
                                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                            
                                {/* Efecto de Brillo Radial en el centro al hacer Hover */}
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            
                                {/* Composición de Iconos: Store + Plus */}
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="relative mb-4">
                                        {/* Contenedor del Icono Principal (Verde Neón) */}
                                        <div className="p-5 rounded-[2.5rem] bg-emerald-500/10 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:rotate-[12deg] group-hover:scale-110 transition-all duration-500 shadow-[0_0_15px_rgba(16,185,129,0.1)] group-hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]">
                                            <Store className="w-10 h-10 text-emerald-500 group-hover:text-black transition-colors duration-500 stroke-[1.5]" />
                                        </div>
                                        
                                        {/* Badge Superior con el Plus */}
                                        <div className="absolute -top-1 -right-1 bg-lime-400 p-1.5 rounded-full shadow-[0_0_10px_rgba(163,230,53,0.8)] border-2 border-white dark:border-slate-950 group-hover:scale-125 transition-transform duration-500">
                                            <Plus className="w-4 h-4 text-black font-black" />
                                        </div>
                                    </div>
                                    
                                    {/* Textos con Estilo Tech */}
                                    <div className="text-center px-4 space-y-1">
                                        <h3 className="font-black text-[13px] text-emerald-600 dark:text-emerald-400 tracking-[0.05em] uppercase">
                                            Añadir Sucursal
                                        </h3>
                                        <p className="text-[9px] text-muted-foreground font-medium leading-tight max-w-[130px] mx-auto group-hover:text-emerald-500/80 transition-colors">
                                            Habilita un nuevo punto de emisión en el sistema
                                        </p>
                                    </div>
                                </div>
                            
                                {/* MagicUI Border Beam - Configurado con colores Neón */}
                                <BorderBeam duration={8} size={100} />
                            
                                {/* Decoración de escaneo inferior */}
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
                            </Card>
                            )}

                            {currentEstablishments.map((est: any) => (
                                <Card
                                    key={est.id}
                                    className="group relative flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 aspect-square bg-card/60 backdrop-blur-sm p-0"
                                >
                                    <CardHeader className="relative px-1 pt-1 h-[2.85rem] flex-none overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-muted/30 to-transparent opacity-50" />

                                        <div className="relative flex justify-between items-center h-full">
                                            <div className="flex items-center gap-2">
                                                <div className="relative">

                                                    <div className="bg-background border shadow-sm group-hover:border-primary/50 group-hover:shadow-primary/10 text-foreground group-hover:text-primary font-mono text-base font-black h-9 w-12 flex items-center justify-center rounded-lg transition-all duration-300 transform group-hover:-rotate-2">
                                                        {est.code}
                                                    </div>
                                                    <span className={`absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full border-2 border-background ${est.active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                                </div>
                                            </div>

                                            {est.code === '001' ? (
                                                <Badge variant="secondary" className="flex items-center gap-1.5 px-2 py-1 rounded-full border border-primary/20 backdrop-blur-md">
                                                    <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                                                    <span className="text-[8px] font-black text-primary uppercase tracking-tighter">
                                                        Matriz Principal
                                                    </span>
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-background/50 border-muted-foreground/10 text-[8px] rounded-full font-bold text-muted-foreground/60 uppercase px-1.5 h-5">
                                                    Sucursal
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-muted-foreground/10 to-transparent" />
                                    </CardHeader>

                                    <CardContent className="px-4 py-0 flex-1 overflow-hidden">
                                        <div className="h-full flex flex-col justify-center">
                                            <h4 className="font-bold text-sm tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
                                                {est.name}
                                            </h4>
                                            <p className="text-[10px] leading-relaxed text-muted-foreground flex items-start gap-1 mt-1.5 overflow-hidden">
                                                <MapPin className="w-3 h-3 shrink-0 opacity-50 mt-0.5" />
                                                <span className="line-clamp-2 italic">{est.address}</span>
                                            </p>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="flex items-center justify-between flex-none transition-colors h-10 bg-primary-foreground">
                                        <div className="flex items-center gap-1.5 ">
                                            <Layers className="w-3 h-3 text-primary/60" />
                                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tight">
                                                {est.emission_points?.length || 0} Puntos
                                            </span>
                                        </div>

                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => setEditingEstablishment(est)}
                                            className="h-7 w-7 rounded-full bg-primary text-primary-foreground border border-transparent hover:border-white hover:bg-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-400 shadow-xl shadow-primary/30 transform translate-y-3 group-hover:translate-y-0"
                                        >
                                            <ChevronRight className="w-4 h-4 stroke-[2]" />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
                <Sheet open={!!editingEstablishment} onOpenChange={() => setEditingEstablishment(null)}>
                    <SheetContent className="sm:max-w-md overflow-y-auto">
                        <SheetHeader className="mb-6">
                            <SheetTitle>{editingEstablishment?.isNew ? "Nueva Sucursal" : `Editar Sucursal ${editingEstablishment?.code}`}</SheetTitle>
                            <SheetDescription>
                                Configura la geolocalización y los parámetros del SRI para este establecimiento.
                            </SheetDescription>
                        </SheetHeader>
                        <div className="px-4">
                            {editingEstablishment && (
                                <EstablishmentForm
                                    tenantSlug={t.slug}
                                    companyId={company.id}
                                    initialData={editingEstablishment.isNew ? null : editingEstablishment}
                                    onSuccess={() => setEditingEstablishment(null)}
                                />
                            )}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </AppLayout>
    )
}