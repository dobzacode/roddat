"use client";

import Avatar from "@/components/ui/Avatar";
import P from "@/components/ui/text/P";
import { CommentDetail } from "@/interface/interface";
import {
  cn,
  countSections,
  getDateDifference,
  handleVote,
} from "@/utils/utils";
import { mdiArrowDown, mdiArrowUp, mdiCommentOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { Comment, Post, User, Vote } from "@prisma/client";
import { ReactNode, Suspense, useEffect, useState } from "react";
import PostSkeleton from "../PostSkeleton";
import Button from "@/components/ui/button/Button";
import { CommentForm } from "./CommentForm";
import { getSession } from "next-auth/react";
import { Session } from "next-auth";

export default function CommentBar({
  comment_id,
  content,
  className,
  setIsLoading,
  userId,
}: {
  comment_id: string;
  content: string;
  className?: string;
  children?: ReactNode;
  setIsLoading: Function;
  userId: string;
}) {
  const [comment, setComment] = useState<CommentDetail | null>(null);
  const [isReplying, setIsReplying] = useState(false);
  const [isSibling, setIsSibling] = useState<boolean>(false);

  useEffect(() => {
    const fetchComment = async () => {
      const res = await fetch(`/api/comments?comment_id=${comment_id}`);

      const { comment: data }: { comment: CommentDetail } = await res.json();

      setComment(data);

      if (data.child_comments.length === 0) {
        setIsLoading();
      }
    };

    const divElement = document.getElementById(comment_id);

    const parentElement = divElement?.parentElement;

    if (!parentElement) return;
    const descendants = Array.from(parentElement.children);

    const index = descendants.indexOf(divElement);

    if (index !== -1 && index < descendants.length - 1) {
      setIsSibling(true);
    } else {
      setIsSibling(false);
    }

    fetchComment();
  }, [content]);

  useEffect(() => {}, [comment?.votes]);

  const addNewComment = (newComment: Comment) => {
    if (!comment) return;
    const updatedComment = { ...comment };

    if (updatedComment.child_comments) {
      updatedComment.child_comments.unshift(newComment);
      setComment(updatedComment);
    }
  };

  const addVote = (newVote: Vote) => {
    if (!newVote || !comment) return;

    // Créez une copie de l'objet comment
    const updatedComment = { ...comment };

    // Recherchez si un vote pour le même commentaire existe déjà avec le même user_id
    const existingVoteIndex = updatedComment.votes.findIndex((vote) => {
      return (
        vote.comment_id === newVote.comment_id &&
        vote.user_id === newVote.user_id
      );
    });

    setComment(updatedComment);

    // Mettez à jour l'objet comment avec le nouvel array de votes
  };

  const deleteVote = async (type: "UPVOTE" | "DOWNVOTE") => {
    if (!comment) return;

    const { comment_id, votes } = comment;
    const voteIndex = votes.findIndex(
      (vote) => vote.comment_id === comment_id && vote.user_id === userId,
    );

    if (voteIndex !== -1) {
      const updatedVotes = [...votes];
      updatedVotes.splice(voteIndex, 1);
      setComment({ ...comment, votes: updatedVotes });
      const session: Session | null = await getSession();
      if (!session) return;
      const res = await fetch(
        `/api/votes?comment_id=${comment_id}&email=${session?.user?.email}&type=${type}`,
        { method: "DELETE" },
      );
      const { data } = await res.json();
      console.log(data);
    }
  };

  return (
    <section
      className={cn(
        `relative z-50 flex h-full w-full flex-col gap-sub-large `,
        className,
      )}
      id={comment_id}
    >
      {comment ? (
        <>
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
            {isSibling ? (
              <div
                className={`pointer-events-none relative z-0 -mb-12 block h-full w-[1px] border-x border-t border-primary20`}
              ></div>
            ) : null}
          </div>
          <div
            className={cn(
              "brutalism-border primary-hover relative flex  h-full w-full rounded-small border-primary80",
            )}
          >
            <div className="flex flex-col items-center gap-extra-small  rounded-l-small bg-primary10 p-small">
              <Button
                onClick={() => {
                  if (
                    !comment.votes
                      ?.filter((vote: Vote) => vote.type === "UPVOTE")
                      .some((vote) => vote.user_id === userId)
                  ) {
                    handleVote(
                      "UPVOTE",
                      "comment",
                      comment_id,
                      addVote,
                      userId,
                    );
                  } else {
                    deleteVote("UPVOTE");
                  }
                }}
              >
                <Icon
                  path={mdiArrowUp}
                  size={1}
                  className={
                    comment.votes
                      ?.filter((vote: Vote) => vote.type === "UPVOTE")
                      .some((vote) => vote.user_id === userId)
                      ? "text-secondary40"
                      : ""
                  }
                ></Icon>
              </Button>

              <P>
                {comment?.votes
                  ? comment.votes?.filter(
                      (vote: Vote) => vote.type === "UPVOTE",
                    ).length -
                    comment.votes?.filter(
                      (vote: Vote) => vote.type === "DOWNVOTE",
                    ).length
                  : 0}
              </P>
              <Button
                onClick={() => {
                  if (
                    !comment.votes
                      ?.filter((vote: Vote) => vote.type === "DOWNVOTE")
                      .some((vote) => vote.user_id === userId)
                  ) {
                    handleVote(
                      "DOWNVOTE",
                      "comment",
                      comment_id,
                      addVote,
                      userId,
                    );
                  } else {
                    deleteVote("DOWNVOTE");
                  }
                }}
              >
                <Icon
                  className={
                    comment.votes
                      ?.filter((vote: Vote) => vote.type === "DOWNVOTE")
                      .some((vote) => vote.user_id === userId)
                      ? "text-error40"
                      : ""
                  }
                  path={mdiArrowDown}
                  size={1}
                ></Icon>
              </Button>
            </div>
            <div className="flex h-full flex-col justify-between gap-small p-small">
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

          {isReplying && (
            <CommentForm
              className="ml-large"
              parent_comment_id={comment.comment_id}
              post_id={comment.post_id}
              isReplying={isReplying}
              setIsReplying={setIsReplying}
              addNewComment={addNewComment}
            />
          )}
          {comment.child_comments &&
            comment.child_comments.map((comment) => {
              return (
                <CommentBar
                  userId={userId}
                  setIsLoading={setIsLoading}
                  className="z-0 pl-large"
                  comment_id={comment.comment_id}
                  content={comment.content}
                  key={comment.comment_id}
                ></CommentBar>
              );
            })}
        </>
      ) : (
        <PostSkeleton></PostSkeleton>
      )}
    </section>
  );
}
