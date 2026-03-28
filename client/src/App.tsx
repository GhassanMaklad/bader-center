import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartProvider } from "./contexts/CartContext";
import Home from "./pages/Home";
import RequestService from "./pages/RequestService";
import Catalog from "./pages/Catalog";
import AdminDashboard from "./pages/AdminDashboard";
import CheckoutPage from "./pages/CheckoutPage";
import MediaManagerPage from "./pages/MediaManagerPage";
import ProductDetail from "./pages/ProductDetail";
import About from "./pages/About";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/request"} component={RequestService} />
      <Route path={"/catalog"} component={Catalog} />
      <Route path={"/checkout"} component={CheckoutPage} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/admin/media"} component={MediaManagerPage} />
      <Route path={"/product/:id"} component={ProductDetail} />
      <Route path={"/about"} component={About} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </CartProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
