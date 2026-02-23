import { Toaster as ShadcnToaster } from "@/components/ui/toaster"; 
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import Appointments from "./pages/Appointments";
import Stock from "./pages/Stock";
import Products from "./pages/Products";
import Clients from "./pages/Clients";
import Users from "./pages/Users";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/Login";
import Reports from "./pages/Reports";
import Validation from "./pages/Validation";
import Services from "./pages/Services";
import Technicians from "./pages/Technicians";
import MaintenenceRequests from "./pages/MaintenenceRequests";
import { AuthProvider } from "@/context/Authcontext";
import { AntdThemeProvider } from "@/providers/AntdThemeProvider";
import PrivateRoute from "@/components/PrivateRoute";
import { Roles } from "@/utils/roles";
import  Removal  from "./pages/Removal";



const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>

      <AuthProvider>
        <AntdThemeProvider>

     
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/appointments" replace />} />

            <Route
              path="/appointments"
              element={
                <PrivateRoute roles={[Roles.ADMIN, Roles.SCHEDULING,]}>
                  <Layout>
                    <Appointments />
                  </Layout>
                </PrivateRoute>
              }
            />

            <Route
              path="/stock"
              element={
                <PrivateRoute roles={[Roles.ADMIN, Roles.SCHEDULING, Roles.SUPPORT, Roles.VALIDATION]}>
                  <Layout>
                    <Stock />
                  </Layout>
                </PrivateRoute>
              }
            />

            <Route
              path="/products"
              element={
                <PrivateRoute roles={[Roles.ADMIN, Roles.SCHEDULING, Roles.SUPPORT, Roles.VALIDATION, Roles.BILLING]}>
                  <Layout >
                    <Products />
                  </Layout>
                </PrivateRoute>
              }
            />

            <Route
              path="/clients"
              element={
                <PrivateRoute roles={[Roles.ADMIN, Roles.SCHEDULING, Roles.SUPPORT, Roles.VALIDATION, Roles.BILLING]}>
                  <Layout>
                    <Clients />
                  </Layout>
                </PrivateRoute>
              }
            />  

               <Route
              path="/removal"
              element={
                <PrivateRoute roles={[Roles.ADMIN, Roles.SCHEDULING, Roles.SUPPORT, Roles.VALIDATION]}>
                  <Layout>
                    <Removal />
                  </Layout>
                </PrivateRoute>
              }
            />


            <Route
              path="/users"
              element={
                <PrivateRoute roles={[Roles.ADMIN]}>
                  <Layout>
                    <Users />
                  </Layout>
                </PrivateRoute>
              }
            />

                <Route
              path="/reports"
              element={
                <PrivateRoute roles={[Roles.ADMIN, Roles.SUPPORT, Roles.BILLING]}>
                  <Layout>
                    <Reports />
                  </Layout>
                </PrivateRoute>
              }
            />

                  <Route
              path="/validation"
              element={
                <PrivateRoute roles={[Roles.ADMIN, Roles.SUPPORT, Roles.VALIDATION]}>
                  <Layout>
                    <Validation />
                  </Layout>
                </PrivateRoute>
              }
            />

                 <Route
              path="/services"
              element={
                <PrivateRoute roles={[Roles.ADMIN, Roles.SUPPORT, Roles.VALIDATION, Roles.SCHEDULING, Roles.BILLING]}>
                  <Layout>
                    <Services />
                  </Layout>
                </PrivateRoute>
              }
            />
                   <Route
              path="/technicians"
              element={
                <PrivateRoute roles={[Roles.ADMIN, Roles.SUPPORT, Roles.VALIDATION, Roles.SCHEDULING, Roles.BILLING]}>
                  <Layout>
                    <Technicians />
                  </Layout>
                </PrivateRoute>
              }
            />
                   <Route
              path="/maintenance-requests"
              element={
                <PrivateRoute roles={[Roles.ADMIN, Roles.SUPPORT,  Roles.SCHEDULING]}>
                  <Layout>
                    <MaintenenceRequests />
                  </Layout>
                </PrivateRoute>
              }
            />

            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>

        </BrowserRouter>
           </AntdThemeProvider>
      </AuthProvider>
      <Toaster position="bottom-right" richColors /> {/* Sonner para o resto */}
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;