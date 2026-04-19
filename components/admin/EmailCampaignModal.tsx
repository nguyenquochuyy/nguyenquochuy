import React, { useState } from 'react';
import { api, adminHeaders } from '../../services/apiClient';
import { Language } from '../../types';
import { Mail, Send, X, Users, CheckCircle, AlertCircle } from 'lucide-react';

const API_URL = 'http://localhost:8080/api';

interface EmailCampaignModalProps {
    isOpen: boolean;
    onClose: () => void;
    customerIds: string[];
    lang: Language;
}

const EmailCampaignModal: React.FC<EmailCampaignModalProps> = ({ isOpen, onClose, customerIds, lang }) => {
    const [campaignName, setCampaignName] = useState('');
    const [subject, setSubject] = useState('');
    const [template, setTemplate] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    if (!isOpen) return null;

    const handleSend = async () => {
        if (!campaignName || !subject || !template) {
            alert('Vui lòng điền đầy đủ thông tin');
            return;
        }

        setIsSending(true);
        setStatus('idle');

        try {
            // Create campaign
            const createRes = await fetch(`${API_URL}/email-campaigns/create`, {
                method: 'POST',
                headers: adminHeaders(),
                body: JSON.stringify({
                    name: campaignName,
                    subject: subject,
                    template: template,
                    targetIds: customerIds,
                }),
            });

            if (!createRes.ok) {
                const errorData = await createRes.json().catch(() => ({}));
                console.error('Create campaign error:', errorData);
                throw new Error(errorData.message || 'Failed to create campaign');
            }

            const campaignData = await createRes.json();
            console.log('Campaign created:', campaignData);

            // Send campaign
            const sendRes = await fetch(`${API_URL}/email-campaigns/${campaignData.id}/send`, {
                method: 'POST',
                headers: adminHeaders(),
            });

            if (!sendRes.ok) {
                const errorData = await sendRes.json().catch(() => ({}));
                console.error('Send campaign error:', errorData);
                throw new Error(errorData.message || 'Failed to send campaign');
            }

            const sendData = await sendRes.json();
            console.log('Campaign sent:', sendData);
            setStatus('success');
            setMessage(`Đã gửi email thành công! Gửi: ${sendData.sent}, Thất bại: ${sendData.failed}`);

            setTimeout(() => {
                onClose();
                setStatus('idle');
                setCampaignName('');
                setSubject('');
                setTemplate('');
            }, 2000);
        } catch (error) {
            console.error('Error sending email campaign:', error);
            setStatus('error');
            setMessage('Có lỗi xảy ra khi gửi email chiến dịch');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl relative flex flex-col z-10 overflow-hidden transform transition-all scale-100">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
                    <div>
                        <h3 className="font-bold text-xl text-slate-900 flex items-center gap-2">
                            <Mail size={20} className="text-indigo-600" />
                            Chiến dịch Email Marketing
                        </h3>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Gửi email tới {customerIds.length} khách hàng đã chọn
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Form Body */}
                <div className="p-6 space-y-5 bg-white">
                    {status === 'success' && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                            <CheckCircle size={20} className="text-emerald-600" />
                            <span className="text-sm font-medium text-emerald-800">{message}</span>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3">
                            <AlertCircle size={20} className="text-rose-600" />
                            <span className="text-sm font-medium text-rose-800">{message}</span>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
                            Tên chiến dịch <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium shadow-sm"
                            placeholder="Ví dụ: Khuyến mãi tháng 5"
                            value={campaignName}
                            onChange={(e) => setCampaignName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
                            Tiêu đề email <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium shadow-sm"
                            placeholder="Ví dụ: Ưu đãi đặc biệt dành riêng cho bạn"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
                            Nội dung email <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                            className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none min-h-[150px] shadow-sm font-medium"
                            placeholder="Nhập nội dung email..."
                            value={template}
                            onChange={(e) => setTemplate(e.target.value)}
                        />
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-50 mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors text-sm"
                        >
                            Hủy
                        </button>
                        <button
                            type="button"
                            onClick={handleSend}
                            disabled={isSending}
                            className="px-6 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl font-bold shadow-lg shadow-indigo-200 flex items-center gap-2 transition-all active:scale-95 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSending ? (
                                <>
                                    <span className="animate-spin">⏳</span> Đang gửi...
                                </>
                            ) : (
                                <>
                                    <Send size={18} /> Gửi ngay
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailCampaignModal;
