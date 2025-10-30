import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ThemeState {
  theme: string;
  mode: "light" | "dark";
  direction: "LTR" | "RTL";
}

const initialState: ThemeState = {
  theme: "color-primary",
  mode: "light",
  direction: "LTR",
};

export const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<string>) => {
      state.theme = action.payload;
      if (typeof window !== "undefined") localStorage.setItem("theme", action.payload);
    },
    setDirection: (state, action: PayloadAction<"LTR" | "RTL">) => {
      state.direction = action.payload;
      if (typeof window !== "undefined") localStorage.setItem("direction", action.payload);
    },
    toggleMode: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
      if (typeof window !== "undefined") localStorage.setItem("mode", state.mode);
    },
  },
});

export const { setTheme, toggleMode, setDirection } = themeSlice.actions;
export default themeSlice.reducer;
