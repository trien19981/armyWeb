import { useState } from 'react';
import { RegistrationForm, type RegistrationData } from './components/RegistrationForm';
import { QRScanner } from './components/QRScanner';
import { SuccessConfirmation } from './components/SuccessConfirmation';
import { StatusTracker } from './components/StatusTracker';
import { ImageWithFallback } from './components/figma/ImageWithFallback';
import { Shield } from 'lucide-react';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Button } from './components/ui/button';
import { type Admin } from '../services/api';
import React from 'react';

type Screen = 'form' | 'qr-scanner' | 'success' | 'status-tracker' | 'admin-login' | 'admin-dashboard';

interface AppState {
  currentScreen: Screen;
  registrationData: RegistrationData | null;
  registrationCode: string | null;
  qrData: Partial<RegistrationData> | null;
  isAdminLoggedIn: boolean;
}

// Helper function to parse QR code data
function parseQRData(qrString: string): Partial<RegistrationData> {
  try {
    // Expect QR format: "TD1-DD1-TRD1" (Tiểu Đoàn-Đại Đội-Trung Đội)
    const parts = qrString.split('-');
    if (parts.length >= 3) {
      return {
        battalion: parts[0].replace('TD', 'Tiểu Đoàn '),
        company: parts[1].replace('DD', 'Đại Đội '),
        platoon: parts[2].replace('TRD', 'Trung Đội '),
      };
    }
    // If QR is plain text, just return empty
    return {};
  } catch {
    return {};
  }
}

// Generate registration code
function generateRegistrationCode(): string {
  const prefix = 'VR';
  const number = Math.floor(Math.random() * 900000) + 100000;
  return `${prefix}${number}`;
}

export default function App() {
  const [state, setState] = useState<AppState>({
    currentScreen: 'form',
    registrationData: null,
    registrationCode: null,
    qrData: null,
    isAdminLoggedIn: false,
  });

  const handleOpenQRScanner = () => {
    setState(prev => ({ ...prev, currentScreen: 'qr-scanner' }));
  };

  const handleQRScan = (qrString: string) => {
    const parsedData = parseQRData(qrString);
    setState(prev => ({
      ...prev,
      currentScreen: 'form',
      qrData: parsedData,
    }));
  };

  const handleCloseQRScanner = () => {
    setState(prev => ({ ...prev, currentScreen: 'form' }));
  };

  const handleSubmitRegistration = (data: RegistrationData, requestCode: string) => {
    setState(prev => ({
      ...prev,
      currentScreen: 'success',
      registrationData: data,
      registrationCode: requestCode,
    }));
  };

  const handleCheckStatus = () => {
    setState(prev => ({ ...prev, currentScreen: 'status-tracker' }));
  };

  const handleNewRegistration = () => {
    setState({
      currentScreen: 'form',
      registrationData: null,
      registrationCode: null,
      qrData: null,
    });
  };

  const handleBackToForm = () => {
    setState(prev => ({ ...prev, currentScreen: 'form' }));
  };

  const handleOpenAdminLogin = () => {
    setState(prev => ({ ...prev, currentScreen: 'admin-login' }));
  };

  const handleAdminLogin = (admin: Admin, token: string) => {
    setState(prev => ({ 
      ...prev, 
      currentScreen: 'admin-dashboard',
      isAdminLoggedIn: true 
    }));
  };

  const handleAdminLogout = () => {
    // Clear stored credentials
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_info');
    setState(prev => ({ 
      ...prev, 
      currentScreen: 'form',
      isAdminLoggedIn: false 
    }));
  };

  const handleBackFromAdminLogin = () => {
    setState(prev => ({ ...prev, currentScreen: 'form' }));
  };

  // Admin screens
  if (state.currentScreen === 'admin-login') {
    return <AdminLogin onLogin={handleAdminLogin} onBack={handleBackFromAdminLogin} />;
  }

  if (state.currentScreen === 'admin-dashboard') {
    return <AdminDashboard onLogout={handleAdminLogout} />;
  }

  // Make sure React is in scope to avoid "JSX tag requires 'React'" errors

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Banner */}
      <div className="relative h-64 bg-gradient-to-r from-blue-900 to-indigo-900 overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://cdn.castinghub.vn/files/3/1c035e38-92aa-4fba-8b0d-61f4c16fe22d.jpeg"
            alt="Military soldiers"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
          {/* Admin Login Button */}
          <div className="absolute top-4 right-4">
            <Button
              variant="outline"
              onClick={handleOpenAdminLogin}
              className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm"
            >
              <Shield className="w-4 h-4 mr-2" />
              Quản Trị Viên
            </Button>
          </div>
          
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 text-yellow-400 mr-3" />
            <h1 className="text-4xl font-bold text-white">
              Hệ Thống Đăng Ký Thăm Quân Nhân
            </h1>
          </div>
          <p className="text-xl text-blue-100">
            Đăng ký nhanh chóng và tiện lợi cho người thân đến thăm
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm text-blue-200">
            <span className="px-3 py-1 bg-blue-800 bg-opacity-50 rounded-full">An toàn</span>
            <span className="px-3 py-1 bg-blue-800 bg-opacity-50 rounded-full">Nhanh chóng</span>
            <span className="px-3 py-1 bg-blue-800 bg-opacity-50 rounded-full">Tiện lợi</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Decorative Images Section */}
        {state.currentScreen === 'form' && (
          <div className="grid grid-cols-2 gap-4 mb-8 rounded-lg overflow-hidden">
            <div className="relative h-32 rounded-lg overflow-hidden shadow-lg">
              <ImageWithFallback
                src="https://cdn.castinghub.vn/files/3/028f96e9-ae4a-4e67-a245-ff2549446d57.jpeg"
                alt="Army base"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                <p className="text-white text-sm font-medium">Khu vực đơn vị</p>
              </div>
            </div>
            <div className="relative h-32 rounded-lg overflow-hidden shadow-lg">
              <ImageWithFallback
                src="https://cdn.castinghub.vn/files/3/30e0dd6e-14db-449f-84d3-d317aed99cd7.jpeg"
                alt="Military camp"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                <p className="text-white text-sm font-medium">Khu vực tiếp khách</p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {state.currentScreen === 'form' && (
          <RegistrationForm
            onSubmit={handleSubmitRegistration}
            onOpenQRScanner={handleOpenQRScanner}
            initialData={state.qrData || undefined}
          />
        )}

        {state.currentScreen === 'qr-scanner' && (
          <QRScanner
            onScan={handleQRScan}
            onClose={handleCloseQRScanner}
          />
        )}

        {state.currentScreen === 'success' && state.registrationData && state.registrationCode && (
          <SuccessConfirmation
            registrationCode={state.registrationCode}
            registrationData={state.registrationData}
            onCheckStatus={handleCheckStatus}
            onNewRegistration={handleNewRegistration}
          />
        )}

        {state.currentScreen === 'status-tracker' && (
          <StatusTracker onBack={handleBackToForm} />
        )}

        {/* Quick Status Check Button */}
        {state.currentScreen === 'form' && (
          <div className="mt-6 text-center">
            <button
              onClick={handleCheckStatus}
              className="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              Đã có mã đơn? Tra cứu trạng thái tại đây
            </button>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-gray-700">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Hệ Thống Quản Lý Thăm Quân Nhân</span>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Liên hệ hỗ trợ: <span className="font-medium">1900-xxxx</span></p>
              <p>Email: <span className="font-medium">hotro@quandoi.vn</span></p>
              <p className="text-xs text-gray-500 mt-4">
                © 2024 Bộ Quốc Phòng Việt Nam. Bảo lưu mọi quyền.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
