"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Pencil } from "lucide-react"
import { Link } from "@inertiajs/react"
import tenant from "@/routes/tenant"

export interface Company {
    id: number
    ruc: string
    business_name: string
    trade_name: string
    email: string
    is_special_taxpayer: boolean
    establishments_count: number
}

export const companyColumns = (tenantSlug: string): ColumnDef<Company>[] => [
    {
        accessorKey: "ruc",
        header: "RUC",
    },
    {
        accessorKey: "business_name",
        header: "Razón Social",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span>{row.original.business_name}</span>
                <span className="text-xs text-muted-foreground">
                    {row.original.trade_name || "-"}
                </span>
            </div>
        ),
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "is_special_taxpayer",
        header: "Contribuyente",
        cell: ({ row }) => (
            <Badge
                variant={
                    row.original.is_special_taxpayer
                        ? "default"
                        : "secondary"
                }
            >
                {row.original.is_special_taxpayer ? "Especial" : "General"}
            </Badge>
        ),
    },
    {
        accessorKey: "establishments_count",
        header: () => <div className="text-center">Est.</div>,
        cell: ({ row }) => (
            <div className="text-center">
                {row.original.establishments_count}
            </div>
        ),
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => (
            <div className="flex justify-end gap-2">
                <Button variant="ghost" size="icon" asChild>
                    <Link
                        href={
                            tenant.companies.show({
                                tenant: tenantSlug,
                                company: row.original.id,
                            }).url
                        }
                    >
                        <Eye className="h-4 w-4" />
                    </Link>
                </Button>

                <Button variant="ghost" size="icon" asChild>
                    <Link
                        href={
                            tenant.companies.edit({
                                tenant: tenantSlug,
                                company: row.original.id,
                            }).url
                        }
                    >
                        <Pencil className="h-4 w-4" />
                    </Link>
                </Button>
            </div>
        ),
    },
]
