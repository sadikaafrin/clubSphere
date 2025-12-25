import Container from "../../components/Shared/Container";
import Heading from "../../components/Shared/Heading";
import Button from "../../components/Shared/Button/Button";
import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import LoadingSpinner from "../../components/Shared/LoadingSpinner";
import toast from "react-hot-toast";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useAuth from "../../hooks/useAuth";

const PlantDetails = () => {
  const [isJoined, setIsJoined] = useState(false);
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const { id } = useParams();

  // Fetch club details
  const {
    data: club = {},
    isLoading,
    refetch: refetchClub,
  } = useQuery({
    queryKey: ["club", id],
    queryFn: async () => {
      const result = await axios.get(
        `${import.meta.env.VITE_API_URL}/clubs/${id}`
      );
      return result.data;
    },
  });

  // Check if user is already a member
  const {
    data: isMember = false,
    isLoading: checkingMembership,
    refetch: refetchMembership,
  } = useQuery({
    queryKey: ["isMember", user?.email, id],
    enabled: !!user?.email && !!id,
    queryFn: async () => {
      const res = await axiosSecure.get(`/memberships/is-member?clubId=${id}`);
      return res.data.isMember;
    },
  });

  const handleJoinClub = async () => {
    if (isJoined) return;
    if (!user) {
      navigate("/login", { state: { from: `/club/${id}` } });
      return;
    }

    try {
      const response = await axiosSecure.post("/memberships", {
        clubId: id,
      });

      if (response.data.isFree) {
        // Free club - joined directly
        toast.success(response.data.message || "Successfully joined the club!");
        refetchClub();
        refetchMembership();
      } else {
        // Paid club - redirect to Stripe
        window.location.href = response.data.url;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to join club");
    }
  };

  if (isLoading) return <LoadingSpinner />;

  const { name, category, image, price, quantity, description, location } =
    club;

  return (
    <Container>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Club Image */}
          <div className="w-full">
            <div className="w-full overflow-hidden rounded-2xl shadow-lg">
              <img
                className="object-cover w-full h-full max-h-[500px]"
                src={image}
                alt={name}
              />
            </div>
          </div>

          {/* Club Info */}
          <div className="space-y-6">
            <Heading title={name} subtitle={`Category: ${category}`} />

            <div className="text-lg text-neutral-600 leading-relaxed">
              {description}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700">Location:</span>
                <span className="text-neutral-500">{location}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700">
                  Available Spots:
                </span>
                <span className="text-neutral-500">{quantity}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700">
                  Membership Price:
                </span>
                <span className="text-2xl font-bold text-green-600">
                  ${price || "Free"}
                </span>
              </div>
            </div>

            {/* Join Button */}
            <div className="pt-4">
              {isMember ? (
                <Button
                  onClick={() => navigate("/dashboard/my-memberships")}
                  label="View My Membership"
                  className="bg-green-500 hover:bg-green-600 w-full"
                />
              ) : (
                <Button
                  onClick={handleJoinClub}
                  label={price > 0 ? `Join Club ` : "Join Free"}
                  className="bg-blue-500 hover:bg-blue-600 w-full"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      
    </Container>
  );
};

export default PlantDetails;
