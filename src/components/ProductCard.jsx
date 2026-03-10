import React from 'react';
import { ShoppingBag, AlertCircle, Timer, Heart, Store } from 'lucide-react';
import { useCart } from '../context/CartContext'; 
import { useWishlist } from '../context/WishlistContext'; 

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    
    const isSoldOut = product.Stock <= 0;
    const isLowStock = product.Stock > 0 && product.Stock <= 5;
    const isFavorite = isInWishlist(product.id);

    const handleFavorite = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(product);
    };

    const handleCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isSoldOut) {
            addToCart(product);
        }
    };

    // تحديد اسم القسم بالعربي بناءً على الـ Category ID
    const getCategoryName = (catId) => {
        switch(catId) {
            case 'SUPERMARKET': return 'سوبر ماركت';
            case 'RESTAURANTS': return 'مطاعم';
            case 'PERSONAL_DELIVERY': return 'توصيل شخصي';
            default: return 'قسم عام';
        }
    };

    return (
        <div 
            className="relative bg-zinc-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-hot-pink/30 transition-all duration-500" 
            dir="rtl"
        >
            
            {/* زر المفضلة - مكانه فوق على اليمين في الـ RTL */}
            <button 
                onClick={handleFavorite}
                type="button"
                className="absolute top-4 right-4 z-[40] p-2 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 text-white hover:scale-110 active:scale-90 transition-all cursor-pointer"
            >
                <Heart 
                    size={16} 
                    fill={isFavorite ? "#ff0266" : "none"} 
                    color={isFavorite ? "#ff0266" : "white"} 
                />
            </button>

            {/* منطقة الصورة - جعلتها مناسبة لصور المنتجات الاستهلاكية */}
            <div className="relative aspect-square overflow-hidden bg-white/5 flex items-center justify-center p-4">
                <img
                    src={Array.isArray(product.ImgUrl) ? product.ImgUrl[0] : product.ImgUrl}
                    alt={product.Name}
                    className={`max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-110 
                    ${isSoldOut ? 'grayscale opacity-50' : ''}`}
                />

                {isSoldOut && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-10">
                        <div className="bg-red-600 text-white px-6 py-2 rounded-full font-black uppercase text-[12px] tracking-widest shadow-2xl border border-white/10 rotate-[-5deg]">
                            نفدت الكمية
                        </div>
                    </div>
                )}
            </div>

            <div className="p-6">
                <div className="mb-3 text-right">
                    {/* اسم القسم بلون هادي */}
                    <div className="flex items-center gap-1 text-zinc-500 mb-1">
                        <Store size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                            {getCategoryName(product.Category)}
                        </span>
                    </div>
                    {/* اسم المنتج */}
                    <h3 className="text-white font-bold text-lg leading-snug break-words line-clamp-2 h-14">
                        {product.Name}
                    </h3>
                </div>

                <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-1">
                        <span className="text-hot-pink font-black text-2xl italic tracking-tighter">
                            {product.Price}
                        </span>
                        <span className="text-[10px] font-bold text-zinc-500 mt-1">جنيه</span>
                    </div>
                    
                    {/* حالة المخزن باللغة العربية */}
                    {isLowStock && (
                        <div className="bg-amber-500/10 text-amber-500 px-2 py-1 rounded-lg font-black text-[9px] flex items-center gap-1 animate-pulse border border-amber-500/20">
                            <Timer size={10} />
                            متبقي {product.Stock} قطعة
                        </div>
                    )}
                </div>

                {/* زر الإضافة للسلة */}
                <button
                    onClick={handleCart}
                    disabled={isSoldOut}
                    type="button"
                    className={`w-full py-4 rounded-2xl font-black text-[14px] flex items-center justify-center gap-2 transition-all border-none relative z-[40] 
                    ${isSoldOut
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                        : 'bg-white text-black hover:bg-hot-pink hover:text-white active:scale-95 shadow-lg shadow-white/5 cursor-pointer'
                    }`}
                >
                    {isSoldOut ? (
                        <>
                            <AlertCircle size={16} />
                            غير متوفر
                        </>
                    ) : (
                        <>
                            <ShoppingBag size={16} />
                            أضف للطلب
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;