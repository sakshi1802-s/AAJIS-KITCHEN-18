import { BrowserRouter, Route, Routes } from "react-router";
import { RootLayout } from "@/components/layout/RootLayout";
import { Toaster } from "@/components/ui/sonner";
import { LandingPage } from "@/features/landing/LandingPage";
import { MenuPage } from "@/features/menu/MenuPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="menu" element={<MenuPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
      <Toaster position="top-center" richColors closeButton />
    </BrowserRouter>
  );
}
