import React from "react";
import ProfileDetails from "../components/ProfileDetails";
import ProfileOverview from "../components/ProfileOverview";
import { useJobSeekerProfile } from "../hooks/useJobSeekerProfile";
import { useAuth } from "../../auth/hooks";

const JobSeekerProfilePage: React.FC = () => {
  const { profile, loading, error } = useJobSeekerProfile();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-500">
        <div className="max-w-5xl mx-auto px-6 h-48 flex flex-col justify-end pb-6 text-white">
          <h1 className="text-3xl font-bold">Hồ sơ ứng viên</h1>
          <p className="text-white/80">{user?.username}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-16 pb-10 flex flex-col gap-6 lg:flex-row">
        <div className="lg:w-1/3">
          <ProfileOverview
            profile={profile}
            loading={loading}
            email={user?.username ? `${user.username}@gmail.com` : undefined}
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
