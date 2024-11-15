import { PostDetailProps } from "@/interface/interface";
import { cn, getDateDifference } from "@/utils/utils";
import { mdiCommentOutline } from "@mdi/js";
import Icon from "@mdi/react";
import Link from "next/link";
import { ReactNode } from "react";
import Avatar from "../ui/Avatar";
import H2 from "../ui/text/H2";
import P from "../ui/text/P";
import DeleteButton from "./DeleteButton";
import DynamicPostPart from "./DynamicPostPart";
import ThreadLine from "./ThreadLine";
import VoteButton from "./VoteButton";

interface PostBarProps extends Omit<PostDetailProps, "community_id"> {
  isPagePost?: boolean;
  children?: ReactNode;
  isLoading?: boolean;
  userId: string | null;
  author_id: string;
}

export default function PostBar({
  createdAt,
  author,
  post_id,
  community,
  title,
  content,
  votes,
  comments,
  isPagePost = false,
  children,
  isLoading,
  userId,
  author_id,
}: PostBarProps & {}) {
  const upvotes = votes?.filter((vote) => vote.type === "UPVOTE");
  const downvotes = votes?.filter((vote) => vote.type === "DOWNVOTE");

  const postContent = () => {
    return (
      <>
        <div className="caption flex flex-wrap items-center gap-extra-small dark:text-primary1">
          {!isPagePost && (
            <Avatar
              src={author.image}
              alt={`${author.name} profil picture`}
              size={2}
              className="h-[20px] rounded-full"
            ></Avatar>
          )}
          <Link href={`/community/${community?.name}`}>
            <P type="caption">r/{community?.name}</P>
          </Link>
          <Link
            href={`/user/${author?.name
              ?.replace(/\s/g, "")
              .toLowerCase()}/${author_id}`}
          >
            <P type="caption">{`Posted by u/${
              author.name ? author.name : "deleted"
            }`}</P>
          </Link>
          <P type="caption">{getDateDifference(createdAt)}</P>
        </div>
        {!isPagePost ? (
          <>
            <Link
              className="flex flex-col gap-small"
              href={{
                pathname: `/community/${community.name}/${title.replace(
                  /\s/g,
                  "_",
                )}`,
              }}
            >
              <div className=" flex h-fit flex-col gap-extra-small">
                <H2 type="sub-heading break-words ">
                  {title.charAt(0).toUpperCase() + title.slice(1).toLowerCase()}
                </H2>
                <P className="max-h-[196px] overflow-clip break-words">
                  {content}
                </P>
              </div>

              <div className="flex gap-small dark:text-primary1">
                <div className="flex gap-extra-small">
                  <Icon path={mdiCommentOutline} size={1.4}></Icon>
                  <P>
                    {comments?.length > 1
                      ? `${comments?.length} comments`
                      : `${comments?.length} comment`}
                  </P>
                </div>
              </div>
            </Link>
          </>
        ) : (
          <DynamicPostPart
            author_id={author_id}
            userId={userId}
            post_id={post_id}
            commentAmount={comments.length}
            title={title}
            content={content}
          ></DynamicPostPart>
        )}
      </>
    );
  };

  return (
    <div
      id={post_id}
      className={cn(
        "relative flex h-full w-full flex-col  gap-small tablet:gap-sub-large",
        isPagePost
          ? "ml-small mt-medium pr-small tablet:ml-large tablet:mr-0 tablet:pr-large"
          : "",
      )}
    >
      {isPagePost && (
        <div className="absolute -left-[4rem] -top-sub-medium flex h-full flex-col items-center tablet:-left-large tablet:top-auto">
          <Avatar
            src={author.image}
            size={5}
            className="z-[40] h-[50px] rounded-small"
          ></Avatar>
          <ThreadLine
            id={post_id}
            comments_length={comments.length}
            isLoading={isLoading}
          ></ThreadLine>
        </div>
      )}
      <section className="relative flex h-fit w-full dark:text-primary1">
        <div className="brutalism-border primary-hover dark:primary-hover-dark peer flex h-fit w-full flex-col-reverse  rounded-small border-primary80 dark:border-primary1 tablet:flex-row">
          <div className="flex items-center justify-center gap-extra-small rounded-b-small bg-primary10 p-small dark:bg-primary90   tablet:flex-col tablet:justify-normal tablet:rounded-b-none tablet:rounded-l-small">
            <VoteButton
              userId={userId}
              id={post_id}
              to="post"
              votes={votes}
              upvotes={upvotes}
              downvotes={downvotes}
            ></VoteButton>
          </div>

          <div className="flex w-full flex-col gap-small rounded-r-small p-small  dark:bg-primary80">
            {postContent()}
          </div>
        </div>
        {author_id === userId && (
          <DeleteButton
            to="post"
            className="heading body absolute right-4 top-4 duration-fast peer-hover:translate-x-2  peer-hover:scale-[110%] "
            post_id={post_id}
          ></DeleteButton>
        )}
      </section>
      {children}
    </div>
  );
}
