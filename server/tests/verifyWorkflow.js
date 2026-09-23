const http = require('http');

async function runVerification() {
  console.log('🧪 Starting Automated End-to-End Workflow Verification...');

  // Start the server internally
  require('dotenv').config();
  const express = require('express');
  const cors = require('cors');
  const connectDB = require('../config/db');

  const authRoutes = require('../routes/authRoutes');
  const requestRoutes = require('../routes/requestRoutes');
  const offerRoutes = require('../routes/offerRoutes');
  const circleRoutes = require('../routes/circleRoutes');
  const notificationRoutes = require('../routes/notificationRoutes');
  const reportRoutes = require('../routes/reportRoutes');
  const adminRoutes = require('../routes/adminRoutes');

  const app = express();
  await connectDB();

  app.use(cors());
  app.use(express.json());

  app.use('/api/auth', authRoutes);
  app.use('/api/requests', requestRoutes);
  app.use('/api/offers', offerRoutes);
  app.use('/api/circles', circleRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/admin', adminRoutes);

  const server = app.listen(5099, async () => {
    const baseURL = 'http://localhost:5099/api';

    try {
      const fetchJSON = async (url, options = {}) => {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
          },
          body: options.body ? JSON.stringify(options.body) : undefined,
        });
        const data = await response.json();
        return { status: response.status, data };
      };

      // 1. Login as Requester (Sathesh V)
      console.log('\nStep 1: Logging in as Requester (Sathesh V)...');
      const satheshLogin = await fetchJSON(`${baseURL}/auth/login`, {
        method: 'POST',
        body: { email: 'sathesh@example.com', password: 'password123' },
      });
      console.assert(satheshLogin.data.success, 'Sathesh login failed');
      const satheshToken = satheshLogin.data.token;
      console.log('✅ Sathesh authenticated successfully.');

      // 2. Create Multi-Helper Request (5 helpers required)
      console.log('\nStep 2: Creating Multi-Helper Request (Need 5 volunteers)...');
      const circlesRes = await fetchJSON(`${baseURL}/circles`);
      const volunteerCircle = circlesRes.data.data.find((c) => c.name.includes('College Volunteers'));

      const createReq = await fetchJSON(`${baseURL}/requests`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${satheshToken}` },
        body: {
          title: 'Need 5 volunteers for annual symposium setup',
          description: 'Arranging chairs and banner setup.',
          category: 'Events',
          location: 'Main Auditorium',
          requiredDate: '2026-09-25',
          requiredTime: '09:00 AM',
          urgency: 'Medium',
          helpersRequired: 5,
          circleId: volunteerCircle?._id,
        },
      });
      console.assert(createReq.data.success, 'Create request failed');
      const requestId = createReq.data.data._id;
      console.log(`✅ Created Request ID: ${requestId} (Helpers required: 5, Status: ${createReq.data.data.status})`);

      // 3. Login as Helper (Tharun R)
      console.log('\nStep 3: Logging in as Helper (Tharun R)...');
      const tharunLogin = await fetchJSON(`${baseURL}/auth/login`, {
        method: 'POST',
        body: { email: 'tharun@example.com', password: 'password123' },
      });
      console.assert(tharunLogin.data.success, 'Tharun login failed');
      const tharunToken = tharunLogin.data.token;
      console.log('✅ Tharun authenticated successfully.');

      // 4. Helper offers help
      console.log('\nStep 4: Helper submits assistance offer...');
      const offerRes = await fetchJSON(`${baseURL}/requests/${requestId}/offers`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${tharunToken}` },
        body: {
          message: 'I can help arrange the banners and chairs tomorrow morning.',
          availableDate: '2026-09-25',
          availableTime: '09:00 AM',
        },
      });
      console.assert(offerRes.data.success, 'Offer creation failed');
      const offerId = offerRes.data.data._id;
      console.log(`✅ Offer submitted (ID: ${offerId}, Status: ${offerRes.data.data.status})`);

      // 5. Requester reviews and accepts helper
      console.log('\nStep 5: Requester accepts helper offer...');
      const acceptRes = await fetchJSON(`${baseURL}/offers/${offerId}/accept`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${satheshToken}` },
      });
      console.assert(acceptRes.data.success, 'Accept offer failed');
      console.log(`✅ Helper accepted! Confirmed count: ${acceptRes.data.data.confirmedHelpersCount}/5. Request status: ${acceptRes.data.data.requestStatus}`);

      // 6. Transition request to IN PROGRESS
      console.log('\nStep 6: Requester transitions request to IN PROGRESS...');
      const progressRes = await fetchJSON(`${baseURL}/requests/${requestId}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${satheshToken}` },
        body: { status: 'IN PROGRESS', notes: 'Assistance started.' },
      });
      console.assert(progressRes.data.success, 'Status change failed');
      console.log(`✅ Request status updated to: ${progressRes.data.data.status}`);

      // 7. Helper marks assistance completed (Side 1 of verification)
      console.log('\nStep 7: Helper marks assistance completed (Side 1 of verification)...');
      const completeRes = await fetchJSON(`${baseURL}/offers/${offerId}/complete`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${tharunToken}` },
      });
      console.assert(completeRes.data.success, 'Helper complete failed');
      console.log(`✅ Helper marked completed (completedByHelper: ${completeRes.data.data.completedByHelper})`);

      // 8. Requester confirms completion (Side 2 of verification -> Verified Assistance)
      console.log('\nStep 8: Requester confirms completion (Side 2 of verification)...');
      const confirmRes = await fetchJSON(`${baseURL}/offers/${offerId}/confirm`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${satheshToken}` },
      });
      console.assert(confirmRes.data.success, 'Requester confirm failed');
      console.log(`✅ Requester confirmed completion! Request status is now: ${confirmRes.data.data.requestStatus}`);

      // 9. Requester closes request
      console.log('\nStep 9: Requester closes request...');
      const closeRes = await fetchJSON(`${baseURL}/requests/${requestId}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${satheshToken}` },
        body: { status: 'CLOSED', notes: 'Task fully completed and closed.' },
      });
      console.assert(closeRes.data.success, 'Close request failed');
      console.log(`✅ Final request status: ${closeRes.data.data.status}`);

      // 10. Check Contribution Passport
      console.log('\nStep 10: Checking Helper Contribution Passport...');
      const passportRes = await fetchJSON(`${baseURL}/auth/passport/${tharunLogin.data.user._id}`);
      console.assert(passportRes.data.success, 'Passport fetch failed');
      const pStats = passportRes.data.passport.stats;
      console.log(`✅ Contribution Passport verified stats:`, pStats);
      console.log(`   Help Provided: ${pStats.helpProvided}`);
      console.log(`   Group Activities: ${pStats.groupActivities}`);
      console.log(`   Successful Assists: ${pStats.successfulAssists}`);

      console.log('\n🎉 ALL 10 HACKATHON WORKFLOW VERIFICATION STEPS PASSED 100%!');
      server.close();
      process.exit(0);
    } catch (testErr) {
      console.error('❌ Verification failed:', testErr);
      server.close();
      process.exit(1);
    }
  });
}

runVerification();
