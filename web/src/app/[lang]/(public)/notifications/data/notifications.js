export const allNotifications = [
  {
    id: 1,
    slug: "someone-liked-your-review",
    type: "like",
    title: "Someone liked your review",
    message: "Priyal Shrivastava liked your review on 'The Great Gatsby'",
    time: "5 minutes ago",
    read: false,
    link: "/books/the-great-gatsby",
  },
  {
    id: 2,
    slug: "new-comment-on-your-post",
    type: "comment",
    title: "New comment on your post",
    message: "Sachin commented on your book review",
    time: "1 hour ago",
    read: false,
    link: "/books/atomic-habits",
  },
  {
    id: 3,
    slug: "new-follower-rahul",
    type: "follow",
    title: "New follower",
    message: "Rahul Sharma started following you",
    time: "3 hours ago",
    read: true,
    link: "/profile/rahul",
  },
  {
    id: 4,
    slug: "book-saved-to-your-list",
    type: "bookmark",
    title: "Book saved to your list",
    message: "Your book 'Atomic Habits' has been saved by 50 users",
    time: "Yesterday",
    read: true,
    link: "/books/atomic-habits",
  },
  {
    id: 5,
    slug: "someone-liked-your-comment",
    type: "like",
    title: "Someone liked your comment",
    message: "Amit Kumar liked your comment on 'Deep Work'",
    time: "2 days ago",
    read: true,
    link: "/books/deep-work",
  },
  {
    id: 6,
    slug: "new-follower-neha",
    type: "follow",
    title: "New follower",
    message: "Neha Gupta started following you",
    time: "3 days ago",
    read: true,
    link: "/profile/neha",
  },
];

/**
 * Helper to look up a single notification matching a dynamic route parameter slug.
 * @param {string} slug 
 * @returns {object|undefined}
 */
export function getNotificationBySlug(slug) {
  return allNotifications.find((n) => n.slug === slug);
}