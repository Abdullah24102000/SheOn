import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import ProductCard from '../components/ProductCard';
import Hero from '../components/Hero';
import CategoryFilter from '../components/CategoryFilter';
import { ArrowRight, Truck, MapPin, MessageCircle } from 'lucide-react';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  
  // حالات التوصيل الشخصي
  const [pickupLocation, setPickupLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [isLocationSet, setIsLocationSet] = useState(false);
  
  const activeCategory = searchParams.get('category') || 'ALL';
  const vendorId = searchParams.get('vendorId');

  const categoryNames = {
    'ALL': 'الكل',
    'SUPERMARKET': 'سوبر ماركت',
    'RESTAURANTS': 'المطاعم',
    'PERSONAL_DELIVERY': 'توصيل شخصي'
  };

  // 1. وظيفة تحديد الموقع وتحويله للينك جوجل ماب
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        setPickupLocation(mapUrl);
        setIsLocationSet(true);
        alert("📍 تم التقاط موقعك بنجاح!");
      }, () => {
        alert("يرجى تفعيل الـ GPS لتحديد موقعك تلقائياً.");
      });
    }
  };

  // 2. وظيفة إرسال الطلب عبر الواتساب
  const sendWhatsAppOrder = () => {
    if (!pickupLocation || !destination) {
      alert("كمل البيانات الأول يا بطل!");
      return;
    }

    const myNumber = "201029472254"; 
    const message = `🚀 *طلب توصيل سكوتر جديد* %0A%0A` +
                    `📍 *نقطة الانطلاق:* ${pickupLocation} %0A` +
                    `🏁 *نقطة الوصول:* ${destination} %0A%0A` +
                    `تم إرسال الطلب من خلال طلباتك`;

    window.open(`https://wa.me/${myNumber}?text=${message}`, '_blank');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (activeCategory === 'RESTAURANTS' && !vendorId) {
          const { data, error } = await supabase.from('Vendors').select('*');
          if (error) throw error;
          setVendors(data || []);
        } else if (activeCategory !== 'PERSONAL_DELIVERY') {
          let query = supabase.from('Products').select('*');
          if (activeCategory !== 'ALL' && activeCategory !== 'RESTAURANTS') {
            query = query.eq('category', activeCategory);
          }
          if (vendorId) {
            query = query.eq('vendor_id', vendorId);
          }
          const { data, error } = await query.order('id', { ascending: false });
          if (error) throw error;
          setProducts(data || []);
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeCategory, vendorId]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-12 h-12 border-4 border-hot-pink border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-black text-white" dir="rtl">
      <Hero products={products.slice(0, 5)} />

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col mb-12 text-right items-end">
          <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase">
            {categoryNames[activeCategory]} <span className="text-hot-pink">طلباتك</span>
          </h2>
          <div className="w-20 h-1.5 bg-hot-pink mt-4"></div>
        </div>

        <CategoryFilter activeCategory={activeCategory} onFilterChange={(cat) => setSearchParams({ category: cat })} />

        {activeCategory === 'PERSONAL_DELIVERY' ? (
          <div className="max-w-2xl mx-auto bg-zinc-900/40 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-14 h-14 bg-hot-pink rounded-2xl flex items-center justify-center rotate-3 shadow-lg shadow-hot-pink/20">
                <Truck className="text-black" size={30} />
              </div>
              <div>
                <h3 className="text-2xl font-black italic">طلب <span className="text-hot-pink">سكوتر</span></h3>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">توجيه سريع للواتساب</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="relative">
                <label className="block text-zinc-400 text-sm font-bold mb-3 mr-2">منين هنحملك؟</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={isLocationSet ? "📍 تم تحديد موقعك (جوجل ماب)" : pickupLocation}
                    onChange={(e) => { setPickupLocation(e.target.value); setIsLocationSet(false); }}
                    placeholder="اكتب العنوان أو حدد موقعك"
                    className="w-full bg-black/50 border border-white/10 rounded-2xl p-5 text-white focus:border-hot-pink outline-none transition-all pl-28"
                  />
                  <button 
                    onClick={handleGetCurrentLocation}
                    className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-hot-pink/10 hover:bg-hot-pink/20 text-hot-pink px-3 py-2 rounded-xl text-[10px] font-black transition-all"
                  >
                    <MapPin size={14} /> تحديد موقعي
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 text-sm font-bold mb-3 mr-2">رايح فين؟ (نقطة الوصول)</label>
                <input 
                  type="text" 
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="اكتب وجهتك بالتفصيل"
                  className="w-full bg-black/50 border border-white/10 rounded-2xl p-5 text-white focus:border-hot-pink outline-none transition-all"
                />
              </div>

              <button 
                onClick={sendWhatsAppOrder}
                className="w-full bg-[#25D366] text-black font-black py-6 rounded-[1.5rem] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[#25D366]/20 flex items-center justify-center gap-3 text-lg italic"
              >
                <MessageCircle size={24} /> إرسال الطلب عبر الواتساب
              </button>
            </div>
          </div>
        ) : activeCategory === 'RESTAURANTS' && !vendorId ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {vendors.length === 0 ? (
              <div className="col-span-full text-center py-20 text-zinc-600 font-bold">لا توجد مطاعم متاحة</div>
            ) : (
              vendors.map((vendor) => (
                <div key={vendor.id} onClick={() => setSearchParams({ category: 'RESTAURANTS', vendorId: vendor.id })} className="relative h-72 rounded-[2.5rem] overflow-hidden cursor-pointer group border border-white/5 hover:border-hot-pink/50 transition-all duration-500">
                  <img src={vendor.image_url} className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" onError={(e) => e.target.src = 'https://via.placeholder.com/400x300'} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-8 flex flex-col justify-end text-right">
                    <h3 className="text-3xl font-black italic text-white mb-2">{vendor.name}</h3>
                    <p className="text-hot-pink font-bold flex items-center gap-2">المنيو كامل <ArrowRight size={18} /></p>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <>
            {vendorId && <button onClick={() => setSearchParams({ category: 'RESTAURANTS' })} className="mb-8 bg-white/5 hover:bg-white/10 text-white px-6 py-2 rounded-full text-sm font-bold transition-all">← العودة للمطاعم</button>}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8">
              {products.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          </>
        )}
      </div>

      <footer className="py-10 border-t border-white/5 text-center mt-20">
        <p className="text-white text-[10px] font-black tracking-[0.5em] uppercase leading-relaxed">
          Developed By <a href="https://react-portf-abdallah.vercel.app/" target="_blank" rel="noreferrer" className="text-[#0070FF] no-underline">Abdullah Hassan</a> <br/> SHEON &copy; 2026
        </p>
      </footer>
    </div>
  );
};

export default Home;