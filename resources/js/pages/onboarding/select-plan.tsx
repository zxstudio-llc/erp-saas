import { Button } from '@/components/ui/button';
import GuestLayout from '@/layouts/guest-layout';
import { Link, Head } from '@inertiajs/react';

export default function SelectPlan({ plans }: { plans: any[] }) {
    return (
        <GuestLayout>
            <Head title="Seleccionar Plan" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Elige el plan perfecto para tu negocio
                        </h1>
                        <p className="text-xl text-gray-600">
                            Facturación electrónica SRI con 14 días de prueba gratis
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className="bg-white rounded-lg shadow-lg p-8 border-2 border-gray-200 hover:border-indigo-500 transition"
                            >
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    {plan.name}
                                </h3>
                                <div className="mb-6">
                                    <span className="text-4xl font-bold text-indigo-600">
                                        ${plan.price}
                                    </span>
                                    <span className="text-gray-600">
                                        /{plan.billing_cycle === 'monthly' ? 'mes' : 'año'}
                                    </span>
                                </div>

                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-center text-gray-700">
                                        <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        {plan.limits.max_users === -1 ? 'Usuarios ilimitados' : `${plan.limits.max_users} usuarios`}
                                    </li>
                                    <li className="flex items-center text-gray-700">
                                        <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        {plan.limits.max_invoices_month === -1 ? 'Facturas ilimitadas' : `${plan.limits.max_invoices_month} facturas/mes`}
                                    </li>
                                    <li className="flex items-center text-gray-700">
                                        <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        {plan.limits.max_companies === -1 ? 'Empresas ilimitadas' : `${plan.limits.max_companies} empresa(s)`}
                                    </li>
                                    <li className="flex items-center text-gray-700">
                                        <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        Facturación offline
                                    </li>
                                </ul>

                                <Link
                                    href="/onboarding/register"
                                    data={{ plan_id: plan.id }}
                                    className="block w-full"
                                >
                                    <Button variant="ghost" className="w-full">
                                        Comenzar Prueba Gratis
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>

                    <p className="text-center text-gray-600 mt-8">
                        Todos los planes incluyen 14 días de prueba gratis. Sin tarjeta de crédito requerida.
                    </p>
                </div>
            </div>
        </GuestLayout>
    );
}