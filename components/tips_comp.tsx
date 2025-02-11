import React, { useState, useMemo } from 'react';
import { 
  Car, 
  ShoppingBag, 
  Trash2, 
  Zap, 
  Leaf,
  Droplet,
  TreePine
} from 'lucide-react';

const CATEGORY_ICONS = {
  'Transportation': Car,
  'Energy Efficiency': Zap,
  'Water Consumption': Droplet,
  'Waste Management': Trash2,
  'Food and Diet': TreePine,
  'Clothing': ShoppingBag
};

const SustainabilityTips: React.FC<{ tips: string }> = ({ tips }) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const parsedTips = useMemo(() => {
    // Split by category headers, using regex to capture headers between **
    const sections = tips.match(/\*\*(.*?)\*\*([\s\S]*?)(?=\*\*|$)/g) || [];
    
    const processedTips = sections.map(section => {
      // Extract category (first line between **)
      const categoryMatch = section.match(/\*\*(.*?)\*\*/);
      const category = categoryMatch ? categoryMatch[1].trim() : 'Other';
      
      // Extract tips (lines starting with '- ')
      const tipsList = (section.match(/^-\s(.+)$/gm) || [])
        .map(tip => tip.replace(/^-\s/, '').trim());
      
      return {
        category,
        tips: tipsList
      };
    }).filter(section => section.tips.length > 0);

    // Set initial category if not set
    if (!activeCategory && processedTips.length > 0) {
      setActiveCategory(processedTips[0].category);
    }

    return processedTips;
  }, [tips]);

  const activeCategoryDetails = parsedTips.find(
    section => section.category === activeCategory
  );

  return (
    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-3xl shadow-2xl max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-green-900 flex items-center justify-center">
          <Leaf className="mr-4 text-green-600" />
          Your Personalized Sustainability Guide
        </h1>
      </div>

      {/* Category Selector */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {parsedTips.map((section) => {
          const IconComponent = CATEGORY_ICONS[section.category as keyof typeof CATEGORY_ICONS] || Leaf;
          
          return (
            <button
              key={section.category}
              onClick={() => setActiveCategory(section.category)}
              className={`
                flex items-center px-4 py-2 rounded-full 
                transition-all duration-300 
                ${activeCategory === section.category 
                  ? 'bg-green-600 text-white shadow-lg' 
                  : 'bg-green-100 text-green-800 hover:bg-green-200'}
              `}
            >
              <IconComponent className="mr-2 w-5 h-5" />
              {section.category}
            </button>
          );
        })}
      </div>

      {/* Active Category Details */}
      {activeCategoryDetails && (
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-2xl font-semibold text-green-800 mb-4 flex items-center">
            {CATEGORY_ICONS[activeCategoryDetails.category as keyof typeof CATEGORY_ICONS] && React.createElement(CATEGORY_ICONS[activeCategoryDetails.category as keyof typeof CATEGORY_ICONS], { className: "mr-3 text-green-600" })}
            {activeCategoryDetails.category}
          </h2>

          <ul className="space-y-3">
            {activeCategoryDetails.tips.map((tip, index) => (
              <li 
                key={index} 
                className="text-gray-700 text-base flex items-start"
              >
                <span className="mr-3 text-green-600 font-bold mt-1">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SustainabilityTips;