"use client";

import { useState } from "react";
import NavBar from "@/components/NavBar";
import GameClient from "@/components/GameClient";
import type { GameProfile } from "@/lib/types";

interface GameShellProps {
  initialProfile: GameProfile;
  userId: string;
  isAdmin: boolean;
}

export default function GameShell({
  initialProfile,
  userId,
  isAdmin,
}: GameShellProps) {
  const [profile, setProfile] = useState<GameProfile>(initialProfile);

  return (
    <div className="page-shell">
      <NavBar profile={profile} isAdmin={isAdmin} />
      <main className="flex-1 max-w-5xl mx-auto w-full safe-area-x px-3 sm:px-4 py-4 sm:py-8">
        <GameClient
          profile={profile}
          setProfile={setProfile}
          userId={userId}
          isAdmin={isAdmin}
        />
      </main>
    </div>
  );
}
