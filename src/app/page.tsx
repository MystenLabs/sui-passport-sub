"use client";
import Image from "next/image";
import { ContributorsTable } from "~/components/ContributorsTable/ContributorsTable";
import { ProfileModal } from "~/components/ProfileModal/ProfileModal";
import { usePassportsStamps } from "~/context/passports-stamps-context";
import { useCallback, useEffect, useState } from "react";
import { useNetworkVariables } from "~/lib/contracts";
import { type Contributor } from "~/components/ContributorsTable/columns";
import { useUserCrud } from "~/hooks/use-user-crud";
import {
  usersToContributor,
  stampsToDisplayStamps,
  stampsToDisplayStampsWithOutPassport,
} from "~/lib/utils";
import type { DisplayStamp } from "~/types/stamp";
import { useUserProfile } from "~/context/user-profile-context";
import { useCurrentAccount, useCurrentWallet } from "@mysten/dapp-kit";
import { Turnstile } from "@marsidev/react-turnstile";
import { StampGroup } from "~/components/StampGroup/StampGroup";
import { RainbowButton } from "~/components/magicui/rainbow-button";
import { useDetectSuiWallet } from "~/hooks/use-detect-suiWallet";

const pulseKeyframes = `
@keyframes pulse-slow {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(1.1);
  }
}

@keyframes pulse-slow-delayed {
  0%, 100% {
    opacity: 0.2;
    transform: scale(0.9);
  }
  50% {
    opacity: 0.3;
    transform: scale(1);
  }
}
`;

export default function HomePage() {
  const { stamps, refreshPassportStamps } = usePassportsStamps();
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [displayStamps, setDisplayStamps] = useState<DisplayStamp[]>([]);
  const networkVariables = useNetworkVariables();
  const { fetchUsers, isLoading: isLoadingUsers, verifyCaptcha } = useUserCrud();
  const { userProfile } = useUserProfile();
  const currentAccount = useCurrentAccount();
  const { connectionStatus } = useCurrentWallet();
  const [openStickers, setOpenStickers] = useState<Record<string, boolean>>({});
  const { createOrUpdateUser } = useUserCrud();
  const [token, setToken] = useState<string | null>(null);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [showMobilePopover, setShowMobilePopover] = useState(false);
  const [, setIsSuiWallet] = useState(false);
  const { isSlushLikely } = useDetectSuiWallet();

  const initializeData = useCallback(async () => {
    const users = await fetchUsers();
    void refreshPassportStamps(networkVariables);
    if (users) {
      setContributors(usersToContributor(users));
    }
  }, [fetchUsers, networkVariables, refreshPassportStamps]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 更稳的移动端能力识别（优先 UA-CH，再退化到 pointer:coarse）
    const mobileByUaCh =
      (navigator as any).userAgentData?.mobile ??
      (typeof matchMedia === "function" && matchMedia("(pointer:coarse)").matches);
    const isMobile = Boolean(mobileByUaCh);

    // 三段分流（优先级：Slush > 手机浏览器 > 普通网页）
    const inSlush = isSlushLikely;                       // 1) Slush 容器
    const inMobileBrowser = !inSlush && isMobile;        // 2) 系统手机浏览器
    const needCaptcha = !inSlush && !inMobileBrowser;    // 3) 普通网页（桌面等）

    // 1) 控制 Popover
    setShowMobilePopover(inMobileBrowser);
    // 2) Slush 视为“Sui 钱包容器”
    setIsSuiWallet(inSlush);

    // 3) 验证码（仅普通网页需要）
    if (process.env.NODE_ENV === "production") {
      if (needCaptcha && token) {
        void verifyCaptcha(token).then((ok) => setIsCaptchaVerified(ok));
      } else if (!needCaptcha) {
        setIsCaptchaVerified(true);
      }
    } else {
      setIsCaptchaVerified(true);
    }

    console.log("[env] slush:", inSlush, "mobile-browser:", inMobileBrowser, "needCaptcha:", needCaptcha);
  }, [token, verifyCaptcha, isSlushLikely]);

  useEffect(() => {
    void initializeData();
  }, [initializeData]);

  useEffect(() => {
    setDisplayStamps([]);
    if (stamps && userProfile) {
      setDisplayStamps(stampsToDisplayStamps(stamps, userProfile));
    } else if (stamps) {
      setDisplayStamps(stampsToDisplayStampsWithOutPassport(stamps));
    }
  }, [stamps, userProfile]);

  useEffect(() => {
    if (connectionStatus === "connected" && networkVariables) {
      void refreshPassportStamps(networkVariables);
    }
  }, [networkVariables, refreshPassportStamps, connectionStatus]);

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = pulseKeyframes;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const handleOpenChange = (stampId: string, isOpen: boolean) => {
    setOpenStickers((prev) => ({
      ...prev,
      [stampId]: isOpen,
    }));
  };

  const handleTableRefresh = useCallback(
    async () => {
      if (currentAccount?.address && userProfile?.passport_id) {
        void createOrUpdateUser({
          address: currentAccount.address,
          stamp_count: userProfile.stamps?.length ?? 0,
          name: userProfile.name,
          points: Number(userProfile.points),
          packageId: networkVariables.originPackage,
        })
      }

      void initializeData();
    },
    [initializeData, userProfile, currentAccount, createOrUpdateUser, networkVariables],
  );

  return (
    <main className="flex min-h-screen flex-col items-center bg-[#02101C] text-white">
      <div className="flex w-full flex-col items-center sm:max-w-[1424px]">
        <div className="bg-[#02101C] py-4 sm:py-6 flex w-full flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 z-20 gap-4 sm:gap-0">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
              <Image
                src={"/images/sui-logo.png"}
                alt="drop"
                width={24}
                height={24}
                className="h-[24px] w-[24px] sm:h-[32px] sm:w-[32px]"
              />
              <p className="font-inter text-[14px] sm:text-[24px] text-white">
                Sui Community Passport
              </p>
            </div>
            <div className="block sm:hidden">
              <ProfileModal showMobilePopover={showMobilePopover} />
            </div>
          </div>

          <div className="flex items-center justify-between w-full sm:w-auto gap-4">
            <RainbowButton
              onClick={() => window.open("https://x.com/suicommunity", "_blank")}
              className="hidden sm:block w-full sm:w-auto"
            >
              <div className="flex items-center justify-center gap-2">
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  className="fill-current sm:w-6 sm:h-6"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span className="font-inter text-base sm:text-lg font-medium">Follow @SuiCommunity</span>
              </div>
            </RainbowButton>
            <div className="hidden sm:block">
              {isCaptchaVerified && <ProfileModal showMobilePopover={false} />}
            </div>
          </div>
        </div>
        <div className="relative flex w-full flex-col items-center rounded-t-xl bg-[#02101C] overflow-hidden">
          <Image
            className="absolute top-0 hidden rounded-xl sm:block brightness-[60%]"
            src={"/images/card-background.png"}
            alt="background"
            width={1424}
            height={893}
            unoptimized
          />
          <Image
            className="absolute top-0 block rounded-xl sm:top-[-234px] sm:hidden"
            src={"/images/mobile-card-background.png"}
            alt="background"
            width={374}
            height={491}
            unoptimized
          />
          <div className="z-10 flex w-full flex-col items-center justify-center">
            <h1 className="mt-8 max-w-[304px] text-center font-everett text-[40px] leading-[48px] sm:mt-16 sm:max-w-[760px] sm:text-[68px] sm:leading-[80px]">
              Thank you
            </h1>
            <div className="mt-6 flex max-w-[342px] flex-col gap-4 text-center font-everett_light text-[14px] text-[#ABBDCC] sm:max-w-[640px] sm:text-[18px] sm:leading-7 p-2">
              <p className="text-white">
                Thank you for participating in everything thus far.
              </p>
              <p>
                The events, the stamps, and the people who showed up are what this passport was for. Creating a passport and claiming stamps are now closed. You can still look through the stamps and the contributor list.
              </p>
              <p>
                On Tuesday, October 13, 2026, at 12:00am PDT, the remaining functions on this site turn off. On Friday, October 16, 2026, the contract upgrade goes out. Passports and stamps already in your wallet stay yours.
              </p>
              <RainbowButton
                onClick={() => window.open("https://x.com/suicommunity", "_blank")}
                className="block sm:hidden w-full sm:w-auto"
              >
                <div className="flex items-center justify-center gap-2">
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    className="fill-current sm:w-6 sm:h-6"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span className="font-inter text-base sm:text-lg font-medium">Follow @SuiCommunity</span>
                </div>
              </RainbowButton>
            </div>
          </div>
        </div>
        <div className="relative flex w-full flex-col items-center bg-gradient-to-t from-[#02101C] from-95% overflow-hidden">
          <h1 className="my-10 max-w-[358px] text-center font-everett text-[40px] leading-[48px] sm:my-10 
          sm:max-w-[696px] sm:text-[68px] sm:leading-[80px]">
            Stamps
          </h1>
          <StampGroup
            stamps={displayStamps}
            claimsClosed
            isLoading={false}
            openStickers={openStickers}
            onOpenChange={handleOpenChange}
          />
          <h2 className="mt-20 pt-10 max-w-[263px] text-center font-everett text-[24px] leading-[28px] sm:text-[32px] sm:leading-[38px]">
            Top Contributors
          </h2>
          <div className="mb-[48px] mt-6 w-full sm:mb-[80px]">
            <ContributorsTable
              data={contributors}
              onRefresh={handleTableRefresh}
              isLoading={isLoadingUsers}
            />
          </div>
        </div>
        {/* Only show Turnstile captcha if:
          * 1. Not using Sui Wallet (!isSuiWallet) - Sui Wallet users don't need captcha verification
          * 2. No captcha token exists (!token) - Don't show if already verified
        */}
        {process.env.NODE_ENV === 'production' && !isSlushLikely && typeof window !== "undefined" &&
          !((navigator as any).userAgentData?.mobile ?? (typeof matchMedia === "function" && matchMedia("(pointer:coarse)").matches)) &&
          !token && (
            <div className="fixed bottom-4 right-4">
              <Turnstile
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""}
                options={{
                  theme: "dark",
                  language: "en",
                }}
                onSuccess={(token) => {
                  setToken(token);
                }}
              />
            </div>
          )}
      </div>
    </main>
  );
}
