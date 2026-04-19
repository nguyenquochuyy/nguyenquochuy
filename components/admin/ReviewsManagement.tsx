import React, { useState } from 'react';
import { Review, Language, BackendContextType } from '../../types';
import { Star, MessageSquare, Eye, EyeOff, Send, Filter } from 'lucide-react';
import { TRANSLATIONS } from '../../services/translations';

interface ReviewsManagementProps {
  backend: BackendContextType;
  lang: Language;
}

const ReviewsManagement: React.FC<ReviewsManagementProps> = ({ backend, lang }) => {
  const t = TRANSLATIONS[lang];
  const { reviews, replyToReview, toggleReviewHidden } = backend;
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [filterHidden, setFilterHidden] = useState<boolean | 'all'>('all');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const filteredReviews = reviews.filter(review => {
    if (filterRating !== 'all' && review.rating !== filterRating) return false;
    if (filterHidden !== 'all' && review.isHidden !== filterHidden) return false;
    return true;
  });

  const handleReply = (reviewId: string) => {
    if (!replyText.trim()) return;
    replyToReview(reviewId, replyText);
    setReplyText('');
    setReplyingTo(null);
  };

  const handleToggleHidden = (reviewId: string) => {
    toggleReviewHidden(reviewId);
  };

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        size={16}
        className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
      />
    ));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{t.reviewsManagement}</h2>
          <p className="text-slate-500 text-sm mt-1">{t.reviewsSubtitle}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          <span className="text-sm font-medium text-slate-700">{t.rating}:</span>
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="all">{t.all}</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700">{t.status}:</span>
          <select
            value={filterHidden === 'all' ? 'all' : String(filterHidden)}
            onChange={(e) => setFilterHidden(e.target.value === 'all' ? 'all' : e.target.value === 'true')}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="all">{t.all}</option>
            <option value="false">{t.visible}</option>
            <option value="true">{t.hidden}</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <MessageSquare size={48} className="mx-auto mb-3 opacity-20" />
            <p>{t.noReviewsFound}</p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div
              key={review.id}
              className={`bg-white p-6 rounded-xl border ${
                review.isHidden ? 'border-slate-200 opacity-60' : 'border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex gap-1">
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-sm font-medium text-slate-700">{review.customerName}</span>
                    <span className="text-xs text-slate-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                    {review.isHidden && (
                      <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{t.hidden}</span>
                    )}
                  </div>

                  {/* Comment */}
                  <p className="text-slate-700 text-sm mb-4">{review.comment}</p>

                  {/* Reply */}
                  {review.reply ? (
                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                      <p className="text-xs font-bold text-indigo-600 mb-1">{t.adminReply}</p>
                      <p className="text-sm text-slate-700">{review.reply}</p>
                      {review.replyDate && (
                        <p className="text-xs text-slate-400 mt-2">
                          {new Date(review.replyDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ) : replyingTo === review.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder={t.writeReply}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <button
                        onClick={() => handleReply(review.id)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2"
                      >
                        <Send size={16} />
                        {t.send}
                      </button>
                      <button
                        onClick={() => { setReplyingTo(null); setReplyText(''); }}
                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200"
                      >
                        {t.cancel}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReplyingTo(review.id)}
                      className="text-sm text-indigo-600 font-medium hover:underline flex items-center gap-1"
                    >
                      <MessageSquare size={14} />
                      {t.reply}
                    </button>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleToggleHidden(review.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      review.isHidden
                        ? 'text-slate-400 hover:bg-slate-100'
                        : 'text-slate-400 hover:bg-slate-100'
                    }`}
                    title={review.isHidden ? t.showReview : t.hideReview}
                  >
                    {review.isHidden ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewsManagement;
