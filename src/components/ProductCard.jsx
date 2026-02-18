import React from 'react';
import { ShoppingBag, AlertCircle, Timer, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext'; // تأكد من المسار الصحيح
import { useWishlist } from '../context/WishlistContext'; // تأكد من المسار الصحيح

const ProductCard = ({ product }) => {
    // استدعاء الدوال مباشرة من الـ Context
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

    return (
        <div className="relative bg-zinc-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-hot-pink/30 transition-all duration-500">
            
            {/* زر المفضلة - يعمل الآن عبر الـ Context */}
            <button 
                onClick={handleFavorite}
                type="button"
                className="absolute top-4 left-4 z-[40] p-2 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 text-white hover:scale-110 active:scale-90 transition-all cursor-pointer"
            >
                <Heart 
                    size={16} 
                    fill={isFavorite ? "#ff0266" : "none"} 
                    color={isFavorite ? "#ff0266" : "white"} 
                />
            </button>

            {/* منطقة الصورة */}
            <div className="relative aspect-[4/5] overflow-hidden">
                <img
                    src={Array.isArray(product.ImgUrl) ? product.ImgUrl[0] : product.ImgUrl}
                    alt={product.Name}
                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 
                    ${isSoldOut ? 'grayscale opacity-50' : ''}`}
                />

                {isSoldOut && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-10">
                        <div className="bg-red-600 text-white px-6 py-2 rounded-full font-black uppercase text-[10px] tracking-widest shadow-2xl border border-white/10 rotate-[-5deg]">
                            Sold Out
                        </div>
                    </div>
                )}
            </div>

            <div className="p-6">
                <div className="mb-3">
                    {/* اسم المنتج بخط صغير ومنظم */}
                    <h3 className="text-white font-bold text-sm uppercase italic tracking-tight leading-snug break-words line-clamp-2 h-10">
                        {product.Name}
                    </h3>
                </div>

                <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-hot-pink font-black text-xl italic tracking-tighter">
                            {product.Price}
                            <span className="text-[9px] ml-1 uppercase not-italic text-zinc-500">egp</span>
                        </span>
                        
                        {/* المستطيل الأصفر بجانب السعر */}
                        {isLowStock && (
                            <div className="bg-amber-500 text-black px-2 py-1 rounded-lg font-black text-[8px] uppercase flex items-center gap-1 animate-pulse border border-black/10">
                                <Timer size={10} />
                                {product.Stock} Left
                            </div>
                        )}
                    </div>
                </div>

                {/* زر السلة - يعمل الآن عبر الـ Context */}
                <button
                    onClick={handleCart}
                    disabled={isSoldOut}
                    type="button"
                    className={`w-full py-4 rounded-2xl font-black uppercase text-[11px] flex items-center justify-center gap-2 transition-all border-none relative z-[40] 
                    ${isSoldOut
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                        : 'bg-white text-black hover:bg-hot-pink hover:text-white active:scale-95 shadow-lg shadow-white/5 cursor-pointer'
                    }`}
                >
                    {isSoldOut ? (
                        <>
                            <AlertCircle size={14} />
                            Out of Stock
                        </>
                    ) : (
                        <>
                            <ShoppingBag size={14} />
                            Add to Bag
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;