import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Plus, Edit, Trash2, Search, Loader2 } from 'lucide-react';
import { adminApi, type Battalion, type Company as ApiCompany } from '../../../services/api';

interface Company {
  id: number;
  name: string;
  code: string;
  battalion_id: number;
  battalion_name?: string;
}

export function CompanyManagement() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [battalions, setBattalions] = useState<Battalion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBattalion, setFilterBattalion] = useState<string>('all');
  const [formData, setFormData] = useState({ name: '', code: '', battalion_id: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [companiesResult, battalionsResult] = await Promise.all([
      adminApi.getCompanies(),
      adminApi.getBattalions(),
    ]);
    
    if (companiesResult.data) {
      setCompanies(companiesResult.data);
    }
    if (battalionsResult.data) {
      setBattalions(battalionsResult.data);
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!formData.name || !formData.code || !formData.battalion_id) return;
    
    setSubmitting(true);
    const result = await adminApi.createCompany({
      battalion_id: parseInt(formData.battalion_id),
      code: formData.code,
      name: formData.name,
    });
    
    setSubmitting(false);
    if (result.data) {
      await loadData();
      setFormData({ name: '', code: '', battalion_id: '' });
      setIsAddingNew(false);
    } else {
      alert(result.error || 'Không thể tạo đại đội');
    }
  };

  const handleEdit = (company: Company) => {
    setEditingId(company.id);
    setFormData({ 
      name: company.name, 
      code: company.code,
      battalion_id: company.battalion_id.toString()
    });
  };

  const handleUpdate = async () => {
    if (!editingId || !formData.name || !formData.code || !formData.battalion_id) return;
    
    setSubmitting(true);
    const result = await adminApi.updateCompany(editingId, {
      battalion_id: parseInt(formData.battalion_id),
      code: formData.code,
      name: formData.name,
    });
    
    setSubmitting(false);
    if (result.data) {
      await loadData();
      setEditingId(null);
      setFormData({ name: '', code: '', battalion_id: '' });
    } else {
      alert(result.error || 'Không thể cập nhật đại đội');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Bạn có chắc muốn xóa đại đội này?')) {
      const result = await adminApi.deleteCompany(id);
      if (result.data) {
        await loadData();
      } else {
        alert(result.error || 'Không thể xóa đại đội');
      }
    }
  };

  const filteredCompanies = companies.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.battalion_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBattalion = filterBattalion === 'all' || c.battalion_id.toString() === filterBattalion;
    
    return matchesSearch && matchesBattalion;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản Lý Đại Đội</h2>
          <p className="text-gray-500">Thêm, sửa, xóa thông tin đại đội</p>
        </div>
        <Button onClick={() => setIsAddingNew(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm Đại Đội
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm đại đội..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Select value={filterBattalion} onValueChange={setFilterBattalion}>
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
      </div>

      {/* Add/Edit Form */}
      {(isAddingNew || editingId) && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>{editingId ? 'Sửa Đại Đội' : 'Thêm Đại Đội Mới'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên Đại Đội</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Đại Đội 1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Mã Đại Đội</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="DD1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="battalion">Tiểu Đoàn</Label>
                <Select 
                  value={formData.battalion_id} 
                  onValueChange={(value) => setFormData({ ...formData, battalion_id: value })}
                >
                  <SelectTrigger id="battalion">
                    <SelectValue placeholder="Chọn tiểu đoàn" />
                  </SelectTrigger>
                  <SelectContent>
                    {battalions.map(b => (
                      <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                    ))}
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
                  setFormData({ name: '', code: '', battalion_id: '' });
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
          {filteredCompanies.map((company) => {
            const battalion = battalions.find(b => b.id === company.battalion_id);
            return (
              <Card key={company.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <span className="font-bold text-green-700">{company.code}</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{company.name}</h3>
                          <p className="text-sm text-gray-500">
                            {battalion?.name || company.battalion_name || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEdit(company)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Sửa
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDelete(company.id)}
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

      {!loading && filteredCompanies.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center text-gray-500">
            Không tìm thấy đại đội nào
          </CardContent>
        </Card>
      )}
    </div>
  );
}
