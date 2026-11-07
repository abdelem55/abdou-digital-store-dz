import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Clock, Copy, KeyRound, MessageCircle, Search } from 'lucide-react';
import { fetchOrderByToken } from '../lib/api';
import { DigitalOrder } from '../lib/supabase';

export function TrackOrderPage() {
  const { token: routeToken } = useParams<{ token?: string }>();
  const [searchParams] = useSearchParams();
  const paymentStatus = searchParams.get('status');

  const [inputToken, setInputToken] = useState(routeToken || '');
  const [order, setOrder] = useState<DigitalOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadOrder = async (tok: string) => {
    if (!tok.trim()) return;
    setLoading(true);
    const data = await fetchOrderByToken(tok);
    setOrder(data);
    setLoading(false);
  };

  useEffect(() => {
    if (routeToken) {
      setInputToken(routeToken);
      loadOrder(routeToken);
    }
  }, [routeToken]);

  const copyToken = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const storeWa = import.meta.env.VITE_STORE_WHATSAPP || '213699501583';

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-extrabold text-white">تتبع واستلام اشتراكك الرقمي</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            أدخل رمز الطلب (Order Token) لعرض حالة الدفع واستلام بيانات التفعيل أو الحساب مباشرة
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadOrder(inputToken);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            dir="ltr"
            value={inputToken}
            onChange={(e) => setInputToken(e.target.value)}
            placeholder="أدخل رمز الطلب (مثال: 6c84fb90-12c4-...)"
            className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white font-mono focus:border-brand-500 focus:outline-none"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white hover:bg-brand-500 transition"
          >
            <Search className="h-4 w-4" />
            <span>بحث</span>
          </button>
        </form>

        {paymentStatus === 'success' && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300 font-bold text-center">
            🎉 تمت عملية الدفع عبر Chargily Pay بنجاح! سيتم تحديث بيانات اشتراكك في هذه الصفحة وإرسالها لبريدك.
          </div>
        )}

        {loading && (
          <div className="py-10 text-center text-sm text-slate-400">جاري البحث عن الطلب...</div>
        )}

        {!loading && order && (
          <div className="space-y-6 border-t border-slate-800 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-slate-950 p-5 border border-slate-800">
              <div>
                <span className="text-xs text-slate-400">الخدمة والباقة:</span>
                <h2 className="text-lg font-extrabold text-white mt-0.5">{order.product_name}</h2>
                <p className="text-xs text-brand-400 font-bold mt-0.5">{order.plan_label}</p>
              </div>

              <div className="flex items-center gap-2">
                {order.status === 'delivered' || order.status === 'paid' ? (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-4 py-2 text-xs font-extrabold text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    {order.status === 'delivered' ? 'تم تسليم الاشتراك' : 'مدفوع ومؤكد'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 px-4 py-2 text-xs font-extrabold text-amber-300">
                    <Clock className="h-4 w-4" />
                    قيد التفعيل / انتظار الدفع
                  </span>
                )}
              </div>
            </div>

            {/* صندوق بيانات الحساب أو كود التفعيل عند تسليمه من الأدمن */}
            {order.delivered_credentials ? (
              <div className="rounded-2xl border-2 border-emerald-500/50 bg-emerald-950/20 p-5 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
                  <KeyRound className="h-5 w-5" />
                  <span>بيانات تفعيل اشتراكك الجاهزة:</span>
                </div>
                <pre className="whitespace-pre-wrap rounded-xl bg-slate-950 p-4 font-mono text-sm text-white border border-slate-800">
                  {order.delivered_credentials}
                </pre>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 text-xs sm:text-sm text-slate-300 space-y-2">
                <p className="font-bold text-white">⏳ جاري تجهيز وتسليم بيانات الاشتراك الخاصة بك:</p>
                <p>
                  بمجرد تأكيد الدفع ستظهر بيانات الحساب أو كود التفعيل في هذا المربع مباشرة، كما سنرسلها لك عبر البريد الإلكتروني (<strong className="text-white">{order.customer_email}</strong>) والواتساب (<strong className="text-white">{order.whatsapp_phone}</strong>).
                </p>
              </div>
            )}

            {/* رمز التتبع للنسخ */}
            <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 flex items-center justify-between gap-3">
              <div className="overflow-hidden">
                <span className="block text-[11px] text-slate-400">رمز تتبع الطلب (انسخه واحتفظ به):</span>
                <span className="font-mono text-xs sm:text-sm text-slate-200 truncate block">
                  {order.public_token}
                </span>
              </div>
              <button
                type="button"
                onClick={() => copyToken(order.public_token)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800 shrink-0"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>{copied ? 'تم النسخ!' : 'نسخ الرمز'}</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="text-xs text-slate-400">
                المبلغ الإجمالي: <strong className="text-white">{order.total_dzd.toLocaleString()} د.ج</strong>
              </div>
              <a
                href={`https://wa.me/${storeWa}?text=${encodeURIComponent(
                  `مرحباً، أستفسر عن طلبي للاشتراك (${order.product_name}) برمز: ${order.public_token}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition"
              >
                <MessageCircle className="h-4 w-4" />
                <span>تواصل معنا عبر واتساب للتفعيل الفوري</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
