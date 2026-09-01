import { useCallback, useEffect, useRef, useState } from "react";
import { getComments, submitComment, WordPressRequestError } from "@/lib/wordpress";

type Feedback = {
  kind: "error" | "success";
  message: string;
};

export default function Comments({ postId }: { postId: number }) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const loadComments = useCallback(async () => {
    setLoading(true);

    try {
      const data = await getComments(postId);
      setComments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
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
    setFeedback(null);

    if (!name.trim() || !content.trim()) {
      setFeedback({ kind: "error", message: "Please enter your name and comment." });
      return;
    }

    setSubmitting(true);

    try {
      const submitted = await submitComment(postId, name, content);

      setName("");
      setContent("");

      if (submitted.status === "hold") {
        setFeedback({
          kind: "success",
          message: "Your comment has been received and is awaiting moderation.",
        });
      } else {
        setFeedback({ kind: "success", message: "Your comment has been published." });
        await loadComments();
      }
    } catch (error) {
      console.error(error);

      const message =
        error instanceof WordPressRequestError && error.code === "rest_comment_login_required"
          ? "Commenting is temporarily unavailable. Please try again shortly."
          : error instanceof WordPressRequestError
            ? error.message
            : error instanceof Error && error.message.includes("timed out")
              ? "The comment server is responding slowly. Please wait a moment and try again."
              : "We could not submit your comment. Please try again.";

      setFeedback({ kind: "error", message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section ref={sectionRef} className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Comments ({comments.length})</h2>

      <form onSubmit={handleSubmit} className="space-y-4 mb-10">
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          maxLength={100}
          required
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

        {feedback ? (
          <p
            role={feedback.kind === "error" ? "alert" : "status"}
            className={
              feedback.kind === "error" ? "text-sm text-destructive" : "text-sm text-green-700"
            }
          >
            {feedback.message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="bg-primary text-white px-5 py-3 rounded-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Post Comment"}
        </button>
      </form>

      {!shouldLoad ? (
        <p>Comments will load as you reach this section.</p>
      ) : loading ? (
        <p>Loading comments...</p>
      ) : comments.length === 0 ? (
        <p>No comments yet.</p>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="border rounded-lg p-4">
              <h4 className="font-semibold">{comment.author_name}</h4>

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
