<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $tenant = tenant(); // 👈 ESTA ES LA CLAVE

        return [
            ...parent::share($request),

            'name' => config('app.name'),

            'appearance' => $request->cookie('appearance', 'system'),

            'tenant' => $tenant
                ? [
                    'id' => $tenant->id,
                    'slug' => $tenant->slug,
                ]
                : null,

            'auth' => [
                'user' => Auth::check()
                    ? [
                        'id' => Auth::id(),
                        'name' => Auth::user()->name,
                        'email' => Auth::user()->email,
                    ]
                    : null,
            ],

            'sidebarOpen' =>
                ! $request->hasCookie('sidebar_state')
                || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
