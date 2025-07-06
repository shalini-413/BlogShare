import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import {
  createQuote,
  getQuotes,
  likeQuote,
  deleteQuote,
  logoutUser,
} from "../services/api";

const user = JSON.parse(localStorage.getItem("user"));

export default function Dashboard() {
  const navigate = useNavigate();
  const [quote, setQuote] = useState("");
  const [title, setTitle] = useState("");
  const [quotes, setQuotes] = useState([]);
  const [search, setSearch] = useState("");
  // const [user, setUser] = useState(null);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const res = await getQuotes();
      setQuotes(res.data);
    } catch (err) {
      toast.error("Failed to fetch quotes");
      console.error(err);
    }
  };

  const filteredQuotes = quotes.filter((q) => {
    const author = q.user?.name?.toLowerCase() || "";
    const title = q.title?.toLowerCase() || "";
    return (
      author.includes(search.toLowerCase()) ||
      title.includes(search.toLowerCase())
    );
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quote) return toast.error("Please write a quote!");
    console.log(quote)

    try {
      console.log(title);
      console.log(quote);
      await createQuote({ title, text: quote });
      setQuote("");
      setTitle("");
      fetchQuotes();
      toast.success("Quote posted successfully!");
    } catch (err) {
      toast.error("Failed to post quote.");
      console.error(err);
    }
  };

  const handleLike = async (id) => {
    try {
      await likeQuote(id);
      fetchQuotes();
    } catch (err) {
      toast.error("Could not like the quote. Please try again.");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteQuote(id);
      fetchQuotes();
      toast.success("Quote deleted 🗑️");
    } catch (err) {
      toast.error("Failed to delete quote.");
      console.error(err);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem("user");
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-neutral-950 px-4 py-10 text-white">
      <div className="w-full px-4 sm:px-8 lg:px-16 mx-auto">

        {/* 🌟 Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-5xl font-extrabold uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-200">
            BlogShare
          </h1>

          <div className="flex gap-3">
            <Link
              to="/profile"
              className="bg-gradient-to-r from-purple-900 to-fuchsia-900 text-white px-6 py-3 rounded-[1vw] font-semibold shadow-md border border-purple-800 hover:scale-105 hover:shadow-lg hover:border-fuchsia-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
            >
              View Profile
            </Link>
            <button
              onClick={() => logout()}
              className="bg-gradient-to-r from-red-900 to-red-900 text-white px-6 py-3 rounded-[2vw] font-semibold shadow-md border border-red-800 hover:scale-105 hover:shadow-lg hover:border-fuchsia-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
            >
              Logout
            </button>
          </div>
        </div>

        {/* ✍️ Create Quote */}
        <form
          onSubmit={handleSubmit}
          className="bg-zinc-900/70 backdrop-blur-lg p-6 rounded-3xl shadow-lg border border-zinc-700 mb-10"
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter blog title"
            className="w-full p-3 rounded-xl border border-zinc-600 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-black text-white placeholder:text-zinc-400"
          />
          <textarea
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            placeholder="Write your quote..."
            rows={4}
            className="w-full p-3 rounded-xl border border-zinc-600 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-black text-white placeholder:text-zinc-400"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-purple-900 to-fuchsia-900 text-white px-6 py-3 rounded-[1vw] font-semibold shadow-md border border-purple-800 hover:scale-105 hover:shadow-lg hover:border-fuchsia-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
          >
            ✍️ Post Quote
          </button>
        </form>

        {/* 🔍 Search */}
        <div className="relative mb-8">
          <input
            type="text"
            placeholder="🔍 Search by author or title"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-5 py-3 pl-12 bg-zinc-800 border border-purple-500 rounded-[2vw] shadow focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-purple-300"
          />
        </div>

        {/* 📜 Quotes Display */}
        {filteredQuotes.length === 0 ? (
          <p className="text-center text-zinc-400">No quotes found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredQuotes.map((q, i) => (
              <div
                key={q._id}
                className="relative bg-gradient-to-br from-purple-900 via-indigo-800 to-gray-900 p-8 border border-zinc-700  transition-all duration-300 hover:shadow-2xl hover:shadow-lg"
              >
                <Link to={`/pubprofile/${q.user?._id || q.user}/${q._id}`}>
                  <h3 className="text-xl font-bold text-white uppercase mb-2 hover:underline">
                    {q.title}
                  </h3>
                  <p className="text-white leading-relaxed whitespace-pre-wrap relative pl-2 font-serif line-clamp-3">
                    {q.text}
                  </p>
                </Link>

                <div className="mt-4 flex justify-between items-center text-sm text-purple-300">
                  <p>— {q.user?.name}</p>
                  <span>
                    🕒{" "}
                    {new Date(q.createdAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>

                <div className="mt-3 flex justify-end items-center gap-4 text-purple-400 text-sm">
                  <button
                    onClick={() => handleLike(q._id)}
                    className="hover:text-fuchsia-400 transition"
                  >
                    💜 {q.likes?.length || 0}
                  </button>
                  <span>💬 {q.comments?.length || 0}</span>
                  {(user && q.user && (q.user === user._id || q.user._id === user._id)) && (
                    <button
                      onClick={() => handleDelete(q._id)}
                      className="text-red-400 hover:underline"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


