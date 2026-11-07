import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface DigitalPlan {
  id: string;
  product_id: string;
  account_type: string;
  duration: string;
  price_dzd: number;
  original_price_dzd?: number | null;
  stock: number;
}

export interface DigitalProduct {
  id: string;
  slug: string;
  name: string;
  category: string;
  short_desc: string;
  description: string;
  image_url: string;
  badge?: string | null;
  features: string[];
  plans: DigitalPlan[];
}

export interface DigitalOrder {
  id: string;
  public_token: string;
  customer_name: string;
  whatsapp_phone: string;
  customer_email: string;
  product_name: string;
  plan_label: string;
  quantity: number;
  total_dzd: number;
  payment_method: 'edahabia' | 'cib' | 'whatsapp';
  status: 'pending' | 'paid' | 'delivered' | 'cancelled';
  chargily_checkout_url?: string | null;
  delivered_credentials?: string | null;
  customer_note?: string | null;
  created_at: string;
}

// باقات ومنتجات افتراضية تعمل فوراً حتى قبل ربط قاعدة البيانات
export const FALLBACK_PRODUCTS: DigitalProduct[] = [
  {
    id: 'prod-netflix',
    slug: 'netflix-premium-4k',
    name: 'اشتراك Netflix Premium 4K UHD',
    category: 'streaming',
    short_desc: 'مشاهدة بجودة 4K Ultra HD مع ضمان كامل طوال مدة الاشتراك ودعم الترجمة العربية.',
    description: 'استمتع بمشاهدة أحدث الأفلام والمسلسلات العالمية على نتفليكس بأعلى جودة 4K UHD. يتوفر لدينا بروفايل خاص مقفل برقم سري (PIN) أو حساب كامل خاص بك مع ضمان كامل المدة وتسليم فوري.',
    image_url: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=900&q=80',
    badge: 'الأكثر مبيعاً 🔥',
    features: [
      'جودة 4K Ultra HD أصلية',
      'بروفايل خاص مقفل برقم PIN',
      'ضمان كامل طوال فترة الاشتراك',
      'يعمل على التلفاز والهاتف والحاسوب'
    ],
    plans: [
      { id: 'plan-nf-1m', product_id: 'prod-netflix', account_type: 'بروفايل خاص (مشترك)', duration: 'شهر واحد', price_dzd: 800, original_price_dzd: 1200, stock: 50 },
      { id: 'plan-nf-3m', product_id: 'prod-netflix', account_type: 'بروفايل خاص (مشترك)', duration: '3 أشهر', price_dzd: 2200, original_price_dzd: 3000, stock: 30 },
      { id: 'plan-nf-1y', product_id: 'prod-netflix', account_type: 'بروفايل خاص (مشترك)', duration: 'سنة كاملة', price_dzd: 7500, original_price_dzd: 10000, stock: 15 },
      { id: 'plan-nf-full', product_id: 'prod-netflix', account_type: 'حساب كامل خاص (5 شاشات)', duration: 'شهر واحد', price_dzd: 3200, original_price_dzd: 4000, stock: 20 }
    ]
  },
  {
    id: 'prod-gemini',
    slug: 'gemini-advanced-pro',
    name: 'اشتراك Google Gemini Advanced + 2TB',
    category: 'ai',
    short_desc: 'أقوى نموذج ذكاء اصطناعي من جوجل مع مساحة تخزين سحابية 2 تيرابايت على Google One.',
    description: 'احصل على اشتراك Gemini Advanced (Google One AI Premium) مع وصول كامل لأحدث نماذج الذكاء الاصطناعي التوليدي في البحث و Gmail و Docs بالإضافة إلى مساحة 2TB سحابية.',
    image_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=900&q=80',
    badge: 'ذكاء اصطناعي 🤖',
    features: [
      'تفعيل رسمي على بريدك الشخصي Gmail',
      'مساحة تخزين 2TB في Google Drive و Photos',
      'دمج الذكاء الاصطناعي في Docs و Gmail',
      'ضمان رسمي طوال فترة الاشتراك'
    ],
    plans: [
      { id: 'plan-gm-1m', product_id: 'prod-gemini', account_type: 'تفعيل على إيميلك الشخصي', duration: 'شهر واحد', price_dzd: 1500, original_price_dzd: 2500, stock: 40 },
      { id: 'plan-gm-3m', product_id: 'prod-gemini', account_type: 'تفعيل على إيميلك الشخصي', duration: '3 أشهر', price_dzd: 4000, original_price_dzd: 6500, stock: 25 },
      { id: 'plan-gm-1y', product_id: 'prod-gemini', account_type: 'تفعيل على إيميلك الشخصي', duration: 'سنة كاملة', price_dzd: 12000, original_price_dzd: 18000, stock: 10 }
    ]
  },
  {
    id: 'prod-canva',
    slug: 'canva-pro-official',
    name: 'اشتراك Canva Pro الرسمي للمصممين',
    category: 'design',
    short_desc: 'تفعيل رسمي على إيميلك الشخصي مع فتح جميع القوالب والخطوط العربية وأدوات الذكاء الاصطناعي.',
    description: 'صمّم باحترافية عالية مع اشتراك كانفا برو الرسمي. يتم التفعيل مباشرة على حسابك الشخصي عبر دعوة رسمية دون الحاجة لكلمة المرور الخاصة بك، مع فتح كافة العناصر المدفوعة وإزالة الخلفية بضغطة زر.',
    image_url: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=900&q=80',
    badge: 'تفعيل على إيميلك 🎨',
    features: [
      'تفعيل مباشر على إيميلك الشخصي',
      'أكثر من 100 مليون قالب وعنصر مدفوع',
      'أدوات Magic Studio بالذكاء الاصطناعي',
      'دعم كامل للخطوط العربية الاحترافية'
    ],
    plans: [
      { id: 'plan-cv-1m', product_id: 'prod-canva', account_type: 'تفعيل رسمي على إيميلك', duration: 'شهر واحد', price_dzd: 600, original_price_dzd: 1000, stock: 100 },
      { id: 'plan-cv-1y', product_id: 'prod-canva', account_type: 'تفعيل رسمي على إيميلك', duration: 'سنة كاملة', price_dzd: 2500, original_price_dzd: 4500, stock: 100 }
    ]
  },
  {
    id: 'prod-chatgpt',
    slug: 'chatgpt-plus-4o',
    name: 'اشتراك ChatGPT Plus (GPT-4o)',
    category: 'ai',
    short_desc: 'وصول غير محدود لنماذج OpenAI المتقدمة وتوليد الصور بـ DALL-E 3 وتحليل الملفات.',
    description: 'اشتراك ChatGPT Plus يمنحك أولوية الوصول في أوقات الذروة، واستخدام أحدث نماذج التفكير والبرمجة وتوليد الصور وتحليل ملفات PDF والبيانات المعقدة بسرعة فائقة.',
    image_url: 'https://images.unsplash.com/photo-1684163761883-60110c0b3b1e?auto=format&fit=crop&w=900&q=80',
    badge: 'للدراسة والبرمجة ⚡',
    features: [
      'وصول كامل لأحدث نماذج OpenAI',
      'توليد صور احترافية عبر DALL-E',
      'رفع وتحليل الملفات والصور',
      'تسليم سريع مع ضمان كامل'
    ],
    plans: [
      { id: 'plan-gpt-shared', product_id: 'prod-chatgpt', account_type: 'حساب مشترك مستقر', duration: 'شهر واحد', price_dzd: 1400, original_price_dzd: 2000, stock: 40 },
      { id: 'plan-gpt-private', product_id: 'prod-chatgpt', account_type: 'حساب خاص كامل (تفعيل شخصي)', duration: 'شهر واحد', price_dzd: 4800, original_price_dzd: 5800, stock: 20 }
    ]
  },
  {
    id: 'prod-spotify',
    slug: 'spotify-premium-individual',
    name: 'اشتراك Spotify Premium بدون إعلانات',
    category: 'streaming',
    short_desc: 'استماع للموسيقى والبودكاست بجودة عالية بدون إعلانات مع إمكانية التحميل للاستماع أوفلاين.',
    description: 'فعّل سبوتيفاي بريميوم على حسابك الشخصي أو احصل على حساب جاهز، واستمتع بملايين المقاطع الصوتية والبودكاست بدون أي فواصل إعلانية مع ميزة التحميل.',
    image_url: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?auto=format&fit=crop&w=900&q=80',
    badge: 'بدون إعلانات 🎧',
    features: [
      'تفعيل على حسابك أو حساب جديد',
      'بدون إعلانات نهائياً',
      'تحميل المقاطع للاستماع بدون إنترنت',
      'جودة صوت فائقة النقاء'
    ],
    plans: [
      { id: 'plan-sp-1m', product_id: 'prod-spotify', account_type: 'تفعيل على إيميلك الشخصي', duration: 'شهر واحد', price_dzd: 900, original_price_dzd: 1300, stock: 40 },
      { id: 'plan-sp-3m', product_id: 'prod-spotify', account_type: 'تفعيل على إيميلك الشخصي', duration: '3 أشهر', price_dzd: 2400, original_price_dzd: 3500, stock: 30 },
      { id: 'plan-sp-1y', product_id: 'prod-spotify', account_type: 'تفعيل على إيميلك الشخصي', duration: 'سنة كاملة', price_dzd: 7500, original_price_dzd: 11000, stock: 15 }
    ]
  }
];
