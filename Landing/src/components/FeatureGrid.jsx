import { CheckIcon } from '@heroicons/react/outline'

const features = [
  {
    name: 'Player Registration',
    description: 'Register players seamlessly for upcoming golf tournaments. Collect necessary information and fees.'
  },
  {
    name: 'Tee Time Notifications',
    description: 'Send timely notifications to participants about their tee times, ensuring smooth scheduling.'
  },
  {
    name: 'Scorecard Management',
    description: 'Efficiently manage and update digital scorecards for all players during the tournament.'
  },
  {
    name: 'Leaderboards',
    description: 'Display real-time leaderboards to track player standings and tournament progress.'
  },
  {
    name: 'Handicap Calculation',
    description: 'Automate handicap calculations for fair and competitive tournament scoring.'
  },
  {
    name: 'Reporting & Analytics',
    description: 'Generate comprehensive reports and analytics to assess tournament performance.'
  },
  {
    name: 'Event Calendars',
    description: 'Maintain event calendars to showcase upcoming tournaments and important dates.'
  },
  {
    name: 'Mobile Accessibility',
    description: 'Access the tournament management system on the go with a dedicated mobile app.'
  },
];

export default function FeatureGrid() {
  return (
    <div className="bg-white" id="features">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-24 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">All-in-one platform</h2>
          <p className="mt-4 text-lg text-gray-500">
            Accessible platform providing seamless player registration, scorecard management, leaderboards, and more for golf tournaments.
          </p>
        </div>
        <dl className="mt-12 space-y-10 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-4 lg:gap-x-8">
          {features.map((feature) => (
            <div key={feature.name} className="relative">
              <dt>
                <CheckIcon className="absolute h-6 w-6 text-green-500" aria-hidden="true" />
                <p className="ml-9 text-lg leading-6 font-medium text-gray-900">{feature.name}</p>
              </dt>
              <dd className="mt-2 ml-9 text-base text-gray-500">{feature.description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
