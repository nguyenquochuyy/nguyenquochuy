import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <div className="absolute inset-0 bg-slate-900 z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1590402494587-44b71d7772f6?q=80&w=2832&auto=format&fit=crop"
          alt="Office background"
          className="h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-between p-12 text-white">
            <div>
                <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
                         U
                     </div>
                     <div>
                         <h1 className="text-xl font-bold tracking-tight">UniShop</h1>
                     </div>
                </div>
            </div>
            <div className="max-w-md">
                <h2 className="text-4xl font-bold tracking-tight">
                    Powering the next generation of commerce.
                </h2>
                <p className="mt-4 text-slate-300">
                    The all-in-one platform to manage your products, orders, and customer relationships with unparalleled efficiency.
                </p>
            </div>
            <div className="text-xs text-slate-500">
                &copy; 2024 UniShop Ecosystem. All rights reserved.
            </div>
        </div>
      </div>
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="w-full max-w-md space-y-8">
            <div>
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                    {title}
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    {subtitle}
                </p>
            </div>
            {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
