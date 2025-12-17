import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Plus, Edit, Trash2, Search, QrCode, Loader2 } from 'lucide-react';
import { adminApi, type Battalion, type Company, type Platoon as ApiPlatoon } from '../../../services/api';

interface Platoon {
  id: number;
  name: string;
  code: string;
  company_id: number;
  company_name?: string;
  battalion_name?: string;
}

export function PlatoonManagement() {
  const [platoons, setPlatoons] = useState<Platoon[]>([]);
  const [allCompanies, setAllCompanies] = useState<Company[]>([]); // Keep all companies for filtering
  const [battalions, setBattalions] = useState<Battalion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompany, setFilterCompany] = useState<string>('all');
  const [filterBattalion, setFilterBattalion] = useState<string>('all');
  const [formData, setFormData] = useState({ name: '', code: '', company_id: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [platoonsResult, companiesResult, battalionsResult] = await Promise.all([
      adminApi.getPlatoons(),
      adminApi.getCompanies(),
      adminApi.getBattalions(),
    ]);
    
    if (platoonsResult.data) {
      setPlatoons(platoonsResult.data);
    }
    if (companiesResult.data) {
      setAllCompanies(companiesResult.data);
    }
    if (battalionsResult.data) {
      setBattalions(battalionsResult.data);
    }
    setLoading(false);
  };


  const handleAdd = async () => {
    if (!formData.name || !formData.code || !formData.company_id) return;
    
    setSubmitting(true);
    const result = await adminApi.createPlatoon({
      company_id: parseInt(formData.company_id),
      code: formData.code,
      name: formData.name,
    });
    
    setSubmitting(false);
    if (result.data) {
      await loadData();
      setFormData({ name: '', code: '', company_id: '' });
      setIsAddingNew(false);
    } else {
      alert(result.error || 'Không thể tạo trung đội');
    }
  };

  const handleEdit = (platoon: Platoon) => {
    setEditingId(platoon.id);
    setFormData({ 
      name: platoon.name, 
      code: platoon.code,
      company_id: platoon.company_id.toString()
    });
  };

  const handleUpdate = async () => {
    if (!editingId || !formData.name || !formData.code || !formData.company_id) return;
    
    setSubmitting(true);
    const result = await adminApi.updatePlatoon(editingId, {
      company_id: parseInt(formData.company_id),
      code: formData.code,
      name: formData.name,
    });
    
    setSubmitting(false);
    if (result.data) {
      await loadData();
      setEditingId(null);
      setFormData({ name: '', code: '', company_id: '' });
    } else {
      alert(result.error || 'Không thể cập nhật trung đội');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Bạn có chắc muốn xóa trung đội này?')) {
      const result = await adminApi.deletePlatoon(id);
      if (result.data) {
        await loadData();
      } else {
        alert(result.error || 'Không thể xóa trung đội');
      }
    }
  };

  const handleGenerateQR = (platoon: Platoon) => {
    // In a real app, this would generate a QR code
    const qrData = `TD${platoon.battalionName.split(' ')[2]}-DD${platoon.companyName.split(' ')[2]}-${platoon.code}`;
    alert(`Mã QR cho ${platoon.name}:\n${qrData}\n\nTrong ứng dụng thực tế, đây sẽ tạo mã QR để in hoặc tải xuống.`);
  };

  const filteredPlatoons = platoons.filter(p => {
    const company = allCompanies.find(c => c.id === p.company_id);
    const battalion = company ? battalions.find(b => b.id === company.battalion_id) : null;
    
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (company?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (battalion?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCompany = filterCompany === 'all' || p.company_id.toString() === filterCompany;
    const matchesBattalion = filterBattalion === 'all' || (company && company.battalion_id.toString() === filterBattalion);
    
    return matchesSearch && matchesCompany && matchesBattalion;
  });

  const availableCompanies = filterBattalion === 'all' 
    ? allCompanies 
    : allCompanies.filter(c => c.battalion_id.toString() === filterBattalion);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản Lý Trung Đội</h2>
          <p className="text-gray-500">Thêm, sửa, xóa thông tin trung đội</p>
        </div>
        <Button onClick={() => setIsAddingNew(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm Trung Đội
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm trung đội..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Select value={filterBattalion} onValueChange={(value) => {
              setFilterBattalion(value);
              setFilterCompany('all');
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Lọc theo tiểu đoàn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả tiểu đoàn</SelectItem>
                {battalions.map(b => (
                  <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                ))}
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
                {availableCompanies.map(c => (
                  <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Form */}
      {(isAddingNew || editingId) && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>{editingId ? 'Sửa Trung Đội' : 'Thêm Trung Đội Mới'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên Trung Đội</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Trung Đội 1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Mã Trung Đội</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="TRD1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Đại Đội</Label>
                <Select 
                  value={formData.company_id} 
                  onValueChange={(value) => setFormData({ ...formData, company_id: value })}
                >
                  <SelectTrigger id="company">
                    <SelectValue placeholder="Chọn đại đội" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCompanies.map(c => {
                      const battalion = battalions.find(b => b.id === c.battalion_id);
                      return (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.name} ({battalion?.name || 'N/A'})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button 
                onClick={editingId ? handleUpdate : handleAdd} 
                className="flex-1"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  editingId ? 'Cập Nhật' : 'Thêm'
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddingNew(false);
                  setEditingId(null);
                  setFormData({ name: '', code: '', company_id: '' });
                }}
                className="flex-1"
              >
                Hủy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* List */}
      {loading ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
            <p className="mt-2 text-gray-500">Đang tải dữ liệu...</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredPlatoons.map((platoon) => {
            const company = allCompanies.find(c => c.id === platoon.company_id);
            const battalion = company ? battalions.find(b => b.id === company.battalion_id) : null;
            
            return (
              <Card key={platoon.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <span className="font-bold text-yellow-700 text-sm">{platoon.code}</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{platoon.name}</h3>
                          <p className="text-sm text-gray-500">
                            {company?.name || 'N/A'} • {battalion?.name || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          const qrData = `${battalion?.code || ''}-${company?.code || ''}-${platoon.code}`;
                          alert(`Mã QR cho ${platoon.name}:\n${qrData}\n\nTrong ứng dụng thực tế, đây sẽ tạo mã QR để in hoặc tải xuống.`);
                        }}
                      >
                        <QrCode className="w-4 h-4 mr-1" />
                        QR
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEdit(platoon)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Sửa
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDelete(platoon.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Xóa
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && filteredPlatoons.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center text-gray-500">
            Không tìm thấy trung đội nào
          </CardContent>
        </Card>
      )}
    </div>
  );
}
