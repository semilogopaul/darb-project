import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { toast } from "react-toastify";

const CampaignCard = ({ campaign, isFounder = false, refreshCampaigns, user }) => {
  const [loading, setLoading] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [loanAmount, setLoanAmount] = useState("");
  const [showRepayModal, setShowRepayModal] = useState(false);
  const [repayAmount, setRepayAmount] = useState("");
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/campaign/${campaign.id}`);
  };

  const shortDescription =
    campaign.description.length > 100
      ? campaign.description.substring(0, 100) + "..."
      : campaign.description;

  const processInvest = async (amount) => {
    setLoading(true);
    try {
      const response = await api.post("/payments/initialize/", {
        campaign_id: campaign.id,
        amount: parseFloat(amount),
      });
      const { authorization_url, reference } = response.data.data;
      window.open(authorization_url, "_blank");
      toast.success(
        `Payment initiated. Complete payment in the new window.`
      );
      setTimeout(() => {
        (async () => {
          try {
            const verifyResponse = await api.get(
              `/payments/verify/${reference}/?campaign_id=${campaign.id}`
            );
            if (verifyResponse.data.message) {
              toast.success("Payment verified successfully.");
              if (refreshCampaigns) refreshCampaigns();
            } else {
              toast.error("Payment verification failed.");
            }
          } catch (error) {
            toast.error(
              error.response?.data?.error || "Payment verification failed."
            );
          }
        })();
      }, 30000);
    } catch (error) {
      toast.error(error.response?.data?.error || "Loan failed!");
    } finally {
      setLoading(false);
    }
  };

  const processRepay = async (amount) => {
    setLoading(true);
    try {
      const response = await api.post("/campaigns/repayment/initialize/", {
        campaign_id: campaign.id,
        amount: parseFloat(amount),
      });
      const { authorization_url, reference } = response.data.data;
      window.open(authorization_url, "_blank");
      toast.success(
        `Repayment initiated. Complete payment in the new window.`
      );
      setTimeout(() => {
        (async () => {
          try {
            const verifyResponse = await api.get(
              `/campaigns/repayment/verify/${reference}/?campaign_id=${campaign.id}`
            );
            if (verifyResponse.data.message) {
              toast.success("Repayment verified successfully.");
              if (refreshCampaigns) refreshCampaigns();
            } else {
              toast.error("Repayment verification failed.");
            }
          } catch (error) {
            toast.error(
              error.response?.data?.error || "Repayment verification failed."
            );
          }
        })();
      }, 20000);
    } catch (error) {
      toast.error(error.response?.data?.error || "Repayment failed!");
    } finally {
      setLoading(false);
    }
  };

  const openLoanModal = (e) => {
    e.stopPropagation();
    if (campaign.funding_progress >= 100) {
      toast.info("This campaign is fully funded.");
      return;
    }
    setLoanAmount("");
    setShowLoanModal(true);
  };

  const openRepayModal = (e) => {
    e.stopPropagation();
    if (campaign.funding_progress < 100) {
      toast.info("Campaign is not fully funded for repayment.");
      return;
    }
    setRepayAmount("");
    setShowRepayModal(true);
  };

  return (
    <div
      onClick={handleCardClick}
      className="relative cursor-pointer flex flex-col bg-white rounded-lg shadow hover:shadow-xl transition-transform transform hover:scale-105 p-4"
    >
      {user && user.user_type !== "founder" && campaign.has_funded && (
        <div className="absolute top-0 right-0 bg-blue-500 text-white px-2 py-1 text-xs font-bold rounded-bl z-10">
          You Funded
        </div>
      )}
      <div className="relative">
        <img
          src={campaign.image || "https://via.placeholder.com/300"}
          alt={campaign.title}
          className="w-full h-48 object-contain rounded-md mb-4"
        />
        <div className="absolute inset-0 bg-black opacity-[0.5%] rounded-md"></div>
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-bold text-gray-800">{campaign.title}</h3>
        <p className="text-xs text-gray-500">
          Created on: {new Date(campaign.created_at).toLocaleDateString()}
        </p>
        <p className="text-sm text-gray-600 mt-2">{shortDescription}</p>
        <div className="mt-3 text-sm text-gray-700">
          <p>
            <span className="font-semibold">Goal:</span> ₦{campaign.goal_amount}
          </p>
          <p>
            <span className="font-semibold">Raised:</span> ₦{campaign.current_amount}
          </p>
          <p>
            <span className="font-semibold">Interest Rate:</span>{" "}
            {campaign.interest_rate}%
          </p>
          <p>
            <span className="font-semibold">Repayment Period:</span>{" "}
            {campaign.repayment_period} months
          </p>
        </div>
        <div className="mt-3">
          <p className="text-sm text-gray-700 mb-2">
            <span className="font-semibold">Progress:</span>{" "}
            {campaign.funding_progress.toFixed(2)}%
          </p>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
            <div
              className="h-full bg-green-600 transition-all duration-500"
              style={{ width: `${campaign.funding_progress}%` }}
            ></div>
          </div>
        </div>
      </div>
      {/* Stop propagation on the button container so clicks inside modals won't trigger the card click */}
      <div className="mt-4" onClick={(e) => e.stopPropagation()}>
        {isFounder ? (
          campaign.funding_progress >= 100 && !campaign.is_fully_repaid ? (
            <button
              onClick={openRepayModal}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded transition"
            >
              {loading ? "Processing..." : "Repay Loan"}
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toast.info("Campaign is not fully funded for repayment.");
              }}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded transition"
            >
              Repay Loan
            </button>
          )
        ) : (
          <button
            onClick={openLoanModal}
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded transition"
          >
            {loading ? "Processing..." : "Loan"}
          </button>
        )}
      </div>

      {/* Loan Modal */}
      {showLoanModal && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 flex items-center justify-center bg-gray-950/50 z-50"
        >
          <div className="bg-white rounded-lg p-6 w-80" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Enter Loan Amount
            </h2>
            <input
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              className="w-full p-3 rounded mb-4 focus:outline-none outline-1 focus:ring-2 focus:ring-green-500"
              placeholder="Amount"
            />
            <div className="flex justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLoanModal(false);
                }}
                className="mr-2 px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  setShowLoanModal(false);
                  await processInvest(loanAmount);
                }}
                className="px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-white transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Repay Modal */}
      {showRepayModal && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 flex items-center justify-center bg-gray-950/50 z-50"
        >
          <div className="bg-white rounded-lg p-6 w-80" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Enter Repayment Amount
            </h2>
            <input
              type="number"
              value={repayAmount}
              onChange={(e) => setRepayAmount(e.target.value)}
              className="w-full p-3 rounded mb-4 outline-1 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Amount"
            />
            <div className="flex justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowRepayModal(false);
                }}
                className="mr-2 px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  setShowRepayModal(false);
                  await processRepay(repayAmount);
                }}
                className="px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-white transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignCard;
