import { supabase, FALLBACK_PRODUCTS, DigitalProduct, DigitalOrder } from './supabase';

export async function fetchProducts(): Promise<DigitalProduct[]> {
  if (!supabase) return FALLBACK_PRODUCTS;

  try {
    const { data: products, error: prodErr } = await supabase
      .from('digital_products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (prodErr || !products || products.length === 0) {
      return FALLBACK_PRODUCTS;
    }

    const { data: plans } = await supabase
      .from('digital_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_dzd', { ascending: true });

    return products.map((p: any) => ({
      ...p,
      features: Array.isArray(p.features) ? p.features : [],
      plans: (plans || []).filter((pl: any) => pl.product_id === p.id),
    }));
  } catch {
    return FALLBACK_PRODUCTS;
  }
}

export async function fetchProductBySlug(slug: string): Promise<DigitalProduct | null> {
  const all = await fetchProducts();
  return all.find((p) => p.slug === slug) || null;
}

export async function createDigitalOrder(payload: {
  customer_name: string;
  whatsapp_phone: string;
  customer_email: string;
  product_name: string;
  plan_label: string;
  quantity: number;
  total_dzd: number;
  payment_method: 'edahabia' | 'cib' | 'whatsapp';
  customer_note?: string;
}): Promise<{ order: DigitalOrder; checkout_url?: string }> {
  // إذا لم يتم ربط Supabase بعد، نخزن الطلب محلياً للتجربة الفورية
  if (!supabase) {
    const fakeToken = crypto.randomUUID();
    const localOrder: DigitalOrder = {
      id: crypto.randomUUID(),
      public_token: fakeToken,
      ...payload,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    localStorage.setItem(`order_${fakeToken}`, JSON.stringify(localOrder));
    return { order: localOrder };
  }

  const { data: order, error } = await supabase
    .from('digital_orders')
    .insert({
      customer_name: payload.customer_name,
      whatsapp_phone: payload.whatsapp_phone,
      customer_email: payload.customer_email,
      product_name: payload.product_name,
      plan_label: payload.plan_label,
      quantity: payload.quantity,
      total_dzd: payload.total_dzd,
      payment_method: payload.payment_method,
      customer_note: payload.customer_note || null,
      status: 'pending',
    })
    .select('*')
    .single();

  if (error || !order) {
    throw new Error(error?.message || 'تعذر إنشاء الطلب في قاعدة البيانات');
  }

  if (payload.payment_method === 'edahabia' || payload.payment_method === 'cib') {
    try {
      const { data: fnData, error: fnErr } = await supabase.functions.invoke(
        'create-chargily-checkout',
        {
          body: {
            order_id: order.id,
            public_token: order.public_token,
            amount: payload.total_dzd,
            customer_name: payload.customer_name,
            phone: payload.whatsapp_phone,
            email: payload.customer_email,
            payment_method: payload.payment_method,
            description: `${payload.product_name} - ${payload.plan_label}`,
          },
        }
      );

      if (!fnErr && fnData?.checkout_url) {
        return { order, checkout_url: fnData.checkout_url };
      }
    } catch {
      // المتابعة إلى صفحة تتبع الطلب إذا لم تكن الدالة مفعلة بعد
    }
  }

  return { order };
}

export async function fetchOrderByToken(token: string): Promise<DigitalOrder | null> {
  const clean = token.trim();
  if (!clean) return null;

  const local = localStorage.getItem(`order_${clean}`);
  if (local) {
    return JSON.parse(local) as DigitalOrder;
  }

  if (!supabase) return null;

  const { data, error } = await supabase
    .from('digital_orders')
    .select('*')
    .eq('public_token', clean)
    .single();

  if (error || !data) return null;
  return data as DigitalOrder;
}
