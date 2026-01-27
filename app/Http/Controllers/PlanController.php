<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class PlanController extends Controller
{
    public function index(): Response
    {
        $plans = Plan::withCount('subscriptions')
            ->latest()
            ->paginate(15);

        return Inertia::render('plans/index', [
            'plans' => $plans
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('plans/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:50|unique:plans,slug|alpha_dash',
            'price' => 'required|numeric|min:0',
            'billing_cycle' => 'required|in:monthly,yearly',
            'limits' => 'required|array',
            'limits.max_users' => 'required|integer|min:-1',
            'limits.max_invoices_month' => 'required|integer|min:-1',
            'limits.max_companies' => 'required|integer|min:-1',
            'active' => 'boolean',
        ]);

        $plan = Plan::create($validated);

        return redirect()
            ->route('plans.show', $plan)
            ->with('success', 'Plan creado exitosamente.');
    }

    public function show(Plan $plan): Response
    {
        $plan->load(['subscriptions' => fn($q) => $q->latest()->take(20)]);

        return Inertia::render('plans/show', [
            'plan' => $plan,
            'stats' => [
                'total_subscriptions' => $plan->subscriptions()->count(),
                'active_subscriptions' => $plan->subscriptions()->where('status', 'active')->count(),
                'trial_subscriptions' => $plan->subscriptions()->where('status', 'trial')->count(),
                'monthly_revenue' => $plan->billing_cycle === 'monthly' 
                    ? $plan->subscriptions()->where('status', 'active')->count() * $plan->price
                    : 0,
            ]
        ]);
    }

    public function edit(Plan $plan): Response
    {
        return Inertia::render('plans/edit', [
            'plan' => $plan
        ]);
    }

    public function update(Request $request, Plan $plan): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:50|alpha_dash|unique:plans,slug,' . $plan->id,
            'price' => 'required|numeric|min:0',
            'billing_cycle' => 'required|in:monthly,yearly',
            'limits' => 'required|array',
            'limits.max_users' => 'required|integer|min:-1',
            'limits.max_invoices_month' => 'required|integer|min:-1',
            'limits.max_companies' => 'required|integer|min:-1',
            'active' => 'boolean',
        ]);

        $plan->update($validated);

        return redirect()
            ->route('plans.show', $plan)
            ->with('success', 'Plan actualizado exitosamente.');
    }

    public function destroy(Plan $plan): RedirectResponse
    {
        if ($plan->subscriptions()->whereIn('status', ['active', 'trial'])->exists()) {
            return back()->with('error', 'No se puede eliminar un plan con suscripciones activas.');
        }

        $plan->delete();

        return redirect()
            ->route('plans.index')
            ->with('success', 'Plan eliminado exitosamente.');
    }

    public function toggle(Plan $plan): RedirectResponse
    {
        $plan->update(['active' => !$plan->active]);

        return back()->with('success', 'Estado del plan actualizado.');
    }
}