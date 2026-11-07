import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Check, CreditCard, ShieldCheck, Zap, MessageCircle, ArrowRight } from 'lucide-react';
import { fetchProductBySlug, createDigitalOrder } from '../lib/api';
import { DigitalProduct, DigitalPlan } from '../lib/supabase';

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<DigitalProduct | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<DigitalPlan | null>(null);
  const [quantity, setQuantity] = useState(1);

  // حقول استلام الاشتراك الرقمي (بدون ولاية أو بلدية أو عنوان توصيل)
  const [customerName, setCustomerName] = useState('');
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'edahabia' | 'cib' | 'whatsapp'>('edahabia');
  const [customerNote, setCustomerNote] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetchProductBySlug(slug).then((found) => {
      setProduct(found);
      if (found && found.plans.length > 0) {
        setSelectedPlan(found.plans[0]);
      }
    });
  }, [slug]);

  if (!product) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <p className="text-lg text-slate-400">جاري تحميل تفاصيل الاشتراك...</p>
      </div>
    );
  }

  // استخراج أنواع الحسابات الفريدة والمدد المتوفرة
  const accountTypes = Array.from(new Set(product.plans.map((p) => p.account_type)));
  const currentAccountType = selectedPlan?.account_type || accountTypes[0];
  const plansForAccountType = product.plans.filter((p) => p.account_type === currentAccountType);

  const totalAmount = (selectedPlan?.price_dzd || 0) * quantity;

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    setSubmitting(true);
    setError(null);

    try {
      const planLabel = `${selectedPlan.account_type} — ${selectedPlan.duration}`;
      const { order, checkout_url } = await createDigitalOrder({
        customer_name: customerName.trim(),
        whatsapp_phone: whatsappPhone.trim(),
        customer_email: customerEmail.trim(),
        product_name: product.name,
        plan_label: planLabel,
        quantity,
        total_dzd: totalAmount,
        payment_method: paymentMethod,
        customer_note: customerNote.trim() || undefined,
      });

      // إذا اختار الدفع عبر واتساب مباشرة
      if (paymentMethod === 'whatsapp') {
        const storeWa = import.meta.env.VITE_STORE_WHATSAPP || '213699501583';
        const msg = encodeURIComponent(
          `مرحباً، أريد شراء اشتراك:
` +
          `- الخدمة: ${product.name}
` +
          `- الباقة: ${planLabel}
` +
          `- المبلغ: ${totalAmount} د.ج
` +
          `- الإيميل: ${customerEmail}
` +
          `- رمز الطلب: ${order.public_token}`
        );
        window.open(`https://wa.me/${storeWa}?text=${msg}`, '_blank');
        navigate(`/order/${order.public_token}`);
        return;
      }

      // إذا أعادت دالة Chargily Pay رابط الدفع، نحوله مباشرة للدفع بالبطاقة الذهبية أو CIB
      if (checkout_url) {
        window.location.href = checkout_url;
        return;
      }

      // إذا لم تكن دالة Edge Function مفعلة بعد، نوجهه لصفحة الطلب مع تفاصيل الطلب
      navigate(`/order/${order.public_token}`);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إنشاء الطلب.');
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
      >
        <ArrowRight className="h-4 w-4" />
        <span>العودة إلى قائمة الاشتراكات</span>
      </Link>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* تفاصيل المنتج واختيار الباقة */}
        <div className="lg:col-span-6 space-y-6">
          <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
            <img
              src={product.image_url}
              alt={product.name}
              className="h-64 sm:h-80 w-full object-cover"
            />
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            {product.badge && (
              <span className="inline-block rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-400">
                {product.badge}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{product.name}</h1>
            <p className="text-sm text-slate-300 leading-relaxed">{product.description}</p>

            <div className="border-t border-slate-800 pt-4">
              <h3 className="text-sm font-bold text-white mb-3">مميزات وضمان الاشتراك:</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {product.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                    <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* اختيار نوع الحساب والمدة + استمارة الدفع الإلكتروني */}
        <div className="lg:col-span-6">
          <form
            onSubmit={handleOrderSubmit}
            className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-xl space-y-6"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs text-slate-400">السعر حسب الباقة المختارة</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-extrabold text-white">
                    {totalAmount.toLocaleString()}
                  </span>
                  <span className="text-sm font-bold text-brand-400">د.ج</span>
                  {selectedPlan?.original_price_dzd && (
                    <span className="text-sm text-slate-500 line-through mr-2">
                      {(selectedPlan.original_price_dzd * quantity).toLocaleString()} د.ج
                    </span>
                  )}
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 text-xs font-bold text-emerald-400">
                <Zap className="h-3.5 w-3.5" />
                متوفر للتسليم الفوري
              </span>
            </div>

            {/* 1. اختيار نوع الحساب / التفعيل */}
            <div>
              <label className="block text-sm font-bold text-white mb-2.5">
                1. اختر نوع الحساب / التفعيل:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {accountTypes.map((accType) => {
                  const isSelected = currentAccountType === accType;
                  return (
                    <button
                      key={accType}
                      type="button"
                      onClick={() => {
                        const firstMatch = product.plans.find((p) => p.account_type === accType);
                        if (firstMatch) setSelectedPlan(firstMatch);
                      }}
                      className={`rounded-xl border p-3.5 text-right text-xs sm:text-sm font-bold transition ${
                        isSelected
                          ? 'border-brand-500 bg-brand-600/20 text-white shadow-sm'
                          : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {accType}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. اختيار مدة الاشتراك */}
            <div>
              <label className="block text-sm font-bold text-white mb-2.5">
                2. اختر مدة الاشتراك:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {plansForAccountType.map((plan) => {
                  const isSelected = selectedPlan?.id === plan.id;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlan(plan)}
                      className={`flex flex-col items-center justify-center rounded-xl border p-3 transition ${
                        isSelected
                          ? 'border-brand-500 bg-brand-600/20 text-white'
                          : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-sm font-extrabold">{plan.duration}</span>
                      <span className="mt-1 text-xs text-brand-400 font-bold">
                        {plan.price_dzd.toLocaleString()} د.ج
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. بيانات استلام الاشتراك (بدون ولايات وبدون توصيل) */}
            <div className="space-y-4 border-t border-slate-800 pt-5">
              <h3 className="text-base font-extrabold text-white">
                3. معلومات استلام الاشتراك (تسليم رقمي فوري)
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  الاسم الكامل *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="أدخل اسمك ولقبك"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    رقم الهاتف (واتساب لاستلام الحساب) *
                  </label>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    value={whatsappPhone}
                    onChange={(e) => setWhatsappPhone(e.target.value)}
                    placeholder="0555 12 34 56"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-brand-500 focus:outline-none text-right"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    البريد الإلكتروني (لتفعيل الاشتراك) *
                  </label>
                  <input
                    type="email"
                    required
                    dir="ltr"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-brand-500 focus:outline-none text-right"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  ملاحظة إضافية (اختياري)
                </label>
                <input
                  type="text"
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  placeholder="مثال: أريد التفعيل على حسابي الحالي..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            {/* 4. وسيلة الدفع عبر Chargily Pay */}
            <div className="space-y-3 border-t border-slate-800 pt-5">
              <label className="block text-sm font-extrabold text-white">
                4. اختر وسيلة الدفع:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('edahabia')}
                  className={`flex flex-col items-center justify-center rounded-xl border p-3.5 text-xs font-bold transition ${
                    paymentMethod === 'edahabia'
                      ? 'border-amber-400 bg-amber-400/10 text-amber-300'
                      : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <CreditCard className="h-5 w-5 mb-1 text-amber-400" />
                  <span>البطاقة الذهبية</span>
                  <span className="text-[10px] text-slate-400">EDAHABIA (Chargily)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cib')}
                  className={`flex flex-col items-center justify-center rounded-xl border p-3.5 text-xs font-bold transition ${
                    paymentMethod === 'cib'
                      ? 'border-sky-400 bg-sky-400/10 text-sky-300'
                      : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <CreditCard className="h-5 w-5 mb-1 text-sky-400" />
                  <span>بطاقة بنكية CIB</span>
                  <span className="text-[10px] text-slate-400">SATIM (Chargily)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('whatsapp')}
                  className={`flex flex-col items-center justify-center rounded-xl border p-3.5 text-xs font-bold transition ${
                    paymentMethod === 'whatsapp'
                      ? 'border-emerald-400 bg-emerald-400/10 text-emerald-300'
                      : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <MessageCircle className="h-5 w-5 mb-1 text-emerald-400" />
                  <span>طلب عبر واتساب</span>
                  <span className="text-[10px] text-slate-400">BaridiMob / CCP</span>
                </button>
              </div>
            </div>

            {/* الملخص النهائي (0 د.ج شحن) */}
            <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 space-y-2 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>الباقة المختارة:</span>
                <span className="text-white font-semibold">
                  {selectedPlan?.account_type} ({selectedPlan?.duration})
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>التسليم الرقمي (إيميل + واتساب):</span>
                <span className="text-emerald-400 font-bold">مجاني فوري (0 د.ج)</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2 text-base font-extrabold text-white">
                <span>المجموع النهائي للدفع:</span>
                <span className="text-brand-400">{totalAmount.toLocaleString()} د.ج</span>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-brand-600 py-4 text-base font-extrabold text-white shadow-lg shadow-brand-600/30 hover:bg-brand-500 transition disabled:opacity-50"
            >
              {submitting
                ? 'جاري معالجة الطلب...'
                : paymentMethod === 'whatsapp'
                ? `إرسال الطلب عبر واتساب (${totalAmount.toLocaleString()} د.ج)`
                : `ادفع الآن (${totalAmount.toLocaleString()} د.ج) عبر Chargily Pay`}
            </button>

            <p className="flex items-center justify-center gap-2 text-center text-xs text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>دفع مشفر وآمن 100% — تحصل على رمز تتبع واستلام فوري لاشتراكك</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
