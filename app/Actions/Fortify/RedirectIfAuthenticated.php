<?php

namespace App\Actions\Fortify;

use Closure;
use Illuminate\Http\Request;
use App\Models\Tenant;

class RedirectIfAuthenticated
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->user()) {
            
            $tenant = Tenant::whereHas('domains', function ($query) use ($request) {
                $query->where('tenant_id', $request->user()->tenant_id ?? null);
            })->first();

            if ($tenant) {
                return redirect("/{$tenant->slug}/dashboard");
            }

            return redirect('/dashboard');
        }

        return $next($request);
    }
}