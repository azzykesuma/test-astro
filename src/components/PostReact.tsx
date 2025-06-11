export interface DataPlaceholder {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

const PostReact = async () => {
  const postLists = await fetch(
    "https://jsonplaceholder.typicode.com/posts"
  ).then((res) => res.json());


  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8 font-inter">
        Blog Posts
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {postLists.map((post: DataPlaceholder) => (
          <div
            key={post.id}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2 font-inter">
                {post.title}
              </h2>
              {/* Optional: Add more details if the API provided them, like userId or a body */}
              <p className="text-sm text-gray-600">Post ID: {post.id}</p>
              <p className="text-sm text-gray-600">User ID: {post.userId}</p>
            </div>
            {/* A simple divider for visual separation */}
            <div className="bg-gray-100 px-6 py-3 text-right text-gray-500 text-xs rounded-b-xl">
              jsonplaceholder.typicode.com
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostReact;
