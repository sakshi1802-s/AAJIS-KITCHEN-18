import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import { RootLayout } from "@/components/layout/RootLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { OwnerLoginPage } from "@/features/auth/OwnerLoginPage";
import { SignInPage } from "@/features/auth/SignInPage";
import { CartProvider } from "@/features/cart/CartProvider";
import { CartPage } from "@/features/cart/CartPage";
import { PlateBar } from "@/features/cart/PlateBar";
import { LandingPage } from "@/features/landing/LandingPage";
import { MenuPage } from "@/features/menu/MenuPage";
import { MyOrdersPage } from "@/features/orders/MyOrdersPage";
import { OrderDetailPage } from "@/features/orders/OrderDetailPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

// Kept out of the first download: Aaji is one person, and most customers never
// open the planner, the profile page or checkout on their first visit.
const CheckoutPage = lazy(() =>
  import("@/features/checkout/CheckoutPage").then((m) => ({ default: m.CheckoutPage })),
);
const PlanMyOrderPage = lazy(() =>
  import("@/features/plan/PlanMyOrderPage").then((m) => ({ default: m.PlanMyOrderPage })),
);
const ProfilePage = lazy(() => import("@/features/profile/ProfilePage").then((m) => ({ default: m.ProfilePage })));
const OwnerLayout = lazy(() => import("@/features/owner/OwnerLayout").then((m) => ({ default: m.OwnerLayout })));
const OwnerOrdersPage = lazy(() =>
  import("@/features/owner/OwnerOrdersPage").then((m) => ({ default: m.OwnerOrdersPage })),
);
const OwnerOrderDetailPage = lazy(() =>
  import("@/features/owner/OwnerOrderDetailPage").then((m) => ({ default: m.OwnerOrderDetailPage })),
);
const MenuManagerPage = lazy(() =>
  import("@/features/owner/MenuManagerPage").then((m) => ({ default: m.MenuManagerPage })),
);
const ReviewsManagerPage = lazy(() =>
  import("@/features/owner/ReviewsManagerPage").then((m) => ({ default: m.ReviewsManagerPage })),
);

function RouteFallback() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-10">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-48 w-full rounded-2xl" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route element={<RootLayout />}>
                <Route index element={<LandingPage />} />
                <Route path="menu" element={<MenuPage />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="plan" element={<PlanMyOrderPage />} />
                <Route path="signin" element={<SignInPage />} />
                <Route path="owner-login" element={<OwnerLoginPage />} />

                {/* Signed-in customers */}
                <Route element={<ProtectedRoute />}>
                  <Route path="checkout" element={<CheckoutPage />} />
                  <Route path="orders" element={<MyOrdersPage />} />
                  <Route path="orders/:id" element={<OrderDetailPage />} />
                  <Route path="account" element={<ProfilePage />} />
                </Route>

                {/* Aaji only */}
                <Route element={<ProtectedRoute ownerOnly />}>
                  <Route path="owner" element={<OwnerLayout />}>
                    <Route index element={<OwnerOrdersPage />} />
                    <Route path="orders/:id" element={<OwnerOrderDetailPage />} />
                    <Route path="menu" element={<MenuManagerPage />} />
                    <Route path="reviews" element={<ReviewsManagerPage />} />
                  </Route>
                </Route>

                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </Suspense>
          <PlateBar />
          <Toaster position="top-center" closeButton />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
