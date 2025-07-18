const express = require("express");
const Quote = require("../models/Quote");
const auth = require("../middleware/authMiddleware");
const router = express.Router();
const jwt = require("jsonwebtoken");

// router.post("/", auth, async (req, res) => {
//   const newQuote = new Quote({ text: req.body.text, user: req.userId });
//   await newQuote.save();
//   res.status(201).json(newQuote);
// });

router.post("/", auth, async (req, res) => {
  console.log("req.userId:", req.userId);
  const { title, text, flagged = false } = req.body;

  try {
    const newQuote = new Quote({
      title,
      text,
      user: req.userId,
      flagged,
    });

    await newQuote.save();
    res.status(201).json(newQuote);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
});


router.get("/", async (req, res) => {
  try {
    const quotes = await Quote.find()
      .populate("user", "name")                // blog author name
      .populate("comments.user", "name");      // comment author name

    res.json(quotes);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
});



router.patch("/:id/like", auth, async (req, res) => {
  const quote = await Quote.findById(req.params.id);
  if (!quote) return res.status(404).json({ message: "Not found" });

  const userId = req.userId;
  const index = quote.likes.indexOf(userId);

  if (index > -1) {
    quote.likes.splice(index, 1); // Unlike
  } else {
    quote.likes.push(userId); // Like
  }

  await quote.save();
  res.json({ likes: quote.likes.length });
});

// ✅ DELETE: Delete a quote (only by owner)
router.delete("/:id", auth, async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) return res.status(404).json({ message: "Quote not found" });
    console.log(quote.user.toString());
    console.log(req.userId);
    if (!quote.user.equals(req.userId)) {
      return res.status(403).json({ message: "You are not allowed to delete this quote" });
    }

    await quote.deleteOne();
    res.json({ message: "Quote deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Server error" });
  }
});







// Add comment
router.post("/:id/comments", async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) return res.status(404).json({ message: "Quote not found" });

    let userId = null;

    // Try to extract user ID from cookie token (if exists)
    const token = req.cookies?.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        console.log("Token invalid or expired — treating as anonymous");
      }
    }

    const comment = {
      text: req.body.text,
      flagged: req.body.flagged,
      user: userId, // Either ObjectId or null (for anonymous)
    };

    quote.comments.push(comment);
    await quote.save();

    res.status(201).json({ message: "Comment added", quote });
  } catch (err) {
    console.error("Add comment error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});



// Delete flagged comment — only by quote author
// router.delete("/:quoteId/comments/:commentId", auth, async (req, res) => {
//   try {
//     const { quoteId, commentId } = req.params;

//     const quote = await Quote.findById(quoteId);
//     if (!quote) return res.status(404).json({ message: "Quote not found" });

//     // ✅ Log all comment IDs
//     console.log("All comment IDs in quote:");
//     quote.comments.forEach(c => console.log(c._id.toString()));

//     console.log("Requested commentId:", commentId);

//     // ✅ Find comment by _id
//     const comment = quote.comments.find(
//       (c) => c._id.toString() === commentId.trim()
//     );

//     if (!comment) return res.status(404).json({ message: "Comment not found" });

//     // ✅ Authorization check (quote owner + flagged only)
//     if (
//       quote.user.toString() !== req.user._id.toString() ||
//       !comment.flagged
//     ) {
//       return res.status(403).json({ message: "Not authorized" });
//     }

//     // ✅ Remove the comment from array
//     quote.comments = quote.comments.filter(
//       (c) => c._id.toString() !== commentId.trim()
//     );

//     await quote.save();

//     res.json({ message: "Comment deleted successfully" });
//   } catch (err) {
//     console.error("Error deleting comment:", err);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

router.delete("/:quoteId/comments/:commentId", auth, async (req, res) => {
  try {
    const { quoteId, commentId } = req.params;

    const quote = await Quote.findById(quoteId);
    if (!quote) return res.status(404).json({ message: "Quote not found" });

    // ✅ Only quote author can delete comments
    if (quote.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not the author of this quote" });
    }

    const comment = quote.comments.find(
      (c) => c._id.toString() === commentId.trim()
    );

    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // ✅ Remove the comment
    quote.comments = quote.comments.filter(
      (c) => c._id.toString() !== commentId.trim()
    );

    await quote.save();

    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});








module.exports = router;
