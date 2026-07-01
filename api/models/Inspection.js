import mongoose from 'mongoose'

const inspectionSchema = new mongoose.Schema(
  {
    // Customer Details
    customerName: String,
    tenantName: String,
    customerMobile: String,
    tenantMobile: String,
    email: String,
    address: String,

    // Job Details
    jobNumber: String,
    job_uuid: String,
    versionGroupId: {
      type: String,
      index: true,
    },
    versionNumber: {
      type: Number,
      default: 1,
    },
    previousVersionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inspection',
      default: null,
    },
    isCurrent: {
      type: Boolean,
      default: true,
      index: true,
    },
    date: Date,
    staffName: String,
    jobStatus: {
      type: String,
      enum: ['Quote', 'Work Order', 'Completed', 'Unsuccussfull'],  
      default: 'Quote',
    },

    // Damage Details
    doorType: String,
    doorBrand: String,
    doorStyle: String,
    doorColour: String,
    panelSize: String,
    radSizeTotal: String,

    // Tapper Fields
    bottom: Number,
    firstUp: Number,
    second: Number,
    third: Number,
    topPanel: String,

    // Additional Damage Details
    windowStyle: String,
    centreLock: String,
    motorBrand: String,
    motorCondition: String,
    pelmet: String,
    jambs: String,
    covers: String,
    powerPointGarage: String,
    backClear: String,
    recess: String,
    accessProperty: String,
    taper: String, // 'left' or 'right'
    vilo: Number,

    // Measurement Details
    openingWidth: Number,
    openingHeight: Number,

    // Clearance Details
    leftSideroom: Number,
    rightSideroom: Number,
    headroom: Number,

    // Height Survey
    heightLHS: Number,
    heightRHS: Number,

    // Table Fields (FTD/DTC measurements)
    lhsFtd: Number,
    lhsDth: Number,
    centreFtd: Number,
    centreDth: Number,
    rhsFtd: Number,
    rhsDth: Number,

    // Material Details
    depositPaid: {
      type: String,
      enum: ['Yes', 'No'],
      default: 'No',
    },
    customerConfirmed: {
      type: String,
      enum: ['Yes', 'No'],
      default: 'No',
    },
    manufacturer: String,
    windows: String,
    installerNotes: String,
    lightsMoved: {
      type: String,
      enum: ['Yes', 'No'],
      default: 'No',
    },
    chainDrive: {
      type: String,
      enum: ['Yes', 'No'],
      default: 'No',
    },

    // Additional notes
    windowNotes: String,
    flashingNotes: String,

    // Manufacturer specific details (flexible schema)
    manufacturerDetails: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
)

const Inspection = mongoose.model('Inspection', inspectionSchema)

export default Inspection
