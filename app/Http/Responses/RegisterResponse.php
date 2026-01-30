<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;

class RegisterResponse implements RegisterResponseContract
{
    public function toResponse($request)
    {
        $tenant = \App\Models\Tenant::whereHas('users', function($q) use ($request) {
            $q->where('users.id', $request->user()->id);
        })->first();

        $redirectUrl = $tenant 
            ? "/{$tenant->slug}/dashboard" 
            : "/dashboard";

        return $request->wantsJson()
            ? response()->json(['redirect' => $redirectUrl])
            : redirect($redirectUrl);
    }
}