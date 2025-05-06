import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { applyHoodiePromotion, applyTshirtPromotion } from "@/lib/utils";

type CartItem = {
  productId: number;
  quantity: number;
  size: string;
  price: number;
  name: string;
  imageUrl: string;
  category: string;
  isFree?: boolean;
};

interface CartContextProps {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: number, size: string) => void;
  updateCartItemQuantity: (productId: number, size: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  freeShipping: boolean;
  applyPromotions: () => void;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [freeShipping, setFreeShipping] = useState(false);
  const { toast } = useToast();

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
    
    // Calculate cart total
    const total = cartItems.reduce((sum, item) => {
      if (item.isFree) return sum;
      return sum + (item.price * item.quantity);
    }, 0);
    
    setCartTotal(total);
    
    // Check if free shipping applies
    setFreeShipping(total >= 500);
  }, [cartItems]);

  const addToCart = (item: CartItem) => {
    setCartItems(prevItems => {
      // Check if the item already exists in the cart (same product ID and size)
      const existingItemIndex = prevItems.findIndex(
        i => i.productId === item.productId && i.size === item.size
      );
      
      if (existingItemIndex >= 0) {
        // Update quantity if the item exists
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + item.quantity
        };
        
        toast({
          title: "Produit ajouté au panier",
          description: `Quantité mise à jour: ${updatedItems[existingItemIndex].quantity}`,
        });
        
        return updatedItems;
      } else {
        // Add new item if it doesn't exist
        toast({
          title: "Produit ajouté au panier",
          description: `${item.name} - Taille: ${item.size}`,
        });
        
        return [...prevItems, item];
      }
    });
  };

  const removeFromCart = (productId: number, size: string) => {
    setCartItems(prevItems => 
      prevItems.filter(item => !(item.productId === productId && item.size === size))
    );
    
    toast({
      title: "Produit retiré du panier",
    });
  };

  const updateCartItemQuantity = (productId: number, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.productId === productId && item.size === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cart");
  };

  const applyPromotions = () => {
    // Create a copy of the cart items without any free items
    const itemsWithoutPromos = cartItems.map(item => ({ ...item, isFree: false }));
    
    // Get hoodie items and apply promotion
    const hoodieItems = itemsWithoutPromos.filter(item => item.category === 'hoodie');
    const { paidItems: paidHoodies, freeItems: freeHoodies } = applyHoodiePromotion(hoodieItems);
    
    // Get t-shirt items and apply promotion
    const tshirtItems = itemsWithoutPromos.filter(item => item.category === 'tshirt');
    const { paidItems: paidTshirts, freeItems: freeTshirts } = applyTshirtPromotion(tshirtItems);
    
    // Combine all items back together
    const otherItems = itemsWithoutPromos.filter(
      item => item.category !== 'hoodie' && item.category !== 'tshirt'
    );
    
    // Mark free items
    const allFreeItems = [...freeHoodies, ...freeTshirts].map(item => ({
      ...item,
      isFree: true
    }));
    
    const newCartItems = [...paidHoodies, ...paidTshirts, ...otherItems, ...allFreeItems];
    
    setCartItems(newCartItems);
    
    if (allFreeItems.length > 0) {
      toast({
        title: "Promotions appliquées",
        description: `${allFreeItems.length} produit(s) gratuit(s) ajouté(s)`,
      });
    }
  };

  // Apply promotions when cart changes
  useEffect(() => {
    if (cartItems.length > 0) {
      applyPromotions();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        cartTotal,
        freeShipping,
        applyPromotions,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
