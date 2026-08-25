import { X, Utensils, Tag, CircleDollarSign, ShoppingBag } from 'lucide-react'

export default function MealDetailsModal({ meal, onClose }: { meal: any | null; onClose: () => void }) {
  if (!meal) return null
  const discounted = meal.discount?.hasDiscount
  const finalPrice = discounted ? Math.round(meal.price * (1 - meal.discount.percentage / 100)) : meal.price

  return <div className="modal-overlay anim-fade" onClick={onClose}>
    <div className="meal-details-modal card w-full max-w-lg overflow-hidden anim-scale" onClick={event => event.stopPropagation()}>
      <div className="relative h-64 bg-alt">
        {meal.image ? <img src={meal.image} alt={meal.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-fg3"><Utensils size={52} /></div>}
        {discounted && <span className="absolute top-4 left-4 badge-danger px-3 py-1 rounded-full text-sm font-bold">-{meal.discount.percentage}%</span>}
        <button onClick={onClose} title="Close" className="absolute top-3 right-3 w-9 h-9 rounded-xl flex items-center justify-center text-fg" style={{ background: 'rgba(255,255,255,.9)' }}><X size={17} /></button>
      </div>
      <div className="p-5 space-y-4">
        <div><h2 className="text-xl font-bold text-fg" style={{ fontFamily: 'Outfit' }}>{meal.name}</h2><p className="text-sm text-fg3 mt-1">{meal.category || 'Uncategorized'}{meal.restaurant?.restaurantName ? ` · ${meal.restaurant.restaurantName}` : ''}</p></div>
        <p className="text-sm text-fg2 leading-relaxed">{meal.description || 'No description available for this meal.'}</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-alt"><CircleDollarSign size={16} className="text-red-500 mb-2" /><p className="text-xs text-fg3">Price</p><p className="font-bold text-fg">EGP {finalPrice} {discounted && <del className="text-xs text-fg3 ml-1">{meal.price}</del>}</p></div>
          <div className="p-3 rounded-xl bg-alt"><Tag size={16} className="text-amber-500 mb-2" /><p className="text-xs text-fg3">Category</p><p className="font-bold text-fg truncate">{meal.category || 'General'}</p></div>
          <div className="p-3 rounded-xl bg-alt"><ShoppingBag size={16} className="text-blue-500 mb-2" /><p className="text-xs text-fg3">Orders</p><p className="font-bold text-fg">{meal.orderCount || 0}</p></div>
          <div className="p-3 rounded-xl bg-alt"><span className={`inline-block w-2.5 h-2.5 rounded-full mb-2 ${meal.isAvailable ? 'bg-emerald-500' : 'bg-gray-400'}`} /><p className="text-xs text-fg3">Availability</p><p className="font-bold text-fg">{meal.isAvailable ? 'Available' : 'Unavailable'}</p></div>
        </div>
      </div>
    </div>
  </div>
}
