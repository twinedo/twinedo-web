import Link from "next/link";

export function Hero() {
  return (
    <div className="w-full bg-gradient-to-br from-blue-900/0 via-blue-900/0 to-blue-900/30">
      {/* <div className="w-full min-w-0"> Constrains children */}
        <div className="w-full min-w-0 h-screen flex items-center justify-center px-4">
          <div className="w-full max-w-4xl mx-auto text-center">
            <div className="flex flex-col items-center space-y-10">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight w-full">
                HEY, I`M TWIN EDO NUGRAHA
              </h1>
              <p className="text-lg max-w-2xl">
                A Frontend building the Frontend of Web Applications and Mobile Applications
              </p>
              <Link 
                href="/projects" 
                className="inline-block" // Ensures button doesn't stretch
              >
                <div className="
                  bg-black 
                  px-5 py-2.5 
                  rounded-lg 
                  cursor-pointer 
                  hover:shadow-[0_20px_30px_-10px_rgba(38,57,77,1)]
                  transition-shadow
                ">
                  <span className="text-white text-lg">PROJECTS</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      {/* </div> */}
    </div>
  );
}