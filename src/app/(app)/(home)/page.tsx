"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  const trpc = useTRPC();

  const { data: user } = useQuery(trpc.auth.session.queryOptions());
  return (
    <div className="">
      <p>{JSON.stringify(user?.user, null, 2)}</p>
    </div>
  );
}
