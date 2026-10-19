"use client";
import Image from "next/image";
import { usePassportsStamps } from "~/context/passports-stamps-context";
import { useCallback, useEffect, useState } from "react";
import { useNetworkVariables } from "~/lib/contracts";
import { stampsToDisplayStampsWithOutPassport } from "~/lib/utils";
import type { DisplayStamp } from "~/types/stamp";
import { StampGroup } from "~/components/StampGroup/StampGroup";
import { RainbowButton } from "~/components/magicui/rainbow-button";

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
  const [displayStamps, setDisplayStamps] = useState<DisplayStamp[]>([]);
  const networkVariables = useNetworkVariables();
  const [openStickers, setOpenStickers] = useState<Record<string, boolean>>({});

  const initializeData = useCallback(async () => {
    void refreshPassportStamps(networkVariables);
  }, [networkVariables, refreshPassportStamps]);

  useEffect(() => {
    void initializeData();
  }, [initializeData]);

  useEffect(() => {
    setDisplayStamps(stamps ? stampsToDisplayStampsWithOutPassport(stamps) : []);
  }, [stamps]);

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
                The events, the stamps, and the people who showed up are what this passport was for. Creating a passport and claiming stamps are now closed.
              </p>
              <p>
                Passports and stamps already in your wallet stay yours.
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
        <div className="relative mt-16 flex w-full flex-col items-center bg-gradient-to-t from-[#02101C] from-95% overflow-hidden sm:mt-20">
          <StampGroup
            stamps={displayStamps}
            claimsClosed
            isLoading={false}
            openStickers={openStickers}
            onOpenChange={handleOpenChange}
          />
          <div className="mb-[48px] sm:mb-[80px]" />
        </div>
      </div>
    </main>
  );
}
