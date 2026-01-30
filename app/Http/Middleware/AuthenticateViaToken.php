<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\PersonalAccessToken;

class AuthenticateViaToken
{
    public function handle(Request $request, Closure $next)
    {
        if (! Auth::check()) {
            $tokenValue = $request->query('token');

            if (is_string($tokenValue) && $tokenValue !== '') {
                $accessToken = PersonalAccessToken::findToken($tokenValue);

                if ($accessToken && $accessToken->tokenable) {
                    Auth::login($accessToken->tokenable);
                }
            }
        }

        return $next($request);
    }
}