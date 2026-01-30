<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateTenant
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
{
    if (!Auth::check()) {
        // Intentar obtener el slug del parámetro de la ruta
        $tenantSlug = $request->route('tenant');

        // Si el parámetro es un objeto (Binding), extraemos el slug
        if (is_object($tenantSlug)) {
            $tenantSlug = $tenantSlug->slug ?? $tenantSlug->id;
        }

        // Si por alguna razón no hay slug en la URL, enviamos al login central
        if (!$tenantSlug) {
            return redirect()->route('login');
        }

        return redirect()->route('tenant.login', ['tenant' => $tenantSlug]);
    }
    
    return $next($request);
}
}
