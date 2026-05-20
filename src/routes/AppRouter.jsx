import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout.jsx';
import AdminLayout from '../layouts/AdminLayout.jsx';
import Home from '../pages/Home.jsx';
import Cameras from '../pages/Cameras.jsx';
import BrandCameras from '../pages/BrandCameras.jsx';
import CameraDetail from '../pages/CameraDetail.jsx';
import Cart from '../pages/Cart.jsx';
import Checkout from '../pages/Checkout.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import ForgotPassword from '../pages/ForgotPassword.jsx';
import ResetPassword from '../pages/ResetPassword.jsx';
import Profile from '../pages/Profile.jsx';
import Wishlist from '../pages/Wishlist.jsx';
import PaymentSuccess from '../pages/PaymentSuccess.jsx';
import PaymentCancel from '../pages/PaymentCancel.jsx';
import WarrantyPolicy from '../pages/WarrantyPolicy.jsx';
import ShippingPolicy from '../pages/ShippingPolicy.jsx';
import FlexibleDelivery from '../pages/FlexibleDelivery.jsx';
import Dashboard from '../pages/Admin/Dashboard.jsx';
import Products from '../pages/Admin/Products.jsx';
import Orders from '../pages/Admin/Orders.jsx';
import Users from '../pages/Admin/Users.jsx';
import Banners from '../pages/Admin/Banners.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import AdminRoute from '../components/AdminRoute.jsx';
import { ROUTES } from '../constants/routes.js';

function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path={ROUTES.HOME} element={<Home />} />
        <Route path={ROUTES.CAMERAS} element={<Cameras />} />
        <Route path={ROUTES.BRAND_CAMERAS} element={<BrandCameras />} />
        <Route path={ROUTES.CAMERA_DETAIL} element={<CameraDetail />} />
        <Route path={ROUTES.CART} element={<Cart />} />
        <Route path={ROUTES.WISHLIST} element={<Wishlist />} />
        <Route
          path={ROUTES.CHECKOUT}
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.REGISTER} element={<Register />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
        <Route
          path={ROUTES.PROFILE}
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path={ROUTES.PAYMENT_SUCCESS} element={<PaymentSuccess />} />
        <Route path={ROUTES.PAYMENT_CANCEL} element={<PaymentCancel />} />
        <Route path={ROUTES.WARRANTY_POLICY} element={<WarrantyPolicy />} />
        <Route path={ROUTES.SHIPPING_POLICY} element={<ShippingPolicy />} />
        <Route path={ROUTES.FLEXIBLE_DELIVERY} element={<FlexibleDelivery />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="orders" element={<Orders />} />
        <Route path="users" element={<Users />} />
        <Route path="banners" element={<Banners />} />
      </Route>
    </Routes>
  );
}

export default AppRouter;
