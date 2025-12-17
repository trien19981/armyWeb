import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Search, CheckCircle, Clock, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { publicApi, type VisitRequest } from '../../services/api';

interface StatusTrackerProps {
  onBack: () => void;
}

interface RegistrationStatus {
  code: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
  reviewedDate?: string;
  visitorName: string;
  soldierName: string;
  battalion: string;
  company: string;
  platoon: string;
  notes?: string;
}

const statusConfig = {
  pending: {
    icon: Clock,
    label: 'Đang Chờ Xét Duyệt',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  approved: {
    icon: CheckCircle,
    label: 'Đã Duyệt',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  rejected: {
    icon: XCircle,
    label: 'Từ Chối',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
};

export function StatusTracker({ onBack }: StatusTrackerProps) {
  const [searchCode, setSearchCode] = useState('');
  const [registration, setRegistration] = useState<RegistrationStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setRegistration(null);
    
    if (!searchCode.trim()) {
      setError('Vui lòng nhập mã đơn');
      return;
    }

    setLoading(true);
    const result = await publicApi.getVisitRequestByCode(searchCode.trim().toUpperCase());
    setLoading(false);

    if (result.data) {
      const data = result.data;
      setRegistration({
        code: data.code,
        status: data.status,
        submittedDate: data.created_at,
        reviewedDate: data.reviewed_at,
        visitorName: data.visitor_name,
        soldierName: data.soldier_name,
        battalion: data.battalion_name || '',
        company: data.company_name || '',
        platoon: data.platoon_name || '',
        notes: data.reason,
      });
    } else {
      setError(result.error || 'Không tìm thấy đơn đăng ký với mã này');
    }
  };

  const statusInfo = registration ? statusConfig[registration.status] : null;
  const StatusIcon = statusInfo?.icon;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Tra Cứu Trạng Thái Đơn</CardTitle>
        <CardDescription>
          Nhập mã đơn để kiểm tra tình trạng xét duyệt
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Form */}
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="searchCode">Mã Đơn</Label>
            <div className="flex gap-2">
              <Input
                id="searchCode"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                placeholder="VD: VR001234"
                className="flex-1"
              />
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang tìm...
                  </>
                ) : (
                  <>
                <Search className="w-4 h-4 mr-2" />
                Tìm Kiếm
                  </>
                )}
              </Button>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </form>

        {/* Registration Status */}
        {registration && statusInfo && StatusIcon && (
          <div className={`border rounded-lg p-6 ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-full ${statusInfo.color}`}>
                <StatusIcon className="w-8 h-8" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className={`text-xl font-medium ${statusInfo.color}`}>
                    {statusInfo.label}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Mã đơn: <span className="font-mono font-medium">{registration.code}</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-gray-600">Người thăm:</span>
                    <span className="font-medium">{registration.visitorName}</span>
                    
                    <span className="text-gray-600">Quân nhân:</span>
                    <span className="font-medium">{registration.soldierName}</span>
                    
                    <span className="text-gray-600">Đơn vị:</span>
                    <span className="font-medium">{registration.battalion} - {registration.company} - {registration.platoon}</span>
                    
                    <span className="text-gray-600">Ngày gửi:</span>
                    <span className="font-medium">{new Date(registration.submittedDate).toLocaleDateString('vi-VN')}</span>
                    
                    {registration.reviewedDate && (
                      <>
                        <span className="text-gray-600">Ngày xét duyệt:</span>
                        <span className="font-medium">{new Date(registration.reviewedDate).toLocaleDateString('vi-VN')}</span>
                      </>
                    )}
                  </div>
                </div>

                {registration.notes && (
                  <div className="bg-white bg-opacity-50 rounded p-3">
                    <p className="text-sm font-medium mb-1">Ghi chú:</p>
                    <p className="text-sm">{registration.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <Button variant="outline" onClick={onBack} className="w-full">
          Quay Lại
        </Button>
      </CardContent>
    </Card>
  );
}
