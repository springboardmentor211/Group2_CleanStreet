1. CleanStreet - Civic Issue Reporting & Tracking App :- </br>
CleanStreet is a centralized platform designed to empower citizens to report civic issues and track their resolution in real-time.</br>
----------------------------------------------------------------------------------------------------------------------------------------------------------------------
2. Installation & Setup Guide :- To ensure the project runs correctly on your local machine, please follow these steps precisely:-</br>
#. Clone the Repository</br>
a. Open this repo:- [https://github.com/springboardmentor211/Group2_CleanStreet]</br>
b. click on:- code -> open with github desktop(github desktop should be installed to your local machine) -> open with vs code</br>
c. Install Dependencies (Crucial Step) :- Since the project is divided into a Frontend and a Backend, you must install dependencies for both directories separately.</br>
   open terminal:- Run these command one by one (1) cd.. (2) cd backend (3) npm install </br>
   open another terminal by clicking + icon in your existing terminal:- Run these command one by one (1) cd.. (2) cd frontend (3) npm install</br>
d. Environment Configuration :- Navigate to the backend directory and create a .env file. Populate it with your database credentials and environment variables as specified                                 in the .env.example file.</br>
e. Run the Application :- It is recommended to open three separate terminals in VS Code to monitor the logs efficiently:</br>
    Terminal 1 (Backend Server): Navigate to backend and run this command - npm run dev.</br>
    Terminal 2 (Frontend Client): Navigate to frontend and run this command - npm run dev.</br>
  Terminal 3 (Git Operations): Use this terminal for version control and branch management.</br>
f. click on :- link that link in terminal :-  Local:   http://localhost:3000/</br>
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
3. Contribution Workflow :- To maintain a clean codebase and avoid merge conflicts, please adhere to the following workflow:</br>
                            Create a dedicated branch for your work: git checkout -b feature-your-name</br>
                            Commit your changes with descriptive messages.</br>
                            Push your branch to the remote repository for review.</br>
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
4. How to Use the App :-
_______________________________________________________________________________________________________________________________________________________________________
                             #. For Regular Users
_______________________________________________________________________________________________________________________________________________________________________
a. Registration and Login
- Visit the application homepage
- Click on "Register" to create a new account
- Fill in your details (name, email, password)
- Verify your email address by clicking the link sent to your inbox
- Alternatively, use "Sign in with Google" for quick registration

b. Report an Issue
- After logging in, click on "Report Issue" from the dashboard
- Select the type of issue (garbage dump, pothole, water leakage, streetlight, etc.)
- Upload a photo of the issue using your camera or from your device
- Add a description of the problem
- The app will automatically capture your location, or you can manually select it on the map
- Submit the report

c. Track Your Reports
- Go to "My Reports" or "History" in your dashboard
- View the status of all your submitted reports (Pending, In Progress, Resolved)
- Receive notifications when the status of your report changes
- Add comments or updates to your existing reports

d. Explore Community Issues
- Visit the "Community" page to see all reported issues in your area
- Filter issues by type or status
- View photos and details of each report
- Add comments to support or provide additional information
- React to other users' comments

e. View Analytics
- Check your personal statistics in the "Analytics" section
- See how many issues you've reported
- Track your contribution to community improvement                           
______________________________________________________________________________________________________________________________________________________________________
                            ##. For Volunteers
______________________________________________________________________________________________________________________________________________________________________
a. Access Volunteer Features
- Log in with your volunteer account
- Access the same features as regular users
- Additionally, you can help verify and prioritize community reports

b. Assist in Issue Resolution
- Comment on reports with helpful information
- Upload follow-up photos showing progress
- Help coordinate with municipal authorities
__________________________________________________________________________________________________________________________________________________________________________
                               ###. For Administrators
__________________________________________________________________________________________________________________________________________________________________________
a. Admin Login
- Access the admin panel at `/admin/login`
- Log in with admin credentials
- Access the admin dashboard

b. Manage Reports
- View all submitted reports from all users
- Change report status (Pending → In Progress → Resolved)
- Delete spam or inappropriate reports
- Assign reports to relevant departments

c. Manage Users
- View all registered users
- Modify user roles (User, Volunteer, Admin)
- Block or unblock user accounts
- View user activity and statistics

d. System Settings
- Configure application settings
- Manage email templates
- Set up notifications
- Monitor system performance
________________________________________________________________________________________________________________________________________________________________________
                         ####. General Features Available to All Users
________________________________________________________________________________________________________________________________________________________________________

a. Profile Management
- Update your personal information
- Change your password
- Upload or update profile picture
- View your activity history

b. Settings
- Configure notification preferences
- Update email settings
- Manage privacy settings
- Change language preferences (if available)

c. Contact & Support
- Access the "Contact" page for help
- View FAQs and guidelines
- Report technical issues
- Provide feedback on the platform

-------------------------------------------------------------------------------------------------------------------------------------------------------------------------
5. Feature added by me -</br>
   a. Live Impact Map</br>
       Lead Developer: Mohammad Jishan
       I have integrated a Live Impact Map using Leaflet.js and React-Leaflet.</br>
       Location: Accessible directly on the Landing Page and via the "Explore Issues Map" action button.</br>
       Functionality: This module provides a real-time visualization of civic reports, allowing users and administrators to identify high-priority areas at a glance.</br>
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------
