import { Card } from "~/components/card";
import type { Route } from "./+types/home";
import { Link } from "react-router-dom";
import { TextRotate } from "~/components/text-rotate";
import { Donut } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { useWallet } from "~/hooks/use-wallet";
import { useNativeBalance } from "~/hooks/use-native-balance";
import { useSubmitTransaction } from "~/hooks/use-submit-transaction";
import * as Crowdfund from "../../packages/CBR2AQMQMIJJTSTEPQF6QUSNAZRBR4ORYN4A4NHNP4767NJOVAVHV4LO/src/index";
import { signTransaction } from "~/config/wallet.client";
import { useState, useMemo, useEffect } from "react";
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

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
  const [previousTotal, setPreviousTotal] = useState(0);

  // New state for campaign details
  const [goal, setGoal] = useState(0);
  const [deadline, setDeadline] = useState(0);
  const [isGoalReached, setIsGoalReached] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);


  const contract = useMemo(() => {
    if (!isConnected || address === "-") return null;

    return new Crowdfund.Client({
      ...Crowdfund.networks.testnet,
      rpcUrl: RPC_URL,
      signTransaction,
      publicKey: address,
    });
  }, [isConnected, address]);

  async function handleOnSuccess() {
    // Fetch updated total
    if (contract) {
      setPreviousTotal(total);
      const [totalTx, progressTx, isGoalReachedTx] = await Promise.all([
          contract.get_total_raised(),
          contract.get_progress_percentage(),
          contract.is_goal_reached(),
      ]);
      setTotal(Number(BigInt(totalTx.result)));
      setProgressPercentage(Number(BigInt(progressTx.result)));
      setIsGoalReached(isGoalReachedTx.result);
    }
    await refetchBalance();
    setAmount("");

    // Show success alert
    await Swal.fire({
        title: 'Thank you!',
        text: 'Your donation has been received.',
        icon: 'success',
        confirmButtonText: 'Awesome!'
    });
  }

  // Renamed for clarity
  const { submit: submitDonation, isSubmitting: isDonating } = useSubmitTransaction({
    rpcUrl: RPC_URL,
    networkPassphrase: Crowdfund.networks.testnet.networkPassphrase,
    onSuccess: handleOnSuccess,
    onError: (error) => {
      console.error("Donation failed", error);
      Swal.fire({
        title: 'Error!',
        text: 'Your donation failed. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    },
  });

  // New submit hook for refunds
  const { submit: submitRefund, isSubmitting: isRefunding } = useSubmitTransaction({
      rpcUrl: RPC_URL,
      networkPassphrase: Crowdfund.networks.testnet.networkPassphrase,
      onSuccess: async () => {
          // Refetch data on successful refund
          if (contract) {
              const [totalTx, progressTx, isGoalReachedTx] = await Promise.all([
                  contract.get_total_raised(),
                  contract.get_progress_percentage(),
                  contract.is_goal_reached(),
              ]);
              setTotal(Number(BigInt(totalTx.result)));
              setProgressPercentage(Number(BigInt(progressTx.result)));
              setIsGoalReached(isGoalReachedTx.result);
          }
          await refetchBalance();
          await Swal.fire(
            'Refunded!',
            'Your donation has been refunded.',
            'success'
          )
      },
      onError: (error) => {
          console.error("Refund failed", error);
          Swal.fire(
            'Failed!',
            'Your refund could not be processed.',
            'error'
          )
      },
  });

  async function handleSubmit() {
    if (!isConnected || !contract) return;
    if (!amount.trim()) return;

    try {
      // Convert XLM to stroops (multiply by 10^7)
      const xlmAmount = parseFloat(amount.trim());
      const stroopsAmount = Math.floor(xlmAmount * 10_000_000);

      const tx = await contract.donate({
        donor: address,
        amount: BigInt(stroopsAmount),
      }) as any;

      await submitDonation(tx);
    } catch (e) {
      console.error("Failed to create donation transaction", e);
    }
  }

  async function handleRefund() {
    if (!isConnected || !contract) return;

    try {
      const tx = await contract.refund({
        donor: address,
      }) as any;

      await submitRefund(tx);
    } catch (e) {
      console.error("Failed to create refund transaction", e);
    }
  }

  useEffect(() => {
    if (!contract) return;

    (async () => {
      try {
        // Fetch all data in parallel
        const [
          totalTx,
          goalTx,
          deadlineTx,
          isGoalReachedTx,
          isEndedTx,
          progressTx,
        ] = await Promise.all([
          contract.get_total_raised(),
          contract.get_goal(),
          contract.get_deadline(),
          contract.is_goal_reached(),
          contract.is_ended(),
          contract.get_progress_percentage(),
        ]);

        setTotal(Number(BigInt(totalTx.result)));
        setGoal(Number(BigInt(goalTx.result)));
        setDeadline(Number(BigInt(deadlineTx.result)));
        setIsGoalReached(isGoalReachedTx.result);
        setIsEnded(isEndedTx.result);
        setProgressPercentage(Number(BigInt(progressTx.result)));

      } catch (err) {
        console.error("Failed to fetch campaign data", err);
        setTotal(0);
        setGoal(0);
        setDeadline(0);
        setIsGoalReached(false);
        setIsEnded(false);
        setProgressPercentage(0);
      }
    })();
  }, [contract]);

  return (
      <div className="flex flex-col items-center gap-y-10 py-10">
        <div className="flex flex-row items-center gap-x-6">
          <p className="text-4xl">Learning</p>
          <TextRotate
              texts={["Stellar", "Rust", "Contract", "Frontend"]}
              mainClassName="bg-white text-black rounded-lg text-4xl px-6 py-3"
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              rotationInterval={2000}
          />
        </div>

        {/* Tamagochi Link */}
        {isConnected && (
            <Link to="/tamagochi">
                <Button variant="link">View My Tamagochi</Button>
            </Link>
        )}

        {/* Campaign Status Section */}
        <Card className="flex flex-col gap-y-4 p-6 w-1/2">
            <h3 className="text-xl font-bold text-center mb-2">Campaign Status</h3>
            <div className="w-full">
                <div className="flex justify-between items-baseline">
                    <span className="text-gray-400">Progress</span>
                    <span className="font-bold text-lg">{(total / 10_000_000).toFixed(4)} / {(goal / 10_000_000).toFixed(2)} XLM</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5 mt-1">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${progressPercentage > 100 ? 100 : progressPercentage}%` }}></div>
                </div>
                <div className="flex justify-between items-baseline text-sm text-gray-400 mt-1">
                    <span>{progressPercentage}%</span>
                    <span>Goal</span>
                </div>
            </div>
            <div className="text-center text-gray-400 text-sm">
                {deadline > 0 ? `Ending on ${new Date(deadline * 1000).toLocaleString()}` : "Not initialized"}
            </div>
             <div className="flex flex-row gap-x-4 mt-2 justify-center">
                {isEnded && <p className="text-red-500 font-semibold">Campaign Ended</p>}
                {isGoalReached && <p className="text-green-500 font-semibold">Goal Reached!</p>}
            </div>
        </Card>

        <Card className="flex flex-col gap-y-6 py-4 px-8 w-1/2">
          <p className="flex flex-row items-center gap-x-2 text-lg mb-2 font-medium">
            <Donut className="size-5" />
            Donate
          </p>

          <div className="flex flex-row justify-between items-center">
            <div className="flex flex-row items-center gap-4">
              <img alt="XLM" src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Stellar_Symbol.png/1062px-Stellar_Symbol.png" className="size-10 rounded-full bg-white p-1" />
              <p>XLM</p>
            </div>
            <p className="tabular-nums flex gap-1">
              {!isConnected && <span>Connect wallet</span>}
              {isConnected && balance === "-" && <span>-</span>}
              {isConnected && balance !== "-" && (
                  <>
                    <span>{balance}</span>
                    <span>XLM</span>
                  </>
              )}
            </p>
          </div>

          <Input
              type="text"
              inputMode="decimal"
              placeholder="0.001"
              onChange={(e) => setAmount(e.target.value)}
              value={amount}
              disabled={isDonating || isEnded}
          />

          <div className="flex justify-between items-center">
            <Button
                className="w-max"
                onClick={handleSubmit}
                disabled={!isConnected || isDonating || !amount.trim() || isEnded || isGoalReached}
            >
              {isDonating ? "Donating..." : "Submit Donation"}
            </Button>

            {isEnded && !isGoalReached && (
                <Button
                    variant="destructive"
                    className="w-max"
                    onClick={handleRefund}
                    disabled={!isConnected || isRefunding}
                >
                    {isRefunding ? "Refunding..." : "Refund"}
                </Button>
            )}
          </div>
        </Card>

        <div className="flex flex-col items-center gap-2">
          <p>Your Last Donation</p>
          {previousTotal > 0 && previousTotal !== total && (
              <p className="text-sm text-green-600">
                +{((total - previousTotal) / 10_000_000).toFixed(7)} XLM added
              </p>
          )}
        </div>
      </div>
  );
}
