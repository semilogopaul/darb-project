import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";
import { toast } from "react-toastify";

const CampaignDetail = () => {
  const { id } = useParams(); // Get campaign ID from URL
  const [campaign, setCampaign] = useState(null);
  const [user, setUser] = useState(null);
  const [loadingCampaign, setLoadingCampaign] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);

  // Modal states
  const [loanModalOpen, setLoanModalOpen] = useState(false);
  const [loanAmount, setLoanAmount] = useState("");
  const [repayModalOpen, setRepayModalOpen] = useState(false);
  const [repayAmount, setRepayAmount] = useState("");

  // Fetch campaign details
  const fetchCampaignDetail = async () => {
    try {
      const response = await api.get(`/campaigns/campaign/${id}/progress/`);
      setCampaign(response.data);
    } catch (error) {
      toast.error("Failed to fetch campaign details.");
    } finally {
      setLoadingCampaign(false);
    }
  };

  // Fetch user details
  const fetchUser = async () => {
    try {
      const response = await api.get("/users/me/");
      setUser(response.data);
    } catch (error) {
      toast.error("Failed to fetch user details.");
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    fetchCampaignDetail();
    fetchUser();
  }, [id]);

  // Process a loan/investment
  const processInvest = async (amount) => {
    setBtnLoading(true);
    try {
      const response = await api.post("/payments/initialize/", {
        campaign_id: campaign.id,
        amount: parseFloat(amount),
      });
      const { authorization_url, reference } = response.data.data;
      window.open(authorization_url, "_blank");
      toast.success(`Payment initiated. Complete payment in the new window.`);
      setTimeout(() => {
        (async () => {
          try {
            const verifyResponse = await api.get(
              `/payments/verify/${reference}/?campaign_id=${campaign.id}`
            );
            if (verifyResponse.data.message) {
              toast.success("Payment verified successfully.");
              fetchCampaignDetail();
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
      setBtnLoading(false);
    }
  };

  // Process a repayment
  const processRepay = async (amount) => {
    setBtnLoading(true);
    try {
      const response = await api.post("/campaigns/repayment/initialize/", {
        campaign_id: campaign.id,
        amount: parseFloat(amount),
      });
      const { authorization_url, reference } = response.data.data;
      window.open(authorization_url, "_blank");
      toast.success(`Repayment initiated. Complete payment in the new window.`);
      setTimeout(() => {
        (async () => {
          try {
            const verifyResponse = await api.get(
              `/campaigns/repayment/verify/${reference}/?campaign_id=${campaign.id}`
            );
            if (verifyResponse.data.message) {
              toast.success("Repayment verified successfully.");
              fetchCampaignDetail();
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
      setBtnLoading(false);
    }
  };

  if (loadingCampaign || loadingUser)
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  if (!campaign)
    return (
      <div className="flex items-center justify-center min-h-screen">
        Campaign not found.
      </div>
    );

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Campaign Image */}
        <div className="relative w-full">
          <img
            src={campaign.image || "https://via.placeholder.com/600x400"}
            alt={campaign.title}
            className="w-full h-80 object-contain"
          />
          <div className="absolute inset-0 bg-black opacity-1"></div>
        </div>

        {/* Campaign Content */}
        <div className="p-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {campaign.title}
          </h1>
          <p className="text-gray-700 mb-6">{campaign.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Details */}
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <strong>Goal:</strong> ₦{campaign.goal_amount}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Raised:</strong> ₦{campaign.current_amount}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Interest Rate:</strong> {campaign.interest_rate}%
              </p>
              <p className="text-sm text-gray-600">
                <strong>Repayment Period:</strong> {campaign.repayment_period}{" "}
                months
              </p>
            </div>
            {/* Funding Progress */}
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <strong>Funding Progress:</strong>{" "}
                {campaign.funding_progress.toFixed(2)}%
              </p>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                <div
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ width: `${campaign.funding_progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Extra Details for Founder or Lender Who Funded */}
          {(user.user_type === "founder" ||
            (user.user_type !== "founder" && campaign.has_funded)) && (
            <div className="mt-6 border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Funding & Repayment Totals */}
                <div className="space-y-2">
                  {campaign.funded_at && (
                    <p className="text-sm text-gray-600">
                      <strong>Funded At:</strong>{" "}
                      {new Date(campaign.funded_at).toLocaleDateString()}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    <strong>Total Repayment:</strong> ₦{campaign.total_repayment}
                  </p>
                </div>
                {/* Right Column: Monthly Due Info */}
                <div className="space-y-2">
                  {campaign.monthly_due_info &&
                    Object.keys(campaign.monthly_due_info).length > 0 && (
                      <>
                        <p className="text-sm text-gray-600">
                          <strong>Monthly Repayment:</strong> ₦
                          {campaign.monthly_due_info.monthly_repayment}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Next Due Date:</strong>{" "}
                          {new Date(
                            campaign.monthly_due_info.next_due_date
                          ).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Amount Due:</strong> ₦
                          {campaign.monthly_due_info.amount_due}
                        </p>
                      </>
                    )}
                </div>
              </div>
              {/* Repayment Progress Bar */}
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Repayment Progress:</strong>{" "}
                  {campaign.repayment_progress.toFixed(2)}%
                </p>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${campaign.repayment_progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            {user.user_type === "founder" ? (
              campaign.funding_progress >= 100 && !campaign.is_fully_repaid ? (
                <button
                  onClick={() => setRepayModalOpen(true)}
                  disabled={btnLoading}
                  className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded transition-colors"
                >
                  {btnLoading ? "Processing..." : "Repay Loan"}
                </button>
              ) : (
                <button
                  onClick={() =>
                    toast.info("Campaign is not fully funded for repayment.")
                  }
                  className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded transition-colors"
                >
                  Repay Loan
                </button>
              )
            ) : (
              <button
                onClick={() => setLoanModalOpen(true)}
                disabled={btnLoading}
                className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded transition-colors"
              >
                {btnLoading ? "Processing..." : "Loan"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loan Modal */}
      {loanModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-950/50 z-50">
          <div className="bg-white rounded-lg p-6 w-11/12 max-w-md">
            <h2 className="text-2xl font-semibold mb-4">Enter Loan Amount</h2>
            <input
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              className="w-full p-3 rounded mb-4 outline-1 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Amount"
            />
            <div className="flex justify-end">
              <button
                onClick={() => setLoanModalOpen(false)}
                className="mr-2 px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setLoanModalOpen(false);
                  await processInvest(loanAmount);
                }}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Repay Modal */}
      {repayModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-950/50 z-50">
          <div className="bg-white rounded-lg p-6 w-11/12 max-w-md">
            <h2 className="text-2xl font-semibold mb-4">Enter Repayment Amount</h2>
            <input
              type="number"
              value={repayAmount}
              onChange={(e) => setRepayAmount(e.target.value)}
              className="w-full p-3 rounded mb-4 border focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Amount"
            />
            <div className="flex justify-end">
              <button
                onClick={() => setRepayModalOpen(false)}
                className="mr-2 px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setRepayModalOpen(false);
                  await processRepay(repayAmount);
                }}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
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

export default CampaignDetail;
