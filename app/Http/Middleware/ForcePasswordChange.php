<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForcePasswordChange
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (
            $user &&
            $user->must_change_password &&
            ! $request->routeIs([
                'tenant.dashboard',
                'tenant.password.update',
                'tenant.logout',
            ])
        ) {
            abort(403, 'Debes cambiar tu contraseña antes de continuar.');
        }

        return $next($request);
    }
}
