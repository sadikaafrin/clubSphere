import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { imageUpload } from "../../utils";

const UpdatePlantForm = ({ club, setIsEditModalOpen }) => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const { name, category, price, quantity, description,location, image, _id } =
    club || {};

  const [newImage, setNewImage] = useState(null);
  const [preview, setPreview] = useState(image);

  // Image change handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;

    try {
      let imageUrl = image;
      if (newImage) {
        imageUrl = await imageUpload(newImage);
      }

      const updatedPlant = {
        name: form.name.value,
        category: form.category.value,
        description: form.description.value,
        price: parseFloat(form.price.value),
        quantity: parseInt(form.quantity.value),
        location: form.location.value,
        image: imageUrl,
      };

      const res = await axiosSecure.patch(`/clubs/${_id}`, updatedPlant);

      if (res.data.modifiedCount > 0) {
        queryClient.invalidateQueries(["inventory"]);
        setIsEditModalOpen(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="w-full flex flex-col justify-center items-center text-gray-800 rounded-xl bg-gray-50 p-4">
      <form onSubmit={handleSubmit} className="w-full space-y-6">
        {/* Image Preview */}
        {preview && (
          <img
            src={preview}
            alt="Plant preview"
            className="w-32 h-32 object-cover rounded mx-auto"
          />
        )}

        {/* Image Upload */}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full"
        />

        {/* Name */}
        <div className="space-y-1 text-sm">
          <label htmlFor="name" className="block text-gray-600">
            Name
          </label>
          <input
            name="name"
            defaultValue={name}
            type="text"
            placeholder="Plant Name"
            required
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        {/* Category */}
        <div className="space-y-1 text-sm">
          <label htmlFor="category" className="block text-gray-600 ">
            Category
          </label>
          <select
            name="category"
            defaultValue={category}
            required
            className="w-full px-4 py-2 border rounded"
          >
            <option value="Indoor">Indoor</option>
            <option value="Outdoor">Outdoor</option>
            <option value="Succulent">Succulent</option>
            <option value="Flowering">Flowering</option>
          </select>
        </div>

        {/* Description */}
          <div className="space-y-1 text-sm">
          <label htmlFor="description" className="block text-gray-600 ">
            Description
          </label>
        <textarea
          name="description"
          defaultValue={description}
          placeholder="Plant description"
          className="w-full px-4 py-2 border rounded"
        />
        </div>

        {/* Price */}
         <div className="space-y-1 text-sm">
          <label htmlFor="price" className="block text-gray-600">
            Price
          </label>
        <input
          name="price"
          type="number"
          defaultValue={price}
          placeholder="Price"
          required
          className="w-full px-4 py-2 border rounded"
        />
        </div>

        {/* Quantity */}
         <div className="space-y-1 text-sm">
          <label htmlFor="quantity" className="block text-gray-600">
            Name
          </label>
        <input
          name="quantity"
          type="number"
          defaultValue={quantity}
          placeholder="Quantity"
          required
          className="w-full px-4 py-2 border rounded"
        />
        </div>
        {/* location */}
         <div className="space-y-1 text-sm">
          <label htmlFor="location" className="block text-gray-600">
            Location
          </label>
        <input
          name="location"
          type="text"
          defaultValue={location}
          placeholder="Location"
          required
          className="w-full px-4 py-2 border rounded"
        />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-lime-500 text-white py-2 rounded hover:bg-lime-600"
        >
          Update Plant
        </button>
      </form>
    </div>
  );
};

export default UpdatePlantForm;
