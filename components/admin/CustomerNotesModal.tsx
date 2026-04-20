import React, { useState, useEffect } from 'react';
import { adminHeaders } from '../../services/apiClient';
import { Language } from '../../types';
import { MessageSquare, X, Plus, Clock, User } from 'lucide-react';

const API_URL = 'http://localhost:8080/api';

interface CustomerNotesModalProps {
    isOpen: boolean;
    onClose: () => void;
    customerId: string;
    lang: Language;
}

const CustomerNotesModal: React.FC<CustomerNotesModalProps> = ({ isOpen, onClose, customerId, lang }) => {
    const [notes, setNotes] = useState<any[]>([]);
    const [newNote, setNewNote] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchNotes = async () => {
        try {
            const res = await fetch(`${API_URL}/customers/${customerId}/notes`, {
                headers: adminHeaders(),
            });
            if (res.ok) {
                const response = await res.json();
                const notesData = response.data || [];
                setNotes(Array.isArray(notesData) ? notesData : []);
            }
        } catch (error) {
            console.error('Error fetching notes:', error);
            setNotes([]);
        }
    };

    const handleAddNote = async () => {
        if (!newNote.trim()) return;

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/customers/${customerId}/notes`, {
                method: 'POST',
                headers: adminHeaders(),
                body: JSON.stringify({
                    note: newNote,
                    userId: 'admin', // TODO: Get actual user ID
                }),
            });

            if (res.ok) {
                setNewNote('');
                await fetchNotes();
            }
        } catch (error) {
            console.error('Error adding note:', error);
            alert('Có lỗi xảy ra khi thêm note');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchNotes();
        }
    }, [isOpen, customerId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] shadow-2xl relative flex flex-col z-10 overflow-hidden transform transition-all scale-100">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
                    <div>
                        <h3 className="font-bold text-xl text-slate-900 flex items-center gap-2">
                            <MessageSquare size={20} className="text-indigo-600" />
                            Ghi chú khách hàng
                        </h3>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Theo dõi tương tác với khách hàng
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-[15px] bg-white">
                    {/* Add Note Form */}
                    <div className="bg-slate-50 rounded-xl p-4">
                        <textarea
                            className="w-full px-4 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none min-h-[80px] shadow-sm font-medium"
                            placeholder="Nhập ghi chú mới..."
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                        />
                        <div className="flex justify-end mt-3">
                            <button
                                onClick={handleAddNote}
                                disabled={loading || !newNote.trim()}
                                className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl font-bold shadow-lg shadow-indigo-200 flex items-center gap-2 transition-all active:scale-95 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <span className="animate-spin">⏳</span> Đang thêm...
                                    </>
                                ) : (
                                    <>
                                        <Plus size={16} /> Thêm note
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Notes Timeline */}
                    <div className="space-y-3">
                        {notes.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <MessageSquare size={32} className="mx-auto mb-2 opacity-30" />
                                <p className="text-sm">Chưa có ghi chú nào</p>
                            </div>
                        ) : (
                            notes.map((note) => (
                                <div key={note.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                            <User size={16} className="text-indigo-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-slate-800 font-medium">{note.note}</p>
                                            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                                                <Clock size={12} />
                                                {new Date(note.createdAt).toLocaleString('vi-VN')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerNotesModal;
