import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Search, CheckCircle, XCircle, AlertCircle, Clock, Eye, Loader2 } from 'lucide-react';
import { adminApi, type VisitRequest } from '../../../services/api';

interface Request {
  id: string;
  code: string;
  visitorName: string;
  visitorPhone: string;
  soldierName: string;
  battalion: string;
  company: string;
  platoon: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

// Helper to convert API response to Request
function mapVisitRequestToRequest(vr: VisitRequest): Request {
  return {
    id: vr.id,
    code: vr.code,
    visitorName: vr.visitor_name,
    visitorPhone: vr.visitor_phone,
    soldierName: vr.soldier_name,
    battalion: vr.battalion_name || '',
    company: vr.company_name || '',
    platoon: vr.platoon_name || '',
    reason: vr.reason || '',
    status: vr.status,
    createdAt: new Date(vr.created_at),
  };
}


export function RequestManagement() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPlatoon, setFilterPlatoon] = useState<string>('all');
  const [filterCompany, setFilterCompany] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  // Load requests from API
  useEffect(() => {
    loadRequests();
  }, [filterStatus]);

  const loadRequests = async () => {
    setLoading(true);
    const filters: any = {};
    if (filterStatus !== 'all') filters.status = filterStatus;

    const result = await adminApi.getVisitRequests(filters);
    if (result.data) {
      setRequests(result.data.map(mapVisitRequestToRequest));
    }
    setLoading(false);
  };

  const handleApprove = async (id: string) => {
    if (confirm('Bạn có chắc muốn duyệt đơn này?')) {
      const result = await adminApi.approveVisitRequest(id);
      if (result.data) {
        await loadRequests();
        setSelectedRequest(null);
      } else {
        alert(result.error || 'Không thể duyệt đơn');
      }
    }
  };

  const handleReject = async (id: string) => {
    if (confirm('Bạn có chắc muốn từ chối đơn này?')) {
      const result = await adminApi.rejectVisitRequest(id);
      if (result.data) {
        await loadRequests();
        setSelectedRequest(null);
      } else {
        alert(result.error || 'Không thể từ chối đơn');
      }
    }
  };

  const getStatusBadge = (status: Request['status']) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" />Chờ Duyệt</Badge>;
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Đã Duyệt</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500"><XCircle className="w-3 h-3 mr-1" />Từ Chối</Badge>;
    }
  };

  const filteredRequests = requests.filter(r => {
    const matchesSearch = 
      r.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.visitorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.soldierName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    const matchesPlatoon = filterPlatoon === 'all' || r.platoon === filterPlatoon;
    const matchesCompany = filterCompany === 'all' || r.company === filterCompany;
    
    return matchesSearch && matchesStatus && matchesPlatoon && matchesCompany;
  });

  // Get unique platoons and companies
  const platoons = [...new Set(requests.map(r => r.platoon))];
  const companies = [...new Set(requests.map(r => r.company))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Quản Lý Đơn Xin Thăm</h2>
        <p className="text-gray-500">Xét duyệt các đơn đăng ký thăm quân nhân</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm theo mã, tên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="pending">Chờ duyệt</SelectItem>
                <SelectItem value="approved">Đã duyệt</SelectItem>
                <SelectItem value="rejected">Từ chối</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Select value={filterCompany} onValueChange={setFilterCompany}>
              <SelectTrigger>
                <SelectValue placeholder="Lọc theo đại đội" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả đại đội</SelectItem>
                {companies.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Select value={filterPlatoon} onValueChange={setFilterPlatoon}>
              <SelectTrigger>
                <SelectValue placeholder="Lọc theo trung đội" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trung đội</SelectItem>
                {platoons.map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {/* Requests List */}
      {loading ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
            <p className="mt-2 text-gray-500">Đang tải dữ liệu...</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredRequests.map((request) => (
          <Card key={request.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono">{request.code}</Badge>
                    {getStatusBadge(request.status)}
                    <span className="text-xs text-gray-500">
                      {request.createdAt.toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Người thăm</p>
                      <p className="font-medium">{request.visitorName}</p>
                      <p className="text-sm text-gray-600">{request.visitorPhone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Quân nhân được thăm</p>
                      <p className="font-medium">{request.soldierName}</p>
                      <p className="text-sm text-gray-600">
                        {request.platoon} • {request.company}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Lý do thăm</p>
                    <p className="text-sm">{request.reason}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setSelectedRequest(request)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Chi tiết
                  </Button>
                  
                  {request.status === 'pending' && (
                    <>
                      <Button 
                        size="sm"
                        onClick={() => handleApprove(request.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Duyệt
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleReject(request.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Từ chối
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}

      {!loading && filteredRequests.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center text-gray-500">
            Không tìm thấy đơn nào
          </CardContent>
        </Card>
      )}

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <CardHeader>
              <CardTitle>Chi Tiết Đơn Đăng Ký</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Mã đơn</p>
                  <p className="font-medium font-mono">{selectedRequest.code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Trạng thái</p>
                  {getStatusBadge(selectedRequest.status)}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ngày đăng ký</p>
                  <p className="font-medium">{selectedRequest.createdAt.toLocaleString('vi-VN')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tiểu đoàn</p>
                  <p className="font-medium">{selectedRequest.battalion}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Đại đội</p>
                  <p className="font-medium">{selectedRequest.company}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Trung đội</p>
                  <p className="font-medium">{selectedRequest.platoon}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Người thăm</p>
                  <p className="font-medium">{selectedRequest.visitorName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Số điện thoại</p>
                  <p className="font-medium">{selectedRequest.visitorPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Quân nhân được thăm</p>
                  <p className="font-medium">{selectedRequest.soldierName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Lý do thăm</p>
                  <p className="font-medium">{selectedRequest.reason}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button onClick={() => setSelectedRequest(null)} className="flex-1">
                  Đóng
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
