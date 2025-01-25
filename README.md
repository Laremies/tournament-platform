
# Tournament Platform

*Tournament Platform* is a web application built with Next.js and Supabase, designed for hosting, spectating, and participating in tournaments. 


## Introduction
*Tournament Platform* provides organizers, participants, and spectators with tools to host and engage in tournaments across various games and sports. Key features include bracket generation, real-time match updates, integrated chat, and role-based access control. Whether for casual office competitions or structured gaming events, the platform simplifies tournament management and enhances the competitive experience.

The live application is hosted at: https://tournament-platform-demo.vercel.app



## Usage

1. **Sign Up/Log In**:
* Use Google OAuth or email/password to create an account.
2. **Create a Tournament**:
* Navigate to "Create Tournament" and fill in details (name, description, player limits, privacy settings).
3. **Join a Tournament**:
* Browse public tournaments or use an invite link for private events.
4. **Manage Matches**:
* Submit results, chat with opponents, and view updated brackets in real time.
5. **Spectate**: 
* Explore player profiles, tournament statistics, and live brackets without an account.



## Key Features

*Tournament Platform currently supports **single-elimination format tournaments**. Additional tournament types may be introduced in the future based on user demand and feedback.*

### For Organizers
- **Create and Manage Tournaments**: Set rules, formats, and privacy settings (public/private).
- **Real-Time Moderation**: Override match results, resolve disputes, and manage participant access.
- **Bracket Visualization**: Auto-generate single-elimination brackets with dynamic updates.

### For Participants
- **Join Tournaments**: Public or private (via invite links).
- **Submit Match Results**: Report outcomes directly through the platform.
- **Integrated Chat**: Coordinate with opponents via tournament-wide or private messaging.

### For Spectators
- **Track Progress**: View brackets, match results, and player statistics.
- **Real-Time Updates**: Stay informed as tournaments progress.

### General Features
- **User Profiles**: Customize avatars, bios, leave comments and view win/loss statistics.
- **Dark/Light Mode**: Toggle themes for optimal viewing.
- **Notifications**: Alerts for new matches, messages, and tournament updates.
- **Responsive Design**: Fully optimized for all devices, including desktops, tablets, and mobile phones. 
## Tech Stack

  - **Next.js**: React framework for server-side rendering and static site generation.
  - **Tailwind CSS & Shadcn/ui**: Styling and component library for a responsive UI.

  - **Supabase**: PostgreSQL database with real-time capabilities, authentication, and storage.
- **Vercel** for seamless deployment and continuous integration.

## Screenshots
<img src="https://github.com/user-attachments/assets/6cec9f52-c5f7-4218-943f-fe5db9510aaa" alt="tp3" width="600">


<img src="https://github.com/user-attachments/assets/39f71b8c-f05b-420b-8e87-35ce8af1fe02" alt="tp3" width="600">


<img src="https://github.com/user-attachments/assets/8ad9d262-db7d-4c32-963e-ead45c6fb17a" alt="tp3" width="600">




## FAQ

#### Can I host private tournaments?
Yes! Private tournaments require an invite link, and access requests must be approved by the organizer.

#### How do I report a bug?
Open an issue on the [GitHub repository](https://github.com/Laremies/tournament-platform/issues) with detailed steps to reproduce the bug.

#### Is this platform free to use?
Yes, Tournament Platform is free and open-source under the MIT License.
