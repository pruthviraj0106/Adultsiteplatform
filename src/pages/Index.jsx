import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button.tsx';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { useUser } from '../context/UserContext.jsx';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';

const Index = () => {
  const [collections, setCollections] = useState([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { login, user } = useUser();
  const navigate = useNavigate();

  const getTierLevel = (tier) => {
    switch (tier) {
      case 'BASIC':
        return 1;
      case 'MEDIUM':
        return 2;
      case 'HARDCORE':
        return 3;
      default:
        return 0;
    }
  };

  const filterCollectionsByTier = (collections) => {
    if (!user || !user.subscription_tier) {
      // If no user or no subscription, only show BASIC collections
      return collections.filter(c => c.tier === 'BASIC');
    }
    
    const userTierLevel = getTierLevel(user.subscription_tier);
    return collections.filter(c => getTierLevel(c.tier) <= userTierLevel);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [collectionsRes, plansRes, authRes] = await Promise.all([
          fetch('http://localhost:8080/collections'),
          fetch('http://localhost:8080/subscriptionplans'),
          fetch('http://localhost:8080/checkauth', { credentials: 'include' })
        ]);

        const collectionsData = await collectionsRes.json();
        const plansData = await plansRes.json();
        const authData = await authRes.json();

        if (!collectionsRes.ok) {
          throw new Error(collectionsData.message || 'Failed to fetch collections');
        }

        setCollections(collectionsData.collection);

        if (plansData.plans) {
          setSubscriptionPlans(plansData.plans);
        }

        if (authData.success) {
          // Set user data regardless of admin status
          login(authData.user);
        }
      } catch (err) {
        setError('Failed to load collections: ' + err.message);
        console.error('Error fetching collections:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // No cleanup needed for backend URLs
    return () => {};
  }, []); // Remove user?.subscription_tier dependency

  const handleCollectionClick = (collection) => {
    navigate(`/collection/${collection.id}`);
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'BASIC':
        return 'bg-blue-600';
      case 'MEDIUM':
        return 'bg-orange-600';
      case 'HARDCORE':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getContentColor = (tier) => {
    switch (tier) {
      case 'BASIC':
        return 'text-blue-400';
      case 'MEDIUM':
        return 'text-orange-400';
      case 'HARDCORE':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-2xl text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      {/* Header */}
      <header className="py-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-pink-400 mb-4">
          Welcome to Our Premium Content Platform
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Discover our exclusive collection of high-quality content, carefully curated for your entertainment.
        </p>
      </header>

      {/* Collections Grid */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8">Featured Collections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {collections.map((collection) => (
            <div 
              key={collection.id} 
              className="bg-gray-800 rounded-lg overflow-hidden shadow-lg cursor-pointer group"
              onClick={() => handleCollectionClick(collection)}
            >
              <div className="relative">
                <img
                  src={collection.thumbnail_url}
                  alt={collection.title}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 flex items-center justify-center">
                  <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
              <div className="p-4">
                <div className={`inline-block px-2 py-1 rounded text-xs font-bold text-white ${getTierColor(collection.tier)} mb-2`}>
                  {collection.tier}
                </div>
                <h3 className="text-xl font-bold mb-2">{collection.title}</h3>
                <p className="text-gray-400 mb-4 line-clamp-2">{collection.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-pink-500">{collection.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subscription Plans */}
      <section className="px-4 md:px-8 lg:px-16 mb-16">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-green-500">
            Subscription Plans
          </h2>
          <Link to="/billing">
            <Button className="bg-green-700 hover:bg-green-800 text-white">
              View All Plans
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-gray-900 rounded-lg p-6 transition-transform duration-300 flex flex-col ${
                plan.highlighted ? 'ring-2 ring-purple-500 shadow-lg shadow-purple-500/20' : ''
              }`}
            >
              <h3 className="text-2xl font-bold text-green-300 mb-8 text-center">
                {plan.title}
              </h3>
              <div className="text-center mb-12">
                <span className="text-3xl font-bold text-white">{plan.price}</span>
                {plan.period && <span className="text-gray-400">/{plan.period}</span>}
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features && plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-300">
                    <span className="text-green-400 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Button className="w-full bg-green-600 hover:bg-green-800 text-white mt-auto">
                {plan.period === 'Monthly' ? 'Subscribe Now' : 'Buy Now'}
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-8 px-4 md:px-8 lg:px-16">
        <div className="flex flex-wrap justify-center gap-6 mb-6 text-sm text-gray-400">
          <a href="#" className="hover:text-purple-400 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-purple-400 transition-colors">Support</a>
          <a href="#" className="hover:text-purple-400 transition-colors">DMCA</a>
          <a href="#" className="hover:text-purple-400 transition-colors">2257 Statement</a>
        </div>
        <div className="text-center text-gray-500 text-sm">
          © 2025 Adult Content Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Index;
