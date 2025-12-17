import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { QrCode, Shield, Users, Phone, Loader2 } from 'lucide-react';
import { publicApi, type Battalion, type Company, type Platoon } from '../../services/api';

interface RegistrationFormProps {
  onSubmit: (data: RegistrationData, requestCode: string) => void;
  onOpenQRScanner: () => void;
  initialData?: Partial<RegistrationData>;
}

export interface RegistrationData {
  battalion: string;
  company: string;
  platoon: string;
  visitorName: string;
  visitorPhone: string;
  soldierName: string;
  reason: string;
}

export function RegistrationForm({ onSubmit, onOpenQRScanner, initialData }: RegistrationFormProps) {
  const [formData, setFormData] = useState<RegistrationData>({
    battalion: initialData?.battalion || '',
    company: initialData?.company || '',
    platoon: initialData?.platoon || '',
    visitorName: initialData?.visitorName || '',
    visitorPhone: initialData?.visitorPhone || '',
    soldierName: initialData?.soldierName || '',
    reason: initialData?.reason || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof RegistrationData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Data from API
  const [battalions, setBattalions] = useState<Battalion[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [platoons, setPlatoons] = useState<Platoon[]>([]);
  
  // Selected IDs
  const [selectedBattalionId, setSelectedBattalionId] = useState<number | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [selectedPlatoonId, setSelectedPlatoonId] = useState<number | null>(null);

  // Load battalions on mount
  useEffect(() => {
    const loadBattalions = async () => {
      setLoading(true);
      const result = await publicApi.getBattalions();
      if (result.data) {
        setBattalions(result.data);
      } else {
        setErrors(prev => ({ ...prev, battalion: result.error || 'Không thể tải danh sách tiểu đoàn' }));
      }
      setLoading(false);
    };
    loadBattalions();
  }, []);

  // Load companies when battalion is selected
  useEffect(() => {
    if (selectedBattalionId) {
      setLoading(true);
      setCompanies([]);
      setPlatoons([]);
      setSelectedCompanyId(null);
      setSelectedPlatoonId(null);
      publicApi.getCompanies(selectedBattalionId).then(result => {
        if (result.data) {
          setCompanies(result.data);
        }
        setLoading(false);
      });
    }
  }, [selectedBattalionId]);

  // Load platoons when company is selected
  useEffect(() => {
    if (selectedCompanyId) {
      setLoading(true);
      setPlatoons([]);
      setSelectedPlatoonId(null);
      publicApi.getPlatoons(selectedCompanyId).then(result => {
        if (result.data) {
          setPlatoons(result.data);
        }
        setLoading(false);
      });
    }
  }, [selectedCompanyId]);

  const handleBattalionChange = (battalionId: string) => {
    const battalion = battalions.find(b => b.id.toString() === battalionId);
    if (battalion) {
      setSelectedBattalionId(battalion.id);
      setFormData(prev => ({ ...prev, battalion: battalion.name, company: '', platoon: '' }));
      setSelectedCompanyId(null);
      setSelectedPlatoonId(null);
      }
    if (errors.battalion) {
      setErrors(prev => ({ ...prev, battalion: undefined }));
    }
  };

  const handleCompanyChange = (companyId: string) => {
    const company = companies.find(c => c.id.toString() === companyId);
    if (company) {
      setSelectedCompanyId(company.id);
      setFormData(prev => ({ ...prev, company: company.name, platoon: '' }));
      setSelectedPlatoonId(null);
      }
    if (errors.company) {
      setErrors(prev => ({ ...prev, company: undefined }));
    }
  };

  const handlePlatoonChange = (platoonId: string) => {
    const platoon = platoons.find(p => p.id.toString() === platoonId);
    if (platoon) {
      setSelectedPlatoonId(platoon.id);
      setFormData(prev => ({ ...prev, platoon: platoon.name }));
    }
    if (errors.platoon) {
      setErrors(prev => ({ ...prev, platoon: undefined }));
    }
  };

  const handleChange = (field: keyof RegistrationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof RegistrationData, string>> = {};
    
    if (!formData.battalion) newErrors.battalion = 'Vui lòng chọn tiểu đoàn';
    if (!formData.company) newErrors.company = 'Vui lòng chọn đại đội';
    if (!formData.platoon) newErrors.platoon = 'Vui lòng chọn trung đội';
    if (!formData.visitorName.trim()) newErrors.visitorName = 'Vui lòng nhập tên người thăm';
    if (!formData.visitorPhone.trim()) newErrors.visitorPhone = 'Vui lòng nhập số điện thoại';
    if (!formData.soldierName.trim()) newErrors.soldierName = 'Vui lòng nhập tên quân nhân';
    
    // Phone validation
    if (formData.visitorPhone && !/^[0-9]{10,11}$/.test(formData.visitorPhone)) {
      newErrors.visitorPhone = 'Số điện thoại không hợp lệ (10-11 số)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    if (!selectedBattalionId || !selectedCompanyId || !selectedPlatoonId) {
      setErrors(prev => ({
        ...prev,
        battalion: !selectedBattalionId ? 'Vui lòng chọn tiểu đoàn' : undefined,
        company: !selectedCompanyId ? 'Vui lòng chọn đại đội' : undefined,
        platoon: !selectedPlatoonId ? 'Vui lòng chọn trung đội' : undefined,
      }));
      return;
    }

    setSubmitting(true);
    const result = await publicApi.createVisitRequest({
      battalion_id: selectedBattalionId,
      company_id: selectedCompanyId,
      platoon_id: selectedPlatoonId,
      soldier_name: formData.soldierName,
      visitor_name: formData.visitorName,
      visitor_phone: formData.visitorPhone,
      reason: formData.reason || undefined,
    });

    setSubmitting(false);

    if (result.data && result.data.code) {
      onSubmit(formData, result.data.code);
    } else {
      setErrors(prev => ({
        ...prev,
        _submit: result.error || 'Không thể tạo đơn đăng ký. Vui lòng thử lại.',
      }));
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Đăng Ký Thăm Quân Nhân</CardTitle>
        <CardDescription>
          Vui lòng điền đầy đủ thông tin để đăng ký thăm
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* QR Scanner Button */}
          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={onOpenQRScanner}>
              <QrCode className="w-4 h-4 mr-2" />
              Quét Mã QR
            </Button>
          </div>

          {/* Military Unit Selection */}
          <div className="space-y-4 border-l-4 border-blue-500 pl-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium">Thông Tin Đơn Vị</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="battalion">Tiểu Đoàn *</Label>
              <Select 
                value={selectedBattalionId?.toString() || ''} 
                onValueChange={handleBattalionChange}
                disabled={loading}
              >
                <SelectTrigger id="battalion">
                  <SelectValue placeholder={loading ? "Đang tải..." : "Chọn tiểu đoàn"} />
                </SelectTrigger>
                <SelectContent>
                  {battalions.map(battalion => (
                    <SelectItem key={battalion.id} value={battalion.id.toString()}>
                      {battalion.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.battalion && <p className="text-sm text-red-600">{errors.battalion}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Đại Đội *</Label>
              <Select 
                value={selectedCompanyId?.toString() || ''} 
                onValueChange={handleCompanyChange}
                disabled={!selectedBattalionId || loading}
              >
                <SelectTrigger id="company">
                  <SelectValue placeholder={loading ? "Đang tải..." : selectedBattalionId ? "Chọn đại đội" : "Chọn tiểu đoàn trước"} />
                </SelectTrigger>
                <SelectContent>
                  {companies.map(company => (
                    <SelectItem key={company.id} value={company.id.toString()}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.company && <p className="text-sm text-red-600">{errors.company}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="platoon">Trung Đội *</Label>
              <Select 
                value={selectedPlatoonId?.toString() || ''} 
                onValueChange={handlePlatoonChange}
                disabled={!selectedCompanyId || loading}
              >
                <SelectTrigger id="platoon">
                  <SelectValue placeholder={loading ? "Đang tải..." : selectedCompanyId ? "Chọn trung đội" : "Chọn đại đội trước"} />
                </SelectTrigger>
                <SelectContent>
                  {platoons.map(platoon => (
                    <SelectItem key={platoon.id} value={platoon.id.toString()}>
                      {platoon.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.platoon && <p className="text-sm text-red-600">{errors.platoon}</p>}
            </div>
          </div>

          {/* Visitor Information */}
          <div className="space-y-4 border-l-4 border-green-500 pl-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              <h3 className="font-medium">Thông Tin Người Thăm</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="visitorName">Tên Người Thăm *</Label>
              <Input
                id="visitorName"
                value={formData.visitorName}
                onChange={(e) => handleChange('visitorName', e.target.value)}
                placeholder="Nguyễn Văn A"
              />
              {errors.visitorName && <p className="text-sm text-red-600">{errors.visitorName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="visitorPhone">Số Điện Thoại *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="visitorPhone"
                  value={formData.visitorPhone}
                  onChange={(e) => handleChange('visitorPhone', e.target.value)}
                  placeholder="0912345678"
                  type="tel"
                  className="pl-10"
                />
              </div>
              {errors.visitorPhone && <p className="text-sm text-red-600">{errors.visitorPhone}</p>}
            </div>
          </div>

          {/* Soldier Information */}
          <div className="space-y-4 border-l-4 border-yellow-500 pl-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-yellow-600" />
              <h3 className="font-medium">Thông Tin Quân Nhân</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="soldierName">Tên Quân Nhân Được Thăm *</Label>
              <Input
                id="soldierName"
                value={formData.soldierName}
                onChange={(e) => handleChange('soldierName', e.target.value)}
                placeholder="Trần Văn B"
              />
              {errors.soldierName && <p className="text-sm text-red-600">{errors.soldierName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Lý Do Thăm (Tùy chọn)</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => handleChange('reason', e.target.value)}
                placeholder="Thăm hỏi sức khỏe..."
                rows={3}
              />
            </div>
          </div>

          {errors._submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors._submit}</p>
            </div>
          )}
          
          <Button type="submit" className="w-full" disabled={submitting || loading}>
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang gửi...
              </>
            ) : (
              'Đăng Ký'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
