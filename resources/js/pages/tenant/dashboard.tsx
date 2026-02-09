import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import AuthTenantLayout from '@/layouts/auth-tenant-layout';
import { ForcePasswordForm } from '@/components/force-password-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Field } from '@/components/ui/field';
import {
    FileText,
    BarChart3,
    DollarSign,
    Clock,
    Users,
    Hash,
    Rocket,
    AlertCircle,
    CheckCircle2,
    Loader2,
    ShieldCheck,
    Globe,
    Activity,
    Building2
} from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import type { BreadcrumbItem } from '@/types';
import { dashboard as dashboardRoute } from '@/routes/tenant';
import { toast } from "sonner";
import { useState } from 'react';
import sequenceBlockRoutes from '@/routes/tenant/sequence-blocks';
import { DataTable } from '@/components/data-table/data-table';
import { Invoice, invoiceColumns } from '@/components/data-table/invoice-columns';
import { Button } from '@/components/ui/button';
import React from 'react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';
import { chartConfig } from '@/components/app/chart-config';

interface DashboardStats {
    invoices_today: number;
    invoices_month: number;
    total_sales_month: number;
    pending_authorizations: number;
    active_customers: number;
    available_sequences: number;
}

interface RecentInvoice {
    id: number;
    sequential: string;
    customer_name: string;
    total: number;
    status: string;
    created_at: string;
}

interface EmissionPoint {
    id: number;
    establishment_id: number;
    code: string;
    name: string;
    active: boolean;
}

interface Establishment {
    id: number;
    company_id: number;
    code: string;
    name: string;
    address: string;
    active: boolean;
    company?: {
        business_name: string;
        trade_name: string;
        ruc: string;
        environment: 'test' | 'prod';
    };
    // Cargamos la relación de puntos de emisión
    emission_points?: EmissionPoint[];
}

interface DashboardSetup {
    missing_sequences: boolean;
    establishments: {
        data: Establishment[];
    };
}

interface Props {
    stats: DashboardStats;
    recent_invoices: RecentInvoice[];
    environment: 'test' | 'production';
    setup: DashboardSetup;
}

export default function Dashboard({ stats, recent_invoices, environment, setup }: Props) {
    const [processing, setProcessing] = useState(false);
    const [showSetupModal, setShowSetupModal] = useState(setup.missing_sequences);
    const mainEst = setup.establishments?.data?.[0];
    const { props } = usePage();
    const tenantData = props.tenant as any;
    const tenantSlug = typeof tenantData === 'object' ? tenantData.slug : tenantData;
    const mustChangePassword = props.mustChangePassword as boolean;
    const invoicesData = recent_invoices as unknown as Invoice[];

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: dashboardRoute({ tenant: tenantSlug }).url },
    ];

    const handleQuickSetup = () => {
        if (!mainEst?.id) {
            toast.error("No se encontró el establecimiento matriz");
            return;
        }

        // Buscamos el punto de emisión 001 dentro de los datos que ya tenemos
        const defaultPoint = mainEst.emission_points?.find(p => p.code === '001');

        if (!defaultPoint) {
            toast.error("No se encontró el punto de emisión 001 para este establecimiento.");
            return;
        }

        // Obtenemos la URL usando Wayfinder
        // sequenceBlockRoutes.store.url({ tenant: tenantSlug })
        const { url, method } = sequenceBlockRoutes.store({ tenant: tenantSlug });

        // Payload requerido por InvoiceSequenceBlockController::store
        const setupData = {
            establishment_id: mainEst.id,
            emission_point_id: defaultPoint.id,
            block_size: 1000, // Ajustado según el min:10 max:10000 del controlador
            device_id: 'dashboard-quick-setup'
        };

        router.post(url, setupData, {
            preserveScroll: true,
            onStart: () => {
                setProcessing(true);
                toast.loading("Configurando secuenciales...", { id: "setup-sri" });
            },
            onFinish: () => setProcessing(false),
            onSuccess: () => {
                setShowSetupModal(false);
                toast.success("¡Facturación Activada!", {
                    id: "setup-sri",
                    description: "Se ha asignado el primer bloque de secuenciales exitosamente.",
                });
            },
            onError: (errors) => {
                // Extraemos el error descriptivo que envíe Laravel
                const firstError = Object.values(errors)[0];
                toast.error(firstError || "Error al configurar secuenciales", { id: "setup-sri" });
            }
        });
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
            authorized: 'default',
            pending: 'secondary',
            rejected: 'destructive',
            draft: 'outline',
        };
        return variants[status] || 'outline';
    };

    if (mustChangePassword) {
        return (
            <AuthTenantLayout title="Crear nueva contraseña"
                description="Tu nueva contraseña debe ser diferente a las anteriores.">
                <Head title="Registro de Empresa" />
                <Field className="overflow-hidden pt-8 w-xl space-y-6 px-4">
                    <div className="flex flex-col items-start gap-2 text-left">
                        <h1 className="text-2xl font-bold tracking-tight">Crear nueva contraseña</h1>
                        <p className="text-muted-foreground text-sm">
                            Tu nueva contraseña debe ser diferente a las anteriores.
                        </p>
                    </div>
                    <ForcePasswordForm />
                </Field>
            </AuthTenantLayout >
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Panel Analítico" />

            <div className="flex flex-col gap-6 p-4 md:p-8">

                {/* Sección Principal: Gráfico de Tendencia + Stats Laterales */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                    {/* Gráfico de Ventas (Ocupa 3 columnas) */}
                    <Card className="lg:col-span-3 border-none shadow-2xl shadow-black/[0.02] bg-card/50 backdrop-blur">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-black uppercase tracking-tight">Rendimiento Mensual</CardTitle>
                                <CardDescription>Ventas netas de los últimos 30 días</CardDescription>
                            </div>
                            <BarChart3 className="w-5 h-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="h-[300px] w-full">
                            <ChartContainer config={chartConfig} className="h-full w-full">
                                <LineChart data={recent_invoices.slice(0, 10)}> {/* Aquí deberías pasar data formateada por días */}
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.1} />
                                    <XAxis
                                        dataKey="created_at"
                                        tickFormatter={(value) => new Date(value).toLocaleDateString('es', { day: '2-digit' })}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Line
                                        type="monotone"
                                        dataKey="total"
                                        stroke="var(--color-sales)"
                                        strokeWidth={4}
                                        dot={false}
                                    />
                                </LineChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Stats Verticales (KPIs Rápidos) */}
                    <div className="flex flex-col gap-4">
                        <div className="flex-1 bg-primary text-primary-foreground p-6 rounded-3xl flex flex-col justify-between shadow-xl shadow-primary/20">
                            <DollarSign className="w-8 h-8 opacity-50" />
                            <div>
                                <p className="text-xs font-bold uppercase opacity-70 tracking-widest">Total Ventas Mes</p>
                                <h2 className="text-3xl font-black">${stats.total_sales_month.toLocaleString()}</h2>
                            </div>
                        </div>
                        <div className="flex-1 bg-card border p-6 rounded-3xl flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <FileText className="w-8 h-8 text-primary/40" />
                                <Badge className="bg-emerald-500 hover:bg-emerald-500 text-[9px]">LIVE</Badge>
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Facturas Hoy</p>
                                <h2 className="text-3xl font-black">{stats.invoices_today}</h2>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid Inferior: Distribución SRI y Clientes */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MiniMetric
                        label="Pendientes SRI"
                        value={stats.pending_authorizations}
                        sub="Requieren atención"
                        status={stats.pending_authorizations > 0 ? 'warning' : 'ok'}
                    />
                    <MiniMetric
                        label="Secuenciales Disp."
                        value={stats.available_sequences}
                        sub="Bloque actual"
                        status="ok"
                    />
                    <MiniMetric
                        label="Nuevos Clientes"
                        value={stats.active_customers}
                        sub="Este periodo"
                        status="ok"
                    />
                    <div className="bg-muted/50 rounded-2xl p-4 border border-dashed flex flex-col justify-center items-center text-center">
                        <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Puntos de Emisión</p>
                        <div className="flex -space-x-2">
                            <div className="h-6 w-6 rounded-full bg-primary border-2 border-background flex items-center justify-center text-[8px] text-white font-bold">01</div>
                            <div className="h-6 w-6 rounded-full bg-slate-400 border-2 border-background flex items-center justify-center text-[8px] text-white font-bold">02</div>
                        </div>
                    </div>
                </div>

                {/* Data Table de Facturas Recientes */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-black flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-primary" />
                            Facturación Reciente
                        </h2>
                        <Button variant="ghost" size="sm" className="text-xs font-bold text-primary">
                            Ver todo el historial
                        </Button>
                    </div>

                    <Card className="border-none shadow-2xl shadow-black/[0.03] rounded-2xl overflow-hidden bg-card/50 backdrop-blur-sm">
                        <CardContent className="p-0">
                            {/* Usamos el DataTable con el filtro de cliente */}
                            <DataTable
                                columns={invoiceColumns}
                                data={invoicesData}
                                filterColumn="customer" // Nota: el DataTable debe soportar filtrado por objetos anidados o usar ID de columna
                                placeholder="Buscar por cliente o comprobante..."
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Modal de Alerta SRI (Mantiene tu lógica funcional pero con UI refinada) */}
            <AlertDialog open={showSetupModal}>
                <AlertDialogContent
                    /* Forzamos el ancho máximo a XL con ! y quitamos límites previos */
                    className="!max-w-screen-sm w-[95vw] overflow-hidden border-border bg-card p-0 shadow-2xl"
                >
                    <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }}
                    />

                    <div className="relative z-10 p-4 flex flex-col items-center space-y-6">
                        <AlertDialogHeader className="flex flex-col items-center justify-center text-center w-full">

                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50 border border-border/50 mx-auto mb-2">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary shadow-sm">
                                    <Rocket className={`h-7 w-7 ${processing ? 'animate-bounce' : 'animate-pulse'}`} />
                                </div>
                            </div>

                            <div className="flex flex-col items-center space-y-2 w-full text-center text-wrap">
                                <AlertDialogTitle className="text-2xl font-black tracking-tight text-foreground">
                                    Configuración Requerida
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-sm text-muted-foreground">
                                    <span>Configuraremos el entorno SRI para tu empresa principal:</span>
                                    <span className="font-bold text-foreground block">
                                        {mainEst?.company?.business_name || 'Empresa no identificada'}
                                    </span>
                                </AlertDialogDescription>
                            </div>
                        </AlertDialogHeader>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive animate-in fade-in zoom-in duration-500">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm font-bold uppercase tracking-wide">
                                El establecimiento matriz no tiene secuenciales activos
                            </span>
                        </div>

                        {/* Card de Detalles Técnicos SRI */}
                        <div className="w-full rounded-2xl border border-border bg-muted/30 p-1 overflow-hidden">
                            <div className="bg-background/50 rounded-[11px] p-5 shadow-sm">
                                <div className="flex items-center justify-center gap-2 mb-4">
                                    <div className="h-px w-6 bg-border" />
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                                        {mainEst?.name || 'Casa Matriz'}
                                    </span>
                                    <div className="h-px w-6 bg-border" />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center space-y-1">
                                        <span className="text-[9px] font-bold text-muted-foreground/60 uppercase">RUC Empresa</span>
                                        <span className="font-mono text-sm font-bold text-primary">
                                            {mainEst?.company?.ruc}
                                        </span>
                                        <Badge>{mainEst?.company?.trade_name}</Badge>
                                    </div>
                                    <div className="text-center space-y-1 border-l border-border">
                                        <span className="text-[9px] font-bold text-muted-foreground/60 uppercase">Establecimiento</span>
                                        <span className="font-mono text-sm font-bold text-primary">
                                            {mainEst?.code}
                                        </span>
                                        <Badge>{mainEst?.name}</Badge>
                                    </div>
                                    <div className="text-center space-y-1 border-l border-border">
                                        <span className="text-[9px] font-bold text-muted-foreground/60 uppercase">Punto Emisión</span>
                                        <span className="font-mono text-sm font-bold text-primary">
                                            {mainEst?.emission_points?.[0]?.code}
                                        </span>
                                        <Badge className='text-balance'>{mainEst?.emission_points?.[0]?.name}</Badge>
                                    </div>
                                </div>

                                <div className="mt-5 flex items-center justify-center gap-2 py-2 px-3 rounded-full bg-primary/5 border border-primary/10">
                                    <CheckCircle2 className="h-3 w-3 text-primary" />
                                    <span className="text-[10px] font-bold text-primary/80 uppercase tracking-tight">
                                        Secuenciales: 000000001 - 999999999
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="w-full">
                            {!mainEst ? (
                                <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg mb-4 flex items-center gap-3 text-destructive">
                                    <AlertCircle className="h-5 w-5 shrink-0" />
                                    <span className="text-xs font-medium">
                                        Error crítico: No se localizó el establecimiento matriz en la base de datos.
                                    </span>
                                </div>
                            ) : (
                                <AlertDialogFooter className="w-full flex flex-col items-center">
                                    <AlertDialogAction
                                        onClick={handleQuickSetup}
                                        disabled={processing}
                                        className="w-full bg-primary font-bold text-primary-foreground transition-all hover:opacity-90 shadow-lg shadow-primary/20 rounded-xl disabled:opacity-70"
                                    >
                                        {processing ? (
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span>Activando...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Rocket className="h-4 w-4" />
                                                <span>Activar Facturación Ahora</span>
                                            </div>
                                        )}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            )}
                            <div className="flex items-center justify-center gap-2 mt-4">
                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                                <span className="text-center text-[10px] text-primary/80 font-medium uppercase tracking-widest">
                                    Configuración automática para {mainEst?.code || '000000001'} - 999999999
                                </span>
                            </div>
                        </div>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}

function MiniMetric({ label, value, sub, status }: any) {
    return (
        <div className="bg-card border rounded-2xl p-4 flex items-center gap-4">
            <div className={`h-2 w-2 rounded-full ${status === 'warning' ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
            <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground leading-none mb-1">{label}</p>
                <p className="text-xl font-black leading-none">{value}</p>
                <p className="text-[9px] text-muted-foreground mt-1">{sub}</p>
            </div>
        </div>
    )
}