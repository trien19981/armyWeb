import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { TrendingUp, TrendingDown, Users, FileText, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { adminApi } from '../../../services/api';

export function Overview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
  });
  const [platoonVisits, setPlatoonVisits] = useState<any[]>([]);
  const [companyVisits, setCompanyVisits] = useState<any[]>([]);
  const [mostVisitedPlatoon, setMostVisitedPlatoon] = useState<any>(null);
  const [leastVisitedPlatoon, setLeastVisitedPlatoon] = useState<any>(null);

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    setLoading(true);
    const result = await adminApi.getOverview();
    if (result.data) {
      const data = result.data;
      setStats({
        totalRequests: data.total_requests || 0,
        pendingRequests: data.status_counts?.pending || 0,
        approvedRequests: data.status_counts?.approved || 0,
        rejectedRequests: data.status_counts?.rejected || 0,
      });
      setPlatoonVisits(data.platoon_statistics || []);
      setCompanyVisits(data.company_statistics || []);
      setMostVisitedPlatoon(data.most_visited_platoon);
      setLeastVisitedPlatoon(data.least_visited_platoon);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tổng Đơn</CardTitle>
            <FileText className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRequests}</div>
            <p className="text-xs text-gray-500 mt-1">Tổng số đơn đăng ký</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Chờ Duyệt</CardTitle>
            <Clock className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingRequests}</div>
            <p className="text-xs text-gray-500 mt-1">Đơn đang chờ xét duyệt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Đã Duyệt</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approvedRequests}</div>
            <p className="text-xs text-gray-500 mt-1">Đơn đã được chấp thuận</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Từ Chối</CardTitle>
            <Users className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejectedRequests}</div>
            <p className="text-xs text-gray-500 mt-1">Đơn đã bị từ chối</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts/Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Platoons */}
        <Card>
          <CardHeader>
            <CardTitle>Trung Đội - Lượt Thăm</CardTitle>
            <CardDescription>Thống kê lượt thăm theo trung đội</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {platoonVisits.length > 0 ? (
                platoonVisits.slice(0, 5).map((platoon, index) => (
                  <div key={platoon.platoon_id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{platoon.platoon_name}</p>
                        <p className="text-xs text-gray-500">
                          {platoon.company_name ? `Thuộc ${platoon.company_name}` : 'ID: ' + platoon.platoon_id}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="font-bold text-lg">{platoon.visit_count}</p>
                        <p className="text-xs text-gray-500">lượt</p>
                      </div>
                      {platoon.visit_count > 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">Chưa có dữ liệu</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Company Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Đại Đội - Lượt Thăm</CardTitle>
            <CardDescription>Thống kê lượt thăm theo đại đội</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {companyVisits.length > 0 ? (
                companyVisits.map((company, index) => {
                  const maxVisits = companyVisits[0]?.visit_count || 1;
                  return (
                    <div key={company.company_id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{company.company_name}</p>
                          <p className="text-xs text-gray-500">ID: {company.company_id}</p>
                        </div>
                        <p className="font-bold text-lg">{company.visit_count} lượt</p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${(company.visit_count / maxVisits) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-gray-500 py-4">Chưa có dữ liệu</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-l-4 border-green-500">
          <CardHeader>
            <CardTitle className="text-green-700 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Trung Đội Nhiều Thăm Nhất
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mostVisitedPlatoon ? (
              <div className="space-y-2">
                <p className="text-2xl font-bold">{mostVisitedPlatoon.platoon_name}</p>
                <p className="text-gray-600">
                  {mostVisitedPlatoon.company_name ? `Thuộc ${mostVisitedPlatoon.company_name}` : `ID: ${mostVisitedPlatoon.platoon_id}`}
                </p>
                <p className="text-3xl font-bold text-green-600">{mostVisitedPlatoon.visit_count} <span className="text-base text-gray-500">lượt thăm</span></p>
              </div>
            ) : (
              <p className="text-gray-500">Chưa có dữ liệu</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-red-500">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center gap-2">
              <TrendingDown className="w-5 h-5" />
              Trung Đội Ít Thăm Nhất
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leastVisitedPlatoon ? (
              <div className="space-y-2">
                <p className="text-2xl font-bold">{leastVisitedPlatoon.platoon_name}</p>
                <p className="text-gray-600">
                  {leastVisitedPlatoon.company_name ? `Thuộc ${leastVisitedPlatoon.company_name}` : `ID: ${leastVisitedPlatoon.platoon_id}`}
                </p>
                <p className="text-3xl font-bold text-red-600">{leastVisitedPlatoon.visit_count} <span className="text-base text-gray-500">lượt thăm</span></p>
              </div>
            ) : (
              <p className="text-gray-500">Chưa có dữ liệu</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
