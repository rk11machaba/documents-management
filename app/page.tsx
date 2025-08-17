import Documents from '@/components/documents'
import AddDoc from '@/components/add_document';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            MyDocs
          </h1>
          <p className="text-xl text-gray-300">
            Manage, convert, and organize your documents with ease
          </p>
        </header>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <Documents />
          </div>
          <div className="lg:col-span-1">
            <AddDoc />
          </div>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center">
            <div className="text-4xl mb-3">📁</div>
            <h3 className="text-lg font-semibold text-white mb-2">Store Documents</h3>
            <p className="text-gray-300 text-sm">Upload and organize all your important files in one place</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center">
            <div className="text-4xl mb-3">🔄</div>
            <h3 className="text-lg font-semibold text-white mb-2">Convert to PDF</h3>
            <p className="text-gray-300 text-sm">Convert Word documents and text files to PDF instantly</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-lg font-semibold text-white mb-2">Quick Search</h3>
            <p className="text-gray-300 text-sm">Find your documents quickly with instant search</p>
          </div>
        </div>
      </div>
    </main>
  );
}