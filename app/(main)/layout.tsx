import Header from "@/components/ui/header/Header";
import "@/app/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import SearchBar from "@/components/ui/header/SearchBar";
import Button from "@/components/ui/button/Button";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import UserSnippet from "@/components/user/UserSnippet";

import LoginModal from "@/components/user/LogInModal";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
  viewport: "width=device-width,initial-scale=1",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  return (
    <>
      <Header
        height="h-[100px]"
        //top-[100px]
        textColor="text-neutral80"
        textType="sub-heading"
        logoColor="text-neutral80"
        logoType="heading font-bold tracking-widest"
        mobileTextType="sub-heading"
        bgColor="bg-primary10 border-b-4 border-neutral80"
      >
        <SearchBar></SearchBar>
        {session ? (
          <UserSnippet session={session}></UserSnippet>
        ) : (
          <LoginModal></LoginModal>
        )}
      </Header>
      {children}
      {/* <Footer
        height="h-[100px]"
        bgColor="bg-black"
        flex="flex items-center justify-center"
      ></Footer> */}
    </>
  );
}
