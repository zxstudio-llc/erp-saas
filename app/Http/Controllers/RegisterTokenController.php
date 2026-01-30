<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Support\Facades\Auth;

class RegisterTokenController extends Controller
{
    public function viaToken(Request $request)
    {
        $tokenValue = $request->query('token');

        abort_if(! is_string($tokenValue) || $tokenValue === '', 404);

        $token = PersonalAccessToken::findToken($tokenValue);

        abort_if(! $token || ! $token->tokenable, 403);

        Auth::login($token->tokenable);

        return redirect()->to(
            '/' . $request->query('tenant') . '/register'
        );
    }
}
