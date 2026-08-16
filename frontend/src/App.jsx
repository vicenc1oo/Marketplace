import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import { CurrencyProvider } from './context/CurrencyContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';

import Layout from '../../../Marketplace/frontend/src/components/Layout/Layout.jsx';
import ProtectedRoute from '../../../Marketplace/frontend/src/components/Layout/ProtectedRoute.jsx';

import Home from '../../../Marketplace/frontend/src/pages/Home/Home.jsx';
import Login from '../../../Marketplace/frontend/src/pages/Auth/Login.jsx';
import Register from '../../../Marketplace/frontend/src/pages/Auth/Register.jsx';
import ForgotPassword from '../../../Marketplace/frontend/src/pages/Auth/ForgotPassword.jsx';
import Marketplace from '../../../Marketplace/frontend/src/pages/Marketplace/Marketplace.jsx';
import ListingDetails from '../../../Marketplace/frontend/src/pages/ListingDetails/ListingDetails.jsx';
import CreateListing from '../../../Marketplace/frontend/src/pages/CreateListing/CreateListing.jsx';
import Bidding from '../../../Marketplace/frontend/src/pages/Bidding/Bidding.jsx';
import Chat from '../../../Marketplace/frontend/src/pages/Chat/Chat.jsx';
import Profile from '../../../Marketplace/frontend/src/pages/Profile/Profile.jsx';
import Dashboard from '../../../Marketplace/frontend/src/pages/Dashboard/Dashboard.jsx';
import Wallet from '../../../Marketplace/frontend/src/pages/Wallet/Wallet.jsx';
import Promotions from '../../../Marketplace/frontend/src/pages/Promotions/Promotions.jsx';
import PrivacyPolicy from '../../../Marketplace/frontend/src/pages/PrivacyPolicy/PrivacyPolicy.jsx';
import TermsOfService from '../../../Marketplace/frontend/src/pages/TermsOfService/TermsOfService.jsx';
import NotFound from '../../../Marketplace/frontend/src/pages/NotFound/NotFound.jsx';

/* Reset scroll position whenever the route changes. */
function ScrollToTop() {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
}

export default function App() {
    return (
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ThemeProvider>
                <AuthProvider>
                    <SocketProvider>
                        <CurrencyProvider>
                            <ToastProvider>
                                <ScrollToTop />
                                <Routes>
                                    <Route element={<Layout />}>
                                        {/* Public */}
                                        <Route path="/" element={<Home />} />
                                        <Route path="/marketplace" element={<Marketplace />} />
                                        <Route path="/marketplace/:id" element={<ListingDetails />} />
                                        <Route path="/bidding" element={<Bidding />} />
                                        <Route path="/profile/:userId" element={<Profile />} />
                                        <Route path="/login" element={<Login />} />
                                        <Route path="/register" element={<Register />} />
                                        <Route path="/forgot-password" element={<ForgotPassword />} />
                                        <Route path="/privacy" element={<PrivacyPolicy />} />
                                        <Route path="/terms" element={<TermsOfService />} />

                                        {/* Authenticated */}
                                        <Route element={<ProtectedRoute />}>
                                            <Route path="/sell" element={<CreateListing />} />
                                            <Route path="/listing/:id/edit" element={<CreateListing />} />
                                            <Route path="/chat" element={<Chat />} />
                                            <Route path="/chat/:conversationId" element={<Chat />} />
                                            <Route path="/dashboard" element={<Dashboard />} />
                                            <Route path="/wallet" element={<Wallet />} />
                                            <Route path="/promotions" element={<Promotions />} />
                                        </Route>

                                        <Route path="*" element={<NotFound />} />
                                    </Route>
                                </Routes>
                            </ToastProvider>
                        </CurrencyProvider>
                    </SocketProvider>
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
}
