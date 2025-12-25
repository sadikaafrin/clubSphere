import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useNavigate } from "react-router";

const JoinClubModal = ({ closeModal, isOpen, club, onJoin, user }) => {
  const navigate = useNavigate();
  
  const { name, category, price, quantity, location } = club;

  const handleJoinClick = () => {
    onJoin();
    closeModal(); // Close modal after initiating join process
  };

  const handleLoginRedirect = () => {
    closeModal();
    navigate("/login", { state: { from: `/club/${club._id}` } });
  };

  return (
    <Dialog
      open={isOpen}
      as="div"
      className="relative z-10 focus:outline-none"
      onClose={closeModal}
    >
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto bg-black/30">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className="w-full max-w-md bg-white p-6 rounded-xl shadow-xl"
          >
            <DialogTitle
              as="h3"
              className="text-xl font-semibold text-center text-gray-900 mb-4"
            >
              Join {name}
            </DialogTitle>

            {!user ? (
              <div className="space-y-4">
                <div className="text-center text-gray-600 mb-4">
                  You need to login to join this club
                </div>
                <button
                  onClick={handleLoginRedirect}
                  type="button"
                  className="w-full px-4 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition"
                >
                  Login to Join
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{category}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{location}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Available Spots:</span>
                    <span className="font-medium">{quantity}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Membership Fee:</span>
                    <span className="text-2xl font-bold text-green-600">
                      ${price || "Free"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Your Email:</span>
                    <span className="font-medium">{user.email}</span>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <p className="text-sm text-blue-700">
                    By joining, you'll get access to all club facilities and member benefits.
                    {price > 0 && " Payment is required to activate your membership."}
                  </p>
                </div>

                <div className="flex flex-col space-y-3">
                  <button
                    onClick={handleJoinClick}
                    type="button"
                    className="w-full px-4 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition"
                  >
                    {price > 0 ? `Proceed to Payment $${price}` : "Join Free Now"}
                  </button>

                  <button
                    type="button"
                    className="w-full px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export default JoinClubModal;