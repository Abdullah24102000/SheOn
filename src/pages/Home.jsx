import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import ProductCard from '../components/ProductCard';
import Hero from '../components/Hero';
import CategoryFilter from '../components/CategoryFilter';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  
  // جلب اللغة الحالية
  const lang = localStorage.getItem('lang') || 'en';

  const activeCategory = searchParams.get('category') || 'ALL';

  // خريطة لترجمة أسماء الأقسام في العناوين
  const categoryNames = {
    'ALL': lang === 'en' ? 'All' : 'كل',
    'CLOTHES': lang === 'en' ? 'Clothes' : 'ملابس',
    'BAGS': lang === 'en' ? 'Bags' : 'شنط',
    'ACCESSORIES': lang === 'en' ? 'Accessories' : 'إكسسوارات',
    'SOCKS': lang === 'en' ? 'Socks' : 'شرابات'
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let query = supabase.from('Products').select('*');
        
        if (activeCategory !== 'ALL') {
          query = query.eq('category', activeCategory);
        }

        const { data, error } = await query.order('id', { ascending: false });
        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        console.error("Error:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [activeCategory]);

  const handleFilterChange = (cat) => {
    if (cat === 'ALL') {
      setSearchParams({});
    } else {
      setSearchParams({ category: cat });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-hot-pink border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Hero products={products} />

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col mb-12 text-right items-end">
          <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase">
            {categoryNames[activeCategory]} <span className="text-hot-pink">{lang === 'en' ? 'Collections' : 'التشكيلات'}</span>
          </h2>
          <div className="w-20 h-1.5 bg-hot-pink mt-4"></div>
        </div>

        <CategoryFilter 
          activeCategory={activeCategory} 
          onFilterChange={handleFilterChange} 
        />

        {products.length === 0 ? (
          <div className="text-center py-20 text-gray-600 font-black uppercase tracking-[0.3em]">
            {lang === 'en' ? 'No Products Found' : 'لا توجد منتجات حالياً'}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      <footer className="py-10 border-t border-white/5 text-center">
      <p className="text-white text-[10px] font-black tracking-[0.5em] uppercase leading-relaxed">Developed By 
    <a 
        href="https://react-portf-abdallah.vercel.app/" 
        target="_blank" 
        rel="Abdallah Hassan"
        className="text-[#0070FF] hover:text-blue-400 transition-colors ml-2 cursor-pointer no-underline"
    >
        Abdullah Hassan
    </a>
    <br/>
    SHEON &copy; 2026
</p>
      </footer>
    </div>
  );
};

export default Home;