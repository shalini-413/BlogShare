import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getQuotes, addComment, deleteComment } from "../services/api";
import Swal from "sweetalert2";
import { checkHateSpeech } from "../utils/hateCheck";

export default function QuoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [quote, setQuote] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const res = await getQuotes();
        const selectedQuote = res.data.find((q) => q._id === id);
        if (!selectedQuote) {
          toast.error("Quote not found");
          navigate("/dashboard");
          return;
        }
        setQuote(selectedQuote);
        setLoading(false);
      } catch (err) {
        toast.error("Failed to fetch quote");
        console.error(err);
        setLoading(false);
      }
    };
    fetchQuote();
  }, [id, navigate]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText) return toast.error("Please write a comment!");

    const result = await checkHateSpeech(commentText);
    const flagged = result?.prediction === "Hate Speech";

    if (flagged) {
      const res = await Swal.fire({
        icon: "warning",
        title: "\u26A0\uFE0F Hate Speech Detected!",
        text: "This comment was flagged by our AI model. Do you still want to post it (marked as flagged)?",
        showCancelButton: true,
        confirmButtonText: "Yes, post anyway",
        cancelButtonText: "No, cancel",
      });

      if (!res.isConfirmed) return;
    }

    try {
      await addComment(id, { text: commentText, flagged });
      toast.success("Comment added!");
      setCommentText("");
      const res = await getQuotes();
      const updatedQuote = res.data.find((q) => q._id === id);
      setQuote(updatedQuote);
    } catch (err) {
      toast.error("Failed to add comment");
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(id, commentId);
      toast.success("Comment deleted!");
      const res = await getQuotes();
      const updatedQuote = res.data.find((q) => q._id === id);
      setQuote(updatedQuote);
    } catch (err) {
      toast.error("Error deleting comment");
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (!quote) {
    return <div className="text-center py-10">Quote not found</div>;
  }

  const hateComments = quote.comments?.filter((c) => c.flagged) || [];
  const allComments = quote.comments || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/dashboard"
          className="text-purple-700 underline hover:text-purple-900 mb-6 inline-block"
        >
          ← Back to Dashboard
        </Link>

        <div className="bg-white shadow-lg border border-gray-300 rounded-3xl p-8 mb-8">
          <h1 className="text-3xl font-bold text-purple-800 mb-4">{quote.title}</h1>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">{quote.text}</p>
          <p className="text-sm text-gray-500 italic text-right">— {quote.user?.name}</p>
        </div>

        <div className="bg-white shadow-lg border border-gray-300 rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-purple-800 mb-4">Add a Comment</h2>
          <form onSubmit={handleCommentSubmit} className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write your comment..."
              className="flex-1 px-3 py-2 border border-purple-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <button
              type="submit"
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition text-sm"
            >
              Post Comment
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white shadow-lg border border-gray-300 rounded-3xl p-8">
            <h2 className="text-2xl font-semibold text-red-600 mb-4">Flagged Comments</h2>
            {hateComments.length === 0 ? (
              <p className="text-gray-600">No flagged comments yet.</p>
            ) : (
              hateComments.map((c) => (
                <div key={c._id} className="mb-4 border-b pb-2">
                  <p className="text-gray-800">{c.text}</p>
                  <p className="text-xs text-red-600">⚠️ Flagged as hate</p>
                  {(quote.user._id === user._id || c.user._id === user._id) && (
                    <button
                      onClick={() => handleDeleteComment(c._id)}
                      className="text-xs text-red-500 underline mt-1"
                    >
                      Delete Comment
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="bg-white shadow-lg border border-gray-300 rounded-3xl p-8">
            <h2 className="text-2xl font-semibold text-purple-800 mb-4">All Comments</h2>
            {allComments.length === 0 ? (
              <p className="text-gray-600">No comments yet.</p>
            ) : (
              allComments.map((c) => (
                <div key={c._id} className="mb-4 border-b pb-2">
                  <p className="text-gray-800">{c.text}</p>
                  {c.flagged && <p className="text-xs text-red-600">⚠️ Flagged as hate</p>}
                  {(quote.user._id === user._id || c.user._id === user._id) && (
                    <button
                      onClick={() => handleDeleteComment(c._id)}
                      className="text-xs text-red-500 underline mt-1"
                    >
                      Delete Comment
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}