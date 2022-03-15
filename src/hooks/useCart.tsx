import { createContext, ReactNode, useContext, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product, Stock } from "../types";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart");

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      // Carregar o carrinho com os dados já existentes
      const actualCart = [...cart];
      // Verificar se produto a ser adicionado existe
      const productExists = actualCart.find(
        (product) => product.id === productId
      );
      // Carregar a quantidade que existe
      const stock = await api.get(`/stock/${productId}`);
      // Declara a quantidade existente
      const stockAmount = stock.data.amount;
      // Se produto não existir declara valor = 0
      const currentAmount = productExists ? productExists.amount : 0;
      // Acrescenta 1 no valor da quantidade do produto a ser adicionado
      const amount = currentAmount + 1;
      // Verificar para não permitir solicitar valor maior que o do estoque
      if (amount > stockAmount) {
        toast.error("Quantidade solicitada fora de estoque");
      }
      //Atualizar a quantidade do produto se ele existe
      if (productExists) {
        productExists.amount = amount;
      } else {
        const product = await api.get(`/products/${productId}`);
        const newProduct = {
          ...product.data,
          amount: 1,
        };
        // Atualiza o cart com o novo produto adicionado
        actualCart.push(newProduct);
      }
      // Salva
      setCart(actualCart);
      localStorage.setItem("@RocketShoes:cart", JSON.stringify(actualCart));
    } catch {
      toast.error("Erro na adição do produto");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const removeProduct = cart.filter((product) => product.id !== productId);
      setCart(removeProduct);
    } catch {
      return toast.error("Erro na remoção do produto");
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // carrega o que já existe
      // substitui o valor inicial pelo novo
      //salva
    } catch {
      toast.error("Erro na alteração de quantidade do produto");
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
