import { useState, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { supabase } from '../supabaseClient';
import { translations } from '../translations';
import { Trash2, Plus, Minus, ShoppingBag, Truck } from 'lucide-react';

const CheckoutPage = () => {
    const { cart = [], removeFromCart, updateQuantity, setCart, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ name: '', phone: '', address: '' });

    const lang = localStorage.getItem('lang') || 'en';
    const t = translations[lang];

    const subtotal = useMemo(() => cart.reduce((acc, item) => {
        const price = typeof item.Price === 'string'
            ? parseFloat(item.Price.replace(/[^\d.]/g, ''))
            : item.Price;
        return acc + (price * (item.quantity || 1));
    }, 0), [cart]);

    const shippingFee = 40;
    const total = subtotal + shippingFee;

    const isPhoneValid = (phone) => {
        return /^01[0125][0-9]{8}$/.test(phone);
    };

    const isFormValid = cart.length > 0 &&
        formData.name.trim().length >= 3 &&
        isPhoneValid(formData.phone) &&
        formData.address.trim().length >= 5;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid || loading) return;

        setLoading(true);

        try {
            // 1. محاولة الإرسال لـ Supabase
            const { error: supabaseError } = await supabase
                .from('Orders')
                .insert([{
                    customer_name: formData.name.trim(),
                    phone: formData.phone.trim(),
                    address: formData.address.trim(),
                    items: cart,
                    total_price: total,
                    status: 'pending',
                    created_at: new Date().toISOString()
                }]);

            if (supabaseError) throw supabaseError;

            // 2. تجهيز الرسالة
            let message = lang === 'en' ? `*📦 New Order from SHEON*%0A` : `*📦 طلب جديد من SHEON*%0A`;
            message += `*${lang === 'en' ? 'Name' : 'الاسم'}:* ${formData.name}%0A`;
            message += `*${lang === 'en' ? 'Phone' : 'الموبايل'}:* ${formData.phone}%0A`;
            message += `*${lang === 'en' ? 'Address' : 'العنوان'}:* ${formData.address}%0A`;
            message += `*━━━━━━━━━━━━━━━*%0A`;
            cart.forEach((item, index) => {
                message += `${index + 1}. *${item.Name}*%0A ${lang === 'en' ? 'Qty' : 'الكمية'}: ${item.quantity} | ${item.Price} EGP%0A`;
            });
            message += `*━━━━━━━━━━━━━━━*%0A`;
            message += `*💰 ${lang === 'en' ? 'Total' : 'الإجمالي'}: ${total} EGP*`;

            // 3. تنظيف السلة (طريقة آمنة)
            if (clearCart) {
                clearCart();
            } else if (setCart) {
                setCart([]);
            }
            localStorage.removeItem('sheon_cart');

            // 4. الانتقال للواتساب (تأكد من فتح الرابط في نافذة جديدة إذا استمرت المشكلة)
            const whatsappUrl = `https://wa.me/201029472254?text=${message}`;
            window.location.assign(whatsappUrl);

        } catch (err) {
            console.error("Submission Error:", err);
            alert(lang === 'en' ? "Submission Failed: " + err.message : "فشل الإرسال: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white p-4 md:p-12" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">

                <div className="bg-zinc-900/50 p-5 md:p-10 rounded-[2.5rem] border border-white/5 h-fit backdrop-blur-md">
                    <h3 className={`text-[20px] md:text-[24px] font-black mb-6 md:mb-10 text-hot-pink flex items-center gap-3 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                        <ShoppingBag size={22} /> {lang === 'en' ? 'Bag Summary' : 'ملخص الحقيبة'}
                    </h3>

                    <div className="space-y-3 max-h-[450px] overflow-y-auto px-2 custom-scrollbar">
                        {cart.length === 0 && <p className="text-center text-zinc-500 py-10">{lang === 'en' ? 'Empty Bag' : 'الحقيبة فارغة'}</p>}
                        {cart.map(item => (
                            <div key={item.id} className="flex gap-3 md:gap-6 items-center bg-black/40 p-3 md:p-5 rounded-[1.5rem] border border-white/5">
                                <img src={Array.isArray(item.ImgUrl) ? item.ImgUrl[0] : item.ImgUrl} className="w-16 h-16 md:w-24 md:h-24 rounded-xl object-cover flex-shrink-0" alt={item.Name} />
                                <div className={`flex-1 min-w-0 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                                    <h4 className="text-[13px] md:text-[16px] font-bold uppercase text-white truncate">{item.Name}</h4>
                                    <p className="text-hot-pink font-black text-[12px] md:text-md mt-1">{item.Price} EGP</p>
                                    <div className="flex items-center gap-3 mt-3">
                                        <button type="button" onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 bg-zinc-800 rounded-full border-none text-white cursor-pointer flex items-center justify-center hover:bg-hot-pink transition-colors"><Minus size={12} /></button>
                                        <span className="text-[13px] font-black">{item.quantity}</span>
                                        <button type="button" onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 bg-zinc-800 rounded-full border-none text-white cursor-pointer flex items-center justify-center hover:bg-hot-pink transition-colors"><Plus size={12} /></button>
                                    </div>
                                </div>
                                <button type="button" onClick={() => removeFromCart(item.id)} className="p-2 text-zinc-700 hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer"><Trash2 size={20} /></button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                        <div className="flex justify-between text-zinc-500 text-sm md:text-lg font-bold">
                            <span>{lang === 'en' ? 'Subtotal:' : 'المنتجات:'}</span>
                            <span>{subtotal.toLocaleString()} EGP</span>
                        </div>
                        <div className="flex justify-between text-zinc-400 text-sm md:text-lg font-bold">
                            <span className="flex items-center gap-2"><Truck size={18} className="text-hot-pink" /> {lang === 'en' ? 'Shipping:' : 'التوصيل:'}</span>
                            <span className="text-white">+ {shippingFee} EGP</span>
                        </div>
                        <div className="flex justify-between text-xl md:text-2xl font-black text-hot-pink pt-5 border-t border-white/5 italic">
                            <span>{lang === 'en' ? 'Total:' : 'الإجمالي:'}</span>
                            <span>{total.toLocaleString()} EGP</span>
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-900 p-8 md:p-12 rounded-[3rem] border border-white/5 shadow-2xl h-fit">
                    <h2 className={`text-xl md:text-2xl font-black mb-10 italic uppercase border-hot-pink pr-4 ${lang === 'ar' ? 'text-right border-r-4' : 'text-left border-l-4 pl-4'}`}>
                        {lang === 'en' ? 'Delivery Details' : 'بيانات الاستلام'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <input required className={`w-full bg-black border border-white/10 p-5 rounded-2xl text-white text-[15px] font-bold outline-none focus:border-hot-pink transition-all ${lang === 'ar' ? 'text-right' : 'text-left'}`} placeholder={lang === 'en' ? "Full Name" : "الاسم بالكامل"} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        <input required type="tel" className={`w-full bg-black border border-white/10 p-5 rounded-2xl text-white text-[15px] font-bold outline-none focus:border-hot-pink font-mono transition-all ${lang === 'ar' ? 'text-right' : 'text-left'}`} placeholder={lang === 'en' ? "Phone Number" : "رقم الهاتف"} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                        <input required className={`w-full bg-black border border-white/10 p-5 rounded-2xl text-white text-[15px] font-bold outline-none focus:border-hot-pink transition-all ${lang === 'ar' ? 'text-right' : 'text-left'}`} placeholder={lang === 'en' ? "Detailed Address" : "العنوان بالتفصيل"} onChange={e => setFormData({ ...formData, address: e.target.value })} />

                        <div className="flex justify-center w-full pt-6">
                            <button
                                type="submit"
                                disabled={loading || !isFormValid}
                                className={`w-full max-w-[320px] py-4 rounded-full font-black text-[14px] uppercase text-white shadow-xl transition-all 
                                    ${!isFormValid ? 'bg-zinc-800 cursor-not-allowed opacity-50' : 'bg-hot-pink shadow-hot-pink/20 hover:scale-[1.03] active:scale-95 cursor-pointer'}`}
                            >
                                {loading ? (lang === 'en' ? "Processing..." : "جاري الطلب...") : (lang === 'en' ? "Order Now" : "اطلب الآن")}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;