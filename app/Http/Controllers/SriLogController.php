<?php

namespace App\Http\Controllers;

use App\Models\SriLog;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SriLogController extends Controller
{
    public function index(Request $request): Response
    {
        $query = SriLog::with('invoice.customer');

        if ($action = $request->input('action')) {
            $query->where('action', $action);
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($invoiceId = $request->input('invoice_id')) {
            $query->where('invoice_id', $invoiceId);
        }

        $logs = $query->latest()
            ->paginate(50)
            ->withQueryString();

        return Inertia::render('sri-logs/index', [
            'logs' => $logs,
            'filters' => $request->only(['action', 'status', 'invoice_id']),
        ]);
    }

    public function show(SriLog $sriLog): Response
    {
        $sriLog->load('invoice.customer');

        return Inertia::render('sri-logs/show', [
            'log' => $sriLog
        ]);
    }

    public function stats()
    {
        $stats = [
            'total_logs' => SriLog::count(),
            'by_action' => SriLog::select('action', \DB::raw('count(*) as count'))
                ->groupBy('action')
                ->get(),
            'by_status' => SriLog::select('status', \DB::raw('count(*) as count'))
                ->groupBy('status')
                ->get(),
            'recent_errors' => SriLog::where('status', 'error')
                ->with('invoice')
                ->latest()
                ->take(10)
                ->get(),
            'success_rate' => [
                'validate' => $this->getSuccessRate('validate'),
                'send' => $this->getSuccessRate('send'),
                'authorize' => $this->getSuccessRate('authorize'),
            ]
        ];

        return response()->json($stats);
    }

    private function getSuccessRate(string $action): float
    {
        $total = SriLog::where('action', $action)->count();
        if ($total === 0) return 0;

        $success = SriLog::where('action', $action)
            ->whereIn('status', ['authorized', 'sent', 'validated'])
            ->count();

        return round(($success / $total) * 100, 2);
    }
}