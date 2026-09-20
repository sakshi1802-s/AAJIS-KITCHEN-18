import { BrowserRouter, Route, Routes } from "react-router";
import { RootLayout } from "@/components/layout/RootLayout";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { SignInPage } from "@/features/auth/SignInPage";
import { LandingPage } from "@/features/landing/LandingPage";
import { MenuPage } from "@/features/menu/MenuPage";
import { ProfilePage } from "@/features/profile/ProfilePage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<RootLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="menu" element={<MenuPage />} />
            <Route path="signin" element={<SignInPage />} />

            {/* Signed-in customers */}
            <Route element={<ProtectedRoute />}>
              <Route path="account" element={<ProfilePage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
        <Toaster position="top-center" richColors closeButton />
      </AuthProvider>
    </BrowserRouter>
  );
}
