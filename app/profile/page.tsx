import { loadProfile } from "@/lib/storage/local";
import ProfileEditor from "@/components/cv/ProfileEditor";

export default async function ProfilePage() {
  const profile = await loadProfile();

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900">Profile</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Review and edit your parsed CV profile. Changes are saved to local storage.
        </p>
      </div>

      <ProfileEditor initialProfile={profile} />
    </div>
  );
}
