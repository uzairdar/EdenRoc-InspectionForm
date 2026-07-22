import { yesNoOptions, materialManufacturers, manufacturerConfigs } from '../formConfig'

export const initialForm = {
  customerName: '',
  tenantName: '',
  customerMobile: '',
  tenantMobile: '',
  email: '',
  address: '',
  jobNumber: '',
  job_uuid: '',
  date: '',
  staffName: '',
  jobStatus: 'Quote',
  doorType: '',
  doorBrand: '',
  doorStyle: '',
  doorColour: '',
  panelSize: '',
  radSizeTotal: '',
  bottom: '',
  firstUp: '',
  second: '',
  third: '',
  fourth: '',
  topPanel: '',
  windowStyle: '',
  centreLock: '',
  motorBrand: '',
  motorCondition: '',
  pelmet: '',
  jambs: '',
  covers: '',
  powerPointGarage: '',
  backClear: '',
  recess: '',
  accessProperty: '',
  noOfStruts: '',
  taper: '',
  vilo: '',
  windowNotes: '',
  flashingNotes: '',
  openingWidth: '',
  openingHeight: '',
  leftSideroom: '',
  rightSideroom: '',
  headroom: '',
  heightLHS: '',
  heightRHS: '',
  lhsMidFtd: '',
  rhsMidFtd: '',
  lhsDth: '',
  lhsMidDth: '',
  centreDth: '',
  rhsMidDth: '',
  rhsDth: '',
  measurementSketch: '',
  finalDoorSize: '',
  depositPaid: 'No',
  customerConfirmed: 'No',
  manufacturer: '',
  windows: '',
  installerNotes: '',
  lightsMoved: 'No',
  chainDrive: 'No',
  customerReviewed: false,
  customerSignature: '',
}

export const customerFields = [
  { name: 'customerName', label: 'Customer Name' },
  { name: 'customerMobile', label: 'Customer Mobile', type: 'number', placeholder: 'e.g. 0412 345 678' },
  { name: 'email', label: 'Email', type: 'email', placeholder: 'contact@company.com' },
  { name: 'address', label: 'Address', type: 'input', rows: 3 },
]

export const jobFields = [
  { name: 'jobNumber', label: 'Job Number' },
  { name: 'date', label: 'Date', type: 'date' },
  { name: 'staffName', label: 'Staff Name' },
]

export const damageFields = [
  { name: 'doorType', label: 'Door Type' },
  { name: 'doorBrand', label: 'Door Brand' },
  { name: 'doorStyle', label: 'Door Style' },
  { name: 'doorColour', label: 'Door Colour' },
  { name: 'panelSize', label: 'Panel Size' },
  { name: 'radSizeTotal', label: 'Radius Size Total' },
]

export const taperFields = [
  { name: 'bottom', label: 'Bottom (mm)', type: 'number' },
  { name: 'firstUp', label: '1st Up (mm)', type: 'number' },
  { name: 'second', label: '2nd (mm)', type: 'number' },
  { name: 'third', label: '3rd (mm)', type: 'number' },
  { name: 'fourth', label: '4th (mm)', type: 'number' },
  { name: 'topPanel', label: 'Top Panel' },
]

export const damageNotesFields = [
  { name: 'windowStyle', label: 'Window Style' },
  { name: 'centreLock', label: 'Centre Lock' },
  { name: 'motorBrand', label: 'Motor Brand' },
  { name: 'motorCondition', label: 'Motor Condition' },
  { name: 'pelmet', label: 'Pelmet' },
  { name: 'jambs', label: 'Jambs' },
  { name: 'covers', label: 'Covers' },
  { name: 'powerPointGarage', label: 'P/Point in Garage' },
  { name: 'backClear', label: '3/2 Back Clear' },
  { name: 'recess', label: 'Recess' },
  { name: 'accessProperty', label: 'Access Property' },
  { name: 'noOfStruts', label: 'No. of Struts', type: 'number' },
  {
    name: 'taper',
    label: 'Taper (mm)',
    type: 'select',
    options: ['Left', 'Right'],
  },
  { name: 'vilo', label: 'Vilo (mm)', type: 'number' },
]

export const openingFields = [
  { name: 'openingWidth', label: 'Opening Width', type: 'number', hint: 'wall to wall' },
  { name: 'openingHeight', label: 'Opening Height', type: 'number', hint: 'floor to top of opening' },
]

export const clearanceFields = [
  { name: 'leftSideroom', label: 'Left Sideroom', type: 'number', hint: 'wall to track edge' },
  { name: 'rightSideroom', label: 'Right Sideroom', type: 'number', hint: 'track edge to wall' },
  { name: 'headroom', label: 'Headroom', type: 'number', hint: 'top of opening to ceiling' },
]

export const heightSurveyFields = [
  { name: 'heightLHS', label: 'Height LHS', type: 'number', hint: 'measured left-side height' },
  { name: 'heightRHS', label: 'Height RHS', type: 'number', hint: 'measured right-side height' },
]

export const tableFields = [
  { name: 'lhsFtd', label: 'LHS FTD', type: 'number' },
  { name: 'lhsMidFtd', label: 'LHS-MID FTD', type: 'number' },
  { name: 'centreFtd', label: 'Centre FTD', type: 'number' },
  { name: 'rhsMidFtd', label: 'RHS-MID FTD', type: 'number' },
  { name: 'rhsFtd', label: 'RHS FTD', type: 'number' },
  { name: 'lhsDth', label: 'LHS DTH', type: 'number' },
  { name: 'lhsMidDth', label: 'LHS-MID DTH', type: 'number' },
  { name: 'centreDth', label: 'Centre DTH', type: 'number' },
  { name: 'rhsMidDth', label: 'RHS-MID DTH', type: 'number' },
  { name: 'rhsDth', label: 'RHS DTH', type: 'number' },
]

export const materialFields = [
  { name: 'depositPaid', label: 'Deposit Paid', type: 'select', options: yesNoOptions },
  { name: 'customerConfirmed', label: 'Customer Confirmed', type: 'select', options: yesNoOptions },
  { name: 'manufacturer', label: 'Door Type / Manufacturer', type: 'select', options: materialManufacturers },
  { name: 'finalDoorSize', label: 'Final Door Size' },
]

export const g4Fields = [
  { name: 'lightsMoved', label: 'Lights moved', type: 'select', options: yesNoOptions },
  { name: 'chainDrive', label: 'Chain drive', type: 'select', options: yesNoOptions },
]

export { manufacturerConfigs }
