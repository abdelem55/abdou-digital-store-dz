-- ============================================================================
-- Abdou Digital Store DZ - Complete Database Schema for Digital Subscriptions
-- Run this entire script inside Supabase SQL Editor
-- ============================================================================

create extension if not exists "pgcrypto";

-- 1. جدول إعدادات المتجر الرقمي
create table if not exists public.digital_store_settings (
  id smallint primary key default 1 check (id = 1),
  store_name text not null default 'Abdou Digital Store',
  tagline text not null default 'اشتراكاتك الرقمية الأصلية في الجزائر بتفعيل فوري وبالدينار الجزائري',
  whatsapp text not null default '213699501583',
  support_email text not null default 'abderrahmanlembarki@gmail.com',
  announcement text not null default '⚡ تسليم فوري للأكواد والحسابات بعد الدفع مباشرة عبر البطاقة الذهبية أو CIB!',
  updated_at timestamptz not null default now()
);

insert into public.digital_store_settings (id) values (1) on conflict (id) do nothing;

-- 2. جدول المنتجات والاشتراكات الرقمية
create table if not exists public.digital_products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category text not null default 'streaming', -- streaming, ai, design, gaming
  short_desc text not null,
  description text not null,
  image_url text not null,
  badge text,
  features text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 3. جدول باقات ومدد الاشتراك لكل منتج
create table if not exists public.digital_plans (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.digital_products(id) on delete cascade,
  account_type text not null, -- مثال: حساب مشترك (بروفايل خاص)، حساب خاص كامل، تفعيل على إيميلك الشخصي
  duration text not null,     -- مثال: شهر واحد، 3 أشهر، 6 أشهر، سنة كاملة
  price_dzd int not null check (price_dzd >= 0),
  original_price_dzd int,
  stock int not null default 50,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 4. جدول الطلبات الرقمية
create table if not exists public.digital_orders (
  id uuid primary key default gen_random_uuid(),
  public_token uuid unique not null default gen_random_uuid(),
  customer_name text not null,
  whatsapp_phone text not null,
  customer_email text not null,
  product_name text not null,
  plan_label text not null,
  quantity int not null default 1,
  total_dzd int not null,
  payment_method text not null default 'edahabia', -- edahabia, cib, whatsapp
  status text not null default 'pending',          -- pending, paid, delivered, cancelled
  chargily_checkout_id text,
  chargily_checkout_url text,
  delivered_credentials text, -- يضع فيه الأدمن كود التفعيل أو الإيميل والباسورد ليظهر للزبون في صفحة التتبع
  customer_note text,
  created_at timestamptz not null default now()
);

-- تفعيل الصلاحيات (RLS)
alter table public.digital_store_settings enable row level security;
alter table public.digital_products enable row level security;
alter table public.digital_plans enable row level security;
alter table public.digital_orders enable row level security;

-- سياسات القراءة العامة للزوار
drop policy if exists "Public read store settings" on public.digital_store_settings;
create policy "Public read store settings" on public.digital_store_settings for select using (true);

drop policy if exists "Public read active products" on public.digital_products;
create policy "Public read active products" on public.digital_products for select using (true);

drop policy if exists "Public read active plans" on public.digital_plans;
create policy "Public read active plans" on public.digital_plans for select using (true);

-- السماح للزوار بإنشاء طلب جديد وقراءة طلبهم عبر الرمز
drop policy if exists "Public insert orders" on public.digital_orders;
create policy "Public insert orders" on public.digital_orders for insert with check (true);

drop policy if exists "Public read orders" on public.digital_orders;
create policy "Public read orders" on public.digital_orders for select using (true);

-- السماح للمدير المسجل بتعديل جميع الجداول
drop policy if exists "Admin full access settings" on public.digital_store_settings;
create policy "Admin full access settings" on public.digital_store_settings for all to authenticated using (true) with check (true);

drop policy if exists "Admin full access products" on public.digital_products;
create policy "Admin full access products" on public.digital_products for all to authenticated using (true) with check (true);

drop policy if exists "Admin full access plans" on public.digital_plans;
create policy "Admin full access plans" on public.digital_plans for all to authenticated using (true) with check (true);

drop policy if exists "Admin full access orders" on public.digital_orders;
create policy "Admin full access orders" on public.digital_orders for all to authenticated using (true) with check (true);

-- ============================================================================
-- إضافة بيانات أولية جاهزة لاشتراكات (Netflix, Gemini Pro, Canva Pro, ChatGPT Plus, Spotify)
-- ============================================================================
insert into public.digital_products (slug, name, category, short_desc, description, image_url, badge, features)
values
  (
    'netflix-premium-4k',
    'اشتراك Netflix Premium 4K UHD',
    'streaming',
    'مشاهدة بجودة 4K Ultra HD مع ضمان كامل طوال مدة الاشتراك ودعم اللغة العربية.',
    'استمتع بمشاهدة أحدث الأفلام والمسلسلات العالمية على نتفليكس بأعلى جودة 4K UHD. يتوفر لدينا بروفايل خاص مقفل برقم سري (PIN) أو حساب كامل خاص بك مع ضمان كامل المدة.',
    'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=900&q=80',
    'الأكثر مبيعاً 🔥',
    ARRAY['جودة 4K Ultra HD أصلية', 'بروفايل خاص مقفل برقم PIN', 'ضمان كامل طوال فترة الاشتراك', 'يعمل على التلفاز والهاتف والحاسوب']
  ),
  (
    'gemini-advanced-pro',
    'اشتراك Google Gemini Advanced + 2TB',
    'ai',
    'أقوى نموذج ذكاء اصطناعي من جوجل مع مساحة تخزين سحابية 2 تيرابايت على Google One.',
    'احصل على اشتراك Gemini Advanced (Google One AI Premium) مع وصول كامل لأحدث نماذج الذكاء الاصطناعي التوليدي في البحث و Gmail و Docs بالإضافة إلى مساحة 2TB.',
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=900&q=80',
    'ذكاء اصطناعي 🤖',
    ARRAY['تفعيل رسمي على بريدك الشخصي Gmail', 'مساحة تخزين 2TB في Google Drive', 'دمج الذكاء الاصطناعي في Docs و Gmail', 'ضمان رسمي طوال فترة الاشتراك']
  ),
  (
    'canva-pro-official',
    'اشتراك Canva Pro الرسمي للمصممين',
    'design',
    'تفعيل رسمي على إيميلك الشخصي مع فتح جميع القوالب والخطوط العربية وأدوات الذكاء الاصطناعي.',
    'صمّم باحترافية عالية مع اشتراك كانفا برو الرسمي. يتم التفعيل مباشرة على حسابك الشخصي عبر دعوة رسمية دون الحاجة لكلمة المرور الخاصة بك، مع فتح كافة العناصر المدفوعة وإزالة الخلفية بضغطة زر.',
    'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=900&q=80',
    'تفعيل على إيميلك 🎨',
    ARRAY['تفعيل مباشر على إيميلك الشخصي', 'أكثر من 100 مليون قالب وعنصر مدفوع', 'أدوات Magic Studio بالذكاء الاصطناعي', 'دعم كامل للخطوط العربية الاحترافية']
  ),
  (
    'chatgpt-plus-4o',
    'اشتراك ChatGPT Plus (GPT-4o)',
    'ai',
    'وصول غير محدود لنماذج OpenAI المتقدمة وتوليد الصور بـ DALL-E 3 وتحليل الملفات.',
    'اشتراك ChatGPT Plus يمنحك أولوية الوصول في أوقات الذروة، واستخدام أحدث نماذج التفكير والبرمجة وتوليد الصور وتحليل ملفات PDF والبيانات المعقدة بسرعة فائقة.',
    'https://images.unsplash.com/photo-1684163761883-60110c0b3b1e?auto=format&fit=crop&w=900&q=80',
    'للدراسة والبرمجة ⚡',
    ARRAY['وصول كامل لأحدث نماذج OpenAI', 'توليد صور احترافية عبر DALL-E', 'رفع وتحليل الملفات والصور', 'تسليم سريع مع ضمان كامل']
  ),
  (
    'spotify-premium-individual',
    'اشتراك Spotify Premium بدون إعلانات',
    'streaming',
    'استماع للموسيقى والبودكاست بجودة عالية بدون إعلانات مع إمكانية التحميل للاستماع بدون إنترنت.',
    'فعّل سبوتيفاي بريميوم على حسابك الشخصي أو احصل على حساب جاهز، واستمتع بملايين المقاطع الصوتية والبودكاست بدون أي فواصل إعلانية مع ميزة التحميل.',
    'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?auto=format&fit=crop&w=900&q=80',
    'بدون إعلانات 🎧',
    ARRAY['تفعيل على حسابك أو حساب جديد', 'بدون إعلانات نهائياً', 'تحميل المقاطع للاستماع أوفلاين', 'جودة صوت فائقة النقاء']
  )
on conflict (slug) do nothing;

-- إدراج الباقات والمدد لكل منتج
do $$
declare
  v_netflix uuid;
  v_gemini uuid;
  v_canva uuid;
  v_chatgpt uuid;
  v_spotify uuid;
begin
  select id into v_netflix from public.digital_products where slug = 'netflix-premium-4k';
  select id into v_gemini from public.digital_products where slug = 'gemini-advanced-pro';
  select id into v_canva from public.digital_products where slug = 'canva-pro-official';
  select id into v_chatgpt from public.digital_products where slug = 'chatgpt-plus-4o';
  select id into v_spotify from public.digital_products where slug = 'spotify-premium-individual';

  if v_netflix is not null and not exists (select 1 from public.digital_plans where product_id = v_netflix) then
    insert into public.digital_plans (product_id, account_type, duration, price_dzd, original_price_dzd, stock) values
      (v_netflix, 'بروفايل خاص (مشترك)', 'شهر واحد', 800, 1200, 50),
      (v_netflix, 'بروفايل خاص (مشترك)', '3 أشهر', 2200, 3000, 30),
      (v_netflix, 'بروفايل خاص (مشترك)', 'سنة كاملة', 7500, 10000, 15),
      (v_netflix, 'حساب كامل خاص (5 شاشات)', 'شهر واحد', 3200, 4000, 20);
  end if;

  if v_gemini is not null and not exists (select 1 from public.digital_plans where product_id = v_gemini) then
    insert into public.digital_plans (product_id, account_type, duration, price_dzd, original_price_dzd, stock) values
      (v_gemini, 'تفعيل على إيميلك الشخصي', 'شهر واحد', 1500, 2500, 40),
      (v_gemini, 'تفعيل على إيميلك الشخصي', '3 أشهر', 4000, 6500, 25),
      (v_gemini, 'تفعيل على إيميلك الشخصي', 'سنة كاملة', 12000, 18000, 10);
  end if;

  if v_canva is not null and not exists (select 1 from public.digital_plans where product_id = v_canva) then
    insert into public.digital_plans (product_id, account_type, duration, price_dzd, original_price_dzd, stock) values
      (v_canva, 'تفعيل رسمي على إيميلك', 'شهر واحد', 600, 1000, 100),
      (v_canva, 'تفعيل رسمي على إيميلك', 'سنة كاملة', 2500, 4500, 100);
  end if;

  if v_chatgpt is not null and not exists (select 1 from public.digital_plans where product_id = v_chatgpt) then
    insert into public.digital_plans (product_id, account_type, duration, price_dzd, original_price_dzd, stock) values
      (v_chatgpt, 'حساب مشترك مستقر', 'شهر واحد', 1400, 2000, 40),
      (v_chatgpt, 'حساب خاص كامل (أو تفعيل شخصي)', 'شهر واحد', 4800, 5800, 20);
  end if;

  if v_spotify is not null and not exists (select 1 from public.digital_plans where product_id = v_spotify) then
    insert into public.digital_plans (product_id, account_type, duration, price_dzd, original_price_dzd, stock) values
      (v_spotify, 'تفعيل على إيميلك الشخصي', 'شهر واحد', 900, 1300, 40),
      (v_spotify, 'تفعيل على إيميلك الشخصي', '3 أشهر', 2400, 3500, 30),
      (v_spotify, 'تفعيل على إيميلك الشخصي', 'سنة كاملة', 7500, 11000, 15);
  end if;
end $$;
