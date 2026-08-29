import { useCallback, useEffect, useRef, useState } from "react";
import { getComments, submitComment } from "@/lib/wordpress";

export default function Comments({ postId }: { postId: number }) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const [name, setName] = useState("");
  const [content, setContent] = useState("");

  const loadComments = useCallback(async () => {
    setLoading(true);

    try {
      const data = await getComments(postId);
      setComments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section || typeof IntersectionObserver === "undefined") {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, [postId]);

  useEffect(() => {
    if (shouldLoad) {
      void loadComments();
    }
  }, [loadComments, shouldLoad]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanName = name.trim();
    const cleanContent = content.trim();

    if (!cleanName || !cleanContent) {
      alert("Please enter your name and comment.");
      return;
    }

    setSubmitting(true);

    try {
      // Email is intentionally left blank.
      await submitComment(postId, cleanName, "", cleanContent);

      alert(
        "Thank you. Your comment has been submitted and may be held for moderation.",
      );

      setName("");
      setContent("");

      void loadComments();
    } catch (error) {
      console.error("Failed to submit comment:", error);
      alert("Failed to submit comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section ref={sectionRef} className="mt-12">
      <h2 className="text-2xl font-bold mb-2">
        Join the Conversation
      </h2>

      <p className="text-sm text-muted-foreground mb-6">
        Share your thoughts on this story. Comments may be moderated before
        appearing publicly.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 mb-10">
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={100}
          className="w-full border rounded-lg p-3"
        />

        <textarea
          placeholder="Write your comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          maxLength={2000}
          rows={5}
          className="w-full border rounded-lg p-3"
        />

        <button
          type="submit"
          disabled={submitting}
          className="bg-primary text-white px-5 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Posting..." : "Post Comment"}
        </button>
      </form>

      {!shouldLoad ? (
        <p>Comments will load as you reach this section.</p>
      ) : loading ? (
        <p>Loading comments...</p>
      ) : comments.length === 0 ? (
        <p>No comments yet. Be the first to join the conversation.</p>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="border rounded-lg p-4">
              <h4 className="font-semibold">
                {comment.author_name || "Reader"}
              </h4>

              <div
                className="mt-2 text-sm"
                dangerouslySetInnerHTML={{
                  __html: comment.content.rendered,
                }}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}