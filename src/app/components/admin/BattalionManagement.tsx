import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Plus, Edit, Trash2, Search, Loader2 } from 'lucide-react';
import { adminApi, type Battalion as ApiBattalion } from '../../../services/api';

interface Battalion {
  id: number;
  name: string;
  code: string;
  companiesCount?: number;
}

export function BattalionManagement() {
  const [battalions, setBattalions] = useState<Battalion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ name: '', code: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadBattalions();
  }, []);

  const loadBattalions = async () => {
    setLoading(true);
    const result = await adminApi.getBattalions();
    if (result.data) {
      setBattalions(result.data.map(b => ({ ...b, companiesCount: 0 })));
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!formData.name || !formData.code) return;
    
    setSubmitting(true);
    const result = await adminApi.createBattalion({
      code: formData.code,
      name: formData.name,
    });
    
    setSubmitting(false);
    if (result.data) {
      await loadBattalions();
      setFormData({ name: '', code: '' });
      setIsAddingNew(false);
    } else {
      alert(result.error || 'Không thể tạo tiểu đoàn');
    }
  };

  const handleEdit = (battalion: Battalion) => {
    setEditingId(battalion.id);
    setFormData({ name: battalion.name, code: battalion.code });
  };

  const handleUpdate = async () => {
    if (!editingId || !formData.name || !formData.code) return;
    
    setSubmitting(true);
    const result = await adminApi.updateBattalion(editingId, {
      code: formData.code,
      name: formData.name,
    });
    
    setSubmitting(false);
    if (result.data) {
      await loadBattalions();
      setEditingId(null);
      setFormData({ name: '', code: '' });
    } else {
      alert(result.error || 'Không thể cập nhật tiểu đoàn');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Bạn có chắc muốn xóa tiểu đoàn này?')) {
      const result = await adminApi.deleteBattalion(id);
      if (result.data) {
        await loadBattalions();
      } else {
        alert(result.error || 'Không thể xóa tiểu đoàn');
      }
    }
  };

  const filteredBattalions = battalions.filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản Lý Tiểu Đoàn</h2>
          <p className="text-gray-500">Thêm, sửa, xóa thông tin tiểu đoàn</p>
        </div>
        <Button onClick={() => setIsAddingNew(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm Tiểu Đoàn
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm tiểu đoàn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Form */}
      {(isAddingNew || editingId) && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>{editingId ? 'Sửa Tiểu Đoàn' : 'Thêm Tiểu Đoàn Mới'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên Tiểu Đoàn</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Tiểu Đoàn 1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Mã Tiểu Đoàn</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="TD1"
                />
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
                  setFormData({ name: '', code: '' });
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
          {filteredBattalions.map((battalion) => (
          <Card key={battalion.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="font-bold text-blue-700">{battalion.code}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{battalion.name}</h3>
                      <p className="text-sm text-gray-500">
                        Mã: {battalion.code}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEdit(battalion)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Sửa
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDelete(battalion.id)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Xóa
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}

      {!loading && filteredBattalions.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center text-gray-500">
            Không tìm thấy tiểu đoàn nào
          </CardContent>
        </Card>
      )}
    </div>
  );
}
