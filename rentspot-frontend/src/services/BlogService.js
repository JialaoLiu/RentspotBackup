// Mock data for blogs
const mockBlogs = [
  {
    id: 1,
    username: "Lê Huỳnh My Na",
    date: "5 tháng 5 lúc 18:51",
    caption: "cổ kiểu 🙂",
    images: [
      "https://picsum.photos/300/200?random=201",
      "https://picsum.photos/300/200?random=202",
      "https://picsum.photos/300/200?random=203"
    ]
  },
  {
    id: 2,
    username: "Nguyễn Văn A",
    date: "6 tháng 5 lúc 10:25",
    caption: "Một ngày thật đẹp trời!",
    images: [
      "https://picsum.photos/300/200?random=204",
      "https://picsum.photos/300/200?random=205"
    ]
  },
  {
    id: 3,
    username: "Trần Thị B",
    date: "7 tháng 5 lúc 14:15",
    caption: "Check out this amazing view!",
    images: [
      "https://picsum.photos/300/200?random=206"
    ]
  }
];

// Fetch all blogs
export function fetchBlogs() {
  return Promise.resolve(mockBlogs);
}

// Fetch a single blog by ID
export function getBlogById(id) {
  const blog = mockBlogs.find((b) => b.id === parseInt(id, 10));
  return Promise.resolve(blog || null);
}
