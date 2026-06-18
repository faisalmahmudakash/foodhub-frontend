import Link from "next/link";

export default function NotFound() {
  return (
    <section className="bg-white pb-10 pt-30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center">
          {/* GIF Background */}
          <div
            className="flex h-100 w-full max-w-4xl items-center justify-center bg-center bg-no-repeat z-10"
            style={{
              backgroundImage:
                "url('https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif')",
            }}
          >
            <h1 className="text-7xl font-bold md:text-8xl mb-95 z-20">404</h1>
          </div>

          {/* Content */}
          <div className="-mt-12">
            <h2 className="text-3xl font-bold">Looks like you're lost</h2>

            <p className="mt-3 text-gray-600">
              The page you are looking for is not available.
            </p>

            <Link
              href="/"
              className="mt-6 inline-block rounded-md bg-green-600 px-6 py-3 text-white transition-colors hover:bg-green-700"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
