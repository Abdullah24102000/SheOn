import React from 'react';

const CategoryFilter = ({ activeCategory, onFilterChange }) => {
    // جلب اللغة من localStorage لضمان التزامن
    const lang = localStorage.getItem('lang') || 'ar'; // خليت الديفولت عربي

    const categories = [
        { id: 'ALL', ar: 'الكل', en: 'All' },
        { id: 'SUPERMARKET', ar: 'السوبر ماركت', en: 'Supermarket' },
        { id: 'RESTAURANTS', ar: 'المطاعم', en: 'Restaurants' },
        { id: 'PERSONAL_DELIVERY', ar: 'التوصيل الشخصي', en: 'Personal Delivery' }
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
                    {lang === 'ar' ? cat.ar : cat.en}
                </button>
            ))}
        </div>
    );
};

export default CategoryFilter;