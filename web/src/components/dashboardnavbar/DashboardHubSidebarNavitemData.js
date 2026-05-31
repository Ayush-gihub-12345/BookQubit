import { 
  HiHome,           // Dashboard
  HiBookOpen,       // Book Management
  HiCollection,     // Comic Management
  HiUsers,          // User Management
  HiUserGroup,      // Author Management
  HiLibrary,        // Publication Management
  HiBell,           // Push Notifications
  HiPencilAlt,      // Blog Management
  HiDocumentText    // News Management
} from "react-icons/hi";

const navItems = [
  {
    title: "Dashboard",
    icon: HiHome,
    path: "/dashboardhub",
  },
  {
    title: "Book Management",
    icon: HiBookOpen,
    children: [
      { title: "Add Book", path: "/dashboardhub/books/add" },
      { title: "Book List", path: "/dashboardhub/books/list" },
      { title: "Edit Book", path: "/dashboardhub/books/edit" },
    ],
  },
  {
    title: "Comic Management",
    icon: HiCollection,
    children: [
      { title: "Add Comic", path: "/dashboardhub/comics/add" },
      { title: "Comic List", path: "/dashboardhub/comics/list" },
      { title: "Edit Comic", path: "/dashboardhub/comics/edit" },
    ],
  },
  {
    title: "User Management",
    icon: HiUsers,
    children: [
      { title: "All Users", path: "/dashboardhub/users" },
      { title: "Add User", path: "/dashboardhub/users/add" },
      { title: "User Profile", path: "/dashboardhub/users/profile" },
      { title: "Login History", path: "/dashboardhub/users/auth" },
    ],
  },
  {
    title: "Push Notifications",
    icon: HiBell,
    children: [
      { title: "Send Notification", path: "/dashboardhub/notifications/send" },
      { title: "Notification History", path: "/dashboardhub/notifications/history" },
    ],
  },
  {
    title: "Author Management",
    icon: HiUserGroup,
    children: [
      { title: "Add Author", path: "/dashboardhub/authors/add" },
      { title: "Author List", path: "/dashboardhub/authors/list" },
      { title: "Edit Author", path: "/dashboardhub/authors/edit" },
    ],
  },
  {
    title: "Publication Management",
    icon: HiLibrary,
    children: [
      { title: "Add Publication", path: "/dashboardhub/publications/add" },
      { title: "Publication List", path: "/dashboardhub/publications/list" },
      { title: "Edit Publication", path: "/dashboardhub/publications/edit" },
    ],
  },
  {
    title: "Blog Management",
    icon: HiPencilAlt,
    children: [
      { title: "Add Blog", path: "/dashboardhub/blogs/add" },
      { title: "Blog List", path: "/dashboardhub/blogs/list" },
      { title: "Edit Blog", path: "/dashboardhub/blogs/edit" },
    ],
  },
  {
    title: "News Management",
    icon: HiDocumentText,
    children: [
      { title: "Add News", path: "/dashboardhub/news/add" },
      { title: "News List", path: "/dashboardhub/news/list" },
      { title: "Edit News", path: "/dashboardhub/news/edit" },
    ],
  },
];

export default navItems;
