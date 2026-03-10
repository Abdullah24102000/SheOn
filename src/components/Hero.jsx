import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingCart, ArrowRight, ArrowLeft } from 'lucide-react';

const Hero = ({ products }) => {
    const { addToCart } = useCart();
    const [currentIndex, setCurrentIndex] = useState(0);

    // جلب اللغة الحالية لتحديد الكلمات فقط
    const lang = localStorage.getItem('lang') || 'en';

    const saleProducts = products.filter(p => p.oldPrice && p.oldPrice > p.Price);

    useEffect(() => {
        if (saleProducts.length <= 1) return;
        const interval = setInterval(() => {
            handleNext();
        }, 5000);
        return () => clearInterval(interval);
    }, [saleProducts.length, currentIndex]);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % saleProducts.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + saleProducts.length) % saleProducts.length);
    };

    if (saleProducts.length === 0) return null;

    const current = saleProducts[currentIndex];

    return (
        <div className="relative w-full bg-deep-black overflow-hidden py-6 md:py-12 border-b border-white/5" dir="rtl">
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-6 md:gap-10">

                {/* الكلام دائمًا على اليمين بسبب dir="rtl" في الحاوية الأب */}
                <div className="flex-1 text-right space-y-4 z-10">
                    <div className="inline-block bg-hot-pink text-white px-3 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase">
                        {lang === 'en' ? 'Limited Offer' : 'عرض محدود'}
                    </div>
                    
                    <h1 className="text-4xl md:text-7xl font-black italic tracking-tighter leading-none text-white uppercase">
                        {lang === 'en' ? (
                            <>SALE <br /> <span className="text-hot-pink">OFFER</span></>
                        ) : (
                            <>عرض <br /> <span className="text-hot-pink">خصم</span></>
                        )}
                    </h1>

                    <p className="text-gray-400 text-sm md:text-base font-medium max-w-sm">
                        {lang === 'en' 
                            ? `Exclusive discount on ${current.Name}. Elegance at unbeatable prices.`
                            : `خصم حصري على ${current.Name}. أناقة بأسعار لا تقبل المنافسة.`
                        }
                    </p>

                    <div className="flex items-center gap-3">
                        <div className="text-2xl md:text-4xl font-black text-white">{current.Price} EGP</div>
                        <div className="text-lg md:text-xl text-gray-500 line-through decoration-hot-pink">{current.oldPrice} EGP</div>
                    </div>

                    <button
                        onClick={() => addToCart(current)}
                        className="group flex items-center gap-3 bg-white text-black px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-hot-pink hover:text-white transition-all duration-500 cursor-pointer border-none"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        {lang === 'en' ? 'Shop Now' : 'تسوق الآن'}
                    </button>
                </div>

                {/* الصورة دائمًا على اليسار */}
                <div className="flex-1 relative flex justify-center items-center mt-4 md:mt-0">
                    <div className="absolute w-48 h-48 md:w-[350px] md:h-[350px] bg-hot-pink/10 rounded-full blur-[80px]"></div>
                    <img
                        key={current.id}
                        src={Array.isArray(current.ImgUrl) ? current.ImgUrl[0] : current.ImgUrl}
                        alt={current.Name}
                        className="relative z-10 w-full max-w-[220px] md:max-w-[400px] h-[280px] md:h-[420px] object-cover rounded-2xl shadow-2xl transform rotate-2 animate-in fade-in slide-in-from-left-8 duration-700"
                    />
                </div>

            </div>

            {/* الأزرار مكانها ثابت كما في كودك الأصلي */}
            <div className="absolute bottom-6 left-6 md:right-10 md:left-auto flex gap-3 z-20" dir="ltr">
                <button
                    onClick={handlePrev}
                    className="p-2 border border-white/10 rounded-full text-white hover:bg-hot-pink transition-all cursor-pointer bg-transparent"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                    onClick={handleNext}
                    className="p-2 border border-white/10 rounded-full text-white hover:bg-hot-pink transition-all cursor-pointer bg-transparent"
                >
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default Hero;