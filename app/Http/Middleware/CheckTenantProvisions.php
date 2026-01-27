<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckTenantProvisions
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $tenant = tenant();
        if ($tenant) {
            // Verificamos si existe una tabla clave, por ejemplo 'users'
            if (! Schema::hasTable('users')) {
                Artisan::call('tenants:migrate', ['--tenants' => [$tenant->id], '--force' => true]);
                Artisan::call('tenants:seed', ['--tenants' => [$tenant->id], '--class' => 'TenantDatabaseSeeder', '--force' => true]);

                // Creamos el admin dentro del tenant si no existe
                $userData = auth()->user(); // Datos del usuario logueado en central
                $tenant->run(function () use ($userData) {
                    \App\Models\User::firstOrCreate(
                        ['email' => $userData->email],
                        ['name' => $userData->name, 'password' => $userData->password]
                    );
                });
            }
        }

        return $next($request);
    }
}
