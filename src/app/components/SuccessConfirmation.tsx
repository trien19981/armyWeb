import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { CheckCircle2, Search } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { RegistrationData } from './RegistrationForm';

interface SuccessConfirmationProps {
  registrationCode: string;
  registrationData: RegistrationData;
  onCheckStatus: () => void;
  onNewRegistration: () => void;
}

export function SuccessConfirmation({ 
  registrationCode, 
  registrationData, 
  onCheckStatus,
  onNewRegistration 
}: SuccessConfirmationProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto overflow-hidden">
      {/* Success Banner Image */}
      <div className="relative h-48 overflow-hidden">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1763656444799-e8abf3dcb5cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaWxpdGFyeSUyMHNvbGRpZXJzfGVufDF8fHx8MTc2NTg3MzU2Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Military background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/80 to-green-600/90 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold">Đăng Ký Thành Công!</h2>
            <p className="text-green-50 mt-2">Đơn của bạn đang chờ xét duyệt</p>
          </div>
        </div>
      </div>
      
      <CardHeader className="text-center pt-6">
        <CardTitle className="text-2xl">Thông Tin Đăng Ký</CardTitle>
        <CardDescription>
          Vui lòng lưu lại mã đơn để tra cứu sau
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Registration Code */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-600 mb-2">Mã Đơn Của Bạn</p>
          <p className="text-3xl font-mono tracking-wider text-blue-600">
            {registrationCode}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Vui lòng lưu mã này để tra cứu trạng thái
          </p>
        </div>

        {/* Registration Details */}
        <div className="space-y-4">
          <h3 className="font-medium">Thông Tin Đăng Ký</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-gray-600">Đơn vị:</span>
              <span className="font-medium">{registrationData.battalion} - {registrationData.company} - {registrationData.platoon}</span>
              
              <span className="text-gray-600">Người thăm:</span>
              <span className="font-medium">{registrationData.visitorName}</span>
              
              <span className="text-gray-600">Số điện thoại:</span>
              <span className="font-medium">{registrationData.visitorPhone}</span>
              
              <span className="text-gray-600">Quân nhân:</span>
              <span className="font-medium">{registrationData.soldierName}</span>
              
              {registrationData.reason && (
                <>
                  <span className="text-gray-600">Lý do:</span>
                  <span className="font-medium">{registrationData.reason}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-2">Lưu Ý Quan Trọng</h4>
          <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
            <li>Đơn đăng ký đang được xét duyệt bởi đơn vị</li>
            <li>Thời gian xét duyệt thường từ 1-3 ngày làm việc</li>
            <li>Bạn sẽ được thông báo kết quả qua số điện thoại đã đăng ký</li>
            <li>Vui lòng mang theo giấy tờ tùy thân khi đến thăm</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={onCheckStatus} variant="outline" className="flex-1">
            <Search className="w-4 h-4 mr-2" />
            Tra Cứu Trạng Thái
          </Button>
          <Button onClick={onNewRegistration} className="flex-1">
            Đăng Ký Mới
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
