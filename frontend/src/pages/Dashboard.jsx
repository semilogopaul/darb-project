import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { toast } from "react-toastify";
import CampaignCard from "../components/CampaignCard";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const navigate = useNavigate();

  const fetchCampaigns = async () => {
    try {
      const response = await api.get("/campaigns/create/");
      setCampaigns(response.data);
    } catch (error) {
      toast.error("Failed to fetch campaigns.");
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/users/me/");
        setUser(response.data);
      } catch (error) {
        toast.error("Failed to fetch user details.");
        navigate("/login");
      }
    };

    fetchUser();
    fetchCampaigns();
  }, [navigate, refresh]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen text-center p-5">
        Loading...
      </div>
    );
  }

  // Filter campaigns by title
  const filteredCampaigns = campaigns.filter((campaign) =>
    campaign.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // For founders, only display campaigns they created
  const founderCampaigns = filteredCampaigns.filter(
    (campaign) =>
      campaign.founder === user.id ||
      (campaign.founder && campaign.founder.id === user.id)
  );

  const refreshCampaigns = () => {
    setRefresh(!refresh);
  };

  // Handles the withdraw form submission in the modal
  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    try {
      const response = await api.post("/users/withdraw/", { amount });
      toast.success(response.data.message);
      setUser((prevUser) => ({
        ...prevUser,
        balance: response.data.new_balance,
      }));
      setShowWithdrawModal(false);
      setWithdrawAmount("");
    } catch (error) {
      toast.error("Withdrawal failed. " + (error.response?.data?.error || ""));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 relative">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-gray-800 mb-6">
          Welcome, {user.first_name} {user.last_name}💚
        </h2>
        <input
          type="text"
          placeholder="Search campaigns..."
          className="w-full p-3 rounded-lg shadow border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors mb-6"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {user.user_type === "founder" ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-semibold text-gray-700">
                  Your Campaigns
                </h3>
                <p className="text-lg text-green-600 transition-colors font-medium">
                  Balance: ₦{user.balance}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  className="bg-green-500 hover:bg-green-600 transition-colors text-white px-4 py-2 rounded"
                  onClick={() => setShowWithdrawModal(true)}
                >
                  Withdraw Funds
                </button>
                <button
                  className="bg-green-500 hover:bg-green-600 transition-colors text-white px-5 py-2 rounded"
                  onClick={() => navigate("/create-campaign")}
                >
                  + Create Campaign
                </button>
              </div>
            </div>
            {founderCampaigns.length === 0 ? (
              <p>You currently have no campaigns😔</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {founderCampaigns.map((campaign) => (
                  <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    isFounder={true}
                    user={user}
                    refreshCampaigns={refreshCampaigns}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-semibold text-gray-700">
                Available Campaigns
              </h3>
              <div className="flex items-center space-x-4">
                <p className="text-lg text-green-600 transition-colors font-medium">
                  Balance: ₦{user.balance}
                </p>
                <button
                  className="bg-green-500 hover:bg-green-600 transition-colors text-white px-3 py-1 rounded"
                  onClick={() => setShowWithdrawModal(true)}
                >
                  Withdraw
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredCampaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  user={user}
                  refreshCampaigns={refreshCampaigns}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-center">Withdraw Funds</h2>
            <form onSubmit={handleWithdrawSubmit}>
              <label className="block text-gray-700 mb-2" htmlFor="withdrawAmount">
                Amount
              </label>
              <input
                id="withdrawAmount"
                type="number"
                step="0.01"
                className="w-full p-3 outline-1 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition-colors"
                >
                  Withdraw
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
