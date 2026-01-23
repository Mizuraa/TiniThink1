export default function Home() {
  return (
    <div className="w-full flex items-start justify-center">
      <div className="w-full max-w-xl lg:max-w-3xl">
        <h1 className="text-3xl font-bold text-[#00ffff] mb-3">Dashboard</h1>
        <p className="text-gray-300 mb-6">Quick actions and recent games.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-white/5 rounded">Recent 1</div>
          <div className="p-4 bg-white/5 rounded">Recent 2</div>
          <div className="p-4 bg-white/5 rounded">Recent 3</div>
        </div>
      </div>
    </div>
  );
}
