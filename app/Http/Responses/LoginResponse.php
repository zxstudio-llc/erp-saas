<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Illuminate\Http\JsonResponse;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request)
    {
        $user = $request->user();
        
        $tenant = $user->tenants()->first();

        if ($tenant) {
            return redirect("/{$tenant->slug}/dashboard");
        }

        return redirect()->intended('/dashboard');
    }
}