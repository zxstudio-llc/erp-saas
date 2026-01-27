<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class CustomerController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Customer::query();

        if ($search = $request->input('search')) {
            $query->where(function($q) use ($search) {
                $q->where('identification', 'like', "%{$search}%")
                  ->orWhere('business_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->has('active')) {
            $query->where('active', $request->boolean('active'));
        }

        $customers = $query->withCount('invoices')
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('customers/index', [
            'customers' => $customers,
            'filters' => $request->only(['search', 'active'])
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('customers/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'identification_type' => 'required|in:RUC,CI,Pasaporte',
            'identification' => [
                'required',
                'string',
                'unique:customers,identification',
                function ($attribute, $value, $fail) use ($request) {
                    if ($request->identification_type === 'RUC' && strlen($value) !== 13) {
                        $fail('El RUC debe tener 13 dígitos.');
                    }
                    if ($request->identification_type === 'CI' && strlen($value) !== 10) {
                        $fail('La cédula debe tener 10 dígitos.');
                    }
                },
            ],
            'business_name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'active' => 'boolean',
        ]);

        $customer = Customer::create($validated);

        return redirect()
            ->route('customers.show', $customer)
            ->with('success', 'Cliente creado exitosamente.');
    }

    public function show(Customer $customer): Response
    {
        $customer->load(['invoices' => fn($q) => $q->latest()->take(20)]);

        return Inertia::render('customers/show', [
            'customer' => $customer,
            'stats' => [
                'total_invoices' => $customer->invoices()->count(),
                'total_amount' => $customer->invoices()
                    ->where('status', 'authorized')
                    ->sum('total'),
                'pending_invoices' => $customer->invoices()
                    ->whereIn('status', ['offline_pending', 'sent'])
                    ->count(),
            ]
        ]);
    }

    public function edit(Customer $customer): Response
    {
        return Inertia::render('customers/edit', [
            'customer' => $customer
        ]);
    }

    public function update(Request $request, Customer $customer): RedirectResponse
    {
        $validated = $request->validate([
            'identification_type' => 'required|in:RUC,CI,Pasaporte',
            'identification' => [
                'required',
                'string',
                'unique:customers,identification,' . $customer->id,
                function ($attribute, $value, $fail) use ($request) {
                    if ($request->identification_type === 'RUC' && strlen($value) !== 13) {
                        $fail('El RUC debe tener 13 dígitos.');
                    }
                    if ($request->identification_type === 'CI' && strlen($value) !== 10) {
                        $fail('La cédula debe tener 10 dígitos.');
                    }
                },
            ],
            'business_name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'active' => 'boolean',
        ]);

        $customer->update($validated);

        return redirect()
            ->route('customers.show', $customer)
            ->with('success', 'Cliente actualizado exitosamente.');
    }

    public function destroy(Customer $customer): RedirectResponse
    {
        if ($customer->invoices()->exists()) {
            return back()->with('error', 'No se puede eliminar un cliente con facturas.');
        }

        $customer->delete();

        return redirect()
            ->route('customers.index')
            ->with('success', 'Cliente eliminado exitosamente.');
    }

    public function search(Request $request)
    {
        $request->validate(['q' => 'required|string|min:2']);

        $customers = Customer::where('active', true)
            ->where(function($q) use ($request) {
                $search = $request->input('q');
                $q->where('identification', 'like', "%{$search}%")
                  ->orWhere('business_name', 'like', "%{$search}%");
            })
            ->limit(10)
            ->get(['id', 'identification', 'business_name', 'identification_type']);

        return response()->json($customers);
    }

    public function toggle(Customer $customer): RedirectResponse
    {
        $customer->update(['active' => !$customer->active]);

        $status = $customer->active ? 'activado' : 'desactivado';
        
        return back()->with('success', "Cliente {$status} exitosamente.");
    }
}
