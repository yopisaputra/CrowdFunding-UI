import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "~/components/card";
import { Button } from "~/components/ui/button";
import { useWallet } from "~/hooks/use-wallet";
import * as Crowdfund from "../../packages/CBR2AQMQMIJJTSTEPQF6QUSNAZRBR4ORYN4A4NHNP4767NJOVAVHV4LO/src/index";
import { signTransaction } from "~/config/wallet.client";

export default function TamagochiPage() {
  const RPC_URL = "https://soroban-testnet.stellar.org:443";
  const { address, isConnected } = useWallet();

  const [userDonation, setUserDonation] = useState(0);
  const [goal, setGoal] = useState(0);

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
        // Ambil data donasi pengguna dan goal kampanye secara paralel
        const [donationTx, goalTx] = await Promise.all([
            contract.get_donation({ donor: address }),
            contract.get_goal(),
        ]);
        setUserDonation(Number(BigInt(donationTx.result)));
        setGoal(Number(BigInt(goalTx.result)));
      } catch (err) {
        console.error("Failed to fetch user and campaign data", err);
        setUserDonation(0);
        setGoal(0);
      }
    })();
  }, [contract, address]);

  // Hitung persentase donasi pengguna terhadap goal
  const donationPercentage = goal > 0 ? (userDonation / goal) * 100 : 0;

  // Tentukan emoji dan nama level berdasarkan persentase
  const getTamagochiState = (percentage: number) => {
      if (percentage >= 100) {
          return { icon: "🔥", name: "Phoenix" }; // Phoenix
      }
      if (percentage >= 75) {
          return { icon: "🦅", name: "Eagle" }; // Elang
      }
      if (percentage >= 50) {
          return { icon: "🐔", name: "Adult Chicken" }; // Ayam Dewasa
      }
      if (percentage >= 25) {
          return { icon: "🐤", name: "Chick" }; // Anak Ayam
      }
      if (percentage > 0) {
          return { icon: "🐣", name: "Hatching Chick" }; // Ayam Piyik
      }
      return { icon: "🥚", name: "Egg" }; // Telur
  };

  const tamagochi = getTamagochiState(donationPercentage);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-y-8">
        <h1 className="text-4xl font-bold">My Tamagochi</h1>
        <Card className="flex flex-col items-center gap-y-4 p-8 w-1/3">
            <div className="text-8xl mb-4">
                <p>{tamagochi.icon}</p>
            </div>
            <h2 className="text-2xl font-semibold">{tamagochi.name}</h2>
            <p className="text-gray-400">
                Your Donation Progress: {donationPercentage.toFixed(2)}%
            </p>
            <p className="text-gray-400">
                You've donated a total of {(userDonation / 10_000_000).toFixed(7)} XLM.
            </p>
            <p className="text-center mt-2">
                Donate to the campaign to evolve your Tamagochi!
            </p>
        </Card>
        <Link to="/">
            <Button variant="outline">Back to Campaign</Button>
        </Link>
    </div>
  );
}
