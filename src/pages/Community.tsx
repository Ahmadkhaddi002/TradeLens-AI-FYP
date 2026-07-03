import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/GlassCard';
import { useMT5 } from '@/context/MT5Context';
import { useAuth } from '@/context/AuthContext';
import { Heart, MessageCircle, Share2, Bookmark, Image, TrendingUp, Users, Hash, Send, Loader2, MessageSquare } from 'lucide-react';

interface PostTrade {
  pair: string;
  type: string;
  pnl: number;
  rr: string;
}

interface Post {
  id: number;
  author: string;
  avatar: string;
  time: string;
  content: string;
  trade: PostTrade | null;
  likes: number;
  comments: number;
  liked: boolean;
}

interface TrendingTrader {
  name: string;
  followers: number;
  avatar: string;
}

const hotTopics = ['#EURUSD', '#Gold', '#Psychology', '#AIcoach', '#LondonSession', '#RiskManagement'];

export default function Community() {
  const { account, trades } = useMT5();
  const { user: authUser } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [trendingTraders, setTrendingTraders] = useState<TrendingTrader[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [postsRes, trendingRes] = await Promise.all([
        fetch('/api/community/posts'),
        fetch('/api/community/trending'),
      ]);
      if (postsRes.ok) setPosts(await postsRes.json());
      if (trendingRes.ok) setTrendingTraders(await trendingRes.json());
    } catch {
      // server unavailable
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePost = async () => {
    if (!newPost.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: account?.name || authUser?.name || 'Trader',
          authorEmail: authUser?.email || null,
          content: newPost.trim(),
        }),
      });
      if (res.ok) {
        setNewPost('');
        await fetchData();
      }
    } catch {
      // server unavailable
    } finally {
      setSubmitting(false);
    }
  };

  const toggleLike = (id: number) => {
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p));
  };

  const userInitials = account?.name?.slice(0, 2).toUpperCase() || 'TK';
  const totalTrades = trades.length;
  const wins = trades.filter((t) => t.profit > 0).length;
  const userWinRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0;
  const totalPnl = trades.reduce((sum, t) => sum + t.profit, 0);

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <GlassCard><div className="text-center py-12 text-[#64748b] text-sm">Loading community...</div></GlassCard>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-5">
          {/* Post Composer */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <GlassCard>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#06b6d4] to-[#8b5cf6] flex items-center justify-center text-sm font-semibold text-white flex-shrink-0">
                  {userInitials}
                </div>
                <div className="flex-1">
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="Share a trade idea, insight, or question..."
                    className="w-full bg-[#1a1a24] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-3 text-sm text-[#f8fafc] placeholder-[#64748b] outline-none focus:border-[#06b6d4] resize-none min-h-[80px] transition-colors"
                  />
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <button className="p-2 rounded-lg text-[#64748b] hover:text-[#f8fafc] hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                        <Image size={16} />
                      </button>
                    </div>
                    <button
                      onClick={handlePost}
                      disabled={!newPost.trim() || submitting}
                      className="px-4 py-2 bg-[#06b6d4] text-[#050507] rounded-lg text-sm font-medium hover:bg-[#22d3ee] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Posts */}
          {posts.length === 0 && (
            <GlassCard>
              <div className="text-center py-10">
                <MessageSquare size={32} className="mx-auto text-[#64748b] mb-3" />
                <div className="text-sm text-[#64748b]">No posts yet. Be the first to share!</div>
              </div>
            </GlassCard>
          )}
          {posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              <GlassCard>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#06b6d4] to-[#8b5cf6] flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
                    {post.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-[#f8fafc]">{post.author}</span>
                      <span className="text-xs text-[#64748b]">{post.time}</span>
                      <button className="ml-auto text-xs px-3 py-1 border border-[rgba(255,255,255,0.1)] rounded-full text-[#94a3b8] hover:text-[#f8fafc] hover:border-[rgba(255,255,255,0.2)] transition-colors">
                        Follow
                      </button>
                    </div>
                    <p className="text-sm text-[#94a3b8] leading-relaxed">{post.content}</p>

                    {post.trade && (
                      <div className="mt-3 p-3 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-[#f8fafc]">{post.trade.pair}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${post.trade.type === 'Buy' ? 'bg-[rgba(34,197,94,0.1)] text-[#22c55e]' : 'bg-[rgba(239,68,68,0.1)] text-[#ef4444]'}`}>
                              {post.trade.type}
                            </span>
                            <span className="text-xs text-[#64748b] font-mono">{post.trade.rr}</span>
                          </div>
                          <span className="text-sm font-mono font-medium text-[#22c55e]">+${post.trade.pnl}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-1 mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)]">
                      <button
                        onClick={() => toggleLike(post.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${post.liked ? 'text-[#ef4444]' : 'text-[#64748b] hover:text-[#f8fafc]'}`}
                      >
                        <Heart size={14} className={post.liked ? 'fill-[#ef4444]' : ''} /> {post.likes}
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#64748b] hover:text-[#f8fafc] transition-colors">
                        <MessageCircle size={14} /> {post.comments}
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#64748b] hover:text-[#f8fafc] transition-colors">
                        <Share2 size={14} /> Share
                      </button>
                      <button className="ml-auto p-1.5 rounded-lg text-[#64748b] hover:text-[#f8fafc] transition-colors">
                        <Bookmark size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-5">
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
            <GlassCard>
              <div className="flex items-center gap-2 mb-4">
                <Users size={16} className="text-[#06b6d4]" />
                <h3 className="text-sm font-semibold text-[#f8fafc]">Your Stats</h3>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#06b6d4] to-[#8b5cf6] flex items-center justify-center text-sm font-semibold text-white">
                  {userInitials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#f8fafc]">{account?.name || 'Trader'}</div>
                  <div className="text-xs text-[#64748b]">{account?.login || 'Guest'}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-[rgba(255,255,255,0.02)] rounded-lg">
                  <div className="text-base font-bold text-[#f8fafc]">{totalTrades}</div>
                  <div className="text-xs text-[#64748b]">Trades</div>
                </div>
                <div className="p-2 bg-[rgba(255,255,255,0.02)] rounded-lg">
                  <div className="text-base font-bold text-[#22c55e]">{userWinRate}%</div>
                  <div className="text-xs text-[#64748b]">Win Rate</div>
                </div>
                <div className="p-2 bg-[rgba(255,255,255,0.02)] rounded-lg">
                  <div className={`text-base font-bold ${totalPnl >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                    {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(0)}
                  </div>
                  <div className="text-xs text-[#64748b]">P&L</div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
            <GlassCard>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} className="text-[#06b6d4]" />
                <h3 className="text-sm font-semibold text-[#f8fafc]">Trending Traders</h3>
              </div>
              <div className="space-y-3">
                {trendingTraders.length === 0 ? (
                  <div className="text-xs text-[#64748b] text-center py-4">No trending traders yet. Be the first!</div>
                ) : (
                  trendingTraders.map((t) => (
                    <div key={t.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#06b6d4] to-[#8b5cf6] flex items-center justify-center text-xs font-semibold text-white">
                        {t.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-[#f8fafc] truncate">{t.name}</div>
                        <div className="text-xs text-[#64748b]">{t.followers.toLocaleString()} followers</div>
                      </div>
                      <button className="text-xs px-3 py-1 border border-[rgba(255,255,255,0.1)] rounded-full text-[#94a3b8] hover:text-[#f8fafc] hover:border-[rgba(255,255,255,0.2)] transition-colors">
                        Follow
                      </button>
                    </div>
                  ))
                )}
              </div>
            </GlassCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
            <GlassCard>
              <div className="flex items-center gap-2 mb-4">
                <Hash size={16} className="text-[#06b6d4]" />
                <h3 className="text-sm font-semibold text-[#f8fafc]">Hot Topics</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {hotTopics.map((topic) => (
                  <button key={topic} className="px-3 py-1.5 text-xs bg-[rgba(6,182,212,0.1)] text-[#06b6d4] rounded-full hover:bg-[rgba(6,182,212,0.2)] hover:scale-105 transition-all">
                    {topic}
                  </button>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.35 }}>
            <GlassCard>
              <div className="flex items-center gap-2 mb-3">
                <Users size={16} className="text-[#06b6d4]" />
                <h3 className="text-sm font-semibold text-[#f8fafc]">Community</h3>
              </div>
              <div className="text-2xl font-bold text-[#f8fafc]">{posts.length > 0 ? Math.max(posts.length, 1) : 0}</div>
              <div className="text-xs text-[#94a3b8]">posts shared</div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}