import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { 
    Clock, CheckCircle2, XCircle, Trash2, User, Phone, 
    MapPin, Edit3, Save, X, Package, Languages, Search, AlertTriangle
} from 'lucide-react';

const AdminDashboard = () => {
    const [lang, setLang] = useState('ar');
    const [activeTab, setActiveTab] = useState('orders');
    const [orderFilter, setOrderFilter] = useState('pending');
    const [stockFilter, setStockFilter] = useState('ALL');
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [newProduct, setNewProduct] = useState({ Name: '', Price: '', category: '', ImgUrl: '', Stock: 0 });
    const [editingProduct, setEditingProduct] = useState(null);

    const categories = [
        { id: 'CLOTHES', ar: 'ملابس', en: 'Clothes' },
        { id: 'BAGS', ar: 'شنط', en: 'Bags' },
        { id: 'ACCESSORIES', ar: 'اكسسوارات', en: 'Accessories' },
        { id: 'SOCKS', ar: 'شرابات', en: 'Socks' }
    ];

    const t = {
        en: { orders: 'Orders', add: 'Add Product', stock: 'Stock', pending: 'Pending', completed: 'Completed', canceled: 'Canceled', all: 'All Categories' },
        ar: { orders: 'الطلبات', add: 'إضافة منتج', stock: 'المخزن', pending: 'قيد الانتظار', completed: 'تم التوصيل', canceled: 'ملغي', all: 'كل الأقسام' }
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

    const updateOrderStatus = async (id, newStatus, orderItems) => {
        const { error } = await supabase.from('Orders').update({ status: newStatus }).eq('id', id);
        
        if (!error) {
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
            setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        const imgArray = newProduct.ImgUrl.split(',').map(u => u.trim()).filter(u => u !== "");
        const { error } = await supabase.from('Products').insert([{ 
            Name: newProduct.Name,
            Price: parseFloat(newProduct.Price),
            category: newProduct.category,
            ImgUrl: imgArray,
            Stock: parseInt(newProduct.Stock)
        }]);
        if (!error) {
            setNewProduct({ Name: '', Price: '', category: '', ImgUrl: '', Stock: 0 });
            fetchProducts();
            setActiveTab('stock');
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

    const filteredOrders = orders.filter(o => 
        (o.status || 'pending') === orderFilter && 
        (o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) || o.phone.includes(searchTerm))
    );

    return (
        <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 flex flex-wrap justify-between items-center gap-6 bg-zinc-900/40 p-6 rounded-[2.5rem] border border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-hot-pink rounded-2xl flex items-center justify-center">
                            <Package size={24} color="white" />
                        </div>
                        <h1 className="text-2xl font-black italic">SHEON DASH</h1>
                    </div>
                    <nav className="flex bg-black/50 p-1.5 rounded-2xl border border-white/10">
                        {['orders', 'stock', 'add'].map((tab) => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2.5 rounded-xl font-black text-[11px] uppercase transition-all border-none cursor-pointer ${activeTab === tab ? 'bg-hot-pink text-white' : 'text-zinc-500 hover:text-white'}`}
                            >
                                {t[lang][tab]}
                            </button>
                        ))}
                    </nav>
                </header>

                {activeTab === 'orders' && (
                    <div className="space-y-6">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex gap-2">
                                {['pending', 'completed', 'canceled'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setOrderFilter(status)}
                                        className={`px-6 py-3 rounded-2xl font-black text-xs border-none cursor-pointer ${orderFilter === status ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-500'}`}
                                    >
                                        {t[lang][status]}
                                    </button>
                                ))}
                            </div>
                            <input 
                                className="bg-zinc-900 border border-white/5 py-3 px-6 rounded-2xl text-sm outline-none w-full md:w-64"
                                placeholder={lang === 'ar' ? "بحث..." : "Search..."}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {filteredOrders.map(order => (
                                <div key={order.id} className="bg-zinc-900/30 border border-white/5 p-6 rounded-[2.5rem] flex flex-wrap justify-between items-center gap-6">
                                    <div className="space-y-2">
                                        <h3 className="font-black text-xl italic">{order.customer_name}</h3>
                                        <p className="text-hot-pink font-bold text-sm">{order.phone} | {order.address}</p>
                                        <div className="flex gap-2 mt-2">
                                            {order.items?.map((item, i) => (
                                                <span key={i} className="bg-black/50 px-3 py-1 rounded-lg text-[10px] border border-white/5">
                                                    {item.Name} (x{item.quantity})
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex bg-black/60 p-2 rounded-2xl gap-2 border border-white/10">
                                        <button onClick={() => updateOrderStatus(order.id, 'pending')} className={`p-4 rounded-xl border-none cursor-pointer ${order.status === 'pending' ? 'bg-amber-500 text-black' : 'text-amber-500'}`}><Clock size={20}/></button>
                                        <button onClick={() => updateOrderStatus(order.id, 'completed', order.items)} className={`p-4 rounded-xl border-none cursor-pointer ${order.status === 'completed' ? 'bg-green-500 text-black' : 'text-green-500'}`}><CheckCircle2 size={20}/></button>
                                        <button onClick={() => updateOrderStatus(order.id, 'canceled')} className={`p-4 rounded-xl border-none cursor-pointer ${order.status === 'canceled' ? 'bg-red-500 text-black' : 'text-red-500'}`}><XCircle size={20}/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'stock' && (
                    <div className="space-y-8">
                        <div className="flex gap-2 overflow-x-auto pb-4">
                            <button onClick={() => setStockFilter('ALL')} className={`px-6 py-3 rounded-xl font-black text-xs border-none cursor-pointer ${stockFilter === 'ALL' ? 'bg-hot-pink' : 'bg-zinc-900 text-zinc-500'}`}>{t[lang].all}</button>
                            {categories.map(cat => (
                                <button key={cat.id} onClick={() => setStockFilter(cat.id)} className={`px-6 py-3 rounded-xl font-black text-xs border-none cursor-pointer ${stockFilter === cat.id ? 'bg-hot-pink' : 'bg-zinc-900 text-zinc-500'}`}>{lang === 'ar' ? cat.ar : cat.en}</button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.filter(p => stockFilter === 'ALL' || p.category === stockFilter).map(prod => (
                                <div key={prod.id} className="bg-zinc-900/40 border border-white/5 p-5 rounded-[2.5rem] hover:border-hot-pink/30 transition-all">
                                    {editingProduct?.id === prod.id ? (
                                        <div className="space-y-3">
                                            <input className="w-full bg-black border border-white/10 p-3 rounded-xl text-white outline-none" value={editingProduct.Name} onChange={e => setEditingProduct({...editingProduct, Name: e.target.value})} />
                                            <div className="flex gap-2">
                                                <div className="flex-1">
                                                    <label className="text-[9px] text-zinc-500 uppercase ml-2">Price</label>
                                                    <input type="number" className="w-full bg-black border border-white/10 p-3 rounded-xl text-hot-pink font-black outline-none" value={editingProduct.Price} onChange={e => setEditingProduct({...editingProduct, Price: e.target.value})} />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="text-[9px] text-zinc-500 uppercase ml-2">Stock</label>
                                                    <input type="number" className="w-full bg-black border border-white/10 p-3 rounded-xl text-amber-500 font-black outline-none" value={editingProduct.Stock} onChange={e => setEditingProduct({...editingProduct, Stock: e.target.value})} />
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={handleUpdateProduct} className="flex-1 bg-white text-black py-3 rounded-xl font-black uppercase text-xs cursor-pointer border-none">Save</button>
                                                <button onClick={() => setEditingProduct(null)} className="p-3 bg-zinc-800 rounded-xl text-white border-none cursor-pointer"><X size={18}/></button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="relative rounded-[1.8rem] overflow-hidden mb-4 aspect-[4/5]">
                                                <img src={Array.isArray(prod.ImgUrl) ? prod.ImgUrl[0] : prod.ImgUrl} className={`w-full h-full object-cover ${prod.Stock <= 0 ? 'grayscale opacity-40' : ''}`} />
                                                {prod.Stock <= 0 && (
                                                    <div className="absolute inset-0 flex items-center justify-center rotate-12">
                                                        <span className="bg-red-600 text-white font-black px-4 py-1 rounded text-[10px] uppercase">Sold Out</span>
                                                    </div>
                                                )}
                                                <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black border border-white/10">
                                                    QTY: {prod.Stock}
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-start mb-4 px-2">
                                                <div>
                                                    <h3 className="font-black text-xs uppercase truncate w-32">{prod.Name}</h3>
                                                    <p className="text-hot-pink font-black italic">{prod.Price} EGP</p>
                                                </div>
                                                <button onClick={() => setEditingProduct(prod)} className="p-2 bg-white/5 hover:bg-hot-pink rounded-lg border-none text-white cursor-pointer"><Edit3 size={16}/></button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'add' && (
                    <div className="max-w-xl mx-auto bg-zinc-900/40 p-10 rounded-[3rem] border border-white/5">
                        <form onSubmit={handleAddProduct} className="space-y-6">
                            <input required className="w-full bg-black border border-white/10 p-4 rounded-2xl text-white font-bold" placeholder="Product Name" value={newProduct.Name} onChange={e => setNewProduct({...newProduct, Name: e.target.value})} />
                            <div className="flex gap-4">
                                <input required type="number" className="w-full bg-black border border-white/10 p-4 rounded-2xl text-hot-pink font-black" placeholder="Price" value={newProduct.Price} onChange={e => setNewProduct({...newProduct, Price: e.target.value})} />
                                <input required type="number" className="w-full bg-black border border-white/10 p-4 rounded-2xl text-amber-500 font-black" placeholder="Initial Stock" value={newProduct.Stock} onChange={e => setNewProduct({...newProduct, Stock: e.target.value})} />
                            </div>
                            <select required className="w-full bg-black border border-white/10 p-4 rounded-2xl text-white font-bold" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                                <option value="">Category</option>
                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.ar}</option>)}
                            </select>
                            <textarea required className="w-full bg-black border border-white/10 p-4 rounded-2xl text-zinc-400 text-xs h-32" placeholder="Images" value={newProduct.ImgUrl} onChange={e => setNewProduct({...newProduct, ImgUrl: e.target.value})} />
                            <button type="submit" className="w-full bg-hot-pink py-5 rounded-2xl font-black uppercase text-white border-none shadow-xl cursor-pointer">Publish Item</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;