import prisma from "@/prisma/client";
import { User } from "@prisma/client";

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get("email");

    if (!email) {
      const message = "No user email was specified";
      return NextResponse.json(
        {
          message: message,
        },
        {
          status: 400,
        },
      );
    }

    const userInfo = await prisma.user.findUnique({
      where: {
        email: email as string,
      },
    });

    if (!userInfo) {
      const message = `No user was found with ${email}`;
      return NextResponse.json(
        {
          message: message,
        },
        {
          status: 404,
        },
      );
    }

    const posts = await prisma.post.count({
      where: {
        author_id: userInfo?.id,
      },
    });

    const communities = await prisma.communityUser.count({
      where: {
        user_id: userInfo?.id,
      },
    });

    const comments = await prisma.comment.count({
      where: {
        author_id: userInfo?.id,
      },
    });

    const votes = await prisma.vote.count({
      where: {
        user_id: userInfo?.id,
      },
    });

    const message = "All the user informations are returned";
    return NextResponse.json({
      message,
      userInfo,
      posts,
      communities,
      comments,
      votes,
    });
  } catch (e) {
    const message = "Can't return user informations";

    return NextResponse.json(
      {
        message: message,
        data: e,
      },
      {
        status: 500,
      },
    );
  }
}
