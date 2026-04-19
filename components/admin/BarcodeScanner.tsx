import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Product } from '../../types';
import { X, Package, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface BarcodeScannerProps {
    onClose: () => void;
    onProductFound: (product: Product) => void;
}

const API = '/api';

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onClose, onProductFound }) => {
    const [scannedCode, setScannedCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [product, setProduct] = useState<Product | null>(null);

    useEffect(() => {
        // Initialize Scanner
        const scanner = new Html5QrcodeScanner("reader", {
            qrbox: {
                width: 250,
                height: 250,
            },
            fps: 10,
        }, false);

        scanner.render(success, error);

        async function success(result: string) {
            scanner.pause(true); // Pause scanning once found
            setScannedCode(result);
            setLoading(true);
            setError(null);
            setProduct(null);

            try {
                const res = await fetch(`${API}/products/barcode/${encodeURIComponent(result)}`);
                if (!res.ok) {
                    throw new Error('Sản phẩm không tồn tại trong hệ thống');
                }
                const data = await res.json();
                setProduct(data.data);
            } catch (err: any) {
                setError(err.message || 'Lỗi khi tra cứu mã vạch');
            } finally {
                setLoading(false);
            }
        }

        function error(err: any) {
            // ignore constant scanning errors
        }

        return () => {
            scanner.clear().catch(error => {
                console.error("Failed to clear scanner", error);
            });
        };
    }, []);

    const resetScanner = () => {
        setScannedCode(null);
        setError(null);
        setProduct(null);
        // We might need to resume the scanner, but html5-qrcode clear/re-render is safer
        // since `scanner.resume()` isn't exposed properly on `Html5QrcodeScanner`.
        // A full re-mount is better. For now we just tell user to close/re-open or we can just reload it.
        // Actually Html5QrcodeScanner has a "Scan an Image File" / "Scan using Camera directly" ui.
        // Let's just reset the state and ask them to scan again.
        // The library automatically handles pause/resume if we handle it properly, but with `Html5QrcodeScanner`, 
        // it renders its own UI.
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex-shrink-0">
                    <h2 className="font-bold text-lg flex items-center gap-2">
                        Quét mã vạch (Barcode / QR)
                    </h2>
                    <button onClick={onClose} className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-4 flex-1 overflow-y-auto">
                    {/* The div where html5-qrcode will render its UI */}
                    <div className={scannedCode ? "hidden" : "block"}>
                        <div id="reader" className="w-full"></div>
                        <p className="text-center text-xs text-slate-400 mt-2">Cấp quyền camera để bắt đầu quét mã.</p>
                    </div>

                    {scannedCode && (
                        <div className="flex flex-col items-center justify-center py-6 space-y-4">
                            <div className="text-center">
                                <p className="text-sm text-slate-500 mb-1">Mã đã quét</p>
                                <p className="font-mono text-lg font-bold text-slate-800 bg-slate-100 px-4 py-2 rounded-lg border border-slate-200">
                                    {scannedCode}
                                </p>
                            </div>

                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-4">
                                    <RefreshCw size={28} className="animate-spin text-emerald-500 mb-3" />
                                    <p className="text-sm text-slate-500">Đang tìm sản phẩm...</p>
                                </div>
                            ) : error ? (
                                <div className="w-full bg-rose-50 border border-rose-200 rounded-xl p-4 flex flex-col items-center text-center">
                                    <AlertCircle size={32} className="text-rose-500 mb-2" />
                                    <p className="font-semibold text-rose-700">{error}</p>
                                    <p className="text-xs text-rose-500 mt-1">Sản phẩm chưa được khai báo mã vạch này.</p>
                                </div>
                            ) : product ? (
                                <div className="w-full bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                            {product.images && product.images[0] ? (
                                                <img src={product.images[0]} alt="" className="w-full h-full object-cover rounded-lg" />
                                            ) : (
                                                <Package size={24} />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 leading-tight">{product.name}</p>
                                            <p className="text-sm text-emerald-600 font-semibold mt-0.5">{product.price.toLocaleString('vi-VN')} đ</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-t border-emerald-100 pt-3">
                                        <span className="text-slate-500">Tồn kho hiện tại:</span>
                                        <span className="font-bold text-slate-800">{product.stock}</span>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            onProductFound(product);
                                            onClose();
                                        }}
                                        className="w-full mt-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle size={18} /> Chọn sản phẩm này
                                    </button>
                                </div>
                            ) : null}

                            <button 
                                onClick={() => {
                                    onClose(); 
                                    // Normally we would just reset, but it's easier to close and re-open to re-init camera
                                }}
                                className="mt-4 text-sm text-slate-500 hover:text-slate-700 underline"
                            >
                                Quét mã khác
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BarcodeScanner;
