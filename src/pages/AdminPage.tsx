import React, { useEffect, useState } from 'react';
import { supabase, DigitalOrder } from '../lib/supabase';
import { Check, KeyRound, RefreshCw } from 'lucide-react';

export function AdminPage() {
  const [orders, setOrders] = useState<DigitalOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [credentialsInput, setCredentialsInput] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    if (!supabase) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from('digital_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setOrders(data as DigitalOrder[]);
      const initialMap: Record<string, string> = {};
      data.forEach((o: any) => {
        initialMap[o.id] = o.delivered_credentials || '';
      });
      setCredentialsInput(initialMap);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleDeliverOrder = async (orderId: string) => {
    if (!supabase) return;
    setSavingId(orderId);
    await supabase
      .from('digital_orders')
      .update({
        status: 'delivered',
        delivered_credentials: credentialsInput[orderId] || '',
      })
      .eq('id', orderId);
    await loadOrders();
    setSavingId(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-white">لوحة إدارة طلبات الاشتراكات الرقمية</h1>
          <p className="text-xs text-slate-400 mt-1">
            يمكنك من هنا مراجعة الطلبات وإرسال بيانات الحساب أو كود التفعيل ليظهر للزبون فوراً في صفحة التتبع
          </p>
        </div>
        <button
          onClick={loadOrders}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
        >
          <RefreshCw className="h-4 w-4" />
          <span>تحديث القائمة</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400">جاري تحميل الطلبات...</div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center text-slate-400">
          لا توجد طلبات مسجلة حتى الآن، أو لم يتم ربط متغيرات Supabase في Vercel بعد.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-sm font-extrabold text-white">{order.product_name}</span>
                  <span className="mx-2 text-slate-600">|</span>
                  <span className="text-xs font-bold text-brand-400">{order.plan_label}</span>
                  <div className="text-xs text-slate-400 mt-1">
                    الزبون: <strong className="text-slate-200">{order.customer_name}</strong> — واتساب:{' '}
                    <strong className="text-slate-200" dir="ltr">{order.whatsapp_phone}</strong> — الإيميل:{' '}
                    <strong className="text-slate-200">{order.customer_email}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-extrabold text-emerald-400">
                    {order.total_dzd.toLocaleString()} د.ج ({order.payment_method.toUpperCase()})
                  </span>
                  <span className="rounded-lg bg-slate-800 px-3 py-1 text-xs font-bold text-slate-200">
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    <KeyRound className="inline h-3.5 w-3.5 ml-1 text-brand-400" />
                    بيانات الحساب / كود التفعيل المرسل للزبون:
                  </label>
                  <textarea
                    rows={2}
                    value={credentialsInput[order.id] || ''}
                    onChange={(e) =>
                      setCredentialsInput({ ...credentialsInput, [order.id]: e.target.value })
                    }
                    placeholder="اكتب هنا الإيميل وكلمة المرور أو رابط الدعوة ليظهر للزبون في صفحة التتبع..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => handleDeliverOrder(order.id)}
                  disabled={savingId === order.id}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white hover:bg-emerald-500 transition shrink-0"
                >
                  <Check className="h-4 w-4" />
                  <span>{savingId === order.id ? 'جاري الحفظ...' : 'حفظ وتسليم الاشتراك'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
