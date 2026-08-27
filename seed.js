const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Freelancer = require('./models/Freelancer');
const Project = require('./models/Project');
const Application = require('./models/Application');
const Chat = require('./models/Chat');
const Review = require('./models/Review');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/freelancing';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Freelancer.deleteMany({});
    await Project.deleteMany({});
    await Application.deleteMany({});
    await Chat.deleteMany({});
    await Review.deleteMany({});
    console.log('Cleared existing collections.');

    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const clientPassword = await bcrypt.hash('client123', salt);
    const freelancerPassword = await bcrypt.hash('freelancer123', salt);

    // 1. Create Users
    const admin = await User.create({
      username: 'SBWorksAdmin',
      email: 'admin@sbworks.com',
      password: adminPassword,
      role: 'admin',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    });

    const client1 = await User.create({
      username: 'NexusTech Labs',
      email: 'client@sbworks.com',
      password: clientPassword,
      role: 'client',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    });

    const client2 = await User.create({
      username: 'Quantum Retail',
      email: 'alex.client@sbworks.com',
      password: clientPassword,
      role: 'client',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    });

    const freelancer1 = await User.create({
      username: 'Ashish Freelancer',
      email: 'freelancer@sbworks.com',
      password: freelancerPassword,
      role: 'freelancer',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    });

    const freelancer2 = await User.create({
      username: 'Sarah Chen (FullStack)',
      email: 'sarah.dev@sbworks.com',
      password: freelancerPassword,
      role: 'freelancer',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    });

    const freelancer3 = await User.create({
      username: 'David Miller (UI/UX)',
      email: 'david.ui@sbworks.com',
      password: freelancerPassword,
      role: 'freelancer',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    });

    // 2. Create Freelancer Profiles
    const freeProfile1 = await Freelancer.create({
      userId: freelancer1._id,
      bio: 'Senior MERN & Full-Stack Developer with 5+ years crafting high-performance web applications, scalable REST APIs, and responsive UIs.',
      skills: ['React', 'Node.js', 'MongoDB', 'Express', 'Redux', 'TypeScript'],
      funds: 1250,
      portfolioLinks: [
        { title: 'SaaS Dashboard', url: 'https://github.com/example/saas-dashboard', description: 'Real-time analytics dashboard with React & Node' },
        { title: 'E-commerce Engine', url: 'https://github.com/example/ecommerce-api', description: 'Scalable microservice API' },
      ],
    });

    const freeProfile2 = await Freelancer.create({
      userId: freelancer2._id,
      bio: 'Passionate Frontend specialist specializing in React, Next.js, Material UI, and sleek animations.',
      skills: ['React', 'JavaScript', 'CSS/SCSS', 'Material UI', 'Bootstrap', 'GraphQL'],
      funds: 800,
      portfolioLinks: [
        { title: 'Modern Landing Pages', url: 'https://github.com/example/landing-pages', description: 'High converting responsive UI templates' },
      ],
    });

    const freeProfile3 = await Freelancer.create({
      userId: freelancer3._id,
      bio: 'UI/UX Designer and Frontend Enthusiast creating modern, accessible, and intuitive digital experiences.',
      skills: ['UI/UX', 'Figma', 'React', 'Tailwind', 'Bootstrap'],
      funds: 450,
      portfolioLinks: [
        { title: 'Fintech App Prototype', url: 'https://figma.com/@example/fintech', description: 'Complete design system and mobile UI flow' },
      ],
    });

    // 3. Create Sample Projects
    // Project 1: Open project with bids
    const project1 = await Project.create({
      client: client1._id,
      title: 'Build Real-Time Collaboration Dashboard in MERN',
      description: 'We need an experienced MERN stack engineer to build a real-time analytics and collaboration dashboard. Requirements include WebSockets/Socket.IO integration, JWT authentication, responsive Bootstrap/MUI layout, and MongoDB aggregation pipelines.',
      skills: ['React', 'Node.js', 'MongoDB', 'Express', 'Socket.IO'],
      budget: 850,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: 'Open',
      freelancer: null,
      bids: [],
    });

    // Project 2: In Progress project (assigned to freelancer1)
    const project2 = await Project.create({
      client: client1._id,
      title: 'E-Commerce Payment Gateway & Order Tracking API',
      description: 'Develop a secure Node.js & Express REST API with Stripe integration, webhooks handling, order lifecycle tracking, and invoice generation.',
      skills: ['Node.js', 'Express', 'MongoDB', 'REST API'],
      budget: 650,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'In Progress',
      freelancer: freelancer1._id,
      bids: [],
    });

    // Project 3: Submitted project awaiting client review (by freelancer2)
    const project3 = await Project.create({
      client: client2._id,
      title: 'Redesign Responsive Landing Page with Material UI',
      description: 'Redesign our corporate landing page to be fast, responsive, and modern with Material UI components and dark mode support.',
      skills: ['React', 'Material UI', 'Bootstrap', 'CSS/SCSS'],
      budget: 450,
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      status: 'Submitted',
      freelancer: freelancer2._id,
      bids: [],
      projectLink: 'https://github.com/sbworks/corporate-landing-demo',
      manual: 'npm install && npm run dev to preview the landing page. All responsive breakpoints tested.',
      submissionNote: 'Completed all responsive layouts, accessibility improvements, and dark mode toggling. Looking forward to your review!',
    });

    // Project 4: Completed project with review (freelancer1)
    const project4 = await Project.create({
      client: client2._id,
      title: 'Customer Support Helpdesk Ticket Management System',
      description: 'Build an internal ticketing tool for support agents with role-based permissions and email notification hooks.',
      skills: ['React', 'Node.js', 'MongoDB', 'Redux'],
      budget: 1200,
      deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status: 'Completed',
      freelancer: freelancer1._id,
      bids: [],
      projectLink: 'https://github.com/sbworks/support-ticket-system',
      manual: 'Full deployment guide attached in README.md',
      submissionNote: 'Delivered ahead of deadline. Production ready docker container included.',
    });

    // Project 5: Another Open Project
    const project5 = await Project.create({
      client: client2._id,
      title: 'Mobile-Friendly Fitness Tracker Web App',
      description: 'Looking for a frontend React developer to construct a fitness logging interface with calorie calculation, interactive workout logs, and progress charts.',
      skills: ['React', 'Redux', 'Bootstrap', 'JavaScript'],
      budget: 550,
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      status: 'Open',
      freelancer: null,
      bids: [],
    });

    // 4. Create Applications / Bids
    const app1 = await Application.create({
      projectId: project1._id,
      client: client1._id,
      freelancer: freelancer1._id,
      title: project1.title,
      proposal: 'Hello! I have extensive experience building real-time dashboards with React, Redux, and Socket.IO. I have built 4 similar enterprise dashboards with great user feedback.',
      budget: 800,
      status: 'Pending',
    });

    const app2 = await Application.create({
      projectId: project1._id,
      client: client1._id,
      freelancer: freelancer2._id,
      title: project1.title,
      proposal: 'I can deliver a pixel-perfect, responsive UI using MUI and connect your WebSockets seamlessly with high-performance state caching.',
      budget: 850,
      status: 'Pending',
    });

    const app3 = await Application.create({
      projectId: project2._id,
      client: client1._id,
      freelancer: freelancer1._id,
      title: project2.title,
      proposal: 'I specialize in secure RESTful architectures and payment webhook processing. Ready to start immediately!',
      budget: 650,
      status: 'Accepted',
    });

    const app4 = await Application.create({
      projectId: project3._id,
      client: client2._id,
      freelancer: freelancer2._id,
      title: project3.title,
      proposal: 'Expert frontend designer here. I have created over 25 high-converting MUI landing pages.',
      budget: 450,
      status: 'Accepted',
    });

    const app5 = await Application.create({
      projectId: project4._id,
      client: client2._id,
      freelancer: freelancer1._id,
      title: project4.title,
      proposal: 'I will develop a clean ticketing system with Redux Toolkit and full role security.',
      budget: 1200,
      status: 'Accepted',
    });

    // Update project bids arrays
    project1.bids = [app1._id, app2._id];
    await project1.save();

    project2.bids = [app3._id];
    await project2.save();

    project3.bids = [app4._id];
    await project3.save();

    project4.bids = [app5._id];
    await project4.save();

    // Update freelancer references
    await Freelancer.findByIdAndUpdate(freeProfile1._id, {
      $push: { projects: [project2._id, project4._id], applications: [app1._id, app3._id, app5._id] },
    });

    await Freelancer.findByIdAndUpdate(freeProfile2._id, {
      $push: { projects: [project3._id], applications: [app2._id, app4._id] },
    });

    // 5. Create Chat Rooms & Messages
    await Chat.create({
      projectId: project2._id,
      participants: [client1._id, freelancer1._id],
      messages: [
        {
          sender: client1._id,
          text: 'Hi Ashish! Welcome to the project. Let us know if you need the Stripe test keys.',
          sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          sender: freelancer1._id,
          text: 'Thank you NexusTech! Yes, please share the test sandbox credentials in a secure environment. I have already scaffolded the webhook endpoints.',
          sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
        {
          sender: client1._id,
          text: 'Sounds great! Looking forward to testing the initial checkout flow.',
          sentAt: new Date(),
        },
      ],
    });

    await Chat.create({
      projectId: project3._id,
      participants: [client2._id, freelancer2._id],
      messages: [
        {
          sender: client2._id,
          text: 'Hi Sarah, excited to work with you on the corporate landing page!',
          sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
        {
          sender: freelancer2._id,
          text: 'Thank you Alex! I just submitted the completed work for your review. Check the repository link on the project page.',
          sentAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        },
      ],
    });

    // 6. Create Reviews
    await Review.create({
      projectId: project4._id,
      from: client2._id,
      to: freelancer1._id,
      rating: 5,
      comment: 'Exceptional work! Delivered ahead of time, code was clean and well-structured, and communication was super prompt. Highly recommended freelancer!',
    });

    console.log('Seeding completed successfully!');
    console.log('\n--- DEMO CREDENTIALS ---');
    console.log('Admin:       admin@sbworks.com       / admin123');
    console.log('Client:      client@sbworks.com      / client123');
    console.log('Freelancer:  freelancer@sbworks.com  / freelancer123');
    console.log('------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
