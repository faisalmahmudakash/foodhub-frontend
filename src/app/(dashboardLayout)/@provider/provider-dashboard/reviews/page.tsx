"use client";

import React, { useEffect, useState } from "react";
import { Star, MessageSquareReply, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import {
  fetchMyProductReviews,
  postProviderReply,
} from "@/helpers/providerApi";
import type { ProviderReview } from "@/types/provider.type";

function formatReviewDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ProviderReviewsPage() {
  const { data: session } = authClient.useSession();
  const currentUser = session?.user;

  const [reviews, setReviews] = useState<ProviderReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [replyOpenFor, setReplyOpenFor] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  const loadReviews = async () => {
    try {
      const data = await fetchMyProductReviews();
      setReviews(data);
    } catch (err: any) {
      setError(err.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleSubmitReply = async (reviewId: string) => {
    if (!currentUser || !replyText.trim()) return;
    setReplySubmitting(true);
    try {
      await postProviderReply(reviewId, currentUser.id, replyText);
      setReplyText("");
      setReplyOpenFor(null);
      await loadReviews();
    } catch (err: any) {
      alert(err.message || "Failed to post reply");
    } finally {
      setReplySubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3.5 px-4 py-10 text-[#7a6a55]">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[#e0d5c4] border-t-[#e85d04]" />
        <p>Loading reviews…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center px-4 py-10 text-[#e85d04]">
        ⚠️ {error}
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="mb-5 text-xl font-extrabold text-[#1a1208]">
        Reviews on My Products
      </h1>

      {reviews.length === 0 ? (
        <p className="text-sm text-[#7a6a55]">No reviews yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((review) => (
            <div
              key={review.reviewId}
              className="rounded-2xl border border-[#ede5d8] bg-[#faf7f3] p-4"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-[#f5ede0]">
                  {review.product.images ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={review.product.images}
                      alt={review.product.productName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-base">
                      🍽️
                    </div>
                  )}
                </div>
                <span className="text-sm font-bold text-[#1a1208]">
                  {review.product.productName}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {review.customer.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
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
                          className="flex items-center gap-1.5 rounded-full bg-[#e85d04] px-4 py-1.5 text-xs font-bold text-white disabled:opacity-60"
                        >
                          {replySubmitting && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          )}
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
