import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import CommunityForm from "@/components/community/CommunityForm";
import prisma from "@/prisma/client";
import { BASE_URL } from "@/utils/utils";
import { Community, CommunityUser, User } from "@prisma/client";
import { Session, getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

interface ModifyCommunityRes extends Community {
  communityUsers: CommunityUser[];
}

export async function generateStaticParams() {
  const communities: Community[] = await prisma.community.findMany();
  return communities.map((community) => ({
    name: community.name,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { communityname: string };
}) {
  return {
    title: `Modify ${params.communityname}`,
  };
}

export const revalidate = 0;

export const dynamic = "force-dynamic";

export default async function ModifyCommunity({
  params,
}: {
  params: { communityname: string };
}) {
  const communityRes = await fetch(
    `${BASE_URL}/api/communities?community=${params.communityname}`,
    {
      next: {
        revalidate: 0,
      },
    },
  );

  const { community }: { community: ModifyCommunityRes } =
    await communityRes.json();

  if (!community) {
    return redirect("/");
  }

  revalidatePath(`/community/${community.name}`);
  revalidatePath(`/modify/${community.name}`);

  const session: Session | null = await getServerSession(authOptions);

  const userRes = await fetch(
    `${BASE_URL}/api/user/getuserinformation?email=${session?.user?.email}`,
    {
      next: {
        revalidate: 0,
      },
    },
  );

  const { user }: { user: User } = await userRes.json();

  if (
    !community.communityUsers.some((communityUser) => {
      return (
        communityUser.user_id === user.id && communityUser.role === "ADMIN"
      );
    })
  ) {
    return redirect("/");
  }

  return (
    <>
      <main className="mx-extra-small flex justify-center gap-medium mobile-large:mx-small laptop-large:mx-extra-large ">
        <CommunityForm
          community={community}
          theme="primary"
          title={
            <p className="flex gap-2">
              Modify
              <span className="hidden mobile-large:block">community</span>
            </p>
          }
        ></CommunityForm>
      </main>
    </>
  );
}
