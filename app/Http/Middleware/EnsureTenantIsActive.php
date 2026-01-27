<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTenantIsActive
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $tenant = tenancy()->tenant;

        if (!$tenant) {
            abort(404, 'Empresa no encontrada');
        }

        if (!$tenant || $tenant->status !== 'active') {
            return inertia('errors/TenantSuspended', [
                'message' => 'Tu cuenta ha sido suspendida. Contacta a soporte.'
            ])->toResponse($request)->setStatusCode(403);
        }

        return $next($request);
    }
}