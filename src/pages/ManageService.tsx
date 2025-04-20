import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, X, Plus } from 'lucide-react';

function ManageService() {
  const { state } = useLocation();
  const serviceId = state?.serviceId;
  const type = state?.type;
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>({});
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchService = async () => {
      setLoading(true);
      let data, error;
      if (type === 'hotel') {
        ({ data, error } = await supabase
          .from('hotels')
          .select('*')
          .eq('id', serviceId)
          .single());
      } else if (type === 'bus') {
        ({ data, error } = await supabase
          .from('buses')
          .select('*')
          .eq('id', serviceId)
          .single());
      }

      if (!error && data) {
        setService(data);
        setForm(data);
        setImages(data.images || []);
      }
      setLoading(false);
    };

    fetchService();
  }, [serviceId, type]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    const updatedForm = { ...form, images };
    if (type === 'hotel') {
      await supabase.from('hotels').update(updatedForm).eq('id', serviceId);
    } else if (type === 'bus') {
      await supabase.from('buses').update(updatedForm).eq('id', serviceId);
    }
    setLoading(false);
    alert('Service updated successfully');
  };

  const addImage = async () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const fileName = `${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage.from('bucket').upload(fileName, file);
        if (!error && data) {
          const { data: publicUrlData } = supabase.storage.from('bucket').getPublicUrl(fileName);
          setImages([...images, publicUrlData.publicUrl]);
        }
      }
    };
    fileInput.click();
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Service not found
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Manage {type === 'hotel' ? 'Hotel' : 'Bus'} Service</h1>

      {type === 'hotel' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={form.name || ''}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              name="location"
              value={form.location || ''}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={form.description || ''}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Price per Night</label>
            <input
              type="number"
              name="price_per_night"
              value={form.price_per_night || ''}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tags</label>
            <input
              type="text"
              name="tags"
              value={form.tags || ''}
              onChange={handleChange}
              placeholder="Comma-separated tags"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={addImage}
                className="bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Hotel ${index + 1}`}
                    className="w-full h-32 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                  >
                    <X className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {type === 'bus' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Operator</label>
            <input
              type="text"
              name="operator"
              value={form.operator || ''}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Source</label>
            <input
              type="text"
              name="source"
              value={form.source || ''}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Destination</label>
            <input
              type="text"
              name="destination"
              value={form.destination || ''}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
        </div>
      )}

      <button
        onClick={handleSave}
        className="mt-6 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
      >
        Save Changes
      </button>
    </div>
  );
}

export default ManageService;
