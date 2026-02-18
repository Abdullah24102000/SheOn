import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { translations } from '../translations';
import { ShoppingBag, Heart, X, Trash2, Plus, Minus, Languages, ChevronDown } from 'lucide-react';

const Navbar = () => {
    const [lang, setLang] = useState(localStorage.getItem('lang') || 'en');
    const t = translations[lang];
    const { cart, removeFromCart, updateQuantity, subtotal, addToCart } = useCart();
    const { wishlist, toggleWishlist } = useWishlist();
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isWishOpen, setIsWishOpen] = useState(false);
    const [isCatOpen, setIsCatOpen] = useState(false);
    const navigate = useNavigate();

    // الأقسام المحدثة (تطابق قاعدة البيانات)
    const categories = [
        { id: 'CLOTHES', en: 'CLOTHES', ar: 'ملابس' },
        { id: 'BAGS', en: 'BAGS', ar: 'شنط' },
        { id: 'ACCESSORIES', en: 'ACCESSORIES', ar: 'إكسسوارات' },
        { id: 'SOCKS', en: 'SOCKS', ar: 'شرابات' }
    ];

    const toggleLang = () => {
        const newLang = lang === 'en' ? 'ar' : 'en';
        localStorage.setItem('lang', newLang);
        window.location.reload(); 
    };

    const handleCategoryClick = (catId) => {
        setIsCatOpen(false);
        if (catId === 'ALL') {
            navigate('/shop');
        } else {
            navigate(`/shop?category=${catId}`);
        }
    };

    return (
        <>
            {/* الناف بار الأساسي - dir="rtl" يجعل اللوجو يميناً والأيقونات يساراً */}
            <nav className="fixed top-0 left-0 w-full z-[100] bg-black/95 backdrop-blur-xl border-b border-white/10 h-20" dir="rtl">
                <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
                    
                    {/* الجانب الأيمن: اللوجو والروابط */}
                    <div className="flex items-center gap-8">
                        <Link to="/" className="text-3xl font-black italic tracking-tighter text-white no-underline">
                            SHEON<span className="text-hot-pink">.</span>
                        </Link>

                        <div className="hidden md:flex items-center gap-6 font-bold text-[13px] uppercase tracking-widest text-white">
                            <Link to="/" className="text-white no-underline hover:text-hot-pink transition-all font-black">
                                {t.nav.home}
                            </Link>
                            
                            <div className="relative">
                                <button 
                                    onClick={() => setIsCatOpen(!isCatOpen)}
                                    className="bg-transparent border-none text-white cursor-pointer hover:text-hot-pink transition-all flex items-center gap-1 uppercase tracking-widest font-black"
                                >
                                    {t.nav.categories} <ChevronDown size={14} className={`transition-transform ${isCatOpen ? 'rotate-180' : ''}`}/>
                                </button>
                                
                                {isCatOpen && (
                                    <div className="absolute top-full right-0 mt-4 w-48 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2 animate-in fade-in slide-in-from-top-2">
                                        <button 
                                            onClick={() => handleCategoryClick('ALL')}
                                            className="w-full text-right px-6 py-3 text-white hover:bg-hot-pink transition-colors border-none bg-transparent cursor-pointer font-black text-[10px] uppercase"
                                        >
                                            {lang === 'en' ? 'ALL PRODUCTS' : 'كل المنتجات'}
                                        </button>
                                        {categories.map(cat => (
                                            <button 
                                                key={cat.id}
                                                onClick={() => handleCategoryClick(cat.id)}
                                                className="w-full text-right px-6 py-3 text-white hover:bg-hot-pink transition-colors border-none bg-transparent cursor-pointer font-black text-[10px] uppercase"
                                            >
                                                {lang === 'en' ? cat.en : cat.ar}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* الجانب الأيسر: الأيقونات واللغة */}
                    <div className="flex items-center gap-4">
                        <button onClick={toggleLang} className="bg-white/10 border border-white/10 text-white px-4 py-2 rounded-full text-[12px] font-black flex items-center gap-2 cursor-pointer hover:bg-hot-pink transition-all">
                            <Languages size={16}/> {t.langBtn}
                        </button>
                        
                        <button onClick={() => setIsWishOpen(true)} className="relative text-white p-2 bg-transparent border-none cursor-pointer group">
                            <Heart size={26} className={wishlist.length > 0 ? "text-hot-pink" : "text-white group-hover:text-hot-pink"} fill={wishlist.length > 0 ? "currentColor" : "none"} />
                            {wishlist.length > 0 && <span className="absolute top-0 right-0 bg-hot-pink text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg">{wishlist.length}</span>}
                        </button>

                        <button onClick={() => setIsCartOpen(true)} className="relative text-white p-2 bg-transparent border-none cursor-pointer group">
                            <ShoppingBag size={26} className="group-hover:text-hot-pink transition-colors" />
                            {cart.length > 0 && <span className="absolute top-0 right-0 bg-hot-pink text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg">{cart.length}</span>}
                        </button>
                    </div>
                </div>
            </nav>

            <div className="h-20 w-full block"></div>

            {/* سلة المفضلات - تظهر من اليسار (لتتناسب مع جهة الأيقونات) */}
            <div className={`fixed top-0 left-0 h-full w-full md:w-[400px] bg-[#0a0a0a] z-[1000] border-r border-white/10 transform transition-transform duration-500 shadow-2xl ${isWishOpen ? 'translate-x-0' : '-translate-x-full'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <div className="p-8 border-b border-white/5 flex justify-between items-center text-white">
                    <h2 className="text-xl font-black italic uppercase">{t.wishlist.title}</h2>
                    <button onClick={() => setIsWishOpen(false)} className="bg-zinc-800 text-white p-2 rounded-full border-none cursor-pointer hover:bg-hot-pink transition-all flex items-center justify-center"><X size={24}/></button>
                </div>
                <div className="p-6 space-y-5 overflow-y-auto h-[calc(100vh-100px)] text-white custom-scrollbar">
                    {wishlist.length === 0 && <p className="text-center text-zinc-500 mt-10 font-bold uppercase tracking-widest text-xs">{t.wishlist.empty}</p>}
                    {wishlist.map(item => (
                        <div key={item.id} className="bg-zinc-900/50 p-4 rounded-3xl border border-white/5 flex flex-col gap-4">
                            <div className="flex gap-4 items-center">
                                <img src={Array.isArray(item.ImgUrl) ? item.ImgUrl[0] : item.ImgUrl} className="w-16 h-16 rounded-2xl object-cover" alt="" />
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-black uppercase truncate">{item.Name}</h4>
                                    <p className="text-hot-pink font-black text-sm">{item.Price} EGP</p>
                                </div>
                                <button onClick={() => toggleWishlist(item)} className="text-zinc-600 hover:text-red-500 bg-transparent border-none cursor-pointer transition-colors"><Trash2 size={20}/></button>
                            </div>
                            <button onClick={() => { addToCart(item); toggleWishlist(item); }} className="w-full py-3 rounded-xl bg-white text-black font-black text-[10px] uppercase hover:bg-hot-pink hover:text-white transition-all cursor-pointer border-none">
                                {t.cart.move}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* سلة التسوق - تظهر من اليسار */}
            <div className={`fixed top-0 left-0 h-full w-full md:w-[400px] bg-[#0a0a0a] z-[1000] border-r border-white/10 transform transition-transform duration-500 shadow-2xl ${isCartOpen ? 'translate-x-0' : '-translate-x-full'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <div className="p-8 border-b border-white/5 flex justify-between items-center text-white">
                    <h2 className="text-xl font-black italic uppercase">{t.cart.title}</h2>
                    <button onClick={() => setIsCartOpen(false)} className="bg-zinc-800 text-white p-2 rounded-full border-none cursor-pointer hover:bg-hot-pink transition-all flex items-center justify-center"><X size={24}/></button>
                </div>
                <div className="p-6 space-y-5 overflow-y-auto h-[calc(100vh-250px)] text-white custom-scrollbar">
                    {cart.length === 0 && <p className="text-center text-zinc-500 mt-10 font-bold uppercase tracking-widest text-xs">{t.cart.empty}</p>}
                    {cart.map(item => (
                        <div key={item.id} className="bg-zinc-900/50 p-4 rounded-3xl border border-white/5 flex gap-4 items-center">
                            <img src={Array.isArray(item.ImgUrl) ? item.ImgUrl[0] : item.ImgUrl} className="w-16 h-16 rounded-2xl object-cover" alt="" />
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-black uppercase truncate">{item.Name}</h4>
                                <div className="flex items-center gap-4 mt-2">
                                    <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 bg-zinc-800 text-white rounded-full border-none flex items-center justify-center cursor-pointer hover:bg-zinc-700">-</button>
                                    <span className="text-sm font-bold">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 bg-zinc-800 text-white rounded-full border-none flex items-center justify-center cursor-pointer hover:bg-zinc-700">+</button>
                                </div>
                            </div>
                            <div className="text-left">
                                <p className="text-hot-pink font-black text-sm mb-2">{item.Price} EGP</p>
                                <button onClick={() => removeFromCart(item.id)} className="text-zinc-700 hover:text-red-500 bg-transparent border-none cursor-pointer"><Trash2 size={18}/></button>
                            </div>
                        </div>
                    ))}
                </div>
                {cart.length > 0 && (
                    <div className="absolute bottom-0 left-0 w-full p-8 border-t border-white/5 bg-zinc-900/80 backdrop-blur-xl text-white">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-zinc-500 font-bold uppercase text-xs">{t.cart.total}</span>
                            <span className="text-2xl font-black italic">{subtotal.toLocaleString()} EGP</span>
                        </div>
                        <Link to="/checkout" onClick={() => setIsCartOpen(false)} className="block w-full py-5 rounded-2xl bg-hot-pink text-white text-center font-black uppercase no-underline shadow-lg hover:scale-[1.02] active:scale-95 transition-all">
                            {t.cart.checkout}
                        </Link>
                    </div>
                )}
            </div>
            
            {(isCartOpen || isWishOpen) && <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999]" onClick={() => {setIsCartOpen(false); setIsWishOpen(false)}} />}
        </>
    );
};

export default Navbar;