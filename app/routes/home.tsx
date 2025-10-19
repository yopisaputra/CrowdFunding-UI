import { Card } from "~/components/card";
import type { Route } from "./+types/home";
import { Link } from "react-router-dom";
import { TextRotate } from "~/components/text-rotate";
import { Crown, Donut, Flame } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { useWallet } from "~/hooks/use-wallet";
import { useNativeBalance } from "~/hooks/use-native-balance";
import { useSubmitTransaction } from "~/hooks/use-submit-transaction";
import * as Crowdfund from "../../packages/CAMOXPDNU7D6ZGI7HQXNBFL4RQ7H2NBXAB3UBWKX5VPTHEERGGDWJ3TO/src/index";
import { signTransaction } from "~/config/wallet.client";
import { useState, useMemo, useEffect } from "react";
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import type { TopDonor, DonationRecord } from "../../packages/CAMOXPDNU7D6ZGI7HQXNBFL4RQ7H2NBXAB3UBWKX5VPTHEERGGDWJ3TO/src/index";

// Helper function to format address
const formatAddress = (addr: string) => `${addr.slice(0, 4)}...${addr.slice(-4)}`;

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Crowdfund App" },
    { name: "description", content: "A crowdfunding dApp on Stellar." },
  ];
}

export default function Home() {
  const RPC_URL = "https://soroban-testnet.stellar.org:443";
  const { address, isConnected } = useWallet();
  const { balance, refetch: refetchBalance } = useNativeBalance(address);

  const [amount, setAmount] = useState<string>("");
  const [total, setTotal] = useState(0);
  const [isAllIn, setIsAllIn] = useState(false);

  // --- New State for Advanced Features ---
  const [goal, setGoal] = useState(0);
  const [deadline, setDeadline] = useState(0);
  const [isGoalReached, setIsGoalReached] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [leaderboard, setLeaderboard] = useState<TopDonor[]>([]);
  const [donationHistory, setDonationHistory] = useState<DonationRecord[]>([]);
  // NEW: State for the countdown timer
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const contract = useMemo(() => {
    if (!isConnected || address === "-") return null;
    return new Crowdfund.Client({
      ...Crowdfund.networks.testnet,
      rpcUrl: RPC_URL,
      signTransaction,
      publicKey: address,
    });
  }, [isConnected, address]);

  async function fetchData() {
    if (!contract) return;
    try {
      const [totalTx, goalTx, deadlineTx, isGoalReachedTx, isEndedTx, progressTx, leaderboardTx, historyTx] = await Promise.all([
        contract.get_total_raised(),
        contract.get_goal(),
        contract.get_deadline(),
        contract.is_goal_reached(),
        contract.is_ended(),
        contract.get_progress_percentage(),
        contract.get_leaderboard(),
        contract.get_donation_history(),
      ]);
      setTotal(Number(BigInt(totalTx.result)));
      setGoal(Number(BigInt(goalTx.result)));
      setDeadline(Number(BigInt(deadlineTx.result)));
      setIsGoalReached(isGoalReachedTx.result);
      setIsEnded(isEndedTx.result);
      setProgressPercentage(Number(BigInt(progressTx.result)));
      setLeaderboard(leaderboardTx.result);
      setDonationHistory(historyTx.result.reverse()); // Show latest first
    } catch (err) {
      console.error("Failed to fetch campaign data", err);
    }
  }

  async function handleOnSuccess() {
    await fetchData(); // Refetch all data
    await refetchBalance();
    setAmount("");
    setIsAllIn(false);
    await Swal.fire({
        title: 'Thank you!',
        text: 'Your donation has been received.',
        icon: 'success',
        confirmButtonText: 'Awesome!'
    });
  }

  const { submit: submitDonation, isSubmitting: isDonating } = useSubmitTransaction({
    rpcUrl: RPC_URL,
    networkPassphrase: Crowdfund.networks.testnet.networkPassphrase,
    onSuccess: handleOnSuccess,
    onError: (error) => {
      console.error("Donation failed", error);
      Swal.fire({ title: 'Error!', text: 'Your donation failed. Please try again.', icon: 'error', confirmButtonText: 'OK' });
    },
  });

  const { submit: submitRefund, isSubmitting: isRefunding } = useSubmitTransaction({
      rpcUrl: RPC_URL,
      networkPassphrase: Crowdfund.networks.testnet.networkPassphrase,
      onSuccess: async () => {
          await fetchData(); // Refetch all data
          await refetchBalance();
          await Swal.fire('Refunded!', 'Your donation has been refunded.', 'success');
      },
      onError: (error) => {
          console.error("Refund failed", error);
          Swal.fire('Failed!', 'Your refund could not be processed.', 'error');
      },
  });

  async function handleSubmit() {
    if (!isConnected || !contract || !amount.trim()) return;
    try {
      const stroopsAmount = Math.floor(parseFloat(amount.trim()) * 10_000_000);
      const tx = await contract.donate({ donor: address, amount: BigInt(stroopsAmount) }) as any;
      await submitDonation(tx);
    } catch (e) {
      console.error("Failed to create donation transaction", e);
    }
  }

  async function handleRefund() {
    if (!isConnected || !contract) return;
    try {
      const tx = await contract.refund({ donor: address }) as any;
      await submitRefund(tx);
    } catch (e) {
      console.error("Failed to create refund transaction", e);
    }
  }

  const handleAllInChange = (checked: boolean) => {
    setIsAllIn(checked);
    if (checked) {
        const remainingStroops = goal - total;
        const walletBalance = parseFloat(balance);
        const availableBalance = walletBalance > 1 ? walletBalance - 1 : 0;
        const walletStroops = Math.floor(availableBalance * 10_000_000);
        const amountToDonateStroops = Math.min(remainingStroops, walletStroops);
        const amountToDonateXLM = (amountToDonateStroops / 10_000_000).toFixed(7);
        setAmount(amountToDonateXLM);
    } else {
        setAmount("");
    }
  };

  useEffect(() => {
    fetchData();
  }, [contract]);

  // NEW: useEffect for the countdown timer
  useEffect(() => {
    if (!deadline || isEnded) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
    }

    const timer = setInterval(() => {
        const now = new Date().getTime();
        const deadlineTime = deadline * 1000;
        const difference = deadlineTime - now;

        if (difference <= 0) {
            clearInterval(timer);
            setIsEnded(true); // Manually trigger ended state
            setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        } else {
            setTimeLeft({
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((difference % (1000 * 60)) / 1000),
            });
        }
    }, 1000);

    return () => clearInterval(timer); // Cleanup on component unmount
  }, [deadline, isEnded]);

  const formattedPercentage = progressPercentage.toFixed(2);

  return (
      <div className="flex flex-col items-center gap-y-10 py-10">
        <div className="flex flex-row items-center gap-x-6">
            <p className="text-4xl">Learning</p>
            <TextRotate
                texts={["Stellar", "Rust", "Soroban"]}
                mainClassName="bg-white text-black rounded-lg text-4xl px-6 py-3"
                rotationInterval={2000}
            />
        </div>

        {isConnected && <Link to="/tamagochi"><Button variant="link">View My Tamagochi</Button></Link>}

        <Card className="flex flex-col gap-y-4 p-6 w-1/2">
            <h3 className="text-xl font-bold text-center mb-2">Campaign Status</h3>
            <div className="w-full">
                <div className="flex justify-between items-baseline">
                    <span className="text-gray-400">Progress</span>
                    <span className="font-bold text-lg">{(total / 10_000_000).toFixed(4)} / {(goal / 10_000_000).toFixed(2)} XLM</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5 mt-1">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${parseFloat(formattedPercentage) > 100 ? 100 : formattedPercentage}%` }}></div>
                </div>
                <div className="flex justify-between items-baseline text-sm text-gray-400 mt-1">
                    <span>{formattedPercentage}%</span>
                    <span>Goal</span>
                </div>
            </div>
            <div className="text-center text-gray-400 text-sm">
                {deadline > 0 ? `Ending on ${new Date(deadline * 1000).toLocaleString()}` : "Not initialized"}
            </div>
            {/* NEW: Countdown Timer Display */}
            {!isEnded && deadline > 0 && (
                <div className="flex justify-center gap-x-4 sm:gap-x-6 mt-2 tabular-nums">
                    <div className="text-center">
                        <span className="text-2xl font-bold">{String(timeLeft.days).padStart(2, '0')}</span>
                        <span className="block text-xs text-gray-400">DAYS</span>
                    </div>
                    <div className="text-center">
                        <span className="text-2xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
                        <span className="block text-xs text-gray-400">HOURS</span>
                    </div>
                    <div className="text-center">
                        <span className="text-2xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
                        <span className="block text-xs text-gray-400">MINUTES</span>
                    </div>
                    <div className="text-center">
                        <span className="text-2xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</span>
                        <span className="block text-xs text-gray-400">SECONDS</span>
                    </div>
                </div>
            )}
             <div className="flex flex-row gap-x-4 mt-2 justify-center">
                {isEnded && <p className="text-red-500 font-semibold">Campaign Ended</p>}
                {isGoalReached && <p className="text-green-500 font-semibold">Goal Reached!</p>}
            </div>
        </Card>

        <div className="w-1/2 grid grid-cols-2 gap-8">
            <Card className="flex flex-col gap-y-4 p-6">
                <h3 className="text-lg font-bold text-center mb-2 flex items-center justify-center gap-2"><Crown className="text-yellow-400"/> Leaderboard</h3>
                <ul className="space-y-3">
                    {leaderboard.map((donor, index) => (
                        <li key={index} className="flex justify-between items-center bg-gray-800 p-2 rounded-md">
                            <span className="font-mono text-sm">{index + 1}. {formatAddress(donor.donor)}</span>
                            <span className="font-semibold text-green-400">{(Number(BigInt(donor.total_donation)) / 10_000_000).toFixed(2)} XLM</span>
                        </li>
                    ))}
                </ul>
            </Card>
            <Card className="flex flex-col gap-y-4 p-6">
                <h3 className="text-lg font-bold text-center mb-2 flex items-center justify-center gap-2"><Flame className="text-orange-500"/> Donation Feed</h3>
                <ul className="space-y-3 h-40 overflow-y-auto pr-2">
                    {donationHistory.map((rec, index) => (
                        <li key={index} className="flex justify-between items-center text-sm">
                            <span>{formatAddress(rec.donor)} donated</span>
                            <span className="font-medium text-green-400">{(Number(BigInt(rec.amount)) / 10_000_000).toFixed(2)} XLM</span>
                        </li>
                    ))}
                </ul>
            </Card>
        </div>

        <Card className="flex flex-col gap-y-6 py-4 px-8 w-1/2">
          <p className="flex flex-row items-center gap-x-2 text-lg mb-2 font-medium"><Donut className="size-5" /> Donate</p>
          <div className="flex flex-row justify-between items-center">
            <div className="flex flex-row items-center gap-4">
              <img alt="XLM" src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Stellar_Symbol.png/1062px-Stellar_Symbol.png" className="size-10 rounded-full bg-white p-1" />
              <p>XLM</p>
            </div>
            <p className="tabular-nums flex gap-1">
              {!isConnected && <span>Connect wallet</span>}
              {isConnected && balance !== "-" && <span>{balance} XLM</span>}
            </p>
          </div>
          <Input type="text" inputMode="decimal" placeholder="0.001" onChange={(e) => setAmount(e.target.value)} value={amount} disabled={isDonating || isEnded || isAllIn}/>
          <div className="flex items-center space-x-2">
              <Checkbox id="all-in" onCheckedChange={handleAllInChange} checked={isAllIn} disabled={!isConnected || isGoalReached || isEnded} />
              <label htmlFor="all-in" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">All In (Donate remaining amount or your balance)</label>
          </div>
          <div className="flex justify-between items-center mt-4">
            <Button className="w-max" onClick={handleSubmit} disabled={!isConnected || isDonating || !amount.trim() || isEnded || isGoalReached}>{isDonating ? "Donating..." : "Submit Donation"}</Button>
            {isEnded && !isGoalReached && <Button variant="destructive" className="w-max" onClick={handleRefund} disabled={!isConnected || isRefunding}>{isRefunding ? "Refunding..." : "Refund"}</Button>}
          </div>
        </Card>
      </div>
  );
}
