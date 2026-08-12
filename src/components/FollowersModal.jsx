import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '../Services/FollowServices.js';
import { useTheme } from '../Contexts/ThemeContext.jsx';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../Contexts/AuthContext.jsx';
import fakeProfilePhoto from '../../public/FakeProfileImage.png';

function FollowerRow({ uId, defaultUser, themeColors, onClose }) {
  const navigate = useNavigate();
  const { userID } = useContext(AuthContext);

  const isPopulated = defaultUser && typeof defaultUser === 'object' && defaultUser.name;
  
  const { data, isLoading } = useQuery({
    queryKey: ['userProfile', uId],
    queryFn: () => getUserProfile(uId),
    enabled: !!uId && !isPopulated && typeof uId === 'string',
    staleTime: 1000 * 60 * 5,
  });

  const finalUser = isPopulated 
    ? defaultUser 
    : (data?.data?.data?.user || data?.data?.user || { _id: uId, name: 'Unknown', photo: fakeProfilePhoto });

  const uName = finalUser?.name || (isLoading ? 'Loading...' : 'Unknown');
  const uPhoto = finalUser?.photo || fakeProfilePhoto;

  return (
    <div
      className="flex items-center gap-3 cursor-pointer p-2 rounded-xl hover:bg-gray-50 transition-colors"
      onClick={() => {
        if (uId && typeof uId === 'string') {
          if (uId === userID) {
            navigate('/profile');
          } else {
            navigate(`/user/${uId}`);
          }
          onClose();
        }
      }}
    >
      <img
        src={uPhoto}
        alt={uName}
        className="w-12 h-12 rounded-full object-cover"
      />
      <div>
        <h4 className="font-semibold text-sm" style={{ color: themeColors.text }}>
          {uName}
        </h4>
      </div>
    </div>
  );
}

export default function FollowersModal({ isOpen, onClose, users, title }) {
  const { themeColors } = useTheme();

  if (!isOpen) return null;

  const [visibleCount, setVisibleCount] = React.useState(20);

  // Reset visible count when modal opens / title changes
  React.useEffect(() => {
    setVisibleCount(20);
  }, [isOpen, title]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-xl flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: themeColors.surface }}
      >
        <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: themeColors.primary + '20' }}>
          <h2 className="text-lg font-bold" style={{ color: themeColors.text }}>{title} ({users?.length || 0})</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <i className="fas fa-times" style={{ color: themeColors.textSecondary }}></i>
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {!users || users.length === 0 ? (
            <p className="text-center text-sm" style={{ color: themeColors.textSecondary }}>No users found.</p>
          ) : (
            <div className="space-y-4">
              {users.slice(0, visibleCount).map((user, idx) => {
                const uId = user?._id || user;
                return (
                  <FollowerRow
                    key={uId || idx}
                    uId={uId}
                    defaultUser={user}
                    themeColors={themeColors}
                    onClose={onClose}
                  />
                );
              })}
              {users.length > visibleCount && (
                <button
                  onClick={() => setVisibleCount((prev) => prev + 20)}
                  className="w-full py-2 mt-2 text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                  style={{ color: themeColors.primary }}
                >
                  Load More
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
