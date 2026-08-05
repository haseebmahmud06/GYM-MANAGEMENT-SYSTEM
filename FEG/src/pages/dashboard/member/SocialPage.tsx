/**
 * Social / Community page - share completed workouts, like and comment on
 * posts, view activity, leaderboard, and generate shareable workout cards.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, MessageCircle, Share2, Download, Trophy, Award, Flame, CalendarCheck, Users,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  usePosts, useLikePost, useAddComment, useCreatePost, useDeletePost, useWorkouts,
} from '@/hooks/useWorkouts';
import { useShareCard } from '@/hooks/useShareCard';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';
import type { WorkoutPost, WorkoutPostComment } from '@/types';

export default function SocialPage() {
  const { user } = useAuthStore();
  const { data: postsData, isLoading } = usePosts();
  const { data: workoutsData } = useWorkouts({ status: 'completed' });
  const likePost = useLikePost();
  const addComment = useAddComment();
  const createPost = useCreatePost();
  const deletePost = useDeletePost();
  const { downloadCard } = useShareCard();

  const posts = postsData?.data?.results ?? [];
  const completedWorkouts = workoutsData?.data?.results ?? [];

  const [shareOpen, setShareOpen] = useState(false);
  const [shareWorkout, setShareWorkout] = useState('');
  const [caption, setCaption] = useState('');
  const [commentsOpen, setCommentsOpen] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commentPost, setCommentPost] = useState<number | null>(null);

  const userName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email || 'Member';
  const userId = user?.id;

  const openShare = () => {
    setShareOpen(true);
    setShareWorkout(completedWorkouts[0]?.id ? String(completedWorkouts[0].id) : '');
    setCaption('');
  };

  const submitShare = () => {
    const w = completedWorkouts.find((x) => x.id === Number(shareWorkout));
    if (!w) { toast.error('Select a workout to share'); return; }
    createPost.mutate(
      { workout: w.id, caption, is_public: true },
      { onSuccess: () => { setShareOpen(false); toast.success('Workout shared!'); } }
    );
  };

  const handleDownload = async (post: WorkoutPost) => {
    // Fetch the full workout for accurate data.
    const full = completedWorkouts.find((w) => w.id === post.workout) ?? null;
    if (!full) { toast.error('Workout data not available'); return; }
    await downloadCard(full, post.user_name || userName);
  };

  const submitComment = (postId: number) => {
    if (!commentText.trim()) return;
    addComment.mutate({ id: postId, text: commentText.trim() });
    setCommentText('');
  };

  // Simple leaderboard derived from post like counts (+ volume of shared workouts).
  const leaderboard = [...posts]
    .reduce<Record<number, { name: string; likes: number; count: number }>>((acc, p) => {
      const key = p.user;
      if (!acc[key]) acc[key] = { name: p.user_name || 'Member', likes: 0, count: 0 };
      acc[key].likes += p.like_count;
      acc[key].count += 1;
      return acc;
    }, {});
  const leaderboardRows = Object.values(leaderboard).sort((a, b) => b.likes - a.likes).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-charcoal-900 dark:text-white">Community</h2>
          <p className="text-charcoal-500 dark:text-charcoal-400 mt-1">
            Share your workouts, celebrate achievements, compare with friends
          </p>
        </div>
        <Button onClick={openShare}><Share2 className="h-4 w-4 mr-2" /> Share Workout</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Posts feed */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48" />)}</div>
          ) : posts.length === 0 ? (
            <Card><CardContent className="p-12 text-center text-charcoal-500">
              <Users className="h-12 w-12 mx-auto mb-3 text-charcoal-300" />
              <p className="font-medium">No workout posts yet</p>
              <p className="text-sm mt-1">Share your first workout to get started.</p>
            </CardContent></Card>
          ) : (
            <AnimatePresence>
              {posts.map((post) => (
                <motion.div key={post.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <Card>
                    <CardContent className="p-5">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 font-bold">
                            {(post.user_name || '?')[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-charcoal-900 dark:text-white">{post.user_name || 'Member'}</p>
                            <p className="text-xs text-charcoal-500">{new Date(post.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        {post.user === userId && (
                          <Button variant="ghost" size="sm" onClick={() => deletePost.mutate(post.id)}>Delete</Button>
                        )}
                      </div>

                      {/* Body */}
                      <div className="mt-3 rounded-lg bg-charcoal-50 p-4 dark:bg-charcoal-800/50">
                        <p className="font-semibold text-charcoal-900 dark:text-white">{post.workout_name}</p>
                        <p className="text-sm text-charcoal-500">Total volume: {Math.round(post.workout_volume)} kg</p>
                      </div>
                      {post.caption && <p className="mt-3 text-charcoal-700 dark:text-charcoal-300">{post.caption}</p>}

                      {/* Actions */}
                      <div className="mt-4 flex items-center gap-4 border-t border-charcoal-100 pt-3 dark:border-charcoal-800">
                        <button
                          onClick={() => likePost.mutate(post.id)}
                          className={`flex items-center gap-1.5 text-sm ${post.liked_by_me ? 'text-rose-500' : 'text-charcoal-500 hover:text-rose-500'}`}
                        >
                          <Heart className={`h-4 w-4 ${post.liked_by_me ? 'fill-current' : ''}`} /> {post.like_count}
                        </button>
                        <button
                          onClick={() => setCommentsOpen(commentsOpen === post.id ? null : post.id)}
                          className="flex items-center gap-1.5 text-sm text-charcoal-500 hover:text-primary-600"
                        >
                          <MessageCircle className="h-4 w-4" /> {post.comments?.length ?? 0}
                        </button>
                        <button onClick={() => handleDownload(post)} className="flex items-center gap-1.5 text-sm text-charcoal-500 hover:text-primary-600 ml-auto">
                          <Download className="h-4 w-4" /> Save card
                        </button>
                      </div>

                      {/* Comments */}
                      {commentsOpen === post.id && (
                        <div className="mt-3 space-y-2">
                          {(post.comments ?? []).map((c: WorkoutPostComment) => (
                            <div key={c.id} className="flex gap-2 rounded-lg bg-charcoal-50 p-2 dark:bg-charcoal-800/50">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                                {(c.user_name || '?')[0]?.toUpperCase()}
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-charcoal-900 dark:text-white">{c.user_name}</p>
                                <p className="text-sm text-charcoal-600 dark:text-charcoal-300">{c.text}</p>
                              </div>
                            </div>
                          ))}
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add a comment..."
                              value={commentPost === post.id ? commentText : ''}
                              onChange={(e) => { setCommentPost(post.id); setCommentText(e.target.value); }}
                              onKeyDown={(e) => { if (e.key === 'Enter') submitComment(post.id); }}
                            />
                            <Button size="sm" onClick={() => submitComment(post.id)}>Post</Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Leaderboard */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold flex items-center gap-2 text-charcoal-900 dark:text-white">
                <Trophy className="h-5 w-5 text-amber-500" /> Leaderboard
              </h3>
              <div className="mt-4 space-y-3">
                {leaderboardRows.map((r, i) => (
                  <div key={r.name + i} className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-charcoal-100 text-charcoal-700' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-charcoal-50 text-charcoal-500'}`}>
                      {i + 1}
                    </div>
                    <span className="flex-1 font-medium text-charcoal-900 dark:text-white">{r.name}</span>
                    <span className="text-sm text-charcoal-500 flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5 text-rose-500 fill-current" /> {r.likes}
                    </span>
                  </div>
                ))}
                {leaderboardRows.length === 0 && <p className="text-sm text-charcoal-500">No rankings yet.</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold flex items-center gap-2 text-charcoal-900 dark:text-white">
                <Award className="h-5 w-5 text-primary-600" /> Your achievements
              </h3>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm"><Flame className="h-4 w-4 text-orange-500" /> <span>Share workouts to earn badges</span></div>
                <div className="flex items-center gap-2 text-sm"><CalendarCheck className="h-4 w-4 text-blue-500" /> <span>Post shared: {posts.filter((p) => p.user === userId).length}</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Share dialog */}
      <div className={`fixed inset-0 z-50 ${shareOpen ? 'flex' : 'hidden'} items-center justify-center bg-black/60 p-4`} onClick={() => setShareOpen(false)}>
        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-charcoal-900" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-lg font-bold text-charcoal-900 dark:text-white">Share a workout</h3>
          <p className="text-sm text-charcoal-500 mt-1">Pick a completed workout to share with the community.</p>
          <div className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Workout</label>
              <Select value={shareWorkout} onValueChange={setShareWorkout}>
                <SelectTrigger><SelectValue placeholder="Select workout" /></SelectTrigger>
                <SelectContent>
                  {completedWorkouts.map((w) => <SelectItem key={w.id} value={String(w.id)}>{w.name} · {Math.round(w.total_volume)}kg</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Caption</label>
              <Textarea rows={3} value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="What did you accomplish?" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShareOpen(false)}>Cancel</Button>
              <Button onClick={submitShare} isLoading={createPost.isPending}>Share</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
