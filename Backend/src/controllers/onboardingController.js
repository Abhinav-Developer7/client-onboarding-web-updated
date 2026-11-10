import { Onboarding } from '../models/Onboarding.js';

/**
 * Generate a unique sequential Reference ID in the format CL-YYYY-XXXX
 */
const generateReferenceId = async () => {
  const currentYear = new Date().getFullYear();
  const yearPrefix = `CL-${currentYear}-`;
  
  const lastRecord = await Onboarding.findOne({
    referenceId: new RegExp(`^${yearPrefix}`)
  }).sort({ createdAt: -1 });

  let nextSequence = 1;
  if (lastRecord && lastRecord.referenceId) {
    const parts = lastRecord.referenceId.split('-');
    if (parts.length === 3) {
      const parsed = parseInt(parts[2], 10);
      if (!isNaN(parsed)) {
        nextSequence = parsed + 1;
      }
    }
  }

  const paddedSequence = String(nextSequence).padStart(4, '0');
  let referenceId = `${yearPrefix}${paddedSequence}`;

  const exists = await Onboarding.exists({ referenceId });
  if (exists) {
    const randomSuffix = Math.floor(10 + Math.random() * 90);
    referenceId = `${yearPrefix}${String(nextSequence + 1).padStart(4, '0')}-${randomSuffix}`;
  }

  return referenceId;
};

/**
 * Public: Submit complete onboarding application (Forms 1, 2, 3)
 * POST /api/public/onboarding
 */
export const submitOnboarding = async (req, res, next) => {
  try {
    const referenceId = await generateReferenceId();

    const newSubmission = new Onboarding({
      referenceId,
      customerDetails: req.body.customerDetails,
      taxAndAddressDetails: req.body.taxAndAddressDetails,
      contactDetails: req.body.contactDetails,
      status: 'new',
      submittedAt: new Date()
    });

    const savedRecord = await newSubmission.save();

    res.status(201).json({
      success: true,
      message: 'Onboarding application submitted successfully',
      data: {
        referenceId: savedRecord.referenceId,
        status: savedRecord.status,
        submittedAt: savedRecord.submittedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Staff Protected: Dashboard Aggregated Statistics, 5 Recent Clients & Monthly Growth
 * GET /api/dashboard/stats
 */
export const getDashboardData = async (req, res, next) => {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [statusAggregation, recentClients, monthlyAggregation] = await Promise.all([
      // 1. Live status counts
      Onboarding.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),

      // 2. Exactly 5 recent client submissions with light projection
      Onboarding.find()
        .sort({ submittedAt: -1, createdAt: -1 })
        .limit(5)
        .select('referenceId customerDetails.businessLegalName customerDetails.customerType contactDetails.email contactDetails.contactPerson submittedAt createdAt status')
        .lean(),

      // 3. Monthly submissions for last 6 months (resilient to date types)
      Onboarding.aggregate([
        {
          $match: {
            $or: [
              { submittedAt: { $gte: sixMonthsAgo } },
              { submittedAt: { $exists: false }, createdAt: { $gte: sixMonthsAgo } }
            ]
          }
        },
        {
          $project: {
            resolvedDate: { $toDate: { $ifNull: ['$submittedAt', '$createdAt'] } }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$resolvedDate' },
              month: { $month: '$resolvedDate' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);

    // Map status counts
    const counts = { total: 0, new: 0, under_review: 0, approved: 0, rejected: 0 };
    statusAggregation.forEach((item) => {
      if (counts.hasOwnProperty(item._id)) {
        counts[item._id] = item.count;
      }
      counts.total += item.count;
    });

    // Format 6 months continuously including 0-count months
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const monthLabel = `${monthNames[d.getMonth()]} ${String(y).slice(-2)}`;

      const found = monthlyAggregation.find(
        (entry) => entry._id.year === y && entry._id.month === m
      );

      monthlyData.push({
        name: monthLabel,
        count: found ? found.count : 0,
        year: y,
        month: m
      });
    }

    res.json({
      success: true,
      data: {
        counts,
        recentClients,
        monthlyData
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Staff Protected: Paginated Clients Listing with Search & Filters
 * Server-side pagination with default 10 records per page.
 * GET /api/onboarding OR GET /api/clients
 */
export const listSubmissions = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(parseInt(req.query.limit, 10) || 10, 50));
    const skip = (page - 1) * limit;

    const {
      status,
      customerType,
      gstTreatment,
      search,
      startDate,
      endDate,
      sortBy = 'submittedAt',
      order = 'desc'
    } = req.query;

    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (customerType && customerType !== 'all') {
      filter['customerDetails.customerType'] = customerType;
    }

    if (gstTreatment && gstTreatment !== 'all') {
      filter['taxAndAddressDetails.gstTreatment'] = gstTreatment;
    }

    if (startDate || endDate) {
      filter.submittedAt = {};
      if (startDate) filter.submittedAt.$gte = new Date(startDate);
      if (endDate) filter.submittedAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
    }

    if (search && search.trim().length > 0) {
      const q = search.trim();
      const regex = new RegExp(q, 'i');
      filter.$or = [
        { referenceId: regex },
        { 'customerDetails.businessLegalName': regex },
        { 'customerDetails.pan': regex },
        { 'contactDetails.contactPerson': regex },
        { 'contactDetails.email': regex },
        { 'contactDetails.phone': regex }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    // Fetch only needed fields for the table
    const projection = {
      referenceId: 1,
      customerDetails: 1,
      'taxAndAddressDetails.gstTreatment': 1,
      'taxAndAddressDetails.gstin': 1,
      'taxAndAddressDetails.currency': 1,
      contactDetails: 1,
      status: 1,
      submittedAt: 1
    };

    const [submissions, totalRecords] = await Promise.all([
      Onboarding.find(filter, projection)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Onboarding.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalRecords / limit) || 1;

    res.json({
      success: true,
      data: submissions,
      pagination: {
        currentPage: page,
        limit,
        totalRecords,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Staff Protected: Retrieve Single Client Full Details
 * GET /api/onboarding/:id OR GET /api/clients/:id
 */
export const getSubmissionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let submission;

    if (id.startsWith('CL-')) {
      submission = await Onboarding.findOne({ referenceId: id })
        .populate('reviewedBy', 'fullName email')
        .lean();
    } else {
      submission = await Onboarding.findById(id)
        .populate('reviewedBy', 'fullName email')
        .lean();
    }

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Client onboarding submission not found'
      });
    }

    res.json({
      success: true,
      data: submission
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Staff Protected: Update status & review notes
 * PATCH /api/onboarding/:id/status OR PATCH /api/clients/:id/status
 */
export const updateSubmissionStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reviewNotes } = req.body;

    const updateFields = { status };
    if (reviewNotes !== undefined) {
      updateFields.reviewNotes = reviewNotes;
    }
    if (req.user) {
      updateFields.reviewedBy = req.user._id;
    }

    const updated = await Onboarding.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).populate('reviewedBy', 'fullName email');

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Client onboarding submission not found'
      });
    }

    res.json({
      success: true,
      message: `Submission status successfully updated to '${status}'`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};
