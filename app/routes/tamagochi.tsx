import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "~/components/card";
import { Button } from "~/components/ui/button";
import { useWallet } from "~/hooks/use-wallet";
import * as Crowdfund from "../../packages/CAMOXPDNU7D6ZGI7HQXNBFL4RQ7H2NBXAB3UBWKX5VPTHEERGGDWJ3TO/src/index";
import { signTransaction } from "~/config/wallet.client";
import type { TopDonor, StreakInfo } from "../../packages/CAMOXPDNU7D6ZGI7HQXNBFL4RQ7H2NBXAB3UBWKX5VPTHEERGGDWJ3TO/src";

export default function TamagochiPage() {
  const RPC_URL = "https://soroban-testnet.stellar.org:443";
  const { address, isConnected } = useWallet();

  const [userDonation, setUserDonation] = useState(0);
  const [goal, setGoal] = useState(0);
  const [leaderboard, setLeaderboard] = useState<TopDonor[]>([]);
  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null);

  const contract = useMemo(() => {
    if (!isConnected || address === "-") return null;
    return new Crowdfund.Client({
      ...Crowdfund.networks.testnet,
      rpcUrl: RPC_URL,
      signTransaction,
      publicKey: address,
    });
  }, [isConnected, address]);

  useEffect(() => {
    if (!contract) return;

    (async () => {
      try {
        const [donationTx, goalTx, leaderboardTx, streakTx] = await Promise.all([
            contract.get_donation({ donor: address }),
            contract.get_goal(),
            contract.get_leaderboard(),
            contract.get_streak_info({ donor: address }),
        ]);
        setUserDonation(Number(BigInt(donationTx.result)));
        setGoal(Number(BigInt(goalTx.result)));
        setLeaderboard(leaderboardTx.result);
        setStreakInfo(streakTx.result);
      } catch (err) {
        console.error("Failed to fetch user and campaign data", err);
      }
    })();
  }, [contract, address]);

  const donationPercentage = goal > 0 ? (userDonation / goal) * 100 : 0;

  const getTamagochiState = (percentage: number) => {
      if (percentage >= 100) return { icon: "🔥", name: "Phoenix" };
      if (percentage >= 75) return { icon: "🦅", name: "Eagle" };
      if (percentage >= 50) return { icon: "🐔", name: "Adult Chicken" };
      if (percentage >= 25) return { icon: "🐤", name: "Chick" };
      if (percentage > 0) return { icon: "🐣", name: "Hatching Chick" };
      return { icon: "🥚", name: "Egg" };
  };

  const tamagochi = getTamagochiState(donationPercentage);

  // Check for special statuses
  const isTopDonor = leaderboard.length > 0 && leaderboard[0].donor === address;
  const hasStreak = streakInfo && streakInfo.streak_days > 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-y-8">
        <h1 className="text-4xl font-bold">My Tamagochi</h1>
        <Card className="flex flex-col items-center gap-y-4 p-8 w-1/3">
            <div 
                className="text-8xl mb-4 relative"
                style={{
                    filter: hasStreak ? `drop-shadow(0 0 15px #f97316) drop-shadow(0 0 5px #f97316)` : 'none',
                    transition: 'filter 0.5s ease-in-out'
                }}
            >
                {isTopDonor && <span className="absolute -top-8 -right-4 text-5xl">👑</span>}
                <p>{tamagochi.icon}</p>
            </div>
            <h2 className="text-2xl font-semibold">{tamagochi.name}</h2>
            {hasStreak && (
                <p className="font-semibold text-orange-500">{streakInfo?.streak_days} Day Streak! 🔥</p>
            )}
            <p className="text-gray-400">
                Your Contribution: {donationPercentage.toFixed(2)}% of Goal
            </p>
            <p className="text-gray-400">
                You've donated a total of {(userDonation / 10_000_000).toFixed(7)} XLM.
            </p>
        </Card>
        <Link to="/">
            <Button variant="outline">Back to Campaign</Button>
        </Link>
    </div>
  );
}
