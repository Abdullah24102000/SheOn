import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { 
    Clock, CheckCircle2, XCircle, Trash2, Edit3, Save, X, Package, Trash, Plus, Info
} from 'lucide-react';

const AdminDashboard = () => {
    const [lang, setLang] = useState('ar');
    const [activeTab, setActiveTab] = useState('orders');
    const [orderFilter, setOrderFilter] = useState('all');
    const [stockFilter, setStockFilter] = useState('ALL');
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    const shippingFee = 50; 

    const [newProduct, setNewProduct] = useState({ Name: '', Price: '', category: '', ImgUrl: '', Stock: 0 });
    const [editingProduct, setEditingProduct] = useState(null);

    const categories = [
        { id: 'CLOTHES', ar: 'ملابس', en: 'Clothes' },
        { id: 'BAGS', ar: 'شنط', en: 'Bags' },
        { id: 'ACCESSORIES', ar: 'اكسسوارات', en: 'Accessories' },
        { id: 'SOCKS', ar: 'شرابات', en: 'Socks' }
    ];

    const t = {
        en: { orders: 'Orders', add: 'Add Product', stock: 'Stock', pending: 'Pending', completed: 'Completed', canceled: 'Canceled', all: 'All', categoriesAll: 'All Categories' },
        ar: { orders: 'الطلبات', add: 'إضافة منتج', stock: 'المخزن', pending: 'قيد الانتظار', completed: 'تم التوصيل', canceled: 'ملغي', all: 'الكل', categoriesAll: 'كل الأقسام' }
    };

    useEffect(() => {
        fetchOrders();
        fetchProducts();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        const { data } = await supabase.from('Orders').select('*').order('created_at', { ascending: false });
        setOrders(data || []);
        setLoading(false);
    };

    const fetchProducts = async () => {
        const { data } = await supabase.from('Products').select('*').order('id', { ascending: false });
        setProducts(data || []);
    };

    const getPendingAnalysis = () => {
        const pendingOrders = orders.filter(o => (o.status || 'pending') === 'pending');
        const summary = {};
        pendingOrders.forEach(order => {
            order.items?.forEach(item => {
                if (summary[item.id]) {
                    summary[item.id].required += (item.quantity || 1);
                } else {
                    const currentProd = products.find(p => p.id === item.id);
                    summary[item.id] = {
                        name: item.Name,
                        required: (item.quantity || 1),
                        inStock: currentProd ? currentProd.Stock : 0,
                        img: Array.isArray(item.ImgUrl) ? item.ImgUrl[0] : item.ImgUrl
                    };
                }
            });
        });
        return Object.values(summary);
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            const imgArray = newProduct.ImgUrl.split(',').map(u => u.trim()).filter(u => u !== "");
            const { error } = await supabase.from('Products').insert([{ 
                Name: newProduct.Name,
                Price: parseFloat(newProduct.Price),
                category: newProduct.category,
                ImgUrl: imgArray,
                Stock: parseInt(newProduct.Stock)
            }]);
            if (error) throw error;
            setNewProduct({ Name: '', Price: '', category: '', ImgUrl: '', Stock: 0 });
            fetchProducts();
            setActiveTab('stock');
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        const imgArray = typeof editingProduct.ImgUrl === 'string' 
            ? editingProduct.ImgUrl.split(',').map(u => u.trim()).filter(u => u !== "") 
            : editingProduct.ImgUrl;
        const { error } = await supabase.from('Products').update({ 
            Name: editingProduct.Name,
            Price: parseFloat(editingProduct.Price),
            category: editingProduct.category,
            ImgUrl: imgArray,
            Stock: parseInt(editingProduct.Stock)
        }).eq('id', editingProduct.id);
        if (!error) {
            setEditingProduct(null);
            fetchProducts();
        }
    };

    const deleteProduct = async (id) => {
        if (window.confirm(lang === 'ar' ? 'حذف المنتج؟' : 'Delete?')) {
            await supabase.from('Products').delete().eq('id', id);
            fetchProducts();
        }
    };

    const deleteOrder = async (id) => {
        if (window.confirm(lang === 'ar' ? 'هل أنت متأكد من مسح الأوردر نهائياً؟' : 'Delete order?')) {
            const { error } = await supabase.from('Orders').delete().eq('id', id);
            if (!error) setOrders(orders.filter(o => o.id !== id));
        }
    };

    const updateOrderStatus = async (id, newStatus, orderItems) => {
        const { error } = await supabase.from('Orders').update({ status: newStatus }).eq('id', id).select();
        if (error) return;
        setOrders(prevOrders => prevOrders.map(o => o.id === id ? { ...o, status: newStatus } : o));
        if (newStatus === 'completed' && orderItems) {
            for (const item of orderItems) {
                const { data: currentProd } = await supabase.from('Products').select('Stock').eq('id', item.id).single();
                if (currentProd) {
                    const newStockValue = Math.max(0, currentProd.Stock - (item.quantity || 1));
                    await supabase.from('Products').update({ Stock: newStockValue }).eq('id', item.id);
                }
            }
            fetchProducts();
        }
    };

    const calculateOrderTotal = (items) => {
        const subtotal = items?.reduce((acc, item) => acc + (item.Price * (item.quantity || 1)), 0) || 0;
        return { subtotal, total: subtotal + shippingFee };
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'completed': return 'border-green-500/50 shadow-green-500/5';
            case 'canceled': return 'border-red-500/50 shadow-red-500/5';
            default: return 'border-amber-500/50 shadow-amber-500/5';
        }
    };

    const pendingAnalysis = getPendingAnalysis();

    return (
        <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 flex flex-wrap justify-between items-center gap-6 bg-zinc-900/40 p-6 rounded-[2.5rem] border border-white/5 backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-hot-pink rounded-2xl flex items-center justify-center shadow-lg shadow-hot-pink/30">
                            <Package size={24} color="white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black italic tracking-tighter leading-none">SHEON DASH</h1>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1 font-bold italic">Control Center</p>
                        </div>
                    </div>
                    <nav className="flex bg-black/50 p-1.5 rounded-2xl border border-white/10">
                        {['orders', 'stock', 'add'].map((tab) => (
                            <button key={tab} onClick={() => { setActiveTab(tab); setSearchTerm(''); }} className={`px-6 py-2.5 rounded-xl font-black text-[11px] uppercase transition-all border-none cursor-pointer ${activeTab === tab ? 'bg-hot-pink text-white shadow-lg shadow-hot-pink/20' : 'text-zinc-500 hover:text-white'}`}>
                                {t[lang][tab]}
                            </button>
                        ))}
                    </nav>
                </header>

                {activeTab === 'orders' && (
                    <div className="space-y-10">
                        {pendingAnalysis.length > 0 && (
                            <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-6 backdrop-blur-md">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="bg-amber-500/20 p-2 rounded-xl text-amber-500"><Info size={20}/></div>
                                    <h2 className="text-lg font-black italic uppercase tracking-tight">{lang === 'ar' ? 'تحليل الطلبات المعلقة' : 'Pending Analysis'}</h2>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {pendingAnalysis.map((item, idx) => {
                                        const isShortage = item.inStock < item.required;
                                        return (
                                            <div key={idx} className={`p-3 rounded-3xl border ${isShortage ? 'border-red-500/40 bg-red-500/5' : 'border-white/5 bg-black/20'}`}>
                                                <img src={item.img} className="w-full h-20 object-cover rounded-2xl mb-2" />
                                                <p className="text-[10px] font-bold truncate text-zinc-400 uppercase">{item.name}</p>
                                                <div className="flex justify-between items-end mt-2">
                                                    <div><p className="text-[9px] text-zinc-500">مطلوب</p><p className="text-sm font-black">{item.required}</p></div>
                                                    <div className="text-left"><p className="text-[9px] text-zinc-500">متاح</p><p className={`text-sm font-black ${isShortage ? 'text-red-500' : 'text-green-500'}`}>{item.inStock}</p></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex gap-2 bg-zinc-900/50 p-1.5 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
                                {['all', 'pending', 'completed', 'canceled'].map((status) => (
                                    <button key={status} onClick={() => setOrderFilter(status)} className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase border-none cursor-pointer whitespace-nowrap transition-all ${orderFilter === status ? 'bg-white text-black' : 'text-zinc-500 hover:text-zinc-300'}`}>
                                        {t[lang][status]}
                                    </button>
                                ))}
                            </div>
                            <input className="bg-zinc-900 border border-white/5 py-3.5 px-6 rounded-2xl text-sm outline-none w-full md:w-64 focus:border-hot-pink/50 transition-all" placeholder={lang === 'ar' ? "بحث في الطلبات..." : "Search orders..."} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                            {orders.filter(o => (orderFilter === 'all' || (o.status || 'pending') === orderFilter) && (o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || o.phone?.includes(searchTerm))).map(order => {
                                const { total } = calculateOrderTotal(order.items);
                                return (
                                    <div key={order.id} className={`bg-zinc-900/30 border-2 ${getStatusColor(order.status)} p-6 rounded-[2.5rem] transition-all h-auto`}>
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h3 className="font-black text-xl italic uppercase leading-none">{order.customer_name}</h3>
                                                <p className="text-hot-pink font-bold text-sm mt-2">{order.phone}</p>
                                                <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] mt-2 font-bold uppercase"><Clock size={12}/> {new Date(order.created_at).toLocaleString('ar-EG')}</div>
                                            </div>
                                        </div>
                                        <div className="space-y-4 mb-6">
                                            <div className="grid grid-cols-2 gap-3">
                                                {order.items?.map((item, i) => {
                                                    const currentProd = products.find(p => p.id === item.id);
                                                    const hasStock = currentProd && currentProd.Stock >= (item.quantity || 1);
                                                    return (
                                                        <div key={i} className={`bg-black/40 rounded-3xl p-2 border ${hasStock ? 'border-white/5' : 'border-red-500/30'}`}>
                                                            <img src={Array.isArray(item.ImgUrl) ? item.ImgUrl[0] : item.ImgUrl} className="w-full h-24 object-cover rounded-2xl mb-2" />
                                                            <div className="px-1 flex justify-between items-center">
                                                                <p className="text-[9px] font-black truncate text-zinc-300 uppercase italic w-2/3">{item.Name}</p>
                                                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${hasStock ? 'bg-white/10 text-white' : 'bg-red-500 text-white'}`}>x{item.quantity}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div className="bg-black/40 p-4 rounded-[2rem] border border-white/5">
                                                <p className="text-[11px] text-zinc-300 leading-relaxed"><Plus size={10} className="inline mr-1 text-hot-pink"/>{order.address}</p>
                                                <div className="pt-3 border-t border-white/5 mt-3 flex justify-between items-center">
                                                    <span className="font-black text-xs uppercase italic text-zinc-300">Total</span>
                                                    <span className="text-xl font-black text-white italic">{total} <span className="text-[10px] not-italic text-zinc-500">EGP</span></span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex bg-black/60 p-2 rounded-2xl gap-2 border border-white/10">
                                            <button onClick={() => updateOrderStatus(order.id, 'pending')} className={`flex-1 py-3 rounded-xl border-none cursor-pointer flex justify-center transition-all ${order.status === 'pending' ? 'bg-amber-500 text-black' : 'text-amber-500 hover:bg-white/5'}`}><Clock size={18}/></button>
                                            <button onClick={() => updateOrderStatus(order.id, 'completed', order.items)} className={`flex-1 py-3 rounded-xl border-none cursor-pointer flex justify-center transition-all ${order.status === 'completed' ? 'bg-green-500 text-black' : 'text-green-500 hover:bg-white/5'}`}><CheckCircle2 size={18}/></button>
                                            <button onClick={() => updateOrderStatus(order.id, 'canceled')} className={`flex-1 py-3 rounded-xl border-none cursor-pointer flex justify-center transition-all ${order.status === 'canceled' ? 'bg-red-500 text-black' : 'text-red-500 hover:bg-white/5'}`}><XCircle size={18}/></button>
                                            <button onClick={() => deleteOrder(order.id)} className="flex-1 py-3 rounded-xl border-none cursor-pointer flex justify-center bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white transition-all"><Trash2 size={18}/></button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {activeTab === 'stock' && (
                    <div className="space-y-8">
                        <div className="flex flex-wrap items-center justify-between gap-6">
                            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                                <button onClick={() => setStockFilter('ALL')} className={`px-7 py-3.5 rounded-xl font-black text-[10px] uppercase border-none cursor-pointer whitespace-nowrap transition-all ${stockFilter === 'ALL' ? 'bg-hot-pink text-white shadow-lg shadow-hot-pink/20' : 'bg-zinc-900 text-zinc-500 hover:text-white'}`}>{t[lang].categoriesAll}</button>
                                {categories.map(cat => (
                                    <button key={cat.id} onClick={() => setStockFilter(cat.id)} className={`px-7 py-3.5 rounded-xl font-black text-[10px] uppercase border-none cursor-pointer whitespace-nowrap transition-all ${stockFilter === cat.id ? 'bg-hot-pink text-white' : 'bg-zinc-900 text-zinc-500 hover:text-white'}`}>{lang === 'ar' ? cat.ar : cat.en}</button>
                                ))}
                            </div>
                            <div className="w-full md:w-80">
                                <input className="w-full bg-zinc-900 border border-white/5 py-4 px-6 rounded-2xl text-sm outline-none focus:border-hot-pink/50 transition-all shadow-inner" placeholder={lang === 'ar' ? "ابحث باسم المنتج في المخزن..." : "Search in stock..."} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {products.filter(p => (stockFilter === 'ALL' || p.category === stockFilter) && p.Name.toLowerCase().includes(searchTerm.toLowerCase())).map(prod => (
                                <div key={prod.id} className="bg-zinc-900/30 border border-white/5 p-5 rounded-[2.8rem] hover:border-hot-pink/30 transition-all flex flex-col group">
                                    {editingProduct?.id === prod.id ? (
                                        <div className="space-y-4 p-2">
                                            <input className="w-full bg-black border border-white/10 p-4 rounded-2xl text-white outline-none text-xs font-bold" value={editingProduct.Name} onChange={e => setEditingProduct({...editingProduct, Name: e.target.value})} />
                                            <div className="grid grid-cols-2 gap-3">
                                                <input type="number" className="w-full bg-black border border-white/10 p-4 rounded-2xl text-hot-pink font-black outline-none text-xs" value={editingProduct.Price} onChange={e => setEditingProduct({...editingProduct, Price: e.target.value})} />
                                                <input type="number" className="w-full bg-black border border-white/10 p-4 rounded-2xl text-amber-500 font-black outline-none text-xs" value={editingProduct.Stock} onChange={e => setEditingProduct({...editingProduct, Stock: e.target.value})} />
                                            </div>
                                            <select className="w-full bg-black border border-white/10 p-4 rounded-2xl text-white outline-none text-xs font-bold" value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}>
                                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.ar}</option>)}
                                            </select>
                                            <textarea className="w-full bg-black border border-white/10 p-4 rounded-2xl text-zinc-400 text-[10px] h-24 outline-none" value={editingProduct.ImgUrl} onChange={e => setEditingProduct({...editingProduct, ImgUrl: e.target.value})} />
                                            <div className="flex gap-2">
                                                <button onClick={handleUpdateProduct} className="flex-1 bg-white text-black py-4 rounded-2xl font-black uppercase text-[10px] cursor-pointer border-none flex items-center justify-center gap-2 hover:bg-hot-pink hover:text-white transition-all"><Save size={14}/> Save</button>
                                                <button onClick={() => setEditingProduct(null)} className="p-4 bg-zinc-800 rounded-2xl text-white border-none cursor-pointer"><X size={18}/></button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="relative rounded-[2.2rem] overflow-hidden mb-5 aspect-[4/5]">
                                                <img src={Array.isArray(prod.ImgUrl) ? prod.ImgUrl[0] : prod.ImgUrl} className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${prod.Stock <= 0 ? 'grayscale opacity-40' : ''}`} />
                                                <div className="absolute top-4 left-4 bg-black/60 px-3 py-1 rounded-full text-[8px] font-black border border-white/10 uppercase">{prod.category}</div>
                                                <div className="absolute bottom-4 right-4 bg-black/70 px-4 py-2 rounded-2xl text-[10px] font-black border border-white/10">QTY: <span className={prod.Stock <= 0 ? "text-red-500" : "text-white"}>{prod.Stock}</span></div>
                                            </div>
                                            <div className="px-2 pb-2">
                                                <h3 className="font-black text-[13px] uppercase italic truncate mb-1">{prod.Name}</h3>
                                                <div className="flex justify-between items-center">
                                                    <p className="text-hot-pink font-black text-xl italic tracking-tighter">{prod.Price} <span className="text-[10px] not-italic text-zinc-500 ml-1">EGP</span></p>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => setEditingProduct(prod)} className="p-2.5 bg-white/5 hover:bg-hot-pink rounded-xl border-none text-white cursor-pointer transition-all"><Edit3 size={16}/></button>
                                                        <button onClick={() => deleteProduct(prod.id)} className="p-2.5 bg-white/5 hover:bg-red-600 rounded-xl border-none text-white cursor-pointer transition-all"><Trash size={16}/></button>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'add' && (
                    <div className="max-w-xl mx-auto bg-zinc-900/40 p-10 rounded-[3.5rem] border border-white/5 shadow-2xl backdrop-blur-xl">
                        <form onSubmit={handleAddProduct} className="space-y-6">
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Add Item</h2>
                                <div className="h-1 w-12 bg-hot-pink mx-auto mt-3 rounded-full"></div>
                            </div>
                            <input required className="w-full bg-black border border-white/10 p-5 rounded-2xl text-white font-bold outline-none focus:border-hot-pink/50 transition-all" placeholder="Product Name" value={newProduct.Name} onChange={e => setNewProduct({...newProduct, Name: e.target.value})} />
                            <div className="grid grid-cols-2 gap-4">
                                <input required type="number" className="w-full bg-black border border-white/10 p-5 rounded-2xl text-hot-pink font-black outline-none focus:border-hot-pink/50" placeholder="Price" value={newProduct.Price} onChange={e => setNewProduct({...newProduct, Price: e.target.value})} />
                                <input required type="number" className="w-full bg-black border border-white/10 p-5 rounded-2xl text-amber-500 font-black outline-none focus:border-hot-pink/50" placeholder="Stock" value={newProduct.Stock} onChange={e => setNewProduct({...newProduct, Stock: e.target.value})} />
                            </div>
                            <select required className="w-full bg-black border border-white/10 p-5 rounded-2xl text-white font-bold outline-none focus:border-hot-pink/50 cursor-pointer appearance-none" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                                <option value="">Select Category</option>
                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.ar}</option>)}
                            </select>
                            <textarea required className="w-full bg-black border border-white/10 p-5 rounded-2xl text-zinc-400 text-xs h-32 outline-none focus:border-hot-pink/50 resize-none" placeholder="Image URLs (comma separated)" value={newProduct.ImgUrl} onChange={e => setNewProduct({...newProduct, ImgUrl: e.target.value})} />
                            <button type="submit" className="w-full bg-hot-pink py-5 rounded-[2rem] font-black uppercase text-sm text-white border-none shadow-xl shadow-hot-pink/20 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all">Publish Item</button>
                        </form>
                    </div>
                )}
            </div>
            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default AdminDashboard;