import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Onboarding } from '../models/Onboarding.js';

dotenv.config();

const sampleSubmissions = [
  {
    referenceId: 'CL-2026-0001',
    customerDetails: {
      customerType: 'Business',
      businessLegalName: 'Acme Cloud Technologies Pvt Ltd',
      pan: 'ABCDE1234F'
    },
    taxAndAddressDetails: {
      address: {
        line1: 'Tower B, Tech Park, Outer Ring Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560103',
        country: 'India'
      },
      currency: 'INR',
      gstTreatment: 'Registered - Regular',
      gstin: '29ABCDE1234F1Z5',
      placeOfSupply: 'Karnataka'
    },
    contactDetails: {
      customerLanguage: 'English',
      contactPerson: 'Siddharth Rao',
      email: 'siddharth@acmecloud.com',
      phone: '+919876543210',
      alternatePhone: '+918023456789'
    },
    status: 'new',
    submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
  },
  {
    referenceId: 'CL-2026-0002',
    customerDetails: {
      customerType: 'Individual',
      businessLegalName: 'Verma Design & Architecture Studio',
      pan: 'BCDEF2345G'
    },
    taxAndAddressDetails: {
      address: {
        line1: '12-A, Art District, Bandra West',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400050',
        country: 'India'
      },
      currency: 'INR',
      gstTreatment: 'Registered - Composition',
      gstin: '27BCDEF2345G1Z9',
      placeOfSupply: 'Maharashtra'
    },
    contactDetails: {
      customerLanguage: 'Hindi',
      contactPerson: 'Rahul Verma',
      email: 'rahul@vermadesign.in',
      phone: '+919822334455',
      alternatePhone: ''
    },
    status: 'under_review',
    reviewNotes: 'PAN format verified. Awaiting certificate of incorporation copy.',
    submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
  },
  {
    referenceId: 'CL-2026-0003',
    customerDetails: {
      customerType: 'Business',
      businessLegalName: 'GreenLeaf Organic Spices & Exports',
      pan: 'CDEFG3456H'
    },
    taxAndAddressDetails: {
      address: {
        line1: 'Spice Valley Industrial Area, Sector 4',
        city: 'Kochi',
        state: 'Kerala',
        postalCode: '682001',
        country: 'India'
      },
      currency: 'USD',
      gstTreatment: 'Overseas / Export',
      gstin: null,
      placeOfSupply: null
    },
    contactDetails: {
      customerLanguage: 'Malayalam',
      contactPerson: 'Anjali Menon',
      email: 'anjali@greenleafspices.com',
      phone: '+919447123456',
      alternatePhone: '+914842233445'
    },
    status: 'approved',
    reviewNotes: 'Export documentation and overseas treatment verified.',
    submittedAt: new Date(Date.now() - 48 * 60 * 60 * 1000) // 2 days ago
  },
  {
    referenceId: 'CL-2026-0004',
    customerDetails: {
      customerType: 'Individual',
      businessLegalName: 'Apex Digital Consulting',
      pan: 'DEFGH4567I'
    },
    taxAndAddressDetails: {
      address: {
        line1: '45 Connaught Place, Block C',
        city: 'New Delhi',
        state: 'Delhi (NCT)',
        postalCode: '110001',
        country: 'India'
      },
      currency: 'INR',
      gstTreatment: 'Unregistered',
      gstin: null,
      placeOfSupply: null
    },
    contactDetails: {
      customerLanguage: 'English',
      contactPerson: 'Vikram Seth',
      email: 'vikram@apexdigital.co',
      phone: '+919811223344',
      alternatePhone: ''
    },
    status: 'rejected',
    reviewNotes: 'Entity turnover exceeds threshold; requires regular GST registration.',
    submittedAt: new Date(Date.now() - 72 * 60 * 60 * 1000) // 3 days ago
  },
  {
    referenceId: 'CL-2026-0005',
    customerDetails: {
      customerType: 'Business',
      businessLegalName: 'Horizon Logistics & Freight Pvt Ltd',
      pan: 'EFGHI5678J'
    },
    taxAndAddressDetails: {
      address: {
        line1: 'Harbor Gateway, Port Road',
        city: 'Chennai',
        state: 'Tamil Nadu',
        postalCode: '600001',
        country: 'India'
      },
      currency: 'INR',
      gstTreatment: 'Registered - Regular',
      gstin: '33EFGHI5678J1Z3',
      placeOfSupply: 'Tamil Nadu'
    },
    contactDetails: {
      customerLanguage: 'Tamil',
      contactPerson: 'Karthik Subramanian',
      email: 'karthik@horizonlogistics.in',
      phone: '+919840112233',
      alternatePhone: '+914425334455'
    },
    status: 'approved',
    reviewNotes: 'All KYC and GST compliance checks completed successfully.',
    submittedAt: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
  }
];

const seedSubmissions = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb+srv://abhinavns2005_db_user:Appu3778@cluster0.z6cjsn9.mongodb.net/client_onboarding';

  try {
    await mongoose.connect(mongoURI);
    console.log('[Seed] Connected to MongoDB for sample submissions');

    for (const sub of sampleSubmissions) {
      const existing = await Onboarding.findOne({ referenceId: sub.referenceId });
      if (!existing) {
        await Onboarding.create(sub);
        console.log(`[Seed] Created onboarding record: ${sub.referenceId} (${sub.customerDetails.businessLegalName})`);
      } else {
        console.log(`[Seed] Record already exists: ${sub.referenceId}`);
      }
    }

    console.log('[Seed] Successfully seeded sample client submissions!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedSubmissions();

