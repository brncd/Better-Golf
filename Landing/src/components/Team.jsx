const people = [
  {
    name: "Darian Grabino",
    role: "Project Manager",
    role2: "Backend Developer",
    imageUrl: "https://avatars.githubusercontent.com/u/113607653?v=4",
    githubUrl: "https://github.com/DarianGrabino",
    linkedinUrl: "https://www.linkedin.com/in/darian-grabino",
  },
  {
    name: "Johana Amorín",
    role: "Backend Developer",
    role2: "",
    imageUrl: "https://avatars.githubusercontent.com/u/113919575?v=4",
    githubUrl: "https://github.com/joy-amorin",
    linkedinUrl: "https://www.linkedin.com/in/johana-amorin-bb7992287?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",  },
  {
    name: "Martín Correa",
    role: "Frontend Developer",
    role2: "",
    imageUrl: "https://avatars.githubusercontent.com/u/113598493?v=4",  
    githubUrl: "https://github.com/EliasMartincorre",
    linkedinUrl: "http://www.linkedin.com/in/martin-correa-poggio",
  },
  {
    name: "Bruno Carnales",
    role: "Frontend Developer",
    role2: "DevOps Engineer",
    imageUrl: "https://avatars.githubusercontent.com/u/37399964?v=4",
    githubUrl: "https://github.com/brncd",
    linkedinUrl: "https://www.linkedin.com/in/brunocarnales?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
  },
];

export default function Team() {
  return (
    <div className="bg-gray-900" id="team">
      <div className="mx-auto py-12 px-4 max-w-7xl sm:px-6 lg:px-8 lg:py-24">
        <div className="space-y-12">
          <div className="space-y-5 sm:space-y-4 md:max-w-xl lg:max-w-3xl xl:max-w-none">
            <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              Meet our team
            </h2>
            <p className="text-xl text-gray-300">
              Our passionate team of emerging developers eager to showcase their evolving skills. Enthusiastic about learning and driven by curiosity, we bring a fresh perspective to crafting innovative solutions. Join us as we strive to contribute, grow, and make an impact in the world of technology.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 lg:gap-8">
            {people.map((person) => (
              <div
                key={person.name}
                className="py-10 px-6 bg-gray-800 text-center rounded-lg"
              >
                <div className="space-y-6">
                  <img
                    className="mx-auto h-32 w-32 rounded-full xl:h-40 xl:w-40"
                    src={person.imageUrl}
                    alt=""
                  />
                  <div className="space-y-2 xl:flex xl:flex-col xl:items-center xl:justify-center">
                    <div className="font-medium text-lg leading-6 space-y-1">
                      <h3 className="text-white">{person.name}</h3>
                      <p className="text-indigo-400">{person.role}</p>
                      {person.role2 && (
                        <p className="text-indigo-400">{person.role2}</p>
                      )}
                    </div>
                    <div className="mt-auto flex justify-center space-x-5">
                      <a
                        href={person.linkedinUrl}
                        className="text-gray-400 hover:text-gray-300"
                        target="_blank"
                      >
                        <span className="sr-only">LinkedIn</span>
                        <svg
                          className="w-5 h-5"
                          aria-hidden="true"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </a>
                      <a
                        href={person.githubUrl}
                        className="text-gray-400 hover:text-gray-300"
                        target="_blank"
                      >
                        <span className="sr-only">GitHub</span>
                        <svg
                          className="w-5 h-5"
                          aria-hidden="true"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 1.667a8.333 8.333 0 00-2.63 16.263c.417.077.57-.18.57-.4 0-.197-.007-.717-.01-1.407-2.317.503-2.805-1.12-2.805-1.12-.378-.96-.924-1.215-.924-1.215-.755-.515.057-.505.057-.505.836.058 1.275.86 1.275.86.743 1.27 1.948.903 2.422.69.075-.538.29-.903.527-1.11-1.846-.21-3.794-.923-3.794-4.103 0-.906.324-1.647.856-2.23-.086-.21-.37-1.057.082-2.203 0 0 .7-.224 2.3.853.668-.186 1.384-.278 2.098-.282.714.004 1.43.096 2.098.282 1.6-1.077 2.297-.853 2.297-.853.454 1.146.17 1.993.084 2.203.532.583.853 1.324.853 2.23 0 3.19-1.95 3.89-3.8 4.095.3.256.567.76.567 1.535 0 1.11-.01 2.007-.01 2.277 0 .222.15.48.575.398A8.333 8.333 0 0010 1.667z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
