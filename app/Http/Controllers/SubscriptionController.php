<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use App\Models\Tenant;
use App\Models\Plan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class SubscriptionController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Subscription::with(['tenant', 'plan']);

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $subscriptions = $query->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('subscriptions/index', [
            'subscriptions' => $subscriptions,
            'filters' => $request->only(['status']),
            'stats' => [
                'total' => Subscription::count(),
                'active' => Subscription::where('status', 'active')->count(),
                'trial' => Subscription::where('status', 'trial')->count(),
                'suspended' => Subscription::where('status', 'suspended')->count(),
            ]
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('subscriptions/create', [
            'tenants' => Tenant::where('status', 'active')->get(['id', 'slug']),
            'plans' => Plan::where('active', true)->get()
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'tenant_id' => 'required|exists:tenants,id',
            'plan_id' => 'required|exists:plans,id',
            'status' => 'required|in:trial,active,suspended,cancelled',
            'started_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after:started_at',
        ]);

        $subscription = Subscription::create($validated);

        return redirect()
            ->route('subscriptions.show', $subscription)
            ->with('success', 'Suscripción creada exitosamente.');
    }

    public function show(Subscription $subscription): Response
    {
        $subscription->load(['tenant', 'plan']);

        $daysRemaining = null;
        if ($subscription->ends_at) {
            $daysRemaining = now()->diffInDays($subscription->ends_at, false);
        }

        return Inertia::render('subscriptions/show', [
            'subscription' => $subscription,
            'stats' => [
                'days_remaining' => $daysRemaining,
                'is_expired' => $subscription->ends_at && now()->isAfter($subscription->ends_at),
                'is_trial' => $subscription->status === 'trial',
            ]
        ]);
    }

    public function edit(Subscription $subscription): Response
    {
        return Inertia::render('subscriptions/edit', [
            'subscription' => $subscription->load(['tenant', 'plan']),
            'plans' => Plan::where('active', true)->get()
        ]);
    }

    public function update(Request $request, Subscription $subscription): RedirectResponse
    {
        $validated = $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'status' => 'required|in:trial,active,suspended,cancelled',
            'started_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after:started_at',
        ]);

        $subscription->update($validated);

        return redirect()
            ->route('subscriptions.show', $subscription)
            ->with('success', 'Suscripción actualizada exitosamente.');
    }

    public function destroy(Subscription $subscription): RedirectResponse
    {
        $subscription->delete();

        return redirect()
            ->route('subscriptions.index')
            ->with('success', 'Suscripción eliminada exitosamente.');
    }

    public function activate(Subscription $subscription): RedirectResponse
    {
        $subscription->update([
            'status' => 'active',
            'started_at' => $subscription->started_at ?? now(),
        ]);

        $subscription->tenant->activate();

        return back()->with('success', 'Suscripción activada exitosamente.');
    }

    public function suspend(Subscription $subscription): RedirectResponse
    {
        $subscription->update(['status' => 'suspended']);
        $subscription->tenant->suspend();

        return back()->with('success', 'Suscripción suspendida exitosamente.');
    }

    public function cancel(Subscription $subscription): RedirectResponse
    {
        $subscription->update([
            'status' => 'cancelled',
            'ends_at' => now(),
        ]);

        $subscription->tenant->suspend();

        return back()->with('success', 'Suscripción cancelada exitosamente.');
    }

    public function renew(Subscription $subscription): RedirectResponse
    {
        $plan = $subscription->plan;
        $endsAt = $subscription->ends_at ?? now();

        $newEndsAt = $plan->billing_cycle === 'monthly'
            ? $endsAt->addMonth()
            : $endsAt->addYear();

        $subscription->update([
            'status' => 'active',
            'ends_at' => $newEndsAt,
        ]);

        return back()->with('success', 'Suscripción renovada hasta ' . $newEndsAt->format('Y-m-d'));
    }

    public function changePlan(Request $request, Subscription $subscription): RedirectResponse
    {
        $validated = $request->validate([
            'plan_id' => 'required|exists:plans,id|different:' . $subscription->plan_id,
        ]);

        $newPlan = Plan::findOrFail($validated['plan_id']);

        $subscription->update([
            'plan_id' => $newPlan->id,
        ]);

        return back()->with('success', "Plan cambiado a {$newPlan->name}");
    }
}