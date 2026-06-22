// "use client";

// import React, { useState } from "react";
// import { Star, MessageSquareReply, Loader2 } from "lucide-react";
// import { authClient } from "@/lib/auth-client"; // 👈 adjust path/import if different

// const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// export interface ReviewReply {
//   replyId: string;
//   comment: string;
//   createdAt: string;
//   user: { id: string; name: string; role?: string };
// }

// export interface ReviewItem {
//   reviewId: string;
//   rating: number;
//   comment: string | null;
//   createdAt: string;
//   customer: { id: string; name: string; image?: string | null };
//   reviewReplays: ReviewReply[];
// }

// interface ReviewSectionProps {
//   productId: string;
//   reviews: ReviewItem[];
//   onRefresh: () => void;
// }

// function formatReviewDate(dateStr: string) {
//   return new Date(dateStr).toLocaleDateString("en-US", {
//     day: "numeric",
//     month: "short",
//     year: "numeric",
//   });
// }

// function StarRatingInput({
//   value,
//   onChange,
// }: {
//   value: number;
//   onChange: (v: number) => void;
// }) {
//   const [hover, setHover] = useState(0);
//   return (
//     <div className="flex items-center gap-1">
//       {[1, 2, 3, 4, 5].map((i) => (
//         <button
//           key={i}
//           type="button"
//           onMouseEnter={() => setHover(i)}
//           onMouseLeave={() => setHover(0)}
//           onClick={() => onChange(i)}
//           className="p-0.5"
//         >
//           <Star
//             className={`h-6 w-6 transition-colors ${
//               i <= (hover || value)
//                 ? "fill-[#e85d04] text-[#e85d04]"
//                 : "fill-[#e0d5c4] text-[#e0d5c4]"
//             }`}
//           />
//         </button>
//       ))}
//     </div>
//   );
// }

// export default function ReviewSection({
//   productId,
//   reviews,
//   onRefresh,
// }: ReviewSectionProps) {
//   const { data: session } = authClient.useSession();
//   const currentUser = session?.user;

//   const [rating, setRating] = useState(0);
//   const [comment, setComment] = useState("");
//   const [submitting, setSubmitting] = useState(false);
//   const [formError, setFormError] = useState("");

//   const [replyOpenFor, setReplyOpenFor] = useState<string | null>(null);
//   const [replyText, setReplyText] = useState("");
//   const [replySubmitting, setReplySubmitting] = useState(false);

//   const avgRating = reviews.length
//     ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
//     : 0;

//   const handleSubmitReview = async () => {
//     if (!currentUser) return;
//     if (rating === 0) {
//       setFormError("Please select a rating");
//       return;
//     }
//     setSubmitting(true);
//     setFormError("");
//     try {
//       const res = await fetch(`${API_BASE}/review`, {
//         method: "POST",
//         credentials: "include", // sends Better Auth session cookie
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           customerId: currentUser.id,
//           productId,
//           rating,
//           comment,
//         }),
//       });
//       const json = await res.json();
//       if (!res.ok || !json.success) {
//         throw new Error(json.message || "Failed to submit review");
//       }
//       setRating(0);
//       setComment("");
//       onRefresh();
//     } catch (err: any) {
//       setFormError(err.message || "Something went wrong");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleSubmitReply = async (reviewId: string) => {
//     if (!currentUser || !replyText.trim()) return;
//     setReplySubmitting(true);
//     try {
//       const res = await fetch(`${API_BASE}/review/replay`, {
//         method: "POST",
//         credentials: "include",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           reviewId,
//           userId: currentUser.id,
//           comment: replyText,
//         }),
//       });
//       const json = await res.json();
//       if (!res.ok || !json.success) {
//         throw new Error(json.message || "Failed to post reply");
//       }
//       setReplyText("");
//       setReplyOpenFor(null);
//       onRefresh();
//     } catch (err: any) {
//       console.error(err);
//     } finally {
//       setReplySubmitting(false);
//     }
//   };

//   return (
//     <div className="mt-10">
//       <div className="flex items-center gap-3">
//         <h2 className="text-lg font-extrabold text-[#1a1208]">
//           Reviews {reviews.length > 0 && `(${reviews.length})`}
//         </h2>
//         {reviews.length > 0 && (
//           <div className="flex items-center gap-1 rounded-full bg-[#fef4ec] px-3 py-1">
//             <Star className="h-3.5 w-3.5 fill-[#e85d04] text-[#e85d04]" />
//             <span className="text-xs font-bold">{avgRating.toFixed(1)}</span>
//           </div>
//         )}
//       </div>

//       {/* ── Write a review ── */}
//       <div className="mt-4 rounded-2xl border border-[#ede5d8] bg-[#faf7f3] p-4">
//         {currentUser ? (
//           <>
//             <h3 className="text-sm font-bold text-[#1a1208]">Write a review</h3>
//             <div className="mt-2">
//               <StarRatingInput value={rating} onChange={setRating} />
//             </div>
//             <textarea
//               value={comment}
//               onChange={(e) => setComment(e.target.value)}
//               placeholder="Share your experience with this item…"
//               rows={3}
//               className="mt-3 w-full resize-none rounded-xl border border-[#ede5d8] bg-white p-3 text-sm text-[#1a1208] outline-none focus:border-[#e85d04]"
//             />
//             {formError && (
//               <p className="mt-1 text-xs text-[#e85d04]">{formError}</p>
//             )}
//             <button
//               onClick={handleSubmitReview}
//               disabled={submitting}
//               className="mt-3 flex items-center gap-1.5 rounded-full bg-[#e85d04] px-5 py-2 text-sm font-bold text-white disabled:opacity-60"
//             >
//               {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
//               Submit Review
//             </button>
//           </>
//         ) : (
//           <p className="text-sm text-[#7a6a55]">
//             Please log in to leave a review.
//           </p>
//         )}
//       </div>

//       {/* ── Review list ── */}
//       {reviews.length === 0 ? (
//         <p className="mt-4 text-sm text-[#7a6a55]">
//           No reviews yet for this item.
//         </p>
//       ) : (
//         <div className="mt-4 flex flex-col gap-4">
//           {reviews.map((review) => (
//             <div
//               key={review.reviewId}
//               className="rounded-2xl border border-[#ede5d8] bg-[#faf7f3] p-4"
//             >
//               <div className="flex items-center justify-between gap-2">
//                 <div className="flex items-center gap-2">
//                   {review.customer.image ? (
//                     <img
//                       src={review.customer.image}
//                       alt={review.customer.name}
//                       className="h-8 w-8 rounded-full object-cover"
//                     />
//                   ) : (
//                     <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fde8d8] text-xs font-bold text-[#e85d04]">
//                       {review.customer.name?.charAt(0)?.toUpperCase() ?? "U"}
//                     </span>
//                   )}
//                   <div>
//                     <span className="text-sm font-bold text-[#1a1208]">
//                       {review.customer.name}
//                     </span>
//                     <p className="text-xs text-[#a08060]">
//                       {formatReviewDate(review.createdAt)}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-0.5">
//                   {[1, 2, 3, 4, 5].map((i) => (
//                     <Star
//                       key={i}
//                       className={`h-3.5 w-3.5 ${
//                         i <= review.rating
//                           ? "fill-[#e85d04] text-[#e85d04]"
//                           : "fill-[#e0d5c4] text-[#e0d5c4]"
//                       }`}
//                     />
//                   ))}
//                 </div>
//               </div>

//               {review.comment && (
//                 <p className="mt-2 text-sm text-[#5a4a35]">{review.comment}</p>
//               )}

//               {/* Existing replies */}
//               {review.reviewReplays.length > 0 && (
//                 <div className="mt-3 flex flex-col gap-2 border-l-2 border-[#ede5d8] pl-3">
//                   {review.reviewReplays.map((reply) => (
//                     <div key={reply.replyId}>
//                       <span className="text-xs font-bold text-[#e85d04]">
//                         {reply.user.name}
//                         {reply.user.role === "PROVIDER" && " (Provider)"}
//                       </span>
//                       <p className="text-sm text-[#5a4a35]">{reply.comment}</p>
//                     </div>
//                   ))}
//                 </div>
//               )}

//               {/* Reply action — any logged-in user can reply to any review */}
//               {currentUser && (
//                 <div className="mt-3">
//                   {replyOpenFor === review.reviewId ? (
//                     <div className="flex flex-col gap-2">
//                       <textarea
//                         value={replyText}
//                         onChange={(e) => setReplyText(e.target.value)}
//                         placeholder="Write a reply…"
//                         rows={2}
//                         className="w-full resize-none rounded-xl border border-[#ede5d8] bg-white p-2.5 text-sm text-[#1a1208] outline-none focus:border-[#e85d04]"
//                       />
//                       <div className="flex gap-2">
//                         <button
//                           onClick={() => handleSubmitReply(review.reviewId)}
//                           disabled={replySubmitting || !replyText.trim()}
//                           className="rounded-full bg-[#e85d04] px-4 py-1.5 text-xs font-bold text-white disabled:opacity-60"
//                         >
//                           Post Reply
//                         </button>
//                         <button
//                           onClick={() => {
//                             setReplyOpenFor(null);
//                             setReplyText("");
//                           }}
//                           className="rounded-full border border-[#ede5d8] px-4 py-1.5 text-xs font-bold text-[#7a6a55]"
//                         >
//                           Cancel
//                         </button>
//                       </div>
//                     </div>
//                   ) : (
//                     <button
//                       onClick={() => setReplyOpenFor(review.reviewId)}
//                       className="flex items-center gap-1 text-xs font-bold text-[#8a7460] hover:text-[#e85d04]"
//                     >
//                       <MessageSquareReply className="h-3.5 w-3.5" />
//                       Reply
//                     </button>
//                   )}
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import React, { useEffect, useState } from "react";
import { Star, MessageSquareReply, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client"; // 👈 adjust path/import if different

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export interface ReviewReply {
  replyId: string;
  comment: string;
  createdAt: string;
  user: { id: string; name: string; role?: string };
}

export interface ReviewItem {
  reviewId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  customer: { id: string; name: string; image?: string | null };
  reviewReplays: ReviewReply[];
}

interface ReviewSectionProps {
  productId: string;
  reviews: ReviewItem[];
  onRefresh: () => void;
}

function formatReviewDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
          className="p-0.5"
        >
          <Star
            className={`h-6 w-6 transition-colors ${
              i <= (hover || value)
                ? "fill-[#e85d04] text-[#e85d04]"
                : "fill-[#e0d5c4] text-[#e0d5c4]"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection({
  productId,
  reviews,
  onRefresh,
}: ReviewSectionProps) {
  const { data: session } = authClient.useSession();
  const currentUser = session?.user;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [canReview, setCanReview] = useState<boolean | null>(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  const [replyOpenFor, setReplyOpenFor] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  useEffect(() => {
    if (!currentUser) {
      setCanReview(null);
      return;
    }

    const checkEligibility = async () => {
      setCheckingEligibility(true);
      try {
        const res = await fetch(
          `${API_BASE}/review/can-review/${productId}?customerId=${currentUser.id}`,
          { credentials: "include" },
        );
        const json = await res.json();
        setCanReview(Boolean(json?.data?.canReview));
      } catch (err) {
        console.error(err);
        setCanReview(false);
      } finally {
        setCheckingEligibility(false);
      }
    };

    checkEligibility();
  }, [currentUser?.id, productId]);

  const handleSubmitReview = async () => {
    if (!currentUser) return;
    if (rating === 0) {
      setFormError("Please select a rating");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      const res = await fetch(`${API_BASE}/review`, {
        method: "POST",
        credentials: "include", // sends Better Auth session cookie
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: currentUser.id,
          productId,
          rating,
          comment,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to submit review");
      }
      setRating(0);
      setComment("");
      onRefresh();
    } catch (err: any) {
      setFormError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (reviewId: string) => {
    if (!currentUser || !replyText.trim()) return;
    setReplySubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/review/replay`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId,
          userId: currentUser.id,
          comment: replyText,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to post reply");
      }
      setReplyText("");
      setReplyOpenFor(null);
      onRefresh();
    } catch (err: any) {
      console.error(err);
    } finally {
      setReplySubmitting(false);
    }
  };

  return (
    <div className="mt-10">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-extrabold text-[#1a1208]">
          Reviews {reviews.length > 0 && `(${reviews.length})`}
        </h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-1 rounded-full bg-[#fef4ec] px-3 py-1">
            <Star className="h-3.5 w-3.5 fill-[#e85d04] text-[#e85d04]" />
            <span className="text-xs font-bold">{avgRating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* ── Write a review ── */}
      <div className="mt-4 rounded-2xl border border-[#ede5d8] bg-[#faf7f3] p-4">
        {!currentUser ? (
          <p className="text-sm text-[#7a6a55]">
            Please log in to leave a review.
          </p>
        ) : checkingEligibility ? (
          <p className="text-sm text-[#7a6a55]">Checking review eligibility…</p>
        ) : !canReview ? (
          <p className="text-sm text-[#7a6a55]">
            You can leave a review once this product has been delivered to you.
          </p>
        ) : (
          <>
            <h3 className="text-sm font-bold text-[#1a1208]">Write a review</h3>
            <div className="mt-2">
              <StarRatingInput value={rating} onChange={setRating} />
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this item…"
              rows={3}
              className="mt-3 w-full resize-none rounded-xl border border-[#ede5d8] bg-white p-3 text-sm text-[#1a1208] outline-none focus:border-[#e85d04]"
            />
            {formError && (
              <p className="mt-1 text-xs text-[#e85d04]">{formError}</p>
            )}
            <button
              onClick={handleSubmitReview}
              disabled={submitting}
              className="mt-3 flex items-center gap-1.5 rounded-full bg-[#e85d04] px-5 py-2 text-sm font-bold text-white disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit Review
            </button>
          </>
        )}
      </div>

      {/* ── Review list ── */}
      {reviews.length === 0 ? (
        <p className="mt-4 text-sm text-[#7a6a55]">
          No reviews yet for this item.
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-4">
          {reviews.map((review) => (
            <div
              key={review.reviewId}
              className="rounded-2xl border border-[#ede5d8] bg-[#faf7f3] p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {review.customer.image ? (
                    <img
                      src={review.customer.image}
                      alt={review.customer.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fde8d8] text-xs font-bold text-[#e85d04]">
                      {review.customer.name?.charAt(0)?.toUpperCase() ?? "U"}
                    </span>
                  )}
                  <div>
                    <span className="text-sm font-bold text-[#1a1208]">
                      {review.customer.name}
                    </span>
                    <p className="text-xs text-[#a08060]">
                      {formatReviewDate(review.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i <= review.rating
                          ? "fill-[#e85d04] text-[#e85d04]"
                          : "fill-[#e0d5c4] text-[#e0d5c4]"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {review.comment && (
                <p className="mt-2 text-sm text-[#5a4a35]">{review.comment}</p>
              )}

              {/* Existing replies */}
              {review.reviewReplays.length > 0 && (
                <div className="mt-3 flex flex-col gap-2 border-l-2 border-[#ede5d8] pl-3">
                  {review.reviewReplays.map((reply) => (
                    <div key={reply.replyId}>
                      <span className="text-xs font-bold text-[#e85d04]">
                        {reply.user.name}
                        {reply.user.role === "PROVIDER" && " (Provider)"}
                      </span>
                      <p className="text-sm text-[#5a4a35]">{reply.comment}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply action — any logged-in user can reply to any review */}
              {currentUser && (
                <div className="mt-3">
                  {replyOpenFor === review.reviewId ? (
                    <div className="flex flex-col gap-2">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply…"
                        rows={2}
                        className="w-full resize-none rounded-xl border border-[#ede5d8] bg-white p-2.5 text-sm text-[#1a1208] outline-none focus:border-[#e85d04]"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSubmitReply(review.reviewId)}
                          disabled={replySubmitting || !replyText.trim()}
                          className="rounded-full bg-[#e85d04] px-4 py-1.5 text-xs font-bold text-white disabled:opacity-60"
                        >
                          Post Reply
                        </button>
                        <button
                          onClick={() => {
                            setReplyOpenFor(null);
                            setReplyText("");
                          }}
                          className="rounded-full border border-[#ede5d8] px-4 py-1.5 text-xs font-bold text-[#7a6a55]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReplyOpenFor(review.reviewId)}
                      className="flex items-center gap-1 text-xs font-bold text-[#8a7460] hover:text-[#e85d04]"
                    >
                      <MessageSquareReply className="h-3.5 w-3.5" />
                      Reply
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
