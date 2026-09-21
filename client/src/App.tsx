import { BrowserRouter, Route, Routes } from "react-router";
import { RootLayout } from "@/components/layout/RootLayout";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { SignInPage } from "@/features/auth/SignInPage";
import { CartProvider } from "@/features/cart/CartProvider";
import { CartPage } from "@/features/cart/CartPage";
import { CheckoutPage } from "@/features/checkout/CheckoutPage";
import { LandingPage } from "@/features/landing/LandingPage";
import { MenuPage } from "@/features/menu/MenuPage";
import { MyOrdersPage } from "@/features/orders/MyOrdersPage";
import { OrderDetailPage } from "@/features/orders/OrderDetailPage";
import { ProfilePage } from "@/features/profile/ProfilePage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route element={<RootLayout />}>
              <Route index element={<LandingPage />} />
              <Route path="menu" element={<MenuPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="signin" element={<SignInPage />} />

              {/* Signed-in customers */}
              <Route element={<ProtectedRoute />}>
                <Route path="checkout" element={<CheckoutPage />} />
                <Route path="orders" element={<MyOrdersPage />} />
                <Route path="orders/:id" element={<OrderDetailPage />} />
                <Route path="account" element={<ProfilePage />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
          <Toaster position="top-center" richColors closeButton />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
