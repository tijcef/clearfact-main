import { useEffect, useState } from "react";
import {
  getComments,
  submitComment,
} from "@/lib/wordpress";

export default function Comments({
  postId,
}: {
  postId: number;
}) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      const data = await getComments(postId);
      setComments(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      await submitComment(
        postId,
        name,
        email,
        content
      );

      alert(
        "Comment submitted successfully."
      );

      setName("");
      setEmail("");
      setContent("");

      loadComments();
    } catch (error) {
      console.error(error);
      alert("Failed to submit comment.");
    }
  };

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-6">
        Comments ({comments.length})
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 mb-10"
      >
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          required
          className="w-full border rounded-lg p-3"
        />

        <input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          required
          className="w-full border rounded-lg p-3"
        />

        <textarea
          placeholder="Write your comment..."
          value={content}
          onChange={(e) =>
            setContent(e.target.value)
          }
          required
          rows={5}
          className="w-full border rounded-lg p-3"
        />

        <button
          type="submit"
          className="bg-primary text-white px-5 py-3 rounded-lg"
        >
          Post Comment
        </button>
      </form>

      {loading ? (
        <p>Loading comments...</p>
      ) : comments.length === 0 ? (
        <p>No comments yet.</p>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="border rounded-lg p-4"
            >
              <h4 className="font-semibold">
                {comment.author_name}
              </h4>

              <div
                className="mt-2 text-sm"
                dangerouslySetInnerHTML={{
                  __html:
                    comment.content.rendered,
                }}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}