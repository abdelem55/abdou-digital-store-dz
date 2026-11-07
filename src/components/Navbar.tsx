import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Search, ShieldCheck, LayoutDashboard } from 'lucide-react';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="bg-gradient-to-r from-brand-700 via-indigo-600 to-brand-700 px-4 py-2 text-center text-xs sm:text-sm font-medium text-white">
        ⚡ تسليم فوري للاشتراكات الرقمية في الجزائر — الدفع عبر البطاقة الذهبية (EDAHABIA) و بطاقة CIB (0 د.ج توصيل)
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-600/30">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight text-white sm:text-xl">
              ABDOU <span className="text-brand-500">DIGITAL</span>
            </span>
            <span className="block text-[11px] text-slate-400">متجر الاشتراكات الرقمية — الجزائر</span>
          </div>
        </Link>

        <nav className="flex items-center gap-3 sm:gap-6 text-sm font-semibold">
          <Link to="/" className="text-slate-300 hover:text-white transition">
            الاشتراكات
          </Link>
          <Link
            to="/track"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-slate-200 hover:border-brand-500/50 hover:text-white transition"
          >
            <Search className="h-4 w-4 text-brand-500" />
            <span>تتبع واستلام اشتراكك</span>
          </Link>
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900/80 px-3 py-2 text-xs text-slate-400 hover:text-white transition"
            title="لوحة التحكم"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">الإدارة</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-800/80 bg-slate-950 py-12 text-sm text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <p className="font-bold text-white text-base">Abdou Digital Store DZ</p>
          <p className="mt-1 text-xs text-slate-400">
            جميع الاشتراكات أصلية ومضمونة طوال فترة الاشتراك — تسليم رقمي فوري بدون رسوم شحن.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <span>بوابة دفع إلكتروني آمنة عبر Chargily Pay (البطاقة الذهبية و CIB)</span>
        </div>
      </div>
    </footer>
  );
}
