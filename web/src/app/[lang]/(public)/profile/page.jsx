import ProfilePage from "@/features/profile/profile.jsx";

export async function generateMetadata({ params }) {
  const lang = params?.lang || "en";
  
  return {
    title: lang === 'ur' ? 'میرا پروفائل' : 'My Profile | BookQubit',
    description: 'View and manage your profile, track reading progress and achievements',
  };
}

export default function Profile() {
  return <ProfilePage />;
}