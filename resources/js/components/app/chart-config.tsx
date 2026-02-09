import { Bar, BarChart, CartesianGrid, XAxis, Line, LineChart, ResponsiveContainer, Tooltip } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const chartConfig = {
    sales: {
        label: "Ventas",
        color: "hsl(var(--primary))",
    },
    invoices: {
        label: "Facturas",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig

export { chartConfig };