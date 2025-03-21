import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { StoreContext } from '../../Context/StoreContext';
import { Trophy, Award, Gift, Star, Clock, ShoppingBag, ArrowUp, Target, Shield, Heart, Medal, Sparkles } from 'lucide-react';
import StoreNavbar from '../StoreNavbar/StoreNavbar';

const ProfilePage = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { url } = useContext(StoreContext);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${url}/api/user/${userId}`);
        
        if (response.data.success) {
          setUser(response.data.user);
        } else {
          setError('Failed to load user data');
        }
      } catch (err) {
        setError(err.message || 'Error fetching user data');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId, url]);

  // Mock data for achievements and progress
  const achievements = [
    { id: 1, name: 'First Purchase', icon: <ShoppingBag size={24} />, completed: true, points: 50 },
    { id: 2, name: 'Adventure Seeker', icon: <Target size={24} />, completed: true, points: 100 },
    { id: 3, name: 'Safari Master', icon: <Shield size={24} />, completed: false, points: 200 },
    { id: 4, name: 'Wildlife Enthusiast', icon: <Heart size={24} />, completed: false, points: 150 },
    { id: 5, name: 'Jungle Explorer', icon: <Medal size={24} />, completed: true, points: 75 }
  ];

  const recentActivity = [
    { id: 1, activity: 'Completed Safari Tour', date: '2 days ago', points: 100 },
    { id: 2, activity: 'Purchased VR Experience', date: '1 week ago', points: 75 },
    { id: 3, activity: 'Left a review', date: '2 weeks ago', points: 25 }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Profile</h2>
          <p className="text-gray-700">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Calculate level based on points
  const calculateLevel = (points) => {
    return Math.floor(points / 100) + 1;
  };

  // Calculate progress to next level
  const calculateProgress = (points) => {
    const currentLevel = calculateLevel(points);
    const pointsForCurrentLevel = (currentLevel - 1) * 100;
    const progressPercentage = ((points - pointsForCurrentLevel) / 100) * 100;
    return progressPercentage;
  };

  const level = user?.points ? calculateLevel(user.points) : 1;
  const progress = user?.points ? calculateProgress(user.points) : 0;
  
  return (
    <>
    <StoreNavbar/>
    <div className="bg-gray-50 min-h-screen pt-20 pb-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-indigo-700 to-purple-700 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center text-indigo-800 text-4xl font-bold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-yellow-400 rounded-full p-2">
                  <Trophy size={18} className="text-indigo-900" />
                </div>
              </div>
              <div className="ml-4 text-white">
                <h1 className="text-2xl font-bold">{user?.name || "User"}</h1>
                <p className="text-indigo-200">{user?.email || "No email available"}</p>
                <div className="flex items-center mt-1">
                  <Medal size={16} className="text-yellow-400 mr-1" />
                  <span>Level {level} Explorer</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center md:items-end">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-2">
                <div className="flex items-center">
                  <Sparkles size={20} className="text-yellow-400 mr-2" />
                  <span className="text-xl font-bold text-white">{user?.points || 0}</span>
                  <span className="text-indigo-200 ml-2">Safari Points</span>
                </div>
              </div>
              <div className="w-full max-w-xs bg-white/10 rounded-full h-3">
                <div 
                  className="bg-yellow-400 h-3 rounded-full" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-indigo-200 text-sm mt-1">
                {100 - (progress % 100)} points to Level {level + 1}
              </p>
            </div>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex overflow-x-auto">
            <button 
              className={`px-4 py-3 font-medium text-sm flex-1 text-center ${activeTab === 'overview' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`px-4 py-3 font-medium text-sm flex-1 text-center ${activeTab === 'achievements' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('achievements')}
            >
              Achievements
            </button>
            <button 
              className={`px-4 py-3 font-medium text-sm flex-1 text-center ${activeTab === 'rewards' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('rewards')}
            >
              Rewards
            </button>
            <button 
              className={`px-4 py-3 font-medium text-sm flex-1 text-center ${activeTab === 'activity' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('activity')}
            >
              Activity
            </button>
          </div>
        </div>
        
        {/* Content Area */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <Trophy className="h-8 w-8 text-indigo-600 mr-3" />
                <h2 className="text-lg font-semibold text-gray-800">Your Level</h2>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-5xl font-bold text-indigo-700 mb-2">{level}</div>
                <p className="text-gray-600">Safari Explorer</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {100 - (progress % 100)} points to Level {level + 1}
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <Star className="h-8 w-8 text-yellow-500 mr-3" />
                <h2 className="text-lg font-semibold text-gray-800">Safari Points</h2>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-5xl font-bold text-yellow-500 mb-2">{user?.points || 0}</div>
                <p className="text-gray-600">Total Points Earned</p>
                <div className="flex items-center mt-4">
                  <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-500">+75 points</span>
                  <span className="text-gray-500 ml-2">this week</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <Award className="h-8 w-8 text-purple-600 mr-3" />
                <h2 className="text-lg font-semibold text-gray-800">Achievements</h2>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-5xl font-bold text-purple-600 mb-2">
                  {achievements.filter(a => a.completed).length}
                  <span className="text-gray-400 text-xl">/{achievements.length}</span>
                </div>
                <p className="text-gray-600">Completed</p>
                <button className="mt-4 px-4 py-2 bg-purple-100 text-purple-700 rounded-md text-sm font-medium hover:bg-purple-200">
                  View All
                </button>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="md:col-span-2 bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {recentActivity.map(activity => (
                  <div key={activity.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium text-gray-800">{activity.activity}</p>
                        <p className="text-sm text-gray-500">{activity.date}</p>
                      </div>
                      <div className="flex items-center text-green-600">
                        <span>+{activity.points}</span>
                        <Sparkles size={16} className="ml-1" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 text-center">
                <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                  View All Activity
                </button>
              </div>
            </div>
            
            {/* Available Rewards */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Available Rewards</h2>
              </div>
              <div className="p-6">
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg p-4 mb-4 shadow-sm">
                  <div className="flex items-center">
                    <Gift className="h-10 w-10 text-white p-2 bg-white/20 rounded-lg" />
                    <div className="ml-3">
                      <h3 className="text-white font-semibold">10% Discount</h3>
                      <p className="text-yellow-100 text-sm">on your next Safari</p>
                    </div>
                  </div>
                  <button className="w-full mt-3 py-2 bg-white text-yellow-700 rounded text-sm font-medium">
                    Redeem for 200 points
                  </button>
                </div>
                
                <div className="text-center">
                  <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                    View All Rewards
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'achievements' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Your Achievements</h2>
              <p className="text-gray-600">Complete challenges to earn Safari Points and unlock rewards</p>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map(achievement => (
                <div 
                  key={achievement.id} 
                  className={`p-4 border rounded-lg flex items-center ${achievement.completed ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'}`}
                >
                  <div className={`p-3 rounded-full mr-4 ${achievement.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{achievement.name}</h3>
                    <div className="flex items-center mt-1">
                      <Sparkles size={14} className={achievement.completed ? 'text-yellow-500' : 'text-gray-400'} />
                      <span className={`text-sm ml-1 ${achievement.completed ? 'text-yellow-600' : 'text-gray-500'}`}>
                        {achievement.points} points
                      </span>
                    </div>
                  </div>
                  {achievement.completed ? (
                    <div className="bg-green-600 text-white text-xs py-1 px-2 rounded">Completed</div>
                  ) : (
                    <div className="bg-gray-200 text-gray-600 text-xs py-1 px-2 rounded">In Progress</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'rewards' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Rewards Center</h2>
              <p className="text-gray-600">Redeem your Safari Points for exclusive rewards</p>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="h-40 bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center">
                  <Gift size={64} className="text-white" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800">10% Discount</h3>
                  <p className="text-sm text-gray-600 mb-4">Get 10% off on your next Safari adventure</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Sparkles size={16} className="text-yellow-500 mr-1" />
                      <span className="font-medium">200 points</span>
                    </div>
                    <button className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700">
                      Redeem
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="h-40 bg-gradient-to-r from-indigo-400 to-indigo-600 flex items-center justify-center">
                  <ShoppingBag size={64} className="text-white" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800">Free Safari Hat</h3>
                  <p className="text-sm text-gray-600 mb-4">Get a stylish Safari hat for your adventures</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Sparkles size={16} className="text-yellow-500 mr-1" />
                      <span className="font-medium">300 points</span>
                    </div>
                    <button className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700">
                      Redeem
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="h-40 bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center">
                  <Target size={64} className="text-white" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800">VR Experience</h3>
                  <p className="text-sm text-gray-600 mb-4">Free VR jungle experience session</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Sparkles size={16} className="text-yellow-500 mr-1" />
                      <span className="font-medium">500 points</span>
                    </div>
                    <button className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700">
                      Redeem
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'activity' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Activity History</h2>
              <p className="text-gray-600">Your recent actions and point earnings</p>
            </div>
            <div className="divide-y divide-gray-200">
              {[...recentActivity, 
                { id: 4, activity: 'Referred a friend', date: '3 weeks ago', points: 150 },
                { id: 5, activity: 'Completed Wildlife Quiz', date: '1 month ago', points: 75 },
                { id: 6, activity: 'First Safari Booking', date: '2 months ago', points: 200 }
              ].map(activity => (
                <div key={activity.id} className="p-6 hover:bg-gray-50">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start">
                      <div className="bg-indigo-100 p-2 rounded-full mr-4">
                        <Clock className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">{activity.activity}</h3>
                        <p className="text-sm text-gray-500">{activity.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center mt-2 md:mt-0">
                      <div className="bg-green-100 text-green-700 py-1 px-3 rounded-full flex items-center">
                        <Sparkles size={14} className="mr-1" />
                        <span>+{activity.points} points</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default ProfilePage;