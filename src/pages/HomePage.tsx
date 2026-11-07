import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, CreditCard, Headphones, Check, ArrowLeft } from 'lucide-react';
import { fetchProducts } from '../lib/api';
import { DigitalProduct } from '../lib/supabase';

const CATEGORIES = [
  { id: 'all', label: 'جميع الاشتراكات' },
  { id: 'streaming', label: 'أفلام وموسيقى (Netflix / Spotify)' },
  { id: 'ai', label: 'ذكاء اصطناعي (Gemini / ChatGPT)' },
  { id: 'design', label: 'تصميم وإنتاجية (Canva Pro)' },
];

export function HomePage() {
  const [products, setProducts] = useState<DigitalProduct[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  const filtered =
    activeCategory === 'all'
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-brand-900/40 p-8 sm:p-12 mb-12">
        <div className="max-w-2xl space-y-5">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-bold text-brand-100">
            ⚡ تسليم رقمي فوري في الجزائر — 0 د.ج رسوم توصيل
          </span>
          <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-5xl">
            جميع اشتراكاتك الرقمية المفضلة <span className="text-brand-500">بالدينار الجزائري</span>
          </h1>
          <p className="text-base text-slate-300 sm:text-lg leading-relaxed">
            احصل على اشتراكات Netflix 4K و Gemini Pro و Canva Pro و ChatGPT Plus بتفعيل فوري ومضمون. ادفع بسهولة وأمان عبر البطاقة الذهبية (EDAHABIA) أو بطاقة CIB واستلم اشتراكك على بريدك الإلكتروني أو واتساب دون انتظار!
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href="#catalogue"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-600/30 hover:bg-brand-500 transition"
            >
              <span>تصفح الباقات والأسعار</span>
              <ArrowLeft className="h-4 w-4" />
            </a>
            <Link
              to="/track"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-3.5 text-sm font-bold text-slate-200 hover:border-slate-500 transition"
            >
              استلام وتتبع طلبك
            </Link>
          </div>
        </div>
      </section>

      {/* المزايا */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-12">
        <div className="flex items-start gap-3.5 rounded-2xl border border-slate-800/90 bg-slate-900/50 p-5">
          <Zap className="h-6 w-6 shrink-0 text-amber-400" />
          <div>
            <h3 className="font-bold text-white text-sm">تسليم رقمي فوري</h3>
            <p className="mt-1 text-xs text-slate-400">بدون شحن ولا انتظار ولايات؛ يصلك الحساب أو التفعيل مباشرة.</p>
          </div>
        </div>
        <div className="flex items-start gap-3.5 rounded-2xl border border-slate-800/90 bg-slate-900/50 p-5">
          <CreditCard className="h-6 w-6 shrink-0 text-brand-500" />
          <div>
            <h3 className="font-bold text-white text-sm">دفع بالذهبية و CIB</h3>
            <p className="mt-1 text-xs text-slate-400">دفع إلكتروني آمن ومعتمد عبر بوابة Chargily Pay V2 بالدينار.</p>
          </div>
        </div>
        <div className="flex items-start gap-3.5 rounded-2xl border border-slate-800/90 bg-slate-900/50 p-5">
          <ShieldCheck className="h-6 w-6 shrink-0 text-emerald-400" />
          <div>
            <h3 className="font-bold text-white text-sm">ضمان كامل المدة</h3>
            <p className="mt-1 text-xs text-slate-400">اشتراكات رسمية ومضمونة 100% طوال فترة باقتك المختارة.</p>
          </div>
        </div>
        <div className="flex items-start gap-3.5 rounded-2xl border border-slate-800/90 bg-slate-900/50 p-5">
          <Headphones className="h-6 w-6 shrink-0 text-sky-400" />
          <div>
            <h3 className="font-bold text-white text-sm">دعم فني عبر واتساب</h3>
            <p className="mt-1 text-xs text-slate-400">فريقنا متواجد لمساعدتك في التفعيل والرد على استفساراتك.</p>
          </div>
        </div>
      </section>

      {/* تصنيف الاشتراكات */}
      <section id="catalogue" className="scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-white">اختر اشتراكك الرقمي</h2>
            <p className="text-sm text-slate-400 mt-1">اختر الخدمة ثم حدد نوع الحساب ومدة الاشتراك التي تناسبك</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                  activeCategory === cat.id
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25'
                    : 'border border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400">جاري تحميل الباقات الرقمية...</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((product) => {
              const minPrice =
                product.plans.length > 0
                  ? Math.min(...product.plans.map((pl) => pl.price_dzd))
                  : 0;

              return (
                <Link
                  key={product.id}
                  to={`/product/${product.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 hover:border-brand-500/60 transition shadow-sm"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-slate-800">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    {product.badge && (
                      <span className="absolute top-3 right-3 rounded-lg bg-slate-950/90 backdrop-blur px-3 py-1 text-xs font-bold text-amber-400 border border-amber-400/30">
                        {product.badge}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <h3 className="text-lg font-extrabold text-white group-hover:text-brand-400 transition">
                        {product.name}
                      </h3>
                      <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {product.short_desc}
                      </p>

                      <ul className="mt-4 space-y-1.5">
                        {product.features.slice(0, 3).map((feat, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs text-slate-300">
                            <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">
                      <div>
                        <span className="block text-[11px] text-slate-400">يبدأ من</span>
                        <span className="text-xl font-extrabold text-white">
                          {minPrice.toLocaleString()} <span className="text-xs font-normal text-brand-400">د.ج</span>
                        </span>
                      </div>
                      <span className="rounded-xl bg-brand-600/20 border border-brand-500/40 px-4 py-2 text-xs font-bold text-brand-300 group-hover:bg-brand-600 group-hover:text-white transition">
                        اختر الباقة واشترِ الآن
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
