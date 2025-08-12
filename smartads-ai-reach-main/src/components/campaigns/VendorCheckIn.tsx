import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/ssr';
import { useUser } from '@supabase/auth-helpers-react';
import { Camera, MapPin, Clock, DollarSign, X, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

type Task = {
  id: string;
  name: string;
  campaign: {
    id: string;
    name: string;
  };
};

type CheckInData = {
  location: {
    latitude: number;
    longitude: number;
  } | null;
  address: string;
  notes: string;
  photos: File[];
  expense: {
    amount: number;
    category: string;
    description: string;
    receipt: File | null;
  };
};

export default function VendorCheckIn({ taskId }: { taskId: string }) {
  const supabase = createClientComponentClient();
  const user = useUser();
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checkInData, setCheckInData] = useState<CheckInData>({
    location: null,
    address: '',
    notes: '',
    photos: [],
    expense: {
      amount: 0,
      category: 'transportation',
      description: '',
      receipt: null,
    },
  });

  // Fetch task details
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select(`
            id,
            name,
            campaign:campaigns(id, name)
          `)
          .eq('id', taskId)
          .single();

        if (error) throw error;
        setTask(data);
      } catch (error) {
        console.error('Error fetching task:', error);
        toast.error('Failed to load task details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTask();
  }, [taskId, supabase]);

  // Get current location
  const getLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      setCheckInData(prev => ({
        ...prev,
        location: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
      }));

      // Get address from coordinates
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
      );
      const data = await response.json();
      setCheckInData(prev => ({
        ...prev,
        address: data.display_name || 'Address not available',
      }));
    } catch (error) {
      console.error('Error getting location:', error);
      toast.error('Failed to get your location');
    }
  };

  // Handle photo uploads
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPhotos = Array.from(files).slice(0, 5 - checkInData.photos.length);
    setCheckInData(prev => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos],
    }));
  };

  // Remove a photo
  const removePhoto = (index: number) => {
    setCheckInData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!checkInData.location || !user) return;

    setIsCheckingIn(true);
    const toastId = toast.loading('Processing check-in...');

    try {
      // 1. Upload photos
      const photoUrls = [];
      for (const photo of checkInData.photos) {
        const filePath = `task_photos/${taskId}/${Date.now()}_${photo.name}`;
        const { error: uploadError } = await supabase.storage
          .from('task-photos')
          .upload(filePath, photo);
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('task-photos')
          .getPublicUrl(filePath);
        
        photoUrls.push(publicUrl);
      }

      // 2. Create check-in record
      const { error: checkInError } = await supabase.from('check_ins').insert([
        {
          task_id: taskId,
          user_id: user.id,
          location: `POINT(${checkInData.location.longitude} ${checkInData.location.latitude})`,
          address: checkInData.address,
          notes: checkInData.notes,
        },
      ]);

      if (checkInError) throw checkInError;

      toast.success('Check-in successful!', { id: toastId });
      
      // Reset form
      setCheckInData({
        location: null,
        address: '',
        notes: '',
        photos: [],
        expense: {
          amount: 0,
          category: 'transportation',
          description: '',
          receipt: null,
        },
      });
    } catch (error) {
      console.error('Error during check-in:', error);
      toast.error('Failed to complete check-in', { id: toastId });
    } finally {
      setIsCheckingIn(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="p-8 text-center text-gray-600">
        Task not found or you don't have permission to view it.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 bg-blue-600 text-white">
          <h2 className="text-xl font-bold">{task.name}</h2>
          <p className="text-blue-100">{task.campaign.name}</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Location Section */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium">Location</h3>
            </div>
            
            {checkInData.location ? (
              <div className="p-4 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-700">{checkInData.address}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {checkInData.location.latitude.toFixed(6)}, {checkInData.location.longitude.toFixed(6)}
                </p>
              </div>
            ) : (
              <button
                onClick={getLocation}
                className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Get My Location
              </button>
            )}
          </div>

          {/* Photos Section */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Camera className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium">Photos</h3>
              <span className="text-xs text-gray-500">({checkInData.photos.length}/5)</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {checkInData.photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Check-in photo ${index + 1}`}
                    className="h-24 w-full object-cover rounded-md"
                  />
                  <button
                    onClick={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              
              {checkInData.photos.length < 5 && (
                <label className="flex items-center justify-center h-24 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-blue-500">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                    capture="environment"
                  />
                  <Camera className="h-6 w-6 text-gray-400" />
                </label>
              )}
            </div>
          </div>

          {/* Notes Section */}
          <div className="space-y-2">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              id="notes"
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={checkInData.notes}
              onChange={(e) => setCheckInData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add any notes about this check-in..."
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              onClick={handleSubmit}
              disabled={!checkInData.location || isCheckingIn}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                (!checkInData.location || isCheckingIn) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isCheckingIn ? 'Processing...' : 'Submit Check-In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
