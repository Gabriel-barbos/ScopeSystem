import { Toaster as ShadcnToaster } from "@/components/ui/toaster"; 
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
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
import Technicians from "./pages/Providers";
import MaintenenceRequests from "./pages/MaintenenceRequests";
import { AuthProvider } from "@/context/Authcontext";
import { AntdThemeProvider } from "@/providers/AntdThemeProvider";
import PrivateRoute from "@/components/layout/PrivateRoute";
import { Roles } from "@/utils/roles";
import  Removal  from "./pages/Removal";
import Home from "./pages/Home";
import ScheduleImportPage from "./pages/ScheduleImportPage";
import AiPage from "./pages/AiAssistant";
import ResellerUnits from "./pages/ResellerUnits";
import ClientDetail from "./pages/ClientDetail";
import Billing from "./pages/Billing";
import Providers from "./pages/Providers";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>

      <AuthProvider>
        <AntdThemeProvider>

     
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />

            <Route
              path="/appointments"
              element={
                <PrivateRoute roles={[Roles.ADMIN, Roles.SCHEDULING, Roles.CX]}>
                  <Layout>
                    <Appointments />
                  </Layout>
                </PrivateRoute>
              }
            />

             <Route
              path="/home"
              element={
                <PrivateRoute roles={[Roles.ADMIN, Roles.SCHEDULING,Roles.SUPPORT, Roles.VALIDATION, Roles.BILLING, Roles.CX, Roles.COMMERCIAL, Roles.LAB]}>
                  <Layout>
                    <Home />
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
                <PrivateRoute roles={[Roles.ADMIN, Roles.SCHEDULING, Roles.SUPPORT, Roles.VALIDATION, Roles.BILLING, Roles.CX, Roles.COMMERCIAL]}>
                  <Layout >
                    <Products />
                  </Layout>
                </PrivateRoute>
              }
            />

            <Route
              path="/clients"
              element={
                <PrivateRoute roles={[Roles.ADMIN, Roles.SCHEDULING, Roles.SUPPORT, Roles.VALIDATION, Roles.BILLING, Roles.CX, Roles.COMMERCIAL]}>
                  <Layout>
                    <Clients />
                  </Layout>
                </PrivateRoute>
              }
            />  

            <Route
              path="/clients/:id"
              element={
                <PrivateRoute roles={[Roles.ADMIN, Roles.SCHEDULING, Roles.SUPPORT, Roles.VALIDATION, Roles.BILLING, Roles.CX, Roles.COMMERCIAL]}>
                  <Layout>
                    <ClientDetail />
                  </Layout>
                </PrivateRoute>
              }
            />

            <Route
              path="/billing"
              element={
                <PrivateRoute roles={[Roles.ADMIN, Roles.BILLING, Roles.COMMERCIAL]}>
                  <Layout>
                    <Billing />
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
                <PrivateRoute roles={[Roles.ADMIN, Roles.SUPPORT, Roles.BILLING,Roles.CX, Roles.COMMERCIAL, Roles.SCHEDULING, Roles.VALIDATION]}>
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
                <PrivateRoute roles={[Roles.ADMIN, Roles.SUPPORT, Roles.VALIDATION, Roles.SCHEDULING, Roles.BILLING, Roles.CX, Roles.COMMERCIAL, Roles.LAB]}>
                  <Layout>
                    <Services />
                  </Layout>
                </PrivateRoute>
              }
            />
                   <Route
              path="/providers"
              element={
                <PrivateRoute roles={[Roles.ADMIN, Roles.SUPPORT, Roles.VALIDATION, Roles.SCHEDULING, Roles.BILLING]}>
                  <Layout>
                    <Providers />
                  </Layout>
                </PrivateRoute>
              }
            />
                   <Route
              path="/ai-assistant"
              element={
                <PrivateRoute roles={[Roles.ADMIN, Roles.SUPPORT,  Roles.SCHEDULING, Roles.CX, Roles.LAB]}>
                  <Layout>
                    <AiPage />
                  </Layout>
                </PrivateRoute>
              }
            /> 

                   <Route
              path="/reseller-units"
              element={
                <PrivateRoute roles={[Roles.ADMIN, Roles.SUPPORT,  Roles.VALIDATION, Roles.LAB]}>
                  <Layout>
                    <ResellerUnits />
                  </Layout>
                </PrivateRoute>
              }
            /> 

                     <Route
              path="/maintenance-requests"
              element={
                <PrivateRoute roles={[Roles.ADMIN, Roles.SUPPORT,  Roles.SCHEDULING, Roles.CX]}>
                  <Layout>
                    <MaintenenceRequests />
                  </Layout>
                </PrivateRoute>
              }
            />

            <Route path="/import/schedules" element={
                <PrivateRoute roles={[Roles.ADMIN, Roles.SCHEDULING, Roles.SUPPORT, Roles.VALIDATION, Roles.BILLING, Roles.CX, Roles.COMMERCIAL]}>
                  <Layout><ScheduleImportPage /></Layout>
                </PrivateRoute>
          } />

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