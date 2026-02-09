import { Skeleton } from "@/components/ui/skeleton"

const TableSkeleton = () => (
    <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 border-b px-2 py-1">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[100px]" />
                <div className="ml-auto">
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
            </div>
        ))}
    </div>
)
export { TableSkeleton };