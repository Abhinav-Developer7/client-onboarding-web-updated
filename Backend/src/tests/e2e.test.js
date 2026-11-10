import app from '../server.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { StaffUser } from '../models/StaffUser.js';

let passed = 0;
let failed = 0;

const assert = (condition, testName) => {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failed++;
  }
};

const runE2ETests = async () => {
  console.log('=====================================================');
  console.log('   CLIENT ONBOARDING SYSTEM - END-TO-END TEST SUITE   ');
  console.log('=====================================================\n');

  let isMongoConnected = false;
  let adminUser = null;
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/client_onboarding';
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 2000 });
    isMongoConnected = true;
    console.log('[E2E Info] Live MongoDB connection verified.\n');

    adminUser = await StaffUser.findOne({ email: 'admin@company.com' });
  } catch (err) {
    console.log('[E2E Info] Running without live MongoDB.\n');
  }

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // 1. Healthcheck Endpoint
    console.log('--- Test Suite 1: System Healthcheck ---');
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200, 'GET /api/health returns 200 OK');
    assert(healthData.status === 'ok', 'Health status reports "ok"');
    assert(healthData.service === 'client-onboarding-api', 'Reports correct service name');

    // 2. Public Onboarding Validation
    console.log('\n--- Test Suite 2: Public Onboarding Validation & Error Contracts ---');
    const invalidPayload = {
      customerDetails: {
        customerType: 'Business',
        businessLegalName: 'A',
        pan: 'INVALIDPAN'
      },
      taxAndAddressDetails: {
        address: {
          line1: '123 Main St',
          city: 'City',
          state: 'State',
          postalCode: '12345',
          country: 'India'
        },
        currency: 'INR',
        gstTreatment: 'Registered - Regular',
        gstin: '',
        placeOfSupply: ''
      },
      contactDetails: {
        customerLanguage: 'English',
        contactPerson: 'John',
        email: 'invalid-email',
        phone: '123'
      }
    };

    const invalidRes = await fetch(`${baseUrl}/api/public/onboarding`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidPayload)
    });
    const invalidData = await invalidRes.json();
    assert(invalidRes.status === 400, 'Invalid submission payload returns 400 Bad Request');
    assert(invalidData.errors && invalidData.errors.length > 0, 'Response includes structured validation errors array');
    assert(invalidData.errors.some(e => e.field === 'customerDetails.pan'), 'Includes specific error for PAN field');
    assert(invalidData.errors.some(e => e.field === 'taxAndAddressDetails.gstin'), 'Includes specific error for conditional GSTIN');

    // 3. Security & Access Control
    console.log('\n--- Test Suite 3: Security & Access Control Matrix ---');
    const unauthRes = await fetch(`${baseUrl}/api/clients`);
    assert(unauthRes.status === 401, 'Unauthenticated GET /api/clients returns 401 Unauthorized');

    const missingFieldsLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'notanemail' })
    });
    assert(missingFieldsLogin.status === 400, 'Malformed login payload returns 400 Bad Request');

    // 4. Authenticated API Endpoints
    if (isMongoConnected && adminUser) {
      console.log('\n--- Test Suite 4: Authenticated Dashboard & Clients APIs ---');
      const mockStaffPayload = {
        id: adminUser._id,
        email: adminUser.email,
        role: adminUser.role
      };
      const mockToken = jwt.sign(mockStaffPayload, process.env.JWT_SECRET || 'super_secret_jwt_key_client_onboarding_2026_dev', {
        expiresIn: '1h'
      });
      const authHeaders = {
        'Authorization': `Bearer ${mockToken}`,
        'Content-Type': 'application/json'
      };

      // Dashboard Stats API
      const statsRes = await fetch(`${baseUrl}/api/dashboard/stats`, { headers: authHeaders });
      const statsData = await statsRes.json();
      assert(statsRes.status === 200, 'GET /api/dashboard/stats returns 200 OK');
      assert(statsData.data && statsData.data.counts !== undefined, 'Returns counts object');
      assert(Array.isArray(statsData.data.recentClients) && statsData.data.recentClients.length <= 5, 'Returns <= 5 recent clients');
      assert(Array.isArray(statsData.data.monthlyData) && statsData.data.monthlyData.length === 6, 'Returns exactly 6 months of historical data');

      // Paginated Clients API (Strictly 10 records per page)
      const clientsRes = await fetch(`${baseUrl}/api/clients?page=1&limit=10`, { headers: authHeaders });
      const clientsData = await clientsRes.json();
      assert(clientsRes.status === 200, 'GET /api/clients?page=1&limit=10 returns 200 OK');
      assert(Array.isArray(clientsData.data) && clientsData.data.length <= 10, 'Returns <= 10 client entries for page 1');
      assert(clientsData.pagination && clientsData.pagination.limit === 10, 'Pagination specifies limit=10');
      assert(clientsData.pagination.currentPage === 1, 'Pagination specifies currentPage=1');
      assert(clientsData.pagination.totalRecords >= 5, 'Finds seeded sample client records');
    }

    // 5. Fallback 404 Route
    console.log('\n--- Test Suite 5: Fallback & Route Handling ---');
    const notFoundRes = await fetch(`${baseUrl}/api/non-existent-route`);
    assert(notFoundRes.status === 404, 'Non-existent API endpoint returns 404 Not Found');

    console.log('\n=====================================================');
    console.log(`E2E API Test Results: ${passed} Passed, ${failed} Failed`);
    console.log('=====================================================\n');

  } catch (err) {
    console.error('[E2E Test Error]', err);
    failed++;
  } finally {
    if (isMongoConnected) {
      await mongoose.disconnect();
    }
    server.close();
    process.exit(failed > 0 ? 1 : 0);
  }
};

runE2ETests();
