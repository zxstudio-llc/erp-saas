import { PropsWithChildren } from 'react';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <Link href="/" className="text-2xl font-bold text-indigo-600">
                            ERP SaaS
                        </Link>
                        <nav className="flex gap-4">
                            <Link href="/login" className="text-gray-600 hover:text-gray-900">
                                Iniciar Sesión
                            </Link>
                            <Link href="/onboarding/plans" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                                Comenzar Gratis
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                {children}
            </main>

            <footer className="bg-white border-t mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-4">ERP SaaS</h3>
                            <p className="text-sm text-gray-600">
                                Sistema de facturación electrónica SRI Ecuador
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-4">Enlaces</h3>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="/onboarding/plans" className="text-gray-600 hover:text-gray-900">Planes</Link></li>
                                <li><a href="#" className="text-gray-600 hover:text-gray-900">Documentación</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-gray-900">Soporte</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="text-gray-600 hover:text-gray-900">Términos</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-gray-900">Privacidad</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t text-center text-sm text-gray-600">
                        © {new Date().getFullYear()} ERP SaaS. Todos los derechos reservados.
                    </div>
                </div>
            </footer>
        </div>
    );
}