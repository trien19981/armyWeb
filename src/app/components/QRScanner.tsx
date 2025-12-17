import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Camera, X } from 'lucide-react';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          html5QrCode.stop().then(() => {
            onScan(decodedText);
          }).catch(() => {});
        },
        () => {
          // Error callback - ignore scanning errors
        }
      );
      setScanning(true);
      setError(null);
    } catch (err) {
      setError("Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.");
      setScanning(false);
    }
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().then(() => {
        setScanning(false);
        onClose();
      }).catch(() => {});
    } else {
      onClose();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Quét Mã QR</CardTitle>
          <Button variant="ghost" size="sm" onClick={stopScanning}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <CardDescription>
          Quét mã QR để tự động điền thông tin trung đội
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div id="qr-reader" className="w-full rounded-lg overflow-hidden"></div>
        
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {!scanning && !error && (
          <Button onClick={startScanning} className="w-full">
            <Camera className="w-4 h-4 mr-2" />
            Bắt Đầu Quét
          </Button>
        )}

        {scanning && (
          <div className="text-center text-sm text-gray-600">
            Đang quét... Hướng camera vào mã QR
          </div>
        )}
      </CardContent>
    </Card>
  );
}
