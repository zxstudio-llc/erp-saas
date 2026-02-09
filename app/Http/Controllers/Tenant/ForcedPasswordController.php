<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ForcedPasswordUpdateRequest;
use Inertia\Inertia;
use Illuminate\Http\RedirectResponse;

class ForcedPasswordController extends Controller
{
    public function update(ForcedPasswordUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();

        $user->update([
            'password' => bcrypt($request->password),
            'must_change_password' => false,
        ]);

        return redirect()->back(303);
    }
}

