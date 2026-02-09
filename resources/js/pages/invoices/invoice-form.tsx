"use client"

import React, { useState } from 'react';
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Plus, Trash2, Calendar, CreditCard, Info,
    LayoutDashboard, Settings2, Building2, User, Globe, Truck, Wallet, Search, Check,
    ShoppingCart
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar"
// Importaciones nuevas para la funcionalidad solicitada
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { CustomerForm } from '../customers/customer-form';

export default function InvoiceForm({ data, setData, sequenceBlocks, processing, onSubmit, customers = [], tenantSlug }: any) {
    const [openSearch, setOpenSearch] = useState(false);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const addItem = () => {
        setData('items', [...data.items, {
            main_code: '', description: '', quantity: 1, unit_price: 0, discount: 0, subtotal: 0,
            taxes: [{ code: '2', rate: 15, amount: 0 }], total: 0,
        }]);
    };

    const removeItem = (index: number) => {
        const newItems = data.items.filter((_: any, i: number) => i !== index);
        setData('items', newItems);
    };

    const updateItem = (index: number, field: string, value: any) => {
        const items = [...data.items];
        items[index] = { ...items[index], [field]: value };
        const subtotal = items[index].quantity * items[index].unit_price;
        items[index].subtotal = subtotal;
        items[index].taxes[0].amount = subtotal * (items[index].taxes[0].rate / 100);
        items[index].total = subtotal + items[index].taxes[0].amount;
        setData('items', items);
    };

    const totalSubtotal = data.items.reduce((acc: number, item: any) => acc + item.subtotal, 0);
    const totalTaxes = data.items.reduce((acc: number, item: any) => acc + item.taxes[0].amount, 0);
    const totalInvoiced = totalSubtotal + totalTaxes;

    return (
        <form id="invoice-form" onSubmit={onSubmit} className="w-full h-full overflow-hidden">
            <Tabs defaultValue="edit" className="h-full">
                <div className="grid grid-cols-1 xl:grid-cols-12 h-full">

                    {/* COLUMNA IZQUIERDA: ÁREA SCROLLABLE */}
                    <div className="xl:col-span-9 h-full overflow-y-auto p-6 lg:p-10 scrollbar-thin scrollbar-thumb-muted-foreground/20">
                        <TabsContent value="edit" className="mt-0 space-y-8 animate-in fade-in duration-500 pb-20">

                            {/* 1. Configuración de Documento */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Card className="bg-muted/30 border-none shadow-none ring-1 ring-border/50">
                                    <CardContent>
                                        <div className="flex items-center gap-2 text-primary mb-2">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Emisión</span>
                                        </div>
                                        <Input type="date" className="border-none p-0 focus-visible:ring-0 text-lg font-bold bg-transparent h-auto" defaultValue={new Date().toISOString().split('T')[0]} />
                                    </CardContent>
                                </Card>
                                <Card className="bg-muted/30 border-none shadow-none ring-1 ring-border/50">
                                    <CardContent>
                                        <div className="flex items-center gap-2 text-primary mb-2">
                                            <Info className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Punto</span>
                                        </div>
                                        <Select onValueChange={(v) => setData('sequence_block_id', Number(v))} value={data.sequence_block_id.toString()}>
                                            <SelectTrigger className="border-none p-0 focus:ring-0 h-auto text-lg font-bold bg-transparent shadow-none">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sequenceBlocks.map((block: any) => (
                                                    <SelectItem key={block.id} value={block.id.toString()}>
                                                        {`${String(block.establishment_id).padStart(3, '0')}-${String(block.emission_point_id).padStart(3, '0')}`}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </CardContent>
                                </Card>
                                <Card className="bg-muted/30 border-none shadow-none ring-1 ring-border/50 md:col-span-2">
                                    <CardContent>
                                        <div className="flex items-center gap-2 text-primary mb-2">
                                            <Truck className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Guía de Remisión (Opcional)</span>
                                        </div>
                                        <Input placeholder="000-000-000000000" className="border-none p-0 focus-visible:ring-0 text-lg font-bold bg-transparent h-auto font-mono" />
                                    </CardContent>
                                </Card>
                            </div>
                            <Card >
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 h-5 border-b">
                                    <CardTitle className="text-xs font-black flex items-center gap-2 uppercase tracking-widest text-primary">
                                        <User className="w-4 h-4" /> Adquirente
                                    </CardTitle>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 text-[10px] font-bold uppercase border"
                                        onClick={() => setIsSheetOpen(true)}
                                    >
                                        <Plus className="w-3 h-3 mr-1" /> Nuevo
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-4 gap-3">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase text-muted-foreground">Tipo Ident.</Label>
                                            <Select defaultValue="05" value={data.identification_type} onValueChange={(v) => setData('identification_type', v)}>
                                                <SelectTrigger className="bg-muted/30 border-none h-11">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="05">Cédula</SelectItem>
                                                    <SelectItem value="04">RUC</SelectItem>
                                                    <SelectItem value="06">Pasaporte</SelectItem>
                                                    <SelectItem value="08">Identificación del exterior</SelectItem>
                                                    <SelectItem value="07">Consumidor Final</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase text-muted-foreground">Identificación</Label>
                                            <Popover open={openSearch} onOpenChange={setOpenSearch}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        className="w-full justify-between bg-muted/30 border-none h-11 font-mono text-sm"
                                                    >
                                                        {data.identification || "0000000000"}
                                                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[300px] p-0" align="start">
                                                    <Command>
                                                        <CommandInput placeholder="Buscar por RUC/Cédula..." />
                                                        <CommandList>
                                                            <CommandEmpty>No se encontraron clientes.</CommandEmpty>
                                                            <CommandGroup>
                                                                {customers.map((customer: any) => (
                                                                    <CommandItem
                                                                        key={customer.id}
                                                                        value={customer.identification}
                                                                        onSelect={() => {
                                                                            setData({
                                                                                ...data,
                                                                                customer_id: customer.id,
                                                                                identification: customer.identification,
                                                                                business_name: customer.business_name,
                                                                                email: customer.email,
                                                                                phone: customer.phone,
                                                                                address: customer.address
                                                                            });
                                                                            setOpenSearch(false);
                                                                        }}
                                                                    >
                                                                        <Check className={cn("mr-2 h-4 w-4", data.identification === customer.identification ? "opacity-100" : "opacity-0")} />
                                                                        <div className="flex flex-col">
                                                                            <span>{customer.identification}</span>
                                                                            <span className="text-[10px] text-muted-foreground">{customer.business_name}</span>
                                                                        </div>
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase text-muted-foreground">Razón Social</Label>
                                            <Input
                                                placeholder="Buscar o ingresar cliente..."
                                                className="bg-muted/30 border-none h-11"
                                                value={data.business_name}
                                                onChange={(e) => setData('business_name', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase text-muted-foreground">Teléfono</Label>
                                            <Input
                                                placeholder="099..."
                                                className="bg-muted/30 border-none h-11 font-mono"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="col-span-3 space-y-2">
                                            <Label className="text-[10px] font-bold uppercase text-muted-foreground">Dirección</Label>
                                            <Input
                                                placeholder="Calle, ciudad..."
                                                className="bg-muted/30 border-none h-11"
                                                value={data.address}
                                                onChange={(e) => setData('address', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase text-muted-foreground">Correo electrónico</Label>
                                            <Input
                                                placeholder="cliente@mail.com"
                                                className="bg-muted/30 border-none h-11"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* 3. Tabla de Productos */}
                            <Card className="border-none shadow-2xl shadow-black/[0.03] ring-1 ring-border overflow-hidden">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b h-5">
                                    <div className="space-y-1 flex gap-2 items-center">
                                        <ShoppingCart size={'20'} />
                                        <div>
                                            <CardTitle className="text-[11px] font-black uppercase tracking-[0.15em] text-primary">
                                                Detalle de Productos
                                            </CardTitle>
                                            <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">
                                                Lista de ítems a facturar
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 text-[10px] font-bold uppercase border"
                                        onClick={addItem}

                                    >
                                        <Plus className="w-4 h-4 mr-2 stroke-[3]" /> Agregar Item
                                    </Button>
                                </CardHeader>

                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-muted/30">
                                            <TableRow className="border-none hover:bg-transparent">
                                                <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Producto / Servicio</TableHead>
                                                <TableHead className="w-[80px] text-right text-[10px] font-black uppercase tracking-widest">Cant.</TableHead>
                                                <TableHead className="w-[110px] text-right text-[10px] font-black uppercase tracking-widest">P. Unitario</TableHead>
                                                <TableHead className="w-[90px] text-right text-[10px] font-black uppercase tracking-widest">Desc.</TableHead>
                                                <TableHead className="w-[110px] text-right text-[10px] font-black uppercase tracking-widest">Total</TableHead>
                                                <TableHead className="w-[50px]"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {data.items.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="h-32 text-center">
                                                        <div className="flex flex-col items-center justify-center text-muted-foreground/50">
                                                            <Plus className="w-8 h-8 mb-2 opacity-20" />
                                                            <p className="text-xs font-medium uppercase tracking-tighter">No hay ítems agregados</p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                data.items.map((item: any, index: number) => (
                                                    <TableRow key={index} className="border-b border-muted/50 last:border-none group transition-colors hover:bg-muted/5">
                                                        <TableCell className="py-4">
                                                            <div className="space-y-1.5">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[9px] font-bold text-primary/60 bg-primary/5 px-1.5 py-0.5 rounded tracking-tighter uppercase">Cod</span>
                                                                    <Input
                                                                        placeholder="SKU-001..."
                                                                        className="border-none bg-transparent h-4 text-[10px] p-0 focus-visible:ring-0 font-mono font-semibold text-muted-foreground w-full shadow-none"
                                                                        value={item.main_code}
                                                                        onChange={(e) => updateItem(index, 'main_code', e.target.value)}
                                                                    />
                                                                </div>
                                                                <Input
                                                                    placeholder="Nombre del producto o servicio..."
                                                                    value={item.description}
                                                                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                                    className="border-none bg-transparent h-6 p-0 focus-visible:ring-0 font-bold text-sm placeholder:text-muted-foreground/40 w-full shadow-none"
                                                                />
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-4">
                                                            <Input
                                                                type="number"
                                                                className="text-right border-none bg-muted/20 group-hover:bg-muted/40 transition-colors h-9 px-2 focus-visible:ring-1 ring-primary/20 font-mono font-bold text-sm rounded-md shadow-none"
                                                                value={item.quantity}
                                                                onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="py-4 px-4">
                                                            <div className="relative">
                                                                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground/40 font-mono text-xs">$</span>
                                                                <Input
                                                                    type="number"
                                                                    className="text-right border-none bg-muted/20 group-hover:bg-muted/40 transition-colors h-9 pl-4 pr-2 focus-visible:ring-1 ring-primary/20 font-mono font-bold text-sm rounded-md shadow-none"
                                                                    value={item.unit_price}
                                                                    onChange={(e) => updateItem(index, 'unit_price', Number(e.target.value))}
                                                                />
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-4 px-4">
                                                            <div className="relative">
                                                                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground/40 font-mono text-xs">$</span>
                                                                <Input
                                                                    type="number"
                                                                    className="text-right border-none bg-muted/20 group-hover:bg-muted/40 transition-colors h-9 pl-4 pr-2 focus-visible:ring-1 ring-primary/20 font-mono font-bold text-sm rounded-md text-destructive/80 shadow-none"
                                                                    value={item.discount}
                                                                    onChange={(e) => updateItem(index, 'discount', Number(e.target.value))}
                                                                />
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right py-4">
                                                            <div className="flex flex-col items-end">
                                                                <span className="text-xs font-black font-mono text-primary bg-primary/5 px-2 py-1 rounded-md">
                                                                    ${item.total.toFixed(2)}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-4 text-center">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => removeItem(index)}
                                                                className="h-8 w-8 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </Card>
                        </TabsContent>

                        <TabsContent value="preview" className="h-full mt-0">
                            <Card className="h-full border-dashed flex items-center justify-center bg-muted/5">
                                <div className="text-center">
                                    <LayoutDashboard className="w-10 h-10 mx-auto mb-4 opacity-20" />
                                    <p className="text-muted-foreground uppercase text-[10px] font-black tracking-widest">Vista Previa del Comprobante</p>
                                </div>
                            </Card>
                        </TabsContent>
                    </div>

                    <div className="xl:col-span-3 border-l bg-card h-full overflow-hidden">
                        <Sidebar collapsible="none" className="w-full h-full flex flex-col">
                            <SidebarHeader className="flex flex-col gap-4 p-4 border-b shrink-0">
                                <TabsList className="h-11 w-full bg-muted/50 p-1">
                                    <TabsTrigger value="edit" className="flex-1 font-bold text-[10px] uppercase tracking-widest">
                                        <Settings2 className="w-3.5 h-3.5 mr-2" /> Editor
                                    </TabsTrigger>
                                    <TabsTrigger value="preview" className="flex-1 font-bold text-[10px] uppercase tracking-widest">
                                        <LayoutDashboard className="w-3.5 h-3.5 mr-2" /> Vista
                                    </TabsTrigger>
                                </TabsList>
                            </SidebarHeader>

                            <SidebarContent className="p-4 space-y-2 overflow-y-auto">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-primary">
                                        <Wallet className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Método de Pago</span>
                                    </div>
                                    <Card className="mx-auto w-full gap-1">
                                        <CardContent>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Forma de Pago (SRI)</Label>
                                                <Select
                                                    defaultValue="01"
                                                    value={data.payment_method}
                                                    onValueChange={(v) => setData('payment_method', v)}
                                                >
                                                    <SelectTrigger className="bg-muted/30 border-none h-11">
                                                        <SelectValue placeholder="Seleccione" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="01">SIN UTILIZACION DEL SISTEMA FINANCIERO</SelectItem>
                                                        <SelectItem value="15">COMPENSACIÓN DE DEUDAS</SelectItem>
                                                        <SelectItem value="16">TARJETA DE DÉBITO</SelectItem>
                                                        <SelectItem value="17">DINERO ELECTRÓNICO</SelectItem>
                                                        <SelectItem value="18">TARJETA PREPAGO</SelectItem>
                                                        <SelectItem value="19">TARJETA DE CRÉDITO</SelectItem>
                                                        <SelectItem value="20">OTROS CON UTILIZACION DEL SISTEMA FINANCIERO</SelectItem>
                                                        <SelectItem value="21">ENDOSO DE TÍTULOS</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </CardContent>
                                        <CardFooter>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Plazo</Label>
                                                    <Input type="number" defaultValue="0" className="bg-muted/30 border-none h-11" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Unidad Tiempo</Label>
                                                    <Select defaultValue="dias">
                                                        <SelectTrigger className="bg-muted/30 border-none h-11">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="dias">Días</SelectItem>
                                                            <SelectItem value="meses">Meses</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </CardFooter>
                                    </Card>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-primary">
                                        <CreditCard className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Cálculo de Impuestos</span>
                                    </div>
                                    <Card className="mx-auto w-full gap-1">
                                        <CardContent>
                                            <div className="flex justify-between text-xs font-medium">
                                                <span className="text-muted-foreground">Subtotal 0%</span>
                                                <span className="font-mono font-bold">$0.00</span>
                                            </div>
                                            <div className="flex justify-between text-xs font-medium">
                                                <span className="text-muted-foreground">Subtotal 15%</span>
                                                <span className="font-mono font-bold">${totalSubtotal.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-xs font-medium text-destructive">
                                                <span className="">Descuento</span>
                                                <span className="font-mono font-bold">-$0.00</span>
                                            </div>
                                            <div className="flex justify-between text-xs font-medium">
                                                <span className="text-muted-foreground">IVA (15%)</span>
                                                <span className="font-mono font-bold">${totalTaxes.toFixed(2)}</span>
                                            </div>
                                        </CardContent>
                                        <CardFooter className='flex justify-between'>
                                            <span className="text-[10px] font-black uppercase">Total a Pagar</span>
                                            <span className="text-2xl font-black font-mono tracking-tighter text-primary">
                                                ${totalInvoiced.toFixed(2)}
                                            </span>
                                        </CardFooter>
                                    </Card>
                                </div>
                            </SidebarContent>
                            <SidebarFooter className='flex flex-col gap-4 p-4 border-t shrink-0'>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    variant={"default"}
                                >
                                    {processing ? 'Emitiendo...' : 'Emitir y Enviar SRI'}
                                </Button>
                            </SidebarFooter>
                        </Sidebar>
                    </div>
                </div>
            </Tabs>

            {/* SHEET DE CREACIÓN DE CLIENTE (Extraído de tu lógica de Index) */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="sm:max-w-md overflow-y-auto border-l">
                    <SheetHeader className="mb-6 border-b pb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <User className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <SheetTitle className="text-xl font-bold">Nuevo Cliente</SheetTitle>
                                <SheetDescription className="text-xs">
                                    Crea un cliente rápido para usar en esta factura.
                                </SheetDescription>
                            </div>
                        </div>
                    </SheetHeader>
                    <div className="px-4">
                        <CustomerForm
                            tenantSlug={tenantSlug}
                            onSuccess={(newCustomer: any) => {
                                if (newCustomer) {
                                    setData({
                                        ...data,
                                        customer_id: newCustomer.id,
                                        identification: newCustomer.identification,
                                        business_name: newCustomer.business_name,
                                        email: newCustomer.email,
                                        phone: newCustomer.phone,
                                        address: newCustomer.address
                                    });
                                }
                                setIsSheetOpen(false);
                            }}
                        />
                    </div>
                </SheetContent>
            </Sheet>
        </form>
    );
}