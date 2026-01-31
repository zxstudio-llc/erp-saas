<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;
use Symfony\Component\HttpFoundation\Response;

class HandleAppearance
{
    public function handle(Request $request, Closure $next): Response
    {
        $appearance = 'system';

        if ($request->cookies && is_string($request->cookies->get('appearance'))) {
            $appearance = $request->cookies->get('appearance');
        }

        View::share('appearance', $appearance);

        return $next($request);
    }
}
