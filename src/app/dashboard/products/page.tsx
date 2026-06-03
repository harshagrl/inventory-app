"use client";

import { useState, useEffect } from "react";
import { Search, ShoppingBag, Package, Loader2, Filter } from "lucide-react";
import OrderUnitSelector from "@/components/OrderUnitSelector";
import { formatPriceINR, formatQuantity, type DisplayUnit } from "@/lib/units";
import { toast } from "react-hot-toast";

interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  category: string;
  baseUnit: "GRAM" | "MILLILITER" | "ITEM";
  basePricePaise: string;
  stockQuantityBase: number;
}

interface CartItem {
  productId: string;
  name: string;
  quantity: number;
  unit: DisplayUnit;
  pricePaise: number;
}

export default function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [categories, setCategories] = useState<string[]>(["ALL"]);
  
  // Shopping Cart / Quote State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOrdering, setIsOrdering] = useState(false);

  // Fetch products with filters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const url = new URL("/api/products", window.location.origin);
        if (searchQuery) url.searchParams.set("search", searchQuery);
        if (selectedCategory !== "ALL") url.searchParams.set("category", selectedCategory);
        
        const res = await fetch(url.toString());
        if (res.ok) {
          const data: Product[] = await res.json();
          setProducts(data);
          
          // Extract unique categories for the filter dropdown
          if (selectedCategory === "ALL" && !searchQuery) {
            const uniqueCats = Array.from(new Set(data.map(p => p.category)));
            setCategories(["ALL", ...uniqueCats]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search slightly
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  const handleAddToCart = (item: { productId: string; quantity: number; unit: DisplayUnit; pricePaise: number }, product: Product) => {
    setCart((prev) => {
      // Check if item already exists in cart, if so, we could update it, 
      // but for simplicity we'll just add it as a new line item.
      return [...prev, {
        productId: item.productId,
        name: product.name,
        quantity: item.quantity,
        unit: item.unit,
        pricePaise: item.pricePaise
      }];
    });
  };
  
  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const placeOrder = async () => {
    if (cart.length === 0) return;
    setIsOrdering(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart }),
      });
      
      if (res.ok) {
        toast.success("Order Placed Successfully!");
        setCart([]);
      } else {
        const error = await res.json();
        toast.error(`Failed to place order: ${error.error}`);
      }
    } catch (e) {
      console.error(e);
      toast.error("Network error while placing order.");
    } finally {
      setIsOrdering(false);
    }
  };

  const cartTotalPaise = cart.reduce((sum, item) => sum + item.pricePaise, 0);

  return (
    <div className="h-[calc(100vh-4rem)] bg-[#09090b] text-[#f4f4f5] flex flex-col lg:flex-row">
      {/* Main Content (Products) */}
      <div className="flex-1 p-6 lg:p-10 lg:border-r border-[#27272a] h-full overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-white mb-2">
            Catalog & Ordering
          </h1>
          <p className="text-sm text-[#a1a1aa]">
            Browse products, select your required quantities in any unit, and build your quote.
          </p>
        </header>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-[#71717a]" />
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#18181b] border border-[#27272a] rounded-xl text-white text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all"
            />
          </div>
          <div className="relative w-full sm:w-64">
            <Filter className="absolute left-3 top-2.5 h-4 w-4 text-[#71717a]" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#18181b] border border-[#27272a] rounded-xl text-white text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all appearance-none cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c === "ALL" ? "All Categories" : c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#a1a1aa]">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-violet-500" />
            <p>Loading catalog...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-[#0c0c0e] border border-[#27272a] rounded-2xl p-5 flex flex-col hover:border-[#3f3f46] transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-white text-lg line-clamp-1">{product.name}</h3>
                    <p className="text-xs text-[#a1a1aa] font-mono mt-0.5">{product.sku}</p>
                  </div>
                  <span className="px-2 py-1 bg-violet-600/10 text-violet-400 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                    {product.category}
                  </span>
                </div>
                
                <p className="text-sm text-[#71717a] line-clamp-2 mt-2 flex-1">
                  {product.description || "No description available."}
                </p>

                <div className="mt-4 pt-4 border-t border-[#27272a] grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider font-bold text-[#a1a1aa]">Price</span>
                    <span className="text-sm font-semibold text-emerald-400">
                      {formatPriceINR(product.basePricePaise)}
                      <span className="text-[#71717a] text-[10px] ml-1">
                        / {product.baseUnit === "ITEM" ? "item" : product.baseUnit === "GRAM" ? "kg" : "L"}
                      </span>
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider font-bold text-[#a1a1aa]">In Stock</span>
                    <span className="text-sm font-semibold text-white">
                      {formatQuantity(product.stockQuantityBase, product.baseUnit)}
                    </span>
                  </div>
                </div>

                <OrderUnitSelector 
                  product={product} 
                  onAddToCart={(item) => handleAddToCart(item, product)} 
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-[#27272a] rounded-2xl">
            <Package className="h-12 w-12 mx-auto text-[#3f3f46] mb-4" />
            <h3 className="text-lg font-bold text-white">No products found</h3>
            <p className="text-sm text-[#a1a1aa] mt-1">Try adjusting your search or category filters.</p>
          </div>
        )}
      </div>

      {/* Sidebar (Cart / Quote) */}
      <div className="w-full lg:w-96 bg-[#0c0c0e] border-t lg:border-t-0 border-[#27272a] flex flex-col h-full sticky top-16 lg:top-0">
        <div className="p-6 border-b border-[#27272a]">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-violet-400" />
            Current Quote
          </h2>
          <p className="text-xs text-[#a1a1aa] mt-1">
            {cart.length} item{cart.length !== 1 ? 's' : ''} added
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-[#71717a]">
              <ShoppingBag className="h-10 w-10 mb-3 opacity-20" />
              <p className="text-sm">Your quote is empty.</p>
              <p className="text-xs mt-1">Add items from the catalog.</p>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={idx} className="bg-[#18181b] p-4 rounded-xl border border-[#27272a] relative group">
                <button 
                  onClick={() => removeFromCart(idx)}
                  className="absolute top-2 right-2 text-[#71717a] hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                >
                  Remove
                </button>
                <h4 className="text-sm font-bold text-white pr-8">{item.name}</h4>
                <div className="flex justify-between items-end mt-2">
                  <span className="text-xs text-[#a1a1aa]">
                    {item.quantity} {item.unit}
                  </span>
                  <span className="text-sm font-bold text-emerald-400">
                    {formatPriceINR(item.pricePaise)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t border-[#27272a] bg-[#0c0c0e]">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm font-bold text-[#a1a1aa] uppercase tracking-wider">Total</span>
            <span className="text-2xl font-extrabold text-white">
              {formatPriceINR(cartTotalPaise)}
            </span>
          </div>

          <button
            onClick={placeOrder}
            disabled={cart.length === 0 || isOrdering}
            className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isOrdering ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShoppingBag className="h-5 w-5" />}
            Submit Order
          </button>
        </div>
      </div>
    </div>
  );
}
