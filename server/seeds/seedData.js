const bcrypt = require('bcryptjs');
const User = require('../models/User');
const HelpCircle = require('../models/HelpCircle');
const HelpRequest = require('../models/HelpRequest');
const HelpOffer = require('../models/HelpOffer');
const Notification = require('../models/Notification');
const RequestHistory = require('../models/RequestHistory');
const Report = require('../models/Report');

const seedData = async () => {
  try {
    // Clear existing collections
    await User.deleteMany({});
    await HelpCircle.deleteMany({});
    await HelpRequest.deleteMany({});
    await HelpOffer.deleteMany({});
    await Notification.deleteMany({});
    await RequestHistory.deleteMany({});
    await Report.deleteMany({});

    console.log('  -> Hashing password for seed users...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // 1. Create Users
    const usersData = [
      {
        name: 'Admin User',
        email: 'admin@communityhub.org',
        passwordHash,
        role: 'admin',
        department: 'Campus Administration',
        location: 'Admin Block, Room 101',
        skills: ['Community Leadership', 'Moderation', 'Event Management'],
      },
      {
        name: 'Sathesh V',
        email: 'sathesh@example.com',
        passwordHash,
        role: 'user',
        department: 'Computer Science & Engineering',
        location: 'Hostel Block B, Room 204',
        skills: ['C++', 'Python', 'Web Development', 'Event Planning'],
      },
      {
        name: 'Tharun R',
        email: 'tharun@example.com',
        passwordHash,
        role: 'user',
        department: 'Computer Science & Engineering',
        location: 'Hostel Block B, Room 210',
        skills: ['C++', 'React.js', 'Git', 'Algorithms'],
      },
      {
        name: 'Arun K',
        email: 'arun@example.com',
        passwordHash,
        role: 'user',
        department: 'Electronics & Communication',
        location: 'Hostel Block A, Room 105',
        skills: ['Circuit Design', 'Arduino', 'Event Coordination'],
      },
      {
        name: 'Priya S',
        email: 'priya@example.com',
        passwordHash,
        role: 'user',
        department: 'Computer Science & Engineering',
        location: 'Campus Day-Scholar, Sector 4',
        skills: ['DBMS', 'SQL', 'UI/UX Design', 'Figma'],
      },
      {
        name: 'Karthik M',
        email: 'karthik@example.com',
        passwordHash,
        role: 'user',
        department: 'Mechanical Engineering',
        location: 'Hostel Block C, Room 302',
        skills: ['Logistics', 'Heavy Lifting', 'Equipment Setup'],
      },
      {
        name: 'Ravi N',
        email: 'ravi@example.com',
        passwordHash,
        role: 'user',
        department: 'Electronics & Communication',
        location: 'Campus Day-Scholar, North Wing',
        skills: ['Sound Engineering', 'Photography', 'Electronics'],
      },
      {
        name: 'Ananya G',
        email: 'ananya@example.com',
        passwordHash,
        role: 'user',
        department: 'Biotechnology',
        location: 'Hostel Block D, Room 112',
        skills: ['Graphic Design', 'Poster Design', 'Tutoring'],
      },
    ];

    const users = await User.insertMany(usersData);
    const userMap = {};
    users.forEach((u) => {
      userMap[u.email] = u;
    });

    console.log(`  -> Created ${users.length} users.`);

    // 2. Create Help Circles
    const circlesData = [
      {
        name: 'College Volunteers',
        description: 'Dedicated student & faculty volunteer squad coordinating campus events, drives, and social initiatives.',
        category: 'Events',
        icon: 'Users',
        createdBy: userMap['sathesh@example.com']._id,
        members: [
          userMap['sathesh@example.com']._id,
          userMap['tharun@example.com']._id,
          userMap['arun@example.com']._id,
          userMap['priya@example.com']._id,
          userMap['karthik@example.com']._id,
          userMap['ananya@example.com']._id,
        ],
      },
      {
        name: 'CSE Students',
        description: 'Peer assistance hub for Computer Science coursework, coding assignments, debugging, and project collaboration.',
        category: 'Education',
        icon: 'Code',
        createdBy: userMap['sathesh@example.com']._id,
        members: [
          userMap['sathesh@example.com']._id,
          userMap['tharun@example.com']._id,
          userMap['priya@example.com']._id,
        ],
      },
      {
        name: 'ECE Students',
        description: 'Collaborative community for Electronics & Communication subjects, lab experiments, hardware kits, and microcontrollers.',
        category: 'Technology',
        icon: 'Cpu',
        createdBy: userMap['arun@example.com']._id,
        members: [
          userMap['arun@example.com']._id,
          userMap['ravi@example.com']._id,
        ],
      },
      {
        name: 'Hostel Community',
        description: 'Neighborhood assistance for hostel residents — moving items, room repairs, sharing essentials, and late-night study groups.',
        category: 'Community',
        icon: 'Home',
        createdBy: userMap['karthik@example.com']._id,
        members: [
          userMap['sathesh@example.com']._id,
          userMap['tharun@example.com']._id,
          userMap['karthik@example.com']._id,
          userMap['ananya@example.com']._id,
        ],
      },
    ];

    const circles = await HelpCircle.insertMany(circlesData);
    const circleMap = {};
    circles.forEach((c) => {
      circleMap[c.name] = c;
    });

    // Update users' circleIds
    for (const circle of circles) {
      for (const memberId of circle.members) {
        await User.findByIdAndUpdate(memberId, {
          $addToSet: { circleIds: circle._id },
        });
      }
    }

    console.log(`  -> Created ${circles.length} Help Circles.`);

    // 3. Create Help Requests
    const requestsData = [
      {
        requesterId: userMap['sathesh@example.com']._id,
        title: 'Need 5 volunteers for college event setup',
        description: 'Need active volunteers to assist with chair arrangements, stage decorations, and badge distribution for the upcoming annual symposium.',
        category: 'Events',
        location: 'College Main Auditorium',
        requiredDate: '2026-09-25',
        requiredTime: '09:00 AM',
        urgency: 'Medium',
        helpersRequired: 5,
        circleId: circleMap['College Volunteers']._id,
        status: 'OPEN',
      },
      {
        requesterId: userMap['tharun@example.com']._id,
        title: 'Need help understanding DBMS JOIN queries & Normalization',
        description: 'Preparing for DBMS mid-semester test. Need a senior or peer to explain 3NF BCNF decomposition and tricky outer joins with real query examples.',
        category: 'Education',
        location: 'Central Library Study Room 3',
        requiredDate: '2026-09-24',
        requiredTime: '04:00 PM',
        urgency: 'High',
        helpersRequired: 1,
        circleId: circleMap['CSE Students']._id,
        status: 'OPEN',
      },
      {
        requesterId: userMap['arun@example.com']._id,
        title: 'Need help setting up Arduino sensor project presentation',
        description: 'Looking for 2 teammates to test ultrasonic sensor calibration and wiring setup before our lab demonstration.',
        category: 'Technology',
        location: 'ECE Department Lab 2',
        requiredDate: '2026-09-26',
        requiredTime: '02:00 PM',
        urgency: 'High',
        helpersRequired: 2,
        circleId: circleMap['ECE Students']._id,
        status: 'OPEN',
      },
      {
        requesterId: userMap['ananya@example.com']._id,
        title: 'Need help designing a poster for Tech Fest 2026',
        description: 'Seeking someone with Canva or Figma skills to create an eye-catching poster banner for our department workshop.',
        category: 'Community',
        location: 'BioTech Seminar Hall',
        requiredDate: '2026-09-27',
        requiredTime: '11:00 AM',
        urgency: 'Low',
        helpersRequired: 1,
        circleId: circleMap['College Volunteers']._id,
        status: 'OPEN',
      },
      {
        requesterId: userMap['karthik@example.com']._id,
        title: 'Need assistance moving books & boxes to hostel storage',
        description: 'Need 3 strong helpers to assist in moving several heavy carton boxes of books and sports equipment down two flights of stairs.',
        category: 'Moving',
        location: 'Hostel Block C, 3rd Floor',
        requiredDate: '2026-09-24',
        requiredTime: '05:30 PM',
        urgency: 'High',
        helpersRequired: 3,
        circleId: circleMap['Hostel Community']._id,
        status: 'OPEN',
      },
      {
        requesterId: userMap['ravi@example.com']._id,
        title: 'C++ Pointer & Memory Leak Debugging session',
        description: 'Stuck with segmentation faults in a binary tree traversal program. Looking for a quick 30-min code review help.',
        category: 'Education',
        location: 'Computer Center Lab 1',
        requiredDate: '2026-09-25',
        requiredTime: '03:00 PM',
        urgency: 'Medium',
        helpersRequired: 1,
        circleId: circleMap['CSE Students']._id,
        status: 'OPEN',
      },
      {
        requesterId: userMap['priya@example.com']._id,
        title: 'Need volunteer driver for campus charity donation drop',
        description: 'Collected 4 large bags of clothes and stationery for donation drive. Need a volunteer with a car or two-wheeler to drop at community center.',
        category: 'Transportation',
        location: 'Campus Main Gate',
        requiredDate: '2026-09-28',
        requiredTime: '10:00 AM',
        urgency: 'Low',
        helpersRequired: 1,
        circleId: null, // Global request
        status: 'OPEN',
      },
      {
        requesterId: userMap['sathesh@example.com']._id,
        title: 'Hostel common room study table assembly',
        description: 'Need 2 helpers with screwdrivers to assemble 3 new wooden study tables delivered for the hostel reading room.',
        category: 'Household',
        location: 'Hostel Block B Common Room',
        requiredDate: '2026-09-26',
        requiredTime: '06:00 PM',
        urgency: 'Medium',
        helpersRequired: 2,
        circleId: circleMap['Hostel Community']._id,
        status: 'OPEN',
      },
      {
        requesterId: userMap['tharun@example.com']._id,
        title: 'Resume & Portfolio review for upcoming placement drives',
        description: 'Looking for a senior or experienced peer to review my resume format, project descriptions, and GitHub profile.',
        category: 'Education',
        location: 'Cafeteria Lounge',
        requiredDate: '2026-09-29',
        requiredTime: '01:30 PM',
        urgency: 'Low',
        helpersRequired: 1,
        circleId: null,
        status: 'OPEN',
      },
      {
        requesterId: userMap['priya@example.com']._id,
        title: 'Need 3 stage management helpers for annual culturals',
        description: 'Assisting anchors with mic handovers, background cue coordination, and guest memento arrangement.',
        category: 'Events',
        location: 'Open Air Theatre (OAT)',
        requiredDate: '2026-09-30',
        requiredTime: '05:00 PM',
        urgency: 'High',
        helpersRequired: 3,
        circleId: circleMap['College Volunteers']._id,
        status: 'OPEN',
      },
    ];

    const requests = await HelpRequest.insertMany(requestsData);
    console.log(`  -> Created ${requests.length} Help Requests.`);

    // 4. Create Initial Request History for all requests
    for (const req of requests) {
      await RequestHistory.create({
        requestId: req._id,
        changedBy: req.requesterId,
        previousStatus: '',
        newStatus: 'OPEN',
        action: 'Request Created',
        notes: `Initial help request posted. Helpers required: ${req.helpersRequired}.`,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      });
    }

    // 5. Add some pre-existing completed demonstration history for Sathesh & Priya to show rich Contribution Passport
    const historicalRequest = await HelpRequest.create({
      requesterId: userMap['priya@example.com']._id,
      title: 'Helped with C++ assignment and STL containers',
      description: 'Needed explanation on map, unordered_set, and vector iterator invalidation.',
      category: 'Education',
      location: 'CSE Lab 3',
      requiredDate: '2026-09-20',
      requiredTime: '03:00 PM',
      urgency: 'Medium',
      helpersRequired: 1,
      circleId: circleMap['CSE Students']._id,
      status: 'ASSISTED',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    });

    const historicalOffer = await HelpOffer.create({
      requestId: historicalRequest._id,
      helperId: userMap['sathesh@example.com']._id,
      message: 'I have good experience with C++ STL and can explain iterators and complexity.',
      availableDate: '2026-09-20',
      availableTime: '03:00 PM',
      status: 'Completed',
      completedByHelper: true,
      confirmedByRequester: true,
      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 40),
    });

    await RequestHistory.create({
      requestId: historicalRequest._id,
      changedBy: userMap['sathesh@example.com']._id,
      previousStatus: 'IN PROGRESS',
      newStatus: 'IN PROGRESS',
      action: 'Assistance Completed by Helper',
      notes: 'Sathesh V marked C++ STL tutoring assistance completed.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 42),
    });

    await RequestHistory.create({
      requestId: historicalRequest._id,
      changedBy: userMap['priya@example.com']._id,
      previousStatus: 'IN PROGRESS',
      newStatus: 'ASSISTED',
      action: 'Requester Confirmed Completion',
      notes: 'Priya verified and confirmed tutoring completed successfully.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 40),
    });

    // 6. Add a sample report for Admin moderation demonstration
    await Report.create({
      reportedBy: userMap['tharun@example.com']._id,
      requestId: requests[4]._id, // Karthik's moving books request
      reportedUserId: userMap['karthik@example.com']._id,
      reason: 'Other',
      description: 'Demo test report: Verifying admin moderation report queue functionality.',
      status: 'pending',
    });

    // 7. Add sample notifications
    await Notification.create({
      userId: userMap['sathesh@example.com']._id,
      type: 'REQUESTER_CONFIRMED',
      message: 'Your assistance on "Helped with C++ assignment and STL containers" was verified and confirmed by Priya S! Added to your Contribution Passport.',
      requestId: historicalRequest._id,
      read: true,
    });

    console.log('✅ Demo Seed Data successfully created!');
  } catch (error) {
    console.error('❌ Error during seedData:', error);
    throw error;
  }
};

module.exports = { seedData };
