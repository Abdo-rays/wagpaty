import { useMemo, useState, type ReactNode } from 'react'
import { ArrowUpLeft, ArrowUpRight, Clock3, MapPin, Search, Sparkles, Star, Utensils, Users, Store, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import TopBar from '../components/layout/TopBar'
import { useFetch } from '../hooks/useFetch'
import { customersApi } from '../lib/api/customers.api'
import Spinner from '../components/ui/Spinner'
import { useLang } from '../context/LanguageContext'
import { communityApi } from '../lib/api/community.api'

export default function PublicHome() {
  const { lang, t } = useLang()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const { data: restaurants, loading, error } = useFetch<any[]>(() => customersApi.getRestaurants({ limit: 12 }))
  const { data: publicStats } = useFetch<any>(() => customersApi.getPublicStats())
  const { data: communityPosts } = useFetch<any[]>(() => communityApi.getPublicPosts({ limit: 3 }))
  const list = restaurants || []
  const categories = useMemo(() => ['all', ...Array.from(new Set(list.map(r => r.category).filter(Boolean)))], [list])
  const filtered = list.filter(restaurant => `${restaurant.restaurantName} ${restaurant.category} ${restaurant.address}`.toLowerCase().includes(query.toLowerCase()) && (category === 'all' || restaurant.category === category))
  const directionIcon = lang === 'ar' ? <ArrowUpLeft size={16} /> : <ArrowUpRight size={16} />

  return <div className="public-home min-h-screen">
    <TopBar title="Wagpaty" subtitle={lang === 'ar' ? 'اكتشف مذاقك القادم' : 'Discover your next favourite'} />
    <main>
      <section className="public-hero"><div className="public-hero-grid" /><div className="public-shell public-hero-content">
        <div className="public-hero-copy anim-slide-right">
          <div className="public-eyebrow"><Sparkles size={15} /> {lang === 'ar' ? 'اختيارات تستاهل التجربة' : 'Worth-the-trip picks'}</div>
          <h1>{lang === 'ar' ? <>أكلك المفضل،<br /><em>على بُعد نقرة.</em></> : <>Your next favourite meal,<br /><em>one click away.</em></>}</h1>
          <p>{lang === 'ar' ? 'مطاعم حقيقية، وجبات شهية، وتجربة طلب بسيطة من أول اختيار لحد باب بيتك.' : 'Real restaurants, generous plates, and a simple ordering experience from first pick to your door.'}</p>
          <div className="public-hero-actions"><Link to="/signup/customer" className="public-primary-action">{lang === 'ar' ? 'ابدأ طلبك' : 'Start ordering'} {directionIcon}</Link><a href="#restaurants" className="public-text-action">{lang === 'ar' ? 'استكشف المطاعم' : 'Explore restaurants'} <span>↓</span></a></div>
          <div className="public-proof-row"><div><strong>{publicStats?.restaurants || list.length || '—'}</strong><span>{lang === 'ar' ? 'مطاعم مسجلة' : 'registered restaurants'}</span></div><div className="public-proof-divider" /><div><strong>{publicStats?.completedOrders || '—'}</strong><span>{lang === 'ar' ? 'طلبات مكتملة' : 'completed orders'}</span></div></div>
        </div>
        <div className="public-hero-visual anim-scale"><div className="public-hero-orbit orbit-one" /><div className="public-hero-orbit orbit-two" /><div className="public-feature-image"><img src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85" alt={lang === 'ar' ? 'طبق أكل شهي' : 'A delicious plate of food'} /><div className="public-image-shade" /><div className="public-floating-label"><span className="public-live-dot" /> {lang === 'ar' ? 'طازج وشهي' : 'Fresh and delicious'}</div><div className="public-feature-caption"><span>{lang === 'ar' ? 'Wagpaty تجمعنا' : 'Wagpaty brings us together'}</span><strong>{lang === 'ar' ? 'كل يوم، طعم جديد' : 'Every day, a new taste'}</strong></div></div></div>
      </div></section>

      <section className="public-stats public-shell" aria-label={lang === 'ar' ? 'إحصائيات Wagpaty' : 'Wagpaty statistics'}>
        <div className="public-stat-card"><Users size={22} /><strong>{publicStats?.customers ?? '—'}</strong><span>{lang === 'ar' ? 'عميل مسجل' : 'registered customers'}</span></div>
        <div className="public-stat-card"><Store size={22} /><strong>{publicStats?.restaurants ?? '—'}</strong><span>{lang === 'ar' ? 'مطعم مسجل' : 'registered restaurants'}</span></div>
        <div className="public-stat-card"><CheckCircle2 size={22} /><strong>{publicStats?.completedOrders ?? '—'}</strong><span>{lang === 'ar' ? 'طلب مكتمل' : 'completed orders'}</span></div>
      </section>

      <section id="restaurants" className="public-discovery public-shell"><div className="public-section-heading"><div><span className="public-kicker">{lang === 'ar' ? 'على مزاجك' : 'ON YOUR RADAR'}</span><h2>{lang === 'ar' ? 'اختار، اطلب، وانبسط' : 'Find your kind of delicious'}</h2></div><p>{lang === 'ar' ? 'اختيارات محلية جاهزة للطلب.' : 'Local favourites, ready when you are.'}</p></div><div className="public-toolbar"><div className="public-search"><Search size={17} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder={lang === 'ar' ? 'ابحث عن مطعم أو تصنيف...' : 'Search restaurants or cuisines...'} /></div><div className="public-categories" role="tablist">{categories.map(item => <button key={item} onClick={() => setCategory(item)} className={category === item ? 'active' : ''}>{item === 'all' ? (lang === 'ar' ? 'الكل' : 'All') : item}</button>)}</div></div>{loading ? <Spinner text={t('loading')} /> : error ? <div className="public-empty"><p>{lang === 'ar' ? 'تعذر تحميل المطاعم حاليًا.' : 'Restaurants are unavailable right now.'}</p></div> : filtered.length === 0 ? <div className="public-empty"><Utensils size={26} /><p>{t('noData')}</p></div> : <div className="public-restaurant-grid">{filtered.map((restaurant, index) => <RestaurantCard key={restaurant._id} restaurant={restaurant} index={index} lang={lang} directionIcon={directionIcon} />)}</div>}</section>
      {communityPosts && communityPosts.length > 0 && <section className="public-community public-shell"><div className="public-section-heading"><div><span className="public-kicker">{lang === 'ar' ? 'من المجتمع' : 'FROM THE COMMUNITY'}</span><h2>{lang === 'ar' ? 'شوف الناس بتاكل إيه' : 'See what people are enjoying'}</h2></div><Link to="/login" className="public-text-action">{lang === 'ar' ? 'انضم للمجتمع' : 'Join the community'} {directionIcon}</Link></div><div className="public-community-grid">{communityPosts.map((post: any) => <article key={post._id} className="public-community-post">{post.image && <img src={post.image} alt="" />}{post.caption && <p>{post.caption}</p>}<small>{post.author?.name || post.author?.restaurantName || (lang === 'ar' ? 'عضو في المجتمع' : 'Community member')}</small></article>)}</div></section>}
      <section className="public-bottom-cta public-shell"><div><span className="public-kicker">{lang === 'ar' ? 'جاهز للخطوة الأولى؟' : 'READY FOR THE FIRST BITE?'}</span><h2>{lang === 'ar' ? 'سجّل حسابك وخلي الطلب علينا.' : 'Create an account. Leave the cravings to us.'}</h2></div><Link to="/signup/customer" className="public-primary-action">{lang === 'ar' ? 'إنشاء حساب' : 'Create account'} {directionIcon}</Link></section>
    </main>
  </div>
}

function RestaurantCard({ restaurant, index, lang, directionIcon }: { restaurant: any; index: number; lang: 'ar' | 'en'; directionIcon: ReactNode }) {
  const image = restaurant.coverImage || restaurant.logo
  return <Link to="/login" className="public-restaurant-card anim-fade" style={{ animationDelay: `${index * 70}ms` }}><div className="public-card-media">{image ? <img src={image} alt={restaurant.restaurantName} /> : <div className="public-image-fallback"><Utensils size={32} /></div>}<span className="public-card-status"><span className="public-live-dot" /> {lang === 'ar' ? 'متاح' : 'Available'}</span><span className="public-card-rating"><Star size={13} fill="currentColor" /> {restaurant.rating?.toFixed(1) || '—'}</span></div><div className="public-card-body"><div><h3>{restaurant.restaurantName}</h3><p><MapPin size={13} /> {restaurant.address || (lang === 'ar' ? 'العنوان غير متاح' : 'Location unavailable')}</p></div><span className="public-card-arrow">{directionIcon}</span><div className="public-card-meta"><span><Clock3 size={13} /> {lang === 'ar' ? '25 - 40 دقيقة' : '25 - 40 min'}</span><span>{restaurant.category || (lang === 'ar' ? 'متنوع' : 'Mixed cuisine')}</span></div></div></Link>
}
