import React from 'react';

const CategoryFilter = ({ activeCategory, onFilterChange }) => {
    // جلب اللغة من localStorage لضمان التزامن
    const lang = localStorage.getItem('lang') || 'en';

    const categories = [
        { id: 'ALL', ar: 'الكل', en: 'All' },
        { id: 'CLOTHES', ar: 'ملابس', en: 'Clothes' },
        { id: 'BAGS', ar: 'شنط', en: 'Bags' },
        { id: 'ACCESSORIES', ar: 'اكسسوارات', en: 'Accessories' },
        { id: 'SOCKS', ar: 'شرابات', en: 'Socks' }
    ];

    return (
        <div 
            className="flex flex-wrap justify-center gap-3 mb-10 relative z-50" 
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
        >
            {categories.map(cat => (
                <button 
                    key={cat.id}
                    onClick={() => onFilterChange(cat.id)}
                    className={`px-6 py-2 rounded-full text-[15px] font-black uppercase tracking-widest transition-all cursor-pointer border
                    ${activeCategory === cat.id 
                        ? 'bg-hot-pink text-white border-hot-pink shadow-[0_0_15px_rgba(255,105,180,0.5)]' 
                        : 'bg-white/5 text-zinc-400 border-white/10 hover:border-hot-pink hover:text-white'}`}
                >
                    {lang === 'en' ? cat.en : cat.ar}
                </button>
            ))}
        </div>
    );
};

export default CategoryFilter;