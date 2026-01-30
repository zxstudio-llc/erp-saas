<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\{Hash, Auth};
use Illuminate\Http\Request;

class RegisterController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function show()
    {
        if (!Auth::check()) {
            return redirect('/login');
        }

        return Inertia::render('tenant/register', [
            'tenant' => tenant('slug'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = Auth::user();
        $user->update(['password' => Hash::make($validated['password'])]);

        return redirect()->route('tenant.dashboard', ['tenant' => tenant('slug')]);
    }
}
