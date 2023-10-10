"use client";

import Avatar from "@/components/ui/Avatar";
import P from "@/components/ui/text/P";
import { CommentDetail } from "@/interface/interface";
import { cn, countSections, getDateDifference } from "@/utils/utils";
import { mdiArrowDown, mdiArrowUp, mdiCommentOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { Comment, Post, User, Vote } from "@prisma/client";
import { ReactNode, useEffect, useState } from "react";
import PostSkeleton from "../PostSkeleton";
import Button from "@/components/ui/button/Button";
import { CommentForm } from "./CommentForm";

export default function CommentBar({
  comment_id,
  content,
  className,
  children,
  sibling,
}: {
  comment_id: string;
  content: string;
  className?: string;
  children?: ReactNode;
  sibling: number;
}) {
  const [upvotes, setUpvotes] = useState<Vote[] | []>([]);
  const [downvotes, setDownvotes] = useState<Vote[] | []>([]);
  const [author, setAuthor] = useState<{
    name: string;
    image: string | null;
  } | null>(null);
  const [comment, setComment] = useState<CommentDetail | null>(null);
  const [isReplying, setIsReplying] = useState(false);
  const [size, setSize] = useState(0);

  useEffect(() => {
    const fetchComment = async () => {
      const res = await fetch(`/api/comments?comment_id=${comment_id}`);

      const { comment: data }: { comment: CommentDetail } = await res.json();

      setUpvotes(data.votes?.filter((vote: Vote) => vote.type === "UPVOTE"));

      setDownvotes(
        data.votes?.filter((vote: Vote) => vote.type === "DOWNVOTE"),
      );

      setAuthor(data.author);

      setComment(data);

      const parentElement = document.getElementById("parent_section");

      // Comptez les sections enfants de l'élément parent
      const sectionCount = parentElement
        ? parentElement.querySelectorAll("section").length
        : 0;

      setSize(sectionCount);
    };
    fetchComment();
  }, [content]);

  if (!comment) {
    return <PostSkeleton></PostSkeleton>;
  }

  console.log(content, size);

  return (
    <>
      <section
        className={cn(
          `relative z-50 flex h-full w-full flex-col gap-sub-large `,
          className,
        )}
        id="parent_section"
      >
        <div>
          <div
            className={cn(
              "absolute -left-large z-0 flex  h-full flex-col items-center",
              className,
            )}
          >
            <Avatar
              src={comment?.author.image}
              size={5}
              className="relative z-10 rounded-small"
            ></Avatar>
            {sibling > 1 && (
              <div
                className={`pointer-events-none relative z-0 -mb-12 block h-full w-[1px] border-x border-t border-primary20`}
              ></div>
            )}
          </div>
          <div
            className={cn(
              "brutalism-border primary-hover relative flex  h-[14rem] w-full rounded-small border-primary80",
            )}
          >
            <div className="flex flex-col items-center gap-extra-small  rounded-l-small bg-primary10 p-small">
              <Icon path={mdiArrowUp} size={1}></Icon>
              <P>{comment?.votes ? upvotes.length - downvotes.length : 0}</P>
              <Icon path={mdiArrowDown} size={1}></Icon>
            </div>
            <div className="flex flex-col justify-between gap-extra-small p-small">
              <div className="caption flex items-center gap-extra-small">
                <P type="caption">{`Posted by u/${
                  comment?.author.name ? comment?.author.name : "deleted"
                }`}</P>
                <P type="caption">
                  {comment?.createdAt && getDateDifference(comment?.createdAt)}
                </P>
              </div>
              <P>{comment.content}</P>
              <Button
                onClick={() => setIsReplying(!isReplying)}
                className="flex w-fit items-start gap-extra-small"
              >
                <Icon path={mdiCommentOutline} size={1.4}></Icon>
                <P>Reply</P>
              </Button>
            </div>
          </div>
        </div>
        {isReplying && (
          <CommentForm
            className="ml-large"
            parent_comment_id={comment.comment_id}
            post_id={comment.post_id}
            isReplying={isReplying}
          />
        )}
        {comment.child_comments &&
          comment.child_comments.map((comment) => {
            return (
              <CommentBar
                sibling={2}
                className="z-0 pl-large"
                comment_id={comment.comment_id}
                content={comment.content}
                key={comment.comment_id}
              ></CommentBar>
            );
          })}
      </section>
    </>
  );
}