import React from "react";
import ProfileDetails from "../components/ProfileDetails";
import ProfileOverview from "../components/ProfileOverview";
import { useJobSeekerProfile } from "../hooks/useJobSeekerProfile";
import { useAuth } from "../../auth/hooks";

const JobSeekerProfilePage: React.FC = () => {
  const { profile, loading, error } = useJobSeekerProfile();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
        <div className="max-w-5xl mx-auto px-6 h-48 flex flex-col justify-end pb-6 text-white text-center">
  
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-16 pb-10 flex flex-col gap-6 lg:flex-row">
        <div className="lg:w-1/3">
          <ProfileOverview
            profile={profile}
            loading={loading}
            email={user?.username + "@gmail.com"}
          />
        </div>
        <div className="lg:flex-1">
          <ProfileDetails profile={profile} loading={loading} error={error} />
        </div>
      </div>
    </div>
  );
};

export default JobSeekerProfilePage;
