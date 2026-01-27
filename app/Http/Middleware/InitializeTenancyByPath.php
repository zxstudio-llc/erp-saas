<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Stancl\Tenancy\Tenancy;
use Stancl\Tenancy\Resolvers\PathTenantResolver;
use Symfony\Component\HttpFoundation\Response;

class InitializeTenancyByPath
{
    protected $tenancy;
    protected $resolver;

    public function __construct(Tenancy $tenancy, PathTenantResolver $resolver)
    {
        $this->tenancy = $tenancy;
        $this->resolver = $resolver;
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $segments = $request->segments();
        
        if (empty($segments)) {
            return $next($request);
        }

        $slug = $segments[0];

        $tenant = $this->resolver->resolve($slug);

        if ($tenant) {
            $this->tenancy->initialize($tenant);
        }

        return $next($request);
    }
}