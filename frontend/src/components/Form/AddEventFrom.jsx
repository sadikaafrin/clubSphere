import React from "react";
import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { imageUpload } from "../../utils";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorPage from "../../pages/ErrorPage";

const AddEventFrom = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const {
    isPending,
    isError,
    mutateAsync,
    reset: mutationReset,
  } = useMutation({
    mutationFn: async (payLoad) => await axiosSecure.post(`/clubs`, payLoad),
    onSuccess: (data) => {
      console.log(data);
      // toaster
      toast.success("Event added successfully");
      // reset
      mutationReset();
    },
    onError: (error) => {
      console.log(error);
    },
    onMutate: (payLoad) => {
      console.log("I wil post this data", payLoad);
    },
    onSettled: (data, error) => {
      if (data) console.log(data);
      if (error) console.log(error);
    },
    retry: 3,
  });
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const { data: myClubs = [], isLoading } = useQuery({
    queryKey: ["my-clubs", user?.email],
    enabled: !!user?.email,
    queryFn: async () => {
      const res = await axiosSecure.get(`/my-clubs/${user.email}`);
      return res.data;
    },
  });

  const activeClubs = myClubs.filter(club => club.status === "approved");


  const onSubmit = async (data) => {
    const { name, description, eventDate, clubId, location, image } = data;

    // find selected club name (optional but useful)
    const selectedClub = myClubs.find((c) => c._id === clubId);
    const imageFile = image[0];
    const imageUrl = await imageUpload(imageFile);

    const eventData = {
      name,
      image: imageUrl,
      description,
      eventDate,
      clubId,
      location,
      clubName: selectedClub?.name,
    };

    await axiosSecure.post("/events", eventData);
    toast.success("Event created successfully");
  };

  if (isPending) return <LoadingSpinner></LoadingSpinner>;
  if (isError) return <ErrorPage></ErrorPage>;
  return (
    <div className="max-w-4xl mx-auto p-8 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl shadow-xl">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Create New Event
        </h2>
        <p className="text-gray-600">
          Fill in the details below to create your event
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Name Field */}
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-lg font-medium text-gray-700"
            >
              Event Name
            </label>
            <input
              className="w-full px-6 py-4 text-lg text-gray-800 border-2 border-lime-200 focus:border-lime-500 focus:ring-2 focus:ring-lime-200 rounded-xl bg-white transition-all duration-300"
              id="name"
              type="text"
              placeholder="Enter event name"
              {...register("name", {
                required: "Name is required",
                maxLength: {
                  value: 20,
                  message: "Name must be 20 characters or less",
                },
              })}
            />
            {errors.name && (
              <p className="text-red-500 mt-2 text-sm font-medium">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Club Selection */}
          <div className="space-y-2">
            <label className="block text-lg font-medium text-gray-700">
              Select Club
            </label>
            <select  className="w-full px-6 py-4 text-lg border-2 border-lime-200 focus:border-lime-500 focus:ring-2 focus:ring-lime-200 rounded-xl bg-white appearance-none transition-all duration-300" {...register("clubId", { required: true })}>
              <option value="">Select Club</option>
              {activeClubs.map((club) => (
                <option key={club._id} value={club._id}>
                  {club.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description - Full Width */}
        <div className="space-y-2">
          <label
            htmlFor="description"
            className="block text-lg font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            id="description"
            placeholder="Describe your event in detail..."
            className="w-full px-6 py-4 text-lg text-gray-800 border-2 border-lime-200 focus:border-lime-500 focus:ring-2 focus:ring-lime-200 rounded-xl bg-white resize-none transition-all duration-300 min-h-[180px]"
            {...register("description", {
              required: "Description is required",
            })}
          ></textarea>
          {errors.description && (
            <p className="text-red-500 mt-2 text-sm font-medium">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Event Date */}
          <div className="space-y-2">
            <label
              htmlFor="eventDate"
              className="block text-lg font-medium text-gray-700"
            >
              Event Date
            </label>
            <div className="relative">
              <input
                className="w-full px-6 py-4 text-lg text-gray-800 border-2 border-lime-200 focus:border-lime-500 focus:ring-2 focus:ring-lime-200 rounded-xl bg-white transition-all duration-300"
                id="eventDate"
                type="date"
                min={new Date().toISOString().split("T")[0]}
                {...register("eventDate", {
                  required: "Event date is required",
                })}
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                📅
              </div>
            </div>
            {errors.eventDate && (
              <p className="text-red-500 mt-2 text-sm font-medium">
                {errors.eventDate.message}
              </p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label
              htmlFor="location"
              className="block text-lg font-medium text-gray-700"
            >
              Location
            </label>
            <div className="relative">
              <input
                className="w-full px-6 py-4 text-lg text-gray-800 border-2 border-lime-200 focus:border-lime-500 focus:ring-2 focus:ring-lime-200 rounded-xl bg-white transition-all duration-300"
                id="location"
                type="text"
                placeholder="Event venue"
                {...register("location", {
                  required: "Location is required",
                  maxLength: {
                    value: 100,
                    message: "Location must be less than 100 characters",
                  },
                })}
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                📍
              </div>
            </div>
            {errors.location && (
              <p className="text-red-500 mt-2 text-sm font-medium">
                {errors.location.message}
              </p>
            )}
          </div>

          {/* Max Attendees */}
          <div className="space-y-2">
            <label
              htmlFor="attendees"
              className="block text-lg font-medium text-gray-700"
            >
              Max Attendees
            </label>
            <div className="relative">
              <input
                className="w-full px-6 py-4 text-lg text-gray-800 border-2 border-lime-200 focus:border-lime-500 focus:ring-2 focus:ring-lime-200 rounded-xl bg-white transition-all duration-300"
                id="attendees"
                type="number"
                placeholder="0"
                min="1"
                {...register("attendees", {
                  required: "Attendees is required",
                  min: { value: 1, message: "Must have at least 1 attendee" },
                })}
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                👥
              </div>
            </div>
            {errors.attendees && (
              <p className="text-red-500 mt-2 text-sm font-medium">
                {errors.attendees.message}
              </p>
            )}
          </div>
          {/* image */}
          <div className=" p-4  w-full  m-auto rounded-lg grow">
            <div className="file_upload px-5 py-3 relative border-4 border-dotted border-gray-300 rounded-lg">
              <div className="flex flex-col w-max mx-auto text-center">
                <label>
                  <input
                    className="text-sm cursor-pointer w-36 hidden"
                    type="file"
                    name="image"
                    id="image"
                    accept="image/*"
                    hidden
                    {...register("image", {
                      required: "Image is required",
                    })}
                  />
                  {errors.image && (
                    <p className="text-red-500 mt-1">{errors.image.message}</p>
                  )}
                  <div className="bg-lime-500 text-white border border-gray-300 rounded font-semibold cursor-pointer p-1 px-3 hover:bg-lime-500">
                    Upload
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
        {/* Submit Button */}
        <div className="pt-6">
          <button
            type="submit"
            className="w-full md:w-auto md:px-16 py-5 text-xl font-bold text-white bg-gradient-to-r from-lime-500 to-green-500 hover:from-lime-600 hover:to-green-600 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-3"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <span>Create Event</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEventFrom;
