import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface Item {
  id: number;
  title: string;
  oldPrice: number;
  waight: string;
  image: string;
  imageTwo: string;
  date: string;
  status: string;
  rating: number;
  newPrice: number;
  location: string;
  brand: string;
  sku: number;
  category: string;
  quantity: number;
}

export interface CounterState {
  items: Item[];
  orders: object[];
  isSwitchOn: boolean;
}

const defaultItems: Item[] = [];

const defaultOrders: object[] = [];

const initialState: CounterState = {
  items: defaultItems,
  orders: defaultOrders,
  isSwitchOn: false,
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setItems(state, action: PayloadAction<Item[]>) {
      state.items = action.payload;
    },
    addItem(state, action: PayloadAction<Item>) {
      state.items.push(action.payload);
      if (typeof window !== "undefined") {
        localStorage.setItem("products", JSON.stringify(state.items));
      }
    },
    removeItem(state, action: PayloadAction<number>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
      if (typeof window !== "undefined") {
        localStorage.setItem("products", JSON.stringify(state.items));
      }
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ id: number; quantity: number }>
    ) => {
      const { id, quantity } = action.payload;
      const itemToUpdate = state.items.find((item) => item.id === id);
      if (itemToUpdate) {
        itemToUpdate.quantity = quantity;
        if (typeof window !== "undefined") {
          localStorage.setItem("products", JSON.stringify(state.items));
        }
      }
    },
    addOrder(state, action: PayloadAction<any>) {
      const newOrder = action.payload;
      const loginUser =
        typeof window !== "undefined"
          ? JSON.parse(localStorage.getItem("login_user") || "{}")
          : {};
      const loginUserID = loginUser?.uid ?? "NOLOGIN";
      if (loginUserID) {
        const storedOrders = JSON.parse(localStorage.getItem("orders") || "{}");
        let userOrders = storedOrders[loginUserID] || defaultOrders;

        if (newOrder) {
          userOrders = [...userOrders, newOrder];
          storedOrders[loginUserID] = userOrders;
          localStorage.setItem("orders", JSON.stringify(storedOrders));
        }
        state.orders = userOrders;
      }
    },
    setOrders(state, action: PayloadAction<any[]>) {
      state.orders = action.payload;
    },
    clearCart: (state) => {
      state.items = [];
      if (typeof window !== "undefined") {
        localStorage.setItem("products", JSON.stringify(state.items));
      }
    },
    toggleSwitch: (state) => {
      state.isSwitchOn = !state.isSwitchOn;
      if (typeof window !== "undefined") {
        localStorage.setItem("switch", JSON.stringify(state.isSwitchOn));
      }
    },
    setSwitchOn: (state, action: PayloadAction<boolean>) => {
      state.isSwitchOn = action.payload;
    },
    updateItemQuantity: (state, action) => {
      state.items = action.payload;
    },
  },
});

export const {
  setItems,
  addItem,
  removeItem,
  updateQuantity,
  addOrder,
  setOrders,
  clearCart,
  toggleSwitch,
  setSwitchOn,
  updateItemQuantity,
} = cartSlice.actions;

export default cartSlice.reducer;
