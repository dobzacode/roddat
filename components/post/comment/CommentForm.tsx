"use client";

import Input from "@/components/ui/form/Input";
import { Session } from "next-auth";
import { getSession } from "next-auth/react";
import { ChangeEvent, FormEvent, useState } from "react";

export function CommentForm({ post_id }: { post_id: string }) {
  const [content, setContent] = useState<string>("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    const session: Session | null = await getSession();
    e.preventDefault();
    try {
      if (content.trim() === "") {
        return;
      }
      const commentData = {
        post_id,
        content,
        email: session?.user?.email,
      };

      const res = await fetch(`/api/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(commentData),
      });
      const data = await res.json();
      console.log(data);
      setContent("");
    } catch (e) {
      // Gérer les erreurs ici
    }
  };

  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        required
        type="textarea"
        hiddenLabel={true}
        intent="primary"
        id="content"
        value={content}
        onChange={handleContentChange}
      />
      <button type="submit">Publier</button>
    </form>
  );
}
